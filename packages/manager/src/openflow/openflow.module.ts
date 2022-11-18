import { Module } from "@nestjs/common";
import { OpenflowService } from "src/openflow/openflow.service";
import { CryptModule } from "src/crypt/crypt.module";

@Module({
  imports: [CryptModule],
  providers: [OpenflowService],
  exports: [OpenflowService],
})
export class OpenflowModule {}
