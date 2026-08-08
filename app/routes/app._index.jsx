/* eslint-disable react/prop-types */
import { boundary } from "@shopify/shopify-app-react-router/server";

const tools = [
  {
    icon: "▰",
    color: "#e0f5f0",
    iconColor: "#006e52",
    title: "Announcement Bar",
    description: "Promote offers, free shipping, and important messages.",
    link: "/app/announcement-bar",
    action: "Configure",
  },
  {
    icon: "✦",
    color: "#eef1ff",
    iconColor: "#3730d6",
    title: "Product Recommendations",
    description: "Help customers discover more products.",
    link: "/app/recommendations",
    action: "Configure",
  },
  {
    icon: "◷",
    color: "#fff4e5",
    iconColor: "#b45400",
    title: "Countdown Timer",
    description: "Create urgency for special offers and campaigns.",
    link: "/app/countdown-timer",
    action: "Configure",
  },
  {
    icon: "●",
    color: "#fde8ef",
    iconColor: "#c0175c",
    title: "Social Proof",
    description: "Build trust with recent customer activity.",
    link: "/app/social-proof",
    action: "Configure",
  },
];

function IconCircle({ icon, color, iconColor }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: color,
        borderRadius: "10px",
        color: iconColor,
        display: "flex",
        fontSize: "18px",
        fontWeight: "700",
        height: "40px",
        justifyContent: "center",
        width: "40px",
      }}
    >
      {icon}
    </div>
  );
}

function FeatureCard({ icon, color, iconColor, title, description, link, action }) {
  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderColor="base"
      borderRadius="base"
      background="base"
    >
      <s-stack direction="block" gap="base">
        <IconCircle icon={icon} color={color} iconColor={iconColor} />
        <s-heading>{title}</s-heading>
        <s-paragraph>{description}</s-paragraph>
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-badge tone="neutral">Inactive</s-badge>
          <s-link href={link}>{action} →</s-link>
        </s-stack>
      </s-stack>
    </s-box>
  );
}

function MetricCard({ label, value }) {
  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderColor="base"
      borderRadius="base"
      background="base"
    >
      <s-stack direction="block" gap="tight">
        <s-text tone="subdued">{label}</s-text>
        <s-heading>{value}</s-heading>
      </s-stack>
    </s-box>
  );
}

export default function Dashboard() {
  const configuredCount = 0;
  const totalTools = 4;
  const progressPercent = (configuredCount / totalTools) * 100;

  return (
    <s-page heading="Sales Booster" inlineSize="large">
      <s-section>
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-stack direction="block" gap="tight">
            <s-text tone="subdued">CONVERSION TOOLS</s-text>
            <s-heading>Welcome to Sales Booster</s-heading>
            <s-paragraph>
              Boost conversions with smart on-store tools.
            </s-paragraph>
          </s-stack>

          <s-button variant="primary">View store</s-button>
        </s-stack>
      </s-section>

      <s-section heading="Setup progress">
        <s-stack direction="block" gap="base">
          <s-stack
            direction="inline"
            gap="base"
            alignItems="center"
            justifyContent="space-between"
          >
            <s-paragraph>
              Configure your first conversion tool to get started.
            </s-paragraph>
            <s-badge tone={configuredCount > 0 ? "success" : "neutral"}>
              {configuredCount} of {totalTools} configured
            </s-badge>
          </s-stack>

          <div
            style={{
              background: "#edf0ef",
              borderRadius: "999px",
              height: "8px",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              style={{
                background: "#008060",
                borderRadius: "inherit",
                height: "100%",
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Conversion tools">
        <s-paragraph>Choose a tool to configure for your store.</s-paragraph>

        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
          {tools.map((tool) => (
            <FeatureCard key={tool.title} {...tool} />
          ))}
        </s-grid>
      </s-section>

      <s-section heading="Performance">
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-paragraph>Your conversion activity will appear here.</s-paragraph>
          <s-link href="/app/analytics">View analytics →</s-link>
        </s-stack>

        <s-grid gridTemplateColumns="1fr 1fr 1fr 1fr" gap="base">
          <MetricCard label="Views" value="0" />
          <MetricCard label="Clicks" value="0" />
          <MetricCard label="Conversions" value="0" />
          <MetricCard label="Revenue" value="$0.00" />
        </s-grid>
      </s-section>

      <s-section>
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-stack direction="block" gap="tight">
            <s-heading>Need help getting started?</s-heading>
            <s-paragraph>
              Configure a tool, then add it to your online store theme.
            </s-paragraph>
          </s-stack>

          <s-link href="/app/settings">Open settings →</s-link>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};