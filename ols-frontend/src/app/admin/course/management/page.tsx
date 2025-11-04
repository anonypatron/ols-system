'use client'

import { useState, useEffect, useCallback } from 'react';
import { Course } from '../../../../types/course';
import PendingList from '../components/PendingList';
import ApprovedList from '../components/ApprovedList';
import axiosInstance from '../../../lib/axiosInstance';

function CourseManagementPage() {
    const [pendingCourseList, setPendingCourseList] = useState<Array<Course> | null>(null);
    const [approvedCourseList, setApprovedCourseList] = useState<Array<Course> | null>(null);

    const fetchAllCourseLists = useCallback(async () => {
        try {
            const pendingRes = await axiosInstance.get('/courses/status?status=PENDING');
            setPendingCourseList(pendingRes.data);

            const approvedRes = await axiosInstance.get('/courses/status?status=APPROVED');
            setApprovedCourseList(approvedRes.data);
        } catch(error) {
            console.log('Error => /admin/course/management: ' + error);
        }
    }, []);
    
    useEffect(() => {
        fetchAllCourseLists();
    }, [fetchAllCourseLists]);

    const updateCourseStatus = async (id: number, status: boolean) => {
        const body = {
            courseId: id,
            status: status ? "APPROVED" : "REJECTED",
        };
        
        try {
            const res = await axiosInstance.patch('/courses/status', body);
            fetchAllCourseLists();
        } catch(error) {
            console.log('error => /admin/course/management : ' + error);
        }
    };

    const deleteCourse = async (id: number) => {
        try {
            const res = await axiosInstance.delete(`/courses/${id}`);
            if (res.status >= 400) {
                throw new Error("delete error");
            }
            alert('삭제 완료!');
            fetchAllCourseLists();
        } catch(error) {
            console.log('error => /admin/course/management : ' + error);
        }
    };

    return (
        <div>
            <h1>강의 관리</h1>
            <PendingList
                pendingCourseList={ pendingCourseList }
                onUpdateStatus={ updateCourseStatus }/>
            <br/>
            <br/>
            <ApprovedList
                approvedCourseList={ approvedCourseList }
                onDeleteStatus={ deleteCourse }/>
        </div>
    )
}

export default CourseManagementPage;