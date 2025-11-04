'use client'

import { Course } from '../../../../types/course';
import { dateFormatting } from '../../../../utils/dateUtils';

interface PendingListProps {
    pendingCourseList: Array<Course> | null;
    onUpdateStatus: (id: number, status: boolean) => Promise<void>;
}

function PendingList({ pendingCourseList, onUpdateStatus }: PendingListProps) {
    if (!pendingCourseList || pendingCourseList.length == 0) {
        return (
            <div>
                <div>미결된 강의가 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="header-container">
                <p className="page-header-banner">미정인 강의 목록</p>
            </div>
            <br/>
            <div className="table-wrapper">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>과목 번호</th>
                            <th>과목 담당</th>
                            <th>과목 이름</th>
                            <th>과목 요약</th>
                            <th>상태</th>
                            <th>평점</th>
                            <th>가격</th>
                            <th>태그</th>
                            <th>만들어진 날짜</th>
                            <th>수정된 날짜</th>
                            <th>승인</th>
                            <th>거절</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingCourseList.map((item, index) => (
                            <tr key={ index }>
                                <td>{ index + 1 }</td>
                                <td>{ item.teacherName }</td>
                                <td>{ item.courseName }</td>
                                <td>{ item.description }</td>
                                <td>{ item.courseStatus }</td>
                                <td>{ item.rating + ' (' + item.reviewCount + ')' }</td>
                                <td>{ item.price }</td>
                                <td>
                                    {item.tags && item.tags.length > 0 ? (
                                        <div className='tagContainer'> {/* CSS 클래스 적용 */}
                                            {item.tags.map((tag, tagIndex) => (
                                                <span 
                                                    key={tagIndex} // 태그 문자열이 고유하다면 key={tag} 사용도 가능
                                                    className='tagBadge' // CSS 클래스 적용
                                                >
                                                    {tag.displayName}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        '없음'
                                    )}
                                </td>
                                <td>{ dateFormatting(item.createdAt) }</td>
                                <td>{ dateFormatting(item.updatedAt) }</td>
                                <td><button className="btn-base btn-primary" onClick={ () => { onUpdateStatus(item.courseId, true) } }>승인</button></td>
                                <td><button className="btn-base btn-danger" onClick={ () => { onUpdateStatus(item.courseId, false) } }>거절</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PendingList;