# 電化製品データベースセットアップスクリプト（エンコーディング対応版 - PowerShell版）

Write-Host "電化製品データベースのセットアップを開始します..." -ForegroundColor Cyan

# 必要なモジュールをインストール
Write-Host "1. 必要なモジュールをインストール中..." -ForegroundColor Cyan
npm install iconv-lite

# JavaScriptでCSVデータを生成
Write-Host "2. サンプルデータの生成中..." -ForegroundColor Cyan
Write-Host "   UTF-8エンコーディングでCSVを生成..." -ForegroundColor Yellow
node scripts/generate-electronics-data-utf8.js

Write-Host "   Shift-JISエンコーディングでCSVを生成..." -ForegroundColor Yellow
node scripts/generate-electronics-data-sjis.js

# CSVをSQLに変換
Write-Host "3. CSVデータをSQLに変換中..." -ForegroundColor Cyan
node scripts/csv-to-sql-with-encoding.js

Write-Host "セットアップが完了しました！" -ForegroundColor Green
Write-Host ""
Write-Host "生成されたファイル:" -ForegroundColor Cyan
Write-Host "- electronics_data_utf8.csv (UTF-8エンコーディング)"
Write-Host "- electronics_data_sjis.csv (Shift-JISエンコーディング)"
Write-Host "- sql_import/ (SQLファイル)"
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Cyan
Write-Host "1. create-database-complete.sql を実行してデータベースを作成"
Write-Host "2. sql_import フォルダ内のSQLファイルを順番に実行"
Write-Host "3. または sql_import/import_all.bat を実行して一括インポート"

Write-Host ""
Write-Host "完了するには何かキーを押してください..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
