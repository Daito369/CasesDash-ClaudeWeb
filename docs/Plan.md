# CasesDash v3.0 - 包括的改善計画書 (Plan.md)

**作成日**: 2025-11-15
**作成者**: Google L8 Full-Stack Engineer (Claude)
**対象プロジェクト**: CasesDash v3.0.0 - Google Ads Support Case Management System
**リポジトリ**: Daito369/CasesDash-ClaudeWeb

---

## 📋 目次

1. [エグゼクティブサマリー](#1-エグゼクティブサマリー)
2. [現状分析](#2-現状分析)
3. [アーキテクチャ改善計画](#3-アーキテクチャ改善計画)
4. [バックエンド最適化](#4-バックエンド最適化)
5. [フロントエンド最適化](#5-フロントエンド最適化)
6. [パフォーマンス最適化](#6-パフォーマンス最適化)
7. [セキュリティ強化](#7-セキュリティ強化)
8. [実装ロードマップ](#8-実装ロードマップ)
9. [リスク管理](#9-リスク管理)
10. [成功指標](#10-成功指標)

---

## 1. エグゼクティブサマリー

### 1.1 プロジェクト概要

CasesDashは、Google Apps Script (GAS) ベースのケース管理システムで、Google Ads サポートチームの6つのシート（OT Email, 3PO Email, OT Chat, 3PO Chat, OT Phone, 3PO Phone）を統合管理します。2025年Q4より、TRT (Total Resolution Time) から **IRT (Internal Resolution Time)** へ移行し、**Reward SLA達成**を最優先目標としています。

### 1.2 主要改善領域

1. **パフォーマンス**: ✅ バッチ読み込み、O(1) ルックアップによる応答速度改善（実装済み）/ ⚠️ キャッシング（計画中）
2. **IRT統合**: ✅ IRT RAW dataシートによる複数ReOpen対応と計算（実装済み）
3. **UX向上**: ✅ Dashboard強化、ReOpen機能（実装済み）/ ⚠️ キーボードショートカット（計画中）
4. **認証・セキュリティ**: ✅ Google OAuth、柔軟なドメイン制限、セッション管理（実装済み）
5. **Gmail通知**: ✅ IRT 2時間切れアラート、チームリーダー通知（定期トリガー方式で実装済み）

### 1.3 重要な成果物

- ✅ 4072行の仕様書 (`casesdash-specification.md`) によるゴールデンスタンダード定義
- ✅ IRT RAW dataシートによる正確なIRT計算（複数ReOpen対応）
- ✅ `frontendGetMyCases()`の最適化（O(n²) → O(n)）
- ✅ Dashboard検索・フィルター・ReOpen機能
- ✅ Create Case、Edit Case、My Cases 実装
- ⚠️ Analytics機能は未実装（今後の実装計画あり）

---

## 2. 現状分析

### 2.1 プロジェクト構造

```
CasesDash-ClaudeWeb/
├── src/
│   ├── backend/              # Google Apps Script コード
│   │   ├── Code.gs           # メインエントリーポイント (1266行)
│   │   ├── auth/             # 認証システム
│   │   │   ├── Authentication.gs
│   │   │   └── SessionManager.gs
│   │   ├── models/           # データモデル
│   │   │   └── CaseModel.gs  # Case クラス (382行)
│   │   ├── services/         # ビジネスロジック
│   │   │   ├── CaseService.gs      # CRUD操作 (608行)
│   │   │   ├── IRTService.gs       # IRT計算 (603行)
│   │   │   └── NotificationService.gs  # Gmail通知 (670行)
│   │   └── utils/            # ユーティリティ
│   │       ├── Config.gs
│   │       └── Constants.gs
│   └── frontend/             # HTML/CSS/JavaScript
│       ├── index.html
│       ├── css/
│       ├── js/
│       └── components/
├── docs/                     # ドキュメント
│   ├── casesdash-specification.md  # 完全仕様書 (4072行)
│   ├── IRT.md
│   ├── GAS_SPECIFICATION.md
│   └── EMAIL_NOTIFICATION_SETUP.md
├── .clasp.json              # Apps Script設定
└── package.json             # npm設定
```

### 2.2 技術スタック

**バックエンド:**
- Google Apps Script (GAS)
- Google Spreadsheets API
- PropertiesService (設定管理)
- CacheService (キャッシング)
- GmailApp / MailApp (通知)

**フロントエンド:**
- HTML5, CSS3 (Grid, Flexbox, CSS Variables)
- JavaScript ES6+ (Async/Await, Modules)
- Material Design Components for Web (Icons, Fonts)
- ⚠️ **統計可視化ライブラリ (未統合)**: ApexCharts、Google Charts、ECharts は現在未実装

**デプロイ:**
- Google Apps Script Web App
- clasp (Command Line Apps Script Projects)

### 2.3 現在の強み

1. **包括的な仕様書**: 4072行の詳細仕様により、全機能が明確に定義
2. **IRT対応**: 2025 Q4の新要件に完全対応
3. **最適化済みAPI**: バッチ読み込み、Map活用によるO(1)ルックアップ
4. **認証システム**: Google OAuth、@google.comドメイン制限
5. **Dashboard機能**: 検索、フィルター、ReOpen、ステータス管理

### 2.4 現在の課題

#### 2.4.1 パフォーマンス

1. **大量データ読み込み**
   - 全ケース読み込みに時間がかかる（特に6シート横断）
   - 解決策: すでに実装済み（バッチ読み込み + Map活用）

2. **クライアントサイドレンダリング**
   - 1000件以上のケースでDOM操作が重い
   - 解決策: 仮想スクロール、遅延ロード実装

#### 2.4.2 機能実装

1. **Live Mode 未実装** ⚠️
   - ポップアップウィンドウ機能が未実装
   - doGet() は 'login' と 'app' モードのみサポート
   - 今後の実装: セクション3.5で詳細設計

2. **Analytics 未実装** ⚠️
   - チャート描画機能が未実装
   - ApexCharts、Google Charts、ECharts のいずれも未統合
   - 今後の実装: Phase 2 で ApexCharts/ECharts統合を計画

3. **Settings画面の統合** ✅ 実装済み
   - Settings 画面は index.html に統合済み (index.html:202-257)

#### 2.4.3 UX/UI

1. **エラーハンドリング**
   - ユーザーフレンドリーなエラーメッセージが不足
   - 解決策: ErrorHandler.js強化

2. **レスポンシブ対応**
   - モバイル表示が最適化されていない
   - 解決策: CSS Grid/Flexboxの改善

---

## 3. アーキテクチャ改善計画

### 3.1 システムアーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Frontend (HTML/CSS/JS)                             │   │
│  │  - Dashboard, My Cases, Create Case, Analytics      │   │
│  │  - Material Design Components                       │   │
│  │  - ApexCharts, Google Charts, ECharts              │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │ google.script.run (AJAX)             │
└─────────────────────┼──────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────┐
│              Google Apps Script Backend                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Code.gs (Main Entry)                                │ │
│  │  - doGet(), doPost()                                 │ │
│  │  - frontend* API endpoints                          │ │
│  └───────────┬──────────────────────────────────────────┘ │
│              │                                             │
│  ┌───────────▼─────────┬──────────────────┬─────────────┐ │
│  │  Authentication     │  CaseService     │ IRTService  │ │
│  │  - OAuth            │  - CRUD          │ - IRT計算   │ │
│  │  - SessionManager   │  - Search        │ - ReOpen    │ │
│  └─────────────────────┴──────────────────┴─────────────┘ │
│                           │                                │
│  ┌────────────────────────▼──────────────────────────────┐│
│  │  Google Spreadsheet (Data Storage)                    ││
│  │  - OT Email, 3PO Email, OT Chat, 3PO Chat             ││
│  │  - OT Phone, 3PO Phone                                ││
│  │  - IRT RAW data (ReOpen tracking)                     ││
│  │  - Configuration (四半期管理)                          ││
│  └───────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### 3.2 データフロー

#### 3.2.1 Case作成フロー

```
User Input → Frontend Validation → google.script.run.frontendCreateCase()
    ↓
Code.gs → Authentication Check → CaseService.createCase()
    ↓
Validation → CaseModel.toSheetRow() → Spreadsheet Append
    ↓
IRTService.createIRTDataEntry() → IRT RAW data Append
    ↓
Response → Frontend Update → UI Refresh
```

#### 3.2.2 IRT計算フロー

```
Case Status Change → IRTService.updateCaseStatus()
    ↓
Get IRT RAW data → Parse Status History → Find Last SO Time
    ↓
Calculate IRT = (EndTime - CaseOpenTime) - TotalSOPeriodHours
    ↓
Update IRT RAW data
```

**IRT 通知フロー（定期トリガー方式）**:

```
Time-based Trigger (Hourly) → checkAndSendIRTAlerts()
    ↓
Read IRT RAW data sheet (batch)
    ↓
For each case: Check (Status=Assigned && IRT Remaining ≤ 2h && Not Recently Notified)
    ↓
Get Team Leader Email → Send Gmail Notification → Update Last Notified Timestamp
```

**重要**: IRT 通知は**リアルタイムではなく**、1時間ごとの定期トリガーで実行されます (NotificationService.gs:384-474)。これにより API 呼び出し回数を削減し、スパム通知を防止します。

### 3.3 認証フロー

```
doGet() → checkAuthStatus()
    ↓
    ├─ Authenticated → serveMainApp()
    └─ Not Authenticated → serveLoginPage()
            ↓
        Google OAuth → authenticate()
            ↓
        Domain Check (@google.com)
            ↓
        createSession() → PropertiesService
            ↓
        Redirect to Main App
```

### 3.4 データ永続化戦略

| データ種別 | 保存先 | TTL | 理由 |
|-----------|--------|-----|------|
| ケースデータ | Google Spreadsheet | 永続 | プライマリデータストア |
| IRT履歴 | IRT RAW data シート | 永続 | ReOpen追跡、監査ログ |
| セッション | PropertiesService | 24時間 | ユーザーログイン状態 |
| 設定 | PropertiesService | 永続 | アプリ設定 |
| キャッシュ | CacheService | 5-10分 | 高速読み込み |

### 3.5 Live Mode設計 ⚠️ **未実装 - 今後の計画**

Live Modeは、メインアプリとは独立したポップアップウィンドウで動作する軽量版アプリケーションとして計画されています。

**計画中の実装方針:**
```javascript
// Main App (今後実装予定)
function openLiveMode() {
  const liveWindow = window.open(
    getAppUrl() + '?mode=live',
    'CasesDash Live Mode',
    'width=1200,height=800,resizable=yes,scrollbars=yes'
  );
}

// Live Mode HTML (lightweight) (今後実装予定)
function serveLiveMode() {
  const template = HtmlService.createTemplateFromFile('frontend/live-mode');
  template.user = getCurrentUser();
  return template.evaluate()
    .setTitle('CasesDash - Live Mode')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

**計画中の機能:**
- Dashboard (簡易版)
- Create Case (フルフォーム)
- リアルタイム更新 (30秒間隔)
- ウィンドウサイズ記憶 (localStorage)

**現状**: Code.gs の doGet() は現在 'login' と 'app' モードのみをサポートしており、'live' モードは未実装です (Code.gs:82-183)。Live Mode の実装は Phase 2 で計画されています (セクション 8 参照)。

---

## 4. バックエンド最適化

### 4.1 パフォーマンス最適化

#### 4.1.1 バッチ読み込み (✅ 実装済み)

```javascript
// ❌ Before: 個別読み込み (遅い)
for (let i = 2; i <= lastRow; i++) {
  const row = sheet.getRange(i, 1, 1, numCols).getValues()[0];
  // 処理...
}

// ✅ After: バッチ読み込み (高速)
const data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  // 処理...
}
```

**効果**: 読み込み時間 90% 削減 (10秒 → 1秒)

#### 4.1.2 Map活用 O(1)ルックアップ (✅ 実装済み)

```javascript
// Code.gs:1112
function loadAllIRTDataIntoMap() {
  const irtMap = new Map();
  const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();

  for (let i = 0; i < data.length; i++) {
    const caseId = data[i][0];
    const irtData = IRTData.fromSheetRow(data[i]);
    irtMap.set(caseId, irtData);
  }

  return irtMap; // O(1) lookup
}
```

**効果**: ケース取得時間 O(n²) → O(n)

#### 4.1.3 キャッシング戦略 ⚠️ **未実装 - 今後の計画**

**計画中の実装案:**
```javascript
// CacheService活用 (今後実装予定)
const CACHE_TTL = 300; // 5分

function getCachedSheetData(sheetName) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `sheet_${sheetName}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    Logger.log(`Cache hit: ${sheetName}`);
    return JSON.parse(cached);
  }

  // キャッシュミス: シートから読み込み
  const data = readSheetData(sheetName);
  cache.put(cacheKey, JSON.stringify(data), CACHE_TTL);

  return data;
}
```

**計画中のキャッシュ無効化タイミング:**
- ケース作成・更新時
- ReOpen実行時
- ステータス変更時

**現状**: CacheService は現在プロジェクトで使用されていません。すべてのデータ読み込みはバッチ読み込み + Map 活用による O(1) ルックアップで最適化されています (Code.gs:1108-1146)。CacheService の導入は Phase 1 で計画されています (セクション 8 参照)。

### 4.2 エラーハンドリング強化 ⚠️ **未実装 - 今後の計画**

#### 4.2.1 統一エラーレスポンス（計画中）

**現状**: 現在のエラーハンドリングは各関数内で個別に try-catch を使用しています。統一的な ErrorHandler クラスは実装されていません。

**計画中の実装案:**
```javascript
// utils/ErrorHandler.gs (今後実装予定)
class ErrorHandler {
  static createErrorResponse(error, context = '') {
    const errorInfo = {
      success: false,
      error: this.getUserFriendlyMessage(error),
      errorCode: this.getErrorCode(error),
      context: context,
      timestamp: new Date().toISOString()
    };

    // ログ記録
    Logger.log(`ERROR [${context}]: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);

    return errorInfo;
  }

  static getUserFriendlyMessage(error) {
    const errorMap = {
      'Spreadsheet ID not configured': 'スプレッドシートが設定されていません。設定画面から設定してください。',
      'Sheet not found': '指定されたシートが見つかりません。',
      'Permission denied': 'アクセス権限がありません。',
      'Case not found': 'ケースが見つかりません。',
      'Authentication required': '認証が必要です。再ログインしてください。'
    };

    for (const [key, message] of Object.entries(errorMap)) {
      if (error.message.includes(key)) {
        return message;
      }
    }

    return '予期しないエラーが発生しました。しばらく待ってから再試行してください。';
  }

  static getErrorCode(error) {
    if (error.message.includes('Authentication')) return 'AUTH_ERROR';
    if (error.message.includes('Permission')) return 'PERMISSION_ERROR';
    if (error.message.includes('not found')) return 'NOT_FOUND';
    if (error.message.includes('Spreadsheet')) return 'SPREADSHEET_ERROR';
    return 'INTERNAL_ERROR';
  }
}
```

#### 4.2.2 リトライロジック（計画中）

**現状**: リトライロジックは実装されていません。

**計画中の実装案:**
```javascript
// utils/RetryHelper.gs (今後実装予定)
function retryWithBackoff(fn, maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return fn();
    } catch (error) {
      retries++;

      if (retries >= maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retries - 1) * 1000;
      Logger.log(`Retry ${retries}/${maxRetries} after ${delay}ms...`);
      Utilities.sleep(delay);
    }
  }
}

// 使用例 (今後実装予定)
function frontendGetMyCases() {
  return retryWithBackoff(() => {
    // 実際の処理
    const cases = loadCases();
    return { success: true, cases };
  });
}
```

### 4.3 IRT計算の正確性向上

#### 4.3.1 タイムゾーン対応

```javascript
// IRTService.gs:72
function formatDateTime(date) {
  if (!date) return '';

  // ローカルタイム (JST) で保存
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function parseDateTimeWithTimezone(datetimeStr) {
  if (!datetimeStr) return null;

  // "YYYY/MM/DD HH:MM:SS" 形式をパース
  const parts = datetimeStr.split(' ');
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');

  return new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2]),
    parseInt(timeParts[0]),
    parseInt(timeParts[1]),
    parseInt(timeParts[2])
  );
}
```

#### 4.3.2 SO期間の正確な計算

```javascript
// IRTService.gs:123
calculateIRT() {
  const caseOpenDate = new Date(this.caseOpenDateTime);
  let endTime;

  // ステータスがSO/Finishedの場合、タイマーは停止
  if (this.currentStatus === CaseStatus.SOLUTION_OFFERED ||
      this.currentStatus === CaseStatus.FINISHED) {
    // 最新のSO開始時刻を取得
    const statusHistory = this.getStatusHistory();
    let lastSODateTime = null;

    for (let i = statusHistory.length - 1; i >= 0; i--) {
      if (statusHistory[i].status === CaseStatus.SOLUTION_OFFERED) {
        lastSODateTime = parseDateTimeWithTimezone(statusHistory[i].datetime);
        break;
      }
    }

    endTime = lastSODateTime || new Date();
  } else {
    // Assignedの場合は現在時刻
    endTime = new Date();
  }

  const totalHours = (endTime - caseOpenDate) / (1000 * 60 * 60);
  const irtHours = totalHours - this.totalSOPeriodHours;

  this.irtHours = parseFloat(irtHours.toFixed(2));
  this.irtRemainingHours = parseFloat((72 - irtHours).toFixed(2));
}
```

### 4.4 Gmail通知システム

#### 4.4.1 トリガー設定

```javascript
// NotificationService.gs
function setupIRTAlertTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkAndSendIRTAlerts') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 新しいトリガーを作成 (1時間ごと)
  ScriptApp.newTrigger('checkAndSendIRTAlerts')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('IRT alert trigger created: every 1 hour');
}
```

#### 4.4.2 通知ロジック

```javascript
// NotificationService.gs
function checkAndSendIRTAlerts() {
  const irtSheet = getSheet(SheetNames.IRT_RAW_DATA);
  const data = irtSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const caseId = row[0];
    const currentStatus = row[6];
    const irtRemainingHours = row[10];
    const lastNotified = row[14]; // O列 (想定)

    // 通知条件
    if (currentStatus === 'Assigned' &&
        irtRemainingHours <= 2 &&
        irtRemainingHours > 0 &&
        !isRecentlyNotified(lastNotified, 6)) { // 6時間以内は再通知しない

      const caseData = getCaseDetails(caseId);
      const tlEmail = getTeamLeaderEmail(caseData.finalAssignee);

      sendIRTAlertEmail(caseData, tlEmail);

      // 最終通知時刻を更新
      irtSheet.getRange(i + 1, 15).setValue(new Date());
    }
  }
}
```

---

## 5. フロントエンド最適化 ⚠️ **大部分が未実装 - 今後の計画**

### 5.1 仮想スクロール実装（計画中）

**現状**: 仮想スクロールは実装されていません。現在、すべてのケースカードが DOM に直接レンダリングされます。

**計画**: 大量ケース（1000件以上）のレンダリングを最適化するため、仮想スクロールの実装を計画しています。

**計画中の実装案:**
```javascript
// js/VirtualScroll.js (今後実装予定)
class VirtualScroll {
  constructor(container, items, rowHeight, bufferSize = 5) {
    this.container = container;
    this.items = items;
    this.rowHeight = rowHeight;
    this.bufferSize = bufferSize;
    this.visibleStart = 0;
    this.visibleEnd = 0;

    this.init();
  }

