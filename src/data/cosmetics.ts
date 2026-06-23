export interface SuitDef {
  id: string
  name: string
  primary: string
  accent: string
  unlockLevel: number
}

export interface HelmetDef {
  id: string
  name: string
  shape: 'round' | 'visor' | 'astro'
  unlockLevel: number
}

export const SUITS: SuitDef[] = [
  { id: 'white', name: '표준 흰색', primary: '#f1f5f9', accent: '#0ea5e9', unlockLevel: 1 },
  { id: 'blue', name: '심해 블루', primary: '#1e3a8a', accent: '#60a5fa', unlockLevel: 3 },
  { id: 'orange', name: '구조대 오렌지', primary: '#ea580c', accent: '#fde68a', unlockLevel: 5 },
  { id: 'forest', name: '바이오 그린', primary: '#14532d', accent: '#86efac', unlockLevel: 8 },
]

export const HELMETS: HelmetDef[] = [
  { id: 'round', name: '표준 헬멧', shape: 'round', unlockLevel: 1 },
  { id: 'visor', name: '바이저 헬멧', shape: 'visor', unlockLevel: 4 },
  { id: 'astro', name: '심우주 헬멧', shape: 'astro', unlockLevel: 9 },
]

export const getSuit = (id: string) => SUITS.find((s) => s.id === id) ?? SUITS[0]
export const getHelmet = (id: string) => HELMETS.find((h) => h.id === id) ?? HELMETS[0]
