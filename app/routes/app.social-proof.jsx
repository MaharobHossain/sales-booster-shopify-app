import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let socialProof = await db.socialProof.findFirst({ where: { shop } });

  if (!socialProof) {
    socialProof = await db.socialProof.create({
      data: { shop },
    });
  }

  let demoItems = [];
  try {
    demoItems = JSON.parse(socialProof.demoItems || "[]");
  } catch (e) {
    demoItems = [];
  }

  return { socialProof, demoItems };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const mode = formData.get("mode");
  const position = formData.get("position");
  const pageTargeting = formData.get("pageTargeting");
  const displayDuration = Number(formData.get("displayDuration"));
  const intervalBetween = Number(formData.get("intervalBetween"));
  const firstDelayMs = Number(formData.get("firstDelayMs"));
  const randomizeOrder = formData.get("randomizeOrder") === "true";
  const showTimeAgo = formData.get("showTimeAgo") === "true";
  const demoItems = formData.get("demoItems");
  const bgColor = formData.get("bgColor");
  const textColor = formData.get("textColor");
  const accentColor = formData.get("accentColor");
  const fontSizeDesktop = Number(formData.get("fontSizeDesktop"));
  const fontSizeMobile = Number(formData.get("fontSizeMobile"));
  const isActive = formData.get("isActive") === "true";

  const existing = await db.socialProof.findFirst({ where: { shop } });

  const updated = await db.socialProof.update({
    where: { id: existing.id },
    data: {
      mode,
      position,
      pageTargeting,
      displayDuration,
      intervalBetween,
      firstDelayMs,
      randomizeOrder,
      showTimeAgo,
      demoItems,
      bgColor,
      textColor,
      accentColor,
      fontSizeDesktop,
      fontSizeMobile,
      isActive,
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
    mode,
    position,
    pageTargeting,
    displayDuration,
    intervalBetween,
    firstDelayMs,
    randomizeOrder,
    showTimeAgo,
    demoItems: JSON.parse(demoItems || "[]"),
    bgColor,
    textColor,
    accentColor,
    fontSizeDesktop,
    fontSizeMobile,
    isActive,
  });

  await admin.graphql(
    `#graphql
    mutation SetSocialProofMetafield($metafields: [MetafieldsSetInput!]!) {
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
            key: "social_proof",
            type: "json",
            value: metafieldValue,
          },
        ],
      },
    }
  );

  return { socialProof: updated };
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const notificationTypes = [
  { value: "purchase", label: "Recent purchase" },
  { value: "viewer", label: "Live viewer count" },
  { value: "lowstock", label: "Low stock alert" },
  { value: "custom", label: "Custom message" },
];

const typeIcons = {
  purchase: "🛒",
  viewer: "👀",
  lowstock: "⚠️",
  custom: "🔔",
};

function buildMessage(item) {
  if (item.type === "purchase") {
    return `${item.name || "Someone"} from ${
      item.location || "somewhere"
    } just bought ${item.product || "a product"}`;
  }
  if (item.type === "viewer") {
    return `${item.viewerCount || "12"} people are viewing this page`;
  }
  if (item.type === "lowstock") {
    return `Only ${item.stockCount || "3"} left of ${
      item.product || "this item"
    }!`;
  }
  return item.customMessage || "Custom notification message";
}

function DemoItemCard({ item, onChange, onRemove }) {
  return (
    <s-box
      padding="base"
      borderWidth="base"
      borderColor="base"
      borderRadius="base"
      background="base"
    >
      <s-stack direction="block" gap="base">
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-select
            label="Type"
            value={item.type}
            onChange={(e) => onChange({ ...item, type: e.target.value })}
          >
            {notificationTypes.map((t) => (
              <s-option key={t.value} value={t.value}>
                {t.label}
              </s-option>
            ))}
          </s-select>
          <s-button variant="tertiary" tone="critical" onClick={onRemove}>
            Remove
          </s-button>
        </s-stack>

        {item.type === "purchase" && (
          <s-stack direction="inline" gap="base">
            <s-text-field
              label="Customer name"
              value={item.name || ""}
              onChange={(e) => onChange({ ...item, name: e.target.value })}
            ></s-text-field>
            <s-text-field
              label="Location"
              value={item.location || ""}
              onChange={(e) =>
                onChange({ ...item, location: e.target.value })
              }
            ></s-text-field>
            <s-text-field
              label="Product name"
              value={item.product || ""}
              onChange={(e) => onChange({ ...item, product: e.target.value })}
            ></s-text-field>
          </s-stack>
        )}

        {item.type === "viewer" && (
          <s-text-field
            label="Viewer count"
            value={item.viewerCount || ""}
            onChange={(e) =>
              onChange({ ...item, viewerCount: e.target.value })
            }
          ></s-text-field>
        )}

        {item.type === "lowstock" && (
          <s-stack direction="inline" gap="base">
            <s-text-field
              label="Product name"
              value={item.product || ""}
              onChange={(e) => onChange({ ...item, product: e.target.value })}
            ></s-text-field>
            <s-text-field
              label="Stock count"
              value={item.stockCount || ""}
              onChange={(e) =>
                onChange({ ...item, stockCount: e.target.value })
              }
            ></s-text-field>
          </s-stack>
        )}

        {item.type === "custom" && (
          <s-text-field
            label="Message"
            value={item.customMessage || ""}
            onChange={(e) =>
              onChange({ ...item, customMessage: e.target.value })
            }
          ></s-text-field>
        )}

        <s-text tone="subdued">Preview: {buildMessage(item)}</s-text>
      </s-stack>
    </s-box>
  );
}

function NotificationPreview({ item, settings, fontSize }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: settings.bgColor,
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        color: settings.textColor,
        display: "flex",
        fontSize: `${fontSize}px`,
        gap: "10px",
        maxWidth: "320px",
        padding: "12px 14px",
      }}
    >
      <span style={{ fontSize: "20px" }}>{typeIcons[item.type]}</span>
      <div>
        <div>{buildMessage(item)}</div>
        {settings.showTimeAgo && (
          <div
            style={{
              color: settings.accentColor,
              fontSize: "11px",
              marginTop: "2px",
            }}
          >
            2 minutes ago
          </div>
        )}
      </div>
    </div>
  );
}

const positionOptions = [
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
];

const pageTargetingOptions = [
  { value: "all", label: "All pages" },
  { value: "home", label: "Homepage only" },
  { value: "product", label: "Product pages only" },
  { value: "collection", label: "Collection pages only" },
];

export default function SocialProof() {
  const { socialProof, demoItems: initialDemoItems } = useLoaderData();
  const fetcher = useFetcher();

  const [mode, setMode] = useState(socialProof.mode);
  const [position, setPosition] = useState(socialProof.position);
  const [pageTargeting, setPageTargeting] = useState(
    socialProof.pageTargeting
  );
  const [displayDuration, setDisplayDuration] = useState(
    socialProof.displayDuration
  );
  const [intervalBetween, setIntervalBetween] = useState(
    socialProof.intervalBetween
  );
  const [firstDelayMs, setFirstDelayMs] = useState(socialProof.firstDelayMs);
  const [randomizeOrder, setRandomizeOrder] = useState(
    socialProof.randomizeOrder
  );
  const [showTimeAgo, setShowTimeAgo] = useState(socialProof.showTimeAgo);
  const [demoItemsList, setDemoItemsList] = useState(
    initialDemoItems.length > 0
      ? initialDemoItems
      : [
          {
            id: generateId(),
            type: "purchase",
            name: "Karim",
            location: "Dhaka",
            product: "Blue T-shirt",
          },
        ]
  );
  const [bgColor, setBgColor] = useState(socialProof.bgColor);
  const [textColor, setTextColor] = useState(socialProof.textColor);
  const [accentColor, setAccentColor] = useState(socialProof.accentColor);
  const [fontSizeDesktop, setFontSizeDesktop] = useState(
    socialProof.fontSizeDesktop
  );
  const [fontSizeMobile, setFontSizeMobile] = useState(
    socialProof.fontSizeMobile
  );
  const [isActive, setIsActive] = useState(socialProof.isActive);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewIndex, setPreviewIndex] = useState(0);

  const updateItem = (index, updatedItem) => {
    const copy = [...demoItemsList];
    copy[index] = updatedItem;
    setDemoItemsList(copy);
  };

  const removeItem = (index) => {
    setDemoItemsList(demoItemsList.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setDemoItemsList([
      ...demoItemsList,
      { id: generateId(), type: "purchase", name: "", location: "", product: "" },
    ]);
  };

  const handleSave = () => {
    fetcher.submit(
      {
        mode,
        position,
        pageTargeting,
        displayDuration: String(displayDuration),
        intervalBetween: String(intervalBetween),
        firstDelayMs: String(firstDelayMs),
        randomizeOrder: String(randomizeOrder),
        showTimeAgo: String(showTimeAgo),
        demoItems: JSON.stringify(demoItemsList),
        bgColor,
        textColor,
        accentColor,
        fontSizeDesktop: String(fontSizeDesktop),
        fontSizeMobile: String(fontSizeMobile),
        isActive: String(isActive),
      },
      { method: "post" }
    );
  };

  const handleDiscard = () => {
    setMode(socialProof.mode);
    setPosition(socialProof.position);
    setPageTargeting(socialProof.pageTargeting);
    setDisplayDuration(socialProof.displayDuration);
    setIntervalBetween(socialProof.intervalBetween);
    setFirstDelayMs(socialProof.firstDelayMs);
    setRandomizeOrder(socialProof.randomizeOrder);
    setShowTimeAgo(socialProof.showTimeAgo);
    setDemoItemsList(initialDemoItems);
    setBgColor(socialProof.bgColor);
    setTextColor(socialProof.textColor);
    setAccentColor(socialProof.accentColor);
    setFontSizeDesktop(socialProof.fontSizeDesktop);
    setFontSizeMobile(socialProof.fontSizeMobile);
    setIsActive(socialProof.isActive);
  };

  const isDirty =
    mode !== socialProof.mode ||
    position !== socialProof.position ||
    pageTargeting !== socialProof.pageTargeting ||
    displayDuration !== socialProof.displayDuration ||
    intervalBetween !== socialProof.intervalBetween ||
    firstDelayMs !== socialProof.firstDelayMs ||
    randomizeOrder !== socialProof.randomizeOrder ||
    showTimeAgo !== socialProof.showTimeAgo ||
    JSON.stringify(demoItemsList) !== JSON.stringify(initialDemoItems) ||
    bgColor !== socialProof.bgColor ||
    textColor !== socialProof.textColor ||
    accentColor !== socialProof.accentColor ||
    fontSizeDesktop !== socialProof.fontSizeDesktop ||
    fontSizeMobile !== socialProof.fontSizeMobile ||
    isActive !== socialProof.isActive;

  const activeFontSize =
    previewDevice === "desktop" ? fontSizeDesktop : fontSizeMobile;
  const currentPreviewItem =
    demoItemsList[previewIndex] || demoItemsList[0] || {};

  return (
    <s-page heading="Social proof">
      <s-button
        slot="primary-action"
        variant="primary"
        onClick={handleSave}
        loading={fetcher.state !== "idle" ? "" : undefined}
        disabled={!isDirty || fetcher.state !== "idle" ? "" : undefined}
      >
        Save
      </s-button>
      {isDirty && (
        <s-button slot="secondary-actions" onClick={handleDiscard}>
          Discard
        </s-button>
      )}

      <s-section heading="Live preview">
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="end"
        >
          <s-button
            variant={previewDevice === "desktop" ? "primary" : "secondary"}
            onClick={() => setPreviewDevice("desktop")}
          >
            Desktop
          </s-button>
          <s-button
            variant={previewDevice === "mobile" ? "primary" : "secondary"}
            onClick={() => setPreviewDevice("mobile")}
          >
            Mobile
          </s-button>
        </s-stack>

        <div
          style={{
            alignItems:
              position.indexOf("left") !== -1 ? "flex-start" : "flex-end",
            background: "#f1f2f3",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent:
              position.indexOf("top") !== -1 ? "flex-start" : "flex-end",
            margin: "12px auto 0",
            maxWidth: previewDevice === "mobile" ? "380px" : "100%",
            minHeight: "180px",
            padding: "16px",
          }}
        >
          {demoItemsList.length > 0 && (
            <NotificationPreview
              item={currentPreviewItem}
              settings={{ bgColor, textColor, accentColor, showTimeAgo }}
              fontSize={activeFontSize}
            />
          )}
        </div>

        {demoItemsList.length > 1 && (
          <s-stack direction="inline" gap="tight">
            <s-text tone="subdued">Preview item:</s-text>
            <s-select
              value={String(previewIndex)}
              onChange={(e) => setPreviewIndex(Number(e.target.value))}
            >
              {demoItemsList.map((item, i) => (
                <s-option key={item.id || i} value={String(i)}>
                  {i + 1}. {buildMessage(item).slice(0, 30)}...
                </s-option>
              ))}
            </s-select>
          </s-stack>
        )}
      </s-section>

      <s-section heading="General">
        <s-badge tone={isActive ? "success" : "neutral"}>
          {isActive ? "Active" : "Inactive"}
        </s-badge>

        <s-stack direction="block" gap="base">
          <s-select
            label="Data source"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <s-option value="demo">Custom / demo notifications</s-option>
            <s-option value="real">Real recent orders</s-option>
          </s-select>

          <s-select
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            {positionOptions.map((opt) => (
              <s-option key={opt.value} value={opt.value}>
                {opt.label}
              </s-option>
            ))}
          </s-select>

          <s-select
            label="Show on"
            value={pageTargeting}
            onChange={(e) => setPageTargeting(e.target.value)}
          >
            {pageTargetingOptions.map((opt) => (
              <s-option key={opt.value} value={opt.value}>
                {opt.label}
              </s-option>
            ))}
          </s-select>

          <s-switch
            label="Randomize order"
            details="Show demo notifications in random order instead of sequence"
            checked={randomizeOrder}
            onChange={(e) => setRandomizeOrder(e.target.checked)}
          ></s-switch>

          <s-switch
            label="Show 'time ago' text"
            details="Display relative time like '2 minutes ago'"
            checked={showTimeAgo}
            onChange={(e) => setShowTimeAgo(e.target.checked)}
          ></s-switch>

          <s-switch
            label="Active"
            details="Show social proof notifications on your storefront"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          ></s-switch>
        </s-stack>
      </s-section>

      {mode === "demo" && (
        <s-section heading="Demo notifications">
          <s-stack direction="block" gap="base">
            {demoItemsList.map((item, index) => (
              <DemoItemCard
                key={item.id || index}
                item={item}
                onChange={(updated) => updateItem(index, updated)}
                onRemove={() => removeItem(index)}
              />
            ))}
            <s-button onClick={addItem}>+ Add notification</s-button>
          </s-stack>
        </s-section>
      )}

      <s-section heading="Timing">
        <s-stack direction="block" gap="base">
          <s-stack direction="block" gap="tight">
            <s-text>
              Display duration ({(displayDuration / 1000).toFixed(1)}s)
            </s-text>
            <input
              type="range"
              min="2000"
              max="10000"
              step="500"
              value={displayDuration}
              onChange={(e) => setDisplayDuration(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </s-stack>

          <s-stack direction="block" gap="tight">
            <s-text>
              Gap between notifications ({(intervalBetween / 1000).toFixed(1)}s)
            </s-text>
            <input
              type="range"
              min="3000"
              max="20000"
              step="500"
              value={intervalBetween}
              onChange={(e) => setIntervalBetween(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </s-stack>

          <s-stack direction="block" gap="tight">
            <s-text>
              First notification delay ({(firstDelayMs / 1000).toFixed(1)}s)
            </s-text>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={firstDelayMs}
              onChange={(e) => setFirstDelayMs(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </s-stack>
        </s-stack>
      </s-section>

      <s-section heading="Colors">
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

          <s-color-field
            label="Accent color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
          ></s-color-field>
        </s-stack>
      </s-section>

      <s-section heading="Font size">
        <s-stack direction="inline" gap="base">
          <s-stack direction="block" gap="tight">
            <s-text>Desktop ({fontSizeDesktop}px)</s-text>
            <input
              type="range"
              min="11"
              max="18"
              step="1"
              value={fontSizeDesktop}
              onChange={(e) => setFontSizeDesktop(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </s-stack>

          <s-stack direction="block" gap="tight">
            <s-text>Mobile ({fontSizeMobile}px)</s-text>
            <input
              type="range"
              min="10"
              max="16"
              step="1"
              value={fontSizeMobile}
              onChange={(e) => setFontSizeMobile(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </s-stack>
        </s-stack>
      </s-section>
    </s-page>
  );
}