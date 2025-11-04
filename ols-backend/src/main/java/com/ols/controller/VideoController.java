package com.ols.controller;

import com.ols.dto.request.VideoUploadRequestDto;
import com.ols.dto.response.VideoDetailResponseDto;
import com.ols.dto.response.VideoOverviewResponseDto;
import com.ols.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class VideoController {

    private final VideoService videoService;

    @GetMapping("/courses/{courseId}/videos")
    public ResponseEntity<List<VideoOverviewResponseDto>> getVideos(@PathVariable Long courseId) {
        return ResponseEntity.ok(videoService.findVideoListByCourseId(courseId));
    }

    @GetMapping("/videos/{videoId}")
    public ResponseEntity<VideoDetailResponseDto> getVideoDetail(@PathVariable Long videoId) {
        return ResponseEntity.ok(videoService.getVideoById(videoId));
    }

    @PostMapping("/videos/upload")
    public ResponseEntity<String> uploadVideo(VideoUploadRequestDto dto) {
        if (dto.getFile().getSize() == 0) {
            return new ResponseEntity<>("파일이 없습니다.", HttpStatus.BAD_REQUEST);
        }

        try {
            videoService.processVideoForHLS(dto);
            return new ResponseEntity<>("성공적으로 업로드 되었씁니다.", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("파일 변환 중 에러", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/videos/delete")
    public ResponseEntity<Void> deleteVideos(@RequestBody ArrayList<Long> videoIds) {
        videoService.deleteAll(videoIds);
        return ResponseEntity.ok().build();
    }

}
