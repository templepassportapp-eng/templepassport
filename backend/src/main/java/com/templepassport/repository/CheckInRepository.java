package com.templepassport.repository;

import com.templepassport.model.CheckIn;
import com.templepassport.model.VerificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface CheckInRepository extends JpaRepository<CheckIn, UUID> {

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.temple JOIN FETCH c.user WHERE c.user.id = :uid ORDER BY c.visitDate DESC")
    List<CheckIn> findByUserIdWithTemple(@Param("uid") UUID userId);

    @Query("SELECT c FROM CheckIn c JOIN FETCH c.temple JOIN FETCH c.user WHERE c.user.id = :uid AND c.verificationType = :type ORDER BY c.visitDate DESC")
    List<CheckIn> findByUserIdAndTypeWithTemple(@Param("uid") UUID userId, @Param("type") VerificationType type);

    @Query("SELECT COUNT(DISTINCT c.temple.id) FROM CheckIn c WHERE c.user.id = :uid")
    long countDistinctTemplesByUserId(@Param("uid") UUID userId);

    @Query("SELECT COUNT(DISTINCT c.temple.state) FROM CheckIn c WHERE c.user.id = :uid")
    long countDistinctStatesByUserId(@Param("uid") UUID userId);

    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.user.id = :uid AND c.verificationType = :type")
    long countByUserIdAndType(@Param("uid") UUID userId, @Param("type") VerificationType type);

    @Query("SELECT DISTINCT c.temple.id FROM CheckIn c WHERE c.user.id = :uid")
    Set<UUID> findDistinctTempleIdsByUserId(@Param("uid") UUID userId);
}
