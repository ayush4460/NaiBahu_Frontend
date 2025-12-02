// src/lib/spice.ts   CREATE THIS FILE

export const SPICE_LEVELS = {
  mild: { icon: 'Chili Mild', label: 'Mild' },
  regular: { icon: 'Chili Regular', label: 'Regular' },
  spicy: { icon: 'Chili Chili', label: 'Spicy' },
  extra_spicy: { icon: 'Chili Chili Chili', label: 'Extra Spicy' },
} as const;

export type SpiceLevel = keyof typeof SPICE_LEVELS;