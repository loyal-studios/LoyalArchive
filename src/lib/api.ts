import { DEMO_ITEMS } from '../data/demo';
import type { ArchiveItem, DashboardData, ListQuery, PageResult, SaveInput, Session } from '../types';

const API_URL = (import.meta.env.VITE_APPS_SCRIPT_URL || '').trim();
const SESSION_KEY = 'loyal_archive_session';
const DEMO_KEY = 'loyal_archive_demo_items';

const wait = (ms = 180) => new Promise((resolve) => window.setTimeout(resolve, ms));

export interface AssetBatchEntry {
  clientId: string;
  item: SaveInput;
  image: File;
}

export interface AssetBatchFailure {
  clientId: string;
  fileName: string;
  message: string;
}

export interface AssetBatchResult {
  saved: ArchiveItem[];
  failed: AssetBatchFailure[];
}

function getDemoItems(): ArchiveItem[] {
  const saved = localStorage.getItem(DEMO_KEY);
  if (!saved) return DEMO_ITEMS;
  try { return [...JSON.parse(saved), ...DEMO_ITEMS.filter((item) => !JSON.parse(saved).some((savedItem: ArchiveItem) => savedItem.id === item.id))]; }
  catch { return DEMO_ITEMS; }
}

function saveDemoItems(items: ArchiveItem[]) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(items.filter((item) => item.id.startsWith('local-'))));
}

async function request<T>(action: string, payload: Record<string, unknown> = {}, authenticated = true): Promise<T> {
  const session = getSession();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, token: authenticated ? session?.token : undefined, ...payload }),
  });
  if (!response.ok) throw new Error('Backend Loyal Archive tidak dapat dihubungi.');
  const result = await response.json();
  if (!result.ok) throw new Error(result.error?.message || 'Permintaan gagal.');
  return result.data as T;
}

export const isDemoMode = !API_URL;

export function getSession(): Session | null {
  const value = localStorage.getItem(SESSION_KEY);
  if (!value) return null;
  try {
    const session = JSON.parse(value) as Session;
    if (new Date(session.expiresAt) <= new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch { return null; }
}

export function setSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export async function requestOtp(email: string) {
  return request<{ maskedEmail: string; expiresInMinutes: number }>('requestOtp', { email }, false);
}

export async function verifyOtp(email: string, code: string, trusted: boolean) {
  const session = await request<Session>('verifyOtp', { email, code, trusted }, false);
  setSession(session);
  return session;
}

export async function listItems(query: ListQuery): Promise<PageResult<ArchiveItem>> {
  if (!isDemoMode) return request<PageResult<ArchiveItem>>('list', { query });
  await wait();
  let items = getDemoItems().filter((item) => !item.archived);
  if (query.type && query.type !== 'favorit') items = items.filter((item) => item.type === query.type);
  if (query.type === 'favorit' || query.favorite) items = items.filter((item) => item.favorite);
  if (query.category) items = items.filter((item) => item.category === query.category);
  if (query.status) items = items.filter((item) => item.status === query.status);
  if (query.query) {
    const words = query.query.toLowerCase().split(/\s+/).filter(Boolean);
    items = items.filter((item) => {
      const haystack = [item.title, item.summary, item.category, item.status, item.style, ...item.tags, ...(item.uses || [])].join(' ').toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }
  items.sort((a, b) => query.sort === 'az' ? a.title.localeCompare(b.title) : query.sort === 'terlama' ? a.updatedAt.localeCompare(b.updatedAt) : b.updatedAt.localeCompare(a.updatedAt));
  const total = items.length;
  const start = (query.page - 1) * query.pageSize;
  return { items: items.slice(start, start + query.pageSize), page: query.page, pageSize: query.pageSize, total, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
}

export async function getDashboard(): Promise<DashboardData> {
  if (!isDemoMode) return request<DashboardData>('dashboard');
  await wait(120);
  const items = getDemoItems().filter((item) => !item.archived);
  const counts = Object.fromEntries([...new Set(items.map((item) => item.type))].map((type) => [type, items.filter((item) => item.type === type).length]));
  return { latest: items.slice(0, 6), favorites: items.filter((item) => item.favorite).slice(0, 6), counts, total: items.length };
}

export async function saveItem(input: SaveInput, image?: File): Promise<ArchiveItem> {
  let upload: Record<string, unknown> | undefined;
  if (image) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'));
      reader.readAsDataURL(image);
    });
    const extensionMime: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
      heic: 'image/heic', heif: 'image/heif', avif: 'image/avif',
    };
    const extension = image.name.split('.').pop()?.toLowerCase() || '';
    upload = { name: image.name, mimeType: image.type || extensionMime[extension] || 'application/octet-stream', size: image.size, dataUrl };
  }
  if (!isDemoMode) return request<ArchiveItem>('save', { item: input, upload });
  await wait(240);
  const date = new Date().toISOString();
  const item: ArchiveItem = {
    id: `local-${crypto.randomUUID()}`,
    summary: '', favorite: false, archived: false, attachments: [], createdAt: date, updatedAt: date,
    ...input,
  } as ArchiveItem;
  if (image && upload) item.attachments = [{ id: crypto.randomUUID(), name: image.name, mimeType: image.type, size: image.size, thumbnailUrl: String(upload.dataUrl), originalUrl: String(upload.dataUrl) }];
  const items = getDemoItems();
  saveDemoItems([item, ...items]);
  return item;
}

export async function saveAssetBatch(
  entries: AssetBatchEntry[],
  onProgress?: (completed: number, total: number, fileName: string) => void,
): Promise<AssetBatchResult> {
  const saved: ArchiveItem[] = [];
  const failed: AssetBatchFailure[] = [];

  // Sengaja berurutan: satu gambar per request menjaga penggunaan memori Safari/iPhone
  // tetap rendah dan menghindari lock Drive/Sheets saling berebut di Apps Script.
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    try {
      saved.push(await saveItem(entry.item, entry.image));
    } catch (error) {
      failed.push({
        clientId: entry.clientId,
        fileName: entry.image.name,
        message: error instanceof Error ? error.message : 'Gambar gagal disimpan.',
      });
    }
    onProgress?.(index + 1, entries.length, entry.image.name);
  }

  return { saved, failed };
}

export async function toggleFavorite(id: string, favorite: boolean) {
  if (!isDemoMode) return request<ArchiveItem>('toggleFavorite', { id, favorite });
  await wait(100);
  const items = getDemoItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error('Item tidak ditemukan.');
  item.favorite = favorite;
  saveDemoItems(items);
  return item;
}

export async function logout() {
  try { if (!isDemoMode && getSession()) await request<{ loggedOut: boolean }>('logout'); }
  finally { setSession(null); }
}
