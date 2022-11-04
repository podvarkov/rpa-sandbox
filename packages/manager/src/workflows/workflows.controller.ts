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

@Controller("api/workflows")
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

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
}
