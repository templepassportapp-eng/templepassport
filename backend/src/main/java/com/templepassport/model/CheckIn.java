package com.templepassport.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "checkins")
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "temple_id", nullable = false)
    private Temple temple;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_type", nullable = false)
    private VerificationType verificationType;

    private Double latitude;
    private Double longitude;
    private String notes;

    @Column(name = "photo_url")
    private String photoUrl;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Temple getTemple() { return temple; }
    public void setTemple(Temple temple) { this.temple = temple; }
    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
    public VerificationType getVerificationType() { return verificationType; }
    public void setVerificationType(VerificationType verificationType) { this.verificationType = verificationType; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
