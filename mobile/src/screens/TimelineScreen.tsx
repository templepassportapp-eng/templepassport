import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {getUserTimeline} from '../api/client';
import {CheckInDetail} from '../types';
import {colors, radius, spacing} from '../theme';
import {DEV_USER_ID} from '../config';
import {useAuth} from '../auth/AuthContext';
import VerificationBadge from '../components/VerificationBadge';

export default function TimelineScreen() {
  const {user} = useAuth();
  const userId = user?.userId ?? DEV_USER_ID;
  const [checkins, setCheckins] = useState<CheckInDetail[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    getUserTimeline(userId)
      .then(setCheckins)
      .catch(() => setError('Could not load timeline.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={checkins}
        keyExtractor={c => c.id}
        contentContainerStyle={checkins.length === 0 ? {flex: 1} : {paddingBottom: spacing.xl}}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>No visits yet</Text>
            <Text style={styles.emptyText}>Your pilgrimage timeline will appear here.</Text>
          </View>
        }
        renderItem={({item, index}) => {
          const prev = index > 0 ? checkins[index - 1] : null;
          const showDate = !prev || prev.visitDate !== item.visitDate;
          return (
            <>
              {showDate && <Text style={styles.dateHeader}>{item.visitDate}</Text>}
              <TimelineCard item={item} />
            </>
          );
        }}
      />
    </View>
  );
}

function TimelineCard({item}: {item: CheckInDetail}) {
  const img = item.templeImageUrl ??
    `https://placehold.co/120x120/E8A33D/1E2A78?text=${encodeURIComponent(item.templeName.charAt(0))}`;

  return (
    <View style={styles.card}>
      <Image source={{uri: img}} style={styles.thumb} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.templeName}</Text>
        <Text style={styles.cardLoc}>{[item.templeCity, item.templeState].filter(Boolean).join(', ')}</Text>
        <VerificationBadge type={item.verificationType} />
        {item.notes && <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg, padding: spacing.lg},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg},
  error: {color: colors.danger, marginBottom: spacing.md},
  dateHeader: {
    fontSize: 12, fontWeight: '700', color: colors.textMuted,
    backgroundColor: colors.bg, paddingVertical: spacing.xs,
    marginBottom: spacing.xs, letterSpacing: 1, textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm, overflow: 'hidden', padding: spacing.sm,
  },
  thumb: {width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.border},
  cardBody: {flex: 1, justifyContent: 'center'},
  cardName: {fontSize: 15, fontWeight: '700', color: colors.text},
  cardLoc: {fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: spacing.xs},
  notes: {fontSize: 12, color: colors.textMuted, marginTop: spacing.xs, fontStyle: 'italic'},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl},
  emptyIcon: {fontSize: 60, marginBottom: spacing.md},
  emptyTitle: {fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm},
  emptyText: {fontSize: 14, color: colors.textMuted, textAlign: 'center'},
});
