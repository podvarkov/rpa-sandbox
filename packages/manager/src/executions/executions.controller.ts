import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ExecutionsService } from "./executions.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";
import { GetExecutionsQueryParamsDto } from "./get-executions-query-params.dto";
import { ExecuteWorkflowDto } from "./execute-workflow.dto";

@Controller("api/executions")
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(
    @UserSession() session: Session,
    @Query() queryParams: GetExecutionsQueryParamsDto
  ) {
    return this.executionsService.findAll(session.jwt, queryParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @UserSession() session: Session) {
    return this.executionsService.findOne(session.jwt, id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(JwtAuthGuard)
  async execute(
    @UserSession() session: Session,
    @Body() body: ExecuteWorkflowDto
  ) {
    return this.executionsService.execute(session, body);
  }
}
