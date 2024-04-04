import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { BinanceTicker, IndodaxTicker } from 'src/entities';
import { Signal } from 'src/entities/singal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComparatorScheduler {
  private readonly logger = new Logger(ComparatorScheduler.name);

  private exchanges = ['indodax', 'binance'];

  constructor(
    @InjectRepository(IndodaxTicker)
    private readonly indodaxTickerRepository: Repository<IndodaxTicker>,
    @InjectRepository(BinanceTicker)
    private readonly binanceTickerRepository: Repository<BinanceTicker>,

    @InjectRepository(Signal)
    private readonly signalRepository: Repository<Signal>,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async handleIndodax() {
    const indodaxQueryBuilder = this.indodaxTickerRepository
      .createQueryBuilder('indodax_ticker')
      .select('indodax_ticker.symbol', 'symbol')
      .addSelect('indodax_ticker.price', 'buy_price')
      .addSelect('binance_ticker.price', 'sell_price')
      .addSelect("'indodax - binance'", 'route')
      .addSelect(
        'ROUND( ((binance_ticker.price - indodax_ticker.price) / indodax_ticker.price) * 100, 2 )',
        'percentage_difference',
      )
      .innerJoin(
        'binance_ticker',
        'binance_ticker',
        'indodax_ticker.symbol = binance_ticker.symbol',
      )
      .where('indodax_ticker.price < binance_ticker.price');

    const binanceQueryBuilder = this.binanceTickerRepository
      .createQueryBuilder('binance_ticker')
      .select('binance_ticker.symbol', 'symbol')
      .addSelect('binance_ticker.price', 'buy_price')
      .addSelect('indodax_ticker.price', 'sell_price')
      .addSelect("'binance - indodax'", 'route')
      .addSelect(
        'ROUND( ((indodax_ticker.price - binance_ticker.price) / binance_ticker.price) * 100, 2 )',
        'percentage_difference',
      )
      .innerJoin(
        'indodax_ticker',
        'indodax_ticker',
        'binance_ticker.symbol = indodax_ticker.symbol',
      )
      .where('binance_ticker.price < indodax_ticker.price');

    const indodaxQuery = indodaxQueryBuilder.getQuery();
    const binanceQuery = binanceQueryBuilder.getQuery();

    const results = await this.indodaxTickerRepository.query(
      `${indodaxQuery}
      UNION
      ${binanceQuery}
      ORDER BY percentage_difference DESC`,
    );

    const signals = results.map((r) => {
      const signal = new Signal();
      signal.id = `${r.symbol}-indodax-binance`;
      signal.symbol = r.symbol;
      signal.route = r.route;
      signal.percentage = r.percentage_difference;
      signal.buy = r.buy_price;
      signal.sell = r.sell_price;
      return signal;
    });

    await this.signalRepository.save(signals);
  }

  /*@Cron(CronExpression.EVERY_SECOND)
  async handleBinance() {
    const query =
      this.binanceTickerRepository.createQueryBuilder('binance_ticker');
    query.select('binance_ticker.symbol', 'symbol');
    query.addSelect('binance_ticker.price', 'buy_price');
    query.addSelect('indodax_ticker.price', 'sell_price');
    query.addSelect("'binance - indodax'", 'route');
    query.addSelect(
      'ROUND( ((indodax_ticker.price - binance_ticker.price) / binance_ticker.price) * 100, 2 )',
      'percentage_difference',
    );

    query.innerJoin(
      'indodax_ticker',
      'indodax_ticker',
      'binance_ticker.symbol = indodax_ticker.symbol',
    );

    query.where('binance_ticker.price < indodax_ticker.price');

    const results = await query.getRawMany();

    const signals = results.map((r) => {
      const signal = new Signal();
      signal.id = `${r.symbol}-binance-indodax`;
      signal.symbol = r.symbol;
      signal.route = r.route;
      signal.percentage = r.percentage_difference;
      signal.buy = r.buy_price;
      signal.sell = r.sell_price;
      return signal;
    });

    await this.signalRepository.save(signals);
  }
  */
}
