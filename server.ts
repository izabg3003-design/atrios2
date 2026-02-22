import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-11-preview" as any,
});

const supabase = createClient(
  process.env.SUPABASE_URL || "https://raglyqukrlxwcmlhzebd.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Webhook needs raw body
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const companyId = session.client_reference_id;
          const planType = session.metadata?.planType;

          if (companyId && planType) {
            const { error } = await supabase
              .from("companies")
              .update({ 
                plan: planType,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string
              })
              .eq("id", companyId);
            
            if (error) console.error("Error updating company plan:", error);
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const { error } = await supabase
            .from("companies")
            .update({ plan: "FREE", stripe_subscription_id: null })
            .eq("stripe_subscription_id", subscription.id);
          
          if (error) console.error("Error reverting company to free plan:", error);
          break;
        }
      }

      res.json({ received: true });
    }
  );

  app.use(express.json());

  app.post("/api/create-checkout-session", async (req, res) => {
    const { companyId, planType, couponCode } = req.body;

    let priceId = "";
    let mode: Stripe.Checkout.Session.Mode = "subscription";

    if (planType === "PREMIUM_MONTHLY") {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID || "";
      mode = "subscription";
    } else if (planType === "PREMIUM_ANNUAL") {
      priceId = process.env.STRIPE_ANNUAL_PRICE_ID || "";
      mode = "subscription"; 
    }

    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: `${process.env.APP_URL}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/`,
        client_reference_id: companyId,
        metadata: {
          planType: planType,
        },
        allow_promotion_codes: true,
      };

      if (couponCode) {
        try {
          const promoCodes = await stripe.promotionCodes.list({
            code: couponCode,
            active: true,
            limit: 1,
          });
          if (promoCodes.data.length > 0) {
            sessionParams.discounts = [{ promotion_code: promoCodes.data[0].id }];
          }
        } catch (promoError) {
          console.warn("Could not find matching Stripe promotion code:", promoError);
        }
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
