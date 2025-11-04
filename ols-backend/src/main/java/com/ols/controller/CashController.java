package com.ols.controller;

import com.ols.dto.request.PrepareCashItemListRequestDto;
import com.ols.dto.request.CashItemRefundRequestDto;
import com.ols.dto.request.CashItemVerifyRequestDto;
import com.ols.dto.response.CashItemPrepareResponseDto;
import com.ols.service.PortOneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/cash")
public class CashController {

    private final PortOneService portOneService;

    @PostMapping("/prepare")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CashItemPrepareResponseDto> preparePayment(
            @AuthenticationPrincipal Long userId,
            @RequestBody PrepareCashItemListRequestDto dto
    ) {
        return ResponseEntity.ok(portOneService.preparePayment(userId, dto.getCourseIds()));
    }

    @PostMapping("/after")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> afterPayment(
            @AuthenticationPrincipal Long userId,
            @RequestBody CashItemVerifyRequestDto dto
    ) {
        portOneService.afterSuccessPayments(userId, dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refund")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> refundPayment(
            @AuthenticationPrincipal Long userId,
            @RequestBody CashItemRefundRequestDto dto
    ) {
        portOneService.refundItems(userId, dto);
        return ResponseEntity.ok().build();
    }

}
