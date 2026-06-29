import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import {firebaseVerify} from '../api/client';
import {useAuth} from '../auth/AuthContext';
import TempleGlyph from '../components/TempleGlyph';
import {useLang} from '../i18n/LanguageContext';
import {colors, fonts, radius, spacing} from '../theme';

export default function LoginScreen() {
  const {login} = useAuth();
  const {t}     = useLang();

  const [step, setStep]                   = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone]                 = useState('');
  const [otp, setOtp]                     = useState('');
  const [busy, setBusy]                   = useState(false);
  const [countdown, setCountdown]         = useState(0);
  const [keepSigned, setKeepSigned]       = useState(true);
  const [confirmation, setConfirmation]   = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const phoneRef = useRef<TextInput>(null);
  const otpRef   = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 'otp') {
      setCountdown(30);
      timerRef.current = setInterval(() => {
        setCountdown(s => {
          if (s <= 1) { clearInterval(timerRef.current!); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && step === 'otp' && !busy) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert(t('invalidNumber'), t('invalidNumberMsg'));
      return;
    }
    setBusy(true);
    try {
      const result = await auth().signInWithPhoneNumber('+91' + digits);
      setConfirmation(result);
      setOtp('');
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 400);
    } catch {
      Alert.alert(t('errorTitle'), t('otpError'));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmation || otp.length !== 6) return;
    setBusy(true);
    try {
      const result = await confirmation.confirm(otp);
      const idToken = await result!.user.getIdToken();
      const res = await firebaseVerify(idToken);
      await login(res.token, {userId: res.userId, phone: res.phone, name: res.name}, res.isNewUser);
    } catch {
      Alert.alert(t('incorrectCode'), t('incorrectCodeMsg'));
      setOtp('');
      otpRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const formattedPhone = phone.replace(/(\d{5})(\d{5})/, '$1 $2');

  // ── Phone step ────────────────────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.glyphCircle}>
          <TempleGlyph size={36} color={colors.goldLight} />
        </View>

        <Text style={styles.title}>{t('enterMobile')}</Text>
        <Text style={styles.sub}>{t('enterMobileSub')}</Text>

        <View style={styles.phoneRow}>
          <View style={styles.countryBox}>
            <Text style={styles.countryText}>IN +91</Text>
          </View>
          <TextInput
            ref={phoneRef}
            style={styles.phoneInput}
            placeholder="98765 43210"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={t2 => setPhone(t2.replace(/\D/g, ''))}
            onSubmitEditing={handleSendOtp}
            returnKeyType="done"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, busy && styles.btnDisabled]}
          onPress={handleSendOtp}
          disabled={busy}
          activeOpacity={0.85}>
          {busy
            ? <ActivityIndicator color={colors.cream} />
            : <Text style={styles.primaryBtnText}>{t('getOtp')}</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => Alert.alert(t('comingSoon'), t('googleComingSoon'))}
          activeOpacity={0.8}>
          <Text style={styles.googleCircle}>G</Text>
          <Text style={styles.googleText}>{t('continueGoogle')}</Text>
        </TouchableOpacity>

        <Text style={styles.tos}>
          {t('termsNote')}
          <Text style={styles.tosLink}>{t('terms')}</Text>
          {t('and')}
          <Text style={styles.tosLink}>{t('privacy')}</Text>
          {t('periodEnd')}
        </Text>
      </KeyboardAvoidingView>
    );
  }

  // ── OTP step ──────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => { setStep('phone'); setOtp(''); setConfirmation(null); }}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <Text style={[styles.title, {marginTop: spacing.lg}]}>{t('verifyNumber')}</Text>
      <Text style={styles.sub}>
        {t('otpSentTo')}
        <Text style={styles.phoneHighlight}>+91 {formattedPhone}</Text>
        {'  '}
        <Text
          style={styles.editLink}
          onPress={() => { setStep('phone'); setOtp(''); setConfirmation(null); }}>
          {t('edit')}
        </Text>
      </Text>

      {/* 6 individual OTP boxes */}
      <TouchableOpacity
        style={styles.otpRow}
        onPress={() => otpRef.current?.focus()}
        activeOpacity={1}>
        {Array(6).fill(null).map((_, i) => {
          const char   = otp[i];
          const active = otp.length === i && !busy;
          return (
            <View
              key={i}
              style={[
                styles.otpBox,
                char   != null && styles.otpBoxFilled,
                active          && styles.otpBoxActive,
              ]}>
              <Text style={styles.otpChar}>{char ?? ''}</Text>
            </View>
          );
        })}
      </TouchableOpacity>

      {/* Hidden real input */}
      <TextInput
        ref={otpRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        caretHidden
        autoFocus
      />

      {/* Resend countdown */}
      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>{t('didntGet')}</Text>
        {countdown > 0
          ? <Text style={styles.resendCountdown}>
              {t('resendIn')}0:{countdown.toString().padStart(2, '0')}
            </Text>
          : <TouchableOpacity onPress={handleSendOtp} disabled={busy}>
              <Text style={styles.resendLink}>{t('resend')}</Text>
            </TouchableOpacity>}
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, (busy || otp.length < 6) && styles.btnDisabled]}
        onPress={handleVerifyOtp}
        disabled={busy || otp.length < 6}
        activeOpacity={0.85}>
        {busy
          ? <ActivityIndicator color={colors.cream} />
          : <Text style={styles.primaryBtnText}>{t('verifyContinue')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.keepRow}
        onPress={() => setKeepSigned(v => !v)}
        activeOpacity={0.7}>
        <View style={[styles.checkbox, keepSigned && styles.checkboxOn]}>
          {keepSigned && <Text style={styles.checkboxMark}>✓</Text>}
        </View>
        <Text style={styles.keepLabel}>{t('keepSigned')}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: colors.cream,
    paddingHorizontal: spacing.xl, justifyContent: 'center',
  },

  // Phone step
  glyphCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.maroon,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.display, fontSize: 26, color: colors.ink,
    marginBottom: spacing.sm, textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body, fontSize: 14, color: colors.muted,
    textAlign: 'center', lineHeight: 21, marginBottom: spacing.xl,
  },

  phoneRow:    {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  countryBox:  {
    paddingHorizontal: spacing.md, paddingVertical: 14,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.inkTint10,
    backgroundColor: colors.cream2, justifyContent: 'center',
  },
  countryText: {fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink},
  phoneInput:  {
    flex: 1, paddingHorizontal: spacing.md, paddingVertical: 14,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.inkTint10,
    backgroundColor: colors.cream2,
    fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.ink, letterSpacing: 1.5,
  },

  primaryBtn:     {
    backgroundColor: colors.maroon, borderRadius: radius.md,
    paddingVertical: 16, alignItems: 'center', marginBottom: spacing.md,
  },
  btnDisabled:    {opacity: 0.45},
  primaryBtnText: {fontFamily: fonts.display, fontSize: 16, color: colors.cream},

  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md, gap: spacing.sm},
  dividerLine:{flex: 1, height: 1, backgroundColor: colors.inkTint10},
  dividerText:{fontFamily: fonts.body, fontSize: 13, color: colors.muted},

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderWidth: 1.5, borderColor: colors.inkTint10, borderRadius: radius.md,
    paddingVertical: 14, marginBottom: spacing.xl,
  },
  googleCircle: {
    width: 22, height: 22, borderRadius: 11, textAlign: 'center',
    fontFamily: fonts.bodyBold, fontSize: 13, color: '#4285F4',
    lineHeight: 22,
  },
  googleText:  {fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink},

  tos:     {fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 16},
  tosLink: {color: colors.maroon, textDecorationLine: 'underline'},

  // OTP step
  backBtn:  {position: 'absolute', top: 52, left: spacing.xl, padding: spacing.sm},
  backArrow:{fontFamily: fonts.display, fontSize: 30, color: colors.ink},

  phoneHighlight:{fontFamily: fonts.bodySemi, color: colors.ink},
  editLink:      {fontFamily: fonts.bodySemi, color: colors.maroon},

  otpRow: {
    flexDirection: 'row', gap: spacing.sm,
    justifyContent: 'center', marginBottom: spacing.md,
  },
  otpBox: {
    width: 44, height: 52, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.inkTint10,
    backgroundColor: colors.cream2,
    alignItems: 'center', justifyContent: 'center',
  },
  otpBoxFilled: {backgroundColor: colors.cream, borderColor: colors.inkTint16},
  otpBoxActive: {borderColor: colors.vermilion, borderWidth: 2},
  otpChar:      {fontFamily: fonts.display, fontSize: 22, color: colors.ink},

  hiddenInput: {position: 'absolute', opacity: 0, width: 1, height: 1},

  resendRow:       {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl},
  resendLabel:     {fontFamily: fonts.body, fontSize: 13, color: colors.muted},
  resendCountdown: {fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted},
  resendLink:      {fontFamily: fonts.bodySemi, fontSize: 13, color: colors.maroon},

  keepRow:      {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, justifyContent: 'center'},
  checkbox:     {width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.inkTint16, alignItems: 'center', justifyContent: 'center'},
  checkboxOn:   {backgroundColor: colors.maroon, borderColor: colors.maroon},
  checkboxMark: {color: colors.cream, fontSize: 11, fontWeight: '700'},
  keepLabel:    {fontFamily: fonts.body, fontSize: 12, color: colors.muted},
});
