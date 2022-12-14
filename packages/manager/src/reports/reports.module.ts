import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { OpenflowModule } from "src/openflow/openflow.module";
import { CryptModule } from "src/crypt/crypt.module";

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [OpenflowModule, CryptModule],
})
export class ReportsModule {}
