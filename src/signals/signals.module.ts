import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Signal } from 'src/entities/singal.entity';

@Module({
  controllers: [SignalsController],
  providers: [SignalsService],
  imports: [TypeOrmModule.forFeature([Signal])],
})
export class SignalsModule {}
