import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Circle, Path} from 'react-native-svg';
import {JourneyStackParamList} from '../navigation/types';
import {JourneyEntry} from '../types';
import {colors, fonts, radius, shadow, spacing} from '../theme';

type Props = NativeStackScreenProps<JourneyStackParamList, 'JourneyTimeline'>;

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK: JourneyEntry[] = [
  {
    id: '1', templeId: 'bhimashankar', templeName: 'Bhimashankar',
    templeState: 'Maharashtra', templeCategory: 'Jyotirlinga',
    visitDate: '2026-06-27', verificationType: 'VERIFIED', accuracyMeters: 8,
  },
  {
    id: '2', templeId: 'trimbakeshwar', templeName: 'Trimbakeshwar',
    templeCity: 'Nashik', templeState: 'Maharashtra', templeCategory: 'Jyotirlinga',
    visitDate: '2026-05-14', verificationType: 'VERIFIED', accuracyMeters: 8,
  },
  {
    id: '3', templeId: 'grishneshwar', templeName: 'Grishneshwar',
    templeCity: 'Verul', templeState: 'Maharashtra', templeCategory: 'Jyotirlinga',
    visitDate: '2026-03-02', verificationType: 'SELF_REPORTED',
  },
  {
    id: '4', templeId: 'mahakaleshwar', templeName: 'Mahakaleshwar',
    templeCity: 'Ujjain', templeState: 'Madhya Pradesh', templeCategory: 'Jyotirlinga',
    visitDate: '2025-11-18', verificationType: 'VERIFIED', accuracyMeters: 5,
  },
  {
    id: '5', templeId: 'omkareshwar', templeName: 'Omkareshwar',
    templeState: 'Madhya Pradesh', templeCategory: 'Jyotirlinga',
    visitDate: '2025-08-03', verificationType: 'VERIFIED', accuracyMeters: 12,
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
}

function getYear(iso: string): string {
  return iso.slice(0, 4);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TempleIcon({size = 48, verified}: {size?: number; verified: boolean}) {
  const iconSize = size * 0.45;
  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <View style={[styles.iconCircle, {width: size, height: size, borderRadius: size / 2}]}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3L2 9h2v10h16V9h2L12 3Z" fill={colors.cream} opacity={0.9} />
          <Path d="M10 19v-6h4v6" fill={colors.cream} opacity={0.7} />
        </Svg>
      </View>
      {verified && (
        <View style={styles.verifiedBadge}>
          <Svg width={8} height={8} viewBox="0 0 10 10" fill="none">
            <Path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      )}
    </View>
  );
}

function EntryCard({item, isLast}: {item: JourneyEntry; isLast: boolean}) {
  const verified = item.verificationType === 'VERIFIED';
  const loc = [item.templeCity, item.templeState].filter(Boolean).join(', ');

  return (
    <View style={styles.entryRow}>
      {/* Timeline spine */}
      <View style={styles.spineCol}>
        {!isLast && <View style={styles.dashedLine} />}
        <TempleIcon verified={verified} />
      </View>

      {/* Card */}
      <View style={[styles.card, shadow.card]}>
        <View style={styles.cardHeader}>
          <Text style={styles.templeName} numberOfLines={1}>{item.templeName}</Text>
          <Text style={styles.dateText}>{formatDate(item.visitDate)}</Text>
        </View>
        <Text style={styles.locText}>{[loc, item.templeCategory].filter(Boolean).join(' · ')}</Text>
        {verified ? (
          <View style={styles.verifiedPill}>
            <Svg width={11} height={11} viewBox="0 0 12 12" fill="none">
              <Path d="M2 6l2.8 2.8L10 3.5" stroke={colors.green} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.verifiedPillText}>
              {`Verified · lit on location${item.accuracyMeters ? ` ±${item.accuracyMeters}m` : ''}`}
            </Text>
          </View>
        ) : (
          <View style={styles.selfPill}>
            <Text style={styles.selfPillText}>Added by you · verify on next visit</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function JourneyTimelineScreen({navigation}: Props) {
  const [entries, setEntries] = useState<JourneyEntry[]>(MOCK);

  useFocusEffect(useCallback(() => {
    // TODO: fetch real journey entries from API
  }, []));

  const verified   = entries.filter(e => e.verificationType === 'VERIFIED').length;
  const selfAdded  = entries.length - verified;

  // Group by year for section headers
  type Row = {type: 'year'; year: string} | {type: 'entry'; item: JourneyEntry; isLast: boolean};
  const rows: Row[] = [];
  let lastYear = '';
  entries.forEach((item, idx) => {
    const year = getYear(item.visitDate);
    if (year !== lastYear) { rows.push({type: 'year', year}); lastYear = year; }
    const nextSameYear = entries[idx + 1] && getYear(entries[idx + 1].visitDate) === year;
    rows.push({type: 'entry', item, isLast: !nextSameYear});
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Journey</Text>
        <Pressable style={styles.fab} onPress={() => navigation.navigate('AddToJourney', {})}>
          <Text style={styles.fabPlus}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.stats}>
        {`${entries.length} temple${entries.length !== 1 ? 's' : ''} · ${verified} verified · ${selfAdded} added by you`}
      </Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: colors.green}]}>
            <Svg width={8} height={8} viewBox="0 0 10 10" fill="none">
              <Path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={styles.legendText}>Verified check-in</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.muted}]} />
          <Text style={styles.legendText}>Added by you</Text>
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r, i) => (r.type === 'year' ? `y-${r.year}` : `e-${r.item.id}-${i}`)}
        contentContainerStyle={entries.length === 0 ? {flex: 1} : {paddingBottom: spacing.xxl, paddingTop: spacing.sm}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛕</Text>
            <Text style={styles.emptyTitle}>No journeys yet</Text>
            <Text style={styles.emptyText}>Tap + to add your first temple visit, or check in at a temple to have it verified automatically.</Text>
          </View>
        }
        renderItem={({item: row}) => {
          if (row.type === 'year') {
            return <Text style={styles.yearHeader}>{row.year}</Text>;
          }
          return <EntryCard item={row.item} isLast={row.isLast} />;
        }}
      />

      {/* Bottom CTA */}
      <Pressable style={styles.bottomBtn} onPress={() => navigation.navigate('AddToJourney', {})}>
        <Text style={styles.bottomBtnText}>+ Add to journey</Text>
      </Pressable>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const SPINE_WIDTH = 56;
