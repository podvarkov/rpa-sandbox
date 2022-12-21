import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt.strategy";
import { SendInquiryDto } from "src/auth/update-profile.dto";
import * as axios from "axios";

@Controller()
export class AppController {
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post("/api/inquire")
  async updateProfile(@Body() body: SendInquiryDto) {
    return (
      axios
        //@ts-expect-error types
        .post(
          "https://coreus-rpa.dev.app.thezeroone.io/api/wf/webhook/240d7e1e-2382-49f0-a314-5554c89496b9",
          body
        )
        .then(({ data }) => data)
    );
  }
}
