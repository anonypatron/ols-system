'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from "react";
import { Course } from '../../types/course';
import { Tag } from '../../types/tag';
import axiosInstance from '../lib/axiosInstance';
import { dateFormatting } from '../../utils/dateUtils';

function SearchPage() {
    const searchParams = useSearchParams();
    const englishTags = searchParams.getAll('q');

    const [TagList, setTagList] = useState<Array<Tag>>([]);
    const [courseList, setCourseList] = useState<Array<Course>>([]);
    
    useEffect(() => {
        const fetchAllTags = async () => {
            try {
                const res = await axiosInstance.get("/courses/tags");
                const tags: Array<Tag> = res.data;
                setTagList(tags);
            } catch(err: any) {
                console.log('fetch tags error => ' + err);
            }
        };

        const fetchResults = async () => {
            try {
                const query = englishTags.join(',');
                const res = await axiosInstance.get<Course[]>(`/courses/search?q=${query}`);
                setCourseList(res.data);
                // console.log(courseList);
            } catch(err: any) {
                console.log('searching error => ' + err);
            }
        };

        fetchAllTags();
        fetchResults();
    }, [searchParams]);

    const displayedTags = useMemo(() => {
        return englishTags.map(englishTag => {
            const tagObj = TagList.find(tag => tag.name === englishTag);
            return tagObj ? tagObj.displayName : englishTag;
        });
    }, [courseList]);

    const handleOpenReviewModal = (courseId: number) => {
        
    };

    if (courseList.length === 0) {
        return (
            <div>
                <div>
                    <h1>다음 태그에 대한 검색 결과: {displayedTags.join(', ')}</h1>
                </div>
                <br/>
                <hr/>
                <br/>
                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                {/* <th>과목 번호</th> */}
                                <th></th>
                                <th>과목 담당</th>
                                <th>과목 이름</th>
                                <th>과목 설명</th>
                                <th>평점</th>
                                <th>가격</th>
                                <th>태그</th>
                                <th>업데이트 날짜</th>
                                <th>리뷰</th>
                            </tr>
                        </thead>
                    </table>
                    <h3 style={{ textAlign: 'center'}}>해당되는 강의가 없습니다...</h3>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div>
                <h1>다음 태그에 대한 검색 결과: {displayedTags.join(', ')}</h1>
            </div>
            <br/>
            <hr/>
            <br/>
            <div className="table-wrapper">
                <table className="modern-table">
                    <thead>
                        <tr>
                            {/* <th>과목 번호</th> */}
                            <th></th>
                            <th>과목 담당</th>
                            <th>과목 이름</th>
                            <th>과목 요약</th>
                            <th>평점</th>
                            <th>가격</th>
                            <th>태그</th>
                            <th>업데이트 날짜</th>
                            <th>리뷰</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseList.map((item, index) => (
                            <tr key={ index }>
                                {/* <td>{ index + 1 }</td> */}
                                <td><img src={ `https://localhost/` + item.imagePath } className='item-image'/></td>
                                <td>{ item.teacherName }</td>
                                <td>{ item.courseName }</td>
                                <td>{ item.description }</td>
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
                                <td>{ dateFormatting(item.updatedAt) }</td>
                                <td><button className="btn-base btn-secondary" onClick={ () => { handleOpenReviewModal(item.courseId) } }>리뷰 보기</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SearchPage;