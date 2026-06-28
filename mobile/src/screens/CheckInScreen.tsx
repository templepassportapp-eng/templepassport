import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, Easing, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {createCheckIn} from '../api/client';
import {getCurrentPosition} from '../location/getCurrentPosition';
import {DEFAULT_RADIUS_M, DEV_USER_ID} from '../config';
import {colors, fonts, radius, spacing} from '../theme';
import {SearchStackParamList} from '../navigation/types';
import TempleGlyph from '../components/TempleGlyph';
import {useAuth} from '../auth/AuthContext';

type Props = NativeStackScreenProps<SearchStackParamList, 'CheckIn'>;

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CheckInScreen({route, navigation}: Props) {
  const {user} = useAuth();
  const userId = user?.userId ?? DEV_USER_ID;
  const {temple} = route.params;
  const verifyRadius = temple.verificationRadius ?? DEFAULT_RADIUS_M;

  const [busy, setBusy]         = useState(false);
  const [checking, setChecking] = useState(true);
  const [inRange, setInRange]   = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const pulse = useRef(new Animated.Value(1)).current;

  // Pulse animation for in-range ring
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1.12, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1,    duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ])
    );
    if (inRange) anim.start();
    else anim.stop();
    return () => anim.stop();
  }, [inRange]);

  // Check location on mount
  useEffect(() => {
    (async () => {
      try {
        const pos = await getCurrentPosition();
        const d   = distanceMeters(pos.latitude, pos.longitude, temple.latitude, temple.longitude);
        setDistance(Math.round(d));
        setAccuracy(pos.accuracy ?? null);
        setInRange(d <= verifyRadius);
      } catch {
        setInRange(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const doCheckIn = async (withLocation: boolean) => {
    setBusy(true);
    try {
      let coords: {latitude: number; longitude: number} | undefined;
      if (withLocation) {
        try { coords = await getCurrentPosition(); } catch {}
      }
      await createCheckIn({
        userId,
        templeId: temple.id,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      navigation.replace('StampReveal', {
        templeName: temple.name,
        category: temple.category,
        visitCount: 1,
        collectionProgress: temple.category ? `1 of 12 ${temple.category}s` : undefined,
      });
    } catch {
      Alert.alert('Check-in failed', 'Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.root}>
        <Text style={styles.locatingText}>Checking your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Status label */}
      <Text style={[styles.statusLabel, inRange && styles.statusLabelIn]}>
        {inRange ? "YOU'RE HERE" : "A LITTLE CLOSER"}
      </Text>
      <Text style={styles.templeName}>{temple.name}</Text>

      {/* Radar ring */}
      <View style={styles.radarWrap}>
        {/* Outer ring */}
        <Animated.View style={[
          styles.outerRing,
          inRange ? styles.outerRingIn : styles.outerRingOut,
          inRange && {transform: [{scale: pulse}]},
        ]} />

        {/* Inner stamp circle */}
        <View style={[styles.innerCircle, inRange && styles.innerCircleIn]}>
          <TempleGlyph size={48} color={inRange ? colors.vermilion : `${colors.maroon}80`} />
        </View>

        {/* "You" dot */}
        <View style={[
          styles.youDot,
          inRange
            ? {bottom: '38%', right: '44%'}
            : {bottom: '18%', right: '18%'},
        ]}>
          <View style={[styles.youDotInner, inRange && styles.youDotIn]} />
        </View>
      </View>

      {/* Distance text */}
      {distance !== null && (
        <Text style={styles.distanceText}>
          {inRange
            ? `Within the grounds`
            : `You're ${distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`} away`}
        </Text>
      )}
      <Text style={styles.distanceSub}>
        {inRange
          ? 'Take a breath. When you\'re ready, light your stamp to mark this darshan.'
          : `Move within ${verifyRadius} m to check in.`}
      </Text>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.lightBtn, !inRange && styles.lightBtnDisabled]}
        disabled={!inRange || busy}
        onPress={() => doCheckIn(true)}
        activeOpacity={0.85}>
        <Text style={styles.lightBtnIcon}>🪔</Text>
        <Text style={styles.lightBtnText}>{busy ? 'Checking in…' : 'Light your stamp'}</Text>
      </TouchableOpacity>

      {/* Manual fallback */}
      <TouchableOpacity
        style={styles.manualBtn}
        disabled={busy}
        onPress={() => doCheckIn(false)}
        activeOpacity={0.7}>
        <Text style={styles.manualBtnText}>Check in without verification</Text>
      </TouchableOpacity>

      {accuracy !== null && distance !== null && (
        <Text style={styles.accuracyText}>
          ±{Math.round(accuracy)} m accuracy · {inRange ? `${verifyRadius - distance} m inside the ${verifyRadius} m radius ✓` : `${verifyRadius} m radius`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: spacing.xl},
  locatingText: {fontFamily: fonts.body, fontSize: 15, color: colors.muted},

  statusLabel: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.sm},
  statusLabelIn: {color: colors.green},
  templeName: {fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: spacing.xl, textAlign: 'center'},

  radarWrap: {width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl, position: 'relative'},
  outerRing: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    borderWidth: 1.5,
  },
  outerRingOut: {borderColor: `${colors.maroon}30`, backgroundColor: `${colors.maroon}04`},
  outerRingIn:  {borderColor: `${colors.green}60`,  backgroundColor: `${colors.green}08`},
  innerCircle: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderColor: `${colors.maroon}40`,
    backgroundColor: `${colors.maroon}06`,
    alignItems: 'center', justifyContent: 'center',
  },
  innerCircleIn: {borderColor: colors.vermilion, backgroundColor: `${colors.vermilion}08`},

  youDot: {position: 'absolute'},
  youDotInner: {width: 12, height: 12, borderRadius: 6, backgroundColor: colors.maroon, borderWidth: 2, borderColor: 'white'},
  youDotIn: {backgroundColor: colors.green},

  distanceText: {fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginBottom: spacing.sm, textAlign: 'center'},
  distanceSub: {fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19, marginBottom: spacing.xl, paddingHorizontal: spacing.lg},

  lightBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.vermilion, borderRadius: radius.pill,
    paddingVertical: 16, paddingHorizontal: 36, marginBottom: spacing.md,
    shadowColor: colors.vermilion, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  lightBtnDisabled: {backgroundColor: `${colors.maroon}40`, shadowOpacity: 0},
  lightBtnIcon: {fontSize: 18},
  lightBtnText: {fontFamily: fonts.bodySemi, fontSize: 16, color: 'white'},

  manualBtn: {marginBottom: spacing.lg},
  manualBtnText: {fontFamily: fonts.body, fontSize: 13, color: colors.muted, textDecorationLine: 'underline'},
  accuracyText: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center'},
});
