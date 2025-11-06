# Google Apps Script (GAS) Specification for CasesDash

**Version:** 3.0.0
**Last Updated:** 2025-11-06
**Purpose:** Document critical GAS requirements to prevent implementation errors

---

## 📋 Table of Contents

1. [Critical Rules](#critical-rules)
2. [File Naming and Structure](#file-naming-and-structure)
3. [HTML Service Include Pattern](#html-service-include-pattern)
4. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
5. [Best Practices](#best-practices)
6. [References](#references)

---

## 🚨 Critical Rules

### Rule 1: All Files MUST Be .html Extension

**❌ WRONG:**
```
src/frontend/js/api.js
src/frontend/css/main.css
```

**✅ CORRECT:**
```
src/frontend/js/api.js.html
src/frontend/css/main.css.html
```

**Reason:** Google Apps Script's `HtmlService.createHtmlOutputFromFile()` can ONLY read `.html` files. Files with `.js` or `.css` extensions are not accessible to the include system.

---

### Rule 2: CSS Must Be Wrapped in `<style>` Tags

**❌ WRONG (main.css.html):**
```css
/* CSS Variables */
:root {
  --primary-color: #1a73e8;
}

body {
  font-family: Arial, sans-serif;
}
```

**✅ CORRECT (main.css.html):**
```html
<style>
/* CSS Variables */
:root {
  --primary-color: #1a73e8;
}

body {
  font-family: Arial, sans-serif;
}
</style>
```

**Reason:** The `include()` function injects the ENTIRE file content into the parent HTML. Without `<style>` tags, the browser interprets CSS as plain text or HTML, causing it to be ignored or displayed as text.

---

### Rule 3: JavaScript Must Be Wrapped in `<script>` Tags

**❌ WRONG (api.js.html):**
```javascript
const API = {
  auth: {
    authenticate: async function() { ... }
  }
};
```

**✅ CORRECT (api.js.html):**
```html
<script>
const API = {
  auth: {
    authenticate: async function() { ... }
  }
};
</script>
```

**Reason:** Same as CSS. Without `<script>` tags, the browser treats JavaScript as HTML content, causing syntax errors like `Unexpected token ';'`.

---

### Rule 4: Parent HTML Must NOT Wrap Include Calls

**❌ WRONG (index.html):**
```html
<head>
  <style>
    <?!= include('frontend/css/main.css'); ?>
  </style>
</head>
<body>
  <script>
    <?!= include('frontend/js/api.js'); ?>
    <?!= include('frontend/js/auth.js'); ?>
  </script>
</body>
```

**✅ CORRECT (index.html):**
```html
<head>
  <?!= include('frontend/css/main.css'); ?>
</head>
<body>
  <?!= include('frontend/js/api.js'); ?>
  <?!= include('frontend/js/auth.js'); ?>
</body>
```

**Reason:** If the included file already has `<style>` or `<script>` tags, wrapping the include call creates NESTED tags (`<style><style>...</style></style>`), which breaks rendering and causes JavaScript errors.

---

## 📁 File Naming and Structure

### Recommended Structure

```
src/
├── backend/
│   ├── Code.gs                    # Entry point with include() function
│   ├── auth/
│   │   ├── Authentication.gs
│   │   └── SessionManager.gs
│   ├── models/
│   │   └── CaseModel.gs
│   ├── services/
│   │   └── CaseService.gs
│   └── utils/
│       └── Constants.gs
└── frontend/
    ├── index.html                 # Main HTML page
    ├── Stylesheet.html            # CSS (wrapped in <style>)
    └── JavaScript.html            # JS (wrapped in <script>)
```

### Alternative Structure (CasesDash v3.0.0)

```
src/
└── frontend/
    ├── index.html
    ├── css/
    │   └── main.css.html          # <style>...</style>
    └── js/
        ├── api.js.html            # <script>...</script>
        ├── auth.js.html           # <script>...</script>
        ├── settings.js.html       # <script>...</script>
        └── cases.js.html          # <script>...</script>
```

**Note:** The `.js.html` naming convention is non-standard but functional. Consider renaming to simpler names like `API.html`, `Auth.html` for clarity in future versions.

---

## 🔄 HTML Service Include Pattern

### The include() Function

**Backend (Code.gs):**
```javascript
/**
 * Server-side include function
 * Reads HTML file and returns its content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

### Usage in Templates

**Syntax:**
```html
<?!= include('path/to/filename'); ?>
```

**Important Notes:**
- Extension is omitted: `include('frontend/css/main.css')` looks for `main.css.html`
- Path is relative to project root (as defined in `.clasp.json` `rootDir`)
- Uses printing scriptlet `<?!=` (with exclamation mark)
- Standard scriptlet `<?=` HTML-escapes output (don't use for includes)

---

## ⚠️ Common Pitfalls and Solutions

### Pitfall 1: "showScreen is not defined"

**Symptom:** Navigation buttons don't work, console shows `ReferenceError: showScreen is not defined`

**Causes:**
1. JavaScript files missing `<script>` tags
2. Syntax error prevents JavaScript from loading
3. Parent HTML wrapping includes in `<script>` tags (nested tags)

**Solution:**
1. Add `<script>` tags to all `.js.html` files
2. Remove `<script>` wrapper from parent HTML
3. Check console for syntax errors

---

### Pitfall 2: "Unexpected token ';'" or "Unexpected token '<'"

**Symptom:** Syntax error in JavaScript

**Causes:**
1. JavaScript files missing `<script>` tags
2. Nested `<script>` tags from parent HTML
3. Using reserved words as property names (e.g., `API.case` → use `API.cases`)

**Solution:**
1. Wrap all JavaScript with `<script>` tags in included files
2. Remove `<script>` wrapper from parent HTML include calls
3. Avoid JavaScript reserved words: `case`, `class`, `const`, `let`, `var`, etc.

---

### Pitfall 3: CSS Not Applied / UI Broken

**Symptom:** Page shows unstyled HTML, Material Design styles missing

**Causes:**
1. CSS files missing `<style>` tags
2. Nested `<style>` tags from parent HTML
3. CSS included after `<body>` tag

**Solution:**
1. Wrap all CSS with `<style>` tags in included files
2. Remove `<style>` wrapper from parent HTML include calls
3. Include CSS in `<head>` section, not in `<body>`

---

### Pitfall 4: "Cannot read property 'success'" on Backend Call

**Symptom:** Backend function returns `null` instead of expected object

**Causes:**
1. Backend function throws an error (check Apps Script logs)
2. Backend function doesn't return a value
3. Authentication failure prevents function execution

**Solution:**
1. Check Google Apps Script execution logs (View → Executions)
2. Ensure backend functions have explicit `return` statements
3. Add try-catch error handling in backend functions
4. Verify authentication is successful before calling backend

---

## ✅ Best Practices

### 1. Always Include Error Handling

**Backend (Code.gs):**
```javascript
function frontendCreateCase(caseData, sheetName) {
  try {
    const authCheck = requireAuth();
    if (!authCheck.success) return authCheck;

    const result = createCase(caseData, sheetName, authCheck.data.email);
    return result;
  } catch (error) {
    Logger.log(`frontendCreateCase error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 2. Log Execution for Debugging

**Backend:**
```javascript
function include(filename) {
  try {
    const content = HtmlService.createHtmlOutputFromFile(filename).getContent();
    Logger.log(`Included: ${filename} (${content.length} bytes)`);
    return content;
  } catch (error) {
    Logger.log(`Include error for ${filename}: ${error.message}`);
    return `<!-- Error loading ${filename}: ${error.message} -->`;
  }
}
```

### 3. Use Consistent File Naming

**Option A (Simple):**
```
Stylesheet.html
API.html
Auth.html
Settings.html
```

**Option B (Descriptive):**
```
main.css.html
api.js.html
auth.js.html
settings.js.html
```

Choose one convention and stick to it across the project.

### 4. Validate Included Files Locally

Before deploying, verify all included files:
1. Have `.html` extension
2. Contain appropriate wrapper tags (`<style>` or `<script>`)
3. Have valid syntax (no syntax errors)

**Validation Script:**
```bash
# Check all .html files in js/ directory have <script> tags
for file in src/frontend/js/*.html; do
  if ! grep -q "<script>" "$file"; then
    echo "Missing <script> tag: $file"
  fi
done

# Check CSS file has <style> tag
if ! grep -q "<style>" src/frontend/css/main.css.html; then
  echo "Missing <style> tag in main.css.html"
fi
```

### 5. Test in Incognito/Private Mode

Browser caching can hide deployment issues. Always test major changes in:
- Incognito/Private browsing mode
- After hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Different browser if issues persist

---

## 📚 References

### Official Documentation

- [HTML Service: Create and Serve HTML](https://developers.google.com/apps-script/guides/html) (Updated: 2025-10-13)
- [HTML Service: Best Practices](https://developers.google.com/apps-script/guides/html/best-practices)
- [HTML Service: Templated HTML](https://developers.google.com/apps-script/guides/html/templates)

### Stack Overflow Common Questions

- [How to connect CSS to HTML in Google Apps Scripts](https://stackoverflow.com/questions/39309496/)
- [Use project Javascript and CSS files in a Google Apps Script web app?](https://stackoverflow.com/questions/11344167/)
- [CSS In HTML Services Template](https://stackoverflow.com/questions/16211054/)

### Key Takeaways from Documentation

> "The included files contain `<style>` and `<script>` tags because they're HTML snippets and not pure .css or .js files."
> — [Stack Overflow Answer](https://stackoverflow.com/questions/11344167/), 2024

> "You can't have simple js or css files in the project so what you do instead is create html files that contain it, and preferably you place the `<script>` or `<style>` tags inside those files."
> — [Stack Overflow Answer](https://stackoverflow.com/questions/62558371/), 2024

---

## 🔄 Version History

| Date       | Version | Changes |
|------------|---------|---------|
| 2025-11-06 | 1.0.0   | Initial documentation created after fixing nested tag errors |

---

## 📞 Support

If you encounter GAS-related issues not covered in this document:

1. Check Google Apps Script execution logs (View → Executions)
2. Review browser console for client-side errors
3. Search [Stack Overflow with tag [google-apps-script]](https://stackoverflow.com/questions/tagged/google-apps-script)
4. Consult official Google Apps Script documentation

---

**Document Maintained By:** CasesDash Development Team
**Last Reviewed:** 2025-11-06
