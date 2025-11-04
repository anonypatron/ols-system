package com.ols.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundUsers extends RuntimeException {

    public NotFoundUsers() {
        super("User not found");
    }

    public NotFoundUsers(String message) {
        super(message);
    }

}