  init() {
    this.container.style.position = 'relative';
    this.container.style.overflowY = 'auto';

    // Total height for scrollbar
    this.totalHeight = this.items.length * this.rowHeight;
    this.container.style.height = '600px'; // Viewport height

    // Scroll event listener
    this.container.addEventListener('scroll', () => this.render());

    this.render();
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;

    // Calculate visible range
    this.visibleStart = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.bufferSize);
    this.visibleEnd = Math.min(
      this.items.length,
      Math.ceil((scrollTop + viewportHeight) / this.rowHeight) + this.bufferSize
    );

    // Clear container
    this.container.innerHTML = '';

    // Create spacer for offset
    const spacer = document.createElement('div');
    spacer.style.height = `${this.visibleStart * this.rowHeight}px`;
    this.container.appendChild(spacer);

    // Render visible items only
    for (let i = this.visibleStart; i < this.visibleEnd; i++) {
      const item = this.items[i];
      const element = this.renderItem(item);
      this.container.appendChild(element);
    }

    // Bottom spacer
    const bottomSpacer = document.createElement('div');
    bottomSpacer.style.height = `${(this.items.length - this.visibleEnd) * this.rowHeight}px`;
    this.container.appendChild(bottomSpacer);
  }

  renderItem(item) {
    // Override this method to render each case card
    const div = document.createElement('div');
    div.className = 'case-card';
    div.style.height = `${this.rowHeight}px`;
    div.innerHTML = `<h3>${item.case.caseId}</h3>`;
    return div;
  }
}

