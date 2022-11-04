import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";

@Controller("api/templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  listTemplates(@UserSession() session: Session) {
    return this.templatesService.listTemplates(session.jwt);
  }

  @Get(":type/:id")
  @UseGuards(JwtAuthGuard)
  getTemplate(
    @UserSession() session: Session,
    @Param("id") id: string,
    @Param("type") type: string
  ) {
    return this.templatesService.getTemplate(session.jwt, id, type);
  }
}
