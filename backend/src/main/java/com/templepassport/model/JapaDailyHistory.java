package com.templepassport.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "japa_daily_history",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "japa_date"}))
public class JapaDailyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "japa_date", nullable = false)
    private LocalDate japaDate;

    @Column(name = "total_japa", nullable = false)
    private long totalJapa = 0;

    @Column(name = "total_malas", nullable = false)
    private long totalMalas = 0;

    @Column(name = "synced_at", nullable = false)
    private Instant syncedAt = Instant.now();

    public UUID getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getJapaDate() { return japaDate; }
    public void setJapaDate(LocalDate japaDate) { this.japaDate = japaDate; }

    public long getTotalJapa() { return totalJapa; }
    public void setTotalJapa(long totalJapa) { this.totalJapa = totalJapa; }

    public long getTotalMalas() { return totalMalas; }
    public void setTotalMalas(long totalMalas) { this.totalMalas = totalMalas; }

    public Instant getSyncedAt() { return syncedAt; }
    public void setSyncedAt(Instant syncedAt) { this.syncedAt = syncedAt; }
}
