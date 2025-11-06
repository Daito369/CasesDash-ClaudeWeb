# CasesDash v3.0.0 - Multi-Sheet Case Management System

**IRT Support - 2025 Q4 Edition**

A Google Apps Script-based web application for managing support cases across 6 spreadsheet types with real-time IRT (Internal Resolution Time) tracking.

---

## 🎯 Overview

CasesDash is an enterprise-grade case management system designed for Google's Ads Support teams, managing cases across:
- **6 Case Types**: OT Email, 3PO Email, OT Chat, 3PO Chat, OT Phone, 3PO Phone
- **IRT Metric**: 72-hour SLA tracking with Solution Offered (SO) period exclusion
- **Unlimited ReOpens**: JSON-based history for unlimited case reopening
- **Gmail Notifications**: Automated alerts when IRT falls below 2 hours
- **Advanced Analytics**: 2025 cutting-edge charts (ApexCharts, ECharts, Google Charts)

### Key Features

- ✅ **Real-time IRT Timer**: Client-side countdown with 1-second precision
- ✅ **Multi-Sheet Support**: Unified interface for 6 different case types
- ✅ **ReOpen Workflow**: Track unlimited reopening history with JSON format
- ✅ **Dashboard**: Search, filter, status tabs, case cards with color-coding
- ✅ **My Cases**: Personal case view with quick access to assigned cases
- ✅ **Analytics**: Team and individual performance analysis with reward targets
- ✅ **Google OAuth**: Secure authentication with @google.com domain restriction
- ✅ **Material Design**: Modern UI following Google's design guidelines

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [casesdash-specification.md](./docs/casesdash-specification.md) | Complete system specification (v3.0.0) |
| [CLAUDE.md](./docs/CLAUDE.md) | Developer guide for Claude/AI agents |
| [AGENTS.md](./docs/AGENTS.md) | Automation & testing guide |
| [IRT.md](./docs/IRT.md) | IRT metric definition (2025 Q4) |
| [SHEET_MAPPING.md](./docs/SHEET_MAPPING.md) | Actual spreadsheet structure |

---

## 🚀 Quick Start

### Prerequisites

