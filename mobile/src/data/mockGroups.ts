export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  groupLabel: string;
  fromName: string;
  fromInitials: string;
  fromColor: string;
  membersCount: number;
}

export interface GroupMember {
  id: string;
  initials: string;
  color: string;
  name: string;
  status: 'accepted' | 'pending' | 'declined';
}

export interface MyGroup {
  id: string;
  name: string;
  label: string;
  members: GroupMember[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  templeName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  text: string;
  time: string;
  isOwn?: boolean;
}

// Mock phone-number → userId lookup for user search
export const PHONE_TO_USER_ID: Record<string, string> = {
  '9876543210': 'user-1',  // Aarav Sharma
  '9123456789': 'user-2',  // Meera Iyer
  '9012345678': 'user-3',  // Kavin Raj
};

export const MOCK_GROUP_INVITES: GroupInvite[] = [
  {
    id: 'inv-1',
    groupId: 'grp-2',
    groupName: 'Badrinath Yatra',
    groupLabel: 'CHAR DHAM YATRA',
    fromName: 'Kavin Raj',
    fromInitials: 'KR',
    fromColor: '#C5341C',
    membersCount: 17,
  },
];

export const MOCK_MY_GROUPS: MyGroup[] = [
  {
    id: 'grp-1',
    name: 'Maharashtra Jyotirlinga',
    label: 'JYOTIRLINGA YATRA',
    templeName: 'Bhimashankar',
    members: [
      {id: 'you',     initials: 'AR', color: '#C49A3A', name: 'You',   status: 'accepted'},
      {id: 'user-1',  initials: 'AS', color: '#6B1A2C', name: 'Aarav', status: 'accepted'},
      {id: 'user-2',  initials: 'MI', color: '#1F5E4A', name: 'Meera', status: 'accepted'},
      {id: 'user-dp', initials: 'DP', color: '#1F8A5B', name: 'Dev',   status: 'accepted'},
    ],
    lastMessage: 'You: Shall we plan for January?',
    lastMessageTime: '2h',
    unreadCount: 0,
  },
];

export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'grp-1': [
    {
      id: 'm1', senderId: 'user-1', senderName: 'Aarav Sharma',
      senderInitials: 'AS', senderColor: '#6B1A2C',
      text: "Who's confirming for Maharashtra next month?", time: '10:30 AM',
    },
    {
      id: 'm2', senderId: 'user-dp', senderName: 'Dev Patel',
      senderInitials: 'DP', senderColor: '#1F8A5B',
      text: "I'm in! Planning to fly to Pune on the 15th.", time: '10:35 AM',
    },
    {
      id: 'm3', senderId: 'user-2', senderName: 'Meera Iyer',
      senderInitials: 'MI', senderColor: '#1F5E4A',
      text: "Same. Bhimashankar first, then Trimbakeshwar?", time: '10:42 AM',
    },
    {
      id: 'm4', senderId: 'user-1', senderName: 'Aarav Sharma',
      senderInitials: 'AS', senderColor: '#6B1A2C',
      text: "Yes! And we'll split expenses here as we go 🙏", time: '11:05 AM',
    },
    {
      id: 'm5', senderId: 'you', senderName: 'You',
      senderInitials: 'AR', senderColor: '#C49A3A',
      text: 'Shall we plan for January?', time: '2h ago', isOwn: true,
    },
  ],
  'grp-2': [
    {
      id: 'm1', senderId: 'user-3', senderName: 'Kavin Raj',
      senderInitials: 'KR', senderColor: '#C5341C',
      text: "Badrinath doors open in May — let's plan early!", time: '1h',
    },
    {
      id: 'm2', senderId: 'user-3', senderName: 'Kavin Raj',
      senderInitials: 'KR', senderColor: '#C5341C',
      text: 'Who all are confirmed so far?', time: '1h',
    },
  ],
};
