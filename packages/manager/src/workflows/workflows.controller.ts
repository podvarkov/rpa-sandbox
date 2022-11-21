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
import { WorkflowsService } from "./workflows.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";
import { UpsertWorkflowDto } from "./upsert-workflow.dto";
import { ExecuteWorkflowDto } from "./execute-workflow.dto";
import { GetWorkflowQueryParamsDto } from "./get-workflow-query-params.dto";

@Controller("api/workflows")
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post("execute")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(JwtAuthGuard)
  async execute(
    @UserSession() session: Session,
    @Body() body: ExecuteWorkflowDto
  ) {
    return this.workflowsService.execute(session.jwt, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@UserSession() session: Session) {
    return this.workflowsService.list(session.jwt);
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
  async get(
    @Query() queryParams: GetWorkflowQueryParamsDto,
    @Param("id") id: string,
    @UserSession() session: Session
  ) {
    if (queryParams.withTemplate) {
      return this.workflowsService.getWithTemplate(session.jwt, id);
    }
    return this.workflowsService.get(session.jwt, id);
  }
}
