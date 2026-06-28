import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TempleGlyph from '../components/TempleGlyph';
import Stamp from '../components/Stamp';
import {colors, fonts, radius, spacing} from '../theme';

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({onDone}: Props) {
  const [index, setIndex]       = useState(0);
  const [interests, setInterests] = useState<string[]>(['Shaiva']);

  const isLast = index === 3;

  const goNext = async () => {
    if (!isLast) {
      setIndex(i => i + 1);
    } else {
      try { await AsyncStorage.setItem('onboarding_done', '1'); } catch {}
      onDone();
    }
  };

  const skip = async () => {
    try { await AsyncStorage.setItem('onboarding_done', '1'); } catch {}
    onDone();
  };

  const toggleInterest = (key: string) =>
    setInterests(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);

  return (
    <View style={styles.root}>
      <View style={styles.slide}>
        {/* Illustration */}
        <View style={styles.illustrationBox}>
          {index === 0 && <DiscoverIllustration />}
          {index === 1 && <VerifyIllustration />}
          {index === 2 && <CollectIllustration />}
          {index === 3 && <TempleGlyph size={80} color={colors.maroon} />}
        </View>

        {/* Copy */}
        <Text style={styles.title}>
          {index === 0 && 'Discover sacred sites\nacross India'}
          {index === 1 && 'Visit, then verify\non location'}
          {index === 2 && 'Collect them in\nyour passport'}
          {index === 3 && 'Choose your\npilgrimage path'}
        </Text>
        <Text style={styles.sub}>
          {index === 0 && 'From the twelve Jyotirlingas to hidden riverside shrines — gathered into one passport.'}
          {index === 1 && 'Check in within 750 m of the temple. Our servers confirm you were truly there.'}
          {index === 2 && 'Each verified visit lights a stamp. Complete sets to earn yatra milestones.'}
          {index === 3 && "Tell us what calls you — we'll highlight the right temples on your journey."}
        </Text>

        {/* Interest grid on last slide */}
        {index === 3 && (
          <InterestGrid selected={interests} onToggle={toggleInterest} />
        )}
      </View>

      {/* Bottom controls */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.nextText}>{isLast ? 'Begin your yatra' : 'Next'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skip} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Interest grid ─────────────────────────────────────────────────────────────

const INTERESTS = [
  {key: 'Shaiva',       sub: 'Shiva temples & Jyotirlingas'},
  {key: 'Vaishnava',   sub: 'Vishnu & Char Dham'},
  {key: 'Devi · Shakti', sub: 'Shakti Peethas & Devi shrines'},
  {key: 'General',     sub: 'All sacred sites'},
];

function InterestGrid({selected, onToggle}: {selected: string[]; onToggle: (k: string) => void}) {
  return (
    <View style={styles.grid}>
      {INTERESTS.map(i => {
        const active = selected.includes(i.key);
        return (
          <TouchableOpacity
            key={i.key}
            style={[styles.interestCard, active && styles.interestCardActive]}
            onPress={() => onToggle(i.key)}
            activeOpacity={0.8}>
            <TempleGlyph size={26} color={active ? colors.maroon : colors.muted} />
            <Text style={[styles.interestLabel, active && styles.interestLabelActive]}>{i.key}</Text>
            <Text style={styles.interestSub}>{i.sub}</Text>
            {active && (
              <View style={styles.check}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Illustrations ─────────────────────────────────────────────────────────────

function DiscoverIllustration() {
  return (
    <View style={styles.mapBox}>
      <Text style={styles.wordmark}>तीर्थ · TEMPLE PASSPORT</Text>
      <Text style={styles.mapCaption}>hypsometric map of India</Text>
      <View style={[styles.marker, {top: '28%', left: '38%', backgroundColor: colors.vermilion}]} />
      <View style={[styles.marker, {top: '50%', left: '58%', borderWidth: 2, borderColor: colors.gold, backgroundColor: 'transparent'}]} />
      <View style={[styles.marker, {top: '68%', left: '30%', borderWidth: 2, borderColor: colors.gold, backgroundColor: 'transparent'}]} />
    </View>
  );
}

function VerifyIllustration() {
  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
      <Circle cx="90" cy="90" r="82" stroke={colors.maroon} strokeWidth={1.5} strokeDasharray="5 4" fill={`${colors.maroon}06`} />
      <Circle cx="90" cy="90" r="52" stroke={colors.gold} strokeWidth={1.5} fill={`${colors.gold}08`} />
      <Circle cx="90" cy="90" r="30" stroke={colors.maroon} strokeWidth={2} fill={`${colors.maroon}10`} />
      <Path d="M90 52 C80 52 72 60 72 70 C72 84 90 102 90 102 C90 102 108 84 108 70 C108 60 100 52 90 52Z" fill={colors.maroon} />
      <Circle cx="90" cy="70" r="6" fill={colors.cream} />
    </Svg>
  );
}

function CollectIllustration() {
  return (
    <View style={styles.collectBox}>
      <View style={{transform: [{rotate: '-13deg'}, {translateX: -20}], zIndex: 1}}>
        <Stamp shape="circle" color={colors.vermilion} state="earned" size={70} />
      </View>
      <View style={{zIndex: 3}}>
        <Stamp shape="circle" color={colors.gold} state="earned" size={80} />
      </View>
      <View style={{transform: [{rotate: '13deg'}, {translateX: 20}], zIndex: 2}}>
        <Stamp shape="circle" color={colors.maroon} state="earned" size={70} />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:  {flex: 1, backgroundColor: colors.cream},
  slide: {flex: 1, paddingHorizontal: spacing.xl, paddingTop: 60, alignItems: 'center'},

  illustrationBox: {width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl},

  title: {fontFamily: fonts.display, fontSize: 30, color: colors.ink, textAlign: 'center', lineHeight: 38, marginBottom: spacing.md},
  sub:   {fontFamily: fonts.body,    fontSize: 15, color: colors.brown, textAlign: 'center', lineHeight: 22},

  bottom: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.xl},
  dots:   {flexDirection: 'row', gap: 6},
  dot:       {width: 6, height: 6, borderRadius: 3, backgroundColor: `${colors.maroon}30`},
  dotActive: {width: 22, height: 6, borderRadius: 3, backgroundColor: colors.maroon},
  nextBtn:  {backgroundColor: colors.maroon, borderRadius: radius.pill, paddingHorizontal: 28, paddingVertical: 14},
  nextText: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream},
  skip:     {alignSelf: 'center', paddingBottom: spacing.lg},
  skipText: {fontFamily: fonts.body, fontSize: 14, color: colors.muted},

  // Interest grid
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg, width: '100%'},
  interestCard: {
    width: '47%', padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.inkTint10, backgroundColor: 'white', gap: 4,
  },
  interestCardActive:  {borderColor: colors.maroon, borderWidth: 2},
  interestLabel:       {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.brown},
  interestLabelActive: {color: colors.maroon},
  interestSub:         {fontFamily: fonts.body, fontSize: 11, color: colors.muted, lineHeight: 15},
  check:     {position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center'},
  checkText: {color: colors.cream, fontSize: 10, fontWeight: '700'},

  // Discover illustration
  mapBox:     {width: '90%', height: 190, borderWidth: 1.5, borderColor: colors.inkTint16, borderStyle: 'dashed', borderRadius: radius.md, justifyContent: 'center', alignItems: 'center'},
  mapCaption: {fontFamily: 'monospace', fontSize: 11, color: colors.muted},
  wordmark:   {position: 'absolute', top: 14, fontFamily: fonts.display, fontSize: 13, color: colors.maroon, letterSpacing: 1},
  marker:     {position: 'absolute', width: 10, height: 10, borderRadius: 5},

  // Collect illustration
  collectBox: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center'},
});
