import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let timer = await db.countdownTimer.findFirst({ where: { shop } });

  if (!timer) {
    timer = await db.countdownTimer.create({
      data: { shop },
    });
  }

  return { timer };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const template = formData.get("template");
  const mode = formData.get("mode");
  const endDateTimeRaw = formData.get("endDateTime");
  const endDateTime = endDateTimeRaw ? new Date(endDateTimeRaw) : null;
  const dailyEndTime = formData.get("dailyEndTime");
  const title = formData.get("title");
  const caption = formData.get("caption");
  const buttonText = formData.get("buttonText");
  const buttonLink = formData.get("buttonLink");
  const bgColor = formData.get("bgColor");
  const textColor = formData.get("textColor");
  const accentColor = formData.get("accentColor");
  const titleFontSizeDesktop = Number(formData.get("titleFontSizeDesktop"));
  const titleFontSizeMobile = Number(formData.get("titleFontSizeMobile"));
  const numberFontSizeDesktop = Number(
    formData.get("numberFontSizeDesktop")
  );
  const numberFontSizeMobile = Number(formData.get("numberFontSizeMobile"));
  const isActive = formData.get("isActive") === "true";

  const existing = await db.countdownTimer.findFirst({ where: { shop } });

  const updated = await db.countdownTimer.update({
    where: { id: existing.id },
    data: {
      template,
      mode,
      endDateTime,
      dailyEndTime,
      title,
      caption,
      buttonText,
      buttonLink,
      bgColor,
      textColor,
      accentColor,
      titleFontSizeDesktop,
      titleFontSizeMobile,
      numberFontSizeDesktop,
      numberFontSizeMobile,
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
    template,
    mode,
    endDateTime: endDateTime ? endDateTime.toISOString() : null,
    dailyEndTime,
    title,
    caption,
    buttonText,
    buttonLink,
    bgColor,
    textColor,
    accentColor,
    titleFontSizeDesktop,
    titleFontSizeMobile,
    numberFontSizeDesktop,
    numberFontSizeMobile,
    isActive,
  });

  await admin.graphql(
    `#graphql
    mutation SetCountdownMetafield($metafields: [MetafieldsSetInput!]!) {
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
            key: "countdown",
            type: "json",
            value: metafieldValue,
          },
        ],
      },
    }
  );

  return { timer: updated };
};

function useCountdown(mode, endDateTime, dailyEndTime) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      let target;

      if (mode === "daily") {
        const [h, m] = (dailyEndTime || "23:59").split(":").map(Number);
        target = new Date();
        target.setHours(h, m, 0, 0);
        if (target.getTime() < Date.now()) {
          target.setDate(target.getDate() + 1);
        }
      } else {
        target = endDateTime
          ? new Date(endDateTime)
          : new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      const diff = Math.max(0, target.getTime() - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [mode, endDateTime, dailyEndTime]);

  return timeLeft;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

const templateOptions = [
  { value: "minimal", label: "Minimal" },
  { value: "darkGradient", label: "Dark Gradient" },
  { value: "boxedNumbers", label: "Boxed Numbers" },
  { value: "boldCentered", label: "Bold Centered" },
  { value: "cardStyle", label: "Card Style" },
];

function TemplateMinimal({ settings, timeLeft, fontSizes }) {
  return (
    <div
      style={{
        background: settings.bgColor,
        color: settings.textColor,
        padding: "24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: `${fontSizes.title}px`,
          fontWeight: "600",
          margin: "0 0 14px",
        }}
      >
        {settings.title}
      </p>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        {["days", "hours", "minutes", "seconds"].map((unit) => (
          <div key={unit}>
            <div
              style={{ fontSize: `${fontSizes.number}px`, fontWeight: "700" }}
            >
              {pad(timeLeft[unit])}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.7 }}>{unit}</div>
          </div>
        ))}
      </div>
      {settings.buttonText && (
        <button
          style={{
            background: settings.accentColor,
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            marginTop: "16px",
            padding: "8px 20px",
          }}
        >
          {settings.buttonText}
        </button>
      )}
    </div>
  );
}

function TemplateDarkGradient({ settings, timeLeft, fontSizes }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${settings.bgColor}, #000)`,
        color: settings.textColor,
        padding: "28px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: `${fontSizes.title}px`,
          letterSpacing: "2px",
          margin: "0 0 16px",
          textTransform: "uppercase",
        }}
      >
        {settings.title}
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        {["days", "hours", "minutes", "seconds"].map((unit) => (
          <div key={unit}>
            <div
              style={{
                fontSize: `${fontSizes.number}px`,
                fontWeight: "700",
                textShadow: `0 0 20px ${settings.accentColor}`,
              }}
            >
              {pad(timeLeft[unit])}
            </div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "1px",
                opacity: 0.6,
                textTransform: "uppercase",
              }}
            >
              {unit}
            </div>
          </div>
        ))}
      </div>
      {settings.buttonText && (
        <button
          style={{
            background: "transparent",
            border: `1px solid ${settings.accentColor}`,
            borderRadius: "999px",
            color: settings.textColor,
            marginTop: "18px",
            padding: "8px 22px",
          }}
        >
          {settings.buttonText}
        </button>
      )}
    </div>
  );
}

