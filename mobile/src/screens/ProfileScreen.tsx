import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {getUserStats} from '../api/client';
import {UserStats} from '../types';
import {colors, radius, spacing} from '../theme';
import {DEV_USER_ID} from '../config';
import {useAuth} from '../auth/AuthContext';

export default function ProfileScreen() {
  const {user, logout} = useAuth();
  const userId = user?.userId ?? DEV_USER_ID;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getUserStats(userId)
      .then(setStats)
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? 'Something went wrong.'}</Text>
      </View>
    );
  }

  const passportLevel =
    stats.templesVisited >= 100 ? 'Spiritual Master' :
    stats.templesVisited >= 50  ? 'Blessed Pilgrim'  :
    stats.templesVisited >= 25  ? 'True Devotee'     :
    stats.templesVisited >= 10  ? 'Pilgrim'          :
    stats.templesVisited >= 1   ? 'Seeker'           : 'Beginner';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{stats.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{stats.name}</Text>
        <Text style={styles.email}>{stats.email}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{passportLevel}</Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatTile label="Temples Visited"  value={stats.templesVisited} />
        <StatTile label="Verified Visits"  value={stats.verifiedVisits} />
        <StatTile label="States Covered"   value={`${stats.statesCovered}/${stats.totalStates}`} />
        <StatTile label="Achievements"     value={stats.achievements.filter(a => a.earned).length} />
      </View>

      {/* Collections summary */}
      <Text style={styles.section}>Collections Progress</Text>
      {stats.collections.map(c => {
        const pct = c.total > 0 ? Math.round((c.visited / c.total) * 100) : 0;
        return (
          <View key={c.id} style={styles.collRow}>
            <View style={styles.collLeft}>
              <Text style={styles.collName}>{c.name}</Text>
              <Text style={styles.collPct}>{pct}% complete</Text>
            </View>
            <Text style={styles.collCount}>{c.visited}/{c.total}</Text>
          </View>
        );
      })}

      {/* Earned achievements */}
      {stats.achievements.filter(a => a.earned).length > 0 && (
        <>
          <Text style={styles.section}>Achievements Earned</Text>
          <View style={styles.badgeWrap}>
            {stats.achievements.filter(a => a.earned).map(a => (
              <View key={a.code} style={styles.badge}>
                <Text style={styles.badgeIcon}>★</Text>
                <Text style={styles.badgeName}>{a.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() =>
          Alert.alert('Sign out', 'Are you sure you want to sign out?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Sign out', style: 'destructive', onPress: logout},
          ])
        }>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatTile({label, value}: {label: string; value: number | string}) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: colors.bg},
  content: {padding: spacing.lg, paddingBottom: spacing.xl * 2},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg},
  error: {color: colors.danger, textAlign: 'center'},
  avatarSection: {alignItems: 'center', marginBottom: spacing.xl},
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md, borderWidth: 4, borderColor: colors.accent,
  },
  avatarText: {fontSize: 38, fontWeight: '800', color: colors.accent},
  name: {fontSize: 22, fontWeight: '800', color: colors.primary},
  email: {fontSize: 13, color: colors.textMuted, marginTop: 4},
  levelBadge: {
    marginTop: spacing.sm, backgroundColor: colors.accent,
    borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs,
  },
  levelText: {fontSize: 13, fontWeight: '700', color: colors.primary},
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg,
  },
  statTile: {
    flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center',
  },
  statValue: {fontSize: 28, fontWeight: '800', color: colors.primary},
  statLabel: {fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center'},
  section: {
    fontSize: 15, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  collRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  collLeft: {flex: 1},
  collName: {fontSize: 14, fontWeight: '600', color: colors.text},
  collPct: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  collCount: {fontSize: 15, fontWeight: '700', color: colors.primary},
  badgeWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.accent,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  badgeIcon: {fontSize: 14, color: colors.accent},
  badgeName: {fontSize: 12, fontWeight: '600', color: colors.primary},
  logoutBtn: {
    marginTop: spacing.xl, marginBottom: spacing.xl,
    borderWidth: 1.5, borderColor: colors.danger, borderRadius: radius.pill,
    paddingVertical: 14, alignItems: 'center',
  },
  logoutText: {color: colors.danger, fontWeight: '700', fontSize: 15},
});
