package com.example.projetofinanceiro.repository;

import com.example.projetofinanceiro.model.Asset;
import com.example.projetofinanceiro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByUser(User user);

    @Query("SELECT SUM(a.value) FROM Asset a WHERE a.user = :user")
    BigDecimal sumValueByUser(User user);
}
