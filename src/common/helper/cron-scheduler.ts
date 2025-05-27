import { Injectable } from "@nestjs/common"
import * as cron from "node-cron"
import type { ParamsDto } from "src/binance/dto/paramsDto.dto"
import { CommonException } from "../exception/common-exception.exception"
import { P2pCheckerService } from "src/p2p-checker/p2p-checker.service"
import { BinanceService } from "src/binance/binance.service"

@Injectable()
export class CronSchedulerService {
  private cronJobs: Record<string, cron.ScheduledTask> = {}

  constructor(
    private p2pCheckearService: P2pCheckerService,
    private binancerService: BinanceService,
  ) {}

  async executeCron(paramsDto: ParamsDto) {
    const key = this.generateKey(paramsDto)
    if (this.cronJobs[key]) {
      throw new CommonException(`El proceso con la key: '${key}' ya está corriendo`, 400)
    }

    const cronJob = await this.executeLogic(paramsDto, key)
    this.cronJobs[key] = cronJob
    return { success: true, message: `Proceso iniciado con clave ${key}` }
  }

  // 🚀 FUNCIÓN CORREGIDA para generar la key
  private generateKey(paramsDto: ParamsDto) {
    // Usar un separador especial para la expresión cron
    const cronExpressionEncoded = paramsDto.cronExpression.replace(/ /g, "_SPACE_").replace(/\*/g, "_ASTERISK_")

    return [
      paramsDto.fiat,
      paramsDto.tradeType,
      paramsDto.asset,
      paramsDto.payTypes?.join("-") ?? "none",
      paramsDto.publisherType ?? "none",
      cronExpressionEncoded,
    ].join("|") // Usar | como separador principal
  }

  private async executeLogic(paramsDto: ParamsDto, key: string): Promise<cron.ScheduledTask> {
    return cron.schedule(paramsDto.cronExpression, async () => {
      const responseFromBinance = await this.binancerService.getP2POrders(paramsDto)
      await this.p2pCheckearService.checkP2POrders(responseFromBinance, paramsDto)
    })
  }

  getActiveJobsData() {
    return Object.keys(this.cronJobs).map((key) => {
      const lastOrder = this.p2pCheckearService.getLastOrder(key)
      return { key, ...lastOrder }
    })
  }
}
