import React from 'react';
import Svg, {Circle, Line, Path, Rect} from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function TempleGlyph({size = 48, color = '#6B1A2C'}: Props) {
  // Scale strokeWidth relative to size
  const sw = (2.4 * size) / 64;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Line x1="32" y1="6" x2="32" y2="12" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <Circle cx="32" cy="15" r="2.6" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M32 18 L45 46 L19 46 Z" stroke={color} strokeWidth={sw} strokeLinejoin="round" fill="none" />
      <Rect x="15" y="46" width="34" height="7" stroke={color} strokeWidth={sw} fill="none" />
      <Path d="M28 53 L28 38 L36 38 L36 53" stroke={color} strokeWidth={sw} strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
