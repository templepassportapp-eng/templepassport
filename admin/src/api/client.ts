import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = import.meta.env.PROD ? '/admin/login' : '/login';
    }
    return Promise.reject(err);
  }
);

// ── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalTemples: number;
  totalCheckIns: number;
  totalPosts: number;
  totalGroups: number;
  activeGroups: number;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  joinedAt: string;
  templesVisited: number;
  blocked: boolean;
  lastActive?: string;
}

export interface TempleCategory {
  key: string;
  label: string;
  color: string;
  isCustom: boolean;
}

export interface Temple {
  id: string;
  name: string;
  deity?: string;
  city: string;
  district?: string;
  state: string;
  pincode?: string;
  categories: string[];
  latitude: number;
  longitude: number;
  verificationRadius?: number;
  description?: string;
  enabled: boolean;
  createdAt?: string;
}

export interface Affiliate {
  id: string;
  name: string;
  type: 'STAY' | 'JOURNEY' | 'YATRA_ESSENTIALS';
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  commissionPct?: number;
  enabled: boolean;
  createdAt: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy?: string;
  category: 'SOCIAL' | 'DISCOVERY' | 'COMMERCE' | 'CORE';
}

// ── Mock data (replace with real API calls when backend ready) ───────────────

export const MOCK_STATS: DashboardStats = {
  totalUsers: 247,
  newUsersThisWeek: 34,
  newUsersThisMonth: 118,
  totalTemples: 89,
  totalCheckIns: 1423,
  totalPosts: 312,
  totalGroups: 28,
  activeGroups: 11,
};

export const MOCK_USERS: AdminUser[] = [
  { id: 'u1', name: 'Aarav Sharma', phone: '+91 98765 43210', city: 'Mumbai', state: 'Maharashtra', joinedAt: '2026-01-12', templesVisited: 14, blocked: false, lastActive: '2h ago' },
  { id: 'u2', name: 'Meera Iyer', phone: '+91 91234 56789', city: 'Chennai', state: 'Tamil Nadu', joinedAt: '2026-01-18', templesVisited: 9, blocked: false, lastActive: '1d ago' },
  { id: 'u3', name: 'Kavin Raj', phone: '+91 90123 45678', city: 'Coimbatore', state: 'Tamil Nadu', joinedAt: '2026-01-20', templesVisited: 22, blocked: false, lastActive: '3h ago' },
  { id: 'u4', name: 'Dev Patel', phone: '+91 87654 32109', city: 'Ahmedabad', state: 'Gujarat', joinedAt: '2026-02-02', templesVisited: 6, blocked: false, lastActive: '5d ago' },
  { id: 'u5', name: 'Priya Nair', phone: '+91 77654 32100', city: 'Kochi', state: 'Kerala', joinedAt: '2026-02-14', templesVisited: 18, blocked: false, lastActive: '12h ago' },
  { id: 'u6', name: 'Rajan Mehta', phone: '+91 70011 22334', city: 'Jaipur', state: 'Rajasthan', joinedAt: '2026-03-01', templesVisited: 3, blocked: true, lastActive: '14d ago' },
  { id: 'u7', name: 'Sunita Rao', phone: '+91 98001 12345', city: 'Hyderabad', state: 'Telangana', joinedAt: '2026-03-15', templesVisited: 11, blocked: false, lastActive: '1h ago' },
];

export const MOCK_CATEGORIES: TempleCategory[] = [
  { key: 'JYOTIRLINGA',  label: 'Jyotirlinga',   color: '#C5341C', isCustom: false },
  { key: 'CHAR_DHAM',    label: 'Char Dham',     color: '#6B1A2C', isCustom: false },
  { key: 'PANCH_BHOOTA', label: 'Panch Bhoota',  color: '#1F5E4A', isCustom: false },
  { key: 'SHAKTI',       label: 'Shakti Peeth',  color: '#B87A00', isCustom: false },
  { key: 'SHIVA',        label: 'Shiva',         color: '#4A1220', isCustom: false },
  { key: 'VISHNU',       label: 'Vishnu',        color: '#1F5E4A', isCustom: false },
  { key: 'GANESH',       label: 'Ganesh',        color: '#E89B2C', isCustom: false },
  { key: 'LAKSHMI',      label: 'Lakshmi',       color: '#C49A3A', isCustom: false },
];

