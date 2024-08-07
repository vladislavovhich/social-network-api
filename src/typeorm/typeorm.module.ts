import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { provider } from './typeorm.provider';

@Global()  
@Module({
  imports: [],
  providers: [provider],
  exports: [DataSource],
})
export class TypeormModule {}
