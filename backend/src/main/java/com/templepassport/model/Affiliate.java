package com.templepassport.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "affiliates")
public class Affiliate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 32)
    private String type;  // STAY | JOURNEY | YATRA_ESSENTIALS

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "website_url", length = 512)
    private String websiteUrl;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "contact_email", length = 256)
    private String contactEmail;

    @Column(name = "contact_phone", length = 32)
    private String contactPhone;

    @Column(name = "commission_pct", precision = 5, scale = 2)
    private BigDecimal commissionPct;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public BigDecimal getCommissionPct() { return commissionPct; }
    public void setCommissionPct(BigDecimal commissionPct) { this.commissionPct = commissionPct; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Instant getCreatedAt() { return createdAt; }
}
