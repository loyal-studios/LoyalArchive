import type { ArchiveItem, ArchiveType } from '../types';

const now = new Date('2026-08-18T10:00:00+07:00');
const isoDaysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

const ideas = [
  ['Medieval Football Graphic', 'Graphic', 'sports,gothic,jersey', 'Mau Dibuat', 'Tinggi'],
  ['Chrome Serif + Dirty Shadow', 'Typography', 'chrome,y2k,distressed', 'Masuk', 'Sedang'],
  ['Saint Racing Club', 'Collection', 'saint,racing,vintage', 'Sedang Dikembangkan', 'Tinggi'],
  ['Oversized Crest Layout', 'Layout', 'crest,oversized,back-print', 'Masuk', 'Rendah'],
  ['Airbrush Women Session', 'Graphic', 'airbrush,women,90s', 'Mau Dibuat', 'Tinggi'],
];

const prompts = [
  ['Appliqué Generator', 'Appliqué / Print', 'applique,transparent,garment', 'Terbukti Bagus'],
  ['Restore Vintage Scan', 'Upscale / Restore', 'restore,scan,texture', 'Sedang Dites'],
  ['Airbrush Image Conversion', 'Image Edit', 'airbrush,90s,image-edit', 'Terbukti Bagus'],
  ['Editorial Type Explorer', 'Typography', 'typography,editorial,layout', 'Draft'],
];

const notes = [
  ['Halftone untuk DTG', 'Print / Production', 'halftone,dtg,print', 'Setting dot dan sudut screen yang aman untuk hasil DTG.'],
  ['Curves untuk Bootleg', 'Photoshop', 'curves,bootleg,contrast', 'Formula curves untuk mempertahankan midtone pada foto vintage.'],
  ['Checklist File Produksi', 'Print / Production', 'checklist,production,export', 'Pemeriksaan sebelum file dikirim ke vendor.'],
  ['Workflow Appliqué Bertingkat', 'Garment', 'applique,garment,production', 'Urutan layer, jahitan, dan toleransi produksi.'],
];

const assets = [
  ['Vintage Racing Photo', 'Photography', 'racing,vintage,90s', 'Inspirasi,Collage,Photoshop Asset', 'demo/reference-01.svg', 900, 1200],
  ['Chrome Letter Study', 'Typography', 'chrome,type,y2k', 'Inspirasi,Typography', 'demo/reference-02.svg', 1200, 900],
  ['Distressed Paper Scan', 'Texture', 'paper,distressed,scan', 'Texture,Photoshop Asset', 'demo/reference-03.svg', 900, 1350],
  ['Gothic Crest Symbol', 'Logo / Symbol', 'gothic,crest,symbol', 'Inspirasi,Graphic', 'demo/reference-04.svg', 1100, 1100],
  ['Workwear Color Study', 'Color', 'workwear,color,earth', 'Inspirasi,Print Reference', 'demo/reference-05.svg', 1200, 800],
  ['Oversized Back Layout', 'Garment', 'garment,layout,back-print', 'Inspirasi,Mockup', 'demo/reference-06.svg', 900, 1250],
];

