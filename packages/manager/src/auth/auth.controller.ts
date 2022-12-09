import {
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  ClassSerializerInterceptor,
  UseInterceptors,
  SerializeOptions,
} from "@nestjs/common";
import { LocalAuthGuard } from "./local.strategy";
import { AuthService, Session } from "./auth.service";
import { SignUpParamsDto } from "./sign-up-params.dto";
import { JwtAuthGuard, UserSession } from "src/auth/jwt.strategy";
import { UpdateUserDto } from "src/auth/update-user.dto";
import { UserProfileEntity } from "src/auth/userProfileEntity";

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

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ excludeExtraneousValues: true })
  async getProfile(
    @UserSession() session: Session
  ): Promise<UserProfileEntity> {
    const user = await this.authService.getUser(session);
    return new UserProfileEntity(user);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ excludeExtraneousValues: true })
  @Post("profile")
  async updateProfile(
    @UserSession() session: Session,
    @Body() body: UpdateUserDto
  ) {
    const user = await this.authService.updateUser(session, body);
    return new UserProfileEntity(user);
  }
}
