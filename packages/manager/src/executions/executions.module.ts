import { Module } from "@nestjs/common";
import { OpenflowModule } from "../openflow/openflow.module";
import { ExecutionsController } from "./executions.controller";
import { ExecutionsService } from "./executions.service";
import { ExecutionWorkerService } from "./execution-worker.service";
import { TemplatesModule } from "../templates/templates.module";
import { CryptModule } from "src/crypt/crypt.module";

@Module({
  imports: [OpenflowModule, TemplatesModule, CryptModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, ExecutionWorkerService],
})
export class ExecutionsModule {}
