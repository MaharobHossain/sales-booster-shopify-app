import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { session, admin } = await authenticate.public.appProxy(request);

    if (!session || !admin) {
      return Response.json({ items: [] });
    }

    const response = await admin.graphql(`#graphql
      query {
        orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              processedAt
              customer {
                firstName
                lastName
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const payload = await response.json();
    const orderEdges = payload?.data?.orders?.edges ?? [];

    const items = orderEdges
      .map(({ node }) => {
        const customer = node?.customer ?? {};
        const customerName = [customer.firstName, customer.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        const firstLineItem = node?.lineItems?.edges?.[0]?.node;
        const productName =
          firstLineItem?.product?.title ||
          firstLineItem?.title ||
          "a product";

        return {
          type: "purchase",
          name: customerName || "Someone",
          product: productName,
          location: "somewhere",
          createdAt: node?.processedAt || new Date().toISOString(),
        };
      })
      .filter(Boolean);

    return Response.json(
      { items },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Social proof real mode fetch failed:", error);

    return Response.json(
      { items: [] },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
