# Chrome Debug Monitor

A powerful integration between Chrome's DevTools Protocol and Cursor Composer for real-time debugging and monitoring.

## Usage

### 1. Create Debug Setup File

Create a file named `chrome-debugging-setup.txt` with this content:

```
# Chrome Remote Debugging Instructions:
1. Start Chrome with remote debugging:
   Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--remote-debugging-port=9222','--user-data-dir=remote-profile'

2. Monitor console logs using Node.js:
   a. List available pages and get their IDs:
      node console-monitor.js

   b. Monitor a specific page (replace PAGE_ID with the ID from step a):
      node console-monitor.js PAGE_ID

   Example workflow:
   - List all pages: node console-monitor.js
   - Monitor specific page: node console-monitor.js EFB832E67F11C7266B1E519787E31F41
   - Stop monitoring: Press Ctrl+C

3. Navigate to specific URL:
   curl -X PUT "http://localhost:9222/json/new?url=http://localhost:8080"
   (modify the ports and urls if desired)
```

### 2. Install WebSocket Dependency

```bash
npm install ws

```

### 3. Create the .JS file

Create a file named `cursor-composer.js` with this content: [cursor-composer.js](cursor-composer.js)

### 4. Prompt the agent

Ask the cursor composer (agent mode) to run debugging per `chrome-debugging-setup.txt` and then you the composer has access to your chrome console logs and network requests.

## Output Examples

### Console Logs

```
[log] NODE_ENV: development
[warning] Logging in because its an existing user
```

### Network Requests

```
[Network Request] GET http://localhost:8080/api/customers
[Network Response] 200 OK - http://localhost:8080/api/customers
[Response Body] {
  "id": 1,
  "name": "John Doe",
  ...
}
```

## Configuration

The script monitors:

- Console logs (all levels)
- Network requests
- Response bodies (automatically parsed for JSON)
- Network errors
- Runtime messages

## Advanced Usage

### Monitor Multiple Pages

Run multiple instances of the monitor for different pages:

```bash
node console-monitor.js <page-id-1>
# In another terminal
node console-monitor.js <page-id-2>
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
