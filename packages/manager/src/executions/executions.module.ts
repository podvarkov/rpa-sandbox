import { Module } from "@nestjs/common";
import { ExecutionsController } from "./executions.controller";
import { ExecutionsService } from "./executions.service";
import { OpenflowModule } from "../openflow/openflow.module";

@Module({
  imports: [OpenflowModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}
