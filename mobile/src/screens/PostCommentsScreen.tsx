import React, {useState} from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, {Ellipse, Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import TempleGlyph from '../components/TempleGlyph';
import {colors, fonts, radius, shadow, spacing} from '../theme';
import {FeedStackParamList} from '../navigation/types';
import {useAuth} from '../auth/AuthContext';
import {MOCK_POSTS, Comment} from '../data/mockFeed';

type Props = NativeStackScreenProps<FeedStackParamList, 'PostComments'>;

export default function PostCommentsScreen({route, navigation}: Props) {
  const {postId} = route.params;
  const {user} = useAuth();
  const insets = useSafeAreaInsets();
  const [lamped, setLamped] = useState(false);
  const [commentText, setCommentText] = useState('');

  const post = MOCK_POSTS.find(p => p.id === postId) ?? MOCK_POSTS[0];
  const lampCount = post.lamps + (lamped ? 1 : 0);
  const userInitials = (user?.name ?? 'AR').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const isTrip = post.type === 'trip';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.backText}>‹  Post</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topFollowBtn}
          onPress={() => navigation.navigate('UserProfile', {userId: post.userId})}
        >
          <Text style={styles.topFollowBtnText}>View profile</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={post.comments}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <PostContent
            post={post}
            lamped={lamped}
            lampCount={lampCount}
            isTrip={isTrip}
            onLamp={() => setLamped(l => !l)}
            onPressAuthor={() => navigation.navigate('UserProfile', {userId: post.userId})}
          />
        }
        renderItem={({item}) => <CommentRow comment={item} />}
      />

      <View style={[styles.composer, {paddingBottom: insets.bottom + spacing.sm}]}>
        <View style={[styles.composerAvatar, {backgroundColor: colors.maroon}]}>
          <Text style={styles.composerInitials}>{userInitials}</Text>
        </View>
        <TextInput
          style={styles.composerInput}
          placeholder="Add a comment..."
          placeholderTextColor={colors.muted}
          value={commentText}
          onChangeText={setCommentText}
          returnKeyType="send"
          onSubmitEditing={() => setCommentText('')}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !commentText && styles.sendBtnDisabled]}
          onPress={() => setCommentText('')}
          disabled={!commentText}
          activeOpacity={0.85}
        >
          <SendIcon />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function PostContent({post, lamped, lampCount, isTrip, onLamp, onPressAuthor}: {
  post: typeof MOCK_POSTS[0];
  lamped: boolean;
  lampCount: number;
  isTrip: boolean;
  onLamp: () => void;
  onPressAuthor: () => void;
}) {
  return (
    <View style={styles.postBlock}>
      <View style={styles.authorRow}>
        <TouchableOpacity onPress={onPressAuthor} activeOpacity={0.7}>
          <View style={[styles.authorAvatar, {backgroundColor: post.userColor}]}>
            <Text style={styles.authorInitials}>{post.userInitials}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{flex: 1}} onPress={onPressAuthor} activeOpacity={0.7}>
          <Text style={styles.authorName}>{post.userName}</Text>
          <Text style={styles.authorSub}>
            {isTrip ? `→ going to ${post.temple}` : `✓ checked in · ${post.temple}`} · {post.timeAgo}
          </Text>
        </TouchableOpacity>
      </View>

      {!isTrip && (
        <View style={styles.postPhoto}>
          <TempleGlyph size={44} color={`${colors.maroon}28`} />
          <View style={styles.photoLabel}>
            <Text style={styles.photoLabelText}>{post.temple} · {post.place}</Text>
          </View>
        </View>
      )}

      <Text style={styles.caption}>{post.caption}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.lampBtn, lamped && styles.lampBtnLit]}
          onPress={onLamp}
          activeOpacity={0.85}
        >
          <FlameIcon lit={lamped} />
          <Text style={styles.lampBtnText}>
            {isTrip ? `Bless this yatra · ${lampCount}` : `Light a diya · ${lampCount}`}
          </Text>
        </TouchableOpacity>
        <View style={styles.commentCountPill}>
          <Text style={styles.commentCountText}>💬 {post.comments.length}</Text>
        </View>
      </View>

      <Text style={styles.commentsSectionTitle}>Comments</Text>
    </View>
  );
}

function CommentRow({comment}: {comment: Comment}) {
  return (
    <View style={styles.commentCard}>
      <View style={[styles.commentAvatar, {backgroundColor: comment.color}]}>
        <Text style={styles.commentInitials}>{comment.initials}</Text>
      </View>
      <View style={styles.commentBody}>
        <Text style={styles.commentName}>{comment.name}</Text>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>{comment.timeAgo}</Text>
          <TouchableOpacity><Text style={styles.commentAction}>Reply</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.commentAction}>Light · {comment.lights}</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FlameIcon({lit}: {lit: boolean}) {
  return (
    <Svg width={15} height={20} viewBox="0 0 24 28">
      <Ellipse cx="12" cy="25" rx="7" ry="2.4" fill={lit ? colors.gold : colors.cream} />
      <Path d="M12 4 C 15.5 9.5,16 13,12 16 C 8 13,8.5 9.5,12 4 Z" fill={lit ? colors.saffron : colors.cream} />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={colors.cream} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream},

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.inkTint06,
  },
  backBtn: {flexDirection: 'row', alignItems: 'center'},
  backText: {fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.maroon},
  topFollowBtn: {
    borderWidth: 1.5, borderColor: colors.maroon, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2, paddingVertical: 5,
  },
  topFollowBtnText: {fontFamily: fonts.bodySemi, fontSize: 12, color: colors.maroon},

  list: {paddingBottom: 24},

  postBlock: {padding: spacing.lg},
  authorRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md},
  authorAvatar: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  authorInitials: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream},
  authorName: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink},
  authorSub: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2},

  postPhoto: {
    height: 200, backgroundColor: colors.cream2, borderRadius: radius.md,
    marginBottom: spacing.md, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  photoLabel: {
    position: 'absolute', bottom: 10, left: 12,
    backgroundColor: 'rgba(251,244,230,0.9)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  photoLabelText: {fontSize: 10, color: colors.muted},

  caption: {fontFamily: fonts.body, fontSize: 13, color: colors.brown, lineHeight: 20, marginBottom: spacing.md},

  actionsRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg},
  lampBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.vermilion, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: 9,
  },
  lampBtnLit: {backgroundColor: colors.vermilionHi},
  lampBtnText: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream},
  commentCountPill: {
    backgroundColor: colors.cream2, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2, paddingVertical: 9,
  },
  commentCountText: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.brown},

  commentsSectionTitle: {fontFamily: fonts.bodySemi, fontSize: 16, color: colors.ink},

  commentCard: {
    flexDirection: 'row', gap: spacing.sm,
    backgroundColor: colors.cream, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderTopWidth: 1, borderTopColor: colors.inkTint06,
  },
  commentAvatar: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  commentInitials: {fontFamily: fonts.bodySemi, fontSize: 12, color: colors.cream},
  commentBody: {flex: 1},
  commentName: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink},
  commentText: {fontFamily: fonts.body, fontSize: 13, color: colors.brown, lineHeight: 19, marginTop: 2},
  commentMeta: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs + 2},
  commentTime: {fontFamily: fonts.body, fontSize: 11, color: colors.muted},
  commentAction: {fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.muted},

  composer: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm + 2,
    backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.inkTint06,
  },
  composerAvatar: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  composerInitials: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream},
  composerInput: {
    flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink,
    backgroundColor: colors.cream2, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: {backgroundColor: `${colors.maroon}55`},
});
