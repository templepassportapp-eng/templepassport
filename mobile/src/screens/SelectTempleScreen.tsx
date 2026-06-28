import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Circle, Path} from 'react-native-svg';
import {JourneyStackParamList} from '../navigation/types';
import {colors, fonts, radius, shadow, spacing} from '../theme';

type Props = NativeStackScreenProps<JourneyStackParamList, 'SelectTemple'>;

interface TempleOption {
  id: string;
  name: string;
  state: string;
  category: string;
  inJourney?: boolean;
  verified?: boolean;
}

const ALL_TEMPLES: TempleOption[] = [
  {id: 'kedarnath',    name: 'Kedarnath',        state: 'Uttarakhand',           category: 'Jyotirlinga'},
  {id: 'kashi',        name: 'Kashi Vishwanath',  state: 'Varanasi, Uttar Pradesh', category: 'Jyotirlinga'},
  {id: 'bhimashankar', name: 'Bhimashankar',      state: 'Maharashtra',           category: 'Jyotirlinga', inJourney: true, verified: true},
  {id: 'somnath',      name: 'Somnath',           state: 'Gujarat',               category: 'Jyotirlinga'},
  {id: 'rameshwaram',  name: 'Rameshwaram',       state: 'Tamil Nadu',            category: 'Jyotirlinga'},
  {id: 'nageshwar',    name: 'Nageshwar',         state: 'Dwarka, Gujarat',       category: 'Jyotirlinga'},
  {id: 'trimbakeshwar',name: 'Trimbakeshwar',     state: 'Nashik, Maharashtra',   category: 'Jyotirlinga', inJourney: true, verified: true},
  {id: 'mahakaleshwar',name: 'Mahakaleshwar',     state: 'Ujjain, Madhya Pradesh',category: 'Jyotirlinga', inJourney: true, verified: true},
  {id: 'omkareshwar',  name: 'Omkareshwar',       state: 'Madhya Pradesh',        category: 'Jyotirlinga', inJourney: true, verified: true},
  {id: 'grishneshwar', name: 'Grishneshwar',      state: 'Verul, Maharashtra',    category: 'Jyotirlinga', inJourney: true},
  {id: 'mallikarjuna', name: 'Mallikarjuna',      state: 'Andhra Pradesh',        category: 'Jyotirlinga'},
  {id: 'vaidyanath',   name: 'Vaidyanath',        state: 'Jharkhand',             category: 'Jyotirlinga'},
];

function TempleIcon() {
  return (
    <View style={styles.iconCircle}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3L2 9h2v10h16V9h2L12 3Z" fill={colors.gold} />
        <Path d="M10 19v-6h4v6" fill={colors.gold} opacity={0.6} />
      </Svg>
    </View>
  );
}

export default function SelectTempleScreen({navigation, route}: Props) {
  const [query, setQuery]           = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(route.params?.selectedTempleId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_TEMPLES;
    return ALL_TEMPLES.filter(t =>
      t.name.toLowerCase().includes(q) || t.state.toLowerCase().includes(q),
    );
  }, [query]);

  const selectedTemple = ALL_TEMPLES.find(t => t.id === selectedId);

  function onChoose() {
    if (!selectedId) return;
    navigation.navigate('AddToJourney', {selectedTempleId: selectedId});
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke={colors.maroon} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.title}>Select temple</Text>
        <View style={{width: 22}} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Circle cx="11" cy="11" r="7" stroke={colors.muted} strokeWidth={1.8} />
          <Path d="M16.5 16.5L21 21" stroke={colors.muted} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${ALL_TEMPLES.length} temples...`}
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={{paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const isSelected  = item.id === selectedId;
          const canSelect   = !item.inJourney;

          return (
            <Pressable
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => canSelect && setSelectedId(item.id)}
              disabled={item.inJourney && !isSelected}>
              <TempleIcon />
              <View style={styles.rowBody}>
                <Text style={styles.rowName}>{item.name}</Text>
                {item.inJourney ? (
                  <Text style={styles.inJourneyText}>
                    {`Already in journey${item.verified ? ' · verified' : ''}`}
                  </Text>
                ) : (
                  <Text style={styles.rowState}>{item.state}</Text>
                )}
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && (
                  <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                    <Path d="M2 6l2.8 2.8L10 3.5" stroke={colors.cream} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <Pressable
          style={[styles.chooseBtn, !selectedId && styles.chooseBtnDisabled]}
          onPress={onChoose}
          disabled={!selectedId}>
          <Text style={styles.chooseBtnText}>
            {selectedTemple ? `Choose ${selectedTemple.name}` : 'Choose temple'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.cream},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: {fontFamily: fonts.display, fontSize: 18, color: colors.maroon},
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, marginHorizontal: spacing.lg, marginTop: spacing.md,
    marginBottom: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  searchInput: {flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text, padding: 0},
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.lg, marginVertical: spacing.xs,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, padding: spacing.md,
  },
  rowSelected: {borderColor: colors.maroon},
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.cream2, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowBody: {flex: 1},
  rowName: {fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text},
  rowState: {fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2},
  inJourneyText: {fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.green, marginTop: 2},
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  radioSelected: {backgroundColor: colors.maroon, borderColor: colors.maroon},
  ctaWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.md,
    backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.border,
  },
  chooseBtn: {
    backgroundColor: colors.maroon, borderRadius: radius.lg,
    paddingVertical: spacing.lg, alignItems: 'center',
    ...shadow.fab,
  },
  chooseBtnDisabled: {backgroundColor: `${colors.maroon}60`},
  chooseBtnText: {fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream},
});
