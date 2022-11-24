import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ExecutionsService } from "./executions.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";
import { GetExecutionsQueryParamsDto } from "./get-executions-query-params.dto";

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
}
