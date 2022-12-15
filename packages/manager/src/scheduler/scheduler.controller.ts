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
import { SchedulerService } from "./scheduler.service";
import { UpsertEventDto } from "src/scheduler/upsert-event.dto";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";
import { GetEventsQueryParamsDto } from "src/scheduler/get-events-query-params.dto";

@Controller("api/schedule")
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get("/events")
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(
    @UserSession() session: Session,
    @Query() queryParams: GetEventsQueryParamsDto
  ) {
    return this.schedulerService.findEvents(session.jwt, {}, queryParams);
  }

  @Get("/events/:id")
  @UseGuards(JwtAuthGuard)
  findOne(@UserSession() session: Session, @Param("id") id: string) {
    return this.schedulerService.findEvent(session.jwt, id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post()
  upsert(@UserSession() session: Session, @Body() body: UpsertEventDto) {
    if (body._id) return this.schedulerService.updateEvent(session.jwt, body);
    return this.schedulerService.createEvent(session.jwt, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/:id")
  delete(@UserSession() session: Session, @Param("id") id: string) {
    return this.schedulerService.deleteEvent(session.jwt, id);
  }

  @Get("/test") test() {
    return this.schedulerService.executeScheduledWorkflows();
  }
}
