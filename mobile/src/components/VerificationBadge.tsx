import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {VerificationType} from '../types';
import {colors, radius} from '../theme';

export default function VerificationBadge({type}: {type: VerificationType}) {
  const verified = type === 'VERIFIED';
  return (
    <View
      style={[
        styles.pill,
        {backgroundColor: verified ? colors.verifiedBg : colors.selfReportedBg},
      ]}>
      <Text
        style={[
          styles.text,
          {color: verified ? colors.verified : colors.selfReported},
        ]}>
        {verified ? 'Verified visit' : 'Self-reported'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.lg,
  },
  text: {fontSize: 12, fontWeight: '600'},
});
