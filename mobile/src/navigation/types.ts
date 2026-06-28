import {Temple} from '../types';

export type RootParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type JourneyStackParamList = {
  JourneyTimeline: undefined;
  AddToJourney: {selectedTempleId?: string} | undefined;
  SelectTemple: {selectedTempleId?: string};
};

export type HomeStackParamList = {
  Home: undefined;
  Timeline: undefined;
  Collections: undefined;
  Achievements: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
  TempleDetail: {temple: Temple};
  CheckIn: {temple: Temple};
  StampReveal: {templeName: string; category?: string; visitCount?: number; collectionProgress?: string};
  BookingStay: {templeName: string; templeState?: string};
  BookingJourney: {templeName: string; templeState?: string};
  UserProfile: {userId: string};
  YatraGroup: {groupId?: string; initiatorId?: string; templeName?: string};
};

export type FeedStackParamList = {
  Feed: undefined;
  PostComments: {postId: string};
  UserProfile: {userId: string};
  YatraGroup: {groupId?: string; initiatorId?: string; templeName?: string};
};

export type YouStackParamList = {
  You: undefined;
  GroupChat: {
    groupId: string;
    groupName: string;
    groupLabel: string;
    members: {id: string; initials: string; color: string; name: string}[];
  };
  UserProfile: {userId: string};
  YatraGroup: {groupId?: string; initiatorId?: string; templeName?: string};
};

export type TabParamList = {
  HomeTab:     undefined;
  SearchTab:   undefined;
  JourneyTab:  undefined;
  PassportTab: undefined;
  FeedTab:     undefined;
  YouTab:      undefined;
};
