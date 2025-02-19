import { BaseMonitor } from "./BaseMonitor";

//This is an example on how you can combine playwright automation with the monitor for effective debugging with the agent

export class LoginTask extends BaseMonitor {
  private readonly email = "test@test.com";
  private readonly password = "testtests";

  constructor() {
    super(false); // Always disable network monitoring
  }

  async performLogin() {
    if (!this.page) throw new Error("Page not initialized");

    try {
      // Wait for login form elements
      const emailInput = await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });
      const passwordInput = await this.page.waitForSelector('input[type="password"]', { timeout: 5000 });
      const loginButton = await this.page.waitForSelector('button[type="submit"]', { timeout: 5000 });

      if (!emailInput || !passwordInput || !loginButton) {
        throw new Error("Login form elements not found");
      }

      // Fill in credentials
      await emailInput.fill(this.email);
      await passwordInput.fill(this.password);
      await loginButton.click();

      console.log("[Login] Credentials entered, attempting login...");

      // Wait for navigation to admin page
      await this.page.waitForURL("**/admin**", { timeout: 10000 });
      console.log("[Navigation] Successfully reached admin page");

      // Wait for dashboard to load
      await this.page.waitForLoadState("networkidle");
    } catch (error: unknown) {
      this.handleError("Login Error", error);
    }
  }
}

// Example usage:
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0];
  const loginTask = new LoginTask();

  (async () => {
    await loginTask.initialize(url);
    await loginTask.performLogin();
  })().catch((error) => {
    console.error("Login task failed:", error);
    process.exit(1);
  });
}
