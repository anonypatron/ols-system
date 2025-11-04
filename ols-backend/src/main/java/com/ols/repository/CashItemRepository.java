package com.ols.repository;

import com.ols.entity.CashItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CashItemRepository extends JpaRepository<CashItem, Long> {
    Optional<CashItem> findByImpUid(String impUid);
}
