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
import { SchedulerService } from "./scheduler.service";
import { UpsertTaskDto } from "./upsert-task.dto";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";

@Controller("api/schedule")
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get("/events")
  @UseGuards(JwtAuthGuard)
  findAll(@UserSession() session: Session) {
    return this.schedulerService.findEvents(session.jwt);
  }

  @Get("/events/:id")
  @UseGuards(JwtAuthGuard)
  findOne(@UserSession() session: Session, @Param("id") id: string) {
    return this.schedulerService.findEvent(session.jwt, id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post()
  upsert(@UserSession() session: Session, @Body() body: UpsertTaskDto) {
    if (body._id) return this.schedulerService.updateEvent(session.jwt, body);
    return this.schedulerService.createEvent(session.jwt, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/:id")
  delete(@UserSession() session: Session, @Param("id") id: string) {
    return this.schedulerService.deleteEvent(session.jwt, id);
  }
}
