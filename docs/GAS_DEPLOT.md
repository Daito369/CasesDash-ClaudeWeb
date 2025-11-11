
### 修正が必要な箇所
- 引き続き、受信メールの「Case Opened」には「Case Opened: 2025/11/08」が反映している。「Opened: 2025/11/08 22:59:00」のような形式のほうが絶対いいと思うので修正してください。
- Create Case で「Case Open Time *」だけでなく、「Case Open Date *」の値まで「Tue Nov 11 2025 22:40:15 GMT+0900 (日本標準時)」で反映してしまいました。その後指定された形式に合わせるしかないので手動で2025-11-11と入力しました。コマンドは機能しているけど、こういうことじゃないんよ。**Edit Case の「1st Close Date」で使用しているロジックを参照して、同じようにコマンド入力できるようにしてください。**
- 「Case Open Time *」の値が、「Tue Nov 11 2025 22:40:29 GMT+0900 (日本標準時)」と入力されてしまう。その後指定された形式に合わせるしかないので、手動でHH:MM:SS形式で入力しました。**Edit Case の「1st Close Time」で使用しているロジックを参照して、同じようにコマンド入力できるようにしてください。**


上記を修正してください。

以下のログも参考にしてください。

### GASの「実行数」
```
Head	frontendGetMyCases	ウェブアプリ	2025/11/11 22:38:28	6.575 秒	
実行中
Cloud のログ
2025/11/11 22:38:28	情報	frontendGetMyCases called
2025/11/11 22:38:29	情報	Fetching cases for LDAP: daito
2025/11/11 22:38:29	情報	Built IRT Map with 10 entries
2025/11/11 22:38:29	情報	Loaded 10 IRT entries into memory
2025/11/11 22:38:31	情報	[fromSheetRow] Reading DATE from OT Email row 680: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:38:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 822: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:38:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 836: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:38:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 848: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:38:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:38:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 850: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:38:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 851: "2025-11-10T15:00:00.000Z" (type: object)
2025/11/11 22:38:37	情報	Found 13 active cases for daito
2025/11/11 22:38:37	情報	Response size: 11207 characters
2025/11/11 22:38:37	情報	Response size: 10.94 KB
Head	getCurrentUser	ウェブアプリ	2025/11/11 22:37:10	0.83 秒	
完了
Cloud のログ
この実行に関するログはありません
最近の実行に関するログの取得で、遅延が発生している可能性があります。
バージョン 5	checkAuthStatus	ウェブアプリ	2025/11/11 22:36:53	0.675 秒	
完了
Cloud のログ
この実行に関するログはありません
最近の実行に関するログの取得で、遅延が発生している可能性があります。
バージョン 5	getSpreadsheetStatus	ウェブアプリ	2025/11/11 22:36:53	1.57 秒	
完了
Cloud のログ
この実行に関するログはありません
最近の実行に関するログの取得で、遅延が発生している可能性があります。
バージョン 5	doGet	ウェブアプリ	2025/11/11 22:36:50	0.884 秒	
完了
Cloud のログ
2025/11/11 22:36:50	情報	doGet called
2025/11/11 22:36:50	情報	Successfully included file: frontend/css/main.css (34159 bytes)
2025/11/11 22:36:50	情報	Successfully included file: frontend/js/api.js (6290 bytes)
2025/11/11 22:36:50	情報	Successfully included file: frontend/js/auth.js (5731 bytes)
2025/11/11 22:36:51	情報	Successfully included file: frontend/js/settings.js (9522 bytes)
2025/11/11 22:36:51	情報	Successfully included file: frontend/js/cases.js (24403 bytes)
2025/11/11 22:36:51	情報	Successfully included file: frontend/js/mycases.js (10955 bytes)
2025/11/11 22:36:51	情報	Successfully included file: frontend/js/caseDetailsModal.js (9630 bytes)
2025/11/11 22:36:51	情報	Successfully included file: frontend/js/editCaseModal.js (16044 bytes)
Head	frontendGetMyCases	ウェブアプリ	2025/11/11 22:36:28	8.706 秒	
完了
Cloud のログ
2025/11/11 22:36:29	情報	frontendGetMyCases called
2025/11/11 22:36:29	情報	Fetching cases for LDAP: daito
2025/11/11 22:36:30	情報	Built IRT Map with 10 entries
2025/11/11 22:36:30	情報	Loaded 10 IRT entries into memory
2025/11/11 22:36:32	情報	[fromSheetRow] Reading DATE from OT Email row 680: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:36:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 822: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:36:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 836: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:36:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 848: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:36:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:36:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 850: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:36:33	情報	[fromSheetRow] Reading DATE from 3PO Email row 851: "2025-11-10T15:00:00.000Z" (type: object)
2025/11/11 22:36:37	情報	Found 13 active cases for daito
2025/11/11 22:36:37	情報	Response size: 11205 characters
2025/11/11 22:36:37	情報	Response size: 10.94 KB
Head	checkAndSendIRTAlerts	エディタ	2025/11/11 22:36:21	7.367 秒	
完了
Cloud のログ
2025/11/11 22:36:22	情報	=== Starting IRT Alert Check ===
2025/11/11 22:36:24	情報	Checking case 0-0000000000001: Status=Solution Offered, IRT Remaining=52.35h
2025/11/11 22:36:24	情報	Checking case 0-0000000000002: Status=Solution Offered, IRT Remaining=54.92h
2025/11/11 22:36:24	情報	Checking case 0-0000000000003: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:36:24	情報	Checking case 0-0000000000004: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:36:24	情報	Checking case 0-0000000000005: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:36:24	情報	Checking case 0-0000000000006: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:36:24	情報	Checking case 0-0000000000007: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:36:24	情報	Checking case 0-0000000000008: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:36:24	情報	Checking case 0-0000000000001: Status=Assigned, IRT Remaining=71.97h
2025/11/11 22:36:24	情報	Checking case 0-0000000000011: Status=Assigned, IRT Remaining=0.75h
2025/11/11 22:36:24	情報	Case 0-0000000000011 meets alert conditions, sending notification
2025/11/11 22:36:26	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:36:26	情報	Getting team leader email for assignee: daito
2025/11/11 22:36:27	情報	Team leader not found for daito, using default
2025/11/11 22:36:27	情報	Sending IRT alert email for case 0-0000000000011 to daito@google.com
2025/11/11 22:36:27	情報	[DEBUG] caseOpenDate: "Sat Nov 08 2025 22:59:00 GMT+0900 (Japan Standard Time)" (type: object)
2025/11/11 22:36:27	情報	[DEBUG] caseOpenTime: "Sat Dec 30 1899 22:59:00 GMT+0900 (Japan Standard Time)" (type: object)
2025/11/11 22:36:28	情報	Notification logged: 0-0000000000011 -> daito@google.com (SUCCESS)
2025/11/11 22:36:28	情報	IRT alert email sent successfully to daito@google.com
2025/11/11 22:36:28	情報	Alert sent successfully for case 0-0000000000011
2025/11/11 22:36:28	情報	Checking case 0-0000000000012: Status=Assigned, IRT Remaining=71.97h
2025/11/11 22:36:28	情報	=== IRT Alert Check Complete: 1 sent, 10 skipped ===

```

