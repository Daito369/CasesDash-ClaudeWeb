システム全体を確認したところ、Plan.md 内のいくつかの記述が現状の実装／仕様書と食い違っていました。特に気になった点は以下です。

- **Allowed domain が固定値と断定されている**
    
    Plan.md の認証セクションは allowedDomain = 'google.com' を直書きする前提で説明しています（Plan.md:956-979）。実際の実装では許可ドメインは getConfig(ConfigKeys.ALLOWED_DOMAIN, 'google.com') で Script Properties から読み込めるようになっており、デプロイ後に値を変えられる設計です（src/backend/auth/Authentication.gs:90-114）。Plan もこの柔軟性を前提に説明しないと誤解を招きます。
    
- **IRT 通知フローの記述が実装と異なる**
    
    Plan.md では「ステータス変更 → IRTService.updateCaseStatus() → Gmail通知」とリアルタイム通知のように書かれています（Plan.md:200-210）。ただし仕様書/実装は、1時間ごとに checkAndSendIRTAlerts() が IRT RAW data シートを走査して条件一致ケースへメールする「定期トリガー」方式です（docs/casesdash-specification.md:3320-3385、src/backend/services/NotificationService.gs:384-474）。この違いを放置すると運用設計を誤ります。
    
- **CacheService の活用が Plan に書かれているが、コードには一切存在しない**
    
    Plan.md では getCachedSheetData() など CacheService を使った5分キャッシュ＆無効化条件まで提示しています（Plan.md:324-343, 882）。しかし rg -n "CacheService" src で1件もヒットせず、実装側はまだキャッシュ未導入です。Plan では「導入済み」ではなく「今後の ToDo」として扱うか、実装を追加する必要があります。
    
- **ErrorHandler / RetryHelper / ValidationService などのユーティリティが存在しない**
    
    Plan.md には utils/ErrorHandler.gs や utils/RetryHelper.gs、ValidationService クラスのサンプルまで載っていますが（Plan.md:350-452, 1015-1062）、src/ 直下を検索してもこれらのファイル・クラスはありません (rg -n "ErrorHandler" src, rg -n "RetryHelper" src, rg -n "ValidationService" src は全てヒット無し)。Plan か実装のどちらかを修正すべきです。
    
- **Live Mode の挙動説明が現状コードと一致しない**
    
    Plan.md では openLiveMode() で ?mode=live を開き、frontend/live-mode テンプレートを返すと書かれています（Plan.md:246-266）。実際の doGet は mode に login と app しか渡しておらず、frontend/live-mode も存在しません（src/backend/Code.gs:82-183, rg -n "live-mode" src → ヒット無し）。Live Mode をロードマップ項目として残すか、Plan の実装例を削除した方が整合します。
    
- **フロントエンド改善セクションのコードが実プロジェクトに無い**
    
    Plan.md では js/VirtualScroll.js（Plan.md:579-649）、RealtimeUpdater（Plan.md:659-738）、ThemeManager（Plan.md:842-860）、PerformanceMonitor（Plan.md:904-937）などのクラスを既存ファイルとして扱っていますが、src/frontend/js にこれらのファイルは無く、rg -n "VirtualScroll|RealtimeUpdater|ThemeManager|PerformanceMonitor" src/frontend もヒットしません。Plan をこのまま公開すると、実在しないファイルへの参照で混乱を招きます。
    
- **ApexCharts / Google Charts / ECharts の利用記述が現行フロントと乖離**
    
    Plan.md や仕様書では複数のチャートライブラリを使う前提になっていますが（例: Plan.md イントロ、docs/casesdash-specification.md:1883-2634）、src/frontend/index.html にはそれらの CDN 読み込みも JS 呼び出しも含まれていません（src/frontend/index.html:1-120 および rg -n "ApexCharts|ECharts" src/frontend がヒット無し）。Plan では「採用済み」と書かず、Analytics 章を「今後実装」扱いとするか、実際に取り込む実装を追加すべきです。
    

これらの点を修正・追記すれば、Plan.md は実際のコード／仕様と矛盾しなくなるはずです。次のステップとしては (1) Plan の該当セクションを書き換える、もしくは (2) Plan の記載どおりにコードへ機能を追加する、のどちらを進めるかを決めるのが良いと思います。