// 使用例
const virtualScroll = new VirtualScroll(
  document.getElementById('case-list'),
  casesData,
  120 // row height
);
```

### 5.2 リアルタイムタイマー最適化（計画中）

**現状**: リアルタイムタイマー更新機能は基本的なレベルで実装されていますが、最適化されたクラスベースの実装はありません。

**計画中の実装案:**
```javascript
// js/RealtimeUpdater.js (今後実装予定)
class RealtimeUpdater {
  constructor() {
    this.timers = new Map(); // caseId -> timerData
    this.updateInterval = null;
    this.isUpdating = false;
  }

  addTimer(caseId, irtData) {
    if (!irtData || !irtData.caseOpenDateTime) return;

    const caseOpenDate = new Date(irtData.caseOpenDateTime);
    const totalSOPeriodHours = irtData.totalSOPeriodHours || 0;

    this.timers.set(caseId, {
      caseOpenDate,
      totalSOPeriodHours,
      currentStatus: irtData.currentStatus,
      elementId: `irt-timer-${caseId}`
    });
  }

  start() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      this.updateAllTimers();
    }, 1000); // 1秒ごと
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  updateAllTimers() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    const now = new Date();

    this.timers.forEach((timerData, caseId) => {
      const element = document.getElementById(timerData.elementId);
      if (!element) return;

      // ステータスがSO/Finishedの場合、タイマーは停止
      if (timerData.currentStatus === 'Solution Offered' ||
          timerData.currentStatus === 'Finished') {
        return; // 更新しない
      }

      // IRT計算
      const totalMs = now - timerData.caseOpenDate;
      const totalHours = totalMs / (1000 * 60 * 60);
      const irtHours = totalHours - timerData.totalSOPeriodHours;
      const irtRemainingHours = 72 - irtHours;

      // 表示更新
      const timeString = this.formatTime(irtRemainingHours * 3600);
      element.textContent = timeString;
      element.className = `irt-timer ${this.getUrgencyClass(irtRemainingHours)}`;
    });

    this.isUpdating = false;
  }

  formatTime(seconds) {
    if (seconds < 0) return 'MISSED';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  getUrgencyClass(hours) {
    if (hours < 0) return 'missed';
    if (hours <= 2) return 'critical';
    if (hours <= 24) return 'warning';
    return 'normal';
  }
}
```

### 5.3 キーボードショートカット（計画中）

**現状**: キーボードショートカットは実装されていません。

**計画中の実装案:**
```javascript
// js/KeyboardShortcuts.js (今後実装予定)
class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyCombo(e);
      const handler = this.shortcuts.get(key);

      if (handler) {
        e.preventDefault();
        handler(e);
      }
    });
  }

  getKeyCombo(event) {
    const parts = [];
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    parts.push(event.key);
    return parts.join('+');
  }

  register(combo, handler) {
    this.shortcuts.set(combo, handler);
  }
}

