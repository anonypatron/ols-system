package com.ols.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CashItemPrepareResponseDto {

    private String titleName;
    private String merchantUid;
    private Long totalAmount;
    private Long totalQuantity;

    @Builder
    public CashItemPrepareResponseDto(String titleName, String merchantUid, Long totalAmount, Long totalQuantity) {
        this.titleName = titleName;
        this.merchantUid = merchantUid;
        this.totalAmount = totalAmount;
        this.totalQuantity = totalQuantity;
    }

}
