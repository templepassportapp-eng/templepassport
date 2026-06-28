package com.templepassport.repository;

import com.templepassport.model.OtpSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface OtpSessionRepository extends JpaRepository<OtpSession, UUID> {

    Optional<OtpSession> findByPhoneAndCode(String phone, String code);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpSession o WHERE o.phone = :phone")
    void deleteByPhone(@Param("phone") String phone);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpSession o WHERE o.expiresAt < :now")
    void deleteExpired(@Param("now") LocalDateTime now);
}
