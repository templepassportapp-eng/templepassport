package com.templepassport.repository;

import com.templepassport.model.JapaMantraStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JapaMantraStatRepository extends JpaRepository<JapaMantraStat, UUID> {

    List<JapaMantraStat> findByUserIdOrderByTotalJapaDesc(UUID userId);

    Optional<JapaMantraStat> findByUserIdAndMantraId(UUID userId, String mantraId);

    @Query("SELECT COALESCE(SUM(j.totalJapa), 0) FROM JapaMantraStat j WHERE j.user.id = :userId")
    long sumJapaByUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(j.totalMalas), 0) FROM JapaMantraStat j WHERE j.user.id = :userId")
    long sumMalasByUserId(@Param("userId") UUID userId);
}
