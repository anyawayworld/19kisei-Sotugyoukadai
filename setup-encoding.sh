#!/bin/bash

# 電化製品データベースセットアップスクリプト（エンコーディング対応版）

echo "電化製品データベースのセットアップを開始します..."

# 必要なモジュールをインストール
echo "1. 必要なモジュールをインストール中..."
npm install iconv-lite

# JavaScriptでCSVデータを生成
echo "2. サンプルデータの生成中..."
echo "   UTF-8エンコーディングでCSVを生成..."
node scripts/generate-electronics-data-utf8.js

echo "   Shift-JISエンコーディングでCSVを生成..."
node scripts/generate-electronics-data-sjis.js

# CSVをSQLに変換
echo "3. CSVデータをSQLに変換中..."
node scripts/csv-to-sql-with-encoding.js

echo "セットアップが完了しました！"
echo ""
echo "生成されたファイル:"
echo "- electronics_data_utf8.csv (UTF-8エンコーディング)"
echo "- electronics_data_sjis.csv (Shift-JISエンコーディング)"
echo "- sql_import/ (SQLファイル)"
echo ""
echo "次のステップ:"
echo "1. create-database-complete.sql を実行してデータベースを作成"
echo "2. sql_import フォルダ内のSQLファイルを順番に実行"
echo "3. または sql_import/import_all.bat を実行して一括インポート"
