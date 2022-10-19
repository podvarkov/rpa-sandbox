import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigProvider } from "../config/config.provider";
import { Session } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigProvider) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.OPENFLOW_AES_SECRET,
    });
  }

  async validate(payload) {
    return payload.data;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

export const UserSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    return { user: request.user, jwt: token } as Session;
  }
);
