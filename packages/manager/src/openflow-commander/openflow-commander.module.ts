import { Module } from "@nestjs/common";
import { OpenflowCommanderService } from "./openflow-commander.service";

@Module({
  providers: [OpenflowCommanderService],
  exports: [OpenflowCommanderService],
})
export class OpenflowCommanderModule {}
