import React, {useState} from 'react';
import {Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SearchStackParamList} from '../navigation/types';
import {colors, fonts, radius, shadow, spacing} from '../theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'BookingJourney'>;

const MODES = ['Train', 'Flight', 'Cab'] as const;
type Mode = typeof MODES[number];

const MOCK_OPTIONS: Record<Mode, Array<{id: string; name: string; times: string; duration: string; price: string; merchant: string; url: string}>> = {
  Train: [
    {id: 't1', name: 'Mahakal Express', times: '06:05 → 14:30', duration: '8h 25m', price: '₹485', merchant: 'IRCTC', url: 'https://www.irctc.co.in'},
    {id: 't2', name: 'Avantika Express', times: '19:40 → 04:10', duration: '8h 30m', price: '₹350', merchant: 'IRCTC', url: 'https://www.irctc.co.in'},
  ],
  Flight: [
    {id: 'f1', name: 'IndiGo 6E-414', times: '07:15 → 08:35', duration: '1h 20m', price: '₹4,200', merchant: 'MakeMyTrip', url: 'https://www.makemytrip.com'},
    {id: 'f2', name: 'Air India AI-441', times: '14:00 → 15:25', duration: '1h 25m', price: '₹5,100', merchant: 'EaseMyTrip', url: 'https://www.easemytrip.com'},
  ],
  Cab: [
    {id: 'c1', name: 'Sedan (4 seater)', times: 'Flexible departure', duration: '~9h drive', price: '₹3,800', merchant: 'Redbus', url: 'https://www.redbus.in'},
  ],
};

export default function BookingJourneyScreen({route}: Props) {
  const {templeName, templeState} = route.params;
  const [mode, setMode] = useState<Mode>('Train');
  const options = MOCK_OPTIONS[mode];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* From ↔ To */}
      <View style={styles.routeCard}>
        <View style={styles.routeBox}>
          <Text style={styles.routeLabel}>FROM</Text>
          <Text style={styles.routeCity}>Mumbai</Text>
        </View>
        <Text style={styles.routeArrow}>⇄</Text>
        <View style={[styles.routeBox, {alignItems: 'flex-end'}]}>
          <Text style={styles.routeLabel}>TO</Text>
          <Text style={styles.routeCity}>{templeState ?? templeName}</Text>
        </View>
      </View>

      {/* Mode chips */}
      <View style={styles.chips}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, mode === m && styles.chipActive]}
            onPress={() => setMode(m)}
            activeOpacity={0.8}>
            <Text style={[styles.chipText, mode === m && styles.chipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Options */}
      {options.map(opt => (
        <View key={opt.id} style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.modeBadge}>{mode}</Text>
            <Text style={styles.optName}>{opt.name}</Text>
          </View>
          <View style={styles.timesRow}>
            <Text style={styles.times}>{opt.times}</Text>
            <Text style={styles.duration}>{opt.duration}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.price}>from <Text style={styles.priceAmount}>{opt.price}</Text></Text>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => Linking.openURL(opt.url)}
              activeOpacity={0.85}>
              <Text style={styles.viewBtnText}>View on {opt.merchant}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.disclosure}>
        Journey options are via partner booking sites. We may earn a commission — at no extra cost to you.{' '}
        <Text style={styles.disclosureLink}>Disclosure</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: colors.cream2},
  content: {paddingBottom: 60},

  routeCard: {
    flexDirection: 'row', alignItems: 'center', margin: spacing.lg,
    backgroundColor: colors.cream, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card,
  },
  routeBox: {flex: 1},
  routeLabel: {fontFamily: fonts.bodySemi, fontSize: 10, color: colors.muted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3},
  routeCity: {fontFamily: fonts.display, fontSize: 20, color: colors.ink},
  routeArrow: {fontFamily: fonts.display, fontSize: 22, color: colors.maroon, paddingHorizontal: spacing.md},

  chips: {flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  chip: {paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.inkTint16},
  chipActive: {backgroundColor: colors.maroon, borderColor: colors.maroon},
  chipText: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.brown},
  chipTextActive: {color: colors.cream},

  card: {backgroundColor: colors.cream, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadow.card},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  modeBadge: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.maroon, backgroundColor: `${colors.maroon}15`, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2},
  optName: {fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink},
  timesRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  times: {fontFamily: fonts.body, fontSize: 14, color: colors.brown},
  duration: {fontFamily: fonts.body, fontSize: 12, color: colors.muted},
  cardBottom: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  price: {fontFamily: fonts.body, fontSize: 13, color: colors.brown},
  priceAmount: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink},
  viewBtn: {backgroundColor: colors.vermilion, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  viewBtnText: {fontFamily: fonts.bodySemi, fontSize: 13, color: 'white'},

  disclosure: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg},
  disclosureLink: {color: colors.vermilion, textDecorationLine: 'underline'},
});
