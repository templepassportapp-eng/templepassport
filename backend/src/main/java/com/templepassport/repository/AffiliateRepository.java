package com.templepassport.repository;

import com.templepassport.model.Affiliate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AffiliateRepository extends JpaRepository<Affiliate, UUID> {
    List<Affiliate> findByEnabledTrue();
    List<Affiliate> findByType(String type);
}
