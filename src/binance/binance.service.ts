import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ParamsDto } from './dto/paramsDto.dto'

@Injectable()
export class BinanceService {
  
  async getP2POrders(paramsDto: ParamsDto): Promise<any> {
    
    try {
      
      const response = await axios.post(
        'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
        {
          fiat: paramsDto.fiat,
          page: 1,
          rows: 1,
          tradeType: paramsDto.tradeType,
          asset: paramsDto.asset,
          payTypes: paramsDto.payTypes,
          additionalKycVerifyFilter: paramsDto.additionalKycVerifyFilter,
          publisherType: paramsDto.publisherType
        },
        {
          headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "content-type": "application/json",
            "Host": "p2p.binance.com",
            "Origin": "https://p2p.binance.com",
          },
        }
      );

      return {responseFromBinance: response.data};
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      throw new Error('Error al obtener las órdenes P2P');
    }
  }
}
