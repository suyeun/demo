import { Module, forwardRef } from '@nestjs/common';

import * as ApplicationModules from '../application/application.modules';
import * as Controllers from './controllers';
import * as Repositories from './repositories';
import * as Services from './services';

@Module({
  imports: [forwardRef(() => ApplicationModules.ApplicationModules)],
  controllers: [...Object.values(Controllers)],
  providers: [...Object.values(Services), ...Object.values(Repositories)],
})
export class PushModule {}
