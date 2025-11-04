package com.ols.dto.request;

import lombok.Getter;

import java.util.List;

@Getter
public class CashItemVerifyRequestDto {

    private String impUid;
    private String merchantUid;
    private List<Long> courseIds;

}
