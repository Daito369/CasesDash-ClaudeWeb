# CasesDash - マルチシート対応 ケース管理システム（完全版仕様書）

## 1. プロジェクト概要

### 1.1 概要と目的

CasesDashは、Google 広告サポートチームのケース管理を効率化するためのウェブベースのツールです。Google スプレッドシートと連携し、6つの異なるシート（OT Email, 3PO Email, OT Chat, 3PO Chat, OT Phone, 3PO Phone）にわたるケース割り当て、追跡、期限管理、統計分析を一元化します。

**重要な制約**: GCPは使用できません。Google Apps Scriptベースでの実装となります。

**2025年Q4重要変更**: 2025年11月1日より、SLAメトリックが**TRT (Total Resolution Time)** から **IRT (Internal Resolution Time)** に変更されました。本システムはIRTの正確な計測とリアルタイム追跡に対応しています。

### 1.2 対象シートと構造

本システムは以下の7つのシート（6つのケース管理シート + 1つのIRT計測シート）に対応します：

#### **ケース管理シート（6シート）**

| シート名 | ケースタイプ | チャネル | ケースID開始列 | 特殊フィールド |
| --- | --- | --- | --- | --- |
| OT Email | OT | Email | C列 | AM Initiated, Sub Category, Issue Category |
| 3PO Email | 3PO | Email | C列 | AM Initiated, Issue Category, Details |
| OT Chat | OT | Chat | B列 | Sub Category, Issue Category |
| 3PO Chat | 3PO | Chat | B列 | Issue Category, Details |
| OT Phone | OT | Phone | B列 | Sub Category, Issue Category |
| 3PO Phone | 3PO | Phone | B列 | Issue Category, Details |

#### **IRT計測専用シート（1シート）**

| シート名 | 用途 | データソース | 更新頻度 |
| --- | --- | --- | --- |
| IRT RAW data | IRT計測・ReOpen履歴管理 | 6シート + UI操作 | リアルタイム + 1時間ごと |

#### **設定管理シート（1シート）**

| シート名 | 用途 | 内容 |
| --- | --- | --- |
| Configuration | 四半期管理・過去データ参照 | 過去四半期のスプレッドシートID、IRT開始日設定

### 1.3 解決する主要課題

- **複数シート対応の必要性**: 6つのシートに対応
- **IRT (Internal Resolution Time)メトリック管理**: 2025年Q4（11/1）より導入されたGoogle メトリックのメイン指標の正確な計算と追跡
- **除外ケース管理**: Bug Case、L2 Consult、PayReq、Invoice Dispute、Workdriver、T&S Teamの適切な除外処理
- **リアルタイム通知**: IRTタイマー2時間以下での自動Gmail通知
- **統合ユーザー管理**: 認証、プロファイル、権限管理の一元化

## 2. 実際のスプレッドシート構造に基づく詳細マッピング

### 2.1 OT Email シート構造（正確版）

**ヘッダー構造（1行目+2行目の組み合わせ）:**

```
A: Date [日付形式: YYYY/MM/DD]
B: Cases [関数で自動生成されるため空欄でOK]
C: Case ID
D: Case Open Date [日付形式: YYYY/MM/DD]
E: Time (Case Open Time) [時間形式: HH:MM:SS]
F: Incoming Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
G: Product Category [セレクトボックス: Search, Display, Video, Commerce, Apps, M&A, Policy, Billing, Other]
H: Sub Category [セレクトボックス：Search, P-MAX, Display, Demand Gen, Video, Apps, M&A, Other]
I: Issue Category [セレクトボックス：Search 配信関連, Search 仕様・機能, Search レポート, Search カスタムテスト・バリエーション, 無効なクリックの調査, 自動化ルール, Search その他, P-MAX 配信関連, P-MAX 仕様・機能, P-MAX レポート, P-MAX カスタムテスト・バリエーション, 除外 KW 追加依頼, P-MAX その他, Display 仕様・機能, Display 配信状況, 動的リマーケティング広告・ビジネスデータフィード, 「ウェブサイトを訪れたユーザー」のデータセグメント, 顧客リスト, データセグメントの共有, シームカービングのオプトアウト, Display レポート, Display 3PAS 関連, Display その他, Demand Gen 仕様・機能, Demand Gen 配信関連, オーディエンス, BLS, Demand Gen レポート, Demand Gen 3PAS 関連, Demand Gen その他, Video 仕様・機能, Video 配信状況, YouTube ユーザーセグメント, BLS (ブランドリフト調査)/SLS (検索数の増加測定), Video レポート, Video 3PAS 関連, Video その他, MCM, Apps 配信関連, Apps 仕様・機能, Apps レポート, コンバージョン, 除外設定・オプトアウト依頼, フィードを使用したアプリキャンペーン, アプリキャンペーン以外のコンバージョン (Appify), アプリユーザーへのリマーケティング, Apps その他, Ads CV の計測, Ads CV のレポート, GA4 CV の計測, GA4 レポート, GA4 CV と Ads CV の乖離, OCI レポート乖離, OCI エラー, 拡張コンバージョン, リードの拡張コンバージョン, Google タグ, GTM を使用した Ads リマーケティング設定, GA4 からインポートしたオーディエンス, M&Aその他, パートナープログラム, エディタ, 本人確認, UI 操作・エラー, Ads 権限付与, GW・年末年始, Other その他]
J: Triage [0/1のチェックボックス]
K: AM Initiated [0/1のチェックボックス]
L: Is 3.0 [0/1のチェックボックス]
M: 1st Assignee [Ldap]
N: TRT Timer [スプレッドシートの関数で自動計算]
O: IRT Timer [スプレッドシートの関数で自動計算]
P: MCC [0/1のチェックボックス]
Q: Change to Child [0/1のチェックボックス]
R: Final Assignee [Ldap]
S: Final Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
T: Sales Channel [関数でSales Channelシートから自動反映した値が入る]
U: Case Status [セレクトボックス: Assigned, Solution Offered, Finished]
V: AM Transfer [セレクトボックス：Request to AM contact, Optimize request, β product inquiry, Trouble shooting scope but we don't have access to the resource, Tag team request (LCS customer), Data analysis, Allowlist request, Other]
W: non NCC [セレクトボックス：Duplicate, Discard, Transfer to Platinum, Transfer to S/B, Transfer to TDCX, Transfer to 3PO, Transfer to OT, Transfer to EN Team, Transfer to GMB Team, Transfer to Other Team (not AM)]
X: Bug / L2 [0/1のチェックボックス]
Y: 1st Close Date [日付形式: YYYY/MM/DD]
Z: 1st Close Time [時間形式: HH:MM:SS]
AA: Reopen Close Date [日付形式: YYYY/MM/DD]
AB: Reopen Close Time [時間形式: HH:MM:SS]
AC: 空欄
AD~AR: 自動計算フィールド
```

### 2.2 3PO Email シート構造（正確版）

```
A: Date [日付形式: YYYY/MM/DD]
B: Cases [関数で自動生成されるため空欄でOK]
C: Case ID
D: Case Open Date [日付形式: YYYY/MM/DD]
E: Time (Case Open Time) [時間形式: HH:MM:SS]
F: Incoming Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
G: Product Category [セレクトボックス: Search, Display, Video, Commerce, Apps, M&A, Policy, Billing, Other]
H: Triage [0/1のチェックボックス]
I: AM Initiated [0/1のチェックボックス]
J: Is 3.0 [0/1のチェックボックス]
K: Issue Category [3PO特有 - セレクトボックス：Review, TM form, Trademarks issue, Under Review, Certificate, Suspend, AIV, CBT, LC creation, PP link, PP update, Payment user change, CL increase/decrease, IDT/ Bmod, LCS billing policy, Self-serve issue, Unidentified Charge, CBT Flow, GQ, OOS, Bulk CBT, Promotion code, Refund, Invoice issue, Account budget, Cost discrepancy, BOV]
L: Details [3PO特有 - セレクトボックス：不適切な価格設定 / 許可されないビジネス手法, 誤解を招く広告のデザイン, 信頼できない文言, 操作されたメディア, 誤解を招く表現, ビジネス名の要件, 許可されないビジネス, 関連性が不明確, 法的要件, 不適切なリンク先, リンク先の利便性, アクセスできないリンク先, クロールできないリンク先, 機能していないリンク先, 確認できないアプリ, 広告グループ 1 つにつき 1 つのウェブサイト, 未確認の電話番号, 広告文に記載された電話番号, サポートされていない言語, 利用できない動画, 許可されない動画フォーマット, 画像の品質, 第四者呼び出し, 使用できない URL, 第三者配信の要件, 許可されない電話番号, 許可されないスクリプト, HTML5, 画像アセットのフォーマットの要件, アプリやウェブストアに関するポリシー違反, 危険な商品やサービス, 危険または中傷的なコンテンツ, 露骨な性的コンテンツ, デリケートな事象, 報酬を伴う性的行為, 児童への性的虐待の画像, 危険ドラッグ, 衝撃的なコンテンツ, その他の武器および兵器, 爆発物, 銃、銃部品、関連商品, 美白製品の宣伝, 国際結婚の斡旋, 動物への残虐行為, 不正入手された政治的資料, 暗号通貨, 個人ローン, 金融商品およびサービスについての情報開示, バイナリー オプション, 投機目的の複雑な金融商品, 広告主の適格性確認, 商標 / 再販業者と情報サイト, 不正なソフトウェア, 広告掲載システムの回避, 不当な手段による利益の獲得, 独自コンテンツの不足, ウェブマスター向けガイドライン, 性的なコンテンツ / 一部制限付きのカテゴリ, 性的なコンテンツ / 厳しく制限されるカテゴリ, ポルノ, 句読点と記号, 不明なビジネス, 会社名の要件, 大文字, 許可されないスペース, スタイルと表現, 広告機能の不正使用, 重複表現, 高脂肪、高塩分、高糖分の食品および飲料に関する広告, 政府発行書類と公的サービス, イベント チケットの販売, 第三者による消費者向けテクニカル サポート, サポートされていないビジネス, 無料のPC ソフトウェア, ローカル サービス, 保釈金立替サービス, 消費者勧告, 電話番号案内サービス、通話転送サービス、通話録音サービス, 信仰（パーソナライズド広告の場合）, 13 歳未満のユーザー（パーソナライズド広告の場合）, 虐待や心的外傷（パーソナライズド広告の場合）, 部分的なヌード, 人間関係における困難（パーソナライズド広告の場合）, 厳しい経済状況（パーソナライズド広告の場合）, 健康（パーソナライズド広告の場合）, 機会へのアクセス（住居 / 求人 / クレジット）, 強制停止, インタラクティブ要素の暗示, わかりにくいテキスト, 否定的な出来事, テキストまたはグラフィックのオーバーレイ, コラージュ, ぼやけた画像や不鮮明な画像, 切り抜き方に問題がある画像, 乱れた画像, 空白の多すぎる画像, アルコール / タバコ, ビジネスオペレーションの適格性, クローキング, 著作権, オフライン・オンラインギャンブル, ソーシャルカジノ, 処方薬、市販薬, 制限付き医療コンテンツ, 制限付き薬物に関するキーワード, 不承認の薬物, 依存症関連サービス, 実証されていない試験的な医療、細胞治療、遺伝子治療, 避妊, 中絶, 臨床試験の被験者募集, HIV 家庭用検査キット, 不正な支払い、, フィッシング, 政治に関するコンテンツ, その他, リンク先のエクスペリエンス, クリックベイト, 空白のクリエイティブ, 不適切なコンテンツ, よくない出来事, 人種や民族（パーソナライズド広告の場合）, オンライン マッチング, マイナス思考の強制(パーソナライズド広告の場合), 禁止カテゴリ, 禁止コンテンツ, 不正行為を助長する商品やサービス, 利用できない特典, ビジネスの名前が不適切, ビジネスのロゴが不適切, 金融サービスの適格性確認, リスト　クローズ, ブランドリフト調査, 不正使用されているサイト, サードパーティーポリシーに関する要件, コンテンツ　ポリシーに基づく自動化, 画像に含まれる行動を促すフレーズの要素, クレジット回復サービス, アクセスが制限されている動画, アルゼンチンの政治広告, クリックトラッカー, 日本の日付証明書, 債務関連サービス, 見出しと説明の要件, カジノ以外のオンラインゲーム, 動画コンテンツの変更, 勤務先, DSL, 出会い系関連の禁止事項, PP name, Address, Declined payment, Credit statement, Collections, Invoice GQ, 出会い系とコンパニオンサービス, ビジネス名の視認性の高さ, 関連性のない名前, 関連性のないロゴ, ロゴの視認性の高さ, ビジネスオペレーションの適格性確認, YTCQ - 不適切なコンテンツ, YTCQ - 誇張表現や不正確な表現, YTCQ - ネガティブな出来事および画像, ビジネスのロゴが不鮮明, イメージ広告におけるアニメーション]
M: 1st Assignee [Ldap]
N: TRT Timer [スプレッドシートの関数で自動計算]
O: IRT Timer [スプレッドシートの関数で自動計算]
P: MCC [0/1のチェックボックス]
Q: Change to Child [0/1のチェックボックス]
R: Final Assignee [Ldap]
S: Final Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
T: Sales Channel  [関数でSales Channelシートから自動反映した値が入る]
U: Case Status [セレクトボックス: Assigned, Solution Offered, Finished]
V: AM Transfer [セレクトボックス：Request to AM contact, Optimize request, β product inquiry, Trouble shooting scope but we don't have access to the resource, Tag team request (LCS customer), Data analysis, Allowlist request, Other]
W: non NCC  [セレクトボックス：Duplicate, Discard, Transfer to Platinum, Transfer to S/B, Transfer to TDCX, Transfer to 3PO, Transfer to OT, Transfer to EN Team, Transfer to GMB Team, Transfer to Other Team (not AM)]
X: Bug / L2 / T&S/ Payreq [0/1のチェックボックス]
Y: 1st Close Date [日付形式: YYYY/MM/DD]
Z: 1st Close Time [時間形式: HH:MM:SS]
AA: Reopen Close Date [日付形式: YYYY/MM/DD]
AB: Reopen Close Time [時間形式: HH:MM:SS]
AC: 空欄
AD~AR: 自動計算フィールド
```

### 2.3 OT Chat シート構造（正確版）

```
A: Cases [関数で自動生成されるため空欄でOK]
B: Case ID
C: Case Open Date [日付形式: YYYY/MM/DD]
D: Time (Case Open Time) [時間形式: HH:MM:SS]
E: Incoming Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
F: Product Category [セレクトボックス: Search, Display, Video, Commerce, Apps, M&A, Policy, Billing, Other]
G: Sub Category [セレクトボックス：Search, P-MAX, Display, Demand Gen, Video, Apps, M&A, Other]
H: Issue Category [セレクトボックス：Search 配信関連, Search 仕様・機能, Search レポート, Search カスタムテスト・バリエーション, 無効なクリックの調査, 自動化ルール, Search その他, P-MAX 配信関連, P-MAX 仕様・機能, P-MAX レポート, P-MAX カスタムテスト・バリエーション, 除外 KW 追加依頼, P-MAX その他, Display 仕様・機能, Display 配信状況, 動的リマーケティング広告・ビジネスデータフィード, 「ウェブサイトを訪れたユーザー」のデータセグメント, 顧客リスト, データセグメントの共有, シームカービングのオプトアウト, Display レポート, Display 3PAS 関連, Display その他, Demand Gen 仕様・機能, Demand Gen 配信関連, オーディエンス, BLS, Demand Gen レポート, Demand Gen 3PAS 関連, Demand Gen その他, Video 仕様・機能, Video 配信状況, YouTube ユーザーセグメント, BLS (ブランドリフト調査)/SLS (検索数の増加測定), Video レポート, Video 3PAS 関連, Video その他, MCM, Apps 配信関連, Apps 仕様・機能, Apps レポート, コンバージョン, 除外設定・オプトアウト依頼, フィードを使用したアプリキャンペーン, アプリキャンペーン以外のコンバージョン (Appify), アプリユーザーへのリマーケティング, Apps その他, Ads CV の計測, Ads CV のレポート, GA4 CV の計測, GA4 レポート, GA4 CV と Ads CV の乖離, OCI レポート乖離, OCI エラー, 拡張コンバージョン, リードの拡張コンバージョン, Google タグ, GTM を使用した Ads リマーケティング設定, GA4 からインポートしたオーディエンス, M&Aその他, パートナープログラム, エディタ, 本人確認, UI 操作・エラー, Ads 権限付与, GW・年末年始, Other その他]
I: Triage [0/1のチェックボックス]
J: Is 3.0 [0/1のチェックボックス]
K: 1st Assignee [Ldap]
L: TRT Timer [スプレッドシートの関数で自動計算]
M: IRT Timer [スプレッドシートの関数で自動計算]
N: MCC [0/1のチェックボックス]
O: Change to Child [0/1のチェックボックス]
P: Final Assignee [Ldap]
Q: Final Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
R: Sales Channel [関数でSales Channelシートから自動反映した値が入る]
S: Case Status [セレクトボックス: Assigned, Solution Offered, Finished]
T: AM Transfer [セレクトボックス：Request to AM contact, Optimize request, β product inquiry, Trouble shooting scope but we don't have access to the resource, Tag team request (LCS customer), Data analysis, Allowlist request, Other]
U: non NCC [セレクトボックス：Duplicate, Discard, Transfer to Platinum, Transfer to S/B, Transfer to TDCX, Transfer to 3PO, Transfer to OT, Transfer to EN Team, Transfer to GMB Team, Transfer to Other Team (not AM)]
V: Bug / L2 [0/1のチェックボックス]
W: 1st Close Date [日付形式: YYYY/MM/DD]
X: 1st Close Time [時間形式: HH:MM:SS]
Y: Reopen Close Date [日付形式: YYYY/MM/DD]
Z: Reopen Close Time [時間形式: HH:MM:SS]
AA: 空欄
AB~AP: 自動計算フィールド
```

### 2.4 3PO Chat シート構造（正確版）