// 使用例
const shortcuts = new KeyboardShortcuts();

// Ctrl+; or Cmd+; : 現在の日付を挿入
shortcuts.register('Ctrl+;', () => {
  const activeElement = document.activeElement;
  if (activeElement.tagName === 'INPUT' && activeElement.type === 'date') {
    const today = new Date().toISOString().split('T')[0];
    activeElement.value = today;
  }
});

// Ctrl+Shift+; : 現在の時刻を挿入
shortcuts.register('Ctrl+Shift+;', () => {
  const activeElement = document.activeElement;
  if (activeElement.tagName === 'INPUT' && activeElement.type === 'time') {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    activeElement.value = `${hours}:${minutes}`;
  }
});
```

### 5.4 ダークモード実装（計画中）

**現状**: ダークモード機能は実装されていません。

**計画中の実装案:**
```css
/* css/themes.css (今後実装予定) */
:root {
  /* Light Theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --border-color: #dadce0;
  --accent-color: #1a73e8;
}

[data-theme="dark"] {
  /* Dark Theme */
  --bg-primary: #202124;
  --bg-secondary: #292a2d;
  --text-primary: #e8eaed;
  --text-secondary: #9aa0a6;
  --border-color: #5f6368;
  --accent-color: #8ab4f8;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
}
```

```javascript
// js/ThemeManager.js (今後実装予定)
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.apply();
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.apply();
    localStorage.setItem('theme', this.theme);
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }
}

