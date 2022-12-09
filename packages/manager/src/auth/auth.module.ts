import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { OpenflowModule } from "../openflow/openflow.module";
import { CryptModule } from "src/crypt/crypt.module";

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    OpenflowModule,
    CryptModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
