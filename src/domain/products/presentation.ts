import type { ProductCategory } from './types'

export const CATEGORY_COLORS: Record<ProductCategory, { bg: string; accent: string }> = {
  textiles: { bg: '#DCEBFC', accent: '#2D7BD0' },
  frames: { bg: '#E5E0F9', accent: '#6B54C9' },
  kitchen: { bg: '#FBEFCC', accent: '#C8942A' },
  lighting: { bg: '#FBF2CC', accent: '#D6A626' },
  plush: { bg: '#FBDAE7', accent: '#D24B83' },
  candle: { bg: '#FCDDD0', accent: '#DB6645' },
  storage: { bg: '#D2EFE9', accent: '#239281' },
  seasonal: { bg: '#D9EDDB', accent: '#3F9A50' },
  bath: { bg: '#DEF1F5', accent: '#2589AB' },
  unknown: { bg: '#EEF1F6', accent: '#5A6883' },
}

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  textiles: 'TXT',
  frames: 'ART',
  kitchen: 'KIT',
  lighting: 'LGT',
  plush: 'PLU',
  candle: 'CND',
  storage: 'STO',
  seasonal: 'SEA',
  bath: 'BTH',
  unknown: 'PRD',
}

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#E0483A',
  high: '#F2A23C',
  normal: '#4F9DF7',
  low: '#9AA7BD',
}

export const STAGE_COLORS: Record<string, { bg: string; dot: string }> = {
  Concept: { bg: '#ECE2F8', dot: '#8B5CF6' },
  'In Development': { bg: '#DEEBFB', dot: '#3B82F6' },
  'Licensor Review': { bg: '#FBEBD3', dot: '#F59E0B' },
  Approved: { bg: '#D8EFE7', dot: '#10B981' },
  Sampling: { bg: '#D9F0F5', dot: '#06B6D4' },
  Production: { bg: '#FBE2D8', dot: '#EF4444' },
  Shipped: { bg: '#DEF0DB', dot: '#22C55E' },
}

export const LICENSOR_META: Record<string, { gradient: string; letter: string; dotColor: string }> = {
  Disney: { gradient: 'linear-gradient(135deg,#4F9DF7,#3A5BD0)', letter: 'D', dotColor: '#4F9DF7' },
  Marvel: { gradient: 'linear-gradient(135deg,#F0564B,#D32A2A)', letter: 'M', dotColor: '#F0564B' },
  Lucasfilm: { gradient: 'linear-gradient(135deg,#454B5C,#C9A227)', letter: 'L', dotColor: '#C9A227' },
  Nickelodeon: { gradient: 'linear-gradient(135deg,#FF9F43,#F47B20)', letter: 'N', dotColor: '#FF9F43' },
  Sanrio: { gradient: 'linear-gradient(135deg,#FF9FC4,#EA6B9C)', letter: 'S', dotColor: '#FF9FC4' },
  Seasonal: { gradient: 'linear-gradient(135deg,#5BC59C,#2FA37C)', letter: 'S', dotColor: '#5BC59C' },
  'Star Wars': { gradient: 'linear-gradient(135deg,#454B5C,#C9A227)', letter: 'SW', dotColor: '#C9A227' },
  WB: { gradient: 'linear-gradient(135deg,#1D4CC8,#0E3BA0)', letter: 'WB', dotColor: '#1D4CC8' },
  NBCU: { gradient: 'linear-gradient(135deg,#0F5FA8,#0A4882)', letter: 'N', dotColor: '#0F5FA8' },
  Peanuts: { gradient: 'linear-gradient(135deg,#E8B84B,#C9952A)', letter: 'P', dotColor: '#E8B84B' },
  Sega: { gradient: 'linear-gradient(135deg,#1B75BE,#1455A0)', letter: 'S', dotColor: '#1B75BE' },
  WWE: { gradient: 'linear-gradient(135deg,#E31837,#C01030)', letter: 'W', dotColor: '#E31837' },
  'Care Bears': { gradient: 'linear-gradient(135deg,#FF7EB3,#E05A9A)', letter: 'CB', dotColor: '#FF7EB3' },
  'Coca-Cola': { gradient: 'linear-gradient(135deg,#F40009,#CC0007)', letter: 'C', dotColor: '#F40009' },
  'One Piece': { gradient: 'linear-gradient(135deg,#E8801A,#C96B14)', letter: 'OP', dotColor: '#E8801A' },
  'Sesame Street': { gradient: 'linear-gradient(135deg,#F3CC12,#D4AE0E)', letter: 'SS', dotColor: '#F3CC12' },
  'Strawberry SC': { gradient: 'linear-gradient(135deg,#E8546A,#C93C54)', letter: 'SS', dotColor: '#E8546A' },
}

export function stageColor(stageName: string): { bg: string; dot: string } {
  const palette = [
    { bg: '#ECE2F8', dot: '#8B5CF6' },
    { bg: '#DEEBFB', dot: '#3B82F6' },
    { bg: '#D8EFF5', dot: '#0891B2' },
    { bg: '#D8EFE7', dot: '#10B981' },
    { bg: '#FBEBD3', dot: '#F59E0B' },
    { bg: '#FBE2D8', dot: '#EF4444' },
    { bg: '#F7E5EC', dot: '#DB2777' },
    { bg: '#DEF0DB', dot: '#22C55E' },
  ]
  let h = 0
  for (let i = 0; i < stageName.length; i++) h = (h * 31 + stageName.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

