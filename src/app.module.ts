import { Module } from '@nestjs/common';
import { BatchModule } from './batch/batch.module';
@Module({
  imports: [BatchModule],
})
export class AppModule {}
