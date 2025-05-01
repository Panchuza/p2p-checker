import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AlertService {

  async sendTelegramAlert(message: string): Promise<void> {

    try {
      //Llamado al API de Telegram, se envia como variable de entorno el Chat Id del usuario
      const url = `https://api.telegram.org/bot7752866081:AAEvX9IqoaIACDFKWfwA6dVTidH26Iz7cMw/sendMessage`;
      await axios.post(url, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

    } catch (error) {
      throw new HttpException('Error en el llamado de Axios a Telegram', HttpStatus.BAD_REQUEST)
    }
  }
}
