export type BgType = 'solid' | 'gradient' | 'image' | 'pattern' | 'custom';
export interface BackgroundConfig {
  id: string; name: string; type: BgType; value?: string;
  overlayOpacity?: number; overlayColor?: string;
  backgroundSize?: string; backgroundPosition?: string; backgroundRepeat?: string;
}
