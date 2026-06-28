package com.templepassport.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "temple_category_definitions")
public class TempleCategory {

    @Id
    @Column(length = 64)
    private String key;

    @Column(nullable = false, length = 128)
    private String label;

    @Column(length = 16)
    private String color = "#6B1A2C";

    @Column(name = "is_custom", nullable = false)
    private boolean isCustom = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public boolean isCustom() { return isCustom; }
    public void setCustom(boolean custom) { isCustom = custom; }
    public Instant getCreatedAt() { return createdAt; }
}
