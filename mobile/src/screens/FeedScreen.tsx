import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Circle, Ellipse, Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import TempleGlyph from '../components/TempleGlyph';
import {colors, fonts, radius, shadow, spacing} from '../theme';
import {FeedStackParamList} from '../navigation/types';
import {useAuth} from '../auth/AuthContext';
import {MOCK_POSTS, MOCK_CURATED, Post} from '../data/mockFeed';

type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

type ListItem =
  | {type: 'post'; id: string; post: Post}
  | {type: 'curated'; id: 'curated'};

export default function FeedScreen({navigation}: Props) {
  const {user} = useAuth();
  const insets = useSafeAreaInsets();
  const initials = (user?.name ?? '').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'AR';

  const listData: ListItem[] = [
    ...MOCK_POSTS.map(p => ({type: 'post' as const, id: p.id, post: p})),
    {type: 'curated', id: 'curated'},
  ];

  return (
    <View style={styles.root}>
      <View style={[styles.header, {paddingTop: insets.top + 10}]}>
        <Text style={styles.headerTitle}>Sangha</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        ListHeaderComponent={<Composer initials={initials} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          if (item.type === 'curated') return <CuratedCard />;
          if (item.post.type === 'trip') {
            return (
              <TripCard
                post={item.post}
                onViewComments={() => navigation.navigate('PostComments', {postId: item.post.id})}
                onPressAuthor={() => navigation.navigate('UserProfile', {userId: item.post.userId})}
                onJoin={() => navigation.navigate('YatraGroup', {initiatorId: item.post.userId, templeName: item.post.temple})}
              />
            );
          }
          return (
            <PostCard
              post={item.post}
              onViewComments={() => navigation.navigate('PostComments', {postId: item.post.id})}
              onPressAuthor={() => navigation.navigate('UserProfile', {userId: item.post.userId})}
            />
          );
        }}
      />
    </View>
  );
}

function Composer({initials}: {initials: string}) {
  return (
    <View style={styles.composer}>
      <View style={[styles.composerAvatar, {backgroundColor: colors.maroon}]}>
        <Text style={styles.composerInitials}>{initials}</Text>
      </View>
      <Text style={styles.composerPlaceholder}>Share your darshan…</Text>
      <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7}>
        <CameraIcon />
      </TouchableOpacity>
    </View>
  );
}

