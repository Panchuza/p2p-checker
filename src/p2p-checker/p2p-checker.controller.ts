import { Controller, Get, Query } from '@nestjs/common';
import { P2pCheckerService } from './p2p-checker.service';
import { ParamsDto } from 'src/binance/dto/paramsDto.dto';
import { CronSchedulerService } from 'src/common/helper/cron-scheduler';

@Controller('p2pAlerts')
export class P2pCheckerController {
  constructor(
    private readonly p2pCheckerService: P2pCheckerService,
    private cronSchedulerService: CronSchedulerService

  ) {}

  @Get()
  async checkOrders(@Query() paramsDto: ParamsDto) {
    try {
      
      return await this.cronSchedulerService.executeCron(paramsDto)
  
      // // Ejecutar la lógica de verificación usando el servicio de checker
      // const { res1: usdcOrders, res2: usdtOrders } = await this.p2pCheckerService['binanceService'].getP2POrders(paramsDto);
  
      //  // Transformar las órdenes de USDC
      //  const transformedUSDCOrders = usdcOrders.data.map((order) => ({
      //   nickName: order.advertiser.nickName,
      //   price: order.adv.price,
      //   tradeMethods: order.adv.tradeMethods.map((method) => ({
      //     payType: method.payType,
      //   })),
      //   asset: 'USDC',
      // }));

      // // Transformar las órdenes de USDT
      // const transformedUSDTOrders = usdtOrders.data.map((order) => ({
      //   nickName: order.advertiser.nickName,
      //   price: order.adv.price,
      //   tradeMethods: order.adv.tradeMethods.map((method) => ({
      //     payType: method.payType,
      //   })),
      //   asset: 'USDT',
      // }));

      // // Combinar ambas respuestas en un solo array
      // const combinedOrders = [...transformedUSDCOrders, ...transformedUSDTOrders];

      return  
    } catch (error) {
      console.error('Error en el controlador de órdenes P2P:', error.message);
      return { success: false, message: error.message };
    }  }
}
