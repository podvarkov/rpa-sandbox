import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { ConfigProvider } from "src/config/config.provider";
import { StripeService } from "src/stripe/stripe.service";

@Injectable()
export class StripeSignatureGuard implements CanActivate {
  private readonly logger = new Logger(StripeSignatureGuard.name);
  constructor(
    private readonly config: ConfigProvider,
    private readonly stripeService: StripeService
  ) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers["stripe-signature"];
    try {
      this.stripeService.constructEvent(
        request.rawBody,
        signature,
        this.config.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed.`, err.stack);
      throw new ForbiddenException();
    }

    return true;
  }
}
