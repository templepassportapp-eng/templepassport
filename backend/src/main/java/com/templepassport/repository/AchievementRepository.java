package com.templepassport.repository;

import com.templepassport.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {
    Optional<Achievement> findByCode(String code);
}
