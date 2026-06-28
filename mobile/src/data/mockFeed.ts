export interface Comment {
  id: string;
  initials: string;
  color: string;
  name: string;
  text: string;
  timeAgo: string;
  lights: number;
}

export interface Post {
  id: string;
  userId: string;
  type: 'checkin' | 'trip';
  userName: string;
  userInitials: string;
  userColor: string;
  temple: string;
  place: string;
  timeAgo: string;
  caption: string;
  lamps: number;
  comments: Comment[];
  othersCount?: number;
}

export interface MockUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  pilgrimSince: string;
  path: string;
  templesVisited: number;
  setsInProgress: number;
  statesCovered: number;
  diyas: number;
}

export const MOCK_USERS: Record<string, MockUser> = {
  'user-1': {
    id: 'user-1', name: 'Aarav Sharma', initials: 'AS', color: '#6B1A2C',
    pilgrimSince: 'Jan 2022', path: 'Shaiva path',
    templesVisited: 14, setsInProgress: 3, statesCovered: 6, diyas: 86,
  },
  'user-2': {
    id: 'user-2', name: 'Meera Iyer', initials: 'MI', color: '#1F5E4A',
    pilgrimSince: 'Mar 2021', path: 'Shakti path',
    templesVisited: 22, setsInProgress: 4, statesCovered: 9, diyas: 142,
  },
  'user-3': {
    id: 'user-3', name: 'Kavin Raj', initials: 'KR', color: '#C5341C',
    pilgrimSince: 'Jun 2023', path: 'Vaishnava path',
    templesVisited: 8, setsInProgress: 2, statesCovered: 4, diyas: 54,
  },
};

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: 'user-1',
    type: 'checkin',
    userName: 'Aarav Sharma',
    userInitials: 'AS',
    userColor: '#6B1A2C',
    temple: 'Kashi Vishwanath',
    place: 'Varanasi',
    timeAgo: '2h',
    caption: 'Mangala aarti at dawn — the ghats still dark, bells everywhere. My first darshan here and I have no words.',
    lamps: 48,
    comments: [
      {id: 'c1', initials: 'MI', color: '#1F5E4A', name: 'Meera Iyer', text: 'Har Har Mahadev! The energy at dawn is unreal there...', timeAgo: '1h', lights: 8},
      {id: 'c2', initials: 'DP', color: '#C5341C', name: 'Dev Patel', text: 'Adding this to my next yatra. Did you stay nearby?', timeAgo: '40m', lights: 2},
      {id: 'c3', initials: 'AR', color: '#7A1F2B', name: 'Ananya Rao', text: 'Yes — Anpurna inn, a 10-minute walk. Worth it.', timeAgo: '10m', lights: 4},
    ],
  },
  {
    id: '3',
    userId: 'user-3',
    type: 'trip',
    userName: 'Kavin Raj',
    userInitials: 'KR',
    userColor: '#C5341C',
    temple: 'Badrinath',
    place: 'Uttarakhand',
    timeAgo: '1h',
    caption: 'Planning a Char Dham yatra — starting with Badrinath. Already 16 souls joining! Come, let\'s walk this together.',
    lamps: 32,
    othersCount: 16,
    comments: [
      {id: 'c1', initials: 'AS', color: '#6B1A2C', name: 'Aarav Sharma', text: 'Count me in! When are you planning to leave?', timeAgo: '45m', lights: 5},
      {id: 'c2', initials: 'MI', color: '#1F5E4A', name: 'Meera Iyer', text: 'Adding my prayers for this yatra. Safe travels!', timeAgo: '30m', lights: 3},
    ],
  },
  {
    id: '2',
    userId: 'user-2',
    type: 'checkin',
    userName: 'Meera Iyer',
    userInitials: 'MI',
    userColor: '#1F5E4A',
    temple: 'Rameshwaram',
    place: 'Tamil Nadu',
    timeAgo: '5h',
    caption: 'Walked the 22 wells before darshan. Cold water, warm hearts.',
    lamps: 121,
    comments: [
      {id: 'c1', initials: 'AS', color: '#6B1A2C', name: 'Aarav Sharma', text: 'Har Har Mahadev! The energy at dawn is unreal there...', timeAgo: '4h', lights: 11},
    ],
  },
];

export const MOCK_CURATED = {
  title: 'Kedarnath opens in 14 days',
  sub: 'PREPARE FOR YOUR NEXT YATRA',
};

export const MOCK_GROUP = {
  name: 'Badrinath Yatra',
  label: 'CHAR DHAM YATRA',
  members: [
    {id: 'user-you', initials: 'AR', color: '#C49A3A', name: 'You'},
    {id: 'user-3',   initials: 'KR', color: '#C5341C', name: 'Kavin'},
    {id: 'user-1',   initials: 'AS', color: '#6B1A2C', name: 'Aarav'},
    {id: 'user-2',   initials: 'MI', color: '#1F5E4A', name: 'Meera'},
  ],
  owedTotal: 2850,
  memberBalances: [
    {id: 'user-3', initials: 'KR', color: '#C5341C', name: 'Kavin', amount: 1900, owesYou: true},
    {id: 'user-1', initials: 'AS', color: '#6B1A2C', name: 'Aarav', amount: 1250, owesYou: true},
    {id: 'user-2', initials: 'MI', color: '#1F5E4A', name: 'Meera', amount: 300,  owesYou: false},
  ],
  expenses: [
    {id: 'e1', payerInitials: 'AR', payerColor: '#C49A3A', payerName: 'You',   title: 'Hotel Badri Kedar', split: 4, amount: 7600},
    {id: 'e2', payerInitials: 'KR', payerColor: '#C5341C', payerName: 'Kavin', title: 'Shared cab from Rishikesh', split: 4, amount: 5200},
    {id: 'e3', payerInitials: 'MI', payerColor: '#1F5E4A', payerName: 'Meera', title: 'Prasad & puja thali', split: 4, amount: 1200},
  ],
};