```
A: Cases [関数で自動生成されるため空欄でOK]
B: Case ID
C: Case Open Date [日付形式: YYYY/MM/DD]
D: Time (Case Open Time) [時間形式: HH:MM:SS]
E: Incoming Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
F: Product Category [セレクトボックス: Search, Display, Video, Commerce, Apps, M&A, Policy, Billing, Other]
G: Triage [0/1のチェックボックス]
H: Is 3.0 [0/1のチェックボックス]
I: Issue Category [3PO特有 - セレクトボックス：Review, TM form, Trademarks issue, Under Review, Certificate, Suspend, AIV, CBT, LC creation, PP link, PP update, Payment user change, CL increase/decrease, IDT/ Bmod, LCS billing policy, Self-serve issue, Unidentified Charge, CBT Flow, GQ, OOS, Bulk CBT, Promotion code, Refund, Invoice issue, Account budget, Cost discrepancy, BOV]
J: Details [3PO特有 - セレクトボックス：不適切な価格設定 / 許可されないビジネス手法, 誤解を招く広告のデザイン, 信頼できない文言, 操作されたメディア, 誤解を招く表現, ビジネス名の要件, 許可されないビジネス, 関連性が不明確, 法的要件, 不適切なリンク先, リンク先の利便性, アクセスできないリンク先, クロールできないリンク先, 機能していないリンク先, 確認できないアプリ, 広告グループ 1 つにつき 1 つのウェブサイト, 未確認の電話番号, 広告文に記載された電話番号, サポートされていない言語, 利用できない動画, 許可されない動画フォーマット, 画像の品質, 第四者呼び出し, 使用できない URL, 第三者配信の要件, 許可されない電話番号, 許可されないスクリプト, HTML5, 画像アセットのフォーマットの要件, アプリやウェブストアに関するポリシー違反, 危険な商品やサービス, 危険または中傷的なコンテンツ, 露骨な性的コンテンツ, デリケートな事象, 報酬を伴う性的行為, 児童への性的虐待の画像, 危険ドラッグ, 衝撃的なコンテンツ, その他の武器および兵器, 爆発物, 銃、銃部品、関連商品, 美白製品の宣伝, 国際結婚の斡旋, 動物への残虐行為, 不正入手された政治的資料, 暗号通貨, 個人ローン, 金融商品およびサービスについての情報開示, バイナリー オプション, 投機目的の複雑な金融商品, 広告主の適格性確認, 商標 / 再販業者と情報サイト, 不正なソフトウェア, 広告掲載システムの回避, 不当な手段による利益の獲得, 独自コンテンツの不足, ウェブマスター向けガイドライン, 性的なコンテンツ / 一部制限付きのカテゴリ, 性的なコンテンツ / 厳しく制限されるカテゴリ, ポルノ, 句読点と記号, 不明なビジネス, 会社名の要件, 大文字, 許可されないスペース, スタイルと表現, 広告機能の不正使用, 重複表現, 高脂肪、高塩分、高糖分の食品および飲料に関する広告, 政府発行書類と公的サービス, イベント チケットの販売, 第三者による消費者向けテクニカル サポート, サポートされていないビジネス, 無料のPC ソフトウェア, ローカル サービス, 保釈金立替サービス, 消費者勧告, 電話番号案内サービス、通話転送サービス、通話録音サービス, 信仰（パーソナライズド広告の場合）, 13 歳未満のユーザー（パーソナライズド広告の場合）, 虐待や心的外傷（パーソナライズド広告の場合）, 部分的なヌード, 人間関係における困難（パーソナライズド広告の場合）, 厳しい経済状況（パーソナライズド広告の場合）, 健康（パーソナライズド広告の場合）, 機会へのアクセス（住居 / 求人 / クレジット）, 強制停止, インタラクティブ要素の暗示, わかりにくいテキスト, 否定的な出来事, テキストまたはグラフィックのオーバーレイ, コラージュ, ぼやけた画像や不鮮明な画像, 切り抜き方に問題がある画像, 乱れた画像, 空白の多すぎる画像, アルコール / タバコ, ビジネスオペレーションの適格性, クローキング, 著作権, オフライン・オンラインギャンブル, ソーシャルカジノ, 処方薬、市販薬, 制限付き医療コンテンツ, 制限付き薬物に関するキーワード, 不承認の薬物, 依存症関連サービス, 実証されていない試験的な医療、細胞治療、遺伝子治療, 避妊, 中絶, 臨床試験の被験者募集, HIV 家庭用検査キット, 不正な支払い、, フィッシング, 政治に関するコンテンツ, その他, リンク先のエクスペリエンス, クリックベイト, 空白のクリエイティブ, 不適切なコンテンツ, よくない出来事, 人種や民族（パーソナライズド広告の場合）, オンライン マッチング, マイナス思考の強制(パーソナライズド広告の場合), 禁止カテゴリ, 禁止コンテンツ, 不正行為を助長する商品やサービス, 利用できない特典, ビジネスの名前が不適切, ビジネスのロゴが不適切, 金融サービスの適格性確認, リスト　クローズ, ブランドリフト調査, 不正使用されているサイト, サードパーティーポリシーに関する要件, コンテンツ　ポリシーに基づく自動化, 画像に含まれる行動を促すフレーズの要素, クレジット回復サービス, アクセスが制限されている動画, アルゼンチンの政治広告, クリックトラッカー, 日本の日付証明書, 債務関連サービス, 見出しと説明の要件, カジノ以外のオンラインゲーム, 動画コンテンツの変更, 勤務先, DSL, 出会い系関連の禁止事項, PP name, Address, Declined payment, Credit statement, Collections, Invoice GQ, 出会い系とコンパニオンサービス, ビジネス名の視認性の高さ, 関連性のない名前, 関連性のないロゴ, ロゴの視認性の高さ, ビジネスオペレーションの適格性確認, YTCQ - 不適切なコンテンツ, YTCQ - 誇張表現や不正確な表現, YTCQ - ネガティブな出来事および画像, ビジネスのロゴが不鮮明, イメージ広告におけるアニメーション]
K: 1st Assignee [Ldap]
L: TRT Timer [スプレッドシートの関数で自動計算]
M: IRT Timer [スプレッドシートの関数で自動計算]
N: MCC [0/1のチェックボックス]
O: Change to Child [0/1のチェックボックス]
P: Final Assignee [Ldap]
Q: Final Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
R: Sales Channel [関数でSales Channelシートから自動反映した値が入る]
S: Case Status [セレクトボックス: Assigned, Solution Offered, Finished]
T: AM Transfer [セレクトボックス]
U: non NCC [セレクトボックス]
V: Bug / L2 / T&S/ Payreq [0/1のチェックボックス]
W: 1st Close Date [日付形式: YYYY/MM/DD]
X: 1st Close Time [時間形式: HH:MM:SS]
Y: Reopen Close Date [日付形式: YYYY/MM/DD]
Z: Reopen Close Time [時間形式: HH:MM:SS]
AA: 空欄
AB~AP: 自動計算フィールド
```

### 2.5 OT Phone シート構造（正確版）

```
A: Cases [関数で自動生成されるため空欄でOK]
B: Case ID
C: Case Open Date [日付形式: YYYY/MM/DD]
D: Time (Case Open Time) [時間形式: HH:MM:SS]
E: Incoming Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
F: Product Category [セレクトボックス: Search, Display, Video, Commerce, Apps, M&A, Policy, Billing, Other]
G: Sub Category [セレクトボックス：Search, P-MAX, Display, Demand Gen, Video, Apps, M&A, Other]
H: Issue Category [セレクトボックス：Search 配信関連, Search 仕様・機能, Search レポート, Search カスタムテスト・バリエーション, 無効なクリックの調査, 自動化ルール, Search その他, P-MAX 配信関連, P-MAX 仕様・機能, P-MAX レポート, P-MAX カスタムテスト・バリエーション, 除外 KW 追加依頼, P-MAX その他, Display 仕様・機能, Display 配信状況, 動的リマーケティング広告・ビジネスデータフィード, 「ウェブサイトを訪れたユーザー」のデータセグメント, 顧客リスト, データセグメントの共有, シームカービングのオプトアウト, Display レポート, Display 3PAS 関連, Display その他, Demand Gen 仕様・機能, Demand Gen 配信関連, オーディエンス, BLS, Demand Gen レポート, Demand Gen 3PAS 関連, Demand Gen その他, Video 仕様・機能, Video 配信状況, YouTube ユーザーセグメント, BLS (ブランドリフト調査)/SLS (検索数の増加測定), Video レポート, Video 3PAS 関連, Video その他, MCM, Apps 配信関連, Apps 仕様・機能, Apps レポート, コンバージョン, 除外設定・オプトアウト依頼, フィードを使用したアプリキャンペーン, アプリキャンペーン以外のコンバージョン (Appify), アプリユーザーへのリマーケティング, Apps その他, Ads CV の計測, Ads CV のレポート, GA4 CV の計測, GA4 レポート, GA4 CV と Ads CV の乖離, OCI レポート乖離, OCI エラー, 拡張コンバージョン, リードの拡張コンバージョン, Google タグ, GTM を使用した Ads リマーケティング設定, GA4 からインポートしたオーディエンス, M&Aその他, パートナープログラム, エディタ, 本人確認, UI 操作・エラー, Ads 権限付与, GW・年末年始, Other その他]
I: Triage [0/1のチェックボックス]
J: Is 3.0 [0/1のチェックボックス]
K: 1st Assignee [Ldap]
L: TRT Timer [スプレッドシートの関数で自動計算]
M: IRT Timer [スプレッドシートの関数で自動計算]
N: MCC [0/1のチェックボックス]
O: Change to Child [0/1のチェックボックス]
P: Final Assignee [Ldap]
Q: Final Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
R: Sales Channel [関数でSales Channelシートから自動反映した値が入る]
S: Case Status [セレクトボックス: Assigned, Solution Offered, Finished]
T: AM Transfer [セレクトボックス：Request to AM contact, Optimize request, β product inquiry, Trouble shooting scope but we don't have access to the resource, Tag team request (LCS customer), Data analysis, Allowlist request, Other]
U: non NCC [セレクトボックス：Duplicate, Discard, Transfer to Platinum, Transfer to S/B, Transfer to TDCX, Transfer to 3PO, Transfer to OT, Transfer to EN Team, Transfer to GMB Team, Transfer to Other Team (not AM)]
V: Bug / L2 [0/1のチェックボックス]
W: 1st Close Date [日付形式: YYYY/MM/DD]
X: 1st Close Time [時間形式: HH:MM:SS]
Y: Reopen Close Date [日付形式: YYYY/MM/DD]
Z: Reopen Close Time [時間形式: HH:MM:SS]
AA: 空欄
AB~AP: 自動計算フィールド
```

### 2.6 3PO Phone シート構造（正確版）

```
A: Cases [関数で自動生成されるため空欄でOK]
B: Case ID
C: Case Open Date [日付形式: YYYY/MM/DD]
D: Time (Case Open Time) [時間形式: HH:MM:SS]
E: Incoming Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
F: Product Category [セレクトボックス: Search, Display, Video, Commerce, Apps, M&A, Policy, Billing, Other]
G: Triage [0/1のチェックボックス]
H: Is 3.0 [0/1のチェックボックス]
I: Issue Category [3PO特有 - セレクトボックス：Review, TM form, Trademarks issue, Under Review, Certificate, Suspend, AIV, CBT, LC creation, PP link, PP update, Payment user change, CL increase/decrease, IDT/ Bmod, LCS billing policy, Self-serve issue, Unidentified Charge, CBT Flow, GQ, OOS, Bulk CBT, Promotion code, Refund, Invoice issue, Account budget, Cost discrepancy, BOV]
J: Details [3PO特有 - セレクトボックス：不適切な価格設定 / 許可されないビジネス手法, 誤解を招く広告のデザイン, 信頼できない文言, 操作されたメディア, 誤解を招く表現, ビジネス名の要件, 許可されないビジネス, 関連性が不明確, 法的要件, 不適切なリンク先, リンク先の利便性, アクセスできないリンク先, クロールできないリンク先, 機能していないリンク先, 確認できないアプリ, 広告グループ 1 つにつき 1 つのウェブサイト, 未確認の電話番号, 広告文に記載された電話番号, サポートされていない言語, 利用できない動画, 許可されない動画フォーマット, 画像の品質, 第四者呼び出し, 使用できない URL, 第三者配信の要件, 許可されない電話番号, 許可されないスクリプト, HTML5, 画像アセットのフォーマットの要件, アプリやウェブストアに関するポリシー違反, 危険な商品やサービス, 危険または中傷的なコンテンツ, 露骨な性的コンテンツ, デリケートな事象, 報酬を伴う性的行為, 児童への性的虐待の画像, 危険ドラッグ, 衝撃的なコンテンツ, その他の武器および兵器, 爆発物, 銃、銃部品、関連商品, 美白製品の宣伝, 国際結婚の斡旋, 動物への残虐行為, 不正入手された政治的資料, 暗号通貨, 個人ローン, 金融商品およびサービスについての情報開示, バイナリー オプション, 投機目的の複雑な金融商品, 広告主の適格性確認, 商標 / 再販業者と情報サイト, 不正なソフトウェア, 広告掲載システムの回避, 不当な手段による利益の獲得, 独自コンテンツの不足, ウェブマスター向けガイドライン, 性的なコンテンツ / 一部制限付きのカテゴリ, 性的なコンテンツ / 厳しく制限されるカテゴリ, ポルノ, 句読点と記号, 不明なビジネス, 会社名の要件, 大文字, 許可されないスペース, スタイルと表現, 広告機能の不正使用, 重複表現, 高脂肪、高塩分、高糖分の食品および飲料に関する広告, 政府発行書類と公的サービス, イベント チケットの販売, 第三者による消費者向けテクニカル サポート, サポートされていないビジネス, 無料のPC ソフトウェア, ローカル サービス, 保釈金立替サービス, 消費者勧告, 電話番号案内サービス、通話転送サービス、通話録音サービス, 信仰（パーソナライズド広告の場合）, 13 歳未満のユーザー（パーソナライズド広告の場合）, 虐待や心的外傷（パーソナライズド広告の場合）, 部分的なヌード, 人間関係における困難（パーソナライズド広告の場合）, 厳しい経済状況（パーソナライズド広告の場合）, 健康（パーソナライズド広告の場合）, 機会へのアクセス（住居 / 求人 / クレジット）, 強制停止, インタラクティブ要素の暗示, わかりにくいテキスト, 否定的な出来事, テキストまたはグラフィックのオーバーレイ, コラージュ, ぼやけた画像や不鮮明な画像, 切り抜き方に問題がある画像, 乱れた画像, 空白の多すぎる画像, アルコール / タバコ, ビジネスオペレーションの適格性, クローキング, 著作権, オフライン・オンラインギャンブル, ソーシャルカジノ, 処方薬、市販薬, 制限付き医療コンテンツ, 制限付き薬物に関するキーワード, 不承認の薬物, 依存症関連サービス, 実証されていない試験的な医療、細胞治療、遺伝子治療, 避妊, 中絶, 臨床試験の被験者募集, HIV 家庭用検査キット, 不正な支払い、, フィッシング, 政治に関するコンテンツ, その他, リンク先のエクスペリエンス, クリックベイト, 空白のクリエイティブ, 不適切なコンテンツ, よくない出来事, 人種や民族（パーソナライズド広告の場合）, オンライン マッチング, マイナス思考の強制(パーソナライズド広告の場合), 禁止カテゴリ, 禁止コンテンツ, 不正行為を助長する商品やサービス, 利用できない特典, ビジネスの名前が不適切, ビジネスのロゴが不適切, 金融サービスの適格性確認, リスト　クローズ, ブランドリフト調査, 不正使用されているサイト, サードパーティーポリシーに関する要件, コンテンツ　ポリシーに基づく自動化, 画像に含まれる行動を促すフレーズの要素, クレジット回復サービス, アクセスが制限されている動画, アルゼンチンの政治広告, クリックトラッカー, 日本の日付証明書, 債務関連サービス, 見出しと説明の要件, カジノ以外のオンラインゲーム, 動画コンテンツの変更, 勤務先, DSL, 出会い系関連の禁止事項, PP name, Address, Declined payment, Credit statement, Collections, Invoice GQ, 出会い系とコンパニオンサービス, ビジネス名の視認性の高さ, 関連性のない名前, 関連性のないロゴ, ロゴの視認性の高さ, ビジネスオペレーションの適格性確認, YTCQ - 不適切なコンテンツ, YTCQ - 誇張表現や不正確な表現, YTCQ - ネガティブな出来事および画像, ビジネスのロゴが不鮮明, イメージ広告におけるアニメーション]
K: 1st Assignee [Ldap]
L: TRT Timer [スプレッドシートの関数で自動計算]
M: IRT Timer [スプレッドシートの関数で自動計算]
N: MCC [0/1のチェックボックス]
O: Change to Child [0/1のチェックボックス]
P: Final Assignee [Ldap]
Q: Final Segment [セレクトボックス: Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High]
R: Sales Channel [関数でSales Channelシートから自動反映した値が入る]
S: Case Status [セレクトボックス: Assigned, Solution Offered, Finished]
T: AM Transfer [セレクトボックス：Request to AM contact, Optimize request, β product inquiry, Trouble shooting scope but we don't have access to the resource, Tag team request (LCS customer), Data analysis, Allowlist request, Other]
U: non NCC [セレクトボックス：Duplicate, Discard, Transfer to Platinum, Transfer to S/B, Transfer to TDCX, Transfer to 3PO, Transfer to OT, Transfer to EN Team, Transfer to GMB Team, Transfer to Other Team (not AM)]
V: Bug / L2 T&S/ Payreq [0/1のチェックボックス]
W: 1st Close Date [日付形式: YYYY/MM/DD]
X: 1st Close Time [時間形式: HH:MM:SS]
Y: Reopen Close Date [日付形式: YYYY/MM/DD]
Z: Reopen Close Time [時間形式: HH:MM:SS]
AA: 空欄
AB~AP: 自動計算フィールド
```

### 2.7 IRT RAW data シート構造（IRT計測専用）

**重要**: このシートは、2025年Q4（11/1）以降のIRT (Internal Resolution Time) 計測を正確に行うための専用シートです。既存の6シートではReOpen履歴を完全に管理できないため、本シートでReOpenの全履歴とIRT計算結果を保存します。

**ヘッダー構造:**

```
A: Case ID [一意識別子]
B: Source Sheet [元のシート名: "OT Email", "3PO Email"等]
C: Case Open DateTime [日時: YYYY/MM/DD HH:MM:SS形式]
D: First SO DateTime [初回Solution Offered日時: YYYY/MM/DD HH:MM:SS]
E: Status History JSON [JSON文字列: 全ステータス変更履歴]
F: ReOpen History JSON [JSON文字列: 全ReOpen履歴]
G: Current Status [現在のCase Status: Assigned / Solution Offered / Finished]
H: ReOpen Count [ReOpen回数: 数値]
I: Total SO Period Hours [合計SO期間: 時間数]
J: IRT Hours [計算されたIRT: 時間数]
K: IRT Remaining Hours [IRT残り時間: 時間数（72時間から減算）]
L: Within SLA [SLA達成判定: TRUE / FALSE]
M: Urgency Level [緊急度: normal / warning / critical / missed]
N: Final Assignee [最終担当者Ldap]
O: Final Segment [最終セグメント]
P: Sales Channel [Sales Channel]
Q: Evaluation Segment [評価セグメント: Final Segment × Sales Channel]
R: Is Excluded [除外判定: TRUE / FALSE]
S: Exclusion Reason [除外理由: Bug / L2 Consult / PayReq等]
T: Last Updated [最終更新日時: YYYY/MM/DD HH:MM:SS]
U: Product Category [製品カテゴリ: 分析用]
V: Non NCC [non NCC値: 空欄 or 理由]
W: Bug L2 Flag [Bug/L2フラグ: 0 or 1]
```

**JSON形式の詳細:**

**Status History JSON (E列):**
```json
{
  "history": [
    {"datetime": "2025/11/06 10:00:00", "status": "Assigned", "changedBy": "user1@google.com"},
    {"datetime": "2025/11/07 14:30:00", "status": "Solution Offered", "changedBy": "user1@google.com"},
    {"datetime": "2025/11/08 09:15:00", "status": "Assigned", "changedBy": "user1@google.com"},
    {"datetime": "2025/11/09 16:45:00", "status": "Finished", "changedBy": "user1@google.com"}
  ]
}
```

**ReOpen History JSON (F列):**
```json
{
  "reopens": [
    {
      "reopenNumber": 1,
      "soDateTime": "2025/11/07 14:30:00",
      "reopenDateTime": "2025/11/08 09:15:00",
      "soPeriodHours": 18.75,
      "reopenedBy": "user1@google.com"
    },
    {
      "reopenNumber": 2,
      "soDateTime": "2025/11/09 11:20:00",
      "reopenDateTime": "2025/11/10 08:30:00",
      "soPeriodHours": 21.17,
      "reopenedBy": "user1@google.com"
    }
  ],
  "totalReopens": 2,
  "totalSOPeriodHours": 39.92
}
```

**データ同期仕様:**

1. **ケース作成時** (Create Case実行時)
   - 6シートのいずれかにケースが作成された時点でIRT RAW dataシートに新規行を追加
   - 初期値: Case ID、Source Sheet、Case Open DateTime、Current Status = "Assigned"

2. **ケースステータス変更時** (Case Status更新時)
   - Status History JSONに新規エントリを追加
   - Current Statusを更新
   - ステータスが"Solution Offered"になった場合: First SO DateTimeを記録（初回のみ）
   - ステータスが"Assigned"に戻った場合（ReOpen）: ReOpen History JSONに新規エントリを追加

