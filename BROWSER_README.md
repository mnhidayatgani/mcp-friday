# Browser DevTools Integration

Complete browser automation and DevTools access for FRIDAY MCP Server, powered by Playwright.

## 🚀 Features

### Core Browser Automation (Phase 1)

- **Navigation** - Navigate to URLs, use history (back/forward/reload)
- **Screenshots** - Capture full page or viewport screenshots
- **JavaScript Execution** - Execute scripts and extract data
- **Tab Management** - Create, switch, and close tabs
- **Console Access** - View and manage browser console messages
- **Interactions** - Click, type, and press keys

### DevTools Integration (Phase 2)

- **Performance Tracing** - Start/stop tracing with Core Web Vitals
- **Network Control** - Throttling, blocking, and monitoring

### Advanced Features (Phase 3)

- **PDF Generation** - Convert pages to PDF
- **Device Emulation** - Emulate devices, geolocation, timezone
- **Storage Management** - Cookies, localStorage, sessionStorage

## 📚 All 13 Tools Available

### 1. `browser-navigate`

Navigate to URL or use browser history.

```json
{
  "name": "browser-navigate",
  "arguments": {
    "url": "https://example.com"
  }
}
```

```json
{
  "name": "browser-navigate",
  "arguments": {
    "action": "back"
  }
}
```

**Parameters:**

- `url` (string, optional) - URL to navigate to
- `action` (string, optional) - "back" | "forward" | "reload"
- `timeout` (number, optional) - Navigation timeout in ms
- `waitUntil` (string, optional) - "load" | "domcontentloaded" | "networkidle"

---

### 2. `browser-screenshot`

Capture screenshots of the current page.

```json
{
  "name": "browser-screenshot",
  "arguments": {
    "format": "png",
    "fullPage": true
  }
}
```

```json
{
  "name": "browser-screenshot",
  "arguments": {
    "format": "jpeg",
    "quality": 85,
    "filePath": "/path/to/screenshot.jpg"
  }
}
```

**Parameters:**

- `format` (string, optional) - "png" | "jpeg" | "webp" (default: "png")
- `quality` (number, optional) - 0-100 for jpeg/webp (default: 90)
- `fullPage` (boolean, optional) - Capture full scrollable page (default: false)
- `filePath` (string, optional) - Save to file instead of returning inline

---

### 3. `browser-evaluate`

Execute JavaScript in the browser context.

```json
{
  "name": "browser-evaluate",
  "arguments": {
    "function": "() => document.title"
  }
}
```

```json
{
  "name": "browser-evaluate",
  "arguments": {
    "function": "() => Array.from(document.querySelectorAll('a')).map(a => a.href)"
  }
}
```

**Parameters:**

- `function` (string, required) - JavaScript function as string
- `args` (array, optional) - Arguments to pass to function

---

### 4. `browser-tabs`

Manage browser tabs.

```json
{
  "name": "browser-tabs",
  "arguments": {
    "action": "list"
  }
}
```

```json
{
  "name": "browser-tabs",
  "arguments": {
    "action": "create"
  }
}
```

```json
{
  "name": "browser-tabs",
  "arguments": {
    "action": "select",
    "index": 1
  }
}
```

**Parameters:**

- `action` (string, required) - "list" | "create" | "select" | "close"
- `index` (number, optional) - Tab index for select/close actions

---

### 5. `browser-console`

Access browser console messages.

```json
{
  "name": "browser-console",
  "arguments": {
    "action": "list"
  }
}
```

```json
{
  "name": "browser-console",
  "arguments": {
    "action": "list",
    "onlyErrors": true
  }
}
```

**Parameters:**

- `action` (string, required) - "list" | "clear"
- `onlyErrors` (boolean, optional) - Filter to show only errors (default: false)

---

### 6. `browser-click`

Click elements on the page.

```json
{
  "name": "browser-click",
  "arguments": {
    "selector": "button.submit"
  }
}
```

```json
{
  "name": "browser-click",
  "arguments": {
    "selector": "#menu",
    "button": "right",
    "clickCount": 2
  }
}
```

**Parameters:**

- `selector` (string, required) - CSS selector for element
- `button` (string, optional) - "left" | "right" | "middle" (default: "left")
- `clickCount` (number, optional) - Number of clicks (default: 1)

---

### 7. `browser-type`

Type text into input fields.

```json
{
  "name": "browser-type",
  "arguments": {
    "selector": "input[name='username']",
    "text": "john@example.com"
  }
}
```

**Parameters:**

- `selector` (string, required) - CSS selector for input element
- `text` (string, required) - Text to type
- `delay` (number, optional) - Delay between keystrokes in ms (default: 0)

---

### 8. `browser-press`

Press keyboard keys.

```json
{
  "name": "browser-press",
  "arguments": {
    "key": "Enter"
  }
}
```

```json
{
  "name": "browser-press",
  "arguments": {
    "key": "Control+A"
  }
}
```

**Parameters:**

- `key` (string, required) - Key or key combination to press

---

## ⚙️ Configuration

Browser settings can be configured via environment variables:

```bash
# Browser type
export FRIDAY_BROWSER_TYPE="chromium"  # chromium | firefox | webkit

# Headless mode
export FRIDAY_BROWSER_HEADLESS="false"

# DevTools
export FRIDAY_BROWSER_DEVTOOLS="true"

# Viewport size
export FRIDAY_VIEWPORT_WIDTH="1920"
export FRIDAY_VIEWPORT_HEIGHT="1080"

# Timeouts (milliseconds)
export FRIDAY_NAV_TIMEOUT="30000"
export FRIDAY_ACTION_TIMEOUT="10000"
```

### Default Configuration

