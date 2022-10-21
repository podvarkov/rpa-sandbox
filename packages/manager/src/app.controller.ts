import { Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./auth/jwt.strategy";
import { OpenflowCommanderService } from "./openflow-commander/openflow-commander.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private commander: OpenflowCommanderService
  ) {}

  @Get()
  // @UseGuards(JwtAuthGuard)
  async getHello() {
    return Promise.all([
      this.commander.listFormWorkflows(),
      this.commander.listRobotWorkflows(),
    ]).then((results) => results.flatMap(({ data }) => data));
  }
}