- Google Account (@google.com domain)
- Node.js 14+ (for clasp deployment)
- Access to Google Spreadsheet with 6 case sheets

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Daito369/CasesDash-ClaudeWeb.git
   cd CasesDash-ClaudeWeb
   ```

2. **Install clasp (Google Apps Script CLI)**
   ```bash
   npm install -g @google/clasp
   ```

3. **Login to Google Account**
   ```bash
   clasp login
   ```

4. **Create new GAS project**
   ```bash
   clasp create --type webapp --title "CasesDash v3.0.0"
   ```

5. **Push code to Google Apps Script**
   ```bash
   clasp push
   ```

6. **Deploy as web app**
   ```bash
   clasp deploy --description "v3.0.0 Initial Deployment"
   ```

7. **Open in GAS editor**
   ```bash
   clasp open
   ```

8. **Configure in GAS editor**
   - Go to "Publish" → "Deploy as web app"
   - Execute as: "Me"
   - Who has access: "Anyone within [your-organization]"
   - Click "Deploy"
   - Copy the web app URL

9. **Set up Spreadsheet**
   - Open your Google Spreadsheet with 6 case sheets
   - Copy the Spreadsheet ID from URL
   - Open CasesDash web app
   - Go to Settings → Enter Spreadsheet ID → Test Connection

---

## 🏗️ Project Structure

```
/
├── docs/                           # Documentation
│   ├── casesdash-specification.md  # Master specification (v3.0.0)
│   ├── CLAUDE.md                   # Developer guide
│   ├── AGENTS.md                   # Automation guide
│   ├── IRT.md                      # IRT metric definition
│   └── SHEET_MAPPING.md            # Spreadsheet structure
│
├── src/
│   ├── backend/                    # Google Apps Script (.gs)
│   │   ├── Code.gs                 # Main entry point
│   │   ├── auth/                   # Authentication
│   │   ├── services/               # Business logic
│   │   ├── models/                 # Data models
│   │   └── utils/                  # Utilities
│   │
│   └── frontend/                   # HTML/CSS/JS
│       ├── index.html              # Main UI
│       ├── css/                    # Stylesheets
│       └── js/                     # JavaScript modules
│
├── tests/
│   ├── integration/                # Integration tests
│   └── manual/                     # Manual test checklists
│
├── .clasp.json                     # clasp configuration
├── appsscript.json                 # GAS manifest
└── README.md                       # This file
```

---

## 💻 Development

### Tech Stack

**Frontend**:
- HTML5, CSS3, JavaScript (ES6+)
- Material Design Components for Web
- ApexCharts / ECharts / Google Charts
- Flatpickr (date picker)
- Select2 (large dropdowns)

**Backend**:
- Google Apps Script (JavaScript)
- SpreadsheetApp API
- GmailApp API (notifications)
- PropertiesService (configuration)

**Data Storage**:
- Google Spreadsheets (primary data)
- PropertiesService (settings, session)

### Development Workflow

1. **Read the specification** (docs/casesdash-specification.md)
2. **Implement Backend** (src/backend/*.gs)
3. **Implement Frontend** (src/frontend/*.js, *.html)
4. **Test Integration** (Frontend ↔ Backend ↔ Spreadsheet)
5. **Commit with integration test results**
6. **Push to GAS** (`clasp push`)

See [CLAUDE.md](./docs/CLAUDE.md) for detailed development guidelines.

### Local Development

1. **Edit files locally**
   ```bash
   # Edit src/backend/*.gs or src/frontend/*
   ```

2. **Push to GAS**
   ```bash
   clasp push
   ```

3. **Test in browser**
   - Open the web app URL
   - Test the changes

4. **Pull changes from GAS (if edited in GAS editor)**
   ```bash
   clasp pull
   ```

---

## 🧪 Testing

### Manual Testing

1. **Authentication**
   - Login with @google.com account → Success
   - Login with non-@google.com → Rejection

2. **Spreadsheet Connection**
   - Valid Spreadsheet ID → Connection success
   - Invalid ID → Error message

3. **Case Creation**
   - Fill all required fields → Case created
   - Submit with missing fields → Validation error

4. **Dashboard**
   - Search by Case ID → Correct case displayed
   - Filter by status → Filtered results
   - ReOpen SO/Finished case → Status changes to Assigned

5. **Analytics**
   - View team statistics → Charts displayed
   - Change date range → Data updates

See [tests/manual/](./tests/manual/) for detailed test checklists.

### Integration Testing

See [AGENTS.md](./docs/AGENTS.md) for automated integration testing strategies.

---

## 📊 Key Concepts

### IRT (Internal Resolution Time)

**Formula**: `IRT = TRT - Total SO Period`

Where:
- **TRT**: Total Resolution Time (Case Open → Final Close)
- **SO Period**: Time spent in "Solution Offered" status (timer paused)
- **IRT**: Actual internal working time (what we're measured on)

**SLA Target**: 72 hours for all segments (2025 Q4)

**Example**:
```
Case opened: 2025-11-01 09:00
First SO: 2025-11-02 15:00  (TRT: 30h, IRT: 30h)
ReOpened: 2025-11-04 10:00  (SO Period: 43h)
Final Close: 2025-11-05 11:00 (TRT: 74h)

Total SO Period: 43h
IRT = 74h - 43h = 31h ✅ Within 72h SLA
```

### ReOpen Workflow

1. Case reaches "Solution Offered" or "Finished" status
2. ReOpen button appears in Dashboard
3. User clicks ReOpen → Modal appears
4. User confirms → System updates:
   - Case Status → "Assigned"
   - ReOpen History JSON (unlimited entries)
   - Status History JSON
   - IRT timer restarts

### Column Mappings

Always use `Constants.gs` for column access:

```javascript
// CORRECT ✅
const colMap = getColumnMappings()['OT Email'];
const caseId = sheet.getRange(`${colMap.caseId}${row}`).getValue();