function TemplateBoxedNumbers({ settings, timeLeft, fontSizes }) {
  return (
    <div
      style={{
        background: settings.bgColor,
        color: settings.textColor,
        padding: "24px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: `${fontSizes.title}px`,
          fontWeight: "600",
          margin: "0 0 16px",
        }}
      >
        {settings.title}
      </p>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {["days", "hours", "minutes", "seconds"].map((unit, i) => (
          <div key={unit} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                background: settings.accentColor,
                borderRadius: "8px",
                padding: "8px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: `${fontSizes.number}px`,
                  fontWeight: "700",
                }}
              >
                {pad(timeLeft[unit])}
              </div>
              <div style={{ fontSize: "10px", opacity: 0.85 }}>{unit}</div>
            </div>
            {i < 3 && (
              <span
                style={{ fontSize: `${fontSizes.number}px`, padding: "0 4px" }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
      {settings.buttonText && (
        <button
          style={{
            background: settings.accentColor,
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            marginTop: "18px",
            padding: "8px 20px",
          }}
        >
          {settings.buttonText}
        </button>
      )}
    </div>
  );
}

function TemplateBoldCentered({ settings, timeLeft, fontSizes }) {
  return (
    <div
      style={{
        background: settings.bgColor,
        color: settings.textColor,
        padding: "30px",
        textAlign: "center",
      }}
    >
      {settings.caption && (
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "3px",
            margin: "0 0 8px",
            opacity: 0.7,
            textTransform: "uppercase",
          }}
        >
          {settings.caption}
        </p>
      )}
      <p
        style={{
          fontSize: `${fontSizes.title}px`,
          fontWeight: "700",
          margin: "0 0 18px",
        }}
      >
        {settings.title}
      </p>
      <div
        style={{
          fontSize: `${fontSizes.number}px`,
          fontWeight: "800",
          letterSpacing: "2px",
        }}
      >
        {pad(timeLeft.days)}:{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:
        {pad(timeLeft.seconds)}
      </div>
      {settings.buttonText && (
        <button
          style={{
            background: settings.accentColor,
            border: "none",
            borderRadius: "999px",
            color: "#fff",
            marginTop: "20px",
            padding: "10px 28px",
          }}
        >
          {settings.buttonText}
        </button>
      )}
    </div>
  );
}

function TemplateCardStyle({ settings, timeLeft, fontSizes }) {
  return (
    <div
      style={{
        background: settings.bgColor,
        borderRadius: "16px",
        color: settings.textColor,
        padding: "26px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: `${fontSizes.title}px`,
          fontWeight: "700",
          margin: "0 0 4px",
        }}
      >
        {settings.title}
      </p>
      {settings.caption && (
        <p style={{ fontSize: "13px", margin: "0 0 16px", opacity: 0.75 }}>
          {settings.caption}
        </p>
      )}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {["days", "hours", "minutes", "seconds"].map((unit) => (
          <div
            key={unit}
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: "10px",
              minWidth: "50px",
              padding: "10px 6px",
            }}
          >
            <div
              style={{ fontSize: `${fontSizes.number}px`, fontWeight: "700" }}
            >
              {pad(timeLeft[unit])}
            </div>
            <div style={{ fontSize: "10px", opacity: 0.7 }}>{unit}</div>
          </div>
        ))}
      </div>
      {settings.buttonText && (
        <button
          style={{
            background: settings.accentColor,
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            marginTop: "18px",
            padding: "10px 24px",
          }}
        >
          {settings.buttonText}
        </button>
      )}
    </div>
  );
}

const templateComponents = {
  minimal: TemplateMinimal,
  darkGradient: TemplateDarkGradient,
  boxedNumbers: TemplateBoxedNumbers,
  boldCentered: TemplateBoldCentered,
  cardStyle: TemplateCardStyle,
};

function toDatetimeLocalValue(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  const pad2 = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate()
  )}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function CountdownTimer() {
  const { timer } = useLoaderData();
  const fetcher = useFetcher();

  const [template, setTemplate] = useState(timer.template);
  const [mode, setMode] = useState(timer.mode);
  const [endDateTime, setEndDateTime] = useState(
    toDatetimeLocalValue(timer.endDateTime)
  );
  const [dailyEndTime, setDailyEndTime] = useState(timer.dailyEndTime);
  const [title, setTitle] = useState(timer.title);
  const [caption, setCaption] = useState(timer.caption || "");
  const [buttonText, setButtonText] = useState(timer.buttonText || "");
  const [buttonLink, setButtonLink] = useState(timer.buttonLink || "");
  const [bgColor, setBgColor] = useState(timer.bgColor);
  const [textColor, setTextColor] = useState(timer.textColor);
  const [accentColor, setAccentColor] = useState(timer.accentColor);
  const [titleFontSizeDesktop, setTitleFontSizeDesktop] = useState(
    timer.titleFontSizeDesktop
  );
  const [titleFontSizeMobile, setTitleFontSizeMobile] = useState(
    timer.titleFontSizeMobile
  );
  const [numberFontSizeDesktop, setNumberFontSizeDesktop] = useState(
    timer.numberFontSizeDesktop
  );
  const [numberFontSizeMobile, setNumberFontSizeMobile] = useState(
    timer.numberFontSizeMobile
  );
  const [isActive, setIsActive] = useState(timer.isActive);
  const [previewDevice, setPreviewDevice] = useState("desktop");

  const handleSave = () => {
    fetcher.submit(
      {
        template,
        mode,
        endDateTime,
        dailyEndTime,
        title,
        caption,
        buttonText,
        buttonLink,
        bgColor,
        textColor,
        accentColor,
        titleFontSizeDesktop: String(titleFontSizeDesktop),
        titleFontSizeMobile: String(titleFontSizeMobile),
        numberFontSizeDesktop: String(numberFontSizeDesktop),
        numberFontSizeMobile: String(numberFontSizeMobile),
        isActive: String(isActive),
      },
      { method: "post" }
    );
  };

  const handleDiscard = () => {
    setTemplate(timer.template);
    setMode(timer.mode);
    setEndDateTime(toDatetimeLocalValue(timer.endDateTime));
    setDailyEndTime(timer.dailyEndTime);
    setTitle(timer.title);
    setCaption(timer.caption || "");
    setButtonText(timer.buttonText || "");
    setButtonLink(timer.buttonLink || "");
    setBgColor(timer.bgColor);
    setTextColor(timer.textColor);
    setAccentColor(timer.accentColor);
    setTitleFontSizeDesktop(timer.titleFontSizeDesktop);
    setTitleFontSizeMobile(timer.titleFontSizeMobile);
    setNumberFontSizeDesktop(timer.numberFontSizeDesktop);
    setNumberFontSizeMobile(timer.numberFontSizeMobile);
    setIsActive(timer.isActive);
  };

  const isDirty =
    template !== timer.template ||
    mode !== timer.mode ||
    endDateTime !== toDatetimeLocalValue(timer.endDateTime) ||
    dailyEndTime !== timer.dailyEndTime ||
    title !== timer.title ||
    caption !== (timer.caption || "") ||
    buttonText !== (timer.buttonText || "") ||
    buttonLink !== (timer.buttonLink || "") ||
    bgColor !== timer.bgColor ||
    textColor !== timer.textColor ||
    accentColor !== timer.accentColor ||
    titleFontSizeDesktop !== timer.titleFontSizeDesktop ||
    titleFontSizeMobile !== timer.titleFontSizeMobile ||
    numberFontSizeDesktop !== timer.numberFontSizeDesktop ||
    numberFontSizeMobile !== timer.numberFontSizeMobile ||
    isActive !== timer.isActive;

  const timeLeft = useCountdown(
    mode,
    mode === "fixed" ? endDateTime : null,
    dailyEndTime
  );

  const TemplateComponent = templateComponents[template] || TemplateMinimal;
  const previewSettings = {
    title,
    caption,
    buttonText,
    bgColor,
    textColor,
    accentColor,
  };
  const previewFontSizes =
    previewDevice === "desktop"
      ? { title: titleFontSizeDesktop, number: numberFontSizeDesktop }
      : { title: titleFontSizeMobile, number: numberFontSizeMobile };

  return (
    <s-page heading="Countdown timer">
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
            borderRadius: "10px",
            margin: "12px auto 0",
            maxWidth: previewDevice === "mobile" ? "380px" : "100%",
            overflow: "hidden",
            transition: "max-width 0.2s ease",
          }}
        >
          <TemplateComponent
            settings={previewSettings}
            timeLeft={timeLeft}
            fontSizes={previewFontSizes}
          />
        </div>
      </s-section>

      <s-section heading="Template">
        <s-badge tone={isActive ? "success" : "neutral"}>
          {isActive ? "Active" : "Inactive"}
        </s-badge>

        <s-stack direction="block" gap="base">
          <s-select
            label="Choose a template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {templateOptions.map((opt) => (
              <s-option key={opt.value} value={opt.value}>
                {opt.label}
              </s-option>
            ))}
          </s-select>

          <s-switch
            label="Active"
            details="Show this countdown timer on your storefront"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          ></s-switch>
        </s-stack>
      </s-section>

      <s-section heading="Timer schedule">
        <s-stack direction="block" gap="base">
          <s-select
            label="Timer mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <s-option value="fixed">Fixed date &amp; time</s-option>
            <s-option value="daily">Daily recurring</s-option>
          </s-select>

          {mode === "fixed" ? (
            <s-stack direction="block" gap="tight">
              <s-text>End date &amp; time</s-text>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                style={{ padding: "6px", width: "100%" }}
              />
            </s-stack>
          ) : (
            <s-stack direction="block" gap="tight">
              <s-text>Resets daily at</s-text>
              <input
                type="time"
                value={dailyEndTime}
                onChange={(e) => setDailyEndTime(e.target.value)}
                style={{ padding: "6px", width: "100%" }}
              />
            </s-stack>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Content">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          ></s-text-field>

          <s-text-field
            label="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          ></s-text-field>

          <s-text-field
            label="Button text (optional)"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
          ></s-text-field>

          <s-text-field
            label="Button link (optional)"
            placeholder="/collections/sale"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
          ></s-text-field>
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

      <s-section heading="Desktop settings">
        <s-stack direction="inline" gap="base">
          <s-stack direction="block" gap="tight">
            <s-text>Title font size ({titleFontSizeDesktop}px)</s-text>
            <input
              type="range"
              min="14"
              max="36"
              step="1"
              value={titleFontSizeDesktop}
              onChange={(e) =>
                setTitleFontSizeDesktop(Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </s-stack>

          <s-stack direction="block" gap="tight">
            <s-text>Number font size ({numberFontSizeDesktop}px)</s-text>
            <input
              type="range"
              min="20"
              max="56"
              step="1"
              value={numberFontSizeDesktop}
              onChange={(e) =>
                setNumberFontSizeDesktop(Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </s-stack>
        </s-stack>
      </s-section>

      <s-section heading="Mobile settings">
        <s-stack direction="inline" gap="base">
          <s-stack direction="block" gap="tight">
            <s-text>Title font size ({titleFontSizeMobile}px)</s-text>
            <input
              type="range"
              min="10"
              max="28"
              step="1"
              value={titleFontSizeMobile}
              onChange={(e) => setTitleFontSizeMobile(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </s-stack>

          <s-stack direction="block" gap="tight">
            <s-text>Number font size ({numberFontSizeMobile}px)</s-text>
            <input
              type="range"
              min="14"
              max="36"
              step="1"
              value={numberFontSizeMobile}
              onChange={(e) =>
                setNumberFontSizeMobile(Number(e.target.value))
              }
              style={{ width: "100%" }}
            />
          </s-stack>
        </s-stack>
      </s-section>
    </s-page>
  );
}