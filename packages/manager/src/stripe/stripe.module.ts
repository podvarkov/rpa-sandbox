import { Module } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { StripeController } from "./stripe.controller";
import { CryptModule } from "src/crypt/crypt.module";
import { UsersModule } from "src/users/users.module";

@Module({
  providers: [StripeService],
  controllers: [StripeController],
  imports: [CryptModule, UsersModule],
})
export class StripeModule {}