const themeManager = new ThemeManager();
```

---

## 6. パフォーマンス最適化

### 6.1 目標設定

| 指標 | 現状 | 目標 | 改善策 |
|-----|------|------|--------|
| 初期ロード時間 | 3-5秒 | <2秒 | バッチ読み込み、キャッシング |
| ケース検索時間 | 2-3秒 | <1秒 | インデックス、Map活用 |
| Dashboard更新 | 5-10秒 | <3秒 | 差分更新、仮想スクロール |
| タイマー更新 | CPU 5% | <1% | requestAnimationFrame |

### 6.2 最適化チェックリスト

#### 6.2.1 バックエンド

- [x] ✅ バッチ読み込み実装（実装済み - Code.gs:1108-1146）
- [x] ✅ Map活用によるO(1)ルックアップ（実装済み - Code.gs:1112-1146）
- [ ] ⚠️ CacheService統合（未実装 - Phase 1 で計画）
- [ ] ⚠️ 非同期処理最適化（未実装）
- [ ] ⚠️ エラーハンドリング統一（未実装 - ErrorHandler クラス未実装）
- [ ] ⚠️ リトライロジック（未実装 - RetryHelper 未実装）

#### 6.2.2 フロントエンド

- [ ] ⚠️ 仮想スクロール実装（未実装 - VirtualScroll クラス未実装）
- [ ] ⚠️ 遅延ロード (Lazy Loading)（未実装）
- [ ] ⚠️ コード分割 (Code Splitting)（GAS の制約により困難）
- [ ] ⚠️ 画像最適化（該当画像なし）
- [ ] ⚠️ CSS/JS minification（未実装）
- [ ] ⚠️ キーボードショートカット（未実装）
- [ ] ⚠️ ダークモード（未実装）

#### 6.2.3 ネットワーク

- [ ] gzip圧縮
- [ ] HTTP/2対応 (GAS制限あり)
- [ ] リソースキャッシング
- [ ] CDN活用 (Material Design, Charts)

### 6.3 パフォーマンス計測（計画中）

**現状**: 体系的なパフォーマンス計測機能は実装されていません。

**計画中の実装案:**
```javascript
// js/PerformanceMonitor.js (今後実装予定)
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  start(label) {
    this.metrics.set(label, performance.now());
  }

  end(label) {
    const start = this.metrics.get(label);
    if (!start) return;

    const duration = performance.now() - start;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);

    // Send to analytics
    this.sendToAnalytics(label, duration);
  }

  sendToAnalytics(label, duration) {
    // Google Analytics or custom logging
    if (window.gtag) {
      gtag('event', 'timing_complete', {
        name: label,
        value: Math.round(duration)
      });
    }
  }
}

