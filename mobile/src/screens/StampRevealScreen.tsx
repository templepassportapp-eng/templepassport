import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SearchStackParamList} from '../navigation/types';
import Stamp from '../components/Stamp';
import {colors, fonts, radius, spacing} from '../theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'StampReveal'>;

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

export default function StampRevealScreen({route, navigation}: Props) {
  const {templeName, category, visitCount = 1, collectionProgress} = route.params;
  const glow  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {toValue: 1, tension: 50, friction: 6, useNativeDriver: true}),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {toValue: 1, duration: 1300, useNativeDriver: true}),
          Animated.timing(glow, {toValue: 0.4, duration: 1300, useNativeDriver: true}),
        ])
      ),
    ]).start();
  }, []);

  const ordinal = visitCount <= ORDINALS.length ? ORDINALS[visitCount - 1] : `${visitCount}th`;
  const glowOpacity = glow.interpolate({inputRange: [0, 1], outputRange: [0.3, 0.9]});

  return (
    <View style={styles.root}>
      {/* Ray burst */}
      <View style={styles.rayWrap} pointerEvents="none">
        {Array.from({length: 16}).map((_, i) => (
          <View
            key={i}
            style={[styles.ray, {transform: [{rotate: `${i * 22.5}deg`}]}]}
          />
        ))}
      </View>

      {/* Radial glow */}
      <Animated.View style={[styles.radialGlow, {opacity: glowOpacity}]} pointerEvents="none" />

      {/* "Stamp earned" label */}
      <Text style={styles.topLabel}>STAMP EARNED</Text>

      {/* Stamp */}
      <Animated.View style={{transform: [{scale}], marginBottom: spacing.xl}}>
        <Stamp
          shape="circle"
          color={colors.goldLight}
          state="earned"
          size={160}
          category={category?.toUpperCase() ?? 'TEMPLE'}
          name={templeName}
          date={new Date().toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}
        />
      </Animated.View>

      {/* Message */}
      <Text style={styles.headline}>
        Your {ordinal} lamp{'\n'}is lit
      </Text>
      {collectionProgress && (
        <Text style={styles.sub}>{collectionProgress} · {templeName} added</Text>
      )}

      {/* CTAs */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Create a postcard</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.popToTop()} activeOpacity={0.7}>
        <Text style={styles.secondaryBtn}>Add to passport</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#3A0E18',
    alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  rayWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 2, height: '70%',
    backgroundColor: 'rgba(196,154,58,0.08)',
    transformOrigin: 'center bottom',
  },
  radialGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Simulated radial glow via a centered blurred view
  },
  topLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.goldLight,
    letterSpacing: 2,
    marginBottom: spacing.xl,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(251,244,230,0.6)',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  primaryBtnText: {fontFamily: fonts.bodySemi, fontSize: 16, color: colors.ink},
  secondaryBtn: {fontFamily: fonts.body, fontSize: 14, color: 'rgba(251,244,230,0.6)'},
});
