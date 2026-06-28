import React, {useRef, useState} from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {colors, fonts, radius, spacing} from '../theme';
import {YouStackParamList} from '../navigation/types';
import {
  ChatMessage,
  MOCK_CHAT_MESSAGES,
} from '../data/mockGroups';

type Props = NativeStackScreenProps<YouStackParamList, 'GroupChat'>;

export default function GroupChatScreen({route, navigation}: Props) {
  const {groupId, groupName, groupLabel, members} = route.params;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_CHAT_MESSAGES[groupId] ?? []
  );
  const [text, setText] = useState('');

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: 'you',
      senderName: 'You',
      senderInitials: 'AR',
      senderColor: '#C49A3A',
      text: trimmed,
      time: 'just now',
      isOwn: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 80);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <Text style={styles.headerSub}>{members.length} members</Text>
        </View>
        <View style={{width: 24}} />
      </View>

      {/* Member avatar strip */}
      <View style={styles.membersStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersContent}>
          {members.map(m => (
            <View key={m.id} style={styles.memberChip}>
              <View style={[styles.memberAvatar, {backgroundColor: m.color}]}>
                <Text style={styles.memberInitials}>{m.initials}</Text>
              </View>
              <Text style={styles.memberName}>{m.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: false})}
        renderItem={({item}) => <MessageBubble msg={item} />}
      />

      {/* Composer */}
      <View style={[styles.composer, {paddingBottom: insets.bottom + spacing.sm}]}>
        <TextInput
          style={styles.composerInput}
          placeholder="Message..."
          placeholderTextColor={colors.muted}
          value={text}
          onChangeText={setText}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim()}
          activeOpacity={0.85}
        >
          <SendIcon />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({msg}: {msg: ChatMessage}) {
  if (msg.isOwn) {
    return (
      <View style={styles.rowRight}>
        <View style={styles.ownBubble}>
          <Text style={styles.ownText}>{msg.text}</Text>
          <Text style={styles.bubbleTime}>{msg.time}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.rowLeft}>
      <View style={[styles.senderAvatar, {backgroundColor: msg.senderColor}]}>
        <Text style={styles.senderInitials}>{msg.senderInitials}</Text>
      </View>
      <View style={styles.otherBubble}>
        <Text style={styles.senderName}>{msg.senderName}</Text>
        <Text style={styles.otherText}>{msg.text}</Text>
        <Text style={styles.bubbleTime}>{msg.time}</Text>
      </View>
    </View>
  );
}

function SendIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke={colors.cream} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream},

  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    backgroundColor: colors.maroon,
  },
  backText: {fontFamily: fonts.display, fontSize: 24, color: colors.cream, marginTop: 2},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {fontFamily: fonts.display, fontSize: 18, color: colors.cream},
  headerSub: {fontFamily: fonts.body, fontSize: 12, color: `${colors.goldLight}99`, marginTop: 2},

  membersStrip: {
    backgroundColor: colors.maroon,
    paddingBottom: spacing.md,
  },
  membersContent: {
    paddingHorizontal: spacing.lg, gap: spacing.md,
  },
  memberChip: {alignItems: 'center', gap: 4},
  memberAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: `${colors.goldLight}40`,
  },
  memberInitials: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream},
  memberName: {fontFamily: fonts.body, fontSize: 10, color: `${colors.goldLight}AA`},

  listContent: {padding: spacing.lg, gap: 2, paddingBottom: spacing.md},

  rowRight: {flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm},
  rowLeft: {flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.sm},

  ownBubble: {
    backgroundColor: colors.maroon, borderRadius: radius.md,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    maxWidth: '72%',
  },
  ownText: {fontFamily: fonts.body, fontSize: 14, color: colors.cream, lineHeight: 20},

  senderAvatar: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  senderInitials: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.cream},

  otherBubble: {
    backgroundColor: 'white', borderRadius: radius.md,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    maxWidth: '72%',
    shadowColor: colors.maroon, shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 1,
  },
  senderName: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.maroon, marginBottom: 2},
  otherText: {fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 20},
  bubbleTime: {fontFamily: fonts.body, fontSize: 10, color: `${colors.muted}`, marginTop: 3, textAlign: 'right'},

  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm + 2,
    backgroundColor: 'white', borderTopWidth: 1, borderTopColor: colors.inkTint06,
  },
  composerInput: {
    flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink,
    backgroundColor: colors.cream2, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: {backgroundColor: `${colors.maroon}55`},
});
