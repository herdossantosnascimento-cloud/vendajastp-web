import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

export const createStripeCheckoutSession = onCall(
  {
    secrets: [stripeSecretKey],
  },
  async (request) => {
    const auth = request.auth;
    if (!auth?.uid) {
      throw new HttpsError("unauthenticated", "Login required.");
    }

    const plan = String((request.data as any)?.plan || "").trim() as "monthly" | "annual";

    if (plan !== "monthly" && plan !== "annual") {
      throw new HttpsError("invalid-argument", "Invalid plan.");
    }

    try {
      const secretValue = stripeSecretKey.value();
      logger.info("createStripeCheckoutSession start", {
        hasSecret: Boolean(secretValue),
        secretPrefix: secretValue ? secretValue.slice(0, 7) : "",
        uid: auth.uid,
        plan,
      });

      const stripe = new Stripe(secretValue);

      const origin =
        String((request.data as any)?.origin || "").trim() ||
        "http://localhost:3010";

      const amount = plan === "annual" ? 1500 : 500;
      const planLabel = plan === "annual" ? "Plano Anual" : "Plano Mensal";

      logger.info("createStripeCheckoutSession payload", {
        origin,
        amount,
        planLabel,
        email: auth.token.email ? String(auth.token.email) : null,
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${origin}/pricing?stripe=success&plan=${plan}`,
        cancel_url: `${origin}/payment/stripe?plan=${plan}&cancelled=1`,
        customer_email: auth.token.email ? String(auth.token.email) : undefined,
        metadata: {
          uid: auth.uid,
          plan,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              product_data: {
                name: `VendaJá STP - ${planLabel}`,
                description:
                  plan === "annual"
                    ? "Subscrição anual do VendaJá STP"
                    : "Subscrição mensal do VendaJá STP",
              },
              unit_amount: amount,
            },
          },
        ],
      });

      logger.info("createStripeCheckoutSession session created", {
        hasUrl: Boolean(session.url),
        sessionId: session.id,
      });

      if (!session.url) {
        throw new HttpsError("internal", "Failed to create checkout session.");
      }

      return {
        url: session.url,
      };
    } catch (error: any) {
      logger.error("createStripeCheckoutSession failed", {
        message: error?.message || null,
        type: error?.type || null,
        code: error?.code || null,
        rawType: error?.rawType || null,
        statusCode: error?.statusCode || null,
      });

      throw new HttpsError(
        "internal",
        error?.message || "Stripe checkout failed."
      );
    }
  }
);
