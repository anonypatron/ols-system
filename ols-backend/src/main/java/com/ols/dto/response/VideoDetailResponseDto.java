package com.ols.dto.response;

import com.ols.entity.Video;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoDetailResponseDto {

    private Long videoId;
    private String videoTitle;
    private String description;
    private String thumbnailPath;
    private String filePath;

    @Builder
    public VideoDetailResponseDto(Long videoId,
                                  String videoTitle,
                                  String description,
                                  String filePath,
                                  String thumbnailPath) {
        this.videoId = videoId;
        this.videoTitle = videoTitle;
        this.description = description;
        this.filePath = filePath;
        this.thumbnailPath = thumbnailPath;
    }

    public static VideoDetailResponseDto fromEntity(Video video, String nginxHlsBaseUrl, String nginxThumbnailBaseUrl) {
        return VideoDetailResponseDto.builder()
                .videoId(video.getId())
                .videoTitle(video.getVideoTitle())
                .description(video.getDescription())
                .filePath(nginxHlsBaseUrl + video.getFilePath())
                .thumbnailPath(nginxThumbnailBaseUrl + video.getThumbnailPath())
                .build();
    }

}