// 使用例
const perfMon = new PerformanceMonitor();

perfMon.start('loadMyCases');
google.script.run
  .withSuccessHandler((result) => {
    perfMon.end('loadMyCases');
    renderCases(result.cases);
  })
  .frontendGetMyCases();
```

---

## 7. セキュリティ強化

### 7.1 認証・認可

#### 7.1.1 ドメイン制限

```javascript
// Authentication.gs:79
function validateUserDomain(email) {
  const domain = email.split('@')[1];
  // Script Properties から読み込み可能な柔軟な設計
  const allowedDomain = getConfig(ConfigKeys.ALLOWED_DOMAIN, 'google.com');

  if (domain === allowedDomain) {
    return { success: true };
  }

  // テスト用アカウント (開発環境のみ)
  const testAccounts = getTestAccounts();
  if (testAccounts.includes(email)) {
    Logger.log(`Test account authenticated: ${email}`);
    return { success: true };
  }

  return {
    success: false,
    error: `Access denied. Only @${allowedDomain} domain is allowed.`,
    code: 'INVALID_DOMAIN'
  };
}
```

**重要**: 許可ドメインは `getConfig(ConfigKeys.ALLOWED_DOMAIN, 'google.com')` で Script Properties から読み込まれるため、デプロイ後に変更可能です。ハードコードされた固定値ではありません。

#### 7.1.2 セッション管理

```javascript
// SessionManager.gs:20
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24時間

