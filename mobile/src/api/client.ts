import axios from 'axios';
import {API_BASE_URL} from '../config';
import {Achievement, CheckIn, CheckInDetail, CheckInRequest, CollectionDetail, Temple, UserStats} from '../types';

export const api = axios.create({baseURL: API_BASE_URL, timeout: 10000});

export async function searchTemples(q: string): Promise<Temple[]> {
  const {data} = await api.get<Temple[]>('/temples/search', {params: {q}});
  return data;
}

export async function listTemples(params?: {q?: string; state?: string; category?: string}): Promise<Temple[]> {
  const {data} = await api.get<Temple[]>('/temples', {params});
  return data;
}

export async function getTemple(id: string): Promise<Temple> {
  const {data} = await api.get<Temple>(`/temples/${id}`);
  return data;
}

export async function createCheckIn(body: CheckInRequest): Promise<CheckIn> {
  const {data} = await api.post<CheckIn>('/checkins', body);
  return data;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const {data} = await api.get<UserStats>(`/users/${userId}/stats`);
  return data;
}

export async function getUserTimeline(userId: string): Promise<CheckInDetail[]> {
  const {data} = await api.get<CheckInDetail[]>(`/users/${userId}/checkins`);
  return data;
}

export async function getUserStamps(userId: string): Promise<CheckInDetail[]> {
  const {data} = await api.get<CheckInDetail[]>(`/users/${userId}/stamps`);
  return data;
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const {data} = await api.get<Achievement[]>(`/users/${userId}/achievements`);
  return data;
}

export async function getUserCollections(userId: string): Promise<CollectionDetail[]> {
  const {data} = await api.get<CollectionDetail[]>(`/users/${userId}/collections`);
  return data;
}

export async function updateProfile(userId: string, body: {name: string; city: string; state?: string}): Promise<void> {
  await api.patch(`/users/${userId}/profile`, body);
}

export async function firebaseVerify(idToken: string): Promise<{token: string; userId: string; phone: string; name: string; isNewUser: boolean}> {
  const {data} = await api.post('/auth/firebase-verify', {idToken});
  return data;
}
