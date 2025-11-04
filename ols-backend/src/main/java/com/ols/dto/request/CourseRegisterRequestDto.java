package com.ols.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CourseRegisterRequestDto {

    private String courseName;
    private String description;
    private Long price;
    private List<String> tags;

}
