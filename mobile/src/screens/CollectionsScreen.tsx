import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {getUserCollections} from '../api/client';
import {CollectionDetail} from '../types';
import {colors, radius, spacing} from '../theme';
import {DEV_USER_ID} from '../config';
import {useAuth} from '../auth/AuthContext';

export default function CollectionsScreen() {
  const {user} = useAuth();
  const userId = user?.userId ?? DEV_USER_ID;
  const [collections, setCollections] = useState<CollectionDetail[]>([]);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    getUserCollections(userId)
      .then(setCollections)
      .catch(() => setError('Could not load collections.'))
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Pilgrimage Collections</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {collections.map(c => {
        const pct = Math.round((c.visited / c.total) * 100);
        const open = expanded === c.id;
        return (
          <View key={c.id} style={styles.card}>
            <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(open ? null : c.id)}>
              <View style={{flex: 1}}>
                <Text style={styles.collName}>{c.name}</Text>
                <Text style={styles.collDesc} numberOfLines={2}>{c.description}</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, {width: `${pct}%`}]} />
                  </View>
                  <Text style={styles.progressText}>{c.visited}/{c.total}</Text>
                  <Text style={styles.pctText}>{pct}%</Text>
                </View>
              </View>
              <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {open && (
              <View style={styles.templeList}>
                {c.temples.map(t => (
                  <View key={t.id} style={styles.templeRow}>
                    <View style={[styles.visitDot, t.visited && styles.visitDotFilled]} />
                    <Text style={[styles.templeName, !t.visited && styles.templeNameMuted]}>
                      {t.name}
                    </Text>
                    <Text style={styles.templeState}>{t.state}</Text>
                    {t.visited && <Text style={styles.visitedTag}>✓</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: colors.bg},
  content: {padding: spacing.lg, paddingBottom: spacing.xl * 2},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg},
  heading: {fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: spacing.lg},
  error: {color: colors.danger, marginBottom: spacing.md},
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden',
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm},
  collName: {fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 4},
  collDesc: {fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm},
  progressRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  progressBg: {flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden'},
  progressFill: {height: 8, backgroundColor: colors.accent, borderRadius: 4},
  progressText: {fontSize: 12, color: colors.textMuted, minWidth: 30},
  pctText: {fontSize: 12, fontWeight: '700', color: colors.primary, minWidth: 34},
  chevron: {fontSize: 14, color: colors.textMuted},
  templeList: {borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md},
  templeRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  visitDot: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: colors.border,
  },
  visitDotFilled: {backgroundColor: colors.verified, borderColor: colors.verified},
  templeName: {flex: 1, fontSize: 13, fontWeight: '600', color: colors.text},
  templeNameMuted: {color: colors.textMuted},
  templeState: {fontSize: 11, color: colors.textMuted},
  visitedTag: {fontSize: 13, color: colors.verified, fontWeight: '700'},
});
