package com.ols.service;

import com.ols.common.VideoStatus;
import com.ols.config.NginxConfigProperties;
import com.ols.dto.request.VideoUploadRequestDto;
import com.ols.dto.response.VideoDetailResponseDto;
import com.ols.dto.response.VideoOverviewResponseDto;
import com.ols.entity.Video;
import com.ols.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@RequiredArgsConstructor
@Service
public class VideoService {

    @Value("${video.upload.base-dir}")
    private String baseUploadDir;

    @Value("${video.hls.output-dir}")
    private String hlsOutputDir;

    private final VideoTransactionService videoTransactionService;
    private final NginxConfigProperties nginxConfigProperties;
    private final VideoRepository videoRepository;

    @Transactional
    public void deleteAll(ArrayList<Long> videoIds) {
        for (Long videoId : videoIds) {
            Optional<Video> _video = videoRepository.findById(videoId);
            if (_video.isPresent()) {
                Video video = _video.get();

                // 스토리지에서 파일 삭제
                try {
                    String filePath = video.getFilePath();
                    if (filePath != null && !filePath.isEmpty()) {
                        // "courseId/videoBaseName" 만 추출
                        String videoBaseRelativePath = filePath.substring(0, filePath.lastIndexOf('/'));
                        Path videoRootDirectory = Paths.get(hlsOutputDir, videoBaseRelativePath);

                        if (Files.exists(videoRootDirectory) && Files.isDirectory(videoRootDirectory)) {
                            Files.walk(videoRootDirectory)
                                    .sorted(Comparator.reverseOrder())
                                    .forEach((path) -> {
                                        try {
                                            Files.delete(path);
                                            System.out.println("삭제된 파일/폴더: " + path);
                                        } catch (IOException e) {
                                            System.out.println("파일/폴더 삭제 실패: " + path);
                                        }
                                    });
                            System.out.println("비디오 디렉토리 삭제 성공: " + videoRootDirectory);
                        }
                        else {
                            System.out.println("디렉토리가 존재하지 않습니다: " + videoRootDirectory);
                        }
                    }
                    else {
                        System.out.println(videoId + "번의 비디오 경로가 존재하지 않습니다: ");
                    }
                } catch (IOException e) {
                    System.out.println("IOException");
                }

                videoRepository.deleteById(videoId);
            }
            else {
                System.out.println("Video with id: " + videoId + " not found");
            }

        }
    }

