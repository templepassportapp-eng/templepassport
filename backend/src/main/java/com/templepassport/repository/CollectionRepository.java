package com.templepassport.repository;

import com.templepassport.model.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    @Query("SELECT DISTINCT c FROM Collection c LEFT JOIN FETCH c.temples")
    List<Collection> findAllWithTemples();
}
