console.log(">>> SERVER INITIALIZING...");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
  process.exit(1);
});

import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting server with environment check:");
console.log("- STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Present" : "Missing");
console.log("- STRIPE_MONTHLY_PRICE_ID:", process.env.STRIPE_MONTHLY_PRICE_ID ? "Present" : "Missing");
console.log("- STRIPE_ANNUAL_PRICE_ID:", process.env.STRIPE_ANNUAL_PRICE_ID ? "Present" : "Missing");
console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "Present" : "Missing");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function startServer() {
  try {
    const app = express();
    const PORT = process.env.PORT || 3000;

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Webhook needs raw body - MUST be before express.json()
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

  // Parse JSON bodies for other routes
  app.use(express.json());

  // Error handler for malformed JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.error("Malformed JSON:", err.message);
      return res.status(400).json({ error: "Malformed JSON body" });
    }
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasMonthlyPrice: !!process.env.STRIPE_MONTHLY_PRICE_ID,
        hasAnnualPrice: !!process.env.STRIPE_ANNUAL_PRICE_ID,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        appUrl: process.env.APP_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  app.post(["/api/create-checkout-session", "/api/create-checkout-session/"], async (req, res) => {
    const { companyId, planType, couponCode } = req.body;

    console.log(`Creating checkout session for ${companyId}, plan: ${planType}`);

    let priceId = "";
    let mode: Stripe.Checkout.Session.Mode = "subscription";

    let monthlyId = (process.env.STRIPE_MONTHLY_PRICE_ID || "price_1T3e4x1kTCJBb2eQJBnM0adW").trim();
    let annualId = (process.env.STRIPE_ANNUAL_PRICE_ID || "price_1T3e8d1kTCJBb2eQgqKiRoN1").trim();
    
    // Hotfix: If the environment still has the old incorrect IDs, override them
    const invalidIds = [
      "price_1T3YhcP8uJW17aRIpkBFJHvu",
      "price_1T3YmmP8uJW17aRIQhPP5gmK"
    ];

    if (invalidIds.includes(monthlyId)) {
      console.log("Hotfix: Overriding old monthly price ID");
      monthlyId = "price_1T3e4x1kTCJBb2eQJBnM0adW";
    }
    if (invalidIds.includes(annualId)) {
      console.log("Hotfix: Overriding old annual price ID");
      annualId = "price_1T3e8d1kTCJBb2eQgqKiRoN1";
    }

    const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();

    console.log("--- STRIPE ENVIRONMENT CHECK ---");
    console.log(`Final Monthly Price ID: "${monthlyId}"`);
    console.log(`Final Annual Price ID: "${annualId}"`);
    console.log(`STRIPE_SECRET_KEY starts with: ${secretKey.substring(0, 8)}...`);
    console.log("--------------------------------");

    if (planType === "premium_monthly") {
      priceId = monthlyId;
      mode = "subscription";
    } else if (planType === "premium_annual") {
      priceId = annualId;
      mode = "subscription"; 
    }

    if (!priceId) {
      console.error(`ERROR: Price ID missing for plan ${planType}. Check your environment variables.`);
      return res.status(400).json({ error: `Invalid plan type or missing Price ID for: ${planType}` });
    }

    console.log(`Using Price ID: ${priceId.substring(0, 8)}... for plan: ${planType}`);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe Secret Key is not configured on the server." });
    }

    try {
      console.log("Request body:", JSON.stringify(req.body));
      const { origin } = req.body;
      const appUrl = origin || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      console.log("Using App URL:", appUrl);

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/`,
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
      res.setHeader('Content-Type', 'application/json');
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Session Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Catch-all for API routes that don't exist
  app.all("/api/*any", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction) {
    console.log("Starting in DEVELOPMENT mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode serving static files");
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*any", (req, res) => {
      // Don't serve index.html for missing API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("FATAL ERROR DURING SERVER STARTUP:", error);
    process.exit(1);
  }
}

startServer();
