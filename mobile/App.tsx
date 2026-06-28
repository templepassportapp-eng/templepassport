import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useFonts, Marcellus_400Regular} from '@expo-google-fonts/marcellus';
import {Mukta_300Light, Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold, Mukta_700Bold} from '@expo-google-fonts/mukta';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

import {colors, fonts} from './src/theme';
import {FeedStackParamList, HomeStackParamList, JourneyStackParamList, SearchStackParamList, YouStackParamList, TabParamList} from './src/navigation/types';
import {AuthProvider, useAuth} from './src/auth/AuthContext';
import {LanguageProvider, useLang} from './src/i18n/LanguageContext';

// Screens
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import LoginScreen             from './src/screens/LoginScreen';
import ProfileSetupScreen      from './src/screens/ProfileSetupScreen';
import HomeScreen         from './src/screens/HomeScreen';
import TimelineScreen     from './src/screens/TimelineScreen';
import CollectionsScreen  from './src/screens/CollectionsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import SearchScreen       from './src/screens/SearchScreen';
import TempleDetailScreen from './src/screens/TempleDetailScreen';
import CheckInScreen      from './src/screens/CheckInScreen';
import StampRevealScreen  from './src/screens/StampRevealScreen';
import BookingStayScreen  from './src/screens/BookingStayScreen';
import BookingJourneyScreen from './src/screens/BookingJourneyScreen';
import JourneyTimelineScreen from './src/screens/JourneyTimelineScreen';
import AddToJourneyScreen   from './src/screens/AddToJourneyScreen';
import SelectTempleScreen   from './src/screens/SelectTempleScreen';
import PassportScreen     from './src/screens/PassportScreen';
import FeedScreen           from './src/screens/FeedScreen';
import PostCommentsScreen   from './src/screens/PostCommentsScreen';
import UserProfileScreen    from './src/screens/UserProfileScreen';
import YatraGroupScreen     from './src/screens/YatraGroupScreen';
import GroupChatScreen      from './src/screens/GroupChatScreen';
import YouScreen            from './src/screens/YouScreen';

const HomeStack    = createNativeStackNavigator<HomeStackParamList>();
const SearchStack  = createNativeStackNavigator<SearchStackParamList>();
const JourneyStack = createNativeStackNavigator<JourneyStackParamList>();
const FeedStack    = createNativeStackNavigator<FeedStackParamList>();
const YouStack     = createNativeStackNavigator<YouStackParamList>();
const Tab          = createBottomTabNavigator<TabParamList>();

const stackOpts = {
  headerStyle:      {backgroundColor: colors.maroon},
  headerTintColor:  colors.cream,
  headerTitleStyle: {fontFamily: fonts.display, fontSize: 18} as any,
  contentStyle:     {backgroundColor: colors.cream},
};

function HomeTabNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackOpts}>
      <HomeStack.Screen name="Home"         component={HomeScreen}         options={{headerShown: false}} />
      <HomeStack.Screen name="Timeline"     component={TimelineScreen}     options={{title: 'Timeline'}} />
      <HomeStack.Screen name="Collections"  component={CollectionsScreen}  options={{title: 'Collections'}} />
      <HomeStack.Screen name="Achievements" component={AchievementsScreen} options={{title: 'Achievements'}} />
    </HomeStack.Navigator>
  );
}

function FeedTabNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{headerShown: false}}>
      <FeedStack.Screen name="Feed"         component={FeedScreen} />
      <FeedStack.Screen name="PostComments" component={PostCommentsScreen} />
      <FeedStack.Screen name="UserProfile"  component={UserProfileScreen} />
      <FeedStack.Screen name="YatraGroup"   component={YatraGroupScreen} />
    </FeedStack.Navigator>
  );
}

function SearchTabNavigator() {
  return (
    <SearchStack.Navigator screenOptions={stackOpts}>
      <SearchStack.Screen name="Search"         component={SearchScreen}         options={{headerShown: false}} />
      <SearchStack.Screen name="TempleDetail"   component={TempleDetailScreen}   options={{title: '', headerTransparent: true, headerTintColor: colors.cream}} />
      <SearchStack.Screen name="CheckIn"        component={CheckInScreen}        options={{title: 'Check In'}} />
      <SearchStack.Screen name="StampReveal"    component={StampRevealScreen}    options={{headerShown: false}} />
      <SearchStack.Screen name="BookingStay"    component={BookingStayScreen}    options={{title: 'Book a Stay'}} />
      <SearchStack.Screen name="BookingJourney" component={BookingJourneyScreen} options={{title: 'Book Journey'}} />
      <SearchStack.Screen name="UserProfile"    component={UserProfileScreen}    options={{headerShown: false}} />
      <SearchStack.Screen name="YatraGroup"     component={YatraGroupScreen}     options={{headerShown: false}} />
    </SearchStack.Navigator>
  );
}

function JourneyTabNavigator() {
  return (
    <JourneyStack.Navigator screenOptions={{headerShown: false}}>
      <JourneyStack.Screen name="JourneyTimeline" component={JourneyTimelineScreen} />
      <JourneyStack.Screen name="AddToJourney"    component={AddToJourneyScreen}    options={{presentation: 'modal'}} />
      <JourneyStack.Screen name="SelectTemple"    component={SelectTempleScreen}    options={{presentation: 'modal'}} />
    </JourneyStack.Navigator>
  );
}

