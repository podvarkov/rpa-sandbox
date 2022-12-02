import { Module } from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { TemplatesController } from "./templates.controller";
import { OpenflowModule } from "../openflow/openflow.module";

@Module({
  imports: [OpenflowModule],
  providers: [TemplatesService],
  controllers: [TemplatesController],
})
export class TemplatesModule {}
