package com.templepassport.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class JapaDtos {

    // ── Sync (POST /api/japa/sync) ────────────────────────────────────────────

    public record MantraStatEntry(
            long japa,
            long malas,
            String mantraName,
            String mantraLatin
    ) {}

    public record DayEntry(
            String date,   // ISO-8601 date string "2026-06-28"
            long japa,
            long malas
    ) {}

    public record SyncRequest(
            Map<String, MantraStatEntry> perMantraStats,
            List<DayEntry> dailyHistory
    ) {}

    public record SyncResponse(
            boolean synced,
            long totalJapa,
            long totalMalas,
            int streakDays,
            Instant syncedAt
    ) {}

    // ── Summary (GET /api/japa/summary) ─────────────────────────────────────

    public record MantraStatRow(
            String mantraId,
            String mantraName,
            String mantraLatin,
            long totalJapa,
            long totalMalas
    ) {}

    public record DayRow(
            LocalDate date,
            long totalJapa,
            long totalMalas
    ) {}

    public record SummaryResponse(
            UUID userId,
            long totalJapa,
            long totalMalas,
            int streakDays,
            List<MantraStatRow> byMantra,
            List<DayRow> last30Days,
            Instant lastSyncedAt
    ) {}
}
