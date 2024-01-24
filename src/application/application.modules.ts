import { Module } from '@nestjs/common';

import * as Modules from './services';

@Module({
  imports: [...Object.values(Modules)],
  controllers: [],
  exports: [...Object.values(Modules)],
  providers: [],
})
export class ApplicationModules {}
