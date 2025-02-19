import { chromium, Page, Browser, ConsoleMessage, Request, Response, Worker, Dialog, BrowserContext } from "playwright";

export class BaseMonitor {
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected page: Page | null = null;
  protected monitorNetwork: boolean = false;
  protected clearConsoleOnReload: boolean = true;
  protected exitOnError: boolean = false;
  protected treatNetworkErrorsAsBreaking: boolean = false;

  constructor(
    monitorNetwork: boolean = false,
    clearConsoleOnReload: boolean = true,
    exitOnError: boolean = false,
    treatNetworkErrorsAsBreaking: boolean = false
  ) {
    this.monitorNetwork = monitorNetwork;
    this.clearConsoleOnReload = clearConsoleOnReload;
    this.exitOnError = exitOnError;
    this.treatNetworkErrorsAsBreaking = treatNetworkErrorsAsBreaking;
  }

  async initialize(url: string = "http://localhost:8080") {
    try {
      this.browser = await chromium.launch({
        headless: false,
        args: ["--remote-debugging-port=9222"],
      });

      this.context = await this.browser.newContext({
        ignoreHTTPSErrors: true,
      });

      this.page = await this.context.newPage();
      this.setupMonitoring();
      await this.page.goto(url);
      console.log(`Successfully connected to application at ${url}`);
      await this.page.waitForLoadState("networkidle");

      // Keep the browser open
      await new Promise(() => {});
    } catch (error: unknown) {
      this.handleError("Initialization Error", error);
    }
  }

  protected setupMonitoring() {
    if (!this.page) return;

    // Monitor console logs
    this.page.on("console", (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();

      if (type === "error") {
        // Handle network-related errors differently based on configuration
        if (text.includes("404") || text.includes("Failed to load resource")) {
          if (this.treatNetworkErrorsAsBreaking) {
            this.handleError("Network Error", new Error(text));
          } else {
            console.log(`[${type}] ${text}`);
          }
        } else {
          this.handleError("Console Error", new Error(text));
        }
      } else {
        console.log(`[${type}] ${text}`);
      }
    });

    // Monitor page errors
    this.page.on("pageerror", (error: Error) => {
      this.handleError("Page Error", error);
    });

    if (this.monitorNetwork) {
      // Monitor requests
      this.page.on("request", (request: Request) => {
        console.log(`[Request] ${request.method()} ${request.url()}`);
        const postData = request.postData();
        if (postData) {
          console.log(`[Request Data] ${postData}`);
        }
      });

      // Monitor responses
      this.page.on("response", async (response: Response) => {
        const status = response.status();
        const url = response.url();
        console.log(`[Response] ${status} ${url}`);

        if (status >= 400) {
          try {
            const text = await response.text();
            if (this.treatNetworkErrorsAsBreaking) {
              this.handleError("Network Response Error", new Error(`${url}: ${text}`));
            } else {
              console.log(`[Response Error] ${url}: ${text}`);
            }
          } catch (e) {
            console.log(`[Response Error] Could not get response text: ${e}`);
          }
        }
      });
    }

    // Clear console on navigation if enabled
    this.page.on("load", () => {
      if (this.clearConsoleOnReload) {
        console.clear();
      }
      console.log("\n[Navigation] Page loaded/refreshed\n");
    });

    // Monitor workers
    this.page.on("worker", (worker: Worker) => {
      console.log(`[Worker Started] ${worker.url()}`);
      worker.evaluate(() => {
        self.addEventListener("console", (event: any) => {
          console.log(`[Worker Console] ${event.data}`);
        });
      });
    });

    // Monitor dialogs
    this.page.on("dialog", async (dialog: Dialog) => {
      console.log(`[Dialog] ${dialog.type()}: ${dialog.message()}`);
      await dialog.dismiss();
    });
  }

  protected handleError(type: string, error: unknown) {
    console.error(`\n[BREAKING] ${type}:`);
    console.error("Error Message:", error instanceof Error ? error.message : String(error));
    console.error("Stack Trace:", error instanceof Error ? error.stack : "No stack trace available");

    // Only exit if exitOnError is true
    if (this.exitOnError) {
      process.exit(1);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Add main execution block
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0];

  // Parse command line flags
  const monitorNetwork = args.includes("--network") || args.includes("-n");
  const noClear = args.includes("--no-clear") || args.includes("--nc");

  // Especially useful for recursive debugging in an embedded terminal in the composer
  // Because when the composer stumbles upon an error, they will stop the proccess immediately, read the error, make changes, and try again iteratively
  const exitOnError = args.includes("--exit-on-error") || args.includes("--exit");

  // When enabled, network errors (404s, failed resources, etc.) will trigger the error handler
  const breakOnNetwork = args.includes("--break-network") || args.includes("--bn");

  const monitor = new BaseMonitor(monitorNetwork, !noClear, exitOnError, breakOnNetwork);

  (async () => {
    try {
      await monitor.initialize(url);
    } catch (error) {
      console.error("Monitor failed to start:", error);
      if (exitOnError) {
        process.exit(1);
      }
    }
  })();
}
