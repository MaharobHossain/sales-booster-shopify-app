import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import "./announcement-bar/styles.css";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let announcement = await db.announcement.findFirst({ where: { shop } });

  if (!announcement) {
    announcement = await db.announcement.create({
      data: { shop, message: "" },
    });
  }

  return { announcement };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const message = formData.get("message");
  const link = formData.get("link");
  const bgColor = formData.get("bgColor");
  const textColor = formData.get("textColor");
  const fontSize = Number(formData.get("fontSize"));
  const isActive = formData.get("isActive") === "true";

  const existing = await db.announcement.findFirst({ where: { shop } });

  const updated = await db.announcement.update({
    where: { id: existing.id },
    data: { message, link, bgColor, textColor, fontSize, isActive },
  });

  // আগে shop এর GraphQL ID বের করি
  const shopResponse = await admin.graphql(`#graphql
    query {
      shop {
        id
      }
    }`);
  const shopData = await shopResponse.json();
  const shopId = shopData.data.shop.id;

  // Metafield set করি
  const metafieldValue = JSON.stringify({
    message,
    link,
    bgColor,
    textColor,
    fontSize,
    isActive,
  });

  await admin.graphql(
    `#graphql
    mutation SetAnnouncementMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "sales_booster",
            key: "announcement",
            type: "json",
            value: metafieldValue,
          },
        ],
      },
    }
  );

  return { announcement: updated };
};

export default function AnnouncementBar() {
  const { announcement } = useLoaderData();
  const fetcher = useFetcher();

  const [message, setMessage] = useState(announcement.message || "");
  const [link, setLink] = useState(announcement.link || "");
  const [bgColor, setBgColor] = useState(announcement.bgColor);
  const [textColor, setTextColor] = useState(announcement.textColor);
  const [fontSize, setFontSize] = useState(announcement.fontSize);
  const [isActive, setIsActive] = useState(announcement.isActive);

  const handleSave = () => {
    fetcher.submit(
      {
        message,
        link,
        bgColor,
        textColor,
        fontSize: String(fontSize),
        isActive: String(isActive),
      },
      { method: "post" }
    );
  };

  const handleDiscard = () => {
  setMessage(announcement.message || "");
  setLink(announcement.link || "");
  setBgColor(announcement.bgColor);
  setTextColor(announcement.textColor);
  setFontSize(announcement.fontSize);
  setIsActive(announcement.isActive);
};

  return (
    <s-page heading="Announcement bar">
      <s-section>
        <div className="ab-preview-label">Live preview</div>
        <div
          className="ab-preview-bar"
          style={{
            background: bgColor,
            color: textColor,
            fontSize: `${fontSize}px`,
          }}
        >
          {message || "Your announcement text will appear here"}
        </div>

        <div className="ab-card">
          <div className="ab-card-header">
            <h2>Announcement details</h2>
            <span className={`ab-badge ${isActive ? "ab-badge-active" : ""}`}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="ab-field">
            <label htmlFor="message">Message</label>
            <input
              id="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="ab-field">
            <label htmlFor="link">Link (optional)</label>
            <input
              id="link"
              type="text"
              placeholder="/collections/all"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="ab-row">
            <div className="ab-field">
              <label htmlFor="bgColor">Background color</label>
              <input
                id="bgColor"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
            <div className="ab-field">
              <label htmlFor="textColor">Text color</label>
              <input
                id="textColor"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>
          </div>

          <div className="ab-field">
            <label htmlFor="fontSize">Font size</label>
            <div className="ab-slider-row">
              <input
                id="fontSize"
                type="range"
                min="12"
                max="24"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
              <span>{fontSize}px</span>
            </div>
          </div>

          <div className="ab-toggle-row">
            <div>
              <p className="ab-toggle-title">Active</p>
              <p className="ab-toggle-sub">Show this bar on your storefront</p>
            </div>
            <label className="ab-switch" aria-label="Active">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="ab-slider"></span>
            </label>
          </div>

          <div className="ab-actions">
            <button
             type="button"
             className="ab-btn-secondary"
             onClick={handleDiscard}
             >
             Discard
            </button>
            <button
            type="button"
            className="ab-btn-primary"
            onClick={handleSave}
            disabled={fetcher.state !== "idle"}
>
  {fetcher.state !== "idle" ? "Saving..." : "Save"}
</button>
          </div>
        </div>
      </s-section>
    </s-page>
  );
}