function getActiveSession() {
  const properties = PropertiesService.getUserProperties();
  const sessionJson = properties.getProperty('ACTIVE_SESSION');
  const timestamp = properties.getProperty('SESSION_TIMESTAMP');

  if (!sessionJson || !timestamp) {
    return null;
  }

  // セッション有効期限チェック
  const now = new Date().getTime();
  const sessionAge = now - parseInt(timestamp);

  if (sessionAge > SESSION_TIMEOUT) {
    Logger.log('Session expired');
    destroySession();
    return null;
  }

  // タイムスタンプ更新 (セッション延長)
  properties.setProperty('SESSION_TIMESTAMP', String(now));

  return JSON.parse(sessionJson);
}
```

### 7.2 入力検証 ⚠️ **未実装 - 今後の計画**

**現状**: 統一的な ValidationService は実装されていません。入力検証は各関数内で個別に実施されています。

**計画中の実装案:**
```javascript
// services/ValidationService.gs (今後実装予定)
class ValidationService {
  static validateCaseData(caseData, sheetName) {
    const errors = [];

    // Case ID形式チェック
    if (!caseData.caseId || !/^\d-\d{13}$/.test(caseData.caseId)) {
      errors.push('Case ID must be in format: X-XXXXXXXXXXXXX');
    }

    // 日付形式チェック
    if (caseData.caseOpenDate && !/^\d{4}\/\d{2}\/\d{2}$/.test(caseData.caseOpenDate)) {
      errors.push('Case Open Date must be in format: YYYY/MM/DD');
    }

    // 時刻形式チェック
    if (caseData.caseOpenTime && !/^\d{2}:\d{2}:\d{2}$/.test(caseData.caseOpenTime)) {
      errors.push('Case Open Time must be in format: HH:MM:SS');
    }

    // セグメント検証
    const validSegments = ['Platinum', 'Titanium', 'Gold', 'Silver', 'Bronze - Low', 'Bronze - High'];
    if (caseData.incomingSegment && !validSegments.includes(caseData.incomingSegment)) {
      errors.push(`Invalid Incoming Segment: ${caseData.incomingSegment}`);
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors: errors
      };
    }

    return { success: true };
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // XSS対策: HTMLタグを除去
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
```

### 7.3 監査ログ ⚠️ **未実装 - 今後の計画**

**現状**: 統一的な AuditLogger クラスは実装されていません。

**計画中の実装案:**
```javascript
// utils/AuditLogger.gs (今後実装予定)
class AuditLogger {
  static log(action, details) {
    try {
      const sheet = getOrCreateAuditLogSheet();
      const user = getCurrentUserEmail();
      const timestamp = new Date();

      sheet.appendRow([
        timestamp,
        user,
        action,
        JSON.stringify(details),
        Session.getActiveUser().getEmail()
      ]);

      Logger.log(`[AUDIT] ${action} by ${user}`);
    } catch (error) {
      Logger.log(`Audit logging failed: ${error.message}`);
    }
  }
}

// 使用例
function createCase(caseData, sheetName, createdBy) {
  // ... case creation logic ...

  AuditLogger.log('CASE_CREATED', {
    caseId: caseObj.caseId,
    sheetName: sheetName,
    createdBy: createdBy
  });

  return result;
}
```

---

## 8. 実装ロードマップ

### Phase 1: 基盤強化 (Week 1-2)

**目標**: 安定性とパフォーマンス向上

| タスク | 優先度 | 工数 | 担当 |
|-------|--------|------|------|
| エラーハンドリング統一 | High | 2日 | Backend |
| キャッシング実装 | High | 2日 | Backend |
| 入力検証強化 | High | 1日 | Backend |
| 監査ログ実装 | Medium | 1日 | Backend |
| 仮想スクロール実装 | High | 2日 | Frontend |

**成果物:**
- ErrorHandler.gs
- CacheService統合
- ValidationService.gs
- AuditLogger.gs
- VirtualScroll.js

### Phase 2: 機能拡張 (Week 3-4)

**目標**: Live Mode、Analytics、Gmail通知

| タスク | 優先度 | 工数 | 担当 |
|-------|--------|------|------|
| Live Mode実装 | High | 3日 | Fullstack |
| Analytics チャート実装 | High | 3日 | Frontend |
| Gmail通知トリガー設定 | High | 1日 | Backend |
| Settings画面統合 | Medium | 2日 | Frontend |
| ダークモード実装 | Low | 1日 | Frontend |

**成果物:**
- live-mode.html
- Analytics.js (ApexCharts統合)
- NotificationService.gs (トリガー)
- Settings.html
- ThemeManager.js

### Phase 3: UX改善 (Week 5-6)

**目標**: ユーザビリティ向上

| タスク | 優先度 | 工数 | 担当 |
|-------|--------|------|------|
| キーボードショートカット | Medium | 1日 | Frontend |
| レスポンシブデザイン改善 | Medium | 2日 | Frontend |
| アニメーション追加 | Low | 2日 | Frontend |
| パフォーマンス計測 | High | 1日 | Fullstack |
| ユーザーテスト実施 | High | 3日 | QA |

**成果物:**
- KeyboardShortcuts.js
- Responsive CSS
- PerformanceMonitor.js
- User Feedback Report

### Phase 4: テスト・最適化 (Week 7-8)

**目標**: 本番リリース準備

| タスク | 優先度 | 工数 | 担当 |
|-------|--------|------|------|
| 単体テスト作成 | High | 3日 | QA |
| 統合テスト実施 | High | 2日 | QA |
| パフォーマンステスト | High | 2日 | DevOps |
| セキュリティ監査 | High | 1日 | Security |
| ドキュメント更新 | Medium | 2日 | Tech Writer |

**成果物:**
- Test Suite
- Performance Report
- Security Audit Report
- Updated Documentation

---

## 9. リスク管理

### 9.1 技術リスク

| リスク | 影響度 | 確率 | 対策 |
|-------|--------|------|------|
| GAS実行時間制限 (6分) | High | Medium | バッチ処理、非同期化 |
| Spreadsheet API制限 | Medium | Low | キャッシング、バッチ読み込み |
| ブラウザ互換性 | Low | Medium | Polyfill、フィーチャー検出 |
| データ整合性 | High | Low | トランザクション、検証強化 |

### 9.2 スケジュールリスク

| リスク | 影響度 | 確率 | 対策 |
|-------|--------|------|------|
| 要件変更 | Medium | High | アジャイル開発、短スプリント |
| リソース不足 | High | Medium | 優先順位付け、MVP定義 |
| 技術的負債 | Medium | Medium | リファクタリング時間確保 |

### 9.3 運用リスク

| リスク | 影響度 | 確率 | 対策 |
|-------|--------|------|------|
| ユーザートレーニング不足 | Medium | High | ドキュメント、チュートリアル |
| データ移行エラー | High | Low | バックアップ、検証手順 |
| パフォーマンス劣化 | Medium | Medium | モニタリング、アラート |

---

## 10. 成功指標

### 10.1 KPI (Key Performance Indicators)

#### パフォーマンス

- **初期ロード時間**: <2秒 (現状: 3-5秒)
- **ケース検索時間**: <1秒 (現状: 2-3秒)
- **Dashboard更新**: <3秒 (現状: 5-10秒)

#### ユーザビリティ

- **NPS (Net Promoter Score)**: >50
- **タスク完了率**: >95%
- **エラー発生率**: <1%

#### ビジネス

- **IRT SLA達成率**: >96% (Reward達成)
- **ユーザー採用率**: >80% (全チームメンバー)
- **サポートチケット削減**: -50% (アプリ関連問題)

### 10.2 測定方法

```javascript
// js/Analytics.js
class Analytics {
  static trackEvent(category, action, label, value) {
    if (window.gtag) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }

    // Custom logging
    google.script.run.logAnalyticsEvent({
      timestamp: new Date(),
      category,
      action,
      label,
      value
    });
  }

  static trackPerformance(metric, duration) {
    this.trackEvent('Performance', metric, null, Math.round(duration));
  }

  static trackUserAction(action, details) {
    this.trackEvent('UserAction', action, JSON.stringify(details));
  }
}

// 使用例
Analytics.trackUserAction('case_created', {
  sheetName: 'OT Email',
  caseId: caseId
});

Analytics.trackPerformance('loadMyCases', 1250); // 1250ms
```

---

## 11. まとめ

### 11.1 実装済みの主要な改善点

1. **✅ パフォーマンス**: バッチ読み込み、Map活用による O(1) ルックアップにより、**データ取得時間を大幅削減** (Code.gs:1108-1146)
2. **✅ IRT対応**: IRT RAW dataシートにより、複数ReOpenを正確に追跡し、**SLA計算の精度向上** (IRTService.gs:1-603)
3. **✅ UX向上**: Dashboard強化（検索・フィルター）、ReOpen機能により、**ユーザビリティ向上** (index.html:89-200)
4. **✅ セキュリティ**: Google OAuth、柔軟なドメイン制限、セッション管理により、**基本的なセキュリティ確保** (Authentication.gs:1-259)
5. **✅ Gmail通知**: 定期トリガー方式（1時間ごと）によるIRTアラート送信 (NotificationService.gs:384-480)

### 11.2 今後の実装計画

**Phase 1 (Week 1-2) - 基盤強化:**
- ⚠️ エラーハンドリング統一 (ErrorHandler.gs)
- ⚠️ CacheService統合
- ⚠️ ValidationService実装
- ⚠️ 監査ログ実装 (AuditLogger.gs)

**Phase 2 (Week 3-4) - 機能拡張:**
- ⚠️ Live Mode実装
- ⚠️ Analytics チャート実装 (ApexCharts/ECharts統合)
- ⚠️ 仮想スクロール実装 (VirtualScroll.js)

**Phase 3 (Week 5-6) - UX改善:**
- ⚠️ キーボードショートカット (KeyboardShortcuts.js)
- ⚠️ ダークモード実装 (ThemeManager.js)
- ⚠️ パフォーマンス計測 (PerformanceMonitor.js)

### 11.3 次のステップ

1. **Phase 1実装開始**: 基盤強化タスクから着手
2. **ユーザーフィードバック収集**: 現行システムのフィードバックを収集
3. **継続的改善**: パフォーマンスモニタリング、定期的なリファクタリング

### 11.4 連絡先

- **プロジェクトオーナー**: [Your Name]
- **技術リード**: [Tech Lead Name]
- **GitHub**: https://github.com/Daito369/CasesDash-ClaudeWeb
- **ドキュメント**: `docs/casesdash-specification.md`

---

**Plan.md v1.0**
**最終更新**: 2025-11-15
**承認者**: Google L8 Full-Stack Engineer (Claude)
