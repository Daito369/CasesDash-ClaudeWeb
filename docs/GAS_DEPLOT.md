
### 修正が必要な箇所
- 受信メールの「Case Opened」には「Case Opened: 2025/11/08」が反映している。「Opened: 2025/11/08 22:59:00」のような形式のほうが絶対いいと思うので修正してください。
- Create Case で「Case Open Time *」だけでなく、「Case Open Date *」の値まで「Tue Nov 11 2025 22:16:03 GMT+0900 (日本標準時)」で反映してしまいました。コマンドは機能しているけど、こういうことじゃないんよ。**Edit Case の「1st Close Date」で使用しているロジックを参照して、同じようにコマンド入力できるようにしてください。**
- 「Case Open Time *」の値が、「Tue Nov 11 2025 22:16:03 GMT+0900 (日本標準時)」と入力されてしまう。**Edit Case の「1st Close Time」で使用しているロジックを参照して、同じようにコマンド入力できるようにしてください。**


上記を修正してください。

以下のログも参考にしてください。

### GASの「実行数」
```
Head	getCurrentUser	ウェブアプリ	2025/11/11 22:26:02	0.976 秒	
実行中
Cloud のログ
この実行に関するログはありません
最近の実行に関するログの取得で、遅延が発生している可能性があります。
Head	frontendCreateCase	ウェブアプリ	2025/11/11 22:25:51	5.336 秒	
実行中
Cloud のログ
2025/11/11 22:25:51	情報	frontendCreateCase called
2025/11/11 22:25:51	情報	Sheet: 3PO Email
2025/11/11 22:25:51	情報	Case data: {"is30":false,"triage":false,"details":"","caseId":"0-0000000000012","incomingSegment":"Gold","changeToChild":false,"caseOpenDate":"2025-11-11","amInitiated":false,"mcc":false,"issueCategory":"AIV","productCategory":"Policy","finalSegment":"Gold","bugL2":true,"caseOpenTime":"22:24:17","caseStatus":"Assigned","finalAssignee":"daito","firstAssignee":"daito"}
2025/11/11 22:25:52	情報	Authenticated user: daito@google.com
2025/11/11 22:25:52	情報	[toSheetRow] Setting new DATE for 0-0000000000012: this.date is empty/null
2025/11/11 22:25:59	情報	Appended case to 3PO Email at row 851
2025/11/11 22:25:59	情報	Case created: 0-0000000000012 in 3PO Email at row 851
2025/11/11 22:25:59	情報	Created IRT data entry for case 0-0000000000012
2025/11/11 22:25:59	情報	Case creation result: {"success":true,"message":"Case created successfully","caseId":"0-0000000000012","rowIndex":851,"case":{"date":null,"caseId":"0-0000000000012","sourceSheet":"3PO Email","caseOpenDate":"2025/11/11","caseOpenTime":"22:24:17","caseOpenDateTime":null,"incomingSegment":"Gold","productCategory":"Policy","subCategory":"","issueCategory":"AIV","details":"","triage":false,"amInitiated":false,"is30":false,"mcc":false,"changeToChild":false,"bugL2":true,"firstAssignee":"daito","finalAssignee":"daito","finalSegment":"Gold","salesChannel":"","caseStatus":"Assigned","amTransfer":"","nonNCC":"","trtTimer":null,"irtTimer":null,"firstCloseDate":null,"firstCloseTime":null,"firstCloseDateTime":null,"reopenCloseDate":null,"reopenCloseTime":null,"reopenCloseDateTime":null,"rowIndex":null,"createdAt":"2025-11-11T13:25:52.275Z","updatedAt":"2025-11-11T13:25:52.275Z","createdBy":"daito@google.com","updatedBy":""}}
2025/11/11 22:25:59	情報	Returning response: {"success":true,"message":"Case created successfully","caseId":"0-0000000000012","rowIndex":851,"error":null}
Head	frontendGetMyCases	ウェブアプリ	2025/11/11 22:25:47	1.549 秒	
実行中
Cloud のログ
2025/11/11 22:25:48	情報	frontendGetMyCases called
2025/11/11 22:25:48	情報	Fetching cases for LDAP: daito
2025/11/11 22:25:49	情報	Built IRT Map with 9 entries
2025/11/11 22:25:49	情報	Loaded 9 IRT entries into memory
2025/11/11 22:25:51	情報	[fromSheetRow] Reading DATE from OT Email row 680: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:25:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 822: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:25:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 836: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:25:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 848: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:25:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:25:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 850: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:26:00	情報	Found 12 active cases for daito
2025/11/11 22:26:00	情報	Response size: 10302 characters
2025/11/11 22:26:00	情報	Response size: 10.06 KB
Head	frontendGetMyCases	ウェブアプリ	2025/11/11 22:24:48	5.426 秒	
実行中
Cloud のログ
2025/11/11 22:24:48	情報	frontendGetMyCases called
2025/11/11 22:24:48	情報	Fetching cases for LDAP: daito
2025/11/11 22:24:49	情報	Built IRT Map with 9 entries
2025/11/11 22:24:49	情報	Loaded 9 IRT entries into memory
2025/11/11 22:24:50	情報	[fromSheetRow] Reading DATE from OT Email row 680: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:24:51	情報	[fromSheetRow] Reading DATE from 3PO Email row 822: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:24:51	情報	[fromSheetRow] Reading DATE from 3PO Email row 836: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:24:51	情報	[fromSheetRow] Reading DATE from 3PO Email row 848: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:24:51	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:24:51	情報	[fromSheetRow] Reading DATE from 3PO Email row 850: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:24:55	情報	Found 12 active cases for daito
2025/11/11 22:24:55	情報	Response size: 10302 characters
2025/11/11 22:24:55	情報	Response size: 10.06 KB
Head	getDetailsOptions	ウェブアプリ	2025/11/11 22:24:36	2.312 秒	
完了
Cloud のログ
2025/11/11 22:24:37	情報	getDetailsOptions called
2025/11/11 22:24:37	情報	Successfully got spreadsheet: 【マージ用】Titanium/Gold 2025Q4 のコピー
2025/11/11 22:24:37	情報	Found Index sheet: index
2025/11/11 22:24:38	情報	Last row in Index sheet: 9716
2025/11/11 22:24:38	情報	Found 168 unique details
Head	getCurrentUser	ウェブアプリ	2025/11/11 22:24:18	0.834 秒	
完了
Cloud のログ
この実行に関するログはありません
最近の実行に関するログの取得で、遅延が発生している可能性があります。
Head	frontendGetMyCases	ウェブアプリ	2025/11/11 22:23:47	10.785 秒	
完了
Cloud のログ
2025/11/11 22:23:48	情報	frontendGetMyCases called
2025/11/11 22:23:48	情報	Fetching cases for LDAP: daito
2025/11/11 22:23:49	情報	Built IRT Map with 9 entries
2025/11/11 22:23:49	情報	Loaded 9 IRT entries into memory
2025/11/11 22:23:52	情報	[fromSheetRow] Reading DATE from OT Email row 680: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:23:53	情報	[fromSheetRow] Reading DATE from 3PO Email row 822: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:23:53	情報	[fromSheetRow] Reading DATE from 3PO Email row 836: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:23:53	情報	[fromSheetRow] Reading DATE from 3PO Email row 848: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:23:53	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:23:53	情報	[fromSheetRow] Reading DATE from 3PO Email row 850: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:23:58	情報	Found 12 active cases for daito
2025/11/11 22:23:58	情報	Response size: 10308 characters
2025/11/11 22:23:58	情報	Response size: 10.07 KB
Head	frontendGetMyCases	ウェブアプリ	2025/11/11 22:22:48	8.783 秒	
完了
Cloud のログ
2025/11/11 22:22:49	情報	frontendGetMyCases called
2025/11/11 22:22:49	情報	Fetching cases for LDAP: daito
2025/11/11 22:22:50	情報	Built IRT Map with 9 entries
2025/11/11 22:22:50	情報	Loaded 9 IRT entries into memory
2025/11/11 22:22:51	情報	[fromSheetRow] Reading DATE from OT Email row 680: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:22:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 822: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:22:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 836: "2025-11-05T15:00:00.000Z" (type: object)
2025/11/11 22:22:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 848: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:22:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:22:52	情報	[fromSheetRow] Reading DATE from 3PO Email row 850: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:22:56	情報	Found 12 active cases for daito
2025/11/11 22:22:56	情報	Response size: 10302 characters
2025/11/11 22:22:56	情報	Response size: 10.06 KB
Head	checkAndSendIRTAlerts	エディタ	2025/11/11 22:22:24	7.086 秒	
完了
Cloud のログ
2025/11/11 22:22:25	情報	=== Starting IRT Alert Check ===
2025/11/11 22:22:27	情報	Checking case 0-0000000000001: Status=Solution Offered, IRT Remaining=52.35h
2025/11/11 22:22:27	情報	Checking case 0-0000000000002: Status=Solution Offered, IRT Remaining=54.92h
2025/11/11 22:22:27	情報	Checking case 0-0000000000003: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:22:27	情報	Checking case 0-0000000000004: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:22:27	情報	Checking case 0-0000000000005: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:22:27	情報	Checking case 0-0000000000006: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:22:27	情報	Checking case 0-0000000000007: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:22:27	情報	Checking case 0-0000000000008: Status=Assigned, IRT Remaining=71.99h
2025/11/11 22:22:27	情報	Checking case 0-0000000000001: Status=Assigned, IRT Remaining=71.97h
2025/11/11 22:22:27	情報	Checking case 0-0000000000011: Status=Assigned, IRT Remaining=0.75h
2025/11/11 22:22:27	情報	Case 0-0000000000011 meets alert conditions, sending notification
2025/11/11 22:22:28	情報	[fromSheetRow] Reading DATE from 3PO Email row 849: "2025-11-09T15:00:00.000Z" (type: object)
2025/11/11 22:22:29	情報	Getting team leader email for assignee: daito
2025/11/11 22:22:29	情報	Team leader not found for daito, using default
2025/11/11 22:22:29	情報	Sending IRT alert email for case 0-0000000000011 to daito@google.com
2025/11/11 22:22:30	情報	Notification logged: 0-0000000000011 -> daito@google.com (SUCCESS)
2025/11/11 22:22:30	情報	IRT alert email sent successfully to daito@google.com
2025/11/11 22:22:30	情報	Alert sent successfully for case 0-0000000000011
2025/11/11 22:22:30	情報	=== IRT Alert Check Complete: 1 sent, 9 skipped ===

```

