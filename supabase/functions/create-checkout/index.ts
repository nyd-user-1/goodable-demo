import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Subscription tier pricing (in cents)
const tierPricing = {
  student: { monthly: 1900, annually: 1583 },      // $19.00/month, $15.83/month billed annually (10-month pricing)
  staffer: { monthly: 9900, annually: 8250 },      // $99.00/month, $82.50/month billed annually (10-month pricing)
  researcher: { monthly: 14900, annually: 12417 }, // $149.00/month, $124.17/month billed annually (10-month pricing)
  professional: { monthly: 29900, annually: 24917 }, // $299.00/month, $249.17/month billed annually (10-month pricing)
  enterprise: { monthly: 49900, annually: 41583 }, // $499.00/month, $415.83/month billed annually (10-month pricing)
  government: { monthly: 249900, annually: 208250 } // $2499.00/month, $2082.50/month billed annually (10-month pricing)
};

const tierNames = {
  student: "Student Plan",
  staffer: "Staffer Plan", 
  researcher: "Researcher Plan",
  professional: "Professional Plan",
  enterprise: "Enterprise Plan",
  government: "Government Plan"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { tier, billingCycle = 'monthly' } = await req.json();
    
    if (!tier || !tierPricing[tier as keyof typeof tierPricing]) {
      throw new Error("Invalid subscription tier provided");
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'annually') {
      throw new Error("Invalid billing cycle provided");
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const tierData = tierPricing[tier as keyof typeof tierPricing];
    const unitAmount = billingCycle === 'annually' ? tierData.annually : tierData.monthly;
    const interval = billingCycle === 'annually' ? 'year' : 'month';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${tierNames[tier as keyof typeof tierNames]} (${billingCycle === 'annually' ? 'Annual' : 'Monthly'})` 
            },
            unit_amount: unitAmount,
            recurring: { interval: interval as 'month' | 'year' },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `https://policy.newyorkdigital.co/plans`,
      cancel_url: `${req.headers.get("origin")}/profile?canceled=true`,
      metadata: {
        tier: tier,
        billing_cycle: billingCycle,
        user_id: user.id
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});