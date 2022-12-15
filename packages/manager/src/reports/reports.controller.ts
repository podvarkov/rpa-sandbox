import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";
import { GetReportsQueryParamsDto } from "src/reports/get-reports-query-params.dto";

@Controller("api/reports")
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(
    @UserSession() session: Session,
    @Query() queryParams: GetReportsQueryParamsDto
  ) {
    return this.reportService.findAll(session, {}, queryParams);
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
