import React from 'react';
import {Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SearchStackParamList} from '../navigation/types';
import {colors, fonts, radius, shadow, spacing} from '../theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'BookingStay'>;

const MOCK_STAYS = [
  {id: '1', name: 'Hotel Mahakal Stay',    distance: '400 m from temple', price: '₹2,200', rating: '4.4', merchant: 'MakeMyTrip',  url: 'https://www.makemytrip.com'},
  {id: '2', name: 'Anjushree Inn',          distance: '1.2 km · viewpoint', price: '₹3,650', rating: '4.0', merchant: 'Booking.com',  url: 'https://www.booking.com'},
  {id: '3', name: 'Shipra Dharamshala',    distance: '200 m · old city',  price: '₹650',   rating: '4.3', merchant: 'EaseMyTrip',   url: 'https://www.easemytrip.com'},
];

export default function BookingStayScreen({route}: Props) {
  const {templeName, templeState} = route.params;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Stays near {templeName}</Text>
        <Text style={styles.headerSub}>{[templeName, templeState].filter(Boolean).join(' · ')} · {MOCK_STAYS.length} options</Text>
      </View>

      {MOCK_STAYS.map(stay => (
        <View key={stay.id} style={styles.card}>
          {/* Photo placeholder */}
          <View style={styles.photo}>
            <View style={styles.photoStripes} />
            <Text style={styles.photoCaption}>Stay photo</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <Text style={styles.cardName}>{stay.name}</Text>
              <View style={styles.ratingChip}>
                <Text style={styles.ratingStar}>★ </Text>
                <Text style={styles.ratingText}>{stay.rating}</Text>
              </View>
            </View>
            <Text style={styles.distance}>{stay.distance}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.price}>from <Text style={styles.priceAmount}>{stay.price}</Text> / night</Text>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => Linking.openURL(stay.url)}
                activeOpacity={0.85}>
                <Text style={styles.viewBtnText}>View on {stay.merchant}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <Text style={styles.disclosure}>
        Stays are listed via partner sites. We may earn a commission on bookings — at no extra cost to you.{' '}
        <Text style={styles.disclosureLink}>Disclosure</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: colors.cream2},
  content: {paddingBottom: 60},
  headerRow: {padding: spacing.lg, paddingTop: spacing.xl},
  headerTitle: {fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 3},
  headerSub: {fontFamily: fonts.body, fontSize: 13, color: colors.muted},

  card: {backgroundColor: colors.cream, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card},

  photo: {height: 140, backgroundColor: colors.cream2, alignItems: 'center', justifyContent: 'center'},
  photoStripes: {...StyleSheet.absoluteFillObject, opacity: 0.4},
  photoCaption: {fontFamily: 'monospace', fontSize: 11, color: colors.muted},

  cardBody: {padding: spacing.md, gap: spacing.sm},
  cardTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  cardName: {fontFamily: fonts.display, fontSize: 16, color: colors.ink, flex: 1},
  ratingChip: {flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.green}20`, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3},
  ratingStar: {fontSize: 11, color: colors.green},
  ratingText: {fontFamily: fonts.bodySemi, fontSize: 12, color: colors.green},

  distance: {fontFamily: fonts.body, fontSize: 12, color: colors.muted},
  cardBottom: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  price: {fontFamily: fonts.body, fontSize: 13, color: colors.brown},
  priceAmount: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink},
  viewBtn: {backgroundColor: colors.vermilion, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  viewBtnText: {fontFamily: fonts.bodySemi, fontSize: 13, color: 'white'},

  disclosure: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg},
  disclosureLink: {color: colors.vermilion, textDecorationLine: 'underline'},
});