3. **1時間ごとの自動同期** (Time-driven Trigger)
   - 6シートの全ケースをスキャン
   - IRT RAW dataシートに存在しないケースを追加
   - 既存ケースのステータス差分を検出して同期

4. **リアルタイム計算** (UI表示時)
   - IRT Remaining Hoursをクライアントサイドで1秒ごとに再計算
   - 緊急度（Urgency Level）の動的判定

### 2.8 Configuration シート構造（設定管理）

**用途**: 四半期ごとのスプレッドシートID管理と、IRT計測の開始日設定を行います。

**ヘッダー構造:**

```
A: Quarter [四半期: "2025-Q1", "2025-Q2"等]
B: Spreadsheet ID [スプレッドシートID]
C: Start Date [開始日: YYYY/MM/DD]
D: End Date [終了日: YYYY/MM/DD]
E: IRT Enabled [IRT計測有効: TRUE / FALSE]
F: Notes [備考]
```

**データ例:**

```
| Quarter   | Spreadsheet ID                          | Start Date  | End Date    | IRT Enabled | Notes                     |
|-----------|-----------------------------------------|-------------|-------------|-------------|---------------------------|
| 2025-Q1   | 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0 | 2025/01/01  | 2025/03/31  | FALSE       | TRTメトリック使用         |
| 2025-Q2   | 2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1 | 2025/04/01  | 2025/06/30  | FALSE       | TRTメトリック使用         |
| 2025-Q3   | 3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2 | 2025/07/01  | 2025/09/30  | FALSE       | TRTメトリック使用         |
| 2025-Q4   | current                                 | 2025/10/01  | 2025/12/31  | TRUE        | IRTメトリック開始（11/1～）|
| 2026-Q1   | (未定)                                   | 2026/01/01  | 2026/03/31  | TRUE        | IRTメトリック継続         |
```

**使用方法:**

1. **Analytics機能での期間選択時:**
   - Q4のみ選択: 現在のスプレッドシート（"current"）からデータ取得
   - Q3-Q4選択: Q3のSpreadsheet IDを使用して`SpreadsheetApp.openById()`で過去データ取得 + Q4データをマージ
   - **IRT分析**: IRT Enabled = TRUEの四半期のみを統合分析（2025Q4以降）

2. **データ参照ロジック:**
```javascript
function getDataForQuarters(quarters) {
  const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Configuration');
  const configData = configSheet.getDataRange().getValues();

  let allData = [];

  quarters.forEach(quarter => {
    const config = configData.find(row => row[0] === quarter);
    if (config) {
      const spreadsheetId = config[1];
      const ss = spreadsheetId === 'current'
        ? SpreadsheetApp.getActiveSpreadsheet()
        : SpreadsheetApp.openById(spreadsheetId);

      // データ取得処理
      const data = fetchDataFromSpreadsheet(ss);
      allData = allData.concat(data);
    }
  });

  return allData;
}
```

3. **IRT統合分析:**
```javascript
function getIRTDataOnly() {
  const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Configuration');
  const configData = configSheet.getDataRange().getValues();

  // IRT Enabled = TRUEの四半期のみをフィルタリング（2025Q4以降）
  const irtQuarters = configData.filter(row => row[4] === true);

  return getDataForQuarters(irtQuarters.map(row => row[0]));
}
```

## 3. 正確な列マッピングシステム

### 3.1 完全なシート別列マッピング定義

```jsx

javascript
const SheetColumnMappings = {
  "OT Email": {
// 基本情報
    date: "A",
    caseLink: "B",// ハイパーリンク（自動生成）
    caseId: "C",
    caseOpenDate: "D",
    caseOpenTime: "E",
    incomingSegment: "F",
    productCategory: "G",
    subCategory: "H",// OT特有
    issueCategory: "I",// OT特有

// フラグ・チェックボックス
    triage: "J",
    amInitiated: "K",
    is30: "L",

// 担当者情報
    firstAssignee: "M",

// タイマー（自動計算）
    trtTimer: "N",
    irtTimer: "O",  // ← IRT Timer追加（2025Q4～）

// アカウント情報
    mcc: "P",      // ← 修正（OからPへ）
    changeToChild: "Q",  // ← 修正（PからQへ）

// 最終担当者情報
    finalAssignee: "R",  // ← 修正（QからRへ）
    finalSegment: "S",   // ← 修正（RからSへ）

// チャネル・ステータス
    salesChannel: "T",   // ← 修正（SからTへ）
    caseStatus: "U",     // ← 修正（TからUへ）
    amTransfer: "V",     // ← 修正（UからVへ）
    nonNCC: "W",         // ← 修正（VからWへ）
    bugL2: "X",          // ← 修正（WからXへ）

// クローズ情報
    firstCloseDate: "Y",      // ← 修正（XからYへ）
    firstCloseTime: "Z",      // ← 修正（YからZへ）
    reopenCloseDate: "AA",    // ← 修正（ZからAAへ）
    reopenCloseTime: "AB",    // ← 修正（AAからABへ）

// 自動計算フィールド
    productCommerce: "AC",
    assignWeek: "AD",
    channel: "AE",
    trtTarget: "AF",
    trtDateTime: "AG",
    agingTarget: "AH",
    agingDateTime: "AI",
    closeNCC: "AJ",
    closeDate: "AK",
    closeTime: "AL",
    closeWeek: "AM",
    trtFlag: "AN",
    agingFlag: "AO",
    reopenCloseFlag: "AP",
    reassignFlag: "AQ"
  },

  "3PO Email": {
// 基本情報
    date: "A",
    caseLink: "B",
    caseId: "C",
    caseOpenDate: "D",
    caseOpenTime: "E",
    incomingSegment: "F",
    productCategory: "G",

// フラグ・チェックボックス
    triage: "H",
    amInitiated: "I",
    is30: "J",

// 3PO特有フィールド
    issueCategory: "K",
    details: "L",

// 担当者情報
    firstAssignee: "M",

// タイマー（自動計算）
    trtTimer: "N",
    irtTimer: "O",  // ← IRT Timer追加（2025Q4～）

// アカウント情報
    mcc: "P",      // ← 修正（OからPへ）
    changeToChild: "Q",  // ← 修正（PからQへ）

// 最終担当者情報
    finalAssignee: "R",  // ← 修正（QからRへ）
    finalSegment: "S",   // ← 修正（RからSへ）

// チャネル・ステータス
    salesChannel: "T",   // ← 修正（SからTへ）
    caseStatus: "U",     // ← 修正（TからUへ）
    amTransfer: "V",     // ← 修正（UからVへ）
    nonNCC: "W",         // ← 修正（VからWへ）
    bugL2TSPayreq: "X",  // ← 修正（WからXへ）// 3PO特有

// クローズ情報
    firstCloseDate: "Y",      // ← 修正（XからYへ）
    firstCloseTime: "Z",      // ← 修正（YからZへ）
    reopenCloseDate: "AA",    // ← 修正（ZからAAへ）
    reopenCloseTime: "AB",    // ← 修正（AAからABへ）

// 自動計算フィールド
    assignWeek: "AD",
    channel: "AE",
    trtTarget: "AF",
    trtDateTime: "AG",
    agingTarget: "AH",
    agingDateTime: "AI",
    closeNCC: "AJ",
    closeDate: "AK",
    closeTime: "AL",
    closeWeek: "AM",
    trtFlag: "AN",
    agingFlag: "AO",
    reopenCloseFlag: "AP",
    reassignFlag: "AQ"
  },

  "OT Chat": {
// 基本情報
    caseLink: "A",
    caseId: "B",
    caseOpenDate: "C",
    caseOpenTime: "D",
    incomingSegment: "E",
    productCategory: "F",
    subCategory: "G",// OT特有
    issueCategory: "H",// OT特有

// フラグ・チェックボックス
    triage: "I",
    is30: "J",

// 担当者情報
    firstAssignee: "K",

// タイマー（自動計算）
    trtTimer: "L",
    irtTimer: "M",  // ← IRT Timer追加（2025Q4～）

// アカウント情報
    mcc: "N",       // ← 修正（MからNへ）
    changeToChild: "O",  // ← 修正（NからOへ）

// 最終担当者情報
    finalAssignee: "P",  // ← 修正（OからPへ）
    finalSegment: "Q",   // ← 修正（PからQへ）

// チャネル・ステータス
    salesChannel: "R",   // ← 修正（QからRへ）
    caseStatus: "S",     // ← 修正（RからSへ）
    amTransfer: "T",     // ← 修正（SからTへ）
    nonNCC: "U",         // ← 修正（TからUへ）
    bugL2: "V",          // ← 修正（UからVへ）

// クローズ情報
    firstCloseDate: "W",      // ← 修正（VからWへ）
    firstCloseTime: "X",      // ← 修正（WからXへ）
    reopenCloseDate: "Y",     // ← 修正（XからYへ）
    reopenCloseTime: "Z",     // ← 修正（YからZへ）

// 自動計算フィールド
    productCommerce: "AA",
    assignWeek: "AB",
    channel: "AC",
    trtTarget: "AD",
    trtDateTime: "AE",
    agingTarget: "AF",
    agingDateTime: "AG",
    closeNCC: "AH",
    closeDate: "AI",
    closeTime: "AJ",
    closeWeek: "AK",
    trtFlag: "AL",
    agingFlag: "AM",
    reopenCloseFlag: "AN",
    reassignFlag: "AO"
  },

  "3PO Chat": {
// 基本情報
    caseLink: "A",
    caseId: "B",
    caseOpenDate: "C",
    caseOpenTime: "D",
    incomingSegment: "E",
    productCategory: "F",

// フラグ・チェックボックス
    triage: "G",
    is30: "H",

// 3PO特有フィールド
    issueCategory: "I",
    details: "J",

// 担当者情報
    firstAssignee: "K",

// タイマー（自動計算）
    trtTimer: "L",
    irtTimer: "M",  // ← IRT Timer追加（2025Q4～）

// アカウント情報
    mcc: "N",       // ← 修正（MからNへ）
    changeToChild: "O",  // ← 修正（NからOへ）

// 最終担当者情報
    finalAssignee: "P",  // ← 修正（OからPへ）
    finalSegment: "Q",   // ← 修正（PからQへ）

// チャネル・ステータス
    salesChannel: "R",   // ← 修正（QからRへ）
    caseStatus: "S",     // ← 修正（RからSへ）
    amTransfer: "T",     // ← 修正（SからTへ）
    nonNCC: "U",         // ← 修正（TからUへ）
    bugL2TSPayreq: "V",  // ← 修正（UからVへ）// 3PO特有

// クローズ情報
    firstCloseDate: "W",      // ← 修正（VからWへ）
    firstCloseTime: "X",      // ← 修正（WからXへ）
    reopenCloseDate: "Y",     // ← 修正（XからYへ）
    reopenCloseTime: "Z",     // ← 修正（YからZへ）

// 自動計算フィールド
    assignWeek: "AB",
    channel: "AC",
    trtTarget: "AD",
    trtDateTime: "AE",
    agingTarget: "AF",
    agingDateTime: "AG",
    closeNCC: "AH",
    closeDate: "AI",
    closeTime: "AJ",
    closeWeek: "AK",
    trtFlag: "AL",
    agingFlag: "AM",
    reopenCloseFlag: "AN",
    reassignFlag: "AO"
  },

  "OT Phone": {
// OT Chatと同じ構造// channelフィールドの値のみ"Phone"
    caseLink: "A",
    caseId: "B",
    caseOpenDate: "C",
    caseOpenTime: "D",
    incomingSegment: "E",
    productCategory: "F",
    subCategory: "G",
    issueCategory: "H",
    triage: "I",
    is30: "J",
    firstAssignee: "K",
    trtTimer: "L",
    irtTimer: "M",  // ← IRT Timer追加（2025Q4～）
    mcc: "N",       // ← 修正（MからNへ）
    changeToChild: "O",  // ← 修正（NからOへ）
    finalAssignee: "P",  // ← 修正（OからPへ）
    finalSegment: "Q",   // ← 修正（PからQへ）
    salesChannel: "R",   // ← 修正（QからRへ）
    caseStatus: "S",     // ← 修正（RからSへ）
    amTransfer: "T",     // ← 修正（SからTへ）
    nonNCC: "U",         // ← 修正（TからUへ）
    bugL2: "V",          // ← 修正（UからVへ）
    firstCloseDate: "W",      // ← 修正（VからWへ）
    firstCloseTime: "X",      // ← 修正（WからXへ）
    reopenCloseDate: "Y",     // ← 修正（XからYへ）
    reopenCloseTime: "Z",     // ← 修正（YからZへ）
    productCommerce: "AA",
    assignWeek: "AB",
    channel: "AC",// 固定値: "Phone"
    trtTarget: "AD",
    trtDateTime: "AE",
    agingTarget: "AF",
    agingDateTime: "AG",
    closeNCC: "AH",
    closeDate: "AI",
    closeTime: "AJ",
    closeWeek: "AK",
    trtFlag: "AL",
    agingFlag: "AM",
    reopenCloseFlag: "AN",
    reassignFlag: "AO"
  },

  "3PO Phone": {
// 3PO Chatと同じ構造// channelフィールドの値のみ"Phone"
    caseLink: "A",
    caseId: "B",
    caseOpenDate: "C",
    caseOpenTime: "D",
    incomingSegment: "E",
    productCategory: "F",
    triage: "G",
    is30: "H",
    issueCategory: "I",
    details: "J",
    firstAssignee: "K",
    trtTimer: "L",
    irtTimer: "M",  // ← IRT Timer追加（2025Q4～）
    mcc: "N",       // ← 修正（MからNへ）
    changeToChild: "O",  // ← 修正（NからOへ）
    finalAssignee: "P",  // ← 修正（OからPへ）
    finalSegment: "Q",   // ← 修正（PからQへ）
    salesChannel: "R",   // ← 修正（QからRへ）
    caseStatus: "S",     // ← 修正（RからSへ）
    amTransfer: "T",     // ← 修正（SからTへ）
    nonNCC: "U",         // ← 修正（TからUへ）
    bugL2TSPayreq: "V",  // ← 修正（UからVへ）
    firstCloseDate: "W",      // ← 修正（VからWへ）
    firstCloseTime: "X",      // ← 修正（WからXへ）
    reopenCloseDate: "Y",     // ← 修正（XからYへ）
    reopenCloseTime: "Z",     // ← 修正（YからZへ）
    assignWeek: "AB",
    channel: "AC",// 固定値: "Phone"
    trtTarget: "AD",
    trtDateTime: "AE",
    agingTarget: "AF",
    agingDateTime: "AG",
    closeNCC: "AH",
    closeDate: "AI",
    closeTime: "AJ",
    closeWeek: "AK",
    trtFlag: "AL",
    agingFlag: "AM",
    reopenCloseFlag: "AN",
    reassignFlag: "AO"
  }
};

```

## 4. メインメニュー機能詳細仕様

### 4.1 Dashboard（ダッシュボード）

#### 4.1.1 概要と目的
ダッシュボードは、自分が担当する全ケースの検索・閲覧・管理を行うメイン画面です。
Case Statusタブで「Assigned（アクティブ）」「Solution Offered」「Finished」「All」を切り替えて表示でき、過去ケースの検索やReOpen操作も可能です。

#### 4.1.2 検索・フィルター機能（画面上部）

**検索バー:**
- **Case ID検索**: 主要な検索機能。Case IDを入力して特定のケースを検索
- **検索対象**: Final Assigneeが自分のLdapであるすべてのケース（全ステータス、全シート）
- **リアルタイム検索**: 入力中に候補を表示
- **完全一致・部分一致**: 両方に対応

**フィルターオプション（検索バーと同じ行に配置）:**

1. **Sheet Type（複数選択可）:**
   - OT Email
   - 3PO Email
   - OT Chat
   - 3PO Chat
   - OT Phone
   - 3PO Phone
   - デフォルト: 全シート選択

2. **Date Range:**
   - Quarterly（四半期）: 2025-Q4、2025-Q3等
   - Monthly（月次）: 2025-11、2025-10等
   - Weekly（週次）: Week 45、Week 44等
   - Daily（日次）: 2025/11/06、2025/11/05等
   - デフォルト: 当月（Monthly）

3. **Segment Filter:**
   - Platinum
   - Titanium LCS
   - Gold LCS
   - Gold GCS
   - Silver
   - Bronze
   - デフォルト: 全セグメント

#### 4.1.3 Case Statusタブ（検索バー直下）

タブで以下の4つのステータスを切り替え表示：

| タブ | 表示内容 | 主な用途 |
|------|---------|---------|
| **Assigned** | Case Status = "Assigned"のケース | アクティブケースの管理 |
| **Solution Offered** | Case Status = "Solution Offered"のケース | 顧客返信待ちケースの確認・ReOpen |
| **Finished** | Case Status = "Finished"のケース | 完了ケースの確認・ReOpen |
| **All** | すべてのステータスのケース | 全体俯瞰 |

**デフォルト表示**: Assignedタブ

#### 4.1.4 リアルタイムタイマー表示

- **IRT Timer**: Internal Resolution Time の残り時間をHH:MM:SS形式でカウントダウン表示
- **クライアントサイド計算**: JavaScriptで1秒ごとに更新（サーバー負荷なし）
- **色分け警告システム**:
  - 🟢 緑（normal）: 残り24時間以上
  - 🟡 黄（warning）: 残り2～24時間
  - 🔴 赤（critical）: 残り2時間以下（点滅アニメーション）
  - ⚫ グレー（missed）: 期限切れ（"MISSED"表示）

#### 4.1.5 ケースカード表示

各ケースカードには以下の情報を表示：

```
┌────────────────────────────────────────────────────────────┐
│ [シートバッジ:OT Email] [チャネルアイコン:📧]                │
│ Case ID: X-XXXXXXXXXXXXX                                   │
│ Assignee: username(Ldap)                                   │
│ Segment: Gold LCS | Category: Search                       │
│ Status: Assigned 　　　　　　　　　                          │
│ IRT Timer: 08:15:30 🟢                                     │
│ Exclusions: [Bug✓] [L2] [T&S] [PayReq]                    │
│                                      [ReOpen][Edit][Delete]│
└────────────────────────────────────────────────────────────┘
```

**シート別カラーコーディング:**

| シート | カラー | アイコン |
|--------|--------|----------|
| OT Email | #4285F4 (Google Blue) | 📧 |
| 3PO Email | #34A853 (Google Green) | 📧 |
| OT Chat | #FBBC05 (Google Yellow) | 💬 |
| 3PO Chat | #EA4335 (Google Red) | 💬 |
| OT Phone | #8430CE (Google Purple) | 📞 |
| 3PO Phone | #F57C00 (Google Orange) | 📞 |

#### 4.1.6 インタラクション機能

**ケースカード操作:**
- **カードクリック**: ケースの詳細情報をモーダルで表示
- **Editボタン**: ケース情報の編集モーダルを開く
- **Deleteボタン**: ケースを削除（確認ダイアログ付き）
- **ReOpenボタン**: Solution Offered/Finishedステータスのケースに表示。クリックでReOpenモーダルを開く

**ReOpen機能詳細:**

1. **表示条件**: Case Status = "Solution Offered" または "Finished"
2. **ReOpenボタンクリック**: モーダルダイアログが表示
3. **モーダル内容**:
   ```
   ┌────────────────────────────────────┐
   │ ReOpen Case: X-XXXXXXXXXXXXX       │
   ├────────────────────────────────────┤
   │ ReOpen Date: [2025/11/06] (今日)   │
   │ ReOpen Time: [14:30:00] (現在時刻) │
   │                                    │
   │       [Cancel]  [Confirm ReOpen]   │
   └────────────────────────────────────┘
   ```
4. **Confirm ReOpenクリック時の処理**:
   - Case Statusを「Assigned」に変更
   - IRT RAW dataシートのReOpen History JSONに新規エントリを追加
   - Status History JSONに新規エントリを追加
   - IRTタイマー再開
   - 元の6シートのCase Status列も「Assigned」に更新
   - ReOpen後は自動的にAssignedタブに表示

