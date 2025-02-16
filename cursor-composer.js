const WebSocket = require("ws");
const https = require("https");
const http = require("http");

async function getAvailablePages() {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:9222/json/list", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const pages = JSON.parse(data);
            resolve(pages);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const pageId = process.argv[2];

  if (!pageId) {
    console.log("No page ID provided. Available pages:");
    const pages = await getAvailablePages();
    pages.forEach((page) => {
      console.log(`\nID: ${page.id}`);
      console.log(`Title: ${page.title}`);
      console.log(`Type: ${page.type}`);
      console.log(`URL: ${page.url}`);
      console.log("---");
    });
    console.log("\nUsage: node console-monitor.js <page-id>");
    process.exit(1);
  }

  const ws = new WebSocket(`ws://localhost:9222/devtools/page/${pageId}`);

  ws.on("open", function open() {
    console.log(`Connected to page ${pageId}`);

    // Enable console API
    ws.send(
      JSON.stringify({
        id: 1,
        method: "Console.enable",
      })
    );

    // Enable runtime
    ws.send(
      JSON.stringify({
        id: 2,
        method: "Runtime.enable",
      })
    );

    // Enable network monitoring
    ws.send(
      JSON.stringify({
        id: 3,
        method: "Network.enable",
      })
    );
  });

  ws.on("message", function incoming(data) {
    const message = JSON.parse(data);

    // Handle console messages
    if (message.method === "Console.messageAdded") {
      const logMessage = message.params.message;
      console.log(`[${logMessage.level}] ${logMessage.text}`);
    }

    // Handle console API calls
    if (message.method === "Runtime.consoleAPICalled") {
      const logMessage = message.params;
      console.log(`[${logMessage.type}] ${logMessage.args.map((arg) => arg.value).join(" ")}`);
    }

    // Handle network requests
    if (message.method === "Network.requestWillBeSent") {
      const request = message.params;
      console.log(`\n[Network Request] ${request.request.method} ${request.request.url}`);
      if (request.request.postData) {
        console.log(`[Request Data] ${request.request.postData}`);
      }
    }

    // Handle network responses
    if (message.method === "Network.responseReceived") {
      const response = message.params;
      console.log(
        `[Network Response] ${response.response.status} ${response.response.statusText} - ${response.response.url}`
      );

      // Get response body for JSON responses
      if (response.response.mimeType === "application/json") {
        ws.send(
          JSON.stringify({
            id: 4,
            method: "Network.getResponseBody",
            params: { requestId: response.requestId },
          })
        );
      }
    }

    // Handle response body
    if (message.id === 4 && message.result) {
      try {
        const body = JSON.parse(message.result.body);
        console.log("[Response Body]", JSON.stringify(body, null, 2));
      } catch (e) {
        console.log("[Response Body]", message.result.body);
      }
    }

    // Handle network errors
    if (message.method === "Network.loadingFailed") {
      const failure = message.params;
      console.log(`[Network Error] Failed to load ${failure.requestId}: ${failure.errorText}`);
    }
  });

  ws.on("error", function error(err) {
    console.error("WebSocket error:", err);
    process.exit(1);
  });

  console.log("Monitoring console logs and network activity... Press Ctrl+C to stop.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
