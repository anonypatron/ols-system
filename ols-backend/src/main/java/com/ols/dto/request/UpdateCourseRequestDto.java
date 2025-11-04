package com.ols.dto.request;

import com.ols.common.CourseStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCourseRequestDto {

    Long courseId;
    CourseStatus status;

}
