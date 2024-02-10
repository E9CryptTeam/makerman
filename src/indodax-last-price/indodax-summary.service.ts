import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

type SummaryResponse = {
  tickers: {
    [key: string]: {
      high: string;
      low: string;
      vol_volt: string;
      vol_usdt: string;
      last: string;
      buy: string;
      sell: string;
      server_time: number;
      name: string;
    };
  };
};

type Summary = [string, number];

@Injectable()
export class IndodaxSummaryService {
  private logger = new Logger(IndodaxSummaryService.name);
  constructor(private readonly httpService: HttpService) {}

  async get() {
    const response = await this.httpService.axiosRef.get<SummaryResponse>(
      'https://indodax.com/api/summaries',
    );
    if (response.status >= 400) {
      this.logger.error('Failed to get summary');
      return;
    }

    const result: Summary[] = [];
    for (const [key, value] of Object.entries(response.data.tickers)) {
      if (key.endsWith('usdt')) {
        continue;
      }
      result.push([key.split('_idr').shift(), parseFloat(value.last)]);
    }

    return result;
  }
}
