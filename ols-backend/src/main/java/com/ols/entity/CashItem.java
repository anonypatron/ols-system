package com.ols.entity;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Getter
@Setter
public class CashItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String impUid;

    @Column(nullable = false)
    private String merchantUid;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    private Users users;

    @Builder
    public CashItem(String impUid, String merchantUid, Users user, Long amount, String status) {
        this.impUid = impUid;
        this.merchantUid = merchantUid;
        this.users = user;
        this.amount = amount;
        this.status = status;
    }

}
