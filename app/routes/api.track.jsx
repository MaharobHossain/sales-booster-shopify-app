import db from "../db.server";

// Allowed values - keeps the endpoint from accepting garbage data
const ALLOWED_FEATURES = ["announcement", "recommendation", "countdown", "socialProof"];
const ALLOWED_EVENT_TYPES = ["view", "click"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Small helper so we don't need @remix-run/node's json() -
// React Router v7 apps can just build Response objects directly
function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

export const action = async ({ request }) => {
  // Browser preflight request - must respond before the real POST is sent
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { shop, feature, eventType } = body;

    if (!shop || !feature || !eventType) {
      return jsonResponse(
        { error: "Missing required fields: shop, feature, eventType" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FEATURES.includes(feature)) {
      return jsonResponse(
        { error: `Invalid feature. Must be one of: ${ALLOWED_FEATURES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
      return jsonResponse(
        { error: `Invalid eventType. Must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    await db.analyticsEvent.create({
      data: {
        shop,
        feature,
        eventType,
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Tracking API error:", error);
    return jsonResponse({ error: "Failed to track event" }, { status: 500 });
  }
};

// GET requests to this route shouldn't return anything useful -
// this is a write-only endpoint
export const loader = async () => {
  return jsonResponse({ error: "Not found" }, { status: 404 });
};