    @Transactional(readOnly = true)
    public List<VideoOverviewResponseDto> findVideoListByCourseId(Long courseId) {
        List<Video> videos = videoRepository.findByCourseId(courseId);

        return videos.stream()
                .map(video -> VideoOverviewResponseDto.fromEntity(
                        video, nginxConfigProperties.getThumbnail().getBaseUrl()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public VideoDetailResponseDto getVideoById(Long videoId) {
        Optional<Video> _video = videoRepository.findById(videoId);

        if (_video.isPresent()) {
            Video video = _video.get();
            return VideoDetailResponseDto.fromEntity(video,
                    nginxConfigProperties.getHls().getBaseUrl(),
                    nginxConfigProperties.getThumbnail().getBaseUrl()
            );
        }
        return null;
    }

    @Transactional
    public void processVideoForHLS(VideoUploadRequestDto dto) {
        MultipartFile file = dto.getFile();
        Long courseId = dto.getCourseId();

        Video newVideo = Video.builder()
                .videoTitle(dto.getVideoTitle())
                .description(dto.getDescription())
                .course(videoTransactionService.getCourseById(courseId))
                .videoStatus(VideoStatus.PROCESSING)
                .build();

        Video savedVideo = videoRepository.save(newVideo);

        Path tempDir = Paths.get(baseUploadDir, "temp");

        try {
            Files.createDirectories(tempDir);
        } catch (IOException e) {
            System.err.println("임시 파일 디렉토리 생성 실패: " + tempDir + " - " + e.getMessage());
            throw new RuntimeException("Failed to create directory", e);
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFileName = UUID.randomUUID() + "_" + System.currentTimeMillis() + fileExtension;
        Path tempFilePath = tempDir.resolve(uniqueFileName);

        try {
            file.transferTo(tempFilePath.toFile());
        } catch (IOException e) {
            System.err.println("임시 파일 저장 실패: " + tempFilePath + " - " + e.getMessage());
            return;
        }

        CompletableFuture.runAsync(() -> {
            Path hlsOutputRootPath;
            try {
                String videoBaseName = UUID.randomUUID().toString();
                hlsOutputRootPath = Paths.get(hlsOutputDir, String.valueOf(courseId), videoBaseName);
                Files.createDirectories(hlsOutputRootPath);

                List<String> command = getCommand(tempFilePath, hlsOutputRootPath);

                System.out.println("Executing FFmpeg command: " + String.join(" ", command));

                ProcessBuilder processBuilder = new ProcessBuilder(command);
                processBuilder.redirectErrorStream(true);

                Process process = processBuilder.start();

                try (BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        System.out.println("FFmpeg Output: " + line);
                    }
                }

                int exitCode = process.waitFor();
                if (exitCode == 0) {
                    System.out.println("FFmpeg HLS 변환 성공: " + tempFilePath.getFileName());

                    try {
                        Path thumbnailOutputDirectory = Paths.get(hlsOutputDir, String.valueOf(courseId), videoBaseName);
                        Files.createDirectories(thumbnailOutputDirectory); // 썸네일 저장할 디렉토리 생성 (HLS와 동일 경로에 저장)
                        String thumbnailFileName = "thumbnail.jpg"; // 썸네일 파일명
                        Path thumbnailPath = thumbnailOutputDirectory.resolve(thumbnailFileName);

                        List<String> thumbnailCommand = getThumbnailCommand(tempFilePath, thumbnailPath);

                        System.out.println("Executing FFmpeg thumbnail command: " + String.join(" ", thumbnailCommand));

                        ProcessBuilder thumbnailProcessBuilder = new ProcessBuilder(thumbnailCommand);
                        thumbnailProcessBuilder.redirectErrorStream(true); // 에러 스트림도 출력
                        Process thumbnailProcess = thumbnailProcessBuilder.start();

                        try (BufferedReader reader = new BufferedReader(new InputStreamReader(thumbnailProcess.getInputStream()))) {
                            String line;
                            while ((line = reader.readLine()) != null) {
                                System.out.println("FFmpeg Thumbnail Output: " + line);
                            }
                        }

                        int thumbnailExitCode = thumbnailProcess.waitFor();
                        if (thumbnailExitCode == 0) {
                            System.out.println("썸네일 생성 성공: " + thumbnailPath.getFileName());
                            // DB에 썸네일 경로 저장 (VideoTransactionService로 전달)
                            String hlsRelativePath = courseId + "/" + videoBaseName + "/master.m3u8";
                            String thumbnailRelativePath = courseId + "/" + videoBaseName + "/" + thumbnailFileName;
//                            videoTransactionService.saveVideoMetadata(courseId, dto.getVideoTitle(), dto.getDescription(), videoBaseName, thumbnailRelativePath);
                            videoTransactionService.updateVideoStatusAndPaths(
                                    savedVideo.getId(),
                                    hlsRelativePath,
                                    thumbnailRelativePath,
                                    VideoStatus.READY
                            );
                        } else {
                            System.err.println("썸네일 생성 실패 (종료 코드: " + thumbnailExitCode + "): " + tempFilePath.getFileName());
                            videoTransactionService.updateVideoStatusAndPaths(
                                    savedVideo.getId(),
                                    null, // 썸네일 실패 시 HLS 경로는 그대로 둘 수 있음
                                    null,
                                    VideoStatus.FAILED
                            );
                        }
                    } catch (Exception e) {
                        System.err.println("썸네일 생성 중 예외 발생: " + e.getMessage());
                        videoTransactionService.updateVideoStatusAndPaths(
                                savedVideo.getId(),
                                null, // 실패했으므로 경로 없음
                                null,
                                VideoStatus.FAILED
                        );
                    }
                } else {
                    System.err.println("FFmpeg HLS 변환 실패 (종료 코드: " + exitCode + "): " + tempFilePath.getFileName());
                    videoTransactionService.updateVideoStatusAndPaths(
                            savedVideo.getId(),
                            null, // 실패했으므로 경로 없음
                            null,
                            VideoStatus.FAILED
                    );
                }
            } catch (Exception e) {
                System.err.println("HLS 변환 중 예외 발생: " + e.getMessage());
                videoTransactionService.updateVideoStatusAndPaths(
                        savedVideo.getId(),
                        null, // 실패했으므로 경로 없음
                        null,
                        VideoStatus.FAILED
                );
            } finally {
                try {
                    Files.deleteIfExists(tempFilePath);
                    System.out.println("임시 파일 삭제: " + tempFilePath.getFileName());
                } catch (IOException e) {
                    System.err.println("임시 파일 삭제 실패: " + tempFilePath.getFileName() + " - " + e.getMessage());
                }
            }
        });
    }

    private static List<String> getThumbnailCommand(Path tempFilePath, Path thumbnailPath) {
        List<String> thumbnailCommand = new ArrayList<>();
        thumbnailCommand.add("ffmpeg");
        thumbnailCommand.add("-i");
        thumbnailCommand.add(tempFilePath.toString()); // 원본 임시 파일 사용
        thumbnailCommand.add("-ss");
        thumbnailCommand.add("00:00:01"); // 비디오 시작 1초 지점에서 캡처
        thumbnailCommand.add("-vframes");
        thumbnailCommand.add("1"); // 1프레임만 캡처
        thumbnailCommand.add("-q:v");
        thumbnailCommand.add("2"); // 이미지 품질 (1-5, 1이 최고)
        thumbnailCommand.add(thumbnailPath.toString()); // 저장할 썸네일 경로
        return thumbnailCommand;
    }

    private List<String> getCommand(Path tempFilePath, Path hlsOutputRootPath) {
        List<String> command = new ArrayList<>();
        command.add("ffmpeg");
        command.add("-i"); command.add(tempFilePath.toString());
        command.add("-c:v"); command.add("libx264");
        command.add("-preset"); command.add("veryfast");
        command.add("-crf"); command.add("23");
        command.add("-c:a"); command.add("aac");
        command.add("-b:a"); command.add("128k");
        command.add("-ac"); command.add("2");
        command.add("-f"); command.add("hls");
        command.add("-hls_time"); command.add("10");
        command.add("-hls_playlist_type"); command.add("vod");
        command.add("-hls_segment_filename"); command.add(hlsOutputRootPath.resolve("segment_%03d.ts").toString());
        command.add(hlsOutputRootPath.resolve("master.m3u8").toString());
        return command;
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex);
    }

}
