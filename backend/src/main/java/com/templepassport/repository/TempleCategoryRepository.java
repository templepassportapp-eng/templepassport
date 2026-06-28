package com.templepassport.repository;

import com.templepassport.model.TempleCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TempleCategoryRepository extends JpaRepository<TempleCategory, String> {
}
