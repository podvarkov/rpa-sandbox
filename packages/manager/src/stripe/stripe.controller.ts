import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  UseGuards,
} from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";
import { StripeSignatureGuard } from "./stripe-signature.guard";

@Controller()
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  @Post("api/payments/webhook")
  @UseGuards(StripeSignatureGuard)
  testHooks(@Body() body: { [key: string]: unknown }) {
    console.log("WEBHOOK BODY", body);
  }
  @Get("payments")
  @Redirect("/profile", 303)
  async completeCheckoutSession(
    @Query()
    query: {
      cancelled?: boolean;
      success?: boolean;
      session_id?: string;
    }
  ) {
    if (query.success && query.session_id) {
      await this.stripeService.updateStripeInfo(query.session_id);
    }
  }

  @Get("payments/checkout/:price")
  @UseGuards(JwtAuthGuard)
  @Redirect("", 303)
  async createCheckoutSession(
    @Param("price") priceId: string,
    @UserSession() session: Session
  ) {
    return {
      url: await this.stripeService.createCheckoutSession(session, priceId),
    };
  }

  @Get("api/payments/subscription")
  @UseGuards(JwtAuthGuard)
  async getSubscription(@UserSession() session: Session) {
    return this.stripeService.getSubscription(session);
  }
}
