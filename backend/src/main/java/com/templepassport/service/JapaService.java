package com.templepassport.service;

import com.templepassport.dto.JapaDtos;
import com.templepassport.model.JapaDailyHistory;
import com.templepassport.model.JapaMantraStat;
import com.templepassport.model.User;
import com.templepassport.repository.JapaDailyHistoryRepository;
import com.templepassport.repository.JapaMantraStatRepository;
import com.templepassport.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class JapaService {

    private final JapaMantraStatRepository mantraStatRepo;
    private final JapaDailyHistoryRepository dailyHistoryRepo;
    private final UserRepository userRepo;

    public JapaService(JapaMantraStatRepository mantraStatRepo,
                       JapaDailyHistoryRepository dailyHistoryRepo,
                       UserRepository userRepo) {
        this.mantraStatRepo = mantraStatRepo;
        this.dailyHistoryRepo = dailyHistoryRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public JapaDtos.SyncResponse sync(UUID userId, JapaDtos.SyncRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Upsert per-mantra stats
        if (req.perMantraStats() != null) {
            req.perMantraStats().forEach((mantraId, entry) -> {
                JapaMantraStat stat = mantraStatRepo
                        .findByUserIdAndMantraId(userId, mantraId)
                        .orElseGet(() -> {
                            JapaMantraStat s = new JapaMantraStat();
                            s.setUser(user);
                            s.setMantraId(mantraId);
                            return s;
                        });
                // Always trust the device's running total (offline-first)
                stat.setTotalJapa(entry.japa());
                stat.setTotalMalas(entry.malas());
                if (entry.mantraName() != null) stat.setMantraName(entry.mantraName());
                if (entry.mantraLatin() != null) stat.setMantraLatin(entry.mantraLatin());
                stat.setLastSyncedAt(Instant.now());
                mantraStatRepo.save(stat);
            });
        }

        // Upsert daily history
        if (req.dailyHistory() != null) {
            for (JapaDtos.DayEntry day : req.dailyHistory()) {
                LocalDate date = LocalDate.parse(day.date());
                JapaDailyHistory history = dailyHistoryRepo
                        .findByUserIdAndJapaDate(userId, date)
                        .orElseGet(() -> {
                            JapaDailyHistory h = new JapaDailyHistory();
                            h.setUser(user);
                            h.setJapaDate(date);
                            return h;
                        });
                history.setTotalJapa(day.japa());
                history.setTotalMalas(day.malas());
                history.setSyncedAt(Instant.now());
                dailyHistoryRepo.save(history);
            }
        }

        long totalJapa = mantraStatRepo.sumJapaByUserId(userId);
        long totalMalas = mantraStatRepo.sumMalasByUserId(userId);
        int streak = computeStreak(dailyHistoryRepo.findByUserIdOrderByDateDesc(userId));

        return new JapaDtos.SyncResponse(true, totalJapa, totalMalas, streak, Instant.now());
    }

    public JapaDtos.SummaryResponse summary(UUID userId) {
        userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        long totalJapa = mantraStatRepo.sumJapaByUserId(userId);
        long totalMalas = mantraStatRepo.sumMalasByUserId(userId);

        List<JapaDtos.MantraStatRow> byMantra = mantraStatRepo
                .findByUserIdOrderByTotalJapaDesc(userId)
                .stream()
                .map(s -> new JapaDtos.MantraStatRow(
                        s.getMantraId(), s.getMantraName(), s.getMantraLatin(),
                        s.getTotalJapa(), s.getTotalMalas()))
                .toList();

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(29);
        List<JapaDtos.DayRow> last30Days = dailyHistoryRepo
                .findByUserIdSince(userId, thirtyDaysAgo)
                .stream()
                .map(h -> new JapaDtos.DayRow(h.getJapaDate(), h.getTotalJapa(), h.getTotalMalas()))
                .toList();

        List<JapaDailyHistory> allHistory = dailyHistoryRepo.findByUserIdOrderByDateDesc(userId);
        int streak = computeStreak(allHistory);
        Instant lastSynced = allHistory.isEmpty() ? null : allHistory.get(0).getSyncedAt();

        return new JapaDtos.SummaryResponse(userId, totalJapa, totalMalas, streak, byMantra, last30Days, lastSynced);
    }

    private int computeStreak(List<JapaDailyHistory> historyDesc) {
        if (historyDesc.isEmpty()) return 0;

        LocalDate cursor = LocalDate.now();
        int streak = 0;

        // If no japa today, start from yesterday
        if (historyDesc.get(0).getJapaDate().isBefore(cursor)) {
            cursor = cursor.minusDays(1);
        }

        for (JapaDailyHistory h : historyDesc) {
            if (h.getTotalJapa() > 0 && h.getJapaDate().equals(cursor)) {
                streak++;
                cursor = cursor.minusDays(1);
            } else if (h.getJapaDate().isBefore(cursor)) {
                break; // gap found
            }
        }
        return streak;
    }
}
