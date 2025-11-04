package com.ols.dto.response;

import com.ols.common.Tag;
import com.ols.entity.CourseTag;
import lombok.Getter;

@Getter
public class CourseTagResponseDto {

    private final String name;
    private final String displayName;

    public CourseTagResponseDto(Tag courseTag) {
        this.name = courseTag.name();
        this.displayName = courseTag.getDisplayName();
    }

    public static CourseTagResponseDto fromEntity(CourseTag courseTag) {
        return new CourseTagResponseDto(courseTag.getTag());
    }

}
