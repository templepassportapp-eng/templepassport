package com.templepassport.repository;

import com.templepassport.model.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, UUID> {
    List<UserAchievement> findByUser_Id(UUID userId);
    boolean existsByUser_IdAndAchievement_Code(UUID userId, String code);
}
