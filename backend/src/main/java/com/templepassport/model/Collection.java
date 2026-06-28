package com.templepassport.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "collections")
public class Collection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String type;

    @Column(name = "total_count", nullable = false)
    private int totalCount;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "collection_temples",
        joinColumns = @JoinColumn(name = "collection_id"),
        inverseJoinColumns = @JoinColumn(name = "temple_id")
    )
    private List<Temple> temples = new ArrayList<>();

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getType() { return type; }
    public int getTotalCount() { return totalCount; }
    public List<Temple> getTemples() { return temples; }
}
