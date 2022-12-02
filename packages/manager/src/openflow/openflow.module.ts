import { Module } from "@nestjs/common";
import { OpenflowService } from "./openflow.service";
import { CryptModule } from "../crypt/crypt.module";
import { ExecutionWorkerService } from "src/openflow/execution-worker.service";

@Module({
  imports: [CryptModule],
  providers: [OpenflowService, ExecutionWorkerService],
  exports: [OpenflowService],
})
export class OpenflowModule {}