// WRONG ❌
const caseId = sheet.getRange(`C${row}`).getValue();
```

See [docs/casesdash-specification.md Section 3](./docs/casesdash-specification.md#3-正確な列マッピングシステム) for complete mappings.

---

## 🔐 Security

- **Authentication**: Google OAuth 2.0
- **Domain Restriction**: @google.com only
- **Session Management**: Secure session storage with PropertiesService
- **Input Validation**: All user inputs validated on Backend
- **XSS Protection**: HTML escaping for all user-generated content
- **Test Accounts**: Configured via Configuration sheet (development only)

See [docs/casesdash-specification.md Section 11](./docs/casesdash-specification.md#11-セキュリティとコンプライアンス) for security details.

---

## 📈 Current Status

**Version**: 3.0.0
**Phase**: Phase 1 - Foundation (In Progress)
**Branch**: `claude/phase1-foundation-implementation-011CUr7FEU6rWiswmbqKYvHa`

### Completed
- [x] Project structure
- [x] Documentation (CLAUDE.md, AGENTS.md)
- [ ] Authentication system (Backend + Frontend)
- [ ] Spreadsheet connection
- [ ] Basic case creation
- [ ] Dashboard UI

### Roadmap

**Phase 1: Foundation (3 weeks)**
- User authentication system
- Spreadsheet connection
- Basic case creation
- Dark mode / Light mode toggle

**Phase 2: Core Features (3 weeks)**
- IRT exclusion case management
- Gmail notification system
- Live Mode functionality
- Analytics enhancement

**Phase 3: Analytics & UI (2 weeks)**
- Sentiment Score in Reports
- Period selection
- Advanced filtering
- Export functionality

See [docs/casesdash-specification.md Section 13](./docs/casesdash-specification.md#13-今後の開発ロードマップ) for complete roadmap.

---

## 🤝 Contributing

### For Human Developers

1. Read [CLAUDE.md](./docs/CLAUDE.md) for development guidelines
2. Read relevant section in specification before implementing
3. Follow coding standards and naming conventions
4. Test integration after each feature
5. Commit with detailed integration test results

### For AI Agents / Claude Code

1. Read [CLAUDE.md](./docs/CLAUDE.md) for project context
2. Read [AGENTS.md](./docs/AGENTS.md) for automation workflows
3. Follow integration-first development cycle
4. Use pre-commit checklist before committing
5. Document any new patterns or pitfalls discovered

---

## 📄 License

Internal Google project - Not for public distribution

---

## 🆘 Support

For questions or issues:
1. Check [docs/casesdash-specification.md](./docs/casesdash-specification.md)
2. Check [docs/CLAUDE.md](./docs/CLAUDE.md) for implementation patterns
3. Contact: [Your Team's Support Channel]

---

## 📝 Changelog

### v3.0.0 (2025-11-06)
- ✨ NEW: IRT (Internal Resolution Time) support
- ✨ NEW: Unlimited ReOpen tracking with JSON format
- ✨ NEW: Gmail notification system (replaces Google Chat)
- ✨ NEW: Configuration sheet for quarterly management
- ✨ NEW: Select2 for large dropdown fields
- 🔧 FIX: Column mappings (added irtTimer at column O)
- 🔧 FIX: IRT calculation reads from IRT RAW data sheet
- 🔧 FIX: Security policy compliance (@google.com domain only)
- 📚 DOC: Complete specification rewrite (v3.0.0)
- 📚 DOC: Added CLAUDE.md and AGENTS.md

### v2.0.0 (Legacy)
- Basic case management
- TRT/P95 metrics
- Dashboard and Analytics

---

**Built with ❤️ for Google Ads Support Teams**
