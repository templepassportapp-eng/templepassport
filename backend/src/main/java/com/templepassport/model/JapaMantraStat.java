package com.templepassport.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "japa_mantra_stats",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "mantra_id"}))
public class JapaMantraStat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "mantra_id", nullable = false, length = 64)
    private String mantraId;

    @Column(name = "mantra_name")
    private String mantraName;

    @Column(name = "mantra_latin")
    private String mantraLatin;

    @Column(name = "total_japa", nullable = false)
    private long totalJapa = 0;

    @Column(name = "total_malas", nullable = false)
    private long totalMalas = 0;

    @Column(name = "last_synced_at", nullable = false)
    private Instant lastSyncedAt = Instant.now();

    public UUID getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMantraId() { return mantraId; }
    public void setMantraId(String mantraId) { this.mantraId = mantraId; }

    public String getMantraName() { return mantraName; }
    public void setMantraName(String mantraName) { this.mantraName = mantraName; }

    public String getMantraLatin() { return mantraLatin; }
    public void setMantraLatin(String mantraLatin) { this.mantraLatin = mantraLatin; }

    public long getTotalJapa() { return totalJapa; }
    public void setTotalJapa(long totalJapa) { this.totalJapa = totalJapa; }

    public long getTotalMalas() { return totalMalas; }
    public void setTotalMalas(long totalMalas) { this.totalMalas = totalMalas; }

    public Instant getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }
}
