import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Session } from "../auth/auth.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { GetWorkflowQueryParamsDto } from "./get-workflow-query-params.dto";
import { UpsertWorkflowDto } from "./upsert-workflow.dto";
import { WorkflowsService } from "./workflows.service";

//TODO restrict by subscription plan
@Controller("api/workflows")
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@UserSession() session: Session) {
    return this.workflowsService.findAll(session.jwt);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseGuards(JwtAuthGuard)
  async upsert(
    @Body() body: UpsertWorkflowDto,
    @UserSession() session: Session
  ) {
    return this.workflowsService.upsert(session.jwt, body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(@Param("id") id: string, @UserSession() session: Session) {
    return this.workflowsService.delete(session.jwt, id);
  }

  @Get(":id")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Query() queryParams: GetWorkflowQueryParamsDto,
    @Param("id") id: string,
    @UserSession() session: Session
  ) {
    if (queryParams.withTemplate) {
      return this.workflowsService.findOneWithTemplate(session.jwt, id);
    }
    return this.workflowsService.findOne(session.jwt, id);
  }
}
