import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Dummy data for now - will be replaced with real AnalyticsEvent
  // queries once the tracking API + Liquid script work is done
  const stats = {
    totalViews: 18240,
    totalClicks: 2196,
    activeCount: 3,
    totalCount: 4,
    features: [
      {
        key: "announcement",
        name: "Announcement bar",
        icon: "📢",
        views: 6540,
        clicks: 420,
        isActive: true,
      },
      {
        key: "recommendation",
        name: "Product recommendations",
        icon: "🛍️",
        views: 5120,
        clicks: 812,
        isActive: true,
      },
      {
        key: "countdown",
        name: "Countdown timer",
        icon: "⏱️",
        views: 4380,
        clicks: 690,
        isActive: true,
      },
      {
        key: "socialProof",
        name: "Social proof",
        icon: "👥",
        views: 0,
        clicks: 0,
        isActive: false,
      },
    ],
  };

  return { stats };
};

export default function AnalyticsPage() {
  const { stats } = useLoaderData();
  const ctr =
    stats.totalViews > 0
      ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1)
      : "0.0";

  const maxViews = Math.max(...stats.features.map((f) => f.views), 1);

  return (
    <s-page heading="Analytics">
      <s-section>
        <s-stack direction="inline" gap="base" alignment="space-between">
          <s-box>
            <s-text variant="headingMd">Views and clicks across all tools</s-text>
          </s-box>
          <s-stack direction="inline" gap="tight">
            <s-button variant="primary">Today</s-button>
            <s-button variant="tertiary">7 days</s-button>
            <s-button variant="tertiary">30 days</s-button>
          </s-stack>
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="inline" gap="base" wrap="true">
          <s-box
            padding="base"
            borderRadius="base"
            background="subdued"
            minInlineSize="160px"
          >
            <s-stack gap="tight">
              <s-text tone="subdued" variant="bodySm">
                Total views
              </s-text>
              <s-text variant="headingLg">
                {stats.totalViews.toLocaleString()}
              </s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderRadius="base"
            background="subdued"
            minInlineSize="160px"
          >
            <s-stack gap="tight">
              <s-text tone="subdued" variant="bodySm">
                Total clicks
              </s-text>
              <s-text variant="headingLg">
                {stats.totalClicks.toLocaleString()}
              </s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderRadius="base"
            background="subdued"
            minInlineSize="160px"
          >
            <s-stack gap="tight">
              <s-text tone="subdued" variant="bodySm">
                Click-through rate
              </s-text>
              <s-text variant="headingLg">{ctr}%</s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderRadius="base"
            background="subdued"
            minInlineSize="160px"
          >
            <s-stack gap="tight">
              <s-text tone="subdued" variant="bodySm">
                Active tools
              </s-text>
              <s-text variant="headingLg">
                {stats.activeCount} of {stats.totalCount}
              </s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="By feature">
        <s-stack gap="tight">
          {stats.features.map((feature) => (
            <s-box
              key={feature.key}
              padding="base"
              borderRadius="base"
              borderWidth="base"
              borderColor="subdued"
            >
              <s-stack direction="inline" gap="base" alignment="center">
                <s-box
                  padding="tight"
                  borderRadius="full"
                  background={feature.isActive ? "success-subdued" : "subdued"}
                >
                  <s-text>{feature.icon}</s-text>
                </s-box>

                <s-box minInlineSize="0" inlineSize="fill">
                  <s-stack gap="none">
                    <s-text variant="bodyMd" fontWeight="medium">
                      {feature.name}
                    </s-text>
                    {feature.isActive ? (
                      <s-text tone="subdued" variant="bodySm">
                        {feature.views.toLocaleString()} views ·{" "}
                        {feature.clicks.toLocaleString()} clicks
                      </s-text>
                    ) : (
                      <s-text tone="subdued" variant="bodySm">
                        Not active
                      </s-text>
                    )}
                  </s-stack>
                </s-box>

                {feature.isActive && (
                  <s-box
                    inlineSize="90px"
                    blockSize="6px"
                    borderRadius="base"
                    background="subdued"
                  >
                    <s-box
                      inlineSize={`${Math.round(
                        (feature.views / maxViews) * 100
                      )}%`}
                      blockSize="6px"
                      borderRadius="base"
                      background="success"
                    />
                  </s-box>
                )}
              </s-stack>
            </s-box>
          ))}
        </s-stack>
      </s-section>
    </s-page>
  );
}
