import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Query,
  Redirect,
  UseGuards,
} from "@nestjs/common";
import { Stripe } from "stripe";
import { StripeService } from "./stripe.service";
import { JwtAuthGuard, UserSession } from "../auth/jwt.strategy";
import { Session } from "../auth/auth.service";
import { StripeSignatureGuard } from "./stripe-signature.guard";

@Controller()
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(private readonly stripeService: StripeService) {}
  @Post("api/payments/webhook")
  @HttpCode(200)
  @UseGuards(StripeSignatureGuard)
  async handleStripeEvent(@Body() event: Stripe.Event) {
    this.logger.debug({ message: "stripe webhook received", event });
    try {
      switch (event.type) {
        case "customer.subscription.deleted":
          await this.stripeService.removeSubscription(
            event.data.object["customer"]
          );
          break;
        case "customer.subscription.updated":
          await this.stripeService.updateSubscription(event.data);
          break;
        default:
          this.logger.debug(`Unhandled stripe event: ${event.type}`);
      }
    } catch (error) {
      this.logger.error({ message: "Error processing stripe event", error });
    }
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

  @Get("payments/portal")
  @UseGuards(JwtAuthGuard)
  @Redirect("", 303)
  async createPortalSession(
    @Param("price") priceId: string,
    @UserSession() session: Session
  ) {
    return {
      url: await this.stripeService.createPortalSession(session),
    };
  }

  @Get("api/payments/subscription")
  @UseGuards(JwtAuthGuard)
  async getSubscription(@UserSession() session: Session) {
    return this.stripeService.getSubscription(session);
  }
}