**IRT Exclusions切り替え:**
- 各Exclusionチェックボックスをクリックで ON/OFF 切り替え
- チェック ON: IRT SLA計算から除外（グレーアウト表示）
- リアルタイムでIRT RAW dataシートに反映

**自動更新:**
- タイマー: 1秒間隔で更新（クライアントサイド）
- ケースリスト: 1分間隔で自動リフレッシュ

### 4.2 My Cases（マイケース）

#### 4.2.1 概要と目的
現在アクティブな自分のケース（Assigned状態）のみを集中的に管理する画面です。
日常的なケース処理業務に特化し、シンプルで高速なインターフェースを提供します。

**重要**: Solution OfferedやFinishedステータスのケースは表示されません。これらのケースの確認・ReOpenは**Dashboardの検索機能**をご利用ください。

#### 4.2.2 表示機能

**表示対象:**
- **Case Status = "Assigned"** のケースのみ
- **Final Assignee = 自分のLdap** であるケース
- **全6シート**からのケースを統合表示

**ソート機能:**
- **デフォルト**: IRT Timerの残り時間順（緊急度順）
  - 残り時間が少ないケースほど上位に表示
- **その他のソート**:
  - Case Open Date（新しい順/古い順）
  - Segment（Platinum → Bronze順）
  - Sheet Type（OT Email → 3PO Phone順）

**フィルター機能:**
- **シート別**: 特定のシートのケースのみ表示
- **セグメント別**: Platinum/Titanium LCS/Gold LCS等でフィルタリング
- **製品カテゴリ別**: Search/Display/Video等でフィルタリング
- **緊急度別**:
  - Critical（残り2時間以下）
  - Warning（残り2～24時間）
  - Normal（残り24時間以上）

**リアルタイム更新:**
- **IRTタイマー**: 1秒ごとに更新（クライアントサイド）
- **ケースリスト**: 1分ごとに自動リフレッシュ
- **新規ケース**: 自動的にリストに追加

#### 4.2.3 ケースカード表示

Dashboardと同じカード形式で表示：

```
┌────────────────────────────────────────────────────────────┐
│ [OT Email 📧] [🔴 Critical: 01:45:30 remaining]            │
│ Case ID: X-XXXXXXXXXXXXX                                   │
│ Segment: Platinum | Product: Search | Sub: P-MAX          │
│ Opened: 2025/11/04 10:30  (2日前)                          │
│ Exclusions: [Bug] [L2] [T&S✓] [PayReq]                    │
│                                           [Edit] [Details] │
└────────────────────────────────────────────────────────────┘
```

**緊急度による視覚的区別:**
- 🔴 Critical: 赤色背景 + 点滅アニメーション
- 🟡 Warning: 黄色背景
- 🟢 Normal: 白色背景

**ReOpenケースの識別:**
- ReOpenされたケースには「🔄 RO」ラベルを表示
- ReOpen回数も表示（例: 「🔄 RO x2」）

#### 4.2.4 ケース管理機能

**基本操作:**
- **カードクリック**: 詳細モーダル表示
- **Editボタン**: ケース編集モーダル
- **Detailsボタン**: 全履歴・詳細情報表示

**一括操作（複数選択時）:**
- **ステータス変更**: 選択したケースを一括で"Solution Offered"に変更
- **Exclusion設定**: 選択したケースに一括でBug/L2等のフラグを設定
- **エクスポート**: 選択したケースをCSV形式でエクスポート

**クイック統計表示（画面上部）:**
```
┌────────────────────────────────────────────────────────────┐
│ 📊 My Active Cases Summary                                │
│ Total: 15 | 🔴 Critical: 3 | 🟡 Warning: 5 | 🟢 Normal: 7 │
│ Avg IRT Remaining: 18.5h | SLA On Track: 86.7%            │
└────────────────────────────────────────────────────────────┘
```

### 4.3 Create Case（ケース作成）

#### 4.3.1 概要と目的
新規ケースを作成するための専用フォーム画面です。
シート選択により動的にフォームが変化し、適切なデータ入力を支援します。
なるべくキーボード操作での効率的なケース管理を支援します。

#### 4.3.2 シート選択機能
- **動的フォーム生成**: 選択したシートに応じてフィールドが変化
- **シート別必須項目**: 各シートの要求に応じた必須フィールド設定
- **3PO特有フィールド**: 3POシート選択時に "Issue Category" と "Details" フィールドを表示
- **チャネル別デフォルト**: 
  - Email: "OT Email" または "3PO Email"
  - Chat: "OT Chat" または "3PO Chat"
  - Phone: "OT Phone" または "3PO Phone"

#### 4.3.3 入力支援機能
- **ドロップダウン選択**: Incoming Segment、Product Category、Issue Categoryの選択
- **日付時間ピッカー**: Case Open Date/Timeの正確な入力
- **自動入力**: ユーザー名（Ldap）、Case Open Date/Time（現在時刻）の自動入力設定
- **リアルタイム検証**: 入力中のフィールド検証とエラー表示
- **キーボードショートカット**: フォーム内のフィールド間移動をTabキーで行えるように設定
- **必須フィールドとOptionalフィールドを区別して表示**:
  - 必須フィールドは赤いアスタリスク（*）を表示
  - Optionalフィールドはグレーアウト表示
- **入力例の表示**: 各フィールドに入力例をツールチップで表示
- **フィールドの自動フォーカス**: フォーム表示時に最初の必須フィールドに自動でフォーカスを当てる
 
#### 4.3.4 IRT除外ケース設定
除外対象ケースの設定機能（セグメントに応じて表示）：

**全セグメント共通**:
- Bug Case (Blocked by) フラグ
- L2 Consulted フラグ

**Billing セグメント特有**:
- IDT Blocked by フラグ
- Payreq Blocked by フラグ

**Policy セグメント特有**:
- T&S Consulted フラグ

#### 4.3.5 Create Case フォームレイアウト
```
┌────────────────────────────────────────────────────────────────────┐
│ [Target Sheet *:セレクトボックス]                                     │
│ [Case ID *] [Case Status *]                                        │
│ [Case Open Date *] [Case Open Time *]                              │
│ [Incoming Segment *]  [Final Segment *]                            │
│ [1st Assignee *] [Final Assignee *]                                │
│ 1：[Product Category *] [Sub Category *] [Issue Category *]        │
│ 2：[Product Category *] [Issue Category *] [Details *]             │
│                                                                    │
│ Optional:                                                          │
│ 1：[Bug / L2] 2：[Bug / L2 / T&S / Payreq]                          │
│ [Triage] [AM Initiated] [Is 3.0] [MCC] [Change to Child]           │
│ [AM Transfer] [non NCC]                                            │
│ [1st Close Date] [1st Close Time]                                  │
└────────────────────────────────────────────────────────────────────┘
```
### フォームフィールド説明
- 1：OT Email, OT Chat, OT Phone シート用のフィールド
  - [Product Category *] [Sub Category *] [Issue Category *] 
  - [Bug / L2]
- 2：3PO Email, 3PO Chat, 3PO Phone シート用のフィールド
  - [Product Category *] [Issue Category *] [Details *]
  - [Bug / L2 / T&S / Payreq]

#### 4.3.6 共通フィールド定義（全シート）

| フィールド名 | フィールドタイプ | 選択肢/形式 | デフォルト値 | 必須 |
|-------------|-----------------|------------|-------------|------|
| Case ID | 入力フォーム | X-XXXXXXXXXXXXX (Xは任意の数字) | - | ✓ |
| Case Status | セレクトボックス | Assigned, Solution Offered, Finished | Assigned | ✓ |
| Case Open Date | 日付入力 | YYYY/MM/DD | 今日 | ✓ |
| Case Open Time | 時間入力 | HH:MM:SS | 現在時刻 | ✓ |
| Incoming Segment | セレクトボックス | Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High | Gold | ✓ |
| Final Segment | セレクトボックス | Platinum, Titanium, Gold, Silver, Bronze - Low, Bronze - High | Incoming Segmentで選択したものを反映 | ✓ |
| 1st Assignee | 入力フォーム | Ldap@Google.com | Ldap | ✓ |
| Final Assignee | 入力フォーム | Ldap@Google.com | Ldap | ✓ |
| Product Category | セレクトボックス | Search, Display, Video, Commerce, Apps, M&A, Policy, Billing, Other |  | ✓ |
| Triage | チェックボックス | 0/1 | 0 | - |
| AM Initiated | チェックボックス | 0/1 | 0 | - |
| Is 3.0 | チェックボックス | 0/1 | 0 | - |
| MCC | チェックボックス | 0/1 | 0 | - |
| Change to Child | チェックボックス | 0/1 | 0 | - |
| AM Transfer | セレクトボックス | Request to AM contact, Optimize request, β product inquiry, Trouble shooting scope but we don't have access to the resource, Tag team request (LCS customer), Data analysis, Allowlist request, Other | - | - |
| non NCC | セレクトボックス | Duplicate, Discard, Transfer to Platinum, Transfer to S/B, Transfer to TDCX, Transfer to 3PO, Transfer to OT, Transfer to EN Team, Transfer to GMB Team, Transfer to Other Team (not AM) | - | - |
| 1st Close Date | 日付入力 | YYYY/MM/DD | 今日 | - |
| 1st Close Time | 時間入力 | HH:MM:SS | 現在時刻 | - |

### OTシート特有フィールド（OT Email, OT Chat, OT Phone）

| フィールド名 | フィールドタイプ | 選択肢/形式 | デフォルト値 | 必須 |
|-------------|-----------------|------------|-------------|------|
| Sub Category | セレクトボックス | Search, P-MAX, Display, Demand Gen, Video, Apps, M&A, Other | - | - |
| Issue Category | セレクトボックス | Search 仕様・機能, Search レポート, Search カスタムテスト・バリエーション, 無効なクリックの調査, 自動化ルール, Search その他, P-MAX 配信関連, P-MAX 仕様・機能, P-MAX レポート, P-MAX カスタムテスト・バリエーション, 除外 KW 追加依頼, P-MAX その他, Display 仕様・機能, Display 配信状況, 動的リマーケティング広告・ビジネスデータフィード, 「ウェブサイトを訪れたユーザー」のデータセグメント, 顧客リスト, データセグメントの共有, シームカービングのオプトアウト, Display レポート, Display 3PAS 関連, Display その他, Demand Gen 仕様・機能, Demand Gen 配信関連, オーディエンス, BLS, Demand Gen レポート, Demand Gen 3PAS 関連, Demand Gen その他, Video 仕様・機能, Video 配信状況, YouTube ユーザーセグメント, BLS (ブランドリフト調査)/SLS (検索数の増加測定), Video レポート, Video 3PAS 関連, Video その他, MCM, Apps 配信関連, Apps 仕様・機能, Apps レポート, コンバージョン, 除外設定・オプトアウト依頼, フィードを使用したアプリキャンペーン, アプリキャンペーン以外のコンバージョン (Appify), アプリユーザーへのリマーケティング, Apps その他, Ads CV の計測, Ads CV のレポート, GA4 CV の計測, GA4 レポート, GA4 CV と Ads CV の乖離, OCI レポート乖離, OCI エラー, 拡張コンバージョン, リードの拡張コンバージョン, Google タグ, GTM を使用した Ads リマーケティング設定, GA4 からインポートしたオーディエンス, M&Aその他, パートナープログラム, エディタ, 本人確認, UI 操作・エラー, Ads 権限付与, GW・年末年始, Other その他 | - | - |

#### 4.5.1 OTシートのSub Categoryに応じたIssue Categoryの選択肢
- **Search**：Search 仕様・機能, Search レポート, Search カスタムテスト・バリエーション, 無効なクリックの調査, 自動化ルール, Search その他
- **P-MAX**：P-MAX 配信関連, P-MAX 仕様・機能, P-MAX レポート, P-MAX カスタムテスト・バリエーション, 除外 KW 追加依頼, P-MAX その他
- **Display**：Display 仕様・機能, Display 配信状況, 動的リマーケティング広告・ビジネスデータフィード, 「ウェブサイトを訪れたユーザー」のデータセグメント, 顧客リスト, データセグメントの共有, シームカービングのオプトアウト, Display レポート, Display 3PAS 関連, Display その他
- **Demand Gen**：Demand Gen 仕様・機能, Demand Gen 配信関連, オーディエンス, BLS, Demand Gen レポート, Demand Gen 3PAS 関連, Demand Gen その他
- **Video**：Video 仕様・機能, Video 配信状況, YouTube ユーザーセグメント, BLS (ブランドリフト調査)/SLS (検索数の増加測定), Video レポート, Video 3PAS 関連, Video その他
- **Apps**：Apps 配信関連, Apps 仕様・機能, Apps レポート, コンバージョン, 除外設定・オプトアウト依頼, フィードを使用したアプリキャンペーン, アプリキャンペーン以外のコンバージョン (Appify), アプリユーザーへのリマーケティング, Apps その他
- **M&A**：Ads CV の計測, Ads CV のレポート, GA4 CV の計測, GA4 レポート, GA4 CV と Ads CV の乖離, OCI レポート乖離, OCI エラー, 拡張コンバージョン, リードの拡張コンバージョン, Google タグ, GTM を使用した Ads リマーケティング設定, GA4 からインポートしたオーディエンス, M&Aその他
- **Other**：パートナープログラム, エディタ, 本人確認, UI 操作・エラー, Ads 権限付与, GW・年末年始, Other その他

### 3POシート特有フィールド（3PO Email, 3PO Chat, 3PO Phone）

| フィールド名 | フィールドタイプ | 選択肢/形式 | デフォルト値 | 必須 |
|-------------|-----------------|------------|-------------|------|
| Issue Category | セレクトボックス | Review, TM form, Trademarks issue, Under Review, Certificate, Suspend, AIV, GQ, OOS, CBT, LC creation, PP link, PP update, Payment user change, CL increase/decrease, IDT/ Bmod, LCS billing policy, Self-serve issue, Unidentified Charge, CBT Flow, Bulk CBT, Promotion code, Refund, Invoice issue, Account budget, Cost discrepancy, BO | - | - |
| Details | セレクトボックス（入力して部分一致検索あり） | 不適切な価格設定 / 許可されないビジネス手法, 誤解を招く広告のデザイン, 信頼できない文言, 操作されたメディア, 誤解を招く表現, ビジネス名の要件, 許可されないビジネス, 関連性が不明確, 法的要件, 不適切なリンク先, リンク先の利便性, アクセスできないリンク先, クロールできないリンク先, 機能していないリンク先, 確認できないアプリ, 広告グループ 1 つにつき 1 つのウェブサイト, 未確認の電話番号, 広告文に記載された電話番号, サポートされていない言語, 利用できない動画, 許可されない動画フォーマット, 画像の品質, 第四者呼び出し, 使用できない URL, 第三者配信の要件, 許可されない電話番号, 許可されないスクリプト, HTML5, 画像アセットのフォーマットの要件, アプリやウェブストアに関するポリシー違反, 危険な商品やサービス, 危険または中傷的なコンテンツ, 露骨な性的コンテンツ, デリケートな事象, 報酬を伴う性的行為, 児童への性的虐待の画像, 危険ドラッグ, 衝撃的なコンテンツ, その他の武器および兵器, 爆発物, 銃、銃部品、関連商品, 美白製品の宣伝, 国際結婚の斡旋, 動物への残虐行為, 不正入手された政治的資料, 暗号通貨, 個人ローン, 金融商品およびサービスについての情報開示, バイナリー オプション, 投機目的の複雑な金融商品, 広告主の適格性確認, 商標 / 再販業者と情報サイト, 不正なソフトウェア, 広告掲載システムの回避, 不当な手段による利益の獲得, 独自コンテンツの不足, ウェブマスター向けガイドライン, 性的なコンテンツ / 一部制限付きのカテゴリ, 性的なコンテンツ / 厳しく制限されるカテゴリ, ポルノ, 句読点と記号, 不明なビジネス, 会社名の要件, 大文字, 許可されないスペース, スタイルと表現, 広告機能の不正使用, 重複表現, 高脂肪、高塩分、高糖分の食品および飲料に関する広告, 政府発行書類と公的サービス, イベント チケットの販売, 第三者による消費者向けテクニカル サポート, サポートされていないビジネス, 無料のPC ソフトウェア, ローカル サービス, 保釈金立替サービス, 消費者勧告, 電話番号案内サービス、通話転送サービス、通話録音サービス, 信仰（パーソナライズド広告の場合）, 13 歳未満のユーザー（パーソナライズド広告の場合）, 虐待や心的外傷（パーソナライズド広告の場合）, 部分的なヌード, 人間関係における困難（パーソナライズド広告の場合）, 厳しい経済状況（パーソナライズド広告の場合）, 健康（パーソナライズド広告の場合）, 機会へのアクセス（住居 / 求人 / クレジット）, 強制停止, インタラクティブ要素の暗示, わかりにくいテキスト, 否定的な出来事, テキストまたはグラフィックのオーバーレイ, コラージュ, ぼやけた画像や不鮮明な画像, 切り抜き方に問題がある画像, 乱れた画像, 空白の多すぎる画像, アルコール / タバコ, ビジネスオペレーションの適格性, クローキング, 著作権, オフライン・オンラインギャンブル, ソーシャルカジノ, 処方薬、市販薬, 制限付き医療コンテンツ, 制限付き薬物に関するキーワード, 不承認の薬物, 依存症関連サービス, 実証されていない試験的な医療、細胞治療、遺伝子治療, 避妊, 中絶, 臨床試験の被験者募集, HIV 家庭用検査キット, 不正な支払い、, フィッシング, 政治に関するコンテンツ, その他, リンク先のエクスペリエンス, クリックベイト, 空白のクリエイティブ, 不適切なコンテンツ, よくない出来事, 人種や民族（パーソナライズド広告の場合）, オンライン マッチング, マイナス思考の強制(パーソナライズド広告の場合), 禁止カテゴリ, 禁止コンテンツ, 不正行為を助長する商品やサービス, 利用できない特典, ビジネスの名前が不適切, ビジネスのロゴが不適切, 金融サービスの適格性確認, リスト　クローズ, ブランドリフト調査, 不正使用されているサイト, サードパーティーポリシーに関する要件, コンテンツ　ポリシーに基づく自動化, 画像に含まれる行動を促すフレーズの要素, クレジット回復サービス, アクセスが制限されている動画, アルゼンチンの政治広告, クリックトラッカー, 日本の日付証明書, 債務関連サービス, 見出しと説明の要件, カジノ以外のオンラインゲーム, 動画コンテンツの変更, 勤務先, DSL, 出会い系関連の禁止事項, PP name, Address, Declined payment, Credit statement, Collections, Invoice GQ, 出会い系とコンパニオンサービス, ビジネス名の視認性の高さ, 関連性のない名前, 関連性のないロゴ, ロゴの視認性の高さ, ビジネスオペレーションの適格性確認, YTCQ - 不適切なコンテンツ, YTCQ - 誇張表現や不正確な表現, YTCQ - ネガティブな出来事および画像, ビジネスのロゴが不鮮明, イメージ広告におけるアニメーション | - | - |


## データ追加・更新機能仕様（NEW）

### 新規ケース追加処理フロー

```javascript
const CaseAdditionSpec = {
  // 基本設定
  insertPosition: "lastRow",              // 常に最終行に追加
  skipHeaderRows: 2,                      // ヘッダー行をスキップ
  duplicateCheck: true,                   // Case ID重複チェック
  transactional: true,                    // トランザクション処理
  
  // 処理順序
  processFlow: [
    "validateInput",                      // 入力データ検証
    "checkDuplicates",                   // 重複チェック
    "calculateFields",                   // 自動計算フィールド
    "insertData",                        // データ挿入
    "updateFormulas",                    // 数式更新
    "validateResult"                     // 結果検証
  ]
};
```

### データ挿入位置の決定ロジック

