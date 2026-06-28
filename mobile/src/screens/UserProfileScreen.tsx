import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Circle, Ellipse, Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import TempleGlyph from '../components/TempleGlyph';
import {colors, fonts, radius, shadow, spacing} from '../theme';
import {MOCK_USERS, MOCK_POSTS, Post} from '../data/mockFeed';

type Props = NativeStackScreenProps<any, 'UserProfile'>;

export default function UserProfileScreen({route, navigation}: Props) {
  const {userId} = route.params;
  const insets = useSafeAreaInsets();
  const [followed, setFollowed] = useState(false);

  const profileUser = MOCK_USERS[userId];
  const userPosts = MOCK_POSTS.filter(p => p.userId === userId);

  if (!profileUser) return null;

  return (
    <View style={styles.root}>
      {/* Fixed maroon top bar */}
      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
        <View style={{width: 32}} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 80}}>
        {/* Maroon profile hero */}
        <View style={styles.hero}>
          <View style={[styles.heroAvatar, {backgroundColor: profileUser.color}]}>
            <Text style={styles.heroInitials}>{profileUser.initials}</Text>
          </View>
          <Text style={styles.heroName}>{profileUser.name}</Text>
          <Text style={styles.heroPilgrim}>Pilgrim since {profileUser.pilgrimSince} · {profileUser.path}</Text>

          {/* Stats row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStatCell}>
              <Text style={styles.heroStatNum}>{profileUser.templesVisited}</Text>
              <Text style={styles.heroStatLabel}>temples{'\n'}visited</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatCell}>
              <Text style={styles.heroStatNum}>{profileUser.setsInProgress}</Text>
              <Text style={styles.heroStatLabel}>sets in{'\n'}progress</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatCell}>
              <Text style={styles.heroStatNum}>{profileUser.statesCovered}</Text>
              <Text style={styles.heroStatLabel}>states{'\n'}covered</Text>
            </View>
          </View>
        </View>

        {/* Diya tile + follow */}
        <View style={styles.actionCard}>
          <View style={styles.diyaCell}>
            <DivaIcon />
            <View>
              <Text style={styles.diyaNum}>{profileUser.diyas}</Text>
              <Text style={styles.diyaLabel}>Diyas lit</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.followBtn, followed && styles.followBtnActive]}
            onPress={() => setFollowed(f => !f)}
            activeOpacity={0.85}
          >
            <Text style={[styles.followBtnText, followed && styles.followBtnTextActive]}>
              {followed ? '✓ Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Start Yatra Group CTA */}
        <TouchableOpacity
          style={styles.groupCta}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('YatraGroup', {initiatorId: userId})}
        >
          <GroupIcon />
          <Text style={styles.groupCtaText}>Start a Yatra Group with {profileUser.name.split(' ')[0]}</Text>
          <Text style={styles.groupCtaArrow}>›</Text>
        </TouchableOpacity>

        {/* Their posts */}
        {userPosts.length > 0 && (
          <>
            <Text style={styles.postsHeader}>Posts</Text>
            {userPosts.map(post => (
              <MiniPostCard
                key={post.id}
                post={post}
                onPress={() => navigation.navigate('PostComments', {postId: post.id})}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function MiniPostCard({post, onPress}: {post: Post; onPress: () => void}) {
  const isTrip = post.type === 'trip';
  return (
    <TouchableOpacity style={styles.miniCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.miniCardLeft}>
        <View style={[styles.miniTag, isTrip ? styles.miniTagTrip : styles.miniTagCheckin]}>
          <Text style={[styles.miniTagText, isTrip ? styles.miniTagTextTrip : styles.miniTagTextCheckin]}>
            {isTrip ? `→ ${post.temple}` : `✓ ${post.temple}`}
          </Text>
        </View>
        <Text style={styles.miniCaption} numberOfLines={2}>{post.caption}</Text>
        <Text style={styles.miniMeta}>{post.place} · {post.timeAgo} · 🪔 {post.lamps}</Text>
      </View>
      {!isTrip && (
        <View style={styles.miniThumb}>
          <TempleGlyph size={22} color={`${colors.maroon}30`} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function DivaIcon() {
  return (
    <Svg width={22} height={28} viewBox="0 0 24 28">
      <Ellipse cx="12" cy="25" rx="7" ry="2.4" fill={colors.gold} />
      <Path d="M12 4 C 15.5 9.5,16 13,12 16 C 8 13,8.5 9.5,12 4 Z" fill={colors.saffron} />
    </Svg>
  );
}

function GroupIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="4" stroke={colors.cream} strokeWidth={1.8} />
      <Path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={colors.cream} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M19 11v6M16 14h6" stroke={colors.cream} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream},

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    backgroundColor: colors.maroon,
  },
  backText: {fontFamily: fonts.display, fontSize: 24, color: colors.cream},
  topBarTitle: {fontFamily: fonts.display, fontSize: 18, color: colors.cream},

  scroll: {flex: 1},

  hero: {
    backgroundColor: colors.maroon,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl + 8,
    alignItems: 'center',
  },
  heroAvatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  heroInitials: {fontFamily: fonts.display, fontSize: 24, color: colors.cream},
  heroName: {fontFamily: fonts.display, fontSize: 22, color: colors.cream, marginBottom: 4},
  heroPilgrim: {fontFamily: fonts.body, fontSize: 12, color: `${colors.goldLight}99`, marginBottom: spacing.lg},

  heroStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    width: '100%',
  },
  heroStatCell: {flex: 1, alignItems: 'center'},
  heroStatDivider: {width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)'},
  heroStatNum: {fontFamily: fonts.display, fontSize: 26, color: colors.goldLight},
  heroStatLabel: {fontFamily: fonts.body, fontSize: 10, color: `${colors.goldLight}80`, textAlign: 'center', marginTop: 2},

  actionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: spacing.lg, marginTop: -spacing.xl,
    backgroundColor: colors.cream, borderRadius: radius.md, padding: spacing.md, ...shadow.card,
    marginBottom: spacing.md,
  },
  diyaCell: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  diyaNum: {fontFamily: fonts.display, fontSize: 22, color: colors.ink},
  diyaLabel: {fontFamily: fonts.body, fontSize: 11, color: colors.muted},

  followBtn: {
    borderWidth: 1.5, borderColor: colors.maroon, borderRadius: radius.pill,
    paddingHorizontal: spacing.lg, paddingVertical: 9, minWidth: 100, alignItems: 'center',
  },
  followBtnActive: {backgroundColor: colors.maroon},
  followBtnText: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.maroon},
  followBtnTextActive: {color: colors.cream},

  groupCta: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.vermilion, borderRadius: radius.md, padding: spacing.md,
  },
  groupCtaText: {flex: 1, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream},
  groupCtaArrow: {fontFamily: fonts.display, fontSize: 20, color: `${colors.cream}CC`},

  postsHeader: {
    fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  miniCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.cream, marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    borderRadius: radius.md, padding: spacing.md, ...shadow.card,
  },
  miniCardLeft: {flex: 1},
  miniTag: {
    alignSelf: 'flex-start', borderRadius: radius.pill,
    paddingHorizontal: 7, paddingVertical: 2, marginBottom: spacing.xs,
  },
  miniTagCheckin: {backgroundColor: `${colors.green}18`},
  miniTagTrip: {backgroundColor: `${colors.saffron}22`},
  miniTagText: {fontFamily: fonts.bodySemi, fontSize: 10},
  miniTagTextCheckin: {color: colors.green},
  miniTagTextTrip: {color: '#B87A00'},
  miniCaption: {fontFamily: fonts.body, fontSize: 13, color: colors.brown, lineHeight: 19, marginBottom: 4},
  miniMeta: {fontFamily: fonts.body, fontSize: 11, color: colors.muted},
  miniThumb: {
    width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.cream2,
    marginLeft: spacing.sm, alignItems: 'center', justifyContent: 'center',
  },
});
