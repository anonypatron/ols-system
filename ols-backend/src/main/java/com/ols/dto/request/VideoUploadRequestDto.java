package com.ols.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class VideoUploadRequestDto {

    private MultipartFile file;
    private Long courseId;
    private String videoTitle;
    private String description;

}