function YouTabNavigator() {
  return (
    <YouStack.Navigator screenOptions={{headerShown: false}}>
      <YouStack.Screen name="You"          component={YouScreen} />
      <YouStack.Screen name="GroupChat"    component={GroupChatScreen} />
      <YouStack.Screen name="UserProfile"  component={UserProfileScreen} />
      <YouStack.Screen name="YatraGroup"   component={YatraGroupScreen} />
    </YouStack.Navigator>
  );
}

function TabIcon({name, focused}: {name: string; focused: boolean}) {
  const color = focused ? colors.maroon : `${colors.maroon}50`;
  const size  = 22;

  if (name === 'HomeTab')    return <HomeIcon       size={size} color={color} />;
  if (name === 'SearchTab')  return <SearchIcon     size={size} color={color} />;
  if (name === 'JourneyTab') return <JourneyIcon    size={size} color={color} />;
  if (name === 'PassportTab')return <PassportIcon   size={size} color={color} />;
  if (name === 'FeedTab')    return <FeedIcon       size={size} color={color} />;
  if (name === 'YouTab')     return <YouIcon        size={size} color={color} />;
  return null;
}

function AppInner() {
  const {user, loading: authLoading} = useAuth();
  const {t} = useLang();

  const [fontsLoaded, fontError] = useFonts({
    Marcellus_400Regular,
    Mukta_300Light, Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold, Mukta_700Bold,
  });
  const [langPicked, setLangPicked]   = useState<boolean | null>(null);
  const [profileDone, setProfileDone] = useState<boolean | null>(null);
  const [fontTimeout, setFontTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initial AsyncStorage read on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('tp_language'),
      AsyncStorage.getItem('tp_profile_done'),
    ])
      .then(([lang, pd]) => {
        setLangPicked(lang !== null);
        setProfileDone(pd === '1');
      })
      .catch(() => { setLangPicked(false); setProfileDone(false); });
  }, []);

  // Re-read per-user state whenever the logged-in user changes
  useEffect(() => {
    if (user) {
      Promise.all([
        AsyncStorage.getItem('tp_language'),
        AsyncStorage.getItem('tp_profile_done'),
      ])
        .then(([lang, pd]) => {
          setLangPicked(lang !== null);
          setProfileDone(pd === '1');
        })
        .catch(() => {});
    }
  }, [user?.userId]);

  const fontsReady = fontsLoaded || fontError != null || fontTimeout;
  const appReady   = fontsReady && langPicked !== null && profileDone !== null && !authLoading;

  if (!appReady) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream}}>
        <ActivityIndicator color={colors.maroon} size="large" />
      </View>
    );
  }

  // 1. Login first — if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // 2. Language selection — new users who haven't picked yet
  if (!langPicked) {
    return <LanguageSelectionScreen onDone={() => setLangPicked(true)} />;
  }

  // 3. Profile setup — new users who haven't set up yet
  if (!profileDone) {
    return <ProfileSetupScreen onDone={() => setProfileDone(true)} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.cream,
            borderTopColor: `${colors.maroon}15`,
            height: 64,
            paddingBottom: 8,
          },
          tabBarActiveTintColor:   colors.maroon,
          tabBarInactiveTintColor: `${colors.maroon}50`,
          tabBarLabelStyle: {fontFamily: fonts.bodyMedium, fontSize: 11, marginTop: 2},
          tabBarIcon: ({focused}) => <TabIcon name={route.name} focused={focused} />,
        })}>
        <Tab.Screen name="HomeTab"     component={HomeTabNavigator}   options={{tabBarLabel: t('home')}} />
        <Tab.Screen name="SearchTab"   component={SearchTabNavigator} options={{tabBarLabel: t('search')}} />
        <Tab.Screen name="JourneyTab"  component={JourneyTabNavigator} options={{tabBarLabel: t('journey')}} />
        <Tab.Screen name="PassportTab" component={PassportScreen}     options={{tabBarLabel: t('passport')}} />
        <Tab.Screen name="FeedTab"     component={FeedTabNavigator}   options={{tabBarLabel: t('feed')}} />
        <Tab.Screen name="YouTab"      component={YouTabNavigator}    options={{tabBarLabel: t('you')}} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </LanguageProvider>
  );
}

// ── SVG Tab icons ────────────────────────────────────────────────────────────

function HomeIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 4L21 12V20C21 20.6 20.6 21 20 21H15V15H9V21H4C3.4 21 3 20.6 3 20V12Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.8} />
      <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function JourneyIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 6h13M8 12h13M8 18h13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="4" cy="6"  r="1.5" fill={color} />
      <Circle cx="4" cy="12" r="1.5" fill={color} />
      <Circle cx="4" cy="18" r="1.5" fill={color} />
    </Svg>
  );
}

function PassportIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="11" r="3" stroke={color} strokeWidth={1.5} />
      <Path d="M8 17H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function FeedIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6H20M4 12H20M4 18H14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function YouIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.8} />
      <Path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
