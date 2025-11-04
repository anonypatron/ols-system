package com.ols;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO) // page객체를 json으로 직렬화할 때 발생하는 경고 무시
public class SpringStarterMain {
    public static void main(String[] args) {
        SpringApplication.run(SpringStarterMain.class, args);
    }
}
