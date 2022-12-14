import { Controller, Delete, Get, Param, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";

@Controller("api/reports")
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@UserSession() session: Session) {
    return this.reportService.findAll(session);
  }

  @Get("download/:id")
  @UseGuards(JwtAuthGuard)
  download(@UserSession() session: Session, @Param("id") id: string) {
    return this.reportService.downloadFile(session, id);
  }

  @Delete("/:id")
  @UseGuards(JwtAuthGuard)
  delete(@UserSession() session: Session, @Param("id") id: string) {
    return this.reportService.delete(session, id);
  }
}
