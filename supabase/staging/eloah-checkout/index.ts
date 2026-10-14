import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ORIGIN = Deno.env.get("ELOAH_TEST_ORIGIN") || "";
const RETURN_ROOT = Deno.env.get("ELOAH_TEST_RETURN_ROOT") || "";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": ORIGIN,
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type",
  "vary": "Origin",
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}
const planned = {
  entree: {
    amount: 1490,
    priceId: "price_1UQPEnECEqtAYpIknr4D8aLI",
    productId: "prod_VRHovD4qiIJcNz",
  },
  partenaire: {
    amount: 6900,
    priceId: "price_1UQPEuECEqtAYpIk9HCoQ6Sf",
    productId: "prod_VRHo6BuSTO9pku",
  },
};
function salesReady() {
  // Never open a checkout until launch, the contract and taxation were explicitly approved.
  return Deno.env.get("ELOAH_TEST_ENVIRONMENT") === "true"
    && /^sk_test_/.test(Deno.env.get("ELOAH_STRIPE_SECRET_KEY") || "")
    && !!ORIGIN && !!RETURN_ROOT && RETURN_ROOT.startsWith(ORIGIN)
    && Deno.env.get("ELOAH_SALES_ENABLED") === "true"
    && Deno.env.get("ELOAH_TERMS_APPROVED") === "true"
    && Deno.env.get("ELOAH_TAX_REVIEW_APPROVED") === "true"
    && !!Deno.env.get("ELOAH_STRIPE_SECRET_KEY")
    && !!Deno.env.get("ELOAH_STRIPE_WEBHOOK_SECRET")
    && !!Deno.env.get("SUPABASE_URL")
    && !!Deno.env.get("SUPABASE_ANON_KEY");
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  const origin = req.headers.get("origin");
  if (origin && origin !== ORIGIN) return json({ error: "origin_not_allowed" }, 403);
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Availability check never creates a bill or Stripe session.
  if (req.method === "GET") return json({
    sales_open: salesReady(),
    currency: "eur",
    interval: "month",
    free_plan: "presentation_only",
  });

  // No sales are possible until this explicit server-side launch flag is enabled.
  if (!salesReady()) return json({ error: "sales_closed" }, 503);
  let input;
  try { input = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const plan = input?.plan;
  if (typeof plan !== "string" || !Object.hasOwn(planned, plan)) {
    return json({ error: "unknown_plan" }, 400);
  }

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const stripeSecret = Deno.env.get("ELOAH_STRIPE_SECRET_KEY");
  if (!token || !url || !anon || !stripeSecret) return json({ error: "sign_in_required" }, 401);
  const identity = await fetch(url + "/auth/v1/user", {
    headers: { "apikey": anon, "authorization": "Bearer " + token },
  });
  if (!identity.ok) return json({ error: "sign_in_required" }, 401);
  let user;
  try { user = await identity.json(); } catch { return json({ error: "sign_in_required" }, 401); }
  if (!UUID.test(user?.id || "") || typeof user?.email !== "string" || !user.email.includes("@")) {
    return json({ error: "invalid_account" }, 401);
  }
  if (user.email_confirmed_at == null) return json({ error: "email_not_confirmed" }, 403);

  // Check the trusted RLS-protected entitlement before opening another subscription.
  const entitlements = await fetch(
    url + "/rest/v1/eloah_customer_entitlements?select=plan,status&owner_id=eq." + encodeURIComponent(user.id),
    { headers: { "apikey": anon, "authorization": "Bearer " + token } },
  );
  if (!entitlements.ok) return json({ error: "account_check_unavailable" }, 503);
  const current = await entitlements.json();
  if (Array.isArray(current) && current.some(e => e.status === "active")) {
    return json({ error: "subscription_already_active" }, 409);
  }

  const descriptor = planned[plan];
  const priceId = descriptor.priceId;

  // Never silently charge a plan at a price other than the approved proposal.
  const priceResponse = await fetch(
    "https://api.stripe.com/v1/prices/" + encodeURIComponent(priceId),
    { headers: { "authorization": "Bearer " + stripeSecret } },
  );
  if (!priceResponse.ok) return json({ error: "price_check_unavailable" }, 503);
  const price = await priceResponse.json();
  // Block live sales while price taxation is still unspecified, even if flags were set.
  if (price.active !== true || price.currency !== "eur" || price.unit_amount !== descriptor.amount
    || price.product !== descriptor.productId || price.tax_behavior === "unspecified"
    || !["inclusive","exclusive"].includes(price.tax_behavior)
    || price.type !== "recurring" || price.recurring?.interval !== "month"
    || price.recurring?.interval_count !== 1) {
    return json({ error: "price_mismatch" }, 503);
  }
  const productResponse = await fetch(
    "https://api.stripe.com/v1/products/" + encodeURIComponent(descriptor.productId),
    { headers: { "authorization": "Bearer " + stripeSecret } },
  );
  if (!productResponse.ok) return json({ error: "product_check_unavailable" }, 503);
  const product = await productResponse.json();
  if (product.active !== true || product.metadata?.brand !== "ELOAH"
      || product.metadata?.plan !== plan) return json({ error: "product_not_ready" }, 503);

  const payload = new URLSearchParams();
  payload.set("mode", "subscription");
  payload.set("line_items[0][price]", priceId);
  payload.set("line_items[0][quantity]", "1");
  payload.set("client_reference_id", user.id);
  payload.set("customer_email", user.email);
  payload.set("metadata[eloah_user_id]", user.id);
  payload.set("metadata[eloah_plan]", plan);
  payload.set("subscription_data[metadata][eloah_user_id]", user.id);
  payload.set("subscription_data[metadata][eloah_plan]", plan);
  payload.set("success_url", RETURN_ROOT + "eloah-espace-prive.html?checkout=retour");
  payload.set("cancel_url", RETURN_ROOT + "eloah-inscription.html?offre=" + encodeURIComponent(plan) + "&paiement=annule");

  // Ten-minute idempotency window limits accidental duplicate checkout creation.
  const windowKey = Math.floor(Date.now() / 600000);
  const idem = "eloah_checkout_" + user.id + "_" + plan + "_" + windowKey;
  const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "authorization": "Bearer " + stripeSecret,
      "content-type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idem,
    },
    body: payload,
  });
  if (!checkoutResponse.ok) return json({ error: "checkout_unavailable" }, 502);
  const checkout = await checkoutResponse.json();
  if (typeof checkout?.url !== "string" || !checkout.url.startsWith("https://checkout.stripe.com/")) {
    return json({ error: "invalid_checkout_response" }, 502);
  }
  return json({ url: checkout.url });
});
