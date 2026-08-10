import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  let recommendation = await db.recommendation.findFirst({ where: { shop } });

  if (!recommendation) {
    recommendation = await db.recommendation.create({
      data: { shop },
    });
  }

  const productsResponse = await admin.graphql(`#graphql
    query {
      products(first: 8) {
        edges {
          node {
            id
            title
            featuredImage {
              url
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }`);
  const productsData = await productsResponse.json();
  const products = productsData.data.products.edges.map((e) => e.node);

  return { recommendation, products };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const heading = formData.get("heading");
  const headingColor = formData.get("headingColor");
  const headingFontSizeDesktop = Number(
    formData.get("headingFontSizeDesktop")
  );
  const headingFontSizeMobile = Number(formData.get("headingFontSizeMobile"));
  const backgroundColor = formData.get("backgroundColor");
  const productLimit = Number(formData.get("productLimit"));
  const columnsDesktop = Number(formData.get("columnsDesktop"));
  const columnsMobile = Number(formData.get("columnsMobile"));
  const cardStyle = formData.get("cardStyle");
  const isActive = formData.get("isActive") === "true";

  const existing = await db.recommendation.findFirst({ where: { shop } });

  const updated = await db.recommendation.update({
    where: { id: existing.id },
    data: {
      heading,
      headingColor,
      headingFontSizeDesktop,
      headingFontSizeMobile,
      backgroundColor,
      productLimit,
      columnsDesktop,
      columnsMobile,
      cardStyle,
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
    heading,
    headingColor,
    headingFontSizeDesktop,
    headingFontSizeMobile,
    backgroundColor,
    productLimit,
    columnsDesktop,
    columnsMobile,
    cardStyle,
    isActive,
  });

  await admin.graphql(
    `#graphql
    mutation SetRecommendationMetafield($metafields: [MetafieldsSetInput!]!) {
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
            key: "recommendation",
            type: "json",
            value: metafieldValue,
          },
        ],
      },
    }
  );

  return { recommendation: updated };
};

const cardStyleOptions = [
  { value: "style1", label: "Style 1 — Minimal" },
  { value: "style2", label: "Style 2 — Bordered" },
  { value: "style3", label: "Style 3 — Shadow" },
  { value: "style4", label: "Style 4 — Price overlay" },
  { value: "theme", label: "Use theme's product card style" },
];

function formatPrice(product) {
  if (!product) return "$0.00";
  const amount = product.priceRangeV2?.minVariantPrice?.amount;
  const currency = product.priceRangeV2?.minVariantPrice?.currencyCode || "";
  if (!amount) return "$0.00";
  return `${Number(amount).toFixed(2)} ${currency}`;
}

function ProductImage({ product, height }) {
  if (product?.featuredImage?.url) {
    return (
      <img
        src={product.featuredImage.url}
        alt={product.title}
        style={{
          width: "100%",
          height,
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height,
        background:
          "linear-gradient(135deg, #f1f2f3 25%, #e4e5e7 25%, #e4e5e7 50%, #f1f2f3 50%, #f1f2f3 75%, #e4e5e7 75%, #e4e5e7 100%)",
        backgroundSize: "16px 16px",
      }}
    />
  );
}

function Style1Minimal({ product }) {
  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ borderRadius: "10px", overflow: "hidden" }}>
        <ProductImage product={product} height="140px" />
      </div>
      <p
        style={{
          margin: "10px 0 2px",
          fontSize: "13px",
          fontWeight: "500",
          color: "#202223",
        }}
      >
        {product?.title || "Product title"}
      </p>
      <p style={{ margin: 0, fontSize: "13px", color: "#6d7175" }}>
        {formatPrice(product)}
      </p>
    </div>
  );
}

function Style2Bordered({ product }) {
  return (
    <div
      style={{
        border: "1px solid #d1d3d6",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <ProductImage product={product} height="140px" />
      <div style={{ padding: "12px" }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#202223",
          }}
        >
          {product?.title || "Product title"}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#6d7175" }}>
          {formatPrice(product)}
        </p>
      </div>
    </div>
  );
}

function Style3Shadow({ product }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <ProductImage product={product} height="140px" />
      <div style={{ padding: "14px" }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#202223",
          }}
        >
          {product?.title || "Product title"}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#008060" }}>
          {formatPrice(product)}
        </p>
      </div>
    </div>
  );
}

function Style4PriceOverlay({ product }) {
  return (
    <div style={{ borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ position: "relative" }}>
        <ProductImage product={product} height="160px" />
        <span
          style={{
            background: "#202223",
            borderRadius: "999px",
            bottom: "10px",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "600",
            left: "50%",
            padding: "6px 14px",
            position: "absolute",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          {formatPrice(product)}
        </span>
      </div>
      <p
        style={{
          margin: "10px 0 0",
          fontSize: "13px",
          fontWeight: "500",
          color: "#202223",
        }}
      >
        {product?.title || "Product title"}
      </p>
    </div>
  );
}

function ThemeStyle({ product }) {
  return (
    <div
      style={{
        border: "1px solid #e1e3e5",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <ProductImage product={product} height="140px" />
      <div style={{ padding: "10px" }}>
        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#202223" }}>
          {product?.title || "Product title"}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#6d7175" }}>
          {formatPrice(product)}
        </p>
      </div>
    </div>
  );
}

const cardComponents = {
  style1: Style1Minimal,
  style2: Style2Bordered,
  style3: Style3Shadow,
  style4: Style4PriceOverlay,
  theme: ThemeStyle,
};

export default function Recommendations() {
  const { recommendation, products } = useLoaderData();
  const fetcher = useFetcher();

  const [heading, setHeading] = useState(recommendation.heading);
  const [headingColor, setHeadingColor] = useState(
    recommendation.headingColor
  );
  const [headingFontSizeDesktop, setHeadingFontSizeDesktop] = useState(
    recommendation.headingFontSizeDesktop
  );
  const [headingFontSizeMobile, setHeadingFontSizeMobile] = useState(
    recommendation.headingFontSizeMobile
  );
  const [backgroundColor, setBackgroundColor] = useState(
    recommendation.backgroundColor
  );
  const [productLimit, setProductLimit] = useState(
    recommendation.productLimit
  );
  const [columnsDesktop, setColumnsDesktop] = useState(
    recommendation.columnsDesktop
  );
  const [columnsMobile, setColumnsMobile] = useState(
    recommendation.columnsMobile
  );
  const [cardStyle, setCardStyle] = useState(recommendation.cardStyle);
  const [isActive, setIsActive] = useState(recommendation.isActive);
  const [previewDevice, setPreviewDevice] = useState("desktop");

  const handleSave = () => {
    fetcher.submit(
      {
        heading,
        headingColor,
        headingFontSizeDesktop: String(headingFontSizeDesktop),
        headingFontSizeMobile: String(headingFontSizeMobile),
        backgroundColor,
        productLimit: String(productLimit),
        columnsDesktop: String(columnsDesktop),
        columnsMobile: String(columnsMobile),
        cardStyle,
        isActive: String(isActive),
      },
      { method: "post" }
    );
  };

  const handleDiscard = () => {
    setHeading(recommendation.heading);
    setHeadingColor(recommendation.headingColor);
    setHeadingFontSizeDesktop(recommendation.headingFontSizeDesktop);
    setHeadingFontSizeMobile(recommendation.headingFontSizeMobile);
    setBackgroundColor(recommendation.backgroundColor);
    setProductLimit(recommendation.productLimit);
    setColumnsDesktop(recommendation.columnsDesktop);
    setColumnsMobile(recommendation.columnsMobile);
    setCardStyle(recommendation.cardStyle);
    setIsActive(recommendation.isActive);
  };

  const isDirty =
    heading !== recommendation.heading ||
    headingColor !== recommendation.headingColor ||
    headingFontSizeDesktop !== recommendation.headingFontSizeDesktop ||
    headingFontSizeMobile !== recommendation.headingFontSizeMobile ||
    backgroundColor !== recommendation.backgroundColor ||
    productLimit !== recommendation.productLimit ||
    columnsDesktop !== recommendation.columnsDesktop ||
    columnsMobile !== recommendation.columnsMobile ||
    cardStyle !== recommendation.cardStyle ||
    isActive !== recommendation.isActive;

  const CardComponent = cardComponents[cardStyle] || Style1Minimal;
  const activeColumns =
    previewDevice === "desktop" ? columnsDesktop : columnsMobile;
  const activeFontSize =
    previewDevice === "desktop"
      ? headingFontSizeDesktop
      : headingFontSizeMobile;
  const previewItems = Array.from({ length: productLimit }).map(
    (_, i) => products[i] || null
  );

  return (
    <s-page heading="Product recommendations">
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
            background: backgroundColor,
            borderRadius: "10px",
            margin: "12px auto 0",
            maxWidth: previewDevice === "mobile" ? "380px" : "100%",
            padding: "20px",
            transition: "max-width 0.2s ease",
          }}
        >
          <p
            style={{
              color: headingColor,
              fontSize: `${activeFontSize}px`,
              fontWeight: "700",
              margin: "0 0 16px",
            }}
          >
            {heading || "You might also like"}
          </p>

          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: `repeat(${activeColumns}, 1fr)`,
            }}
          >
            {previewItems.map((product, i) => (
              <CardComponent key={product?.id || i} product={product} />
            ))}
          </div>

          {cardStyle === "theme" && (
            <p
              style={{
                color: "#6d7175",
                fontSize: "12px",
                margin: "14px 0 0",
              }}
            >
              This is a generic preview. On your storefront it will match
              your theme's actual product card design.
            </p>
          )}

          {products.length === 0 && (
            <p
              style={{
                color: "#6d7175",
                fontSize: "12px",
                margin: "14px 0 0",
              }}
            >
              Add products to your store to see them in this preview.
            </p>
          )}
        </div>
      </s-section>

      <s-section heading="General">
        <s-badge tone={isActive ? "success" : "neutral"}>
          {isActive ? "Active" : "Inactive"}
        </s-badge>

        <s-stack direction="block" gap="base">
          <s-text-field
            label="Heading text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
          ></s-text-field>

          <s-stack direction="inline" gap="base">
            <s-color-field
              label="Heading color"
              value={headingColor}
              onChange={(e) => setHeadingColor(e.target.value)}
            ></s-color-field>

            <s-color-field
              label="Background color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            ></s-color-field>
          </s-stack>

          <s-number-field
            label="Number of products to show"
            min="2"
            max="8"
            value={productLimit}
            onChange={(e) => setProductLimit(Number(e.target.value))}
          ></s-number-field>

          <s-select
            label="Product card style"
            value={cardStyle}
            onChange={(e) => setCardStyle(e.target.value)}
          >
            {cardStyleOptions.map((opt) => (
              <s-option key={opt.value} value={opt.value}>
                {opt.label}
              </s-option>
            ))}
          </s-select>

          <s-switch
            label="Active"
            details="Show product recommendations on your storefront"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          ></s-switch>
        </s-stack>
      </s-section>

      <s-section heading="Desktop settings">
        <s-stack direction="inline" gap="base">
          <s-stack direction="block" gap="tight">
            <s-text>Heading font size ({headingFontSizeDesktop}px)</s-text>
            <input
              type="range"
              min="16"
              max="36"
              step="1"
              value={headingFontSizeDesktop}
              onChange={(e) =>
                setHeadingFontSizeDesktop(Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </s-stack>

          <s-number-field
            label="Columns (desktop)"
            min="2"
            max="6"
            value={columnsDesktop}
            onChange={(e) => setColumnsDesktop(Number(e.target.value))}
          ></s-number-field>
        </s-stack>
      </s-section>

      <s-section heading="Mobile settings">
        <s-stack direction="inline" gap="base">
          <s-stack direction="block" gap="tight">
            <s-text>Heading font size ({headingFontSizeMobile}px)</s-text>
            <input
              type="range"
              min="12"
              max="28"
              step="1"
              value={headingFontSizeMobile}
              onChange={(e) =>
                setHeadingFontSizeMobile(Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </s-stack>

          <s-number-field
            label="Columns (mobile)"
            min="1"
            max="3"
            value={columnsMobile}
            onChange={(e) => setColumnsMobile(Number(e.target.value))}
          ></s-number-field>
        </s-stack>
      </s-section>
    </s-page>
  );
}