```javascript
function getInsertRowPosition(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  
  // ヘッダー行（1-2行目）をスキップして最終行の次に追加
  const insertRow = Math.max(lastRow + 1, 3); // 最低でも3行目から
  
  return {
    insertRow: insertRow,
    lastDataRow: lastRow,
    hasData: lastRow >= 3
  };
}
```

### 重複チェック機能

```javascript
const DuplicateCheckSpec = {
  // チェック対象
  checkFields: ["caseId"],                // Case IDでの重複チェック
  searchScope: "entireSheet",             // シート全体を検索
  caseSensitive: false,                   // 大文字小文字を区別しない
  
  // エラー処理
  onDuplicate: {
    action: "reject",                     // 重複時は追加を拒否
    showDialog: true,                     // エラーダイアログ表示
    suggestAlternative: true              // 代替案を提示
  },
  
  // パフォーマンス
  batchCheck: true,                       // バッチ処理でチェック
  cacheResults: true                      // 結果をキャッシュ
};
```

### 自動計算フィールド処理

```javascript
const AutoCalculatedFields = {
  // 即座に計算されるフィールド
  immediate: [
    {
      field: "date",
      formula: () => new Date().toLocaleDateString("ja-JP")
    },
    {
      field: "caseLink",
      formula: (caseId) => `=HYPERLINK("https://cases.connect.corp.google.com/#/case/${caseId}", "${caseId}")`
    },
    {
      field: "assignWeek", 
      formula: (openDate) => `=WEEKNUM("${openDate}")`
    },
    {
      field: "channel",
      value: (sheetName) => {
        if (sheetName.includes("Email")) return "Email";
        if (sheetName.includes("Chat")) return "Chat";
        if (sheetName.includes("Phone")) return "Phone";
      }
    }
  ],
  
  // リアルタイム計算フィールド（数式として設定）
  realtime: [
    {
      field: "trtTimer",
      formula: (openDate, openTime) => `=IF(AND(${openDate}<>"", ${openTime}<>""), NOW()-${openDate}-${openTime}, "")`
    },
    {
      field: "agingTimer", 
      formula: (openDate, openTime) => `=IF(AND(${openDate}<>"", ${openTime}<>""), NOW()-${openDate}-${openTime}, "")`
    },
    {
      field: "trtTarget",
      formula: (channel) => {
        return channel === "Email" ? 
          `=IF(${channel}="Email", 1.5, 0.33)` : // 36時間 or 8時間
          `=IF(${channel}="Email", 1.5, 0.33)`;
      }
    },
    {
      field: "agingTarget",
      formula: () => `=3` // 固定3日（72時間）
    }
  ]
};
```

### データ整合性検証

```javascript
const DataValidationSpec = {
  // 必須フィールド検証
  requiredFields: {
    all: ["caseId", "caseOpenDate", "caseOpenTime", "incomingSegment", "productCategory", "firstAssignee", "caseStatus"],
    "3PO": ["issueCategory"] // 3POシートの追加必須フィールド
  },
  
  // フォーマット検証
  formatValidation: {
    caseId: /^\d-\d{13}$/,                 // 任意の数字-で始まる13桁の数字
    caseOpenDate: /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    caseOpenTime: /^\d{2}:\d{2}:\d{2}$/,   // HH:MM:SS
    firstAssignee: /^[a-zA-Z0-9._-]+$/     // LDAP ID形式
  },
  
  // 値の範囲検証
  valueValidation: {
    incomingSegment: ["Gold", "Platinum", "Titanium", "Silver", "Bronze - Low", "Bronze - High"],
    productCategory: ["Search", "Display", "Video", "Commerce", "Apps", "M&A", "Policy", "Billing", "Other"],
    caseStatus: ["Assigned", "Solution Offered", "Finished"]
  }
};
```

### エラーハンドリング・ロールバック機能

```javascript
const ErrorHandlingSpec = {
  // エラータイプ別処理
  errorTypes: {
    validation: {
      action: "showErrors",               // エラー詳細を表示
      allowPartialSave: false             // 部分保存は不可
    },
    duplicate: {
      action: "showDialog",               // 確認ダイアログ
      options: ["overwrite", "cancel", "edit"] // 選択肢提示
    },
    permission: {
      action: "redirect",                 // 権限エラー時は適切な画面に誘導
      message: "スプレッドシートへの書き込み権限がありません"
    },
    network: {
      action: "retry",                    // ネットワークエラー時は再試行
      maxRetries: 3,
      backoffInterval: 1000               // 1秒間隔で再試行
    }
  },
  
  // ロールバック機能
  rollback: {
    enabled: true,                        // ロールバック有効
    saveSnapshot: true,                   // 変更前スナップショット保存
    timeoutMs: 30000,                     // 30秒でタイムアウト
    
    // ロールバック条件
    conditions: [
      "formulaError",                     // 数式エラー
      "dataCorruption",                   // データ破損検出
      "incompleteInsert"                  // 不完全な挿入
    ]
  }
};
```

### バッチ処理・パフォーマンス最適化

```javascript
const PerformanceOptimization = {
  // バッチ処理
  batchOperations: {
    enabled: true,
    maxBatchSize: 100,                    // 最大100行まで一括処理
    batchInterval: 500,                   // 500ms間隔
    
    // バッチ対象操作
    operations: [
      "dataInsertion",                    // データ挿入
      "formulaUpdate",                    // 数式更新
      "formatApply"                       // 書式適用
    ]
  },
  
  // キャッシュ戦略
  caching: {
    sheetData: {
      ttl: 300000,                        // 5分間キャッシュ
      maxSize: 1000                       // 最大1000行
    },
    validationResults: {
      ttl: 600000,                        // 10分間キャッシュ
      maxSize: 500
    }
  },
  
  // 非同期処理
  async: {
    enableAsync: true,                    // 非同期処理有効
    progressCallback: true,               // 進捗コールバック
    chunkSize: 50                         // 50行ずつ処理
  }
};
```

### 監査ログ・操作履歴

```javascript
const AuditLogSpec = {
  // ログ対象操作
  loggedOperations: [
    "caseInsert",                         // ケース追加
    "caseUpdate",                         // ケース更新
    "caseDelete",                         // ケース削除
    "statusChange",                       // ステータス変更
    "assigneeChange"                      // 担当者変更
  ],
  
  // ログ項目
  logFields: {
    timestamp: "操作日時",
    userId: "操作者LDAP ID",
    operation: "操作種別", 
    sheetName: "対象シート",
    caseId: "ケースID",
    changedFields: "変更フィールド",
    oldValues: "変更前値",
    newValues: "変更後値",
    ipAddress: "IPアドレス",
    userAgent: "ユーザーエージェント"
  },
  
  // ログ保存先
  storage: {
    location: "AuditLog",                 // 専用シート
    retention: "12months",                // 12ヶ月保持
    compression: true,                    // ログ圧縮
    encryption: true                      // ログ暗号化
  }
};
```

#### 4.3.7 Live Mode対応
- **別ウィンドウ表示**: ポップアップウィンドウでの独立動作
- **リアルタイム同期**: メインダッシュボードとの自動同期
- **ウィンドウサイズ記憶**: ユーザー設定のウィンドウサイズ保持

### 4.4 Analytics（統計分析）

#### 4.4.1 概要と目的
チーム全体およびユーザー個人のパフォーマンス分析を行う統計機能です。**2025年Q4以降のIRT (Internal Resolution Time)** メトリックに完全対応し、**Rewardターゲット達成**を最優先目標とした評価システムを提供します。

**2025年最先端の可視化技術**を採用し、Google Charts、ApexCharts、EChartsを組み合わせたインタラクティブなダッシュボードで、データ分析を革新的に効率化します。

#### 4.4.2 メイン統計機能（showReports）

**期間選択機能**:
- **Daily**: 日次データの表示
- **Weekly**: 週次データの表示
- **Monthly**: 月次データの表示
- **Quarterly**: 四半期データの表示
- **カスタム期間**: 開始日と終了日を指定した任意期間

**IRT (Internal Resolution Time)メトリック**（最重要指標 - 2025年Q4～）:

**📊 IRT達成率の計算方法:**

```javascript
IRT達成率 = (IRT <= 72時間のケース数) / (Solution Offeredケース総数) × 100

【分母】Case Status = "Solution Offered" のケース
  - 除外ケースは含めない（Bug、L2 Consult、PayReq、Invoice Dispute、Workdriver、T&S Team）
  - Final Assignee = 評価対象者のLdap（個人評価の場合）
  - 評価セグメント = Final Segment × Sales Channel（チーム評価の場合）

【分子】上記のうち IRT <= 72時間のケース

【評価対象期間】指定された期間内にCase Status = "Solution Offered" になったケース
```

**GAS実装例:**
```javascript
function calculateIRTAchievement(ldap, startDate, endDate, segment = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['OT Email', '3PO Email', 'OT Chat', '3PO Chat', 'OT Phone', '3PO Phone'];

  let totalCases = 0;      // 分母
  let achievedCases = 0;   // 分子

  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();

    for (let i = 2; i < data.length; i++) { // ヘッダースキップ
      const row = data[i];
      const caseData = parseRowData(row, sheetName);

      // 1. Case Status = "Solution Offered" チェック
      if (caseData.caseStatus !== 'Solution Offered') continue;

      // 2. 期間内チェック
      const closeDate = new Date(caseData.firstCloseDate);
      if (closeDate < startDate || closeDate > endDate) continue;

      // 3. 個人評価: Final Assignee チェック
      if (ldap && caseData.finalAssignee !== ldap) continue;

      // 4. チーム評価: セグメントチェック
      if (segment) {
        const evalSegment = getEvaluationSegment(caseData).evaluationSegment;
        if (evalSegment !== segment) continue;
      }

      // 5. 除外ケースチェック
      if (isExcludedCase(caseData)) continue;

      // ここまで通過したケースは分母にカウント
      totalCases++;

      // 6. IRT <= 72時間チェック
      const irtData = calculateIRT(caseData);
      if (irtData.withinSLA) {
        achievedCases++;
      }
    }
  });

  const achievementRate = totalCases > 0 ? (achievedCases / totalCases) * 100 : 0;

  return {
    achievementRate: achievementRate,
    achievedCases: achievedCases,
    totalCases: totalCases,
    missedCases: totalCases - achievedCases
  };
}

// NCC Achievement Alert計算（Rewardターゲット達成に必要なNCC件数）
function calculateNCCAlert(achievedCases, totalCases, evaluationSegment) {
  // 評価セグメントのRewardターゲット取得
  const slaTargets = {
    'Platinum': { reward: 98.0 },
    'Titanium LCS': { reward: 97.0 },
    'Gold LCS': { reward: 97.0 },
    'Gold GCS': { reward: 96.0 },
    'Silver': { reward: 91.0 },
    'Bronze': { reward: 87.0 }
  };

  const rewardTarget = slaTargets[evaluationSegment]?.reward || 0;
  const currentRate = totalCases > 0 ? (achievedCases / totalCases) * 100 : 0;

  // すでにReward達成している場合
  if (currentRate >= rewardTarget) {
    return {
      message: `✅ 現在 ${currentRate.toFixed(1)}%で、Rewardターゲット ${rewardTarget}%を達成しています！`,
      casesNeeded: 0,
      targetRate: rewardTarget,
      currentRate: currentRate,
      achieved: true
    };
  }

  // 必要なNCC件数を計算
  // 公式: (achievedCases + x) / (totalCases + x) = rewardTarget / 100
  // 解くと: x = (rewardTarget * totalCases - achievedCases * 100) / (100 - rewardTarget)
  const casesNeeded = Math.ceil(
    (rewardTarget * totalCases - achievedCases * 100) / (100 - rewardTarget)
  );

  return {
    message: `📊 現在 ${currentRate.toFixed(1)}%なので、個人/チーム全体であと${casesNeeded}件のNCC獲得(In-IRT)でSLA ${rewardTarget}%達成です`,
    casesNeeded: casesNeeded,
    targetRate: rewardTarget,
    currentRate: currentRate,
    achieved: false
  };
}

// 除外ケース判定
function isExcludedCase(caseData) {
  // Bug / L2 Consult / PayReq / Invoice Dispute / Workdriver / T&S Team
  if (caseData.bugL2TSPayreq === 1) return true; // Bug / L2 / T&S / Payreq チェックボックス
  // その他の除外条件...
  return false;
}
```

**個人評価レポートとチーム評価レポートの違い:**

| 項目 | 個人評価 | チーム評価（セグメント別） |
|------|---------|--------------------------|
| フィルター条件 | Final Assignee = 自分のLdap | 評価セグメント（Final Segment × Sales Channel） |
| 表示内容 | 個人のIRT達成率、処理件数 | セグメント別IRT達成率、Reward目標達成判定 |
| 目的 | 個人パフォーマンス把握 | チーム全体のSLA Reward達成状況把握 |
| 評価基準 | Rewardターゲット到達を主目標 | Rewardターゲット到達を主目標 |

- **除外ケース管理**: Bug、L2 Consult、PayReq、Invoice Dispute、Workdriver、T&S Teamの除外処理
- **セグメント別分析**: Platinum/Titanium LCS/Gold LCS/Gold GCS/Silver/Bronze別の達成率と**Rewardターゲット**比較
- **チャネル別分析**: Email/Chat/Phone別の達成率
- **IRT vs TRT比較**: SO期間の影響を可視化

**その他のメトリック**:
- **Total Cases**: 総ケース数
- **Solution Offered**: 解決提案済みケース数
- **NCC (Non-Contact Complete)**: 算出条件に基づく自動計算
- **SLA Achievement Rate**: SLA達成率（セグメント別**Rewardターゲット**と比較、Penaltyは参考値として表示）
- **Average IRT**: 平均IRT処理時間
- **Average SO Duration**: 平均SO期間（顧客待ち時間）
- **Reopen Rate**: 再オープン率
- **First Response Time**: 初回応答時間

**評価表示の優先順位**:
1. **Reward達成**: 達成率 ≥ Rewardターゲット → 緑色で強調表示
2. **Reward未達・Penalty達成**: Penaltyターゲット ≤ 達成率 < Rewardターゲット → 黄色で注意表示
3. **Penalty未達**: 達成率 < Penaltyターゲット → 赤色で警告表示

**NCC Achievement Alert（常時表示）**:

Analytics画面に常に表示されるリアルタイムアラート機能：

```javascript
// 使用例
const irtResult = calculateIRTAchievement(ldap, startDate, endDate, segment);
const segmentInfo = getEvaluationSegment(caseData);
const alert = calculateNCCAlert(
  irtResult.achievedCases,
  irtResult.totalCases,
  segmentInfo.evaluationSegment
);

// alert.message を画面上部に常時表示
// 例: "📊 現在 94.2%なので、個人/チーム全体であと12件のNCC獲得(In-IRT)でSLA 96.0%達成です"
```

**表示仕様**:
- **位置**: Analytics画面の最上部、目立つ位置に固定表示
- **更新頻度**: ケース処理/ステータス変更時にリアルタイム更新
- **表示色**:
  - Reward達成時: 緑色背景 + ✅アイコン
  - 未達成時: 青色背景 + 📊アイコン
- **フォントサイズ**: 18px（通常テキストより大きく）
- **アニメーション**: 新規NCC獲得時に軽くハイライト

#### 4.4.3 統計分析機能の詳細

**NCC計算ロジック（2025年Q4最新版）**:

**NCC (Non-Contact Complete) の定義:**
- **個人の生産性を示す重要指標**: ケースを顧客からの追加コンタクトなしで完了できたことを示す
- **カウント条件**: 以下の両方を満たすケース

```javascript
function isNCC(caseData) {
  // 条件1: Case StatusがSolution OfferedまたはFinished
  const validStatus = ['Solution Offered', 'Finished'].includes(caseData.caseStatus);

  // 条件2: non NCC列が空欄
  const nonNCCEmpty = !caseData.nonNCC || caseData.nonNCC === '';

  // NCCと判定
  const isNCC = validStatus && nonNCCEmpty;

  return isNCC;
}
```

**重要な注意点:**

1. **Bug列のチェック状態は NCCカウントに影響しない**
   - Bug列にチェックが入っていてもNCCとしてカウントされる
   - ただし、IRT SLA計算からは除外される（下記参照）

2. **NCCとIRT SLA除外の関係:**

```javascript
// ケース例A: Bug列✓、non NCC空欄、Status = "Solution Offered"
{
  bugL2: 1,  // チェックあり
  nonNCC: "",
  caseStatus: "Solution Offered"
}
→ NCC = YES（カウントされる）
→ IRT SLA計算 = NO（除外される）← Bugフラグのため

// ケース例B: Bug列なし、non NCC空欄、Status = "Solution Offered"
{
  bugL2: 0,  // チェックなし
  nonNCC: "",
  caseStatus: "Solution Offered"
}
→ NCC = YES（カウントされる）
→ IRT SLA計算 = YES（含まれる）

// ケース例C: Bug列なし、non NCC = "Duplicate"、Status = "Solution Offered"
{
  bugL2: 0,
  nonNCC: "Duplicate",
  caseStatus: "Solution Offered"
}
→ NCC = NO（カウントされない）← non NCCに値あり
→ IRT SLA計算 = N/A（NCCでないので対象外）
```

**非NCCの理由（non NCC列の値）:**
- Duplicate（重複ケース）
- Discard（破棄）
- Transfer to Platinum/S/B/TDCX/3PO/OT/EN Team/GMB Team/Other Team
- 上記いずれかの値が入っている場合はNCCではない
```

**IRT計算ロジック (GAS実装) - 2025Q4完全版**:

**重要**: この関数は**IRT RAW dataシート (2.7) から直接データを取得**します。複数回ReOpenに完全対応するため、6シートの列データ（firstCloseDate, reopenCloseDate）は使用しません。

```javascript
function calculateIRT(caseId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const irtSheet = ss.getSheetByName('IRT RAW data');

  if (!irtSheet) {
    throw new Error('IRT RAW data シートが見つかりません');
  }

  // IRT RAW dataシートから該当ケースを検索
  const irtData = irtSheet.getDataRange().getValues();
  const headerRow = irtData[0];
  const caseIdCol = headerRow.indexOf('Case ID');

  let irtRow = null;
  for (let i = 1; i < irtData.length; i++) {
    if (irtData[i][caseIdCol] === caseId) {
      irtRow = irtData[i];
      break;
    }
  }

  if (!irtRow) {
    throw new Error(`Case ID ${caseId} がIRT RAW dataシートに見つかりません`);
  }

  // 列インデックスを取得
  const caseOpenDateTimeCol = headerRow.indexOf('Case Open DateTime');
  const reopenHistoryJsonCol = headerRow.indexOf('ReOpen History JSON');
  const currentStatusCol = headerRow.indexOf('Current Status');
  const irtHoursCol = headerRow.indexOf('IRT Hours');
  const irtRemainingHoursCol = headerRow.indexOf('IRT Remaining Hours');
  const withinSLACol = headerRow.indexOf('Within SLA');
  const urgencyLevelCol = headerRow.indexOf('Urgency Level');

  // Case Open DateTimeをパース
  const caseOpenDateTime = new Date(irtRow[caseOpenDateTimeCol]);

  // 現在時刻または最終クローズ時刻を取得
  const currentStatus = irtRow[currentStatusCol];
  let finalDateTime;

  if (currentStatus === 'Solution Offered' || currentStatus === 'Finished') {
    // クローズ済み: IRT RAW dataシートのIRT Hours列の値を使用
    const storedIRTHours = irtRow[irtHoursCol];
    const storedIRTRemaining = irtRow[irtRemainingHoursCol];
    const storedWithinSLA = irtRow[withinSLACol];
    const storedUrgencyLevel = irtRow[urgencyLevelCol];

    return {
      irt: storedIRTHours,
      irtRemaining: storedIRTRemaining,
      irtRemainingFormatted: formatTime(storedIRTRemaining),
      withinSLA: storedWithinSLA,
      urgencyLevel: storedUrgencyLevel,
      isFinal: true  // 確定値であることを示す
    };
  } else {
    // Assigned状態: リアルタイム計算
    finalDateTime = new Date(); // 現在時刻
  }

  // TRT（総経過時間）を計算
  const trtHours = (finalDateTime - caseOpenDateTime) / (1000 * 60 * 60);

  // ReOpen History JSONから合計SO期間を取得
  let totalSOPeriodHours = 0;
  const reopenHistoryJson = irtRow[reopenHistoryJsonCol];

  if (reopenHistoryJson && reopenHistoryJson !== '') {
    try {
      const reopenHistory = JSON.parse(reopenHistoryJson);
      totalSOPeriodHours = reopenHistory.totalSOPeriodHours || 0;

      // 現在SO状態の場合、最新のSO期間を追加
      if (currentStatus === 'Solution Offered' && reopenHistory.reopens && reopenHistory.reopens.length > 0) {
        const lastReopen = reopenHistory.reopens[reopenHistory.reopens.length - 1];
        if (lastReopen.soDateTime && !lastReopen.reopenDateTime) {
          // 最新のSOからの経過時間を追加
          const lastSODateTime = new Date(lastReopen.soDateTime);
          const currentSOPeriod = (new Date() - lastSODateTime) / (1000 * 60 * 60);
          totalSOPeriodHours += currentSOPeriod;
        }
      }
    } catch (e) {
      Logger.log(`Case ${caseId}: ReOpen History JSONのパースエラー - ${e.message}`);
      totalSOPeriodHours = 0;
    }
  }

  // IRT = TRT - 合計SO期間（複数回ReOpen対応）
  const irtHours = trtHours - totalSOPeriodHours;

  // IRT残り時間 = 72時間 - IRT経過時間
  const irtRemainingHours = 72 - irtHours;

  // SLA達成判定
  const withinSLA = irtHours <= 72;

  // 緊急度レベルの判定
  const urgencyLevel = getUrgencyLevel(irtRemainingHours);

  return {
    irt: irtHours,
    irtRemaining: irtRemainingHours,
    irtRemainingFormatted: formatTime(irtRemainingHours),
    trt: trtHours,
    totalSOPeriod: totalSOPeriodHours,
    withinSLA: withinSLA,
    urgencyLevel: urgencyLevel,
    isFinal: false  // リアルタイム計算値
  };
}

// 残り時間をHH:MM:SS形式にフォーマット
function formatTime(hours) {
  if (hours < 0) return "MISSED";

  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 緊急度レベルの判定
function getUrgencyLevel(irtRemaining) {
  if (irtRemaining < 0) return 'missed';      // グレー（期限切れ）
  if (irtRemaining <= 2) return 'critical';   // 赤（2時間以下）
  if (irtRemaining <= 24) return 'warning';   // 黄（24時間以下）
  return 'normal';                            // 緑（十分な時間）
}
```

**シート別分析**:
- 6つのシート個別の統計
- シート間の比較分析
- チャネル横断分析
- OT vs 3PO パフォーマンス比較

**可視化機能（最先端チャートライブラリ活用）**:

🎨 **推奨チャートライブラリ（2025年最新トレンド）**:

1. **Google Charts**（ネイティブ統合）
   - GAS完全統合、無料、レスポンシブ対応
   - スプレッドシートデータへの直接アクセス

2. **ApexCharts**（モダン・インタラクティブ）
   - リアルタイムデータ更新対応
   - 滑らかなアニメーション
   - ズーム・パン機能
   - モバイルフレンドリー

3. **ECharts**（大規模データ対応）
   - 高パフォーマンス（数千ポイント対応）
   - 高度な可視化（ヒートマップ・平行座標）
   - 組み込みパフォーマンス最適化

**実装チャート一覧**:

📊 **1. リアルタイムIRTトレンドチャート**（ApexCharts Area Chart）
- 時系列でのIRT推移を可視化
- 72時間SLAラインの表示
- セグメント別の色分け
- ズーム・パン対応

📈 **2. セグメント別パフォーマンスヒートマップ**（ECharts Heatmap）
- 曜日 × セグメント の達成率マトリクス
- 色グラデーションで一目で把握
- インタラクティブなツールチップ

🥧 **3. 製品カテゴリ分布**（Google Charts Donut Chart）
- Search/Display/Video/Apps等の割合
- アニメーション付き
- レスポンシブデザイン

📊 **4. チャネル別比較**（ApexCharts Mixed Chart）
- Email/Chat/Phone の件数（棒グラフ）
- IRT達成率（折れ線グラフ）
- 2軸表示で相関関係を可視化

🕷️ **5. チームパフォーマンスレーダーチャート**（ApexCharts Radar）
- IRT達成率、NCC率、品質スコア等を多角的に評価
- 複数チームの比較表示

📉 **6. IRT vs TRT 比較チャート**（ApexCharts Line Chart）
- IRTとTRTの差分を可視化
- SO期間の影響を明確化

💹 **7. リアルタイムKPIカード**
- IRT達成率、平均IRT、SLA達成率等
- スパークライン付き
- 前週比・前月比の変化表示

**実装サンプル（GAS HTML Service）**:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- ApexCharts CDN -->
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <!-- Google Charts API -->
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <!-- ECharts CDN -->
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>

  <style>
    .analytics-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .chart-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .chart-card:hover {
      transform: translateY(-5px);
    }

    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }

    .kpi-value {
      font-size: 48px;
      font-weight: 700;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  </style>
</head>
<body>
  <div class="analytics-dashboard">
    <!-- KPI Cards -->
    <div class="kpi-card">
      <div class="kpi-label">IRT Achievement</div>
      <div class="kpi-value" id="irtAchievement">96.5%</div>
      <div class="kpi-trend">↑ 2.3% from last week</div>
    </div>

    <!-- Charts -->
    <div class="chart-card"><div id="irtTrendChart"></div></div>
    <div class="chart-card"><div id="segmentHeatmap"></div></div>
    <div class="chart-card"><div id="productPieChart"></div></div>
    <div class="chart-card"><div id="channelBarChart"></div></div>
    <div class="chart-card"><div id="teamRadarChart"></div></div>
  </div>

  <script>
    // GASからデータを取得
    google.script.run
      .withSuccessHandler(renderCharts)
      .getAnalyticsData();

    function renderCharts(data) {
      // ApexCharts, Google Charts, EChartsを使用して描画
      // 詳細な実装はセクション4.4.5参照
    }
  </script>
</body>
</html>
```

#### 4.4.4 Sentiment Score管理（showReports内オプション）

**基本仕様**:
- **評価範囲**: 1.0 - 10.0（0.5刻み）
- **管理単位**: 月次
- **編集権限**: 本人分のみ編集可能（当月のみ）
- **表示権限**: 本人分のみ表示可能

**UI設計**:
```html
<!-- Reports画面内のSentiment Score編集セクション -->
<div class="sentiment-section" style="margin-top: 20px;">
  <h4>Monthly Sentiment Score</h4>
  <div class="sentiment-input">
    <label>2025年5月のSentiment Score:</label>
    <input type="number" min="1" max="10" step="0.5" value="5.0">
    <button>Save</button>
  </div>
  <div class="sentiment-history">
    <h5>過去のスコア履歴:</h5>
    <ul>
      <li>2025年4月: 7.5</li>
      <li>2025年3月: 8.0</li>
    </ul>
  </div>
</div>
```

#### 4.4.5 最先端チャート詳細実装（GAS対応）

このセクションでは、Analytics機能で使用する各チャートの詳細な実装例を提供します。全てGoogle Apps Script（HTML Service）で動作します。

**📊 1. リアルタイムIRTトレンドチャート（ApexCharts）**

```javascript
// GAS側: データ取得関数
function getIRTTrendData(startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['OT Email', '3PO Email', 'OT Chat', '3PO Chat', 'OT Phone', '3PO Phone'];

  let trendData = [];

  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();

    // IRT計算とデータ集約
    // ...実装詳細
  });

  return trendData;
}

// HTML Service側: チャート描画
const irtTrendOptions = {
  chart: {
    type: 'area',
    height: 350,
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      }
    }
  },
  series: [{
    name: 'Average IRT',
    data: [] // GASから取得したデータ
  }],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeFormatter: {
        year: 'yyyy',
        month: "MMM 'yy",
        day: 'dd MMM',
        hour: 'HH:mm'
      }
    }
  },
  yaxis: {
    title: {
      text: 'IRT (hours)'
    },
    max: 72,
    labels: {
      formatter: function(val) {
        return val.toFixed(1) + 'h';
      }
    }
  },
  annotations: {
    yaxis: [{
      y: 72,
      borderColor: '#FF4560',
      label: {
        borderColor: '#FF4560',
        style: {
          color: '#fff',
          background: '#FF4560'
        },
        text: 'SLA Target (72h)'
      }
    }]
  },
  tooltip: {
    shared: true,
    x: {
      format: 'dd MMM yyyy'
    }
  },
  colors: ['#667eea']
};

const irtTrendChart = new ApexCharts(
  document.querySelector("#irtTrendChart"),
  irtTrendOptions
);
irtTrendChart.render();
```

**📈 2. セグメント別パフォーマンスヒートマップ（ECharts）**

```javascript
// GAS側: ヒートマップデータ生成
function getSegmentHeatmapData() {
  const segments = ['Platinum', 'Titanium', 'Gold', 'Silver', 'Bronze'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  let heatmapData = [];

  // 各セグメント×曜日の達成率を計算
  segments.forEach((segment, segmentIdx) => {
    days.forEach((day, dayIdx) => {
      const achievement = calculateSegmentDayAchievement(segment, day);
      heatmapData.push([dayIdx, segmentIdx, achievement]);
    });
  });

  return heatmapData;
}

// HTML Service側: EChartsヒートマップ
const heatmapDom = document.getElementById('segmentHeatmap');
const heatmapChart = echarts.init(heatmapDom);

const heatmapOption = {
  title: {
    text: 'Segment Performance by Day of Week',
    left: 'center'
  },
  tooltip: {
    position: 'top',
    formatter: function(params) {
      return `${days[params.value[0]]} - ${segments[params.value[1]]}<br/>Achievement: ${params.value[2]}%`;
    }
  },
  grid: {
    height: '60%',
    top: '15%'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    splitArea: {
      show: true
    }
  },
  yAxis: {
    type: 'category',
    data: ['Platinum', 'Titanium', 'Gold', 'Silver', 'Bronze'],
    splitArea: {
      show: true
    }
  },
  visualMap: {
    min: 80,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '10%',
    inRange: {
      color: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850']
    }
  },
  series: [{
    name: 'IRT Achievement',
    type: 'heatmap',
    data: [], // GASから取得
    label: {
      show: true,
      formatter: function(params) {
        return params.value[2] + '%';
      }
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
};

heatmapChart.setOption(heatmapOption);

// レスポンシブ対応
window.addEventListener('resize', function() {
  heatmapChart.resize();
});
```

**🥧 3. 製品カテゴリ分布（Google Charts）**

```javascript
// GAS側: 製品カテゴリ集計
function getProductCategoryData() {
  const categories = {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 全シートから製品カテゴリを集計
  // ...実装詳細

  return Object.entries(categories);
}

// HTML Service側: Google Charts Donut
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawProductPieChart);

function drawProductPieChart() {
  google.script.run
    .withSuccessHandler(function(data) {
      const chartData = new google.visualization.DataTable();
      chartData.addColumn('string', 'Product');
      chartData.addColumn('number', 'Cases');
      chartData.addRows(data);

      const options = {
        title: 'Product Category Distribution',
        pieHole: 0.4,
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'],
        legend: {
          position: 'bottom',
          alignment: 'center'
        },
        chartArea: {
          width: '90%',
          height: '75%'
        },
        animation: {
          startup: true,
          duration: 1000,
          easing: 'out'
        },
        tooltip: {
          text: 'percentage'
        }
      };

      const chart = new google.visualization.PieChart(
        document.getElementById('productPieChart')
      );
      chart.draw(chartData, options);
    })
    .getProductCategoryData();
}
```

**📊 4. チャネル別比較（ApexCharts Mixed Chart）**

```javascript
const channelOptions = {
  chart: {
    type: 'line',
    height: 350,
    stacked: false
  },
  series: [{
    name: 'Email Cases',
    type: 'column',
    data: [] // GASから取得
  }, {
    name: 'Chat Cases',
    type: 'column',
    data: []
  }, {
    name: 'Phone Cases',
    type: 'column',
    data: []
  }, {
    name: 'IRT Achievement %',
    type: 'line',
    data: []
  }],
  stroke: {
    width: [0, 0, 0, 4],
    curve: 'smooth'
  },
  plotOptions: {
    bar: {
      columnWidth: '50%'
    }
  },
  fill: {
    opacity: [0.85, 0.85, 0.85, 1],
    gradient: {
      inverseColors: false,
      shade: 'light',
      type: "vertical",
      opacityFrom: 0.85,
      opacityTo: 0.55,
      stops: [0, 100, 100, 100]
    }
  },
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
  markers: {
    size: 0
  },
  xaxis: {
    type: 'category'
  },
  yaxis: [{
    title: {
      text: 'Number of Cases'
    },
    seriesName: 'Email Cases'
  }, {
    opposite: true,
    title: {
      text: 'Achievement %'
    },
    seriesName: 'IRT Achievement %',
    min: 80,
    max: 100
  }],
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (y, { seriesIndex }) {
        if (seriesIndex === 3) {
          return y.toFixed(1) + "%";
        }
        return y + " cases";
      }
    }
  },
  colors: ['#667eea', '#764ba2', '#f093fb', '#00E396']
};
```

**🕷️ 5. チームパフォーマンスレーダーチャート（ApexCharts）**

```javascript
const radarOptions = {
  chart: {
    type: 'radar',
    height: 400,
    dropShadow: {
      enabled: true,
      blur: 1,
      left: 1,
      top: 1
    }
  },
  series: [{
    name: 'Team A',
    data: [80, 90, 70, 85, 95, 88]
  }, {
    name: 'Team B',
    data: [85, 75, 90, 80, 70, 82]
  }],
  title: {
    text: 'Team Performance Comparison',
    align: 'center'
  },
  labels: [
    'IRT Achievement',
    'NCC Rate',
    'Response Time',
    'Quality Score',
    'Customer Satisfaction',
    'Reopen Rate'
  ],
  plotOptions: {
    radar: {
      size: 140,
      polygons: {
        strokeColors: '#e9e9e9',
        strokeWidth: 1,
        fill: {
          colors: ['#f8f8f8', '#fff']
        }
      }
    }
  },
  colors: ['#667eea', '#764ba2'],
  markers: {
    size: 4,
    colors: ['#fff'],
    strokeColor: ['#667eea', '#764ba2'],
    strokeWidth: 2
  },
  tooltip: {
    y: {
      formatter: function(val) {
        return val.toFixed(1) + '%';
      }
    }
  },
  yaxis: {
    tickAmount: 5,
    min: 0,
    max: 100
  }
};
```

**💹 6. リアルタイムKPIカード with Sparklines**

```html
<div class="kpi-grid">
  <div class="kpi-card animated">
    <div class="kpi-icon">🎯</div>
    <div class="kpi-label">IRT Achievement</div>
    <div class="kpi-value gradient-text" id="irtAchievement">96.8%</div>
    <div id="irtSparkline" class="sparkline"></div>
    <div class="kpi-change positive">
      <span class="arrow">↑</span>
      <span class="value">2.3%</span>
      <span class="period">vs last week</span>
    </div>
  </div>

  <div class="kpi-card animated">
    <div class="kpi-icon">⚡</div>
    <div class="kpi-label">Avg IRT</div>
    <div class="kpi-value gradient-text" id="avgIRT">34.2h</div>
    <div id="avgIrtSparkline" class="sparkline"></div>
    <div class="kpi-change negative">
      <span class="arrow">↓</span>
      <span class="value">4.8h</span>
      <span class="period">vs last week</span>
    </div>
  </div>

  <div class="kpi-card animated">
    <div class="kpi-icon">📊</div>
    <div class="kpi-label">Total Cases</div>
    <div class="kpi-value gradient-text" id="totalCases">1,247</div>
    <div id="totalSparkline" class="sparkline"></div>
    <div class="kpi-change positive">
      <span class="arrow">↑</span>
      <span class="value">127</span>
      <span class="period">vs last week</span>
    </div>
  </div>
</div>

<style>
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .kpi-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kpi-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  }

  .kpi-card.animated {
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .kpi-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .kpi-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .kpi-value {
    font-size: 40px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sparkline {
    height: 40px;
    margin: 12px 0;
  }

  .kpi-change {
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .kpi-change.positive {
    color: #10b981;
  }

  .kpi-change.negative {
    color: #ef4444;
  }

  .kpi-change .arrow {
    font-size: 18px;
    font-weight: bold;
  }

  .kpi-change .value {
    font-weight: 600;
  }

  .kpi-change .period {
    color: #999;
    font-size: 12px;
  }
</style>

<script>
// ApexCharts Sparkline
const sparklineOptions = {
  chart: {
    type: 'area',
    height: 40,
    sparkline: {
      enabled: true
    }
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    opacity: 0.3,
  },
  colors: ['#667eea'],
  tooltip: {
    fixed: {
      enabled: false
    },
    x: {
      show: false
    },
    y: {
      title: {
        formatter: function() {
          return '';
        }
      }
    }
  }
};

// Sparkline描画
const irtSparkline = new ApexCharts(
  document.querySelector("#irtSparkline"),
  {
    ...sparklineOptions,
    series: [{
      data: [85, 88, 92, 89, 94, 96, 96.8]
    }]
  }
);
irtSparkline.render();
</script>
```

**🔄 7. リアルタイム自動更新機能**

```javascript
// GAS側: 定期データ更新
let updateInterval;

function startRealtimeUpdates(intervalSeconds = 30) {
  updateInterval = setInterval(() => {
    google.script.run
      .withSuccessHandler(updateAllCharts)
      .getLatestAnalyticsData();
  }, intervalSeconds * 1000);
}

function stopRealtimeUpdates() {
  clearInterval(updateInterval);
}

function updateAllCharts(data) {
  // 全チャートを最新データで更新
  irtTrendChart.updateSeries([{
    data: data.irtTrend
  }]);

  heatmapChart.setOption({
    series: [{
      data: data.heatmap
    }]
  });

  // KPIカードの値も更新（アニメーション付き）
  animateValue('irtAchievement', data.irtAchievement);
  animateValue('avgIRT', data.avgIRT);
  animateValue('totalCases', data.totalCases);
}

// 数値アニメーション
function animateValue(id, endValue, duration = 1000) {
  const element = document.getElementById(id);
  const startValue = parseFloat(element.textContent) || 0;
  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const current = startValue + (endValue - startValue) * easeOutCubic(progress);
    element.textContent = current.toFixed(1);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
```

**📤 8. データエクスポート機能**

```javascript
// GAS側: エクスポート機能
function exportAnalyticsToPDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const charts = ss.getSheets()[0].getCharts();

  const pdfBlobs = charts.map(chart => {
    return chart.getAs('image/png');
  });

  // PDFに変換してGoogle Driveに保存
  const pdfFile = DriveApp.createFile(
    'Analytics_Report_' + new Date().toISOString() + '.pdf'
  );

  return pdfFile.getUrl();
}

// HTML Service側: エクスポートボタン
function handleExport() {
  google.script.run
    .withSuccessHandler(function(url) {
      window.open(url, '_blank');
    })
    .exportAnalyticsToPDF();
}
```

### 4.5 Search（検索）

**注意**: Search機能は主に**Dashboard (4.1.2)** に統合されています。このセクションはDashboard検索機能の詳細仕様です。

#### 4.5.1 概要と目的
全シートを対象とした統合検索機能です。Case IDによる即座検索と、詳細条件による絞り込み検索を提供します。

#### 4.5.2 検索機能
- **Case ID検索**: 即座検索（autocomplete対応）
- **担当者検索**: Ldap名での検索
- **日付範囲検索**: 期間指定での検索
- **ステータス検索**: 複数ステータスでの絞り込み
- **シート横断検索**: 全6シートを対象とした統合検索

#### 4.5.3 検索結果表示
- **結果リスト**: シート別カラーコーディング
- **詳細表示**: 検索結果からの直接詳細表示
- **編集機能**: 検索結果からの直接編集
- **エクスポート**: 検索結果のCSVエクスポート

### 4.6 Settings（設定）

#### 4.6.1 概要と目的
システム全体の設定とカスタマイズを行う管理画面です。
スプレッドシート接続、ユーザー設定、システム設定を統合管理します。

#### 4.6.2 スプレッドシート設定（現在初期設定画面（CasesDash Setup）が表示する仕様になってしまっているので廃止して、こちらで設定する仕様にしたい。）
- **スプレッドシートID入力**: 接続対象スプレッドシートの指定
- **接続テスト**: スプレッドシートとの接続確認
- **シート検証**: 6つのシートの存在と構造確認
- **権限確認**: 読み取り/書き込み権限の確認

**スプレッドシート設定UI**:
```html
<div class="spreadsheet-settings">
  <h3>Spreadsheet Configuration</h3>
  <div class="input-group">
    <label>Spreadsheet ID:</label>
    <input type="text" id="spreadsheetId" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms">
    <button onclick="testConnection()">Test Connection</button>
  </div>
  <div class="status-display">
    <div class="connection-status">Status: <span id="connection-status">Not Connected</span></div>
    <div class="sheets-validation">
      <h4>Sheet Validation:</h4>
      <ul id="sheet-validation-list">
        <li>OT Email: <span class="status pending">Checking...</span></li>
        <li>3PO Email: <span class="status pending">Checking...</span></li>
        <li>OT Chat: <span class="status pending">Checking...</span></li>
        <li>3PO Chat: <span class="status pending">Checking...</span></li>
        <li>OT Phone: <span class="status pending">Checking...</span></li>
        <li>3PO Phone: <span class="status pending">Checking...</span></li>
      </ul>
    </div>
  </div>
</div>
```

#### 4.6.3 UI設定
- **テーマ切り替え**: ダークモード / ライトモード
- **表示言語**: UI言語の選択（日本語/英語）
- **タイムゾーン**: 時間表示のタイムゾーン設定
- **通知設定**: Gmail通知の有効/無効

#### 4.6.4 チーム設定
- **チームリーダー設定**: IRTアラート通知先の設定（担当者とチームリーダーの紐付け）
- **Gmail通知設定**: 通知先メールアドレス、通知閾値、デフォルト通知先の設定（詳細は 7. Gmail通知システム 参照）
- **通知条件**: アラート送信条件の詳細設定


### 4.7 User Profile（ユーザープロファイル）

#### 4.7.1 概要と目的
ユーザー認証とプロファイル管理を行う機能です。Google認証による安全なログインと、個人設定の管理を提供します。

#### 4.7.2 認証機能
- **Google OAuth認証**: セキュアなGoogleアカウント認証
- **Ldap情報取得**: 社内Ldap情報の自動取得
- **権限レベル管理**: 一般ユーザー/チームリーダー/管理者の権限分離（チームリーダー/管理者はUI側で設定するのではなく、バックエンド側で登録したメールアドレスに基づいて自動で判断し、）
- **セッション管理**: 自動ログアウトとセッション継続

#### 4.7.3 プロファイル表示
```html
<div class="user-profile-modal">
  <h3>User Profile</h3>
  <div class="profile-info">
    <div class="avatar">
      <img src="user-avatar-url" alt="User Avatar">
    </div>
    <div class="user-details">
      <p><strong>Name:</strong> <span id="user-name">tanaka</span></p>
      <p><strong>LDAP:</strong> <span id="user-ldap">tanaka@google.com</span></p>
      <p><strong>Team:</strong> <span id="user-team">Support Team A</span></p>
      <p><strong>Role:</strong> <span id="user-role">Team Member</span></p>
      <p><strong>Join Date:</strong> <span id="join-date">2024-01-15</span></p>
    </div>
  </div>
  <div class="personal-settings">
    <h4>Personal Settings</h4>
    <div class="setting-item">
      <label>Language Preference:</label>
      <select id="language-select">
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </div>
    <div class="setting-item">
      <label>Timezone:</label>
      <select id="timezone-select">
        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
        <option value="UTC">UTC</option>
      </select>
    </div>
  </div>
</div>
```

## 検索・フィルター機能

### 基本検索

- **全シート統合検索**: すべてのシートを対象
- **シート指定検索**: 特定シートのみ
- **ケースID検索**: 即座に該当ケースを表示
- **担当者検索**: Ldapによる検索
- **ステータス検索**: ケースステータス別

### 高度なフィルター

| フィルター項目 | タイプ | 選択肢 |
|---------------|-------|--------|
| Sheet | マルチセレクト | 6つのシート |
| Channel | マルチセレクト | Email, Chat, Phone |
| Case Type | マルチセレクト | OT, 3PO |
| Segment | マルチセレクト | Platinum, Titanium, Gold, Silver, Bronze |
| Category | マルチセレクト | Search, Display, Video等 |
| Case Status | マルチセレクト | Assigned, Solution Offered, Finished |
| SLA Status | マルチセレクト | 正常, 警告（3時間未満）, 違反 |


### 5.1 統計分析機能のアクセス制御仕様

#### 5.1.1 ユーザー別データ表示権限

```javascript
const UserDataAccessControl = {
  // 基本原則：本人データのみ表示
  dataVisibility: {
    ownData: "full",           // 本人データ：全項目表示可能
    othersData: "restricted",  // 他者データ：制限あり
    aggregatedData: "allowed"  // 集計データ：匿名化された全体統計のみ
  },
  
  // 表示可能データの詳細
  allowedViews: {
    selfOnly: [
      "Cases by Assignee (Own)",
      "NCC by Assignee (Own)", 
      "SLA Achievement by Assignee (Own)",
      "Personal Performance Trend",
      "Own Monthly Sentiment Score"
    ],
    
    aggregatedOnly: [
      "Team Average Performance",
      "Overall SLA Achievement Rate",
      "Total Cases Distribution",
      "Channel Usage Statistics"
    ],
    
    restricted: [
      "Individual Performance Comparison", // 管理者権限のみ
      "Other Users' Case Details",        // アクセス不可
      "Personal Sentiment Scores"         // 本人のみ
    ]
  }
};
```

#### 5.1.2 権限レベル別機能制限

| 権限レベル | 本人データ | 他者個人データ | 集計データ | Sentiment編集 |
|------------|------------|---------------|------------|---------------|
| **一般ユーザー** | ✅ 全表示 | ❌ 非表示 | ✅ 匿名集計のみ | ✅ 本人分のみ |
| **チームリーダー** | ✅ 全表示 | ✅ チームメンバーのみ | ✅ チーム集計 | ✅ チームメンバー分 |
| **管理者** | ✅ 全表示 | ✅ 全ユーザー | ✅ 全集計 | ✅ 全ユーザー分 |

## 6. IRT (Internal Resolution Time) メトリック管理システム

### 6.1 IRTの定義と重要性（2025年Q4～）

**重要変更: 2025年11月1日（Q4）より、TRT (Total Resolution Time) から IRT (Internal Resolution Time) に変更**

#### 6.1.1 IRTとは

IRTは、Googleから要求される最重要指標で、**TRTから「SO (Solution Offered) statusだった時間」を除外**した、実質的な内部対応時間を測定します。

**IRT計算式:**
```
IRT = (最終クローズ時刻 - ケース作成時刻) - SUM(Reopen時刻 - Solution Offered時刻)
```

**具体例:**
- TRT（従来の総解決時間）: 72時間
- SO期間（タイマー停止時間）: 44時間
- **算出されるIRT**: 72時間 - 44時間 = **28時間**

#### 6.1.2 IRTの利点

- **顧客起因の待ち時間を除外**: 顧客からの返信待ち（NeedInfo）や、Reopen待ち時間がカウントされない
- **純粋な内部対応時間の測定**: エージェント・チームの実際の処理時間を正確に評価
- **SLA達成の公平性向上**: 顧客側の遅延によるSLAミスが防げる

#### 6.1.3 SLAターゲット（Q4 2025）

**重要: IRT目標は全セグメントで3日間（72時間）に統一**

| セグメント | IRT目標 | Penalty (<) | Reward (>) |
|-----------|---------|-------------|------------|
| Platinum | 3 days | 97.0% | 98.0% |
| Titanium LCS | 3 days | 96.0% | 97.0% |
| Gold LCS | 3 days | 96.0% | 97.0% |
| Gold GCS | 3 days | 95.0% | 96.0% |
| Silver | 3 days | 90.0% | 91.0% |
| Bronze | 3 days | 86.0% | 87.0% |

#### 6.1.4 セグメント判定ロジック（Final Segment × Sales Channel）

**重要**: IRT評価に使用するセグメントは、スプレッドシート上の **Final Segment** と **Sales Channel** の値の組み合わせで判定されます。

**判定式:**
```javascript
評価セグメント = Final Segment + " " + Sales Channel

例：
- Final Segment: "Gold" + Sales Channel: "LCS" → "Gold LCS"
- Final Segment: "Gold" + Sales Channel: "GCS" → "Gold GCS"
- Final Segment: "Titanium" + Sales Channel: "LCS" → "Titanium LCS"
```

**GAS実装例:**
```javascript
function getEvaluationSegment(caseData) {
  const finalSegment = caseData.finalSegment; // Final Segment列の値
  const salesChannel = caseData.salesChannel; // Sales Channel列の値

  // セグメント判定
  let evaluationSegment;

  if (finalSegment === 'Platinum') {
    evaluationSegment = 'Platinum';
  } else if (finalSegment === 'Titanium' && salesChannel === 'LCS') {
    evaluationSegment = 'Titanium LCS';
  } else if (finalSegment === 'Gold' && salesChannel === 'LCS') {
    evaluationSegment = 'Gold LCS';
  } else if (finalSegment === 'Gold' && salesChannel === 'GCS') {
    evaluationSegment = 'Gold GCS';
  } else if (finalSegment === 'Silver') {
    evaluationSegment = 'Silver';
  } else if (finalSegment === 'Bronze') {
    evaluationSegment = 'Bronze';
  } else {
    evaluationSegment = 'Unknown';
  }

  // SLAターゲット取得
  const slaTargets = {
    'Platinum': { penalty: 97.0, reward: 98.0 },
    'Titanium LCS': { penalty: 96.0, reward: 97.0 },
    'Gold LCS': { penalty: 96.0, reward: 97.0 },
    'Gold GCS': { penalty: 95.0, reward: 96.0 },
    'Silver': { penalty: 90.0, reward: 91.0 },
    'Bronze': { penalty: 86.0, reward: 87.0 }
  };

  return {
    evaluationSegment: evaluationSegment,
    penaltyThreshold: slaTargets[evaluationSegment]?.penalty || 0,
    rewardThreshold: slaTargets[evaluationSegment]?.reward || 0
  };
}
```

**セグメント別SLA差異の例:**
```
同じ "Gold" でも Sales Channel によって異なる:
- Gold LCS: Penalty 96.0% / Reward 97.0%
- Gold GCS: Penalty 95.0% / Reward 96.0%  ← 1%低い
```

### 6.2 IRT算出対象から除外されるケース

#### 6.2.1 全セグメント共通の除外条件

1. **Bug**: ケースを「Bug」としてBlocked Byしたもの
2. **L2 Consult**: サポートチーム（L1）から L2 へ**Directで**エスカレーションされたケース
3. **PayReq (Payment Request)**: 「Payment Request ID」が発行され、Blocked byしたもの
4. **Invoice Dispute**: 「Invoice Dispute ID」が発行され、Blocked byしたもの
5. **Workdriver**: Neo Taxonomyの最後のWorkdriverが「Troubleshooting」**以外**に設定されたもの（例: Implementation など）
6. **T&S Team**: T&S (Trust & Safety) Teamにエスカレーションされたケース

#### 6.2.2 IRT算出に**含まれる**ケース（除外対象外）

⚠️ **重要**: 以下は除外対象に**なりません**
- L1S および L1R へのエスカレーション
- pSME へのエスカレーション
- L1S に上げた後、その L1S が L2 にエスカレーションしたケース

### 6.3 除外ケース設定UI

#### 6.3.1 Create New Case フォーム内の除外設定
```html
<div class="exclusion-settings">
  <h4>IRT Exclusion Settings</h4>

  <!-- 全セグメント共通 -->
  <div class="common-exclusions">
    <h5>Common Exclusions:</h5>
    <label>
      <input type="checkbox" name="bugBlocked" value="1">
      Bug (Blocked by)
    </label>
    <label>
      <input type="checkbox" name="l2Consult" value="1">
      L2 Consult (Direct Escalation)
    </label>
    <label>
      <input type="checkbox" name="payreqBlocked" value="1">
      PayReq (Payment Request)
    </label>
    <label>
      <input type="checkbox" name="invoiceDisputeBlocked" value="1">
      Invoice Dispute
    </label>
    <label>
      <input type="checkbox" name="workdriverNonTS" value="1">
      Workdriver (Non-Troubleshooting)
    </label>
    <label>
      <input type="checkbox" name="tsTeam" value="1">
      T&S Team Escalation
    </label>
  </div>

  <!-- 注意事項 -->
  <div class="exclusion-notes">
    <p><strong>⚠️ 注意:</strong> 以下はIRT算出に<strong>含まれます</strong>（除外されません）</p>
    <ul>
      <li>L1S / L1R エスカレーション</li>
      <li>pSME エスカレーション</li>
      <li>L1S経由のL2エスカレーション</li>
    </ul>
  </div>
</div>
```

#### 6.3.2 Case Edit モーダル内の除外設定
```html
<div class="case-edit-exclusions">
  <h4>Update IRT Exclusion Status</h4>
  <div class="exclusion-grid">
    <div class="exclusion-item">
      <label>Bug (Blocked by):</label>
      <input type="checkbox" id="edit-bug-blocked">
    </div>
    <div class="exclusion-item">
      <label>L2 Consult (Direct):</label>
      <input type="checkbox" id="edit-l2-consult">
    </div>
    <div class="exclusion-item">
      <label>PayReq:</label>
      <input type="checkbox" id="edit-payreq-blocked">
    </div>
    <div class="exclusion-item">
      <label>Invoice Dispute:</label>
      <input type="checkbox" id="edit-invoice-dispute">
    </div>
    <div class="exclusion-item">
      <label>Workdriver (Non-TS):</label>
      <input type="checkbox" id="edit-workdriver-nts">
    </div>
    <div class="exclusion-item">
      <label>T&S Team:</label>
      <input type="checkbox" id="edit-ts-team">
    </div>
  </div>
</div>
```

## 7. Gmail通知システム

**重要**: Google Chat Webhook作成はポリシー違反のため、Gmail通知を使用します。

### 7.1 概要と目的
IRTタイマーが2時間以下になったケースについて、該当ユーザーのチームリーダーにGmailで自動通知を送信します。GAS (Google Apps Script) の `MailApp.sendEmail()` または `GmailApp.sendEmail()` を使用します。

### 7.2 通知トリガー条件
- IRTタイマーが2時間（7200秒）以下になった時点
- IRT算出対象外ケース（除外ケース）は通知対象外
- Case Status が "Assigned" のケースのみ
- 既に通知済みのケースは重複通知しない
- **注意**: SO (Solution Offered) status中はタイマー停止中のため通知されない

### 7.3 通知内容と実装

#### 7.3.1 HTML形式メール
```javascript
/**
 * IRT警告メールを送信
 * @param {Object} caseData - ケースデータ
 * @param {string} teamLeaderEmail - チームリーダーのメールアドレス
 */
function sendIRTAlertEmail(caseData, teamLeaderEmail) {
  const subject = `⚠️ IRT Alert: ${caseData.caseId} - Immediate Action Required`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Google Sans', Roboto, Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ea4335; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px; }
        .label { font-weight: bold; color: #5f6368; }
        .value { color: #202124; margin-left: 10px; }
        .warning { background-color: #fef7e0; border-left: 4px solid #f9ab00; padding: 12px; margin: 15px 0; }
        .action-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #1a73e8;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">⚠️ IRT Timer Warning</h2>
          <p style="margin: 5px 0 0 0;">Immediate attention required</p>
        </div>
        <div class="content">
          <div class="warning">
            <strong>⚠️ Alert:</strong> IRT timer has fallen below 2 hours. Immediate action required to avoid SLA miss.
          </div>

          <div class="info-row">
            <span class="label">Assignee (LDAP):</span>
            <span class="value">${caseData.finalAssignee}</span>
          </div>

          <div class="info-row">
            <span class="label">Case ID:</span>
            <span class="value">${caseData.caseId}</span>
          </div>

          <div class="info-row">
            <span class="label">Sheet:</span>
            <span class="value">${caseData.sourceSheet}</span>
          </div>

          <div class="info-row">
            <span class="label">Segment:</span>
            <span class="value">${caseData.segment}</span>
          </div>

          <div class="info-row">
            <span class="label">IRT Remaining Time:</span>
            <span class="value" style="color: #ea4335; font-weight: bold;">${caseData.irtTimer}</span>
          </div>

          <div class="info-row">
            <span class="label">Case Status:</span>
            <span class="value">${caseData.caseStatus}</span>
          </div>

          <div class="info-row">
            <span class="label">Product Category:</span>
            <span class="value">${caseData.productCategory || 'N/A'}</span>
          </div>

          <a href="${PropertiesService.getScriptProperties().getProperty('APP_URL')}" class="action-button">
            Open CasesDash
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  const plainTextBody = `
⚠️ IRT ALERT - Immediate Action Required

Assignee: ${caseData.finalAssignee}
Case ID: ${caseData.caseId}
Sheet: ${caseData.sourceSheet}
Segment: ${caseData.segment}
IRT Remaining: ${caseData.irtTimer}
Status: ${caseData.caseStatus}

⚠️ IRT timer has fallen below 2 hours. Please take immediate action to avoid SLA miss.

Open CasesDash: ${PropertiesService.getScriptProperties().getProperty('APP_URL')}
  `;

  try {
    // GmailAppを使用（送信履歴がGmailに残る）
    GmailApp.sendEmail(
      teamLeaderEmail,
      subject,
      plainTextBody,
      {
        htmlBody: htmlBody,
        name: 'CasesDash IRT Alert System'
      }
    );

    // 通知ログを記録
    logNotification(caseData.caseId, teamLeaderEmail, 'IRT_ALERT_2H', 'SUCCESS');

  } catch (error) {
    Logger.log(`Failed to send IRT alert email: ${error}`);
    logNotification(caseData.caseId, teamLeaderEmail, 'IRT_ALERT_2H', 'FAILED', error.toString());
  }
}
```

#### 7.3.2 チームリーダーメールアドレス取得
```javascript
/**
 * ケース担当者のチームリーダーメールアドレスを取得
 * @param {string} assigneeLdap - 担当者のLDAP
 * @return {string} チームリーダーのメールアドレス
 */
function getTeamLeaderEmail(assigneeLdap) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName('Settings') || ss.getSheetByName('Configuration');

  // Settings/Configurationシートに「Team Structure」テーブルを想定
  // 列構成: A: Assignee LDAP, B: Team Leader Email, C: Team Name
  const data = settingsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === assigneeLdap) {
      return data[i][1]; // Team Leader Email
    }
  }

  // 見つからない場合はデフォルト通知先（例：PL/TL）
  return PropertiesService.getScriptProperties().getProperty('DEFAULT_TL_EMAIL');
}
```

### 7.4 通知設定管理

#### 7.4.1 Settings画面での設定項目
```html
<div class="notification-settings">
  <h3>Gmail通知設定</h3>

  <!-- 通知有効/無効 -->
  <div class="setting-row">
    <label>
      <input type="checkbox" id="irtAlertEnabled" checked>
      IRT警告メール通知を有効にする
    </label>
  </div>

  <!-- 通知閾値 -->
  <div class="setting-row">
    <label>通知閾値（時間）:</label>
    <input type="number" id="irtAlertThreshold" value="2" min="1" max="24">
    <span class="help-text">IRTタイマーがこの値以下になったときに通知</span>
  </div>

  <!-- デフォルト通知先 -->
  <div class="setting-row">
    <label>デフォルト通知先メールアドレス:</label>
    <input type="email" id="defaultTLEmail" placeholder="teamlead@google.com">
    <span class="help-text">担当者のTLが見つからない場合の通知先</span>
  </div>

  <!-- チーム構成設定 -->
  <div class="setting-row">
    <button onclick="openTeamStructureEditor()">チーム構成を編集</button>
    <span class="help-text">各担当者とチームリーダーの紐付けを設定</span>
  </div>

  <!-- テスト通知 -->
  <div class="setting-row">
    <button onclick="sendTestNotification()">テスト通知を送信</button>
  </div>
</div>
```

#### 7.4.2 通知ログ管理
```javascript
/**
 * 通知ログをスプレッドシートに記録
 */
function logNotification(caseId, recipient, notificationType, status, errorMsg = '') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName('Notification Log');

  if (!logSheet) {
    logSheet = ss.insertSheet('Notification Log');
    logSheet.appendRow(['Timestamp', 'Case ID', 'Recipient', 'Type', 'Status', 'Error']);
  }

  logSheet.appendRow([
    new Date(),
    caseId,
    recipient,
    notificationType,
    status,
    errorMsg
  ]);
}
```

### 7.5 定期実行トリガー設定

```javascript
/**
 * 1時間ごとにIRTをチェックし、2時間以下のケースに警告メールを送信
 */
function checkAndSendIRTAlerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const irtSheet = ss.getSheetByName('IRT RAW data');
  const data = irtSheet.getDataRange().getValues();

  // ヘッダー行をスキップ
  for (let i = 1; i < data.length; i++) {
    const caseId = data[i][0]; // A: Case ID
    const currentStatus = data[i][6]; // G: Current Status
    const irtRemainingHours = data[i][10]; // K: IRT Remaining Hours
    const lastNotified = data[i][14]; // O: Last Notified (想定)

    // 通知条件チェック
    if (currentStatus === 'Assigned' &&
        irtRemainingHours <= 2 &&
        irtRemainingHours > 0 &&
        !isRecentlyNotified(lastNotified)) {

      // ケース詳細を取得
      const caseData = getCaseDetails(caseId);

      // チームリーダーメール取得
      const tlEmail = getTeamLeaderEmail(caseData.finalAssignee);

      // メール送信
      sendIRTAlertEmail(caseData, tlEmail);

      // 最終通知時刻を更新
      irtSheet.getRange(i + 1, 15).setValue(new Date()); // O列
    }
  }
}

/**
 * 最近通知済みかチェック（6時間以内は再通知しない）
 */
function isRecentlyNotified(lastNotifiedDate) {
  if (!lastNotifiedDate) return false;
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  return new Date(lastNotifiedDate) > sixHoursAgo;
}
```

**トリガー設定手順**:
1. GASエディタで「トリガー」→「トリガーを追加」
2. 実行する関数: `checkAndSendIRTAlerts`
3. イベントのソース: 時間主導型
4. 時間ベースのトリガー: 1時間ごと

## 8. Live Mode機能仕様

### 8.1 基本仕様

Live Modeは、メインアプリケーションとは独立したポップアップウィンドウで動作する軽量版のケース管理システム（Create Case機能）です。

```javascript
const LiveModeSpec = {
  window: {
    type: "popup",
    resizable: true,
    defaultSize: { width: 1200, height: 800 },
    minSize: { width: 800, height: 600 }
  },
  content: {
    tabs: ["Dashboard", "Add New Case"],
    autoRefresh: 30000, // 30秒間隔
    realTimeUpdates: true
  },
  features: [
    "Window size persistence",
    "Tab state persistence", 
    "Mode toggle (Live/Standard)",
    "Notification system"
  ]
};
```

### 8.2 実装仕様

```javascript
const LiveModeImplementation = {
  windowCreation: {
    method: "window.open()",
    features: "resizable=yes,scrollbars=yes,status=yes",
    communication: "postMessage API"
  },
  layout: {
    header: "minimal with mode indicator",
    tabs: ["Dashboard", "Add New Case"],
    content: "responsive to window size"
  },
  features: {
    autoRefresh: "30 second intervals",
    realTimeTimers: "1 second updates",
    notifications: "browser notifications API",
    persistence: "window state in localStorage"
  }
};
```

### 8.3 Live Mode UI構造
```html
<!DOCTYPE html>
<html>
<head>
  <title>CasesDash - Live Mode</title>
  <style>
    .live-mode-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      font-family: 'Google Sans', Arial, sans-serif;
    }
    .live-header {
      background: #1976d2;
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .live-tabs {
      display: flex;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }
    .live-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="live-mode-container">
    <div class="live-header">
      <h1>CasesDash - Live Mode</h1>
      <div class="live-controls">
        <span id="last-update">Last update: --:--:--</span>
        <button onclick="window.close()">Close</button>
      </div>
    </div>
    <div class="live-tabs">
      <button class="tab-button active" onclick="showTab('dashboard')">Dashboard</button>
      <button class="tab-button" onclick="showTab('create')">Add New Case</button>
    </div>
    <div class="live-content">
      <div id="dashboard-tab" class="tab-content active">
        <!-- Dashboard content -->
      </div>
      <div id="create-tab" class="tab-content">
        <!-- Create case form -->
      </div>
    </div>
  </div>
</body>
</html>
```

## 9. UI表示言語統一仕様

### 9.1 UI表記の基本方針

すべてのメインメニュー機能（統計分析、検索・フィルター、ケース管理等）において、UI項目はスプレッドシートのヘッダーと完全一致する英語表記を使用します。これにより、ユーザーがスプレッドシートとUIの間で混乱することなく、直感的な操作が可能になります。

### 9.2 主要UI表記（英語統一）

**基本指標（英語表記）:**
- Total Cases
- Solution Offered
- NCC
- SLA Achievement Rate
- Average Handling Time

**共通フィールド（英語表記）:**

| スプレッドシートヘッダー | UI表示 | 説明 |
|------------------------|--------|------|
| Case ID | Case ID | ケース識別子 |
| Case Open Date | Case Open Date | ケース開始日 |
| Time | Case Open Time | ケース開始時刻 |
| Incoming Segment | Incoming Segment | 顧客セグメント |
| Product Category | Product Category | 製品カテゴリ |
| Triage | Triage | トリアージフラグ |
| Prefer Either | Prefer Either | どちらでも可フラグ |
| Is 3.0 | Is 3.0 | 3.0対応フラグ |
| 1st Assignee | 1st Assignee | 初回担当者 |
| Case Status | Case Status | ケースステータス |



**選択肢（英語表記）:**

**Incoming Segment選択肢:**
- Platinum
- Titanium  
- Gold
- Silver
- Bronze - Low
- Bronze - High

**Product Category選択肢:**
- Search
- Display
- Video
- Commerce
- Apps
- M&A
- Policy
- Billing
- Other

**Case Status選択肢:**
- Assigned
- Solution Offered
- Finished

**Issue Category選択肢（3PO）:**
- CBT invo-invo
- CBT invo-auto
- CBT (self to self)
- LC creation
- PP link
- PP update
- IDT/ Bmod
- LCS billing policy
- self serve issue
- Unidentified Charge
- CBT Flow
- GQ
- OOS
- Bulk CBT
- CBT ext request
- MMS billing policy
- Promotion code
- Refund
- Review
- TM form
- Trademarks issue
- Under Review
- Certificate
- Suspend
- AIV
- Complaint

## 10. 技術実装と構成

### 10.1 フロントエンド構成

#### コア技術スタック
- **HTML5**: セマンティックマークアップとアクセシビリティ対応
- **CSS3**: Grid Layout, Flexbox, CSS Variables, Animations
- **JavaScript (ES6+)**: Modern JavaScript features, Async/Await, Modules

#### UIライブラリ
- **Material Design Components for Web**:
  - MDC Tab Bar, Dialog, Select, TextField, Button, Checkbox
  - Material Icons & Symbols
- **Chart.js**: 統計データ可視化
- **Flatpickr**: 日付時間選択
- **Select2**: 3PO Details フィールドの巨大ドロップダウン対応
  - 数百の選択肢を持つドロップダウンに対応
  - 部分一致検索（autocomplete）機能
  - パフォーマンス最適化（仮想スクロール）
  - カスタマイズ可能なスタイリング
- **Google Fonts**: Google Sans, Roboto

#### 状態管理
```javascript
// シンプルな状態管理システム
class AppState {
  constructor() {
    this.state = {
      user: null,
      cases: [],
      selectedSheet: null,
      filters: {},
      settings: {}
    };
    this.listeners = [];
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

### 10.2 バックエンド（Google Apps Script）

#### メイン構成
```javascript
// Code.gs - メインエントリーポイント
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('CasesDash - Multi-Sheet Case Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// スプレッドシート操作関数
function getSpreadsheetData(sheetName, range) {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not configured');
  }
  
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  
  return sheet.getRange(range).getValues();
}
```

#### ユーザー認証システム
```javascript
// UserAuth.gs
function getCurrentUser() {
  const user = Session.getActiveUser();
  const email = user.getEmail();
  
  if (!email.includes('@google.com')) {
    throw new Error('Access restricted to Google employees only');
  }
  
  return {
    email: email,
    ldap: email.split('@')[0],
    name: user.getName(),
    role: getUserRole(email)
  };
}

function getUserRole(email) {
  // プロパティサービスから役割情報を取得
  const teamLeaders = PropertiesService.getScriptProperties()
    .getProperty('TEAM_LEADERS')?.split(',') || [];
  const admins = PropertiesService.getScriptProperties()
    .getProperty('ADMINS')?.split(',') || [];
  
  if (admins.includes(email)) return 'admin';
  if (teamLeaders.includes(email)) return 'team_leader';
  return 'user';
}
```

#### 通知システム
```javascript
// NotificationSystem.gs
function sendChatNotification(caseData, webhookUrl) {
  const payload = {
    text: "⚠️ IRT Alert",
    cards: [{
      header: {
        title: "IRT Timer Warning",
        subtitle: "Immediate attention required"
      },
      sections: [{
        widgets: [
          {
            keyValue: {
              topLabel: "LDAP",
              content: caseData.finalAssignee
            }
          },
          {
            keyValue: {
              topLabel: "Case ID", 
              content: caseData.caseId
            }
          },
          {
            keyValue: {
              topLabel: "Message",
              content: "⚠️ IRT timer has fallen below 2 hours. Immediate action required."
            }
          }
        ]
      }]
    }]
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(webhookUrl, options);
    Logger.log(`Notification sent for case ${caseData.caseId}`);
  } catch (error) {
    Logger.log(`Failed to send notification: ${error.toString()}`);
  }
}
```

### 10.3 データストレージ

#### スプレッドシート構造
- **プライマリデータ**: 6つのシートでのケースデータ
- **設定情報**: Properties Service での設定保存
- **キャッシュ**: CacheService での一時データ保存

#### 設定管理
```javascript
// Settings.gs
function saveSettings(settings) {
  const properties = PropertiesService.getScriptProperties();
  Object.keys(settings).forEach(key => {
    properties.setProperty(key, JSON.stringify(settings[key]));
  });
}

function getSettings() {
  const properties = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: properties.getProperty('SPREADSHEET_ID'),
    teamLeaderWebhook: properties.getProperty('TEAM_LEADER_WEBHOOK'),
    theme: properties.getProperty('THEME') || 'light',
    language: properties.getProperty('LANGUAGE') || 'en'
  };
}
```

## 11. セキュリティとコンプライアンス

### 11.1 認証・認可
- **Google OAuth**: セキュアなGoogle認証
- **ドメイン制限**: @google.comドメインのみアクセス許可
- **役割ベースアクセス制御**: user/team_leader/admin の権限分離
- **開発・テスト用アカウント**:
  - テスト環境でのみ、Configurationシートまたはスクリプトプロパティに「テスト用許可アカウント」リストを設定可能
  - 本番環境では必ず無効化すること
  - **重要**: テスト用アカウントも@google.comドメインを使用することを強く推奨（Googleセキュリティポリシー遵守）

### 11.2 データプライバシー
- **個人データ保護**: 本人データのみ表示原則
- **匿名化統計**: チーム集計での個人情報匿名化
- **アクセスログ**: 機密データアクセスの記録

### 11.3 エラーハンドリング
```javascript
// ErrorHandler.js
class ErrorHandler {
  static handle(error, context) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      user: Session.getActiveUser().getEmail()
    };
    
    // ログ記録
    Logger.log(JSON.stringify(errorInfo));
    
    // ユーザーフレンドリーなエラーメッセージを表示
    this.showUserError(error);
  }
  
  static showUserError(error) {
    const userMessage = this.getUserFriendlyMessage(error);
    // UIにエラーメッセージを表示
    document.getElementById('error-display').textContent = userMessage;
  }
  
  static getUserFriendlyMessage(error) {
    if (error.message.includes('Spreadsheet ID not configured')) {
      return 'スプレッドシートが設定されていません。設定画面から設定してください。';
    }
    if (error.message.includes('Sheet not found')) {
      return '指定されたシートが見つかりません。スプレッドシートの構造を確認してください。';
    }
    return '予期しないエラーが発生しました。しばらく待ってから再試行してください。';
  }
}
```

## 12. パフォーマンス最適化

### 12.1 読み込み速度最適化
- **遅延読み込み**: 必要な時点でのデータ取得
- **キャッシュ戦略**: 頻繁にアクセスするデータのキャッシュ
- **バッチ処理**: 複数のスプレッドシート操作の一括実行

### 12.2 リアルタイム更新
```javascript
// RealtimeUpdater.js
class RealtimeUpdater {
  constructor() {
    this.updateInterval = null;
    this.isUpdating = false;
  }
  
