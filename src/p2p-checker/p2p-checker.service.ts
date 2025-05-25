import { Injectable } from '@nestjs/common';
import { AlertService } from 'src/alert/alert.service';
import { ParamsDto } from 'src/binance/dto/paramsDto.dto';
import { CommonException } from 'src/common/exception/common-exception.exception';

@Injectable()
export class P2pCheckerService {
  private lastOrders: Record<string, {
    price: number;
    advertiser: string;
    paymentMethods: string;
  }> = {};

  constructor(private readonly alertService: AlertService) {}

  async checkP2POrders(responseFromBinance: any, paramsDto: ParamsDto) {
    try {
      const order = responseFromBinance?.responseFromBinance?.data?.[0];
      if (!order) {
        throw new CommonException('No se encontraron órdenes disponibles', 400);
      }
  
      const currentPrice = parseFloat(order.adv.price);
      const asset = order.adv.asset;
      const fiat = order.adv.fiatUnit;
  
      const jobKey = this.generateKey(fiat, asset, paramsDto);
      const lastOrder = this.lastOrders[jobKey];
  
      if (!this.shouldNotify(order, lastOrder)) {
        return this.formatResponse(order);
      }
  
      const paymentMethods = order.adv.tradeMethods.map(m => m.payType).join(', ');
  
      await this.alertService.sendTelegramAlert(
        `📢 *Nueva orden P2P detectada*\n\n` +
        `💸 Precio: *${currentPrice}* ${asset}/${fiat}\n` +
        `💸 Cantidad Disponible: *${parseFloat(order.adv.surplusAmount).toFixed(2)}* *${asset}*\n` +
        `💸 Rango: *${parseFloat(order.adv.minSingleTransAmount)}* - *${parseFloat(order.adv.maxSingleTransAmount)}* *${fiat}*\n` +
        `👤 Usuario: *${order.advertiser.nickName}*\n` +
        `💳 Métodos de pago: *${paymentMethods}*`
      );
  
      this.lastOrders[jobKey] = {
        price: currentPrice,
        advertiser: order.advertiser.nickName,
        paymentMethods,
      };
  
      return this.formatResponse(order);
    } catch (error) {
      throw new CommonException(
        `Error en checkP2POrders: ${error.message}`,
        error.status || 500
      );
    }
  }
  

  private generateKey(fiat: string, asset: string, paramsDto: ParamsDto): string {
    return [
      fiat,
      paramsDto.tradeType,
      asset,
      paramsDto.payTypes?.join('-') ?? 'none',
      paramsDto.publisherType ?? 'merchant',
      paramsDto.cronExpression // importante para distinguir jobs paralelos
    ].join('_');
  }
  

  private shouldNotify(currentOrder: any, lastOrder?: any): boolean {
    if (!lastOrder) return true;
  
    const currentPrice = parseFloat(currentOrder.adv.price);
    const currentAdvertiser = currentOrder.advertiser.nickName;
    const currentPaymentMethods = currentOrder.adv.tradeMethods.map(m => m.payType).join(', ');
  
    return (
      currentPrice !== lastOrder.price ||
      currentAdvertiser !== lastOrder.advertiser ||
      currentPaymentMethods !== lastOrder.paymentMethods
    );
  }
  

  private formatResponse(order: any) {
    return {
      nickName: order.advertiser.nickName,
      price: order.adv.price,
      tradeMethods: order.adv.tradeMethods.map(m => m.payType),
      asset: order.adv.asset,
      fiat: order.adv.fiat,
    };
  }

  getLastOrder(key: string) {
    return this.lastOrders[key] || null;
  }
  
}
