import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

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
  const dismissible = formData.get("dismissible") === "true";

  const existing = await db.announcement.findFirst({ where: { shop } });

  const updated = await db.announcement.update({
    where: { id: existing.id },
    data: {
      message,
      link,
      bgColor,
      textColor,
      fontSize,
      isActive,
      dismissible,
    },
  });

  const shopResponse = await admin.graphql(`#graphql
    query {
      shop {
        id
      }
    }`);
  const shopData = await shopResponse.json();
  const shopId = shopData.data.shop.id;

  const metafieldValue = JSON.stringify({
    message,
    link,
    bgColor,
    textColor,
    fontSize,
    isActive,
    dismissible,
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
  const [dismissible, setDismissible] = useState(
    announcement.dismissible ?? true
  );

  const handleSave = () => {
    fetcher.submit(
      {
        message,
        link,
        bgColor,
        textColor,
        fontSize: String(fontSize),
        isActive: String(isActive),
        dismissible: String(dismissible),
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
    setDismissible(announcement.dismissible ?? true);
  };

  return (
    <s-page heading="Announcement bar">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={handleSave}
        loading={fetcher.state !== "idle" ? "" : undefined}
      >
        Save
      </s-button>
      <s-button slot="secondary-actions" onClick={handleDiscard}>
        Discard
      </s-button>

      <s-section heading="Live preview">
        <div
          style={{
            background: bgColor,
            color: textColor,
            fontSize: `${fontSize}px`,
            textAlign: "center",
            padding: "10px 16px",
            borderRadius: "8px",
          }}
        >
          {message || "Your announcement text will appear here"}
        </div>
      </s-section>

      <s-section heading="Announcement details">
        <s-badge tone={isActive ? "success" : "neutral"}>
          {isActive ? "Active" : "Inactive"}
        </s-badge>

        <s-stack direction="block" gap="base">
          <s-text-field
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></s-text-field>

          <s-text-field
            label="Link (optional)"
            placeholder="/collections/all"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          ></s-text-field>

          <s-stack direction="inline" gap="base">
            <s-color-field
              label="Background color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            ></s-color-field>

            <s-color-field
              label="Text color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            ></s-color-field>
          </s-stack>

          <s-range-slider
            label={`Font size (${fontSize}px)`}
            min="12"
            max="24"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          ></s-range-slider>

          <s-switch
            label="Active"
            details="Show this bar on your storefront"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          ></s-switch>

          <s-switch
            label="Dismissible"
            details="Let customers close this bar"
            checked={dismissible}
            onChange={(e) => setDismissible(e.target.checked)}
          ></s-switch>
        </s-stack>
      </s-section>
    </s-page>
  );
}