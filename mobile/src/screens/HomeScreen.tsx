import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle, Ellipse, Path} from 'react-native-svg';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getUserStats} from '../api/client';
import {UserStats} from '../types';
import {colors, fonts, radius, shadow, spacing} from '../theme';
import {HomeStackParamList} from '../navigation/types';
import {useAuth} from '../auth/AuthContext';
import TempleGlyph from '../components/TempleGlyph';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const NEAR_YOU = [
  {id: '1', name: 'Bhimashankar', dist: '1.2 km', type: 'Jyotirlinga'},
  {id: '2', name: 'Trimbakeshwar', dist: '42 km', type: 'Jyotirlinga'},
];

const SANGHA_ACTIVITY = [
  {id: '1', initials: 'AS', color: colors.maroon, name: 'Aarav', temple: 'Kashi Vishwanath', timeAgo: '2h', lamps: 46},
];

export default function HomeScreen({navigation}: Props) {
  const {user} = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = useCallback(() => {
    if (!user?.userId) { setLoadingStats(false); return; }
    setLoadingStats(true);
    getUserStats(user.userId)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [user?.userId]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const jyotirlinga = stats?.collections.find(c => c.type === 'JYOTIRLINGA');
  const visited = jyotirlinga?.visited ?? 0;
  const total = jyotirlinga?.total ?? 12;
  const userName = stats?.name ?? user?.name ?? '';
  const initials = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('en', {month: 'short'}).toUpperCase();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, {paddingTop: insets.top + 12}]}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.greeting}>Namaste,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <BellIcon />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* Progress card */}
      <TouchableOpacity style={styles.progressCard} activeOpacity={0.9}>
        <ProgressRing visited={visited} total={total} loading={loadingStats} />
        <View style={styles.progressTextWrap}>
          <Text style={styles.progressTitle}>Jyotirlinga Yatra</Text>
          <Text style={styles.progressSub}>Next: Bhimashankar · 1.2 km</Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>

      {/* Check-in CTA */}
      <TouchableOpacity style={styles.checkinCard} activeOpacity={0.88}>
        <View style={styles.checkinFlame}>
          <FlameIcon />
        </View>
        <View style={styles.checkinTextWrap}>
          <Text style={styles.checkinTitle}>Check in & light a stamp</Text>
          <Text style={styles.checkinSub}>You're near a temple right now</Text>
        </View>
        <Text style={styles.checkinArrow}>›</Text>
      </TouchableOpacity>

      {/* Near you */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Near you</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>See map</Text>
        </TouchableOpacity>
      </View>
      <View style={{height: 124, marginBottom: spacing.lg}}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nearRow}
        >
          {NEAR_YOU.map(t => (
            <TouchableOpacity key={t.id} style={styles.templeCard} activeOpacity={0.85}>
              <View style={styles.templeCardImg}>
                <TempleGlyph size={26} color={`${colors.maroon}25`} />
              </View>
              <View style={styles.templeCardInfo}>
                <Text style={styles.templeName} numberOfLines={1}>{t.name}</Text>
                <Text style={styles.templeSub} numberOfLines={1}>{t.dist} · {t.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Auspicious panchang */}
      <View style={styles.auspCard}>
        <View style={styles.auspDateBox}>
          <Text style={styles.auspDay}>{day}</Text>
          <Text style={styles.auspMonth}>{month}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.auspLabel}>FRIDAY · AUSPICIOUS</Text>
          <Text style={styles.auspText}>Pradosham — ideal for Shiva darshan</Text>
        </View>
      </View>

      {/* From your sangha */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>From your sangha</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>Open feed</Text>
        </TouchableOpacity>
      </View>
      {SANGHA_ACTIVITY.map(a => (
        <View key={a.id} style={styles.sanghaCard}>
          <View style={[styles.sanghaAvatar, {backgroundColor: a.color}]}>
            <Text style={styles.sanghaInitials}>{a.initials}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.sanghaText}>
              <Text style={styles.sanghaName}>{a.name}</Text>
              {' '}checked in at {a.temple}
            </Text>
            <Text style={styles.sanghaSub}>{a.timeAgo} · {a.lamps} diyas</Text>
          </View>
          <SmallFlameIcon />
        </View>
      ))}
    </ScrollView>
  );
}

const RING_R = 18;
const RING_CIRC = 2 * Math.PI * RING_R;

