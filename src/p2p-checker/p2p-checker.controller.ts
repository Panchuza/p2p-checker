import { Controller, Get, Delete, Query } from "@nestjs/common"
import type { ParamsDto } from "src/binance/dto/paramsDto.dto"
import { CronSchedulerService } from "src/common/helper/cron-scheduler"
import { BinanceService } from "src/binance/binance.service"
import { P2pCheckerService } from "./p2p-checker.service"
import { PriceHistoryItem } from "./interfaces/price-history.interface"

@Controller("p2pAlerts")
export class P2pCheckerController {
  constructor(
    private readonly binanceService: BinanceService,
    private cronSchedulerService: CronSchedulerService,
    private readonly p2pCheckerService: P2pCheckerService,
  ) {}

  @Get("getAlerts")
  async checkOrders(@Query() paramsDto: ParamsDto) {
    try {
      return await this.cronSchedulerService.executeCron(paramsDto)
    } catch (error) {
      console.error("Error en el controlador de órdenes P2P:", error.message)
      return { success: false, message: error.message }
    }
  }

  @Get("active")
  getActiveJobs() {
    return this.cronSchedulerService.getActiveJobsData()
  }

  @Get("fiat-list")
  getFiatList() {
    try {
      return this.binanceService.getFiatList()
    } catch (error) {
      console.error("Error en el controlador de órdenes P2P:", error.message)
      return { success: false, message: error.message }
    }
  }

  @Get("filter-conditions")
  getFilterConditions(@Query()paramsDto: ParamsDto) {
    try {
      return this.binanceService.getFilterCondition(paramsDto)
    } catch (error) {
      console.error("Error en el controlador de órdenes P2P:", error.message)
      return { success: false, message: error.message }
    }
  }

  @Get("config")
  getConfig(@Query() paramsDto: ParamsDto) {
    try {
      return this.binanceService.getConfig(paramsDto)
    } catch (error) {
      console.error("Error en el controlador de órdenes P2P:", error.message)
      return { success: false, message: error.message }
    }
  }

  // 🚀 Nuevos endpoints para historial de precios
  @Get("price-history")
  getPriceHistory(): PriceHistoryItem[] {
    try {
      return this.p2pCheckerService.getPriceHistory()
    } catch (error) {
      console.error("Error al obtener historial de precios:", error.message)
      return []
    }
  }

  @Delete("price-history")
  clearPriceHistory() {
    try {
      this.p2pCheckerService.clearPriceHistory()
      return { success: true, message: "Historial limpiado exitosamente" }
    } catch (error) {
      console.error("Error al limpiar historial de precios:", error.message)
      return { success: false, message: error.message }
    }
  }
}
