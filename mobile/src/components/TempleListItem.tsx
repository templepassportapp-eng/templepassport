import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Temple} from '../types';
import {colors, radius, spacing} from '../theme';

interface Props {
  temple: Temple;
  onPress: (temple: Temple) => void;
}

export default function TempleListItem({temple, onPress}: Props) {
  const location = [temple.city, temple.state].filter(Boolean).join(', ');
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(temple)}
      activeOpacity={0.7}>
      <View style={styles.thumb}>
        <Text style={styles.thumbText}>{temple.name.charAt(0)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {temple.name}
        </Text>
        {!!location && (
          <Text style={styles.sub} numberOfLines={1}>
            {location}
          </Text>
        )}
        {!!temple.deity && (
          <Text style={styles.deity} numberOfLines={1}>
            {temple.deity}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  thumbText: {color: colors.primaryText, fontSize: 18, fontWeight: '600'},
  body: {flex: 1},
  name: {fontSize: 16, fontWeight: '600', color: colors.text},
  sub: {fontSize: 13, color: colors.textMuted, marginTop: 2},
  deity: {fontSize: 12, color: colors.accent, marginTop: 2},
});
