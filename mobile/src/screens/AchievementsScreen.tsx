import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, View} from 'react-native';
import {getUserAchievements} from '../api/client';
import {Achievement} from '../types';
import {colors, radius, spacing} from '../theme';
import {DEV_USER_ID} from '../config';
import {useAuth} from '../auth/AuthContext';

export default function AchievementsScreen() {
  const {user} = useAuth();
  const userId = user?.userId ?? DEV_USER_ID;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    getUserAchievements(userId)
      .then(setAchievements)
      .catch(() => setError('Could not load achievements.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const earned  = achievements.filter(a => a.earned);
  const locked  = achievements.filter(a => !a.earned);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={[
        {type: 'header_earned' as const},
        ...earned.map(a => ({type: 'achievement' as const, item: a})),
        ...(locked.length > 0 ? [{type: 'header_locked' as const}] : []),
        ...locked.map(a => ({type: 'achievement' as const, item: a})),
      ]}
      keyExtractor={(item, i) => (item.type === 'achievement' ? item.item.code : item.type + i)}
      ListHeaderComponent={<Text style={styles.heading}>Achievements</Text>}
      renderItem={({item}) => {
        if (item.type === 'header_earned') {
          return (
            <Text style={styles.sectionTitle}>
              Earned ({earned.length}/{achievements.length})
            </Text>
          );
        }
        if (item.type === 'header_locked') {
          return <Text style={styles.sectionTitle}>Locked</Text>;
        }
        const a = item.item;
        return (
          <View style={[styles.card, !a.earned && styles.cardLocked]}>
            <View style={[styles.icon, !a.earned && styles.iconLocked]}>
              <Text style={styles.iconText}>{a.earned ? '★' : '○'}</Text>
            </View>
            <View style={styles.body}>
              <Text style={[styles.name, !a.earned && styles.nameLocked]}>{a.name}</Text>
              <Text style={styles.desc}>{a.description}</Text>
              {a.earned && a.earnedAt && (
                <Text style={styles.date}>
                  Earned {new Date(a.earnedAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}
                </Text>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {flex: 1, backgroundColor: colors.bg},
  content: {padding: spacing.lg, paddingBottom: spacing.xl * 2},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg},
  heading: {fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: spacing.sm},
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
    marginTop: spacing.md, marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  cardLocked: {opacity: 0.5},
  icon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  iconLocked: {backgroundColor: colors.border},
  iconText: {fontSize: 22, color: colors.primary},
  body: {flex: 1},
  name: {fontSize: 15, fontWeight: '700', color: colors.text},
  nameLocked: {color: colors.textMuted},
  desc: {fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 18},
  date: {fontSize: 11, color: colors.verified, marginTop: 5, fontWeight: '600'},
  error: {color: colors.danger, padding: spacing.lg},
});
