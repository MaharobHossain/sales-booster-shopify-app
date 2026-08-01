/* eslint-disable react/prop-types */
import { boundary } from "@shopify/shopify-app-react-router/server";
import "./_index/dashboard.css";

const tools = [
  {
    icon: "▰",
    title: "Announcement Bar",
    description: "Promote offers, free shipping, and important messages.",
    link: "/app/announcement-bar",
    action: "Configure",
  },
  {
    icon: "✦",
    title: "Product Recommendations",
    description: "Help customers discover more products.",
    link: "/app/recommendations",
    action: "Configure",
  },
  {
    icon: "◷",
    title: "Countdown Timer",
    description: "Create urgency for special offers and campaigns.",
    link: "/app/countdown-timer",
    action: "Configure",
  },
  {
    icon: "●",
    title: "Social Proof",
    description: "Build trust with recent customer activity.",
    link: "/app/social-proof",
    action: "Configure",
  },
];

function FeatureCard({ icon, title, description, link, action }) {
  return (
    <article className="sb-feature-card">
      <div className="sb-feature-icon">{icon}</div>

      <h2>{title}</h2>

      <p>{description}</p>

      <div className="sb-card-footer">
        <span className="sb-status">Inactive</span>

        <s-link href={link}>{action} →</s-link>
      </div>
    </article>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="sb-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default function Dashboard() {
  return (
    <s-page heading="Sales Booster" inlineSize="large">
      <div className="sb-dashboard">
        <section className="sb-welcome">
          <div>
            <p className="sb-eyebrow">CONVERSION TOOLS</p>
            <h1>Welcome to Sales Booster</h1>
            <p>Boost conversions with smart on-store tools.</p>
          </div>

          <s-button variant="primary">View store</s-button>
        </section>

        <section className="sb-setup-card">
          <div className="sb-setup-header">
            <div>
              <h2>Setup progress</h2>
              <p>Configure your first conversion tool to get started.</p>
            </div>

            <span>0 of 4 configured</span>
          </div>

          <div className="sb-progress-track">
            <div className="sb-progress-fill" />
          </div>
        </section>

        <section className="sb-section">
          <div className="sb-section-title">
            <div>
              <h2>Conversion tools</h2>
              <p>Choose a tool to configure for your store.</p>
            </div>
          </div>

          <div className="sb-feature-grid">
            {tools.map((tool) => (
              <FeatureCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>

        <section className="sb-section">
          <div className="sb-section-title">
            <div>
              <h2>Performance</h2>
              <p>Your conversion activity will appear here.</p>
            </div>

            <s-link href="/app/analytics">View analytics →</s-link>
          </div>

          <div className="sb-metric-grid">
            <MetricCard label="Views" value="0" />
            <MetricCard label="Clicks" value="0" />
            <MetricCard label="Conversions" value="0" />
            <MetricCard label="Revenue" value="$0.00" />
          </div>
        </section>

        <section className="sb-help-card">
          <div>
            <h2>Need help getting started?</h2>
            <p>Configure a tool, then add it to your online store theme.</p>
          </div>

          <s-link href="/app/settings">Open settings →</s-link>
        </section>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};