### コンソールログ
```
dev:11 Unrecognized feature: 'ambient-light-sensor'.この警告を分析
dev:11 Unrecognized feature: 'speaker'.この警告を分析
dev:11 Unrecognized feature: 'vibrate'.この警告を分析
dev:11 Unrecognized feature: 'vr'.この警告を分析
about:blank:1 An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.この警告を分析
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'ambient-light-sensor'.この警告を分析
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'speaker'.この警告を分析
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'vibrate'.この警告を分析
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'vr'.この警告を分析
userCodeAppPanel?createOAuthDialog=true:312 API module loaded
userCodeAppPanel?createOAuthDialog=true:269 Auth module loaded
userCodeAppPanel?createOAuthDialog=true:351 Settings module loaded
userCodeAppPanel?createOAuthDialog=true:896 Cases module loaded
userCodeAppPanel?createOAuthDialog=true:410 My Cases module initialized
userCodeAppPanel?createOAuthDialog=true:346 Case Details Modal module initialized
userCodeAppPanel?createOAuthDialog=true:561 Edit Case Modal module initialized
userCodeAppPanel?createOAuthDialog=true:240 Auth module initialized
userCodeAppPanel?createOAuthDialog=true:338 Settings module initialized
userCodeAppPanel?createOAuthDialog=true:883 Cases module initialized
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
userCodeAppPanel?createOAuthDialog=true:133 Auth status on load: Object
userCodeAppPanel?createOAuthDialog=true:142 User authenticated: Object
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:8 Loading Create Case screen...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:830 Today's date inserted: Tue Nov 11 2025 22:35:06 GMT+0900 (日本標準時)
userCodeAppPanel?createOAuthDialog=true:830 Today's date inserted: Tue Nov 11 2025 22:35:08 GMT+0900 (日本標準時)
userCodeAppPanel?createOAuthDialog=true:33 Loading My Cases screen...
userCodeAppPanel?createOAuthDialog=true:40 Calling API.cases.getMyCases()...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:42 API response received: Object
userCodeAppPanel?createOAuthDialog=true:54 Loaded 13 active cases
userCodeAppPanel?createOAuthDialog=true:300 Started real-time timer updates
userCodeAppPanel?createOAuthDialog=true:355 Started auto-refresh (1 minute interval)
userCodeAppPanel?createOAuthDialog=true:16 Opening edit case modal for: 0-0000000000011 from sheet: 3PO Email row: 850
userCodeAppPanel?createOAuthDialog=true:72 Loading case data for editing: 0-0000000000011 from sheet: 3PO Email row: 850
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:91 Case data loaded for editing: Object
userCodeAppPanel?createOAuthDialog=true:542 Today's date inserted: 2025-11-11
userCodeAppPanel?createOAuthDialog=true:554 Current time inserted: 22:35:40
userCodeAppPanel?createOAuthDialog=true:42 Closing edit case modal
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:376 Cases refreshed successfully
userCodeAppPanel?createOAuthDialog=true:8 Loading Create Case screen...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:830 Today's date inserted: Tue Nov 11 2025 22:37:22 GMT+0900 (日本標準時)
userCodeAppPanel?createOAuthDialog=true:842 Current time inserted: Tue Nov 11 2025 22:37:26 GMT+0900 (日本標準時)
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:248  POST https://script.google.com/a/google.com/macros/s/AKfycbx50xthKElH7SEb82ZWpmEHUzJCJqgjXzlrptotWegE/callback?nocache_id=13&token=AJuLMu0MdbOuXkFgN9q0pXgWx8Y8icKwyQ%3A1762868083208 429 (Too Many Requests)
Tv @ 2591484847-warden_bin_i18n_warden__ja.js:248
yz.Dc @ 2591484847-warden_bin_i18n_warden__ja.js:359
（匿名） @ 2591484847-warden_bin_i18n_warden__ja.js:366
wz @ 2591484847-warden_bin_i18n_warden__ja.js:367
Bz.ia @ 2591484847-warden_bin_i18n_warden__ja.js:361
eA.v @ 2591484847-warden_bin_i18n_warden__ja.js:379
hA @ 2591484847-warden_bin_i18n_warden__ja.js:384
gA.C @ 2591484847-warden_bin_i18n_warden__ja.js:383このエラーを分析
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:191 Get my cases error: NetworkError: 次の原因のために接続できませんでした: HTTP 429
getMyCases @ userCodeAppPanel?createOAuthDialog=true:191
await in getMyCases
refreshMyCases @ userCodeAppPanel?createOAuthDialog=true:365
（匿名） @ userCodeAppPanel?createOAuthDialog=true:352このエラーを分析
userCodeAppPanel?createOAuthDialog=true:382 Error refreshing cases: NetworkError: 次の原因のために接続できませんでした: HTTP 429
refreshMyCases @ userCodeAppPanel?createOAuthDialog=true:382
await in refreshMyCases
（匿名） @ userCodeAppPanel?createOAuthDialog=true:352このエラーを分析
userCodeAppPanel?createOAuthDialog=true:1 An invalid form control with name='' is not focusable. <select id=​"issueCategory" class=​"form-input" required>​…​</select>​このエラーを分析
userCodeAppPanel?createOAuthDialog=true:830 Today's date inserted: Tue Nov 11 2025 22:37:48 GMT+0900 (日本標準時)
userCodeAppPanel?createOAuthDialog=true:842 Current time inserted: Tue Nov 11 2025 22:37:51 GMT+0900 (日本標準時)
userCodeAppPanel?createOAuthDialog=true:1 An invalid form control with name='' is not focusable. <select id=​"issueCategory" class=​"form-input" required>​…​</select>​このエラーを分析
userCodeAppPanel?createOAuthDialog=true:1 An invalid form control with name='' is not focusable. <select id=​"issueCategory" class=​"form-input" required>​…​</select>​このエラーを分析
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
```