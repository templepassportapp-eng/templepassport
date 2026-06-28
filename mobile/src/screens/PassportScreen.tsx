import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {getUserStats, getUserCollections} from '../api/client';
import {CollectionDetail, UserStats} from '../types';
import {colors, fonts, radius, spacing} from '../theme';
import {DEV_USER_ID} from '../config';
import {useAuth} from '../auth/AuthContext';
import Stamp from '../components/Stamp';

const COLLECTION_TABS = ['Jyotirlinga', 'Char Dham', 'Panch Bhoota'];
const SHAPE_BY_NAME: Record<string, 'circle' | 'rectangle' | 'oval'> = {
  'Jyotirlinga':  'circle',
  'Char Dham':    'rectangle',
  'Panch Bhoota': 'oval',
};
const COLOR_BY_NAME: Record<string, string> = {
  'Jyotirlinga':  colors.vermilion,
  'Char Dham':    colors.maroon,
  'Panch Bhoota': colors.gold,
};

export default function PassportScreen() {
  const {user} = useAuth();
  const userId = user?.userId ?? DEV_USER_ID;
  const [stats, setStats]             = useState<UserStats | null>(null);
  const [collections, setCollections] = useState<CollectionDetail[]>([]);
  const [activeTab, setActiveTab]     = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getUserStats(userId), getUserCollections(userId)])
      .then(([s, c]) => { setStats(s); setCollections(c); })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.maroon} size="large" /></View>;
  }

  const allCollections = COLLECTION_TABS.map(tab =>
    collections.find(c => c.name.toLowerCase().includes(tab.toLowerCase()))
  );
  const active    = allCollections[activeTab];
  const visited   = active?.visited ?? 0;
  const total     = active?.total   ?? 0;
  const tabName   = COLLECTION_TABS[activeTab];
  const shape     = SHAPE_BY_NAME[tabName] ?? 'circle';
  const color     = COLOR_BY_NAME[tabName] ?? colors.gold;
  const nextTemple = active?.temples.find(t => !t.visited);

  return (
    <View style={styles.root}>
      {/* Maroon hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>MY PASSPORT</Text>
        <View style={styles.heroRow}>
          <ProgressRing visited={visited} total={total} color={color} />
          <View style={{flex: 1}}>
            <Text style={styles.heroTitle}>{tabName} Yatra</Text>
            {nextTemple && (
              <View style={styles.nextPill}>
                <Text style={styles.nextText}>Next: {nextTemple.name}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Collection tabs */}
      <View style={styles.tabs}>
        {COLLECTION_TABS.map((tab, i) => {
          const col   = allCollections[i];
          const label = i === 0 ? `${tab} · ${col?.visited ?? 0}/${col?.total ?? 0}` : tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === i && styles.tabActive]}
              onPress={() => setActiveTab(i)}
              activeOpacity={0.8}>
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stamp grid */}
      <FlatList
        data={active?.temples ?? []}
        numColumns={3}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({item}) => (
          <View style={styles.stampCell}>
            <Stamp
              shape={shape}
              color={color}
              state={item.visited ? 'earned' : 'empty'}
              size={80}
              name={item.name}
              category={tabName}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No temples in this collection yet.</Text>
          </View>
        }
      />
    </View>
  );
}

function ProgressRing({visited, total, color}: {visited: number; total: number; color: string}) {
  const size = 70;
  const r    = 28;
  const circ = 2 * Math.PI * r;
  const pct  = total > 0 ? visited / total : 0;
  const dash = circ * pct;

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size} viewBox="0 0 70 70">
        <Circle cx="35" cy="35" r={r} stroke={`${colors.cream}20`} strokeWidth={5} fill="none" />
        <Circle
          cx="35" cy="35" r={r}
          stroke={color} strokeWidth={5} fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill as any} pointerEvents="none">
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.ringValue}>{visited}</Text>
          <Text style={styles.ringOf}>of {total}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   {flex: 1, backgroundColor: colors.cream},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream},

  hero: {
    backgroundColor: colors.maroon,
    paddingTop: 52, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg,
  },
  heroLabel: {fontFamily: fonts.bodySemi, fontSize: 11, color: `${colors.cream}70`, letterSpacing: 2, marginBottom: spacing.sm},
  heroRow:   {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  heroTitle: {fontFamily: fonts.display, fontSize: 24, color: colors.cream, marginBottom: spacing.sm},
  nextPill:  {
    backgroundColor: `${colors.cream}15`, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start',
  },
  nextText:  {fontFamily: fonts.body, fontSize: 12, color: colors.goldLight},

  ringWrap:  {width: 70, height: 70, position: 'relative'},
  ringValue: {fontFamily: fonts.display, fontSize: 22, color: colors.cream, lineHeight: 26},
  ringOf:    {fontFamily: fonts.body, fontSize: 10, color: `${colors.cream}70`},

  tabs: {
    flexDirection: 'row', backgroundColor: colors.maroon,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm, flexWrap: 'wrap',
  },
  tab:         {paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1.5, borderColor: `${colors.cream}30`},
  tabActive:   {backgroundColor: colors.cream, borderColor: colors.cream},
  tabText:     {fontFamily: fonts.bodySemi, fontSize: 13, color: `${colors.cream}80`},
  tabTextActive: {color: colors.maroon},

  grid:    {padding: spacing.lg, paddingBottom: 100},
  gridRow: {justifyContent: 'space-between', marginBottom: spacing.lg},
  stampCell: {width: '30%', alignItems: 'center'},
  empty:     {padding: spacing.xl, alignItems: 'center'},
  emptyText: {fontFamily: fonts.body, fontSize: 14, color: colors.muted},
});
