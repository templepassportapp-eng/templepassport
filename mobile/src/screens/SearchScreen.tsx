import React, {useState} from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {colors, fonts, radius, shadow, spacing} from '../theme';
import {SearchStackParamList} from '../navigation/types';
import {MOCK_USERS} from '../data/mockFeed';
import {PHONE_TO_USER_ID} from '../data/mockGroups';

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>;

export default function SearchScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [foundUserId, setFoundUserId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const handleSearch = () => {
    const clean = phone.replace(/\D/g, '');
    const uid = PHONE_TO_USER_ID[clean];
    if (uid) {
      setFoundUserId(uid);
      setNotFound(false);
    } else {
      setFoundUserId(null);
      setNotFound(true);
    }
  };

  const foundUser = foundUserId ? MOCK_USERS[foundUserId] : null;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Text style={styles.headerTitle}>Find Pilgrims</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search box */}
        <View style={styles.searchCard}>
          <Text style={styles.searchHint}>Search by mobile number</Text>
          <View style={styles.searchRow}>
            <PhoneIcon />
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={t => {
                setPhone(t);
                setNotFound(false);
                setFoundUserId(null);
              }}
              keyboardType="phone-pad"
              maxLength={13}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, phone.replace(/\D/g, '').length < 10 && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={phone.replace(/\D/g, '').length < 10}
            activeOpacity={0.85}
          >
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {foundUser && (
          <View style={styles.userCard}>
            {/* Avatar + name */}
            <View style={styles.userTop}>
              <View style={[styles.userAvatar, {backgroundColor: foundUser.color}]}>
                <Text style={styles.userInitials}>{foundUser.initials}</Text>
              </View>
              <View style={styles.userMeta}>
                <Text style={styles.userName}>{foundUser.name}</Text>
                <Text style={styles.userSub}>Pilgrim since {foundUser.pilgrimSince} · {foundUser.path}</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.userStats}>
              <View style={styles.userStatCell}>
                <Text style={styles.userStatNum}>{foundUser.templesVisited}</Text>
                <Text style={styles.userStatLabel}>temples</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatCell}>
                <Text style={styles.userStatNum}>{foundUser.statesCovered}</Text>
                <Text style={styles.userStatLabel}>states</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatCell}>
                <Text style={styles.userStatNum}>{foundUser.diyas}</Text>
                <Text style={styles.userStatLabel}>diyas</Text>
              </View>
            </View>

            {/* Action buttons */}
            <TouchableOpacity
              style={[styles.followBtn, followed[foundUser.id] && styles.followBtnActive]}
              onPress={() => setFollowed(f => ({...f, [foundUser.id]: !f[foundUser.id]}))}
              activeOpacity={0.85}
            >
              <Text style={[styles.followBtnText, followed[foundUser.id] && styles.followBtnTextActive]}>
                {followed[foundUser.id] ? '✓ Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewProfileBtn}
              onPress={() => navigation.navigate('UserProfile', {userId: foundUser.id})}
              activeOpacity={0.85}
            >
              <Text style={styles.viewProfileBtnText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.groupBtn}
              onPress={() => navigation.navigate('YatraGroup', {initiatorId: foundUser.id})}
              activeOpacity={0.85}
            >
              <GroupIcon />
              <Text style={styles.groupBtnText}>Start Yatra Group with {foundUser.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          </View>
        )}

        {notFound && (
          <View style={styles.notFoundCard}>
            <Text style={styles.notFoundText}>No pilgrim found with that number.</Text>
            <Text style={styles.notFoundHint}>Make sure they've signed up on Temple Passport.</Text>
          </View>
        )}

        {!foundUser && !notFound && (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Find fellow pilgrims</Text>
            <Text style={styles.tipBody}>Search by their registered phone number to follow them, view their pilgrimage journey, and create Yatra groups together.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24a11.36 11.36 0 003.56.56c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1A17 17 0 013 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.56 3.57.11.35.02.74-.25 1.02l-2.2 2.21z"
        stroke={colors.muted} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GroupIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="4" stroke={colors.cream} strokeWidth={1.8} />
      <Path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={colors.cream} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M19 11v6M16 14h6" stroke={colors.cream} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream},

  header: {
    backgroundColor: colors.maroon,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {fontFamily: fonts.display, fontSize: 22, color: colors.cream},

  scrollContent: {padding: spacing.lg, gap: spacing.lg, paddingBottom: 80},

  searchCard: {
    backgroundColor: 'white', borderRadius: radius.md, padding: spacing.lg, ...shadow.card,
  },
  searchHint: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: spacing.sm},
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.cream2, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 2,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.ink,
    paddingVertical: spacing.sm + 2,
  },
  searchBtn: {
    backgroundColor: colors.maroon, borderRadius: radius.md,
    paddingVertical: spacing.sm + 4, alignItems: 'center',
  },
  searchBtnDisabled: {backgroundColor: `${colors.maroon}55`},
  searchBtnText: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream},

  userCard: {
    backgroundColor: 'white', borderRadius: radius.md, padding: spacing.lg, ...shadow.card, gap: spacing.sm,
  },
  userTop: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs},
  userAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  userInitials: {fontFamily: fonts.display, fontSize: 20, color: colors.cream},
  userMeta: {flex: 1},
  userName: {fontFamily: fonts.display, fontSize: 18, color: colors.ink},
  userSub: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2},

  userStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.cream2, borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  userStatCell: {flex: 1, alignItems: 'center'},
  userStatDivider: {width: 1, height: 28, backgroundColor: `${colors.maroon}15`},
  userStatNum: {fontFamily: fonts.display, fontSize: 20, color: colors.maroon},
  userStatLabel: {fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 1},

  followBtn: {
    borderWidth: 1.5, borderColor: colors.maroon, borderRadius: radius.md,
    paddingVertical: spacing.sm + 2, alignItems: 'center',
  },
  followBtnActive: {backgroundColor: colors.maroon},
  followBtnText: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.maroon},
  followBtnTextActive: {color: colors.cream},

  viewProfileBtn: {
    borderWidth: 1.5, borderColor: `${colors.maroon}40`, borderRadius: radius.md,
    paddingVertical: spacing.sm + 2, alignItems: 'center',
  },
  viewProfileBtnText: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.maroon},

  groupBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.vermilion, borderRadius: radius.md,
    paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.md, justifyContent: 'center',
  },
  groupBtnText: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream},

  notFoundCard: {
    backgroundColor: 'white', borderRadius: radius.md, padding: spacing.lg, ...shadow.card,
    alignItems: 'center',
  },
  notFoundText: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink, marginBottom: 4},
  notFoundHint: {fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center'},

  tipCard: {
    backgroundColor: `${colors.maroon}08`, borderRadius: radius.md,
    padding: spacing.lg, borderWidth: 1, borderColor: `${colors.maroon}12`,
  },
  tipTitle: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.maroon, marginBottom: 6},
  tipBody: {fontFamily: fonts.body, fontSize: 13, color: colors.brown, lineHeight: 20},
});
