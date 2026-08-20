export default function Analytics() {
  return (
    <s-page heading="Analytics" inlineSize="large">
      <s-section>
        <s-stack direction="block" gap="base">
          <s-heading>Performance overview</s-heading>
          <s-text>
            Analytics tracking for sales booster tools will appear here.
          </s-text>
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="inline" gap="base">
          <s-box padding="base" borderWidth="base" borderColor="base" borderRadius="base" background="base">
            <s-stack direction="block" gap="tight">
              <s-text tone="subdued">Impressions</s-text>
              <s-text size="large">0</s-text>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderColor="base" borderRadius="base" background="base">
            <s-stack direction="block" gap="tight">
              <s-text tone="subdued">Clicks</s-text>
              <s-text size="large">0</s-text>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderColor="base" borderRadius="base" background="base">
            <s-stack direction="block" gap="tight">
              <s-text tone="subdued">Conversions</s-text>
              <s-text size="large">0</s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
    </s-page>
  );
}
