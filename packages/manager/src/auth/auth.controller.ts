import {
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
} from "@nestjs/common";
import { LocalAuthGuard } from "./local.strategy";
import { AuthService } from "./auth.service";
import { SignUpParamsDto } from "./sign-up-params.dto";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("signin")
  signIn(@Request() req) {
    return req.user;
  }

  @UsePipes(new ValidationPipe())
  @Post("signup")
  signUp(@Body() params: SignUpParamsDto) {
    return this.authService.createUser(params.username, params.password);
  }
}
