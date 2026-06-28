import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Ellipse, Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getUserStats} from '../api/client';
import {UserStats} from '../types';
import {colors, fonts, radius, spacing} from '../theme';
import {useAuth} from '../auth/AuthContext';
import {YouStackParamList} from '../navigation/types';
import {
  GroupInvite, MyGroup,
  MOCK_GROUP_INVITES, MOCK_MY_GROUPS,
} from '../data/mockGroups';

type Props = NativeStackScreenProps<YouStackParamList, 'You'>;

const SHAPE_BY_TYPE: Record<string, string> = {
  JYOTIRLINGA: 'circle',
  CHAR_DHAM:   'rectangle',
  PANCH_BHOOTA:'oval',
  SHAKTI:      'oval',
  VISHNU:      'hexagon',
};
const COLOR_BY_TYPE: Record<string, string> = {
  JYOTIRLINGA: colors.vermilion,
  CHAR_DHAM:   colors.maroon,
  PANCH_BHOOTA: colors.gold,
  SHAKTI:      colors.saffron,
  VISHNU:      colors.greenDeep,
};

export default function YouScreen({navigation}: Props) {
  const {user} = useAuth();
  const insets = useSafeAreaInsets();
  const userId = user?.userId ?? '';
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<GroupInvite[]>(MOCK_GROUP_INVITES);
  const [declinedIds, setDeclinedIds] = useState<string[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getUserStats(userId)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.maroon} size="large" /></View>;
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={{fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', paddingHorizontal: 32}}>
          Could not load your profile. Please check your connection.
        </Text>
      </View>
    );
  }

  const s = stats;
  const initials = s.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const pendingInvites = invites.filter(inv => !declinedIds.includes(inv.id) && !acceptedIds.includes(inv.id));
  const myGroups: MyGroup[] = [
    ...MOCK_MY_GROUPS,
    ...invites.filter(inv => acceptedIds.includes(inv.id)).map(inv => ({
      id: inv.groupId,
      name: inv.groupName,
      label: inv.groupLabel,
      members: [{id: inv.groupId, initials: inv.fromInitials, color: inv.fromColor, name: inv.fromName, status: 'accepted' as const}],
      lastMessage: `You joined ${inv.groupName}`,
      lastMessageTime: 'now',
      unreadCount: 1,
    })),
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, {paddingBottom: 100}]}
      showsVerticalScrollIndicator={false}
    >
      {/* Maroon header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.since}>Pilgrim since Jan 2026 · Shaiva path</Text>
        </View>
      </View>

      {/* Big stats row */}
      <View style={styles.bigStats}>
        <BigStat value={s.templesVisited} label={`temples\nvisited`} />
        <View style={styles.statDivider} />
        <BigStat value={s.collections.filter(c => c.visited > 0).length} label={`sets in\nprogress`} />
        <View style={styles.statDivider} />
        <BigStat value={s.statesCovered} label={`states\ncovered`} />
      </View>

      {/* Group Invites */}
      {pendingInvites.length > 0 && (
        <>
          <SectionLabel label="Group Invites" count={pendingInvites.length} />
          {pendingInvites.map(inv => (
            <View key={inv.id} style={styles.inviteCard}>
              <View style={[styles.inviteAvatar, {backgroundColor: inv.fromColor}]}>
                <Text style={styles.inviteInitials}>{inv.fromInitials}</Text>
              </View>
              <View style={styles.inviteBody}>
                <Text style={styles.inviteName}>{inv.groupName}</Text>
                <Text style={styles.inviteSub}>{inv.fromName} invited you · {inv.membersCount} members</Text>
              </View>
              <View style={styles.inviteActions}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => setAcceptedIds(a => [...a, inv.id])}
                  activeOpacity={0.85}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => setDeclinedIds(d => [...d, inv.id])}
                  activeOpacity={0.85}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {/* My Yatra Groups */}
      {myGroups.length > 0 && (
        <>
          <SectionLabel label="My Yatra Groups" />
          {myGroups.map(grp => (
            <TouchableOpacity
              key={grp.id}
              style={styles.groupCard}
              onPress={() => navigation.navigate('GroupChat', {
                groupId: grp.id,
                groupName: grp.name,
                groupLabel: grp.label,
                members: grp.members.map(m => ({id: m.id, initials: m.initials, color: m.color, name: m.name})),
              })}
              activeOpacity={0.88}
            >
              {/* Overlapping avatars */}
              <View style={styles.groupAvatarStack}>
                {grp.members.slice(0, 3).map((m, i) => (
                  <View
                    key={m.id}
                    style={[styles.groupAvatar, {backgroundColor: m.color, marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i}]}
                  >
                    <Text style={styles.groupAvatarText}>{m.initials}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.groupBody}>
                <Text style={styles.groupLabel}>{grp.label}</Text>
                <Text style={styles.groupName}>{grp.name}</Text>
                <Text style={styles.groupLastMsg} numberOfLines={1}>{grp.lastMessage}</Text>
              </View>
              <View style={styles.groupRight}>
                <Text style={styles.groupTime}>{grp.lastMessageTime}</Text>
                {grp.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{grp.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Diya tiles */}
      <View style={styles.tileRow}>
        <DiyaTile value={86}  label="Diyas you've lit"  />
        <DiyaTile value={142} label="Diyas received"    />
      </View>
      <View style={styles.tileRow}>
        <StatTile value="2,140" label="km travelled" />
        <StatTile value="12"    label="postcards made" />
      </View>

      {/* Collection by set */}
      <Text style={styles.sectionLabel}>Collection by set</Text>
      {s.collections.map(c => {
        const pct = c.total > 0 ? c.visited / c.total : 0;
        const col = COLOR_BY_TYPE[c.type] ?? colors.gold;
        return (
          <View key={c.id} style={styles.collRow}>
            <SetShape type={c.type} color={col} />
            <View style={{flex: 1}}>
              <View style={styles.collTop}>
                <Text style={styles.collName}>{c.name}</Text>
                <Text style={styles.collCount}>{c.visited} / {c.total}</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {width: `${pct * 100}%`, backgroundColor: col}]} />
              </View>
            </View>
          </View>
        );
      })}

      {/* Milestone card */}
      <View style={styles.milestoneCard}>
        <View style={styles.milestoneIcon}>
          <Text style={{fontSize: 18}}>★</Text>
        </View>
        <View>
          <Text style={styles.milestoneLabel}>NEXT MILESTONE</Text>
          <Text style={styles.milestoneText}>{Math.max(0, 10 - s.templesVisited)} more for the 10-temple badge</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SectionLabel({label, count}: {label: string; count?: number}) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {count != null && (
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function BigStat({value, label}: {value: number; label: string}) {
  return (
    <View style={styles.bigStatCell}>
      <Text style={styles.bigStatValue}>{value}</Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
    </View>
  );
}

function DiyaTile({value, label}: {value: number; label: string}) {
  return (
    <View style={styles.tile}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
        <FlameIcon />
        <Text style={styles.tileValue}>{value}</Text>
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function StatTile({value, label}: {value: string; label: string}) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function FlameIcon() {
  return (
    <Svg width={14} height={18} viewBox="0 0 24 28">
      <Ellipse cx="12" cy="25" rx="7" ry="2.4" fill={colors.gold} />
      <Path d="M12 4 C 15.5 9.5,16 13,12 16 C 8 13,8.5 9.5,12 4 Z" fill={colors.saffron} />
    </Svg>
  );
}

function SetShape({type, color}: {type: string; color: string}) {
  const shape = SHAPE_BY_TYPE[type] ?? 'circle';
  const size = 24;
  if (shape === 'circle')    return <View style={[styles.shapeCircle, {borderColor: color, width: size, height: size, borderRadius: size/2}]} />;
  if (shape === 'rectangle') return <View style={[styles.shapeRect,   {borderColor: color, width: size, height: size * 0.7}]} />;
  if (shape === 'oval')      return <View style={[styles.shapeCircle, {borderColor: color, width: size * 0.8, height: size, borderRadius: size/2}]} />;
  return <View style={[styles.shapeCircle, {borderColor: color, width: size, height: size, borderRadius: 4}]} />;
}

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: colors.cream},
  content: {},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream},

  header: {
    backgroundColor: colors.maroon, paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  avatar: {width: 52, height: 52, borderRadius: 26, backgroundColor: colors.maroonDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.goldLight},
  avatarText: {fontFamily: fonts.display, fontSize: 20, color: colors.goldLight},
  name: {fontFamily: fonts.display, fontSize: 20, color: colors.cream},
  since: {fontFamily: fonts.body, fontSize: 12, color: `${colors.cream}80`, marginTop: 2},

  bigStats: {flexDirection: 'row', backgroundColor: colors.maroon, paddingBottom: spacing.xl, paddingHorizontal: spacing.xl},
  bigStatCell: {flex: 1, alignItems: 'center'},
  bigStatValue: {fontFamily: fonts.display, fontSize: 30, color: colors.goldLight},
  bigStatLabel: {fontFamily: fonts.body, fontSize: 11, color: `${colors.cream}80`, textAlign: 'center', lineHeight: 15, marginTop: 2},
  statDivider: {width: 1, backgroundColor: `${colors.cream}20`, marginVertical: 4},

  sectionLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md},
  sectionLabel: {
    fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted, letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionBadge: {backgroundColor: colors.vermilion, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2},
  sectionBadgeText: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.cream},

  // Invite cards
  inviteCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: 'white', borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: colors.maroon, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  inviteAvatar: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  inviteInitials: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream},
  inviteBody: {flex: 1},
  inviteName: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink},
  inviteSub: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2},
  inviteActions: {flexDirection: 'column', gap: 5},
  acceptBtn: {backgroundColor: colors.maroon, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, alignItems: 'center'},
  acceptBtnText: {fontFamily: fonts.bodySemi, fontSize: 12, color: colors.cream},
  declineBtn: {borderWidth: 1, borderColor: `${colors.maroon}40`, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, alignItems: 'center'},
  declineBtnText: {fontFamily: fonts.bodySemi, fontSize: 12, color: colors.muted},

  // Group cards
  groupCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: 'white', borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: colors.maroon, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  groupAvatarStack: {flexDirection: 'row'},
  groupAvatar: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'white'},
  groupAvatarText: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.cream},
  groupBody: {flex: 1},
  groupLabel: {fontFamily: fonts.bodySemi, fontSize: 9, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase'},
  groupName: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink},
  groupLastMsg: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 1},
  groupRight: {alignItems: 'flex-end', gap: 5},
  groupTime: {fontFamily: fonts.body, fontSize: 11, color: colors.muted},
  unreadBadge: {backgroundColor: colors.vermilion, borderRadius: 10, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center'},
  unreadCount: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.cream},

  tileRow: {flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md},
  tile: {
    flex: 1, backgroundColor: 'white', borderRadius: radius.md,
    padding: spacing.md, gap: 4,
    shadowColor: colors.maroon, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  tileValue: {fontFamily: fonts.display, fontSize: 26, color: colors.ink},
  tileLabel: {fontFamily: fonts.body, fontSize: 12, color: colors.muted},

  collRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  collTop: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5},
  collName: {fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink},
  collCount: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted},
  progressBg: {height: 5, backgroundColor: colors.inkTint06, borderRadius: 3, overflow: 'hidden'},
  progressFill: {height: 5, borderRadius: 3},

  shapeCircle: {borderWidth: 2},
  shapeRect: {borderWidth: 2, borderRadius: 3},

  milestoneCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.maroon, margin: spacing.lg, borderRadius: radius.lg, padding: spacing.md,
  },
  milestoneIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.goldLight + '30', alignItems: 'center', justifyContent: 'center'},
  milestoneLabel: {fontFamily: fonts.bodySemi, fontSize: 10, color: colors.goldLight, letterSpacing: 1.5, marginBottom: 3},
  milestoneText: {fontFamily: fonts.display, fontSize: 14, color: colors.cream},
});
