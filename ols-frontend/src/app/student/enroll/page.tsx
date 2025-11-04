'use client';

import { useEffect, useState } from "react";
import { format, parseISO } from 'date-fns';
import axiosInstance from "../../lib/axiosInstance";
import { Course } from "../../../types/course";
import { useRouter } from "next/navigation";

function StudentEnrollmentPage() {
    const [courseList, setCourseList] = useState<Array<Course> | null>(null);
    const [currentList, setCurrentList] = useState<Array<Course> | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCourseList = async () => {
            try {
                const res = await axiosInstance.get("/courses/status?status=APPROVED");
                console.log(res.data);
                setCourseList(res.data);
            } catch(err: any) {
                console.log("fetch error: " + err);
            }
        }

        const fetchCurrentCourse = async () => {
            try {
                const res = await axiosInstance.get("/courses/me");
                setCurrentList(res.data);
            } catch(err: any) {
                console.log("fetchCourses error: " + err);
            }
        }

        fetchCourseList();
        fetchCurrentCourse();
    }, []);

    const addToCart = async (courseId: number) => {
        try {
            const res = await axiosInstance.post('/carts', {id: courseId});

            if (confirm('카트에 넣었습니다. 카트로 이동하시겠습니까?')) {
                router.push('/cart');
            }
        } catch(err: any) {
            if (err.response && err.response.status === 400) {
                alert('이미 있는 과목입니다.');
                return;
            }
            console.log('addToCart error => ' + err);
        }
    };

    const enroll = async (id: number) => {
        if (currentList != null && currentList.length != 0) {
            for (let i = 0; i < currentList.length; i++) {
                if (id == currentList[i].courseId) {
                    alert("이미 수강신청된 강의입니다.");
                    return;
                }
            }
        }
        
        try {
            const res = await axiosInstance.post("/courses/enroll", { courseId: id});

            if (res.status >= 400) {
                throw new Error("fetch error: enroll");
            }

            alert("수강신청 되었습니다.");
            router.push('/student/courses');
        } catch(error) {
            console.log("fetch error: " + error);
        }
    };

    const dateFormatting = (date: string): string => {
        let dateObject = parseISO(date);
        return format(dateObject, 'yyyy-MM-dd');
    }

    if (!courseList || courseList.length == 0) {
        return (
            <div>
                <div>현재 강의가 없습니다.</div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="header-container">
                <p className="page-header-banner">수강 신청 가능한 강의 목록</p>
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
                            {/* <th>상태</th> */}
                            <th>평점</th>
                            <th>가격</th>
                            <th>태그</th>
                            <th>만들어진 날짜</th>
                            <th>수정된 날짜</th>
                            <th>장바구니</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseList.map((item, index) => (
                            <tr key={ index }>
                                <td>{ index + 1 }</td>
                                <td>{ item.teacherName }</td>
                                <td>{ item.courseName }</td>
                                <td>{ item.description }</td>
                                {/* <td>{ item.courseStatus }</td> */}
                                <td>{ item.rating + ' (' + item.reviewCount + ')' }</td>
                                <td>{ item.price }</td>
                                <td>
                                    {item.tags && item.tags.length > 0 ? (
                                        <div className='tagContainer'>
                                            {item.tags.map((tag, tagIndex) => (
                                                <span 
                                                    key={tagIndex}
                                                    className='tagBadge'
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
                                <td><button className="btn-base btn-primary"onClick={ () => { addToCart(item.courseId) } }>담기</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentEnrollmentPage;