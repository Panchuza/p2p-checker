import { Controller, Get, Query } from '@nestjs/common';
import { P2pCheckerService } from './p2p-checker.service';
import { ParamsDto } from 'src/binance/dto/paramsDto.dto';
import { CronSchedulerService } from 'src/common/helper/cron-scheduler';

@Controller('p2pAlerts')
export class P2pCheckerController {
  constructor(
    private readonly p2pCheckerService: P2pCheckerService,
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

}
