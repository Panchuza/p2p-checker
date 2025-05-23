import { Controller, Get, Query } from '@nestjs/common';
import { ParamsDto } from 'src/binance/dto/paramsDto.dto';
import { CronSchedulerService } from 'src/common/helper/cron-scheduler';
import { BinanceService } from 'src/binance/binance.service';

@Controller('p2pAlerts')
export class P2pCheckerController {
  constructor(
    private readonly binanceService: BinanceService,
    private cronSchedulerService: CronSchedulerService

  ) { }

  @Get('getAlerts')
  async checkOrders(@Query() paramsDto: ParamsDto) {
    try {

      return await this.cronSchedulerService.executeCron(paramsDto)

    } catch (error) {
      console.error('Error en el controlador de órdenes P2P:', error.message);
      return { success: false, message: error.message };
    }
  }

  @Get('active')
  getActiveJobs() {
    return this.cronSchedulerService.getActiveJobsData();
  }

  @Get('fiat-list')
  getFiatList() {
    try {
      return this.binanceService.getFiatList();
    } catch (error) {
      console.error('Error en el controlador de órdenes P2P:', error.message);
      return { success: false, message: error.message };
    }
  }

  @Get('filter-conditions')
  getFilterConditions(@Query() paramsDto: ParamsDto) {
    try {
      return this.binanceService.getFilterCondition(paramsDto);
    } catch (error) {
      console.error('Error en el controlador de órdenes P2P:', error.message);
      return { success: false, message: error.message };
    }
  }

  @Get('config')
  getConfig(@Query() paramsDto: ParamsDto) {
    try {
      return this.binanceService.getConfig(paramsDto);
    } catch (error) {
      console.error('Error en el controlador de órdenes P2P:', error.message);
      return { success: false, message: error.message };
    }
  }

}
