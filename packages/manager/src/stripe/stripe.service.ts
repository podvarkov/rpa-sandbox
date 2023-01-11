import { Injectable } from "@nestjs/common";
import { Stripe } from "stripe";
import { ConfigProvider } from "../config/config.provider";
import { Session } from "../auth/auth.service";
import { CryptService } from "src/crypt/crypt.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class StripeService {
  private readonly stripe = new Stripe(this.configProvider.STRIPE_SECRET, {
    apiVersion: "2022-11-15",
  });
  constructor(
    private readonly configProvider: ConfigProvider,
    private readonly usersService: UsersService,
    private readonly cryptService: CryptService
  ) {}

  constructEvent(body: Buffer, signature: string, endpointSecret: string) {
    return this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
  }

  async getSubscription(session: Session) {
    const user = await this.usersService.getUser(session.jwt);
    if (user.stripeSubscriptionId) {
      return this.stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
        expand: ["customer"],
      });
    }

    return null;
  }

  async removeSubscription(stripeCustomerId: string) {
    const user = await this.usersService.getUser(this.cryptService.rootToken, {
      stripeCustomerId,
    });

    if (user.stripeProductId) {
      await this.usersService.removeRoleMember(user.stripeProductId, user);
    }
  }

  async updateStripeInfo(stripeSessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(
      stripeSessionId,
      { expand: ["subscription"] }
    );
    const user = await this.usersService.getUser(this.cryptService.rootToken, {
      _id: session.client_reference_id,
    });

    if (user.stripeProductId) {
      await this.usersService.removeRoleMember(user.stripeProductId, user);
    }

    user.stripeCustomerId = session.customer as string;
    user.stripeSubscriptionId = (
      session.subscription as Stripe.Subscription
    ).id;
    user.stripeLastSessionId = session.id;
    user.stripeProductId = (
      session.subscription as unknown as Stripe.SubscriptionItem
    ).plan.product as string;

    await this.usersService.updateUser(user);

    await this.usersService.addRoleMember(
      (session.subscription as unknown as Stripe.SubscriptionItem).plan
        .product as string,
      user
    );
  }
  async createCheckoutSession(session: Session, price) {
    const user = await this.usersService.getUser(session.jwt, {});
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      success_url: `${this.configProvider.DOMAIN}/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configProvider.DOMAIN}/payments?cancelled=true`,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: session.user._id,
      metadata: {
        client_reference_id: session.user._id,
      },
      mode: "subscription",
    };

    if (user.stripeCustomerId) {
      sessionOptions.customer = user.stripeCustomerId;
    } else {
      sessionOptions.customer_email = session.user.username;
    }

    const stripeSession = await this.stripe.checkout.sessions.create({
      ...sessionOptions,
    });

    return stripeSession.url;
  }

  updateCustomer(
    customerId: string,
    updateParams: Stripe.CustomerUpdateParams
  ) {
    return this.stripe.customers.update(customerId, updateParams);
  }
}
