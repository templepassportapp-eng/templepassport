import React, {useState} from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {updateProfile} from '../api/client';
import {useAuth} from '../auth/AuthContext';
import {useLang} from '../i18n/LanguageContext';
import {colors, fonts, radius, spacing} from '../theme';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2,'0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

async function lookupPincode(pin: string): Promise<{city: string; state: string} | null> {
  try {
    const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const json = await res.json();
    if (json?.[0]?.Status === 'Success' && json[0].PostOffice?.length > 0) {
      const po = json[0].PostOffice[0];
      return {city: po.District, state: po.State};
    }
  } catch {}
  return null;
}

interface Props {onDone: () => void}

export default function ProfileSetupScreen({onDone}: Props) {
  const {user} = useAuth();
  const {t}    = useLang();

  const defaultName = user?.name === user?.phone ? '' : (user?.name ?? '');

  const [name, setName]           = useState(defaultName);
  const [date, setDate]           = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pincode, setPincode]     = useState('');
  const [city, setCity]           = useState('');
  const [state, setState]         = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError]     = useState('');
  const [busy, setBusy]           = useState(false);

  const handleDateChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  };

  const handlePincodeChange = async (pin: string) => {
    const digits = pin.replace(/\D/g, '').slice(0, 6);
    setPincode(digits);
    setPincodeError('');
    if (digits.length === 6) {
      setPincodeLoading(true);
      setCity('');
      setState('');
      const result = await lookupPincode(digits);
      setPincodeLoading(false);
      if (result) {
        setCity(result.city);
        setState(result.state);
      } else {
        setPincodeError('Pincode not found. Please enter city manually.');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('nameRequired'), t('nameRequiredMsg'));
      return;
    }
    setBusy(true);
    try {
      if (user?.userId) {
        await updateProfile(user.userId, {
          name:  name.trim(),
          city:  city.trim(),
          state: state.trim(),
        });
      }
      await AsyncStorage.setItem('tp_profile_done', '1');
      onDone();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t('saveError');
      Alert.alert(t('errorTitle'), msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>{t('setupPassport')}</Text>
        <Text style={styles.sub}>{t('setupSub')}</Text>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Svg width="90" height="90" viewBox="0 0 90 90">
              <Circle cx="45" cy="45" r="45" fill={colors.cream2} />
              {[...Array(8)].map((_, i) => (
                <Rect key={i} x={-90} y={i * 14 - 10} width="270" height="7"
                  fill={colors.gold} opacity="0.20" transform="rotate(-30 45 45)" />
              ))}
            </Svg>
          </View>
          <View style={styles.cameraBadge}>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Rect x="2" y="7" width="20" height="14" rx="2" fill={colors.cream} />
              <Circle cx="12" cy="14" r="4" fill={colors.maroon} />
              <Path d="M9 7l1.5-3h3L15 7" stroke={colors.cream} strokeWidth="1.5" strokeLinejoin="round" />
            </Svg>
          </View>
        </View>

        {/* Full name */}
        <FieldLabel label={t('fullName')} />
        <TextInput
          style={styles.input}
          placeholder={t('namePlaceholder')}
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          autoFocus
        />

        {/* Date of birth */}
        <FieldLabel label={t('dateOfBirth')} />
        <TouchableOpacity
          style={[styles.inputRow, date && styles.inputRowFilled]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}>
          <Text style={date ? styles.dateTextFilled : styles.dateTextPlaceholder}>
            {date ? formatDate(date) : 'DD-MMM-YYYY'}
          </Text>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="18" rx="2"
              stroke={date ? colors.maroon : colors.muted} strokeWidth="1.8" />
            <Path d="M3 9H21" stroke={date ? colors.maroon : colors.muted} strokeWidth="1.8" />
            <Path d="M8 2V6M16 2V6"
              stroke={date ? colors.maroon : colors.muted} strokeWidth="1.8" strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>

        {/* Android date picker */}
        {showPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={date ?? new Date(1992, 7, 14)}
            mode="date"
            display="calendar"
            themeVariant="light"
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={handleDateChange}
          />
        )}

        {/* iOS date picker — bottom modal */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPicker(false)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => { setDate(null); setShowPicker(false); }}>
                    <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalDone}>{t('done')}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={date ?? new Date(1992, 7, 14)}
                  mode="date"
                  display="spinner"
                  themeVariant="light"
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={handleDateChange}
                  style={{backgroundColor: colors.cream}}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Pincode → auto-fill city + state */}
        <FieldLabel label="PINCODE" />
        <View style={styles.pincodeRow}>
          <TextInput
            style={[styles.input, styles.pincodeInput]}
            placeholder="e.g. 400001"
            placeholderTextColor={colors.muted}
            value={pincode}
            onChangeText={handlePincodeChange}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
          />
          {pincodeLoading && (
            <ActivityIndicator color={colors.maroon} style={styles.pincodeSpinner} />
          )}
        </View>
        {pincodeError !== '' && (
          <Text style={styles.pincodeError}>{pincodeError}</Text>
        )}

        {/* City — auto-filled, editable */}
        <FieldLabel label={t('city')} />
        <TextInput
          style={[styles.input, city && styles.inputFilled]}
          placeholder="Auto-filled from pincode"
          placeholderTextColor={colors.muted}
          value={city}
          onChangeText={setCity}
          returnKeyType="next"
        />

        {/* State — auto-filled, editable */}
        <FieldLabel label="STATE" />
        <TextInput
          style={[styles.input, state && styles.inputFilled]}
          placeholder="Auto-filled from pincode"
          placeholderTextColor={colors.muted}
          value={state}
          onChangeText={setState}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <TouchableOpacity
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={handleSave}
          disabled={busy}
          activeOpacity={0.85}>
          {busy
            ? <ActivityIndicator color={colors.cream} />
            : <Text style={styles.btnText}>{t('saveContinue')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({label}: {label: string}) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  root:   {flex: 1, backgroundColor: colors.cream},
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl,
  },

  title: {fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: spacing.xs},
  sub:   {fontFamily: fonts.body,    fontSize: 13, color: colors.muted, marginBottom: spacing.xl},

  avatarWrap:   {alignSelf: 'center', marginBottom: spacing.xl, position: 'relative'},
  avatarCircle: {width: 90, height: 90, borderRadius: 45, overflow: 'hidden', backgroundColor: colors.cream2},
  cameraBadge:  {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.maroon,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.cream,
  },

  fieldLabel: {
    fontFamily: fonts.bodySemi, fontSize: 11, color: colors.brownDeep,
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginTop: spacing.md, marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.cream,
    borderWidth: 1.5, borderColor: colors.inkTint16, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    fontFamily: fonts.body, fontSize: 15, color: colors.ink,
  },
  inputFilled: {
    borderColor: colors.maroon, color: colors.ink,
  },

  // Date row
  inputRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: colors.inkTint16, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    backgroundColor: colors.cream,
  },
  inputRowFilled:      {borderColor: colors.maroon},
  dateTextFilled:      {fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink, flex: 1},
  dateTextPlaceholder: {fontFamily: fonts.body,       fontSize: 15, color: colors.muted, flex: 1},

  // Pincode
  pincodeRow:    {flexDirection: 'row', alignItems: 'center'},
  pincodeInput:  {flex: 1, letterSpacing: 3},
  pincodeSpinner:{marginLeft: spacing.sm},
  pincodeError:  {fontFamily: fonts.body, fontSize: 12, color: colors.vermilion, marginTop: spacing.xs},

  btn: {
    backgroundColor: colors.maroon, borderRadius: radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl,
  },
  btnDisabled: {opacity: 0.45},
  btnText:     {fontFamily: fonts.display, fontSize: 16, color: colors.cream},

  // iOS modal
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)'},
  modalSheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.inkTint10,
  },
  modalCancel: {fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.muted},
  modalDone:   {fontFamily: fonts.bodySemi,   fontSize: 15, color: colors.maroon},
});
