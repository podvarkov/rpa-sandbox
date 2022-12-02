import { Module } from "@nestjs/common";
import { OpenflowService } from "./openflow.service";
import { CryptModule } from "../crypt/crypt.module";

@Module({
  imports: [CryptModule],
  providers: [OpenflowService],
  exports: [OpenflowService],
})
export class OpenflowModule {}
