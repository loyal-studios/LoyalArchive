import type { ArchiveType } from './types';
import {
  BookOpenText,
  Box,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  Link2,
  MessageSquareQuote,
  Puzzle,
  Skull,
  type LucideIcon,
} from 'lucide-react';

export interface SectionConfig {
  type: ArchiveType;
  label: string;
  shortLabel: string;
  description: string;
  singular: string;
  icon: LucideIcon;
  categories: string[];
}

export const SECTIONS: SectionConfig[] = [
  {
    type: 'ide', label: 'Ide Desain', shortLabel: 'Ide', singular: 'Ide', icon: Lightbulb,
    description: 'Konsep yang sudah cukup jelas untuk dikembangkan.',
    categories: ['Graphic', 'Typography', 'Garment', 'Effect / Technique', 'Collection', 'Content', 'Lainnya'],
  },
  {
    type: 'pecahan', label: 'Pecahan Ide', shortLabel: 'Pecahan', singular: 'Pecahan ide', icon: Puzzle,
    description: 'Potongan kecil yang belum perlu menjadi konsep lengkap.',
    categories: ['Graphic', 'Typography', 'Garment', 'Layout', 'Technique', 'Lainnya'],
  },
  {
    type: 'bagaimana', label: 'Bagaimana Kalau?', shortLabel: 'Bagaimana?', singular: 'Pertanyaan', icon: HelpCircle,
    description: 'Pertanyaan eksperimen untuk membuka kemungkinan baru.',
    categories: ['Graphic', 'Typography', 'Garment', 'Production', 'Content', 'Lainnya'],
  },
  {
    type: 'percobaan', label: 'Yang Mau Dicoba', shortLabel: 'Dicoba', singular: 'Percobaan', icon: FlaskConical,
    description: 'Teknik dan eksperimen yang ingin diuji.',
    categories: ['Graphic', 'Typography', 'Print', 'Garment', 'AI Workflow', 'Lainnya'],
  },
  {
    type: 'ditinggalkan', label: 'Ide yang Ditinggalkan', shortLabel: 'Ditinggalkan', singular: 'Ide', icon: Skull,
    description: 'Konsep yang gagal tanpa menghilangkan pelajarannya.',
    categories: ['Graphic', 'Typography', 'Garment', 'Collection', 'Content', 'Lainnya'],
  },
  {
    type: 'prompt', label: 'Kumpulan Prompt', shortLabel: 'Prompt', singular: 'Prompt', icon: MessageSquareQuote,
    description: 'Prompt yang siap disalin, diuji, dan digunakan ulang.',
    categories: ['Image Generation', 'Image Edit', 'Upscale / Restore', 'Appliqué / Print', 'Mockup', 'Typography', 'Writing', 'Lainnya'],
  },
  {
    type: 'catatan', label: 'Catatan & Ilmu', shortLabel: 'Catatan', singular: 'Catatan', icon: BookOpenText,
    description: 'Knowledge base desain, produksi, dan workflow pribadi.',
    categories: ['Photoshop', 'Illustrator', 'Print / Production', 'AI Workflow', 'Garment', 'Design Theory', 'Lainnya'],
  },
  {
    type: 'asset', label: 'Referensi & Asset', shortLabel: 'Referensi', singular: 'Referensi', icon: Box,
    description: 'Pinterest pribadi sekaligus library asset Photoshop.',
    categories: ['Graphic', 'Photography', 'Typography', 'Garment', 'Layout', 'Color', 'Print / Texture', 'Texture', 'Background', 'Object', 'PNG / Cutout', 'Scan', 'Logo / Symbol', 'Brand / Artist', 'Lainnya'],
  },
  {
    type: 'link', label: 'Link Penting', shortLabel: 'Link', singular: 'Link', icon: Link2,
    description: 'Bookmark terkurasi untuk kebutuhan desain.',
    categories: ['Asset', 'Font', 'Texture / Effect', 'Mockup', 'Plugin / Tool', 'AI Tool', 'Tutorial', 'Inspiration', 'Print / Production', 'Supplier', 'Archive / Reference', 'Lainnya'],
  },
];

export const SECTION_MAP = Object.fromEntries(SECTIONS.map((section) => [section.type, section])) as Record<ArchiveType, SectionConfig>;

export const ASSET_USES = ['Inspirasi', 'Photoshop Asset', 'Collage', 'Texture', 'Background', 'Graphic', 'Typography', 'Mockup', 'Print Reference'];
export const IDEA_STATUSES = ['Masuk', 'Mau Dibuat', 'Sedang Dikembangkan', 'Selesai', 'Arsip'];
export const TRY_STATUSES = ['Belum Dicoba', 'Sudah Dicoba', 'Layak Dipakai Lagi', 'Nggak Cocok'];
export const PROMPT_STATUSES = ['Draft', 'Sedang Dites', 'Terbukti Bagus', 'Perlu Diperbaiki'];
