import { Injectable } from "@nestjs/common";
import * as cron from 'node-cron'
import { ParamsDto } from "src/binance/dto/paramsDto.dto";
import { CommonException } from "../exception/common-exception.exception";
import { P2pCheckerService } from "src/p2p-checker/p2p-checker.service";

@Injectable()
export class CronSchedulerService {

    private cronJobs: Record<string, cron.ScheduledTask> = {};

    constructor(
        private p2pCheckearService: P2pCheckerService
    ){}
    async executeCron(paramsDto: ParamsDto){
        const key = this.generateKey(paramsDto)
        try {
            if(this.cronJobs[key]){
                throw new CommonException(`El proceso con la key: '${key}' ya está corriendo`, 400)
            }
            const cronJob = await this.executeLogic(paramsDto)
            this.cronJobs[key] = cronJob 
            return {message: `La key: '${key}' fue creada correctamente`}
        } catch (error) {
            throw new CommonException(`Ocurrió un error durante la operación`, 500)
        }
    }

    private generateKey(paramsDto: ParamsDto){
        return `${paramsDto.fiat}_${paramsDto.tradeType}_${paramsDto.asset}_${paramsDto.additionalKycVerifyFilter}_${paramsDto.cronExpression}`
    }

    private async executeLogic(paramsDto: ParamsDto): Promise<cron.ScheduledTask> {

        return cron.schedule(paramsDto.cronExpression, async ()=> {
            this.p2pCheckearService.checkP2POrders(paramsDto)
        })
    }

}