package com.ols.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewUploadRequestDto {

    private String title;
    private String content;
    private Double rating;

}