### コンソールログ
```
dev:11 Unrecognized feature: 'ambient-light-sensor'.
dev:11 Unrecognized feature: 'speaker'.
dev:11 Unrecognized feature: 'vibrate'.
dev:11 Unrecognized feature: 'vr'.
about:blank:1 An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing.
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'ambient-light-sensor'.
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'speaker'.
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'vibrate'.
userCodeAppPanel?createOAuthDialog=true:1 Unrecognized feature: 'vr'.
userCodeAppPanel?createOAuthDialog=true:312 API module loaded
userCodeAppPanel?createOAuthDialog=true:269 Auth module loaded
userCodeAppPanel?createOAuthDialog=true:351 Settings module loaded
userCodeAppPanel?createOAuthDialog=true:868 Cases module loaded
userCodeAppPanel?createOAuthDialog=true:410 My Cases module initialized
userCodeAppPanel?createOAuthDialog=true:346 Case Details Modal module initialized
userCodeAppPanel?createOAuthDialog=true:561 Edit Case Modal module initialized
userCodeAppPanel?createOAuthDialog=true:240 Auth module initialized
userCodeAppPanel?createOAuthDialog=true:338 Settings module initialized
userCodeAppPanel?createOAuthDialog=true:855 Cases module initialized
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
userCodeAppPanel?createOAuthDialog=true:33 Loading My Cases screen...
userCodeAppPanel?createOAuthDialog=true:40 Calling API.cases.getMyCases()...
userCodeAppPanel?createOAuthDialog=true:133 Auth status on load: Object
userCodeAppPanel?createOAuthDialog=true:142 User authenticated: Object
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:42 API response received: Object
userCodeAppPanel?createOAuthDialog=true:54 Loaded 12 active cases
userCodeAppPanel?createOAuthDialog=true:300 Started real-time timer updates
userCodeAppPanel?createOAuthDialog=true:355 Started auto-refresh (1 minute interval)
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:376 Cases refreshed successfully
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:376 Cases refreshed successfully
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:376 Cases refreshed successfully
userCodeAppPanel?createOAuthDialog=true:8 Loading Create Case screen...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:644 Loaded 168 details options
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:376 Cases refreshed successfully
userCodeAppPanel?createOAuthDialog=true:363 Refreshing my cases...
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from IDLE to BUSY
userCodeAppPanel?createOAuthDialog=true:57 Creating case...
userCodeAppPanel?createOAuthDialog=true:134 Case data: {caseId: '0-0000000000012', caseStatus: 'Assigned', caseOpenDate: '2025-11-11', caseOpenTime: '22:24:17', incomingSegment: 'Gold', …}
userCodeAppPanel?createOAuthDialog=true:135 Target sheet: 3PO Email
userCodeAppPanel?createOAuthDialog=true:140 Create case result: {rowIndex: 851, message: 'Case created successfully', error: null, success: true, caseId: '0-0000000000012'}
2591484847-warden_bin_i18n_warden__ja.js:164 Net state changed from BUSY to IDLE
userCodeAppPanel?createOAuthDialog=true:376 Cases refreshed successfully
```