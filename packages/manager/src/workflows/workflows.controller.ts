import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { CreateWorkflowDto } from "./create-workflow.dto";
import { Session } from "../auth/auth.service";
import { ExecuteWorkflowDto } from "src/workflows/execute-workflow.dto";

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
    @Body() body: CreateWorkflowDto,
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
  @UseGuards(JwtAuthGuard)
  async get(@Param("id") id: string, @UserSession() session: Session) {
    return this.workflowsService.get(session.jwt, id);
  }
}
