import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";

@Controller("api/templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@UserSession() session: Session) {
    return this.templatesService.findAll(session.jwt);
  }

  @Get(":type/:id")
  @UseGuards(JwtAuthGuard)
  findOne(@UserSession() session: Session, @Param("id") id: string) {
    return this.templatesService.findOne(session.jwt, id);
  }
}
