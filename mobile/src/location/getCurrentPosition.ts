import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function getCurrentPosition(): Promise<Coords> {
  const {status} = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }
  const pos = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.High});
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy ?? 0,
  };
}