function build(
  type: ArchiveType,
  rows: Array<Array<string | number>>,
  multiplier = 3,
): ArchiveItem[] {
  return Array.from({ length: rows.length * multiplier }, (_, index) => {
    const row = rows[index % rows.length];
    const cycle = Math.floor(index / rows.length);
    const title = cycle ? `${row[0]} ${String(cycle + 1).padStart(2, '0')}` : String(row[0]);
    const isAsset = type === 'asset';
    const status = type === 'ide' || type === 'prompt' ? String(row[3]) : undefined;
    const priority = type === 'ide' ? String(row[4]) as ArchiveItem['priority'] : undefined;
    return {
      id: `${type}-${index + 1}`,
      type,
      title,
      category: String(row[1]),
      tags: String(row[2]).split(','),
      summary: isAsset ? 'Komposisi, tekstur, dan arah visual yang layak disimpan untuk eksplorasi berikutnya.' : (type === 'catatan' ? String(row[3]) : 'Bahan kreatif yang siap ditemukan dan digunakan kembali.'),
      content: type === 'prompt' ? 'Create a high-quality, production-ready visual direction with precise materials, lighting, composition, and a transparent background.' : undefined,
      status,
      priority,
      uses: isAsset ? String(row[3]).split(',') : undefined,
      favorite: index % 5 === 0,
      archived: false,
      sourceUrl: isAsset ? 'https://example.com/sumber' : undefined,
      platform: type === 'prompt' ? (index % 2 ? 'ChatGPT' : 'Gemini') : undefined,
      attachments: isAsset ? [{
        id: `file-${index + 1}`,
        name: `${title.toLowerCase().replaceAll(' ', '-')}.jpg`,
        mimeType: 'image/jpeg',
        size: 8_400_000,
        width: Number(row[5]),
        height: Number(row[6]),
        thumbnailUrl: `./${row[4]}`,
        originalUrl: String(row[4]),
      }] : [],
      createdAt: isoDaysAgo(index + cycle),
      updatedAt: isoDaysAgo(index),
    };
  });
}

const small: ArchiveItem[] = [
  { id: 'pecahan-1', type: 'pecahan', title: 'Microtype mengitari simbol utama', category: 'Typography', tags: ['microtype', 'symbol'], summary: 'Detail kecil untuk memberi rasa technical archive.', favorite: true, archived: false, attachments: [], createdAt: isoDaysAgo(2), updatedAt: isoDaysAgo(2) },
  { id: 'bagaimana-1', type: 'bagaimana', title: 'Bagaimana kalau varsity graphic dibuat full Airbrush?', category: 'Graphic', tags: ['varsity', 'airbrush'], summary: 'Eksperimen benturan visual klasik dan teknik 90s.', favorite: false, archived: false, attachments: [], createdAt: isoDaysAgo(3), updatedAt: isoDaysAgo(3) },
  { id: 'percobaan-1', type: 'percobaan', title: 'Coba 3-layer distressed appliqué', category: 'Garment', tags: ['applique', 'distressed'], status: 'Belum Dicoba', summary: 'Tes material, lebar jahitan, dan urutan layer.', favorite: true, archived: false, attachments: [], createdAt: isoDaysAgo(4), updatedAt: isoDaysAgo(4) },
  { id: 'ditinggalkan-1', type: 'ditinggalkan', title: 'Luxury serif dengan chrome berlebih', category: 'Typography', tags: ['serif', 'chrome'], summary: 'Ditinggalkan karena terlalu ornamental; bentuk dasar masih bisa dipakai lagi.', favorite: false, archived: false, attachments: [], createdAt: isoDaysAgo(12), updatedAt: isoDaysAgo(12) },
  { id: 'link-1', type: 'link', title: 'Indieground Design', category: 'Asset', tags: ['font', 'texture', 'asset'], summary: 'Font, texture, dan asset desain pilihan.', sourceUrl: 'https://example.com', favorite: true, archived: false, attachments: [], createdAt: isoDaysAgo(5), updatedAt: isoDaysAgo(5) },
  { id: 'link-2', type: 'link', title: 'Print Production Notes', category: 'Print / Production', tags: ['print', 'production'], summary: 'Referensi teknis untuk menyiapkan file produksi.', sourceUrl: 'https://example.com', favorite: false, archived: false, attachments: [], createdAt: isoDaysAgo(8), updatedAt: isoDaysAgo(8) },
];

export const DEMO_ITEMS: ArchiveItem[] = [
  ...build('ide', ideas, 4),
  ...build('prompt', prompts, 3),
  ...build('catatan', notes, 3),
  ...build('asset', assets, 3),
  ...small,
].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
