export interface Tool {
  id: string
  name: string
  description: string
  status?: 'available' | 'planned'
  cta?: string
  icon?: 'qr' | 'sheet' | 'star' | 'cloud' | 'music'
  externalUrl?: string
}
