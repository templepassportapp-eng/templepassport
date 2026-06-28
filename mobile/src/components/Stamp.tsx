import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Ellipse, Path, Polygon, Rect} from 'react-native-svg';
import TempleGlyph from './TempleGlyph';
import {colors, fonts} from '../theme';

export type StampShape = 'circle' | 'oval' | 'rectangle' | 'hexagon';
export type StampState = 'earned' | 'empty';

interface Props {
  shape?: StampShape;
  color?: string;
  name?: string;
  date?: string;
  category?: string;
  state?: StampState;
  size?: number;
}

const HEXAGON = '50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%';

export default function Stamp({
  shape = 'circle',
  color = colors.gold,
  name,
  date,
  category,
  state = 'empty',
  size = 80,
}: Props) {
  const earned = state === 'earned';
  const glyphColor = earned ? color : 'rgba(107,26,44,0.25)';
  const ringColor  = earned ? color : 'rgba(107,26,44,0.20)';
  const textColor  = earned ? color : 'rgba(107,26,44,0.30)';
  const bg         = earned ? `${color}18` : 'transparent';

  return (
    <View style={[styles.wrapper, {width: size, alignItems: 'center'}]}>
      <StampShape shape={shape} color={ringColor} bg={bg} size={size} earned={earned}>
        <TempleGlyph size={size * 0.42} color={glyphColor} />
      </StampShape>
      {category && (
        <Text style={[styles.category, {color: textColor, fontSize: size * 0.09}]} numberOfLines={1}>
          {category.toUpperCase()}
        </Text>
      )}
      {name && (
        <Text style={[styles.name, {color: earned ? colors.ink : 'rgba(74,18,32,0.3)', fontSize: size * 0.13}]} numberOfLines={2} textAlign="center">
          {name}
        </Text>
      )}
      {date && earned && (
        <Text style={[styles.date, {fontSize: size * 0.09}]}>{date}</Text>
      )}
    </View>
  );
}

function StampShape({shape, color, bg, size, earned, children}: {
  shape: StampShape; color: string; bg: string; size: number; earned: boolean; children: React.ReactNode;
}) {
  const inner = size * 0.88;
  const borderW = earned ? 2.5 : 1.5;

  const containerStyle = {
    width: size,
    height: shape === 'oval' ? size * 1.15 : size,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: bg,
    borderRadius:
      shape === 'circle'    ? size / 2 :
      shape === 'oval'      ? size / 2 :
      shape === 'rectangle' ? 8 : 0,
    borderWidth: borderW,
    borderColor: color,
    ...(shape === 'hexagon' ? {borderRadius: 0, borderWidth: 0} : {}),
  };

  if (shape === 'hexagon') {
    return (
      <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Polygon
            points="50,2 94,26 94,74 50,98 6,74 6,26"
            fill={bg}
            stroke={color}
            strokeWidth={borderW * 2}
            strokeDasharray={earned ? '0' : '4 3'}
          />
        </Svg>
        <View style={StyleSheet.absoluteFillObject as any} pointerEvents="none">
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[containerStyle, !earned && {borderStyle: 'dashed' as const}]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {gap: 3},
  category: {
    fontFamily: fonts.bodySemi,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 4,
  },
  name: {
    fontFamily: fonts.display,
    textAlign: 'center',
    lineHeight: 16,
  },
  date: {
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
