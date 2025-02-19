# Chrome Debug Monitor

A powerful integration between Chrome's DevTools Protocol and Cursor Composer for real-time debugging and monitoring.

## Usage

### 1. Create Debug Setup File

Create a file named `chrome-debugging-setup.txt` with this content:

```
# Chrome Debugging Instructions:
1. Install dependencies:
   npm install playwright typescript ts-node

2. Run the TypeScript monitor:
   ts-node BaseMonitor.ts [URL] [options]

   Available options:
   --network, -n        : Monitor network requests
   --no-clear, --nc    : Don't clear console on page reload
   --exit-on-error     : Exit on encountering errors (good for iterative debugging)
   --break-network, --bn: Treat network errors as breaking errors

   Example:
   ts-node BaseMonitor.ts http://localhost:8080 --network

Note: Playwright will automatically handle Chrome instance creation and setup.
```

### 2. Install Dependencies

```bash
npm install playwright typescript ts-node  # Includes Playwright with types
npm install --save-dev @types/node       # Required for Node.js types
```

### 3. Configure TypeScript

Create a `tsconfig.json` file in your project root. You can find the complete configuration here: [@tsconfig.json](tsconfig.json)

The configuration provides:

- Modern JavaScript target (ES2020)
- CommonJS module system
- DOM and ES2020 type definitions
- Strict type checking
- Module resolution for Node.js
- Output directory configuration

### 4. Create BaseMonitor.ts

Create a file named `BaseMonitor.ts` with the TypeScript implementation. You can find the complete implementation here: [@BaseMonitor.ts](BaseMonitor.ts)

The monitor provides:

- Full TypeScript support
- Playwright-based monitoring
- Comprehensive error handling
- Network request monitoring
- Console logging
- Worker monitoring
- Dialog handling
- Configurable error behaviors

### 5. Prompt the agent

Ask the cursor composer (agent mode) to run debugging per `chrome-debugging-setup.txt` and then the composer has access to your chrome console logs and network requests.

Important: If you are monitor your own usage: You must make sure the agent runs the command NOT in the composer chat as an embedded terminal - but as a terminal as a editor, so the application doesn't shut down automatically and you can keep in the context across composers.

You can also use it for iterative automatic debugging, in this case, make sure the agent runs it embedded in the composer, so when the monitor closes down, it can read the console error, make code changes, and try again.
Do try this workflow, make sure that --exit-on-error is true and that you use playwright to navigate your site. You can see [@Logintask.ts](LoginTask.ts) for an example

## Example screenshots

![step2](https://github.com/user-attachments/assets/ddeab00b-dc42-40b2-8d0b-de4fb536860d)

![step3](https://github.com/user-attachments/assets/0d691b12-977e-42ea-806a-4d1089b08125)

## Output Examples

### Console Logs

```
[log] NODE_ENV: development
[warning] Logging in because its an existing user
[Request] GET http://localhost:8080/api/customers
[Response] 200 http://localhost:8080/api/customers
[Worker Started] http://localhost:8080/worker.js
[Dialog] alert: Please confirm your action
```

### Network Requests

```
[Request] GET http://localhost:8080/api/customers
[Response] 200 OK - http://localhost:8080/api/customers
[Response Body] {
  "id": 1,
  "name": "John Doe",
  ...
}
```

## Configuration

The TypeScript monitor (`BaseMonitor.ts`) provides comprehensive monitoring of:

- Console logs (all levels)
- Network requests and responses
- Page errors and runtime exceptions
- Web Workers
- Dialog boxes (alerts, confirms, prompts)
- Custom error handling behaviors

## Advanced Usage

### Monitor Multiple Pages

You can monitor multiple pages by running multiple instances with different URLs:

```bash
ts-node BaseMonitor.ts http://localhost:8080 --network
# In another terminal
ts-node BaseMonitor.ts http://localhost:3000 --network
```

### Cleanup

To close all Chrome instances:

```powershell
taskkill /IM chrome.exe /F
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Chrome DevTools Protocol
- WebSocket implementation by Node.js
- Chrome Remote Debugging Interface

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Security

Note: This tool is intended for development and debugging purposes only. Do not use remote debugging in production environments.

## Roadmap

- [ ] Add filtering options for network requests
- [ ] Add support for WebSocket traffic monitoring
- [ ] Add export functionality for logs
- [ ] Add custom formatting options
- [ ] Add support for HTTPS debugging
