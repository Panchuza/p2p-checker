import { Injectable } from "@nestjs/common"
import { AlertService } from "src/alert/alert.service"
import type { ParamsDto } from "src/binance/dto/paramsDto.dto"
import { CommonException } from "src/common/exception/common-exception.exception"
import { PriceHistoryItem } from "./interfaces/price-history.interface"

@Injectable()
export class P2pCheckerService {
  private lastOrders: Record<
    string,
    {
      price: number
      advertiser: string
      paymentMethods: string
    }
  > = {}

  private priceHistory: PriceHistoryItem[] = []
  
  constructor(private readonly alertService: AlertService) {}

  async checkP2POrders(responseFromBinance: any, paramsDto: ParamsDto) {
    try {
      const order = responseFromBinance?.responseFromBinance?.data?.[0]
      if (!order) {
        throw new CommonException("No se encontraron órdenes disponibles", 400)
      }

      const currentPrice = Number.parseFloat(order.adv.price)
      const asset = order.adv.asset
      const fiat = order.adv.fiatUnit

      const jobKey = this.generateKey(fiat, asset, paramsDto)
      const lastOrder = this.lastOrders[jobKey]

      if (!this.shouldNotify(order, lastOrder)) {
        return this.formatResponse(order)
      }

      const paymentMethods = order.adv.tradeMethods.map((m) => m.payType).join(", ")

      // 🚀 Crear entrada del historial ANTES de enviar a Telegram
      const historyItem: PriceHistoryItem = {
        timestamp: new Date(),
        price: currentPrice,
        asset: asset,
        fiat: fiat,
        advertiser: order.advertiser.nickName,
        paymentMethods: paymentMethods,
        amount: Number.parseFloat(order.adv.surplusAmount),
        minAmount: Number.parseFloat(order.adv.minSingleTransAmount),
        maxAmount: Number.parseFloat(order.adv.maxSingleTransAmount),
        tradeType: paramsDto.tradeType,
      }

      // 🚀 Agregar al historial (mantener solo los últimos 100 registros)
      this.priceHistory.unshift(historyItem)
      if (this.priceHistory.length > 100) {
        this.priceHistory = this.priceHistory.slice(0, 100)
      }

      // Enviar alerta a Telegram
      await this.alertService.sendTelegramAlert(
        `📢 *Nueva orden P2P detectada*\n\n` +
          `💸 Precio: *${currentPrice}* ${asset}/${fiat}\n` +
          `💸 Cantidad Disponible: *${Number.parseFloat(order.adv.surplusAmount).toFixed(2)}* *${asset}*\n` +
          `💸 Rango: *${Number.parseFloat(order.adv.minSingleTransAmount)}* - *${Number.parseFloat(order.adv.maxSingleTransAmount)}* *${fiat}*\n` +
          `👤 Usuario: *${order.advertiser.nickName}*\n` +
          `💳 Métodos de pago: *${paymentMethods}*`,
      )

      // Actualizar último orden
      this.lastOrders[jobKey] = {
        price: currentPrice,
        advertiser: order.advertiser.nickName,
        paymentMethods,
      }

      return this.formatResponse(order)
    } catch (error) {
      throw new CommonException(`Error en checkP2POrders: ${error.message}`, error.status || 500)
    }
  }

  private generateKey(fiat: string, asset: string, paramsDto: ParamsDto): string {
    return [
      fiat,
      paramsDto.tradeType,
      asset,
      paramsDto.payTypes?.join("-") ?? "none",
      paramsDto.publisherType ?? "merchant",
      paramsDto.cronExpression,
    ].join("_")
  }

  private shouldNotify(currentOrder: any, lastOrder?: any): boolean {
    if (!lastOrder) return true

    const currentPrice = Number.parseFloat(currentOrder.adv.price)
    const currentAdvertiser = currentOrder.advertiser.nickName
    const currentPaymentMethods = currentOrder.adv.tradeMethods.map((m) => m.payType).join(", ")

    return (
      currentPrice !== lastOrder.price ||
      currentAdvertiser !== lastOrder.advertiser ||
      currentPaymentMethods !== lastOrder.paymentMethods
    )
  }

  private formatResponse(order: any) {
    return {
      nickName: order.advertiser.nickName,
      price: order.adv.price,
      tradeMethods: order.adv.tradeMethods.map((m) => m.payType),
      asset: order.adv.asset,
      fiat: order.adv.fiat,
    }
  }

  getLastOrder(key: string) {
    return this.lastOrders[key] || null
  }

  // 🚀 Nuevos métodos para manejar el historial de precios
  getPriceHistory(): PriceHistoryItem[] {
    return this.priceHistory
  }

  clearPriceHistory(): void {
    this.priceHistory = []
  }
}
