import { Module } from "@nestjs/common";
import { OpenflowService } from "src/openflow/openflow.service";

@Module({
  providers: [OpenflowService],
  exports: [OpenflowService],
})
export class OpenflowModule {}