const CIRCLE_SIZE = 48;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.lg},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.xl, marginBottom: spacing.xs},
  title: {fontFamily: fonts.display, fontSize: 24, color: colors.maroon},
  fab: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center',
    ...shadow.fab,
  },
  fabPlus: {color: colors.cream, fontSize: 24, lineHeight: 28, fontFamily: fonts.body},
  stats: {fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginBottom: spacing.sm},
  legend: {flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.lg},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  legendDot: {width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  legendText: {fontFamily: fonts.body, fontSize: 12, color: colors.brown},
  yearHeader: {
    fontFamily: fonts.bodyBold, fontSize: 13, color: colors.muted,
    letterSpacing: 1, marginBottom: spacing.sm, marginLeft: SPINE_WIDTH + spacing.sm,
  },
  entryRow: {flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-start'},
  spineCol: {width: SPINE_WIDTH, alignItems: 'center', paddingTop: 0, position: 'relative'},
  dashedLine: {
    position: 'absolute', top: CIRCLE_SIZE, bottom: -spacing.md,
    width: 2, left: SPINE_WIDTH / 2 - 1,
    borderLeftWidth: 2, borderLeftColor: colors.gold, borderStyle: 'dashed',
  },
  iconCircle: {
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.cream,
  },
  card: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2},
  templeName: {fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text, flex: 1, marginRight: spacing.sm},
  dateText: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, flexShrink: 0},
  locText: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: spacing.sm},
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.verifiedBg, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start',
  },
  verifiedPillText: {fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.green},
  selfPill: {
    backgroundColor: colors.selfReportedBg, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start',
  },
  selfPillText: {fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.gold},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl},
  emptyIcon: {fontSize: 56, marginBottom: spacing.md},
  emptyTitle: {fontFamily: fonts.display, fontSize: 20, color: colors.maroon, marginBottom: spacing.sm},
  emptyText: {fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22},
  bottomBtn: {
    backgroundColor: colors.maroon, borderRadius: radius.lg,
    paddingVertical: spacing.lg, alignItems: 'center', marginBottom: spacing.xl,
    ...shadow.fab,
  },
  bottomBtnText: {fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream},
});