export const MOCK_TEMPLES: Temple[] = [
  { id: 't1', name: 'Kashi Vishwanath', deity: 'Shiva', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', categories: ['JYOTIRLINGA', 'SHIVA'], latitude: 25.3109, longitude: 83.0107, verificationRadius: 200, enabled: true },
  { id: 't2', name: 'Rameshwaram', deity: 'Shiva', city: 'Rameswaram', state: 'Tamil Nadu', pincode: '623526', categories: ['JYOTIRLINGA', 'CHAR_DHAM'], latitude: 9.2881, longitude: 79.3174, verificationRadius: 300, enabled: true },
  { id: 't3', name: 'Badrinath Temple', deity: 'Vishnu', city: 'Badrinath', state: 'Uttarakhand', pincode: '246422', categories: ['CHAR_DHAM', 'VISHNU'], latitude: 30.7433, longitude: 79.4938, verificationRadius: 250, enabled: true },
  { id: 't4', name: 'Siddhivinayak Temple', deity: 'Ganesh', city: 'Mumbai', state: 'Maharashtra', pincode: '400012', categories: ['GANESH'], latitude: 19.0170, longitude: 72.8307, verificationRadius: 150, enabled: true },
  { id: 't5', name: 'Meenakshi Amman Temple', deity: 'Lakshmi', city: 'Madurai', state: 'Tamil Nadu', pincode: '625001', categories: ['SHAKTI', 'LAKSHMI'], latitude: 9.9195, longitude: 78.1193, verificationRadius: 200, enabled: true },
];

export const MOCK_AFFILIATES: Affiliate[] = [
  { id: 'a1', name: 'Yatra.com', type: 'JOURNEY', description: 'Train & bus bookings for pilgrimage routes', websiteUrl: 'https://yatra.com', contactEmail: 'partners@yatra.com', commissionPct: 8, enabled: true, createdAt: '2026-03-01' },
  { id: 'a2', name: 'Dharamshala Network', type: 'STAY', description: 'Curated dharamshalas near major temples', websiteUrl: 'https://dharamshalas.in', contactEmail: 'ops@dharamshalas.in', commissionPct: 12, enabled: true, createdAt: '2026-03-10' },
  { id: 'a3', name: 'Pooja Samagri', type: 'YATRA_ESSENTIALS', description: 'Puja kits, prasad, and yatra essentials delivered', websiteUrl: 'https://poojasamagri.com', contactEmail: 'b2b@poojasamagri.com', commissionPct: 15, enabled: false, createdAt: '2026-04-05' },
  { id: 'a4', name: 'IRCTC Pilgrim Special', type: 'JOURNEY', description: 'Special pilgrim train packages', websiteUrl: 'https://irctc.co.in', contactEmail: 'pilgrim@irctc.co.in', commissionPct: 5, enabled: true, createdAt: '2026-04-12' },
];

export const MOCK_FLAGS: FeatureFlag[] = [
  { key: 'CHECKINS_ENABLED', label: 'Temple Check-ins', description: 'Allow users to check in at temples and earn stamps', enabled: true, updatedAt: '2026-06-01', updatedBy: 'admin', category: 'CORE' },
  { key: 'POSTS_ENABLED', label: 'Social Posts', description: 'Allow users to create posts and share their pilgrimage', enabled: true, updatedAt: '2026-06-01', updatedBy: 'admin', category: 'SOCIAL' },
  { key: 'FEED_ENABLED', label: 'Social Feed', description: 'Show the social feed on the home and sangha screens', enabled: true, updatedAt: '2026-06-01', updatedBy: 'admin', category: 'SOCIAL' },
  { key: 'YATRA_GROUPS_ENABLED', label: 'Yatra Groups', description: 'Allow users to create and join yatra groups with expense splitting', enabled: true, updatedAt: '2026-06-01', updatedBy: 'admin', category: 'SOCIAL' },
  { key: 'GROUP_CHAT_ENABLED', label: 'Group Chat', description: 'Real-time messaging within yatra groups', enabled: true, updatedAt: '2026-06-01', updatedBy: 'admin', category: 'SOCIAL' },
  { key: 'USER_DISCOVERY_ENABLED', label: 'User Discovery', description: 'Search for and follow other pilgrims by name or phone number', enabled: true, updatedAt: '2026-06-01', updatedBy: 'admin', category: 'DISCOVERY' },
  { key: 'AFFILIATE_MARKETING_ENABLED', label: 'Affiliate Offers', description: 'Show stay, journey, and yatra essentials booking options from affiliates', enabled: false, updatedAt: '2026-06-20', updatedBy: 'admin', category: 'COMMERCE' },
  { key: 'STAY_BOOKING_ENABLED', label: 'Stay Booking', description: 'Show hotel and dharamshala booking options near temples', enabled: false, updatedAt: '2026-06-20', updatedBy: 'admin', category: 'COMMERCE' },
  { key: 'JOURNEY_BOOKING_ENABLED', label: 'Journey Booking', description: 'Show train, bus, and cab booking for pilgrimages', enabled: false, updatedAt: '2026-06-20', updatedBy: 'admin', category: 'COMMERCE' },
];

// ── API helpers (active when backend admin endpoints are live) ───────────────

export const adminApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string }>('/admin/auth/login', { username, password }),

  stats: () => api.get<DashboardStats>('/admin/stats'),

  users: (page = 0, size = 20) =>
    api.get<{ content: AdminUser[]; totalElements: number }>(`/admin/users?page=${page}&size=${size}`),
  blockUser: (userId: string, blocked: boolean) =>
    api.patch(`/admin/users/${userId}/block`, { blocked }),

  temples: (page = 0, size = 20) =>
    api.get<{ content: Temple[]; totalElements: number }>(`/admin/temples?page=${page}&size=${size}`),
  createTemple: (data: Omit<Temple, 'id' | 'createdAt'>) =>
    api.post<Temple>('/admin/temples', data),
  updateTemple: (id: string, data: Partial<Temple>) =>
    api.put<Temple>(`/admin/temples/${id}`, data),
  toggleTemple: (id: string, enabled: boolean) =>
    api.patch(`/admin/temples/${id}/enabled`, { enabled }),

  affiliates: () => api.get<Affiliate[]>('/admin/affiliates'),
  createAffiliate: (data: Omit<Affiliate, 'id' | 'createdAt'>) =>
    api.post<Affiliate>('/admin/affiliates', data),
  updateAffiliate: (id: string, data: Partial<Affiliate>) =>
    api.put<Affiliate>(`/admin/affiliates/${id}`, data),
  toggleAffiliate: (id: string, enabled: boolean) =>
    api.patch(`/admin/affiliates/${id}/enabled`, { enabled }),

  featureFlags: () => api.get<FeatureFlag[]>('/admin/feature-flags'),
  setFlag: (key: string, enabled: boolean) =>
    api.patch(`/admin/feature-flags/${key}`, { enabled }),

  categories: () => api.get<TempleCategory[]>('/admin/temple-categories'),
  createCategory: (data: Omit<TempleCategory, 'isCustom'>) =>
    api.post<TempleCategory>('/admin/temple-categories', data),

  createUser: (data: { name: string; phone: string; email?: string; city?: string; stateName?: string }) =>
    api.post<AdminUser>('/admin/users', data),
};
