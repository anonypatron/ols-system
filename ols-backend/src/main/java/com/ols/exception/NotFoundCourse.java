package com.ols.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundCourse extends RuntimeException {

    public NotFoundCourse(String message) {
        super(message);
    }

    public NotFoundCourse() {
        super("User not found");
    }

}
