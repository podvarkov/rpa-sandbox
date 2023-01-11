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
  BadRequestException,
} from "@nestjs/common";
import { LocalAuthGuard } from "./local.strategy";
import { AuthService, Session } from "./auth.service";
import { SignUpParamsDto } from "./sign-up-params.dto";
import { JwtAuthGuard, UserSession } from "./jwt.strategy";
import { UpdateProfileDto } from "./update-profile.dto";
import { UserProfileEntity } from "./user-profile.entity";
import { UsersService } from "../users/users.service";
import { StripeService } from "src/stripe/stripe.service";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("signin")
  signIn(@Request() req) {
    return req.user;
  }

  @UsePipes(new ValidationPipe())
  @Post("signup")
  signUp(@Body() params: SignUpParamsDto) {
    return this.usersService.createUser(params.username, params.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ excludeExtraneousValues: true, groups: ["includeSales"] })
  async getProfile(
    @UserSession() session: Session
  ): Promise<UserProfileEntity> {
    const profile = await this.usersService.getUser(session.jwt, {
      _id: session.user._id,
    });
    if (!profile) throw new BadRequestException("User profile not found!");
    const salesManager = await this.usersService.getSalesMember(
      profile.salesManagerId
    );
    return new UserProfileEntity(profile, salesManager);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ excludeExtraneousValues: true })
  @Post("profile")
  async updateProfile(
    @UserSession() session: Session,
    @Body() body: UpdateProfileDto
  ) {
    const profile = await this.usersService.updateUserProfile(session, body);
    await this.stripeService.updateCustomer(profile.stripeCustomerId, {
      email: profile.username,
    });
    return new UserProfileEntity(profile);
  }
}
