package com.templepassport.repository;

import com.templepassport.model.Temple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TempleRepository extends JpaRepository<Temple, UUID> {

    @Query("""
        SELECT t FROM Temple t WHERE
            (:q        IS NULL OR LOWER(t.name)  LIKE LOWER(CONCAT('%',:q,'%'))
                               OR LOWER(t.city)  LIKE LOWER(CONCAT('%',:q,'%'))
                               OR LOWER(t.state) LIKE LOWER(CONCAT('%',:q,'%')))
        AND (:state    IS NULL OR LOWER(t.state)    = LOWER(:state))
        AND (:category IS NULL OR LOWER(t.category) = LOWER(:category))
        ORDER BY t.name
        """)
    List<Temple> search(@Param("q") String q,
                        @Param("state") String state,
                        @Param("category") String category);
}
