// Tournament credit packages configuration (client-side)
export const TOURNAMENT_CREDIT_PACKAGES = {
  single: {
    id: 'single_tournament',
    name: 'Single Tournament',
    credits: 1,
    price: 10,
    pricePerTournament: 10,
    description: 'Perfect for one-time events',
    popular: false
  },
  small_pack: {
    id: 'tournament_5_pack',
    name: '5-Tournament Pack',
    credits: 5,
    price: 40,
    pricePerTournament: 8,
    description: 'Save $10 vs individual purchases',
    savings: 10,
    popular: true
  },
  large_pack: {
    id: 'tournament_10_pack',
    name: '10-Tournament Pack',
    credits: 10,
    price: 70,
    pricePerTournament: 7,
    description: 'Best value for active organizers',
    savings: 30,
    popular: false
  },
  monthly_boost: {
    id: 'monthly_boost',
    name: 'Monthly Boost',
    credits: 15,
    price: 90,
    pricePerTournament: 6,
    description: '15 extra tournaments this month',
    expiresInDays: 31,
    popular: false
  }
} as const;

export type PackageId = keyof typeof TOURNAMENT_CREDIT_PACKAGES;