import { Injectable } from '@nestjs/common';
import { AlertService } from 'src/alert/alert.service';
import { BinanceService } from 'src/binance/binance.service';
import { ParamsDto } from 'src/binance/dto/paramsDto.dto';
import { CommonException } from 'src/common/exception/common-exception.exception';

@Injectable()
export class P2pCheckerService {
  private lastPrices: Record<string, number> = {}; 

  constructor(
    private readonly binanceService: BinanceService,
    private readonly alertService: AlertService,
  ) {}

  async checkP2POrders(paramsDto: ParamsDto) {
    try {

      if (!this.lastPrices[paramsDto.fiat]) {
        this.lastPrices[paramsDto.fiat] = Infinity;
      }

      const orders = await this.binanceService.getP2POrders(paramsDto);
    
      if (orders.data && orders.data.length > 0) {
        const currentPrice = parseFloat(orders.data[0].adv.price);
        const currentPriceId: string = `${new Date()}-${currentPrice}`;
        const newPriceId: string = `${new Date()}-${parseFloat(orders.data[0].adv.price)}`;

        if (currentPrice < this.lastPrices[paramsDto.fiat] || currentPriceId !== newPriceId) {
          const paymentMethods = orders.data[0].adv.tradeMethods
            .map((method) => method.payType)
            .join(', ');

          await this.alertService.sendTelegramAlert(
            `------------------Nueva Alerta--------------------\n` +
            `Nueva orden P2P: ${currentPrice} ${paramsDto.asset}/${paramsDto.fiat}\n` +
            `Generada por: ${orders.data[0].advertiser.nickName}\n` +
            `Acepta los siguientes métodos de pago: ${paymentMethods}\n` +
            `------------------Nueva Alerta--------------------`
          );

          this.lastPrices[paramsDto.fiat] = currentPrice;
        }
      } else {
        throw new CommonException(`No se encontraron órdenes de ${paramsDto.fiat}.`, 400);
      }
    } catch (error) {
      throw new CommonException(`Ocurrió un error durante la operación. Error: ${error.message}`, 500);
    }
  }
}