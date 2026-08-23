import { useState } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Dummy data for now, one set per date range - will be replaced
  // with real AnalyticsEvent queries once the tracking API is wired up
  const dataByRange = {
    today: {
      totalViews: 1240,
      totalClicks: 148,
      features: [
        { key: "announcement", name: "Announcement bar", icon: "📢", views: 420, clicks: 28, isActive: true },
        { key: "recommendation", name: "Product recommendations", icon: "🛍️", views: 380, clicks: 61, isActive: true },
        { key: "countdown", name: "Countdown timer", icon: "⏱️", views: 300, clicks: 47, isActive: true },
        { key: "socialProof", name: "Social proof", icon: "👥", views: 0, clicks: 0, isActive: false },
      ],
    },
    "7days": {
      totalViews: 18240,
      totalClicks: 2196,
      features: [
        { key: "announcement", name: "Announcement bar", icon: "📢", views: 6540, clicks: 420, isActive: true },
        { key: "recommendation", name: "Product recommendations", icon: "🛍️", views: 5120, clicks: 812, isActive: true },
        { key: "countdown", name: "Countdown timer", icon: "⏱️", views: 4380, clicks: 690, isActive: true },
        { key: "socialProof", name: "Social proof", icon: "👥", views: 0, clicks: 0, isActive: false },
      ],
    },
    "30days": {
      totalViews: 74600,
      totalClicks: 9310,
      features: [
        { key: "announcement", name: "Announcement bar", icon: "📢", views: 26800, clicks: 1720, isActive: true },
        { key: "recommendation", name: "Product recommendations", icon: "🛍️", views: 21200, clicks: 3480, isActive: true },
        { key: "countdown", name: "Countdown timer", icon: "⏱️", views: 17900, clicks: 2810, isActive: true },
        { key: "socialProof", name: "Social proof", icon: "👥", views: 0, clicks: 0, isActive: false },
      ],
    },
  };

  return { dataByRange, activeCount: 3, totalCount: 4 };
};

const RANGE_LABELS = {
  today: "Today",
  "7days": "7 days",
  "30days": "30 days",
};

export default function AnalyticsPage() {
  const { dataByRange, activeCount, totalCount } = useLoaderData();
  const [range, setRange] = useState("7days");

  const stats = dataByRange[range];
  const ctr =
    stats.totalViews > 0
      ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1)
      : "0.0";
  const maxViews = Math.max(...stats.features.map((f) => f.views), 1);

  return (
    <s-page heading="Analytics">
      <s-section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "13px", color: "#6d7175" }}>
              Views and clicks across all tools
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {Object.keys(RANGE_LABELS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                style={{
                  fontSize: "13px",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: range === key ? "1px solid #008060" : "1px solid #c9cccf",
                  background: range === key ? "#e0f5f0" : "#ffffff",
                  color: range === key ? "#004c3f" : "#303030",
                  fontWeight: range === key ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {RANGE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </s-section>

      <s-section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e3e5e7", borderRadius: "10px", padding: "16px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#6d7175" }}>Total views</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>{stats.totalViews.toLocaleString()}</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e3e5e7", borderRadius: "10px", padding: "16px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#6d7175" }}>Total clicks</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>{stats.totalClicks.toLocaleString()}</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e3e5e7", borderRadius: "10px", padding: "16px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#6d7175" }}>Click-through rate</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>{ctr}%</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e3e5e7", borderRadius: "10px", padding: "16px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#6d7175" }}>Active tools</p>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>{activeCount} of {totalCount}</p>
          </div>
        </div>
      </s-section>

      <s-section heading="By feature">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {stats.features.map((feature) => (
            <div
              key={feature.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                background: "#ffffff",
                border: "1px solid #e3e5e7",
                borderRadius: "10px",
                opacity: feature.isActive ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  borderRadius: "50%",
                  background: "#e0f5f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {feature.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{feature.name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#6d7175" }}>
                  {feature.isActive
                    ? `${feature.views.toLocaleString()} views · ${feature.clicks.toLocaleString()} clicks`
                    : "Not active"}
                </p>
              </div>

              {feature.isActive && (
                <div style={{ width: "90px", height: "6px", background: "#f1f2f3", borderRadius: "3px", overflow: "hidden", flexShrink: 0 }}>
                  <div
                    style={{
                      width: `${Math.round((feature.views / maxViews) * 100)}%`,
                      height: "100%",
                      background: "#008060",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </s-section>
    </s-page>
  );
}
