import { Module } from '@nestjs/common';
import { AiGradingService } from './ai-grading.service';

@Module({
  providers: [AiGradingService],
  exports: [AiGradingService],
})
export class AiGradingModule {}
