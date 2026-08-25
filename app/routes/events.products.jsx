// Stub handler for the Product events subscription declared in
// shopify.app.toml. Not used by the app's actual features yet -
// exists only so the [events] subscription has a valid endpoint.
export const action = async ({ request }) => {
  const payload = await request.json().catch(() => null);
  console.log("Product event received:", payload);
  return new Response(null, { status: 200 });
};