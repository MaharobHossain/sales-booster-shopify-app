export default function Settings() {
  return (
    <s-page heading="Settings" inlineSize="small">
      <s-section>
        <s-stack direction="block" gap="base">
          <s-heading>Store preferences</s-heading>

          <s-text>
            Manage the default settings for your Sales Booster app.
          </s-text>

          <s-text-field
            label="Support email"
            name="supportEmail"
            type="email"
            placeholder="support@example.com"
          />

          <s-select label="Default currency" name="currency">
            <option value="USD">USD — US Dollar</option>
            <option value="BDT">BDT — Bangladeshi Taka</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </s-select>

          <s-select label="Timezone" name="timezone">
            <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">
              America/New York
            </option>
            <option value="Europe/London">Europe/London</option>
          </s-select>
        </s-stack>
      </s-section>

      <s-section>
        <s-stack direction="block" gap="base">
          <s-heading>Help and support</s-heading>

          <s-text>
            Need help setting up your conversion tools? Visit the setup guide.
          </s-text>

          <s-button>View setup guide</s-button>
        </s-stack>
      </s-section>

      <s-button slot="primary-action" variant="primary">
        Save settings
      </s-button>
    </s-page>
  );
}