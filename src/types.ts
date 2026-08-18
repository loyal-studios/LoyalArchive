export type ArchiveType =
  | 'ide'
  | 'pecahan'
  | 'bagaimana'
  | 'percobaan'
  | 'ditinggalkan'
  | 'prompt'
  | 'catatan'
  | 'asset'
  | 'link';

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  originalUrl?: string;
  thumbnailUrl?: string;
}

export interface ArchiveItem {
  id: string;
  type: ArchiveType;
  title: string;
  summary: string;
  category: string;
  style?: string;
  status?: string;
  priority?: 'Tinggi' | 'Sedang' | 'Rendah';
  tags: string[];
  uses?: string[];
  favorite: boolean;
  archived: boolean;
  sourceUrl?: string;
  content?: string;
  platform?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  data?: Record<string, unknown>;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListQuery {
  type?: ArchiveType | 'favorit';
  query?: string;
  category?: string;
  status?: string;
  favorite?: boolean;
  page: number;
  pageSize: number;
  sort?: 'terbaru' | 'terlama' | 'az';
}

export interface DashboardData {
  latest: ArchiveItem[];
  favorites: ArchiveItem[];
  counts: Partial<Record<ArchiveType, number>>;
  total: number;
}

export interface SessionUser {
  email: string;
  name: string;
  role: 'Pemilik' | 'Admin';
}

export interface Session {
  token: string;
  expiresAt: string;
  user: SessionUser;
}

export interface SaveInput extends Partial<ArchiveItem> {
  type: ArchiveType;
  title: string;
  category: string;
  tags: string[];
}
