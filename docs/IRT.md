
---

## 📄 SLA (ACN) 2025年 Q3-Q4 仕様解説書

本資料は、Accenture (ACN) が達成を保証するサービスレベル合意（SLA）の2025年Q3およびQ4（11月1日以降）の定義と目標値を規定するものです。

### 1. 【最重要】主要メトリクスの変更：TRT → IRT （11/1～）

2025年11月1日（Q4）より、主要な時間管理SLAメトリクスが P95 と呼ばれていた「TRT (Total Resolution Time)」から「**IRT (Internal Resolution Time)**」に変更されます。

### 🔹 As-Is (～Q3): TRT (Total Resolution Time)

- 
    
    **定義:** ケース作成（Case Create）から最終クローズまでの「総解決時間」。
    
- **問題点:**
    - 顧客からの返信待ち（NeedInfo）や、一度SO (Solved) にした後の追加質問によるReopen待ちなど、**「SO status」になっている時間もタイマーに含まれていました**。
    - これにより、顧客側の返信遅延がSLAミス（TRT超過）の主な理由となっていました 。

### 🔸 To-Be (11/1～): IRT (Internal Resolution Time)

- 
    
    **定義:** TRTから「**SO statusだった時間**」を**除外**した、実質的な内部対応時間 。
    
- **タイマー停止のロジック:**
    - ケースを「SO」にしてから、顧客対応などにより「Reopen」するまでの時間は、SLAのタイマーが停止します。
- **期待される効果:**
    - 顧客起因の待ち時間が除外されるため、純粋なケースハンドル時間でSLAが判断されるようになります。
    - これにより、SLAの達成が従来よりも容易になることが期待されます。

### 🧮 IRT 計算ロジック例

- 
    
    **従来のTRT:** 72時間
    
- 
    
    **SOだった時間 (タイマー停止時間):** 44時間
    
- 
    
    **算出されるIRT:** 72時間 - 44時間 = **28時間** 
    

### 🛠️ ダッシュボードへの実装要件

- **必要なデータ:** 各ケースの「作成時刻(Case Open Date/Time)」「Solution Offered に変更した日時（1st Close Date/Time)」、「Reopen時刻(Reopen Close Date/Time)」、「最終クローズ時刻(前回のReopen時刻を上書きした"Reopen Close Date/Time"の値)」。
- **計算式:** `(最終クローズ時刻 - 作成時刻) - SUM(Reopen時刻 - Solution Offered に変更した日時)`
- 
    
    **リアルタイム監視:** IRTの残り時間は「Manual Tracker」で確認可能であり、これは1時間ごとに更新されます。ダッシュボードも同様の更新頻度、またはリアルタイムでの残り時間算出が求められます。
    

---

### 2. SLA ターゲット（目標値）

メトリクス変更に伴い、Q4からターゲット（Penalty / Rewardの閾値）も変更されます。

### 🔹 Q3 2025 ターゲット (メトリクス: TRT)


| **セグメント** | **TRT目標** | **Penalty (<)** | **Reward (>)** |
| --- | --- | --- | --- |
| Platinum | 3 days [cite: 102] | 94% [cite: 110] | 96% [cite: 111] |
| T LCS | 3 days [cite: 102] | 94% [cite: 115] | 95% [cite: 116] |
| G LCS | 3 days [cite: 102] | 94% [cite: 120] | 95% [cite: 121] |
| G GCS | 3 days [cite: 102] | 94% [cite: 125] | 95% [cite: 126] |
| Silver | **5 days** [cite: 129] | 94% [cite: 130] | 96% [cite: 131] |
| Bronze | **7 days** [cite: 134] | 89% [cite: 135] | 91% [cite: 136] |
| *Q3 TBD* |  | [cite: 139] |  |

### 🔸 Q4 2025 ターゲット (11/1～) (メトリクス: IRT)


- 
    
    **重要:** IRT目標は、**全セグメントで 3 days(72hrs)** に統一されます。
    

| **セグメント** | **IRT目標** | **Penalty (<)** | **Reward (>)** |
| --- | --- | --- | --- |
| Platinum | 3 days | 97.0% [cite: 58] | 98.0% [cite: 59] |
| Titanium LCS | 3 days | 96.0% [cite: 61] | 97.0% [cite: 62] |
| Gold LCS | 3 days | 96.0% [cite: 64] | 97.0% [cite: 65] |
| Gold GCS | 3 days | 95.0% [cite: 67] | 96.0% [cite: 68] |
| Silver | 3 days | 90.0% [cite: 70] | 91.0% [cite: 71] |
| Bronze | 3 days | 86.0% [cite: 73] | 87.0% [cite: 74] |
| *Q4 TBD* |  | [cite: 75] |  |

---

### 3. SLA 除外ケース (フィルタリング要件)

ダッシュボードでSLA達成率を計算する際、以下の条件に合致するケースは**計算対象から除外（フィルタリング）**する必要があります。

- 
    
    **基本ルール:** IRTに変更後も、除外対象となる指標は基本的に変更ありません。
    

### 🚫 除外対象リスト

1. **Bug**
    - 
        
        **定義:** ケースを「Bug」として Blocked By したもの。
        
2. **L2 Consult**
    - 
        
        **定義:** サポートチーム（L1）から L2 へ **Direct で**エスカレーションされたケース。
        
3. **PayReq (Payment Request)**
    - 
        
        **定義:** 「Payment Request ID」が発行され、Blocked by したもの。
        
4. **Invoice Dispute**
    - 
        
        **定義:** 「Invoice Dispute ID」が発行され、Blocked by したもの。
        
5. **Workdriver**
    - 
        
        **定義:** Neo Taxonomy の最後の Workdriver が「Troubleshooting」**以外**に設定されたもの（例: Implementation など）。
        
6. **T&S Team**
    - 
        
        **定義:** T&S (Trust & Safety) Team にエスカレーションされたケース。
        

### ⚠️ 除外対象外（SLA計算に**含まれる**）ケース

- L1S および L1R へのエスカレーションは**除外対象になりません**。
- pSME へのエスカレーションは TRT (IRT) に**含まれます**。
- L1S に上げた後、その L1S が L2 にエスカレーションしたケースも、TRT (IRT) に**含まれます**。

---

この内容がダッシュボードの仕様策定とバイブコーディングのお役に立てれば幸いです。


