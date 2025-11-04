package com.ols.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "nginx")
public class NginxConfigProperties {

    private Hls hls = new Hls();
    private Thumbnail thumbnail = new Thumbnail();

    @Getter
    @Setter
    public static class Hls {
        private String baseUrl;
    }

    @Getter
    @Setter
    public static class Thumbnail {
        private String baseUrl;
    }

}
