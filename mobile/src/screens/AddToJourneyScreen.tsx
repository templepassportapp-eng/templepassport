import React, {useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Path, Rect} from 'react-native-svg';
import {JourneyStackParamList} from '../navigation/types';
import {colors, fonts, radius, shadow, spacing} from '../theme';

type Props = NativeStackScreenProps<JourneyStackParamList, 'AddToJourney'>;

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Mini calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({selected, onChange}: {selected: Date; onChange: (d: Date) => void}) {
  const [viewYear, setViewYear]   = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMo  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells     = Array.from({length: firstDay + daysInMo}, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else { setViewMonth(m => m - 1); }
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else { setViewMonth(m => m + 1); }
  }
  function select(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (d > today) return;
    onChange(d);
  }

  return (
    <View style={cal.wrap}>
      <View style={cal.nav}>
        <Pressable onPress={prevMonth} style={cal.navBtn} hitSlop={8}>
          <Text style={cal.navArrow}>‹</Text>
        </Pressable>
        <Text style={cal.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
        <Pressable onPress={nextMonth} style={cal.navBtn} hitSlop={8}>
          <Text style={cal.navArrow}>›</Text>
        </Pressable>
      </View>
      <View style={cal.dayRow}>
        {DAYS.map((d, i) => <Text key={i} style={cal.dayName}>{d}</Text>)}
      </View>
      <View style={cal.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={cal.cell} />;
          const cellDate  = new Date(viewYear, viewMonth, day);
          cellDate.setHours(0, 0, 0, 0);
          const isSel     = cellDate.getTime() === new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).getTime();
          const isFuture  = cellDate > today;
          return (
            <Pressable key={i} style={cal.cell} onPress={() => select(day)} disabled={isFuture}>
              <View style={[cal.dayCircle, isSel && cal.daySelected]}>
                <Text style={[cal.dayNum, isSel && cal.dayNumSelected, isFuture && cal.dayFuture]}>
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AddToJourneyScreen({navigation, route}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedTempleId, setSelectedTempleId] = useState<string | undefined>(route.params?.selectedTempleId);
  const [selectedTempleName, setSelectedTempleName] = useState('');
  const [selectedTempleSubtitle, setSelectedTempleSubtitle] = useState('');

  // Receive temple selection back from SelectTempleScreen via nav params
  useEffect(() => {
    if (route.params?.selectedTempleId) {
      setSelectedTempleId(route.params.selectedTempleId);
    }
  }, [route.params?.selectedTempleId]);

  const MOCK_TEMPLES: Record<string, {name: string; subtitle: string}> = {
    kedarnath:    {name: 'Kedarnath',       subtitle: 'Uttarakhand · Jyotirlinga'},
    kashi:        {name: 'Kashi Vishwanath',subtitle: 'Varanasi, Uttar Pradesh · Jyotirlinga'},
    somnath:      {name: 'Somnath',         subtitle: 'Gujarat · Jyotirlinga'},
    rameshwaram:  {name: 'Rameshwaram',     subtitle: 'Tamil Nadu · Jyotirlinga'},
    nageshwar:    {name: 'Nageshwar',       subtitle: 'Dwarka, Gujarat · Jyotirlinga'},
    grishneshwar: {name: 'Grishneshwar',    subtitle: 'Verul, Maharashtra · Jyotirlinga'},
  };

  useEffect(() => {
    if (selectedTempleId && MOCK_TEMPLES[selectedTempleId]) {
      setSelectedTempleName(MOCK_TEMPLES[selectedTempleId].name);
      setSelectedTempleSubtitle(MOCK_TEMPLES[selectedTempleId].subtitle);
    }
  }, [selectedTempleId]);

  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'});
  }, [selectedDate]);

  function onAdd() {
    if (!selectedTempleId) return;
    // TODO: call POST /api/journey with { templeId, visitDate, verificationType: 'SELF_REPORTED' }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
        <Text style={styles.title}>Add to journey</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Temple selector */}
        <Text style={styles.sectionLabel}>SELECT TEMPLE</Text>
        <Pressable
          style={[styles.templeCard, selectedTempleId && styles.templeCardSelected]}
          onPress={() => navigation.navigate('SelectTemple', {selectedTempleId})}>
          <View style={styles.templeIconCircle}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 3L2 9h2v10h16V9h2L12 3Z" fill={colors.gold} />
              <Path d="M10 19v-6h4v6" fill={colors.gold} opacity={0.6} />
            </Svg>
          </View>
          <View style={{flex: 1}}>
            {selectedTempleId ? (
              <>
                <Text style={styles.templeName}>{selectedTempleName}</Text>
                <Text style={styles.templeSub}>{selectedTempleSubtitle}</Text>
              </>
            ) : (
              <Text style={styles.templePlaceholder}>Select a temple</Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {/* Date picker */}
        <Text style={[styles.sectionLabel, {marginTop: spacing.xl}]}>CHECK-IN DATE</Text>
        <View style={styles.dateRow}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="18" rx="3" stroke={colors.maroon} strokeWidth={1.8} />
            <Path d="M3 9h18" stroke={colors.maroon} strokeWidth={1.8} />
            <Path d="M8 2v4M16 2v4" stroke={colors.maroon} strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <MiniCalendar selected={selectedDate} onChange={setSelectedDate} />

        {/* Info box */}
        <View style={styles.infoBox}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{marginTop: 2, flexShrink: 0}}>
            <Path d="M2 6l2.8 2.8L10 3.5" stroke={colors.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.infoText}>
            Check in <Text style={styles.bold}>on location</Text> and the temple is added here automatically with a{' '}
            <Text style={[styles.bold, {color: colors.green}]}>Verified</Text> seal. Manual entries stay unverified until your next visit.
          </Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <Pressable
        style={[styles.addBtn, !selectedTempleId && styles.addBtnDisabled]}
        onPress={onAdd}
        disabled={!selectedTempleId}>
        <Text style={styles.addBtnText}>Add to journey</Text>
      </Pressable>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.cream},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  closeBtn: {fontSize: 20, color: colors.maroon, fontFamily: fonts.body},
  title: {fontFamily: fonts.display, fontSize: 18, color: colors.maroon},
  body: {padding: spacing.lg, paddingBottom: spacing.xxl},
  sectionLabel: {
    fontFamily: fonts.bodySemi, fontSize: 11, color: colors.muted,
    letterSpacing: 1, marginBottom: spacing.sm,
  },
  templeCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, padding: spacing.md,
  },
  templeCardSelected: {borderColor: colors.maroon},
  templeIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.cream2, alignItems: 'center', justifyContent: 'center',
  },
  templeName: {fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text},
  templeSub: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2},
  templePlaceholder: {fontFamily: fonts.body, fontSize: 15, color: colors.muted},
  chevron: {fontSize: 22, color: colors.muted, lineHeight: 26},
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dateText: {fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text},
  infoBox: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start',
    backgroundColor: colors.cream2, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.goldLight,
  },
  infoText: {flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.brown, lineHeight: 20},
  bold: {fontFamily: fonts.bodyBold},
  addBtn: {
    backgroundColor: colors.maroon, borderRadius: radius.lg,
    paddingVertical: spacing.lg, alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    ...shadow.fab,
  },
  addBtnDisabled: {backgroundColor: `${colors.maroon}60`},
  addBtnText: {fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream},
});

const cal = StyleSheet.create({
  wrap: {backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border},
  nav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md},
  navBtn: {padding: spacing.xs},
  navArrow: {fontSize: 22, color: colors.maroon, fontFamily: fonts.body},
  monthLabel: {fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text},
  dayRow: {flexDirection: 'row', marginBottom: spacing.xs},
  dayName: {flex: 1, textAlign: 'center', fontFamily: fonts.bodySemi, fontSize: 12, color: colors.muted},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  cell: {width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center'},
  dayCircle: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  daySelected: {backgroundColor: colors.maroon},
  dayNum: {fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text},
  dayNumSelected: {color: colors.cream},
  dayFuture: {color: colors.border},
});
