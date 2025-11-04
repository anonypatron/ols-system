package com.ols.dto.response;

import com.ols.entity.Video;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VideoOverviewResponseDto {

    private Long videoId;
    private String videoTitle;
    private String description;
    private String thumbnailPath;

    @Builder
    public VideoOverviewResponseDto(
            Long videoId,
            String videoTitle,
            String description,
            String thumbnailPath) {
        this.videoId = videoId;
        this.videoTitle = videoTitle;
        this.description = description;
        this.thumbnailPath = thumbnailPath;
    }

    public static VideoOverviewResponseDto fromEntity(Video video, String nginxThumbnailBaseUrl) {
        return VideoOverviewResponseDto.builder()
                .videoId(video.getId())
                .videoTitle(video.getVideoTitle())
                .description(video.getDescription())
                .thumbnailPath(nginxThumbnailBaseUrl + video.getThumbnailPath())
                .build();
    }

}
