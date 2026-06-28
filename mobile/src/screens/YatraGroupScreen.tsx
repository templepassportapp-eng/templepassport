import React, {useState} from 'react';
import {
  ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {colors, fonts, radius, shadow, spacing} from '../theme';
import {MOCK_GROUP} from '../data/mockFeed';

type MemberInviteStatus = 'pending' | 'accepted' | 'declined';

type Props = NativeStackScreenProps<any, 'YatraGroup'>;

export default function YatraGroupScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const group = MOCK_GROUP;
  const isNewGroup = !!route?.params?.initiatorId;
  const [memberStatuses, setMemberStatuses] = useState<Record<string, MemberInviteStatus>>(() => {
    const initial: Record<string, MemberInviteStatus> = {};
    group.members.forEach(m => { if (m.id !== 'user-you') initial[m.id] = 'pending'; });
    return initial;
  });

  return (
    <View style={styles.root}>
      {/* Maroon header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.groupLabel}>{group.label}</Text>
          <Text style={styles.groupName}>{group.name}</Text>
        </View>
        <View style={{width: 24}} />
      </View>

      {/* Member avatars + invite status */}
      <View style={[styles.membersRow, {backgroundColor: colors.maroon}]}>
        {group.members.map((m, i) => {
          const status = m.id === 'user-you' ? 'accepted' : (memberStatuses[m.id] ?? 'pending');
          return (
            <View key={m.id} style={styles.memberCell}>
              <View style={[styles.memberAvatar, {backgroundColor: m.color, marginLeft: i > 0 ? -10 : 0}]}>
                <Text style={styles.memberInitials}>{m.initials}</Text>
              </View>
              <Text style={styles.memberName}>{m.name}</Text>
              {isNewGroup && m.id !== 'user-you' && (
                <View style={[
                  styles.statusPill,
                  status === 'accepted' && styles.statusAccepted,
                  status === 'declined' && styles.statusDeclined,
                ]}>
                  <Text style={styles.statusText}>
                    {status === 'accepted' ? '✓' : status === 'declined' ? '✗' : '...'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        <View style={styles.memberCell}>
          <View style={styles.inviteAvatar}>
            <Text style={styles.inviteText}>+</Text>
          </View>
          <Text style={styles.memberName}>Invite</Text>
        </View>
      </View>

      {/* Invites banner for new groups */}
      {isNewGroup && (
        <View style={styles.invitesBanner}>
          <Text style={styles.invitesBannerText}>
            Invites sent · {Object.values(memberStatuses).filter(s => s === 'pending').length} pending
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 100}]}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance card — overlaps maroon header */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Overall, you are owed</Text>
          <Text style={styles.balanceAmount}>₹{group.owedTotal.toLocaleString('en-IN')}</Text>
          <View style={styles.balanceDivider} />
          {group.memberBalances.map(b => (
            <View key={b.id} style={styles.balanceRow}>
              <View style={[styles.balanceAvatar, {backgroundColor: b.color}]}>
                <Text style={styles.balanceInitials}>{b.initials}</Text>
              </View>
              <Text style={styles.balanceName}>
                {b.owesYou ? `${b.name} owes you` : `You owe ${b.name}`}
              </Text>
              <Text style={[styles.balanceNum, b.owesYou ? styles.balanceOwed : styles.balanceYouOwe]}>
                ₹{b.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Expenses */}
        <Text style={styles.expensesTitle}>Shared expenses</Text>
        {group.expenses.map(e => (
          <View key={e.id} style={styles.expenseRow}>
            <View style={[styles.expenseAvatar, {backgroundColor: e.payerColor}]}>
              <Text style={styles.expenseInitials}>{e.payerInitials}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.expenseTitle}>{e.title}</Text>
              <Text style={styles.expenseSub}>{e.payerName} paid · split {e.split} ways</Text>
            </View>
            <Text style={styles.expenseAmount}>₹{e.amount.toLocaleString('en-IN')}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom actions */}
      <View style={[styles.bottomBar, {paddingBottom: insets.bottom + spacing.sm}]}>
        <TouchableOpacity style={styles.addExpenseBtn} activeOpacity={0.88}>
          <Text style={styles.addExpenseBtnText}>Add expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settleBtn} activeOpacity={0.88}>
          <Text style={styles.settleBtnText}>Settle up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={colors.cream} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream2},

  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    backgroundColor: colors.maroon,
  },
  backText: {fontFamily: fonts.display, fontSize: 24, color: colors.cream, marginTop: 2},
  headerCenter: {flex: 1, alignItems: 'center'},
  groupLabel: {fontFamily: fonts.bodySemi, fontSize: 10, color: colors.goldLight, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3},
  groupName: {fontFamily: fonts.display, fontSize: 20, color: colors.cream, textAlign: 'center'},

  membersRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg + 8, gap: 14,
  },
  invitesBanner: {
    backgroundColor: `${colors.goldLight}22`, paddingVertical: 8,
    paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: `${colors.gold}30`,
  },
  invitesBannerText: {fontFamily: fonts.bodySemi, fontSize: 12, color: colors.gold, textAlign: 'center'},

  statusPill: {
    borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
    backgroundColor: `${colors.goldLight}33`, marginTop: 2,
  },
  statusAccepted: {backgroundColor: `${colors.green}30`},
  statusDeclined: {backgroundColor: `${colors.vermilion}30`},
  statusText: {fontFamily: fonts.bodySemi, fontSize: 9, color: colors.goldLight},

  memberCell: {alignItems: 'center', gap: 5},
  memberAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.maroon,
  },
  memberInitials: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream},
  memberName: {fontFamily: fonts.body, fontSize: 10, color: `${colors.goldLight}CC`},
  inviteAvatar: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5, borderColor: `${colors.goldLight}66`, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  inviteText: {fontFamily: fonts.bodySemi, fontSize: 18, color: `${colors.goldLight}99`},

  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: spacing.lg, paddingTop: spacing.sm},

  balanceCard: {
    backgroundColor: colors.cream, borderRadius: radius.md, padding: spacing.lg,
    marginTop: -spacing.xl, marginBottom: spacing.lg, ...shadow.card,
  },
  balanceLabel: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 4},
  balanceAmount: {fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: spacing.md},
  balanceDivider: {height: 1, backgroundColor: colors.inkTint06, marginBottom: spacing.md},
  balanceRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm},
  balanceAvatar: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  balanceInitials: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.cream},
  balanceName: {flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.brown},
  balanceNum: {fontFamily: fonts.bodySemi, fontSize: 14},
  balanceOwed: {color: colors.green},
  balanceYouOwe: {color: colors.vermilion},

  expensesTitle: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink, marginBottom: spacing.sm},
  expenseRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.cream, borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.sm, ...shadow.card,
  },
  expenseAvatar: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  expenseInitials: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream},
  expenseTitle: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink},
  expenseSub: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2},
  expenseAmount: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink},

  bottomBar: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm + 2,
    backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.inkTint06,
  },
  addExpenseBtn: {
    flex: 1, backgroundColor: colors.maroon, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  addExpenseBtnText: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream},
  settleBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.green, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  settleBtnText: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.green},
});