function AuthorRow({post, followed, onFollow, onPressAuthor}: {
  post: Post;
  followed: boolean;
  onFollow: () => void;
  onPressAuthor: () => void;
}) {
  return (
    <View style={styles.authorRow}>
      <TouchableOpacity onPress={onPressAuthor} activeOpacity={0.7}>
        <View style={[styles.userAvatar, {backgroundColor: post.userColor}]}>
          <Text style={styles.userInitials}>{post.userInitials}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={{flex: 1}} onPress={onPressAuthor} activeOpacity={0.7}>
        <Text style={styles.authorName}>{post.userName}</Text>
        <Text style={styles.authorSub}>{post.temple} · {post.place} · {post.timeAgo}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.followBtn, followed && styles.followBtnActive]}
        onPress={onFollow}
        activeOpacity={0.8}
      >
        <Text style={[styles.followBtnText, followed && styles.followBtnTextActive]}>
          {followed ? '✓' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ActionRow({lamped, lampCount, commentCount, onLamp, onViewComments}: {
  lamped: boolean;
  lampCount: number;
  commentCount: number;
  onLamp: () => void;
  onViewComments: () => void;
}) {
  return (
    <View style={styles.actionsRow}>
      <TouchableOpacity style={[styles.actionPill, lamped && styles.actionPillLit]} onPress={onLamp} activeOpacity={0.8}>
        <FlameIcon lit={lamped} />
        <Text style={[styles.pillCount, lamped && styles.pillCountLit]}>{lampCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionPill} onPress={onViewComments} activeOpacity={0.8}>
        <CommentIcon />
        <Text style={styles.pillCount}>{commentCount}</Text>
      </TouchableOpacity>
      <View style={{flex: 1}} />
      <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
        <ShareIcon />
      </TouchableOpacity>
    </View>
  );
}

function PostCard({post, onViewComments, onPressAuthor}: {
  post: Post;
  onViewComments: () => void;
  onPressAuthor: () => void;
}) {
  const [lamped, setLamped] = useState(false);
  const [followed, setFollowed] = useState(false);
  const lampCount = post.lamps + (lamped ? 1 : 0);
  const firstComment = post.comments[0];

  return (
    <View style={styles.card}>
      <AuthorRow post={post} followed={followed} onFollow={() => setFollowed(f => !f)} onPressAuthor={onPressAuthor} />
      <View style={styles.checkinTag}>
        <Text style={styles.checkinTagText}>✓ checked in</Text>
      </View>

      <View style={styles.postPhoto}>
        <TempleGlyph size={36} color={`${colors.maroon}28`} />
        <View style={styles.photoLabel}>
          <Text style={styles.photoLabelText}>{post.temple} · {post.place}</Text>
        </View>
      </View>

      <Text style={styles.caption}>{post.caption}</Text>

      <ActionRow
        lamped={lamped} lampCount={lampCount}
        commentCount={post.comments.length}
        onLamp={() => setLamped(l => !l)} onViewComments={onViewComments}
      />

      {firstComment && (
        <>
          <Text style={styles.commentPreview} numberOfLines={1}>
            <Text style={styles.commentAuthor}>{firstComment.name.split(' ')[0]}</Text>
            {'  '}{firstComment.text}
          </Text>
          <TouchableOpacity onPress={onViewComments}>
            <Text style={styles.viewAllComments}>View all {post.comments.length} comments</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function TripCard({post, onViewComments, onPressAuthor, onJoin}: {
  post: Post;
  onViewComments: () => void;
  onPressAuthor: () => void;
  onJoin: () => void;
}) {
  const [lamped, setLamped] = useState(false);
  const [followed, setFollowed] = useState(false);
  const lampCount = post.lamps + (lamped ? 1 : 0);
  const firstComment = post.comments[0];

  return (
    <View style={styles.card}>
      <AuthorRow post={post} followed={followed} onFollow={() => setFollowed(f => !f)} onPressAuthor={onPressAuthor} />
      <View style={styles.tripTag}>
        <Text style={styles.tripTagText}>→ going to {post.temple}</Text>
      </View>

      {/* Others going row */}
      <View style={styles.othersRow}>
        <Text style={styles.othersText}>
          <Text style={styles.othersCount}>{post.othersCount}</Text> others going
        </Text>
        <TouchableOpacity style={styles.joinBtn} onPress={onJoin} activeOpacity={0.85}>
          <Text style={styles.joinBtnText}>Join yatra</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.caption}>{post.caption}</Text>

      <ActionRow
        lamped={lamped} lampCount={lampCount}
        commentCount={post.comments.length}
        onLamp={() => setLamped(l => !l)} onViewComments={onViewComments}
      />

      {firstComment && (
        <>
          <Text style={styles.commentPreview} numberOfLines={1}>
            <Text style={styles.commentAuthor}>{firstComment.name.split(' ')[0]}</Text>
            {'  '}{firstComment.text}
          </Text>
          <TouchableOpacity onPress={onViewComments}>
            <Text style={styles.viewAllComments}>View all {post.comments.length} comments</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function CuratedCard() {
  return (
    <View style={styles.curatedCard}>
      <View style={styles.curatedIcon}>
        <TempleGlyph size={28} color={colors.goldLight} />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.curatedLabel}>{MOCK_CURATED.sub}</Text>
        <Text style={styles.curatedTitle}>{MOCK_CURATED.title}</Text>
      </View>
      <Text style={styles.curatedArrow}>›</Text>
    </View>
  );
}

function FlameIcon({lit}: {lit: boolean}) {
  return (
    <Svg width={14} height={18} viewBox="0 0 24 28">
      <Ellipse cx="12" cy="25" rx="7" ry="2.4" fill={lit ? colors.gold : colors.muted} />
      <Path d="M12 4 C 15.5 9.5,16 13,12 16 C 8 13,8.5 9.5,12 4 Z" fill={lit ? colors.saffron : colors.muted} />
    </Svg>
  );
}

function CommentIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15C21 15.5 20.8 16 20.4 16.4C20 16.8 19.5 17 19 17H7L3 21V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V15Z" stroke={colors.muted} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke={colors.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 6l-4-4-4 4M12 2v13" stroke={colors.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CameraIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={colors.muted} strokeWidth={1.6} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={colors.muted} strokeWidth={1.6} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream2},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    backgroundColor: colors.cream2,
  },
  headerTitle: {fontFamily: fonts.display, fontSize: 26, color: colors.ink},
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', ...shadow.fab,
  },
  addBtnText: {fontFamily: fonts.bodySemi, fontSize: 24, color: colors.cream, lineHeight: 28},

  list: {paddingBottom: 100},

  composer: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.cream, borderRadius: radius.md, padding: spacing.sm + 2, ...shadow.card,
  },
  composerAvatar: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  composerInitials: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream},
  composerPlaceholder: {flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.muted},
  cameraBtn: {padding: 4},

  card: {
    backgroundColor: colors.cream, marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, padding: spacing.md, ...shadow.card,
  },
  authorRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs},
  userAvatar: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  userInitials: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream},
  authorName: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink},
  authorSub: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 1},

  followBtn: {
    borderWidth: 1.5, borderColor: colors.maroon, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 4, minWidth: 60, alignItems: 'center',
  },
  followBtnActive: {backgroundColor: colors.maroon, borderColor: colors.maroon},
  followBtnText: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.maroon},
  followBtnTextActive: {color: colors.cream},

  checkinTag: {
    alignSelf: 'flex-start', backgroundColor: `${colors.green}18`,
    borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, marginBottom: spacing.sm,
  },
  checkinTagText: {fontFamily: fonts.bodySemi, fontSize: 10, color: colors.green},

  tripTag: {
    alignSelf: 'flex-start', backgroundColor: `${colors.saffron}22`,
    borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, marginBottom: spacing.sm,
  },
  tripTagText: {fontFamily: fonts.bodySemi, fontSize: 10, color: '#B87A00'},

  othersRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.inkTint06,
    paddingVertical: spacing.sm, marginBottom: spacing.sm,
  },
  othersText: {fontFamily: fonts.body, fontSize: 13, color: colors.brown},
  othersCount: {fontFamily: fonts.bodySemi, color: colors.ink},
  joinBtn: {
    backgroundColor: colors.vermilion, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: 7,
  },
  joinBtnText: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream},

  postPhoto: {
    height: 160, backgroundColor: colors.cream2, borderRadius: radius.sm + 2,
    marginBottom: spacing.md, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  photoLabel: {
    position: 'absolute', bottom: 8, left: 10,
    backgroundColor: 'rgba(251,244,230,0.88)', borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  photoLabelText: {fontSize: 9, color: colors.muted},

  caption: {fontFamily: fonts.body, fontSize: 13, color: colors.brown, marginBottom: spacing.md, lineHeight: 19},

  actionsRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm},
  actionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.cream2, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 5,
  },
  actionPillLit: {backgroundColor: `${colors.vermilion}15`},
  pillCount: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted},
  pillCountLit: {color: colors.vermilion},
  shareBtn: {padding: 4},

  commentPreview: {fontFamily: fonts.body, fontSize: 13, color: colors.brown, marginBottom: 3},
  commentAuthor: {fontFamily: fonts.bodySemi, color: colors.ink},
  viewAllComments: {fontFamily: fonts.body, fontSize: 12, color: colors.muted},

  curatedCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.maroon, marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, padding: spacing.md,
  },
  curatedIcon: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  curatedLabel: {fontFamily: fonts.bodySemi, fontSize: 10, color: colors.goldLight, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3},
  curatedTitle: {fontFamily: fonts.display, fontSize: 15, color: colors.cream},
  curatedArrow: {fontFamily: fonts.display, fontSize: 22, color: colors.goldLight},
});
