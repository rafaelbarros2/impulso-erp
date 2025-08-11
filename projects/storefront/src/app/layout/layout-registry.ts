export const LAYOUT_REGISTRY = {
  classic:  { hasAside: false, vars: { '--layout-container-max': '1200px' } },
  sidebar:  { hasAside: true,  vars: { '--layout-container-max': '1280px', '--layout-gap': '1.5rem' } },
  magazine: { hasAside: false, vars: { '--layout-container-max': '1440px' } },
  promotion:{ hasAside: false, vars: {
    '--layout-container-max':'1320px',
    '--layout-gap':'1.25rem',
    '--promo-hero-overlay': '0.40',
    '--promo-hero-image': 'url(https://images.unsplash.com/photo-1445205170230-053b83016050?q=85&fm=jpg&w=1600)',
    '--primary-600': '#2563eb',
    '--promo-accent': 'var(--primary-600)',
    '--promo-cta-bg': '#ffffff',
    '--promo-cta-fg': 'var(--primary-600)'
  }}
} as const;

export type LayoutId = keyof typeof LAYOUT_REGISTRY;
