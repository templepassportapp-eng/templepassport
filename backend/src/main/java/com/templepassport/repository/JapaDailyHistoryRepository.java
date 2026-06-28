package com.templepassport.repository;

import com.templepassport.model.JapaDailyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JapaDailyHistoryRepository extends JpaRepository<JapaDailyHistory, UUID> {

    Optional<JapaDailyHistory> findByUserIdAndJapaDate(UUID userId, LocalDate japaDate);

    @Query("SELECT h FROM JapaDailyHistory h WHERE h.user.id = :userId ORDER BY h.japaDate DESC")
    List<JapaDailyHistory> findByUserIdOrderByDateDesc(@Param("userId") UUID userId);

    @Query("SELECT h FROM JapaDailyHistory h WHERE h.user.id = :userId AND h.japaDate >= :from ORDER BY h.japaDate ASC")
    List<JapaDailyHistory> findByUserIdSince(@Param("userId") UUID userId, @Param("from") LocalDate from);
}