```typescript
{
  browser: {
    type: "chromium",
    headless: false,
    devtools: true,
    slowMo: 0,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled"
    ]
  },
  viewport: {
    width: 1920,
    height: 1080
  },
  timeout: {
    navigation: 30000,
    action: 10000
  },
  tracing: {
    enabled: false,
    screenshots: true,
    snapshots: true
  }
}
```

---

## 📖 Usage Examples

### Example 1: Navigate and Extract Data

```json
// Navigate to page
{
  "name": "browser-navigate",
  "arguments": {
    "url": "https://example.com"
  }
}

// Extract all links
{
  "name": "browser-evaluate",
  "arguments": {
    "function": "() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.textContent, href: a.href }))"
  }
}
```

### Example 2: Fill Form and Submit

```json
// Type into email field
{
  "name": "browser-type",
  "arguments": {
    "selector": "input[type='email']",
    "text": "user@example.com"
  }
}

// Type into password field
{
  "name": "browser-type",
  "arguments": {
    "selector": "input[type='password']",
    "text": "securePassword123"
  }
}

// Click submit button
{
  "name": "browser-click",
  "arguments": {
    "selector": "button[type='submit']"
  }
}
```

### Example 3: Multi-Tab Workflow

```json
// List current tabs
{
  "name": "browser-tabs",
  "arguments": {
    "action": "list"
  }
}

// Create new tab
{
  "name": "browser-tabs",
  "arguments": {
    "action": "create"
  }
}

// Navigate in new tab
{
  "name": "browser-navigate",
  "arguments": {
    "url": "https://github.com"
  }
}

// Switch back to first tab
{
  "name": "browser-tabs",
  "arguments": {
    "action": "select",
    "index": 0
  }
}
```

### Example 4: Screenshot and Console

```json
// Capture full page screenshot
{
  "name": "browser-screenshot",
  "arguments": {
    "format": "png",
    "fullPage": true,
    "filePath": "./screenshots/page.png"
  }
}

// Check console for errors
{
  "name": "browser-console",
  "arguments": {
    "action": "list",
    "onlyErrors": true
  }
}
```

---

## 🧪 Testing

Browser components include comprehensive test coverage:

```bash
# Run browser tests
npm test tests/browser

# Run all tests
npm test
```

**Test Coverage:**

- Browser Manager: 12 tests
- Browser Configuration: 19 tests
- Navigation, Screenshots, Evaluate, Tabs, Console, Interactions

---

## 🔒 Security Considerations

1. **URL Validation** - Always validate navigation targets
2. **Script Sanitization** - Be careful with `browser-evaluate`
3. **File Paths** - Screenshots save to specified paths only
4. **Credentials** - Never log sensitive console messages
5. **Sandboxing** - Browser runs with security flags

---

## 🚧 Limitations

1. **Single Instance** - One browser instance per server
2. **No CDP Direct Access** - CDP features coming in Phase 2
3. **No Network Control** - Network throttling/blocking in Phase 2
4. **No Performance Tracing** - Performance tools in Phase 2

---

## 📅 Roadmap

### Phase 2: DevTools Integration (Next)

- CDP session access
- Network monitoring
- Performance tracing
- Accessibility tree

### Phase 3: Advanced Features

- PDF generation
- Device emulation
- Storage management
- Session persistence

---

## 🤝 Contributing

Browser tools follow FRIDAY's architecture:

- TypeScript strict mode
- Comprehensive tests
- Clear error messages
- Proper cleanup

---

## 📝 License

Part of FRIDAY MCP Server - MIT License

---

**Status:** ✅ Phase 1 Complete  
**Tests:** 31 browser tests passing  
**Tools:** 8 browser automation tools

---

### 9. `browser-performance`
Performance tracing and Core Web Vitals.

\`\`\`json
{
  "name": "browser-performance",
  "arguments": {
    "action": "start"
  }
}
\`\`\`

**Parameters:**
- \`action\` (string, required) - "start" | "stop" | "metrics"

---

### 10. `browser-network`
Network throttling and control.

\`\`\`json
{
  "name": "browser-network",
  "arguments": {
    "action": "throttle",
    "throttleType": "Slow 3G"
  }
}
\`\`\`

**Parameters:**
- \`action\` (string, required) - "throttle" | "block" | "monitor"
- \`throttleType\` (string, optional) - Network speed profile
- \`blockedUrls\` (array, optional) - URLs to block

---

### 11. `browser-pdf`
Generate PDF from current page.

\`\`\`json
{
  "name": "browser-pdf",
  "arguments": {
    "format": "A4"
  }
}
\`\`\`

**Parameters:**
- \`filePath\` (string, optional) - Output file path
- \`format\` (string, optional) - "A4" | "Letter" | "Legal"
- \`landscape\` (boolean, optional) - Landscape mode

---

### 12. `browser-emulate`
Device emulation and settings.

\`\`\`json
{
  "name": "browser-emulate",
  "arguments": {
    "action": "device",
    "device": "iPhone 13"
  }
}
\`\`\`

**Parameters:**
- \`action\` (string, required) - "device" | "geolocation" | "timezone" | "viewport"
- \`device\` (string, optional) - Device name
- \`latitude/longitude\` (number, optional) - Geolocation

---

### 13. `browser-storage`
Manage cookies and storage.

\`\`\`json
{
  "name": "browser-storage",
  "arguments": {
    "action": "get-cookies"
  }
}
\`\`\`

**Parameters:**
- \`action\` (string, required) - "get-cookies" | "set-cookie" | "clear-cookies" | "local-storage" | "session-storage"
- \`key\` (string, optional) - Storage key
- \`value\` (string, optional) - Storage value

