export interface PriceHistoryItem {
  timestamp: Date
  price: number
  asset: string
  fiat: string
  advertiser: string
  paymentMethods: string
  amount: number
  minAmount: number
  maxAmount: number
  tradeType: string
}
