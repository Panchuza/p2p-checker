import { Module } from '@nestjs/common';
import { P2pCheckerService } from './p2p-checker.service';
import { P2pCheckerController } from './p2p-checker.controller';

@Module({
  controllers: [P2pCheckerController],
  providers: [P2pCheckerService],
})
export class P2pCheckerModule {}
