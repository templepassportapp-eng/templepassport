import React from 'react';
import {Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SearchStackParamList} from '../navigation/types';
import TempleGlyph from '../components/TempleGlyph';
import {colors, fonts, radius, shadow, spacing} from '../theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'TempleDetail'>;

const ESSENTIALS = [
  {id: '1', title: 'Insulated trek jacket', url: 'https://www.amazon.in'},
  {id: '2', title: 'Trekking poles, pair',  url: 'https://www.amazon.in'},
  {id: '3', title: '20,000mAh power bank',  url: 'https://www.amazon.in'},
];

export default function TempleDetailScreen({route, navigation}: Props) {
  const {temple} = route.params;

  const tags = [temple.category, 'trek required', 'forest', 'riverside'].filter(Boolean) as string[];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TempleGlyph size={100} color={`${colors.cream}60`} />
          {temple.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{temple.category}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{temple.name}</Text>
          <Text style={styles.subtitle}>
            {[temple.deity, temple.city, temple.state].filter(Boolean).join(' · ')}
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.tags}>
          {tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {temple.description && (
          <Text style={styles.description}>{temple.description}</Text>
        )}

        {/* Practical info */}
        <View style={styles.infoCard}>
          <InfoRow label="Hours"         value="4:30 am – 9:30 pm" />
          <InfoRow label="Dress code"    value="Modest · covered shoulders" />
          <InfoRow label="Best season"   value="Aug – Feb" last />
        </View>

        {/* Trek advisory (if applicable) */}
        {tags.includes('trek required') && (
          <View style={styles.advisory}>
            <Text style={styles.advisoryText}>
              Trek advisory: 5–6 km forest trail to the sanctum — carry water and sturdy footwear.
            </Text>
          </View>
        )}

        {/* Booking CTAs */}
        <View style={styles.bookingRow}>
          <TouchableOpacity
            style={styles.bookStayBtn}
            onPress={() => navigation.navigate('BookingStay', {templeName: temple.name, templeState: temple.state})}
            activeOpacity={0.85}>
            <Text style={styles.bookStayTitle}>Book your stay</Text>
            <Text style={styles.bookStayFrom}>from ₹650 / night</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookJourneyBtn}
            onPress={() => navigation.navigate('BookingJourney', {templeName: temple.name, templeState: temple.state})}
            activeOpacity={0.85}>
            <Text style={styles.bookJourneyText}>Book your journey</Text>
            <Text style={styles.bookJourneyFrom}>trains · cabs · flights</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.affiliateNote}>
          Booking via our sites: we may earn a commission.
        </Text>

        {/* Yatra Essentials */}
        <View style={styles.essentialsHeader}>
          <Text style={styles.essentialsTitle}>Yatra Essentials</Text>
          <Text style={styles.affiliateTag}>affiliate</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.essentialsList}>
          {ESSENTIALS.map(e => (
            <View key={e.id} style={styles.essentialCard}>
              <View style={styles.essentialPhoto}>
                <View style={styles.essentialPhotoStripes} />
                <Text style={styles.essentialPhotoCaption}>product</Text>
              </View>
              <Text style={styles.essentialName} numberOfLines={2}>{e.title}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(e.url)} activeOpacity={0.8}>
                <Text style={styles.essentialLink}>View on Amazon ›</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.affiliateDisclosure}>
          ⓘ We may earn from qualifying Amazon purchases.
        </Text>

        {/* Bottom padding for sticky bar */}
        <View style={{height: 90}} />
      </ScrollView>

      {/* Sticky check-in bar */}
      <View style={styles.stickyBar}>
        <View style={styles.locationIcon}>
          <Text style={{fontSize: 16}}>📍</Text>
        </View>
        <TouchableOpacity
          style={styles.checkInBtn}
          onPress={() => navigation.navigate('CheckIn', {temple})}
          activeOpacity={0.85}>
          <Text style={styles.checkInText}>Check in to light your stamp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({label, value, last}: {label: string; value: string; last?: boolean}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream},
  content: {paddingBottom: spacing.xl},

  hero: {
    height: 200, backgroundColor: colors.maroon,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  categoryBadge: {
    position: 'absolute', top: spacing.lg, right: spacing.lg,
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: colors.goldLight,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryText: {fontFamily: fonts.body, fontSize: 9, color: colors.goldLight, textAlign: 'center', letterSpacing: 0.5},

  titleBlock: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm},
  name: {fontFamily: fonts.display, fontSize: 28, color: colors.ink, letterSpacing: 0.3},
  subtitle: {fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 3},

  tags: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md},
  tag: {borderWidth: 1, borderColor: `${colors.vermilion}40`, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4},
  tagText: {fontFamily: fonts.body, fontSize: 12, color: colors.vermilion},

  description: {fontFamily: fonts.body, fontSize: 13, color: colors.brown, lineHeight: 20, paddingHorizontal: spacing.lg, marginBottom: spacing.lg},

  infoCard: {marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.inkTint10, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.md},
  infoRow: {flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md},
  infoRowBorder: {borderBottomWidth: 1, borderBottomColor: colors.inkTint06},
  infoLabel: {fontFamily: fonts.body, fontSize: 13, color: colors.muted},
  infoValue: {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink},

  advisory: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderLeftWidth: 3, borderLeftColor: colors.saffron,
    backgroundColor: `${colors.saffron}18`, borderRadius: radius.sm,
    padding: spacing.md,
  },
  advisoryText: {fontFamily: fonts.body, fontSize: 13, color: colors.brownDeep, lineHeight: 19},

  bookingRow: {flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.xs},
  bookStayBtn: {
    flex: 1, backgroundColor: colors.maroon, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
  },
  bookStayTitle: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream},
  bookStayFrom: {fontFamily: fonts.body, fontSize: 11, color: `${colors.cream}80`, marginTop: 2},
  bookJourneyBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.maroon, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
  },
  bookJourneyText: {fontFamily: fonts.bodySemi, fontSize: 14, color: colors.maroon},
  bookJourneyFrom: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2},
  affiliateNote: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center', marginBottom: spacing.lg},

  essentialsHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm},
  essentialsTitle: {fontFamily: fonts.display, fontSize: 18, color: colors.ink},
  affiliateTag: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, borderWidth: 1, borderColor: colors.inkTint16, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2},

  essentialsList: {paddingLeft: spacing.lg, paddingRight: spacing.sm, gap: spacing.sm},
  essentialCard: {width: 120, backgroundColor: 'white', borderRadius: radius.md, overflow: 'hidden', ...shadow.card},
  essentialPhoto: {height: 80, backgroundColor: colors.cream2, alignItems: 'center', justifyContent: 'center'},
  essentialPhotoStripes: {...StyleSheet.absoluteFillObject, opacity: 0.4},
  essentialPhotoCaption: {fontFamily: 'monospace', fontSize: 9, color: colors.muted},
  essentialName: {fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.ink, padding: spacing.sm, paddingBottom: 4},
  essentialLink: {fontFamily: fonts.bodySemi, fontSize: 11, color: colors.vermilion, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm},

  affiliateDisclosure: {fontFamily: fonts.body, fontSize: 11, color: colors.muted, paddingHorizontal: spacing.lg, marginTop: spacing.sm},

  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.inkTint10,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.md,
  },
  locationIcon: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  checkInBtn: {
    flex: 1, backgroundColor: colors.maroon, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  checkInText: {fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream},
});