  start() {
    this.updateInterval = setInterval(() => {
      this.updateTimers();
    }, 1000); // 1秒間隔
  }
  
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  updateTimers() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    const caseElements = document.querySelectorAll('.case-card');
    caseElements.forEach(element => {
      const trtTimer = element.querySelector('.trt-timer');
      const irtTimer = element.querySelector('.irt-timer');

      if (trtTimer) {
        this.updateTimer(trtTimer);
      }
      if (irtTimer) {
        this.updateTimer(irtTimer);
      }
    });
    
    this.isUpdating = false;
  }
  
  updateTimer(timerElement) {
    const deadline = new Date(timerElement.dataset.deadline);
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) {
      timerElement.textContent = 'Missed';
      timerElement.className = 'timer missed';
    } else {
      const timeString = this.formatTime(diff);
      timerElement.textContent = timeString;
      timerElement.className = this.getTimerClass(diff);
    }
  }
  
  formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  getTimerClass(milliseconds) {
    const hours = milliseconds / (1000 * 60 * 60);
    if (hours <= 2) return 'timer critical';
    if (hours <= 8) return 'timer warning';
    return 'timer normal';
  }
}
```

## 13. 今後の開発ロードマップ

### 13.1 フェーズ1: 基盤強化（2週間）
- [ ] ユーザー認証システムの実装
- [ ] スプレッドシート接続機能の修正
- [ ] 基本的なケース作成機能の実装
- [ ] ダークモード/ライトモード切り替えの実装

### 13.2 フェーズ2: 核心機能（3週間）
- [ ] IRT除外ケース管理機能
- [ ] Gmail通知システム（IRTアラート）
- [ ] Live Mode機能の実装
- [ ] Analytics レポート機能の強化

### 13.3 フェーズ3: 統計とUI強化（2週間）
- [ ] Sentiment Score管理のReports内組み込み
- [ ] 期間選択機能の実装
- [ ] UI/UXの洗練
- [ ] レスポンシブデザインの最適化

### 13.4 フェーズ4: テストと最適化（1週間）
- [ ] 全機能の統合テスト
- [ ] パフォーマンス最適化
- [ ] セキュリティ検証
- [ ] ユーザー受け入れテスト

## 14. 付録

### 14.1 用語集

- **SLA (Service Level Agreement)**: サービス品質保証のための応答時間枠
- **TRT (Total Resolution Time)**: ケース解決目標時間（ケースオープンからクローズまでの総経過時間）
- **IRT (Internal Resolution Time)**: SO期間を除外した実質的な内部対応時間（IRT = TRT - SO期間、2025年Q4より主要メトリック）
- **SO (Solution Offered)**: ソリューション提供済みステータス（このステータス中はIRTタイマー停止）
- **T&S Consulted**: Trust and Safety consultation flag
- **NCC (Non-Contact Complete)**: 通常のクローズフロー以外（Status = SO/Finished かつ non NCC列が空欄）
- **AM Transfer**: Account Manager移管フラグ
- **Ldap**: 社内ユーザー識別子（Ldap@google.com）
- **Live Mode**: ポップアップウィンドウでの独立動作モード
- **ReOpen**: Solution OfferedまたはFinished状態のケースを再度Assignedに戻す操作

### 14.2 設定ファイル例

```javascript
// config.js
const CONFIG = {
  SPREADSHEET: {
    SHEETS: [
      'OT Email', '3PO Email', 'OT Chat', 
      '3PO Chat', 'OT Phone', '3PO Phone'
    ],
    DATA_START_ROW: 3
  },
  TIMERS: {
    UPDATE_INTERVAL: 1000, // 1秒
    CRITICAL_THRESHOLD: 2 * 60 * 60 * 1000, // 2時間
    WARNING_THRESHOLD: 24 * 60 * 60 * 1000  // 24時間
  },
  SLA: {
    EMAIL: {
      PLATINUM: 24,
      TITANIUM: 36,
      GOLD: 36
    },
    CHAT: {
      PLATINUM: 6,
      TITANIUM: 8,
      GOLD: 8
    },
    PHONE: {
      PLATINUM: 6,
      TITANIUM: 8,
      GOLD: 8
    }
  },
  NOTIFICATIONS: {
    GMAIL: {
      ENABLED: true,
      RETRY_COUNT: 3,
      THRESHOLD_HOURS: 2  // IRT残り時間が2時間以下で通知
    }
  }
};
```

---

**技術仕様**: Google Apps Script (ES6+), Material Design Components, Google Spreadsheets  
**対象シート**: 6シート完全対応  
**セキュリティ**: プライバシー保護対応、Google OAuth認証
**パフォーマンス**: サブ2秒レスポンス目標、リアルタイム更新対応
**通知**: Gmail通知システム（GAS MailApp/GmailApp API）
**アクセシビリティ**: WCAG 2.1 AA準拠

**最終更新**: 2025年11月6日
**バージョン**: 3.0.0（IRT対応版 - 2025Q4完全移行）

## 📝 更新履歴

### v3.0.0 (2025/11/6) - IRT対応版
- **IRT RAW dataシート追加**: ReOpen履歴管理とIRT正確計算に対応
- **Configurationシート追加**: 四半期管理と過去データ統合分析対応
- **列マッピング修正**: すべてのシートにirtTimerフィールドを追加、列位置を修正
- **Dashboard機能強化**: 検索バー、Case Statusタブ、ReOpen機能を追加
- **My Cases機能変更**: Assignedケースのみに特化、高速表示
- **NCC定義更新**: Solution Offered/Finished両対応、Bug列の扱いを明確化
- **Analytics modernization**: 2025年最先端チャートライブラリ統合（ApexCharts/ECharts）
- **Reward重視評価**: Penaltyでなく Rewardターゲット達成を主目標に
- **用語統一**: P95 → IRT、セグメント名の正式名称化（Titanium LCS等）

### v2.0.0 (2025/5/25) - マルチシート対応版
- 6シート対応の基本機能実装
