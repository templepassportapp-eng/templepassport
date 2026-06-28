import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useLang} from '../i18n/LanguageContext';
import {LangCode} from '../i18n/strings';
import {colors, fonts, radius, spacing} from '../theme';

const LANGUAGES: {code: LangCode; native: string; latin: string}[] = [
  {code: 'en', native: 'English', latin: 'English'},
  {code: 'hi', native: 'हिन्दी',   latin: 'Hindi'},
];

interface Props {onDone: () => void}

export default function LanguageSelectionScreen({onDone}: Props) {
  const {lang, setLang, t} = useLang();
  const [selected, setSelected] = useState<LangCode>(lang);

  const handleContinue = async () => {
    await setLang(selected);
    onDone();
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Text style={styles.wordmark}>तीर्थ · TEMPLE PASSPORT</Text>
        <Text style={styles.title}>{t('chooseLanguage')}</Text>
        <Text style={styles.sub}>{t('languageSub')}</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {LANGUAGES.map(lang => {
          const active = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.row, active && styles.rowActive]}
              onPress={() => setSelected(lang.code)}
              activeOpacity={0.7}>
              <View style={styles.rowLabels}>
                <Text style={styles.nativeText}>{lang.native}</Text>
                <Text style={styles.latinText}> {lang.latin}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioFilled]}>
                {active && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.btnText}>{t('continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream},

  top: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.lg,
  },
  wordmark: {
    fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.muted,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.sm,
  },
  title: {fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: spacing.xs},
  sub:   {fontFamily: fonts.body,    fontSize: 13, color: colors.muted},

  list:        {flex: 1},
  listContent: {paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md},

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md + 2, paddingHorizontal: spacing.md,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: 'transparent',
    marginBottom: spacing.sm, backgroundColor: colors.cream,
  },
  rowActive: {borderColor: colors.maroon},

  rowLabels:  {flex: 1, flexDirection: 'row', alignItems: 'baseline'},
  nativeText: {fontFamily: fonts.display, fontSize: 18, color: colors.ink},
  latinText:  {fontFamily: fonts.body,    fontSize: 13, color: colors.muted},

  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: colors.inkTint16,
    alignItems: 'center', justifyContent: 'center',
  },
  radioFilled: {backgroundColor: colors.maroon, borderColor: colors.maroon},
  checkMark:   {color: colors.cream, fontSize: 13, fontWeight: '700'},

  footer: {paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.md},
  btn: {
    backgroundColor: colors.maroon, borderRadius: radius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  btnText: {fontFamily: fonts.display, fontSize: 16, color: colors.cream},
});
