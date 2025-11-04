package com.ols.service;

import com.ols.dto.request.CashItemRefundRequestDto;
import com.ols.dto.request.CashItemVerifyRequestDto;
import com.ols.dto.response.CashItemPrepareResponseDto;
import com.ols.entity.CashItem;
import com.ols.entity.Course;
import com.ols.entity.Student;
import com.ols.entity.Users;
import com.ols.exception.NotFoundUsers;
import com.ols.repository.CashItemRepository;
import com.ols.repository.CourseRepository;
import com.ols.repository.StudentRepository;
import com.ols.repository.UsersRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.request.PrepareData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
@Service
public class PortOneService {

    private final RedisTemplate<String, String> redisTemplate;
    private final CashItemRepository cashItemRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final IamportClient iamportClient;

    private final CourseService courseService;
    private final CartService cartService;
    private final UsersRepository usersRepository;

    /*
        1. 사전 검증
            1-1. 프론트 단에서 사용자 결제버튼(상품 아이디 전달) -> 백단에서 주문번호, 금액 등을 포트원서버에 전달, 레디스에 저장(사후 검증)
            1-2. 프론트 단에서 포트원에게 결제 진행 -> 주문번호나 금액이 일치하지 않으면 결제x
        2. 사후 검증
            2-1. 백엔드에서 포트원서버의 결제 정보를 가지고 오기.
            2-2. 레디스에 저장해놓은 금액을 비교 -> 일치하지 않으면 결제 취소, 일치하면 결제 완료
     */

    // 사전 검증
    public CashItemPrepareResponseDto preparePayment(
            Long userId,
            List<Long> courseIds
    ) {
        // 사용자 확인
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));

        if (courseIds.isEmpty()) {
            throw new RuntimeException("courseIds is empty");
        }
        // 총액 개산
        String merchantUid = String.valueOf(UUID.randomUUID());
        List<Course> courses = courseRepository.findAllById(courseIds);

        String titleName;
        if (courses.size() > 1) { // 여러개면 대표 1개 + 개수 => ex) 프로그래밍 외 1개
            titleName = courses.getFirst().getCourseName() + " 외 " + (courses.size() - 1) + "건";
        }
        else {
            titleName = courses.getFirst().getCourseName();
        }
        long totalAmount = courses.stream()
                .mapToLong(Course::getPrice)
                .sum();
        long totalQuantity = courseIds.size();

        try {
            PrepareData prepareData = new PrepareData(merchantUid, BigDecimal.valueOf(totalAmount));
            iamportClient.postPrepare(prepareData);

            // 결제번호와 금액을 캐시형태로 저장
            // 레디스에 10분 뒤 삭제
            redisTemplate.opsForValue().set(merchantUid, String.valueOf(totalAmount), 10, TimeUnit.MINUTES);
        } catch (IOException | IamportResponseException e) {
            throw new RuntimeException("사전 검증 실패");
        }

        return CashItemPrepareResponseDto.builder()
                .titleName(titleName)
                .merchantUid(merchantUid) // 주문 번호
                .totalAmount(totalAmount) // 금액
                .totalQuantity(totalQuantity) // 양
                .build();
    }

    // 사후 검증
    @Transactional
    public void afterSuccessPayments(Long userId, CashItemVerifyRequestDto dto) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        if (user == null) {
            throw new NotFoundUsers("user not found");
        }
        Student student = studentRepository.findByUsers(user)
                .orElseThrow(() -> new NotFoundUsers("Student not found"));

        // impUid << 결제가 성공된 건에 대해서 포트원이 부여하는 고유 번호
        try {
            // 포트원 서버에서 결제 정보 조회
            IamportResponse<Payment> response = iamportClient.paymentByImpUid(dto.getImpUid());
            Payment iamportPayment = response.getResponse();

            // 결제 상태 확인
            if (!"paid".equals(iamportPayment.getStatus())) {
                throw new IllegalArgumentException("결제가 완료되지 않았습니다.");
            }

            // 결제 금액 확인(redis에 저장해놓은 결제 금액)
            long paidAmount = iamportPayment.getAmount().longValue();
            String redisKey = dto.getMerchantUid();
            String expectedAmountStr = redisTemplate.opsForValue().get(redisKey);

            if (expectedAmountStr == null) {
                throw new IllegalArgumentException("사전검증 정보가 만료되거나 없습니다.");
            }
            if (paidAmount != Long.parseLong(expectedAmountStr)) {
                throw new IllegalArgumentException("결제 금액 불일치 - 위변조 의심!");
            }

            // 결제 정보 등록
            cashItemRepository.save(CashItem.builder()
                            .impUid(dto.getImpUid())
                            .merchantUid(dto.getMerchantUid())
                            .user(user)
                            .amount(paidAmount)
                            .status(iamportPayment.getStatus())
                            .build());
            // 학생에게 강의 등록
            courseService.enrollCourse(student, dto.getCourseIds());
            cartService.deleteAll(userId, dto.getCourseIds());
        } catch(IOException | IamportResponseException e) {
            throw new RuntimeException("결제 검증 중 오류 발생");
        }
    }

    // 환불
    public void refundItems(Long userId, CashItemRefundRequestDto dto) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundUsers("user not found"));
        try {
            CancelData cancelData = new CancelData(dto.getImpUid(), true);
            cancelData.setReason(dto.getReason());
            IamportResponse<Payment> cancelResponse = iamportClient.cancelPaymentByImpUid(cancelData);

            if (!"cancelled".equals(cancelResponse.getResponse().getStatus())) {
                throw new IllegalArgumentException("결제 취소 실패");
            }

            CashItem cashItem = cashItemRepository.findByImpUid(dto.getImpUid())
                    .orElseThrow(() -> new EntityNotFoundException("없는 결제건입니다."));
            cashItem.setStatus("cancelled"); // 취소 상태로 변경
        } catch(IamportResponseException | IOException e) {
            throw new RuntimeException("결제 취소 중 오류 발생");
        }
    }

}
