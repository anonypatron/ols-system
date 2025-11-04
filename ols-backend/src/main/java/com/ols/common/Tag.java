package com.ols.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Tag {

    QUALIFICATIONS("자격증"),
    OFFICE("사무"),
    LIFESTYLE("라이프스타일"),
    DEVELOPMENT("개발"),
    FINANCE_AND_ACCOUNTING("재무 및 회계"),
    IT_AND_SOFTWARE("IT 및 소프트웨어"),
    DESIGN("디자인"),
    MARKETING("마케팅"),
    SCIENCE("과학"),
    HISTORY("역사"),
    MEDIA("사진및영상"),
    SELF_DEVELOPMENT("자기 계발"),
    BUSINESS("비즈니스"),
    MUSIC("음악"),
    OTHERS("기타");

    private final String displayName;

    /**
     * 한글로 태그를 찾아 영문으로 데이터베이스 저장
     * @param displayName
     * @return tag
     */
    public static Tag fromDisplayName(String displayName) {
        for (Tag tag : Tag.values()) {
            if (tag.getDisplayName().equals(displayName)) {
                return tag;
            }
        }
        return null;
    }

}