function ProgressRing({visited, total, loading}: {visited: number; total: number; loading: boolean}) {
  const frac = total > 0 ? Math.min(visited / total, 1) : 0;
  const dash = frac * RING_CIRC;
  return (
    <View style={styles.ringWrap}>
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={RING_R} stroke={colors.goldLight} strokeOpacity={0.35} strokeWidth={3.5} fill="none" />
        {!loading && frac > 0 && (
          <Circle
            cx={24} cy={24} r={RING_R}
            stroke={colors.gold}
            strokeWidth={3.5}
            fill="none"
            strokeDasharray={`${dash} ${RING_CIRC}`}
            strokeLinecap="round"
            rotation={-90}
            origin="24,24"
          />
        )}
      </Svg>
      <Text style={styles.ringLabel}>
        {loading ? '·' : `${visited}/${total}`}
      </Text>
    </View>
  );
}

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C8.7 3 6 5.7 6 9v4.5L4 15v1h16v-1l-2-1.5V9c0-3.3-2.7-6-6-6z"
        stroke={colors.ink} strokeWidth={1.7} strokeLinejoin="round"
      />
      <Path d="M10 20c0 1.1.9 2 2 2s2-.9 2-2" stroke={colors.ink} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

function FlameIcon() {
  return (
    <Svg width={17} height={22} viewBox="0 0 24 28">
      <Ellipse cx="12" cy="25" rx="7" ry="2.4" fill={colors.gold} />
      <Path d="M12 4 C 15.5 9.5,16 13,12 16 C 8 13,8.5 9.5,12 4 Z" fill={colors.saffron} />
    </Svg>
  );
}

function SmallFlameIcon() {
  return (
    <Svg width={13} height={18} viewBox="0 0 24 28">
      <Ellipse cx="12" cy="25" rx="7" ry="2.4" fill={colors.muted} />
      <Path d="M12 4 C 15.5 9.5,16 13,12 16 C 8 13,8.5 9.5,12 4 Z" fill={colors.muted} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: colors.cream},
  content: {paddingHorizontal: spacing.lg + 4, paddingBottom: 100},

  header: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg},
  greeting: {fontFamily: fonts.body, fontSize: 13, color: colors.muted},
  userName: {fontFamily: fonts.display, fontSize: 26, color: colors.ink},
  iconBtn: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream},

  progressCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.maroon, borderRadius: radius.md, padding: spacing.lg,
    marginBottom: spacing.md,
  },
  ringWrap: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  ringLabel: {
    position: 'absolute', width: 48, textAlign: 'center', top: 16,
    fontFamily: fonts.display, fontSize: 11, color: colors.goldLight,
  },
  progressTextWrap: {flex: 1},
  progressTitle: {fontFamily: fonts.display, fontSize: 17, color: colors.cream},
  progressSub: {fontFamily: fonts.body, fontSize: 11, color: `${colors.goldLight}99`, marginTop: 2},
  cardArrow: {fontFamily: fonts.display, fontSize: 22, color: `${colors.cream}CC`},

  checkinCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.vermilion, borderRadius: radius.md, padding: spacing.md + 2,
    marginBottom: spacing.xl,
  },
  checkinFlame: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkinTextWrap: {flex: 1},
  checkinTitle: {fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream},
  checkinSub: {fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2},
  checkinArrow: {fontFamily: fonts.display, fontSize: 20, color: `${colors.cream}CC`},

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink},
  sectionLink: {fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.vermilion},

  nearRow: {gap: spacing.sm},
  templeCard: {
    width: 90, backgroundColor: colors.cream, borderRadius: radius.sm + 4,
    overflow: 'hidden', ...shadow.card,
  },
  templeCardImg: {
    height: 76, backgroundColor: colors.cream2,
    alignItems: 'center', justifyContent: 'center',
  },
  templeCardInfo: {padding: spacing.xs + 2},
  templeName: {fontFamily: fonts.display, fontSize: 11, color: colors.ink},
  templeSub: {fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 1},

  auspCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.cream2, borderRadius: radius.sm + 4,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  auspDateBox: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: `${colors.saffron}35`,
    alignItems: 'center', justifyContent: 'center',
  },
  auspDay: {fontFamily: fonts.display, fontSize: 18, color: colors.maroon},
  auspMonth: {fontFamily: fonts.bodyBold, fontSize: 8, color: `${colors.maroon}AA`, letterSpacing: 0.5},
  auspLabel: {fontFamily: fonts.bodySemi, fontSize: 10, color: colors.muted, letterSpacing: 1.5, marginBottom: 3},
  auspText: {fontFamily: fonts.body, fontSize: 13, color: colors.brown},

  sanghaCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2,
    backgroundColor: colors.cream2, borderRadius: radius.sm + 4,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  sanghaAvatar: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  sanghaInitials: {fontFamily: fonts.bodySemi, fontSize: 12, color: colors.cream},
  sanghaText: {fontFamily: fonts.body, fontSize: 13, color: colors.brown},
  sanghaName: {fontFamily: fonts.bodySemi, color: colors.ink},
  sanghaSub: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2},
});
