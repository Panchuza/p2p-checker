import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { P2pCheckerController } from './p2p-checker/p2p-checker.controller';
import { P2pCheckerService } from './p2p-checker/p2p-checker.service';
import { AlertService } from './alert/alert.service';
import { BinanceService } from './binance/binance.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CronSchedulerService } from './common/helper/cron-scheduler';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env'
  }), ScheduleModule.forRoot()],
  controllers: [AppController, P2pCheckerController],
  providers: [
    AppService, P2pCheckerService, AlertService, BinanceService, CronSchedulerService],
})
export class AppModule {}
