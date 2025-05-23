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

      return { responseFromBinance: response.data };
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      throw new Error('Error al obtener las órdenes P2P');
    }
  }

  async getFiatList(): Promise<any> {

    try {

      const response = await axios.post(
        'https://p2p.binance.com/bapi/c2c/v1/friendly/c2c/trade-rule/fiat-list', //Muestra la lista de todos los fiats posibles, data[0].currencyCode
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

      return { responseFromBinance: response.data };
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      throw new Error('Error al obtener la lista de fiats');
    }
  }

  async getFilterCondition(paramsDto: ParamsDto): Promise<any> {

    try {

      const response = await axios.post(
        'https://p2p.binance.com/bapi/c2c/v2/public/c2c/adv/filter-conditions', //Sacar del tradeMethods lo metodos de pago y si se quiere el periodo de pago desde periods
        {
          fiat: paramsDto.fiat,
          "classifies": [
            "mass",
            "profession",
            "fiat_trade"
          ]
        },
        {
          headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "es-419,es;q=0.9",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "content-type": "application/json",
            "Host": "p2p.binance.com",
            "Origin": "https://p2p.binance.com",
          },
        }
      );

      return { responseFromBinance: response.data };
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      throw new Error('Error al obtener los filtros de las condiciones');
    }
  }

  async getConfig(paramsDto: ParamsDto): Promise<any> { 
    try {

      const response = await axios.post(
        'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/portal/config',
        {
          fiat: paramsDto.fiat,
        },
        {
          headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "es-419,es;q=0.9",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "content-type": "application/json",
            "Host": "p2p.binance.com",
            "Origin": "https://p2p.binance.com",
          },
        }
      );

      return { responseFromBinance: response.data };
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      throw new Error('Error al obtener los filtros de las condiciones');
    }
  }
}
