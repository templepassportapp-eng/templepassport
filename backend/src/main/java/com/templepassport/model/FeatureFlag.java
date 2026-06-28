package com.templepassport.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "feature_flags")
public class FeatureFlag {

    @Id
    @Column(length = 64)
    private String key;

    @Column(nullable = false, length = 128)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(length = 32)
    private String category = "CORE";

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @Column(name = "updated_by", length = 64)
    private String updatedBy;

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
