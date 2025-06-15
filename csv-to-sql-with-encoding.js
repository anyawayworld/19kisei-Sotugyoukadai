// CSVファイルをSQLに変換するスクリプト（エンコーディング対応版）
const fs = require("fs")
const path = require("path")
const iconv = require("iconv-lite")

// CSVファイルを読み込む関数（エンコーディング指定可能）
function readCsvFile(filePath, encoding = "utf8") {
  try {
    let content

    if (encoding === "utf8") {
      content = fs.readFileSync(filePath, "utf8")
    } else {
      const buffer = fs.readFileSync(filePath)
      content = iconv.decode(buffer, encoding)
    }

    return content
  } catch (error) {
    console.error(`CSVファイルの読み込みに失敗しました: ${error.message}`)
    return null
  }
}

// CSVを解析する関数
function parseCsv(csvContent) {
  const lines = csvContent.split("\n").filter((line) => line.trim())

  if (lines.length < 2) {
    console.error("CSVデータが不足しています")
    return { headers: [], data: [] }
  }

  // ヘッダー行を解析
  const headers = parseCSVLine(lines[0])
  console.log(`ヘッダー: ${headers.join(", ")}`)

  // データ行を解析
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      data.push(row)
    }
  }

  console.log(`データ行数: ${data.length}`)
  return { headers, data }
}

// CSV行を解析する関数（ダブルクォート内のカンマを考慮）
function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim().replace(/^"(.*)"$/, "$1"))
      current = ""
    } else {
      current += char
    }
  }

  // 最後のフィールドを追加
  if (current) {
    result.push(current.trim().replace(/^"(.*)"$/, "$1"))
  }

  return result
}

// SQLエスケープ処理
function sqlEscape(value) {
  if (typeof value !== "string") return value
  return value.replace(/'/g, "''")
}

// SQLファイルを生成する関数
function generateSqlFiles(data, outputDir) {
  // 出力ディレクトリを作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // カテゴリとメーカーのマッピング
  const categoryMap = {
    テレビ: 1,
    冷蔵庫: 2,
    洗濯機: 3,
    エアコン: 4,
    電子レンジ: 5,
    掃除機: 6,
    オーディオ: 7,
    デジタルカメラ: 8,
    ノートパソコン: 9,
    タブレット: 10,
    スマートフォン: 11,
    炊飯器: 12,
    ドライヤー: 13,
    加湿器: 14,
    扇風機: 15,
  }

  const manufacturerMap = {
    ソニー: 1,
    パナソニック: 2,
    シャープ: 3,
    東芝: 4,
    日立: 5,
    三菱電機: 6,
    アイリスオーヤマ: 7,
    ダイキン: 8,
    富士通: 9,
    キヤノン: 10,
    エプソン: 11,
    カシオ: 12,
    アップル: 13,
    サムスン: 14,
    LG: 15,
    ファーウェイ: 16,
    デル: 17,
    レノボ: 18,
    エイスース: 19,
    バルミューダ: 20,
    ダイソン: 21,
    フィリップス: 22,
    ブラウン: 23,
    タイガー: 24,
    象印: 25,
  }

  // 製品データのSQL生成
  let productsSQL = "-- 製品データ\n"
  productsSQL += "USE electronics_inventory;\n\n"
  productsSQL +=
    "INSERT INTO products (product_id, product_name, model_number, category_id, manufacturer_id, price, size, size_unit, color, features, series, release_date, warranty_period, energy_rating) VALUES\n"

  const productValues = data.map((row) => {
    const productId = row["No"]
    const productName = sqlEscape(row["商品名"])
    const modelNumber = sqlEscape(row["型式"])
    const categoryId = categoryMap[row["カテゴリ"]] || 1
    const manufacturerId = manufacturerMap[row["メーカー"]] || 1
    const price = row["価格"]
    const size = row["サイズ"]
    const sizeUnit = sqlEscape(row["サイズ単位"])
    const color = sqlEscape(row["カラー"])
    const features = sqlEscape(row["特徴"])
    const series = sqlEscape(row["シリーズ"])
    const releaseDate = row["発売日"]
    const warranty = row["保証期間"]
    const energyRating = sqlEscape(row["省エネ評価"])

    return `(${productId}, '${productName}', '${modelNumber}', ${categoryId}, ${manufacturerId}, ${price}, ${size}, '${sizeUnit}', '${color}', '${features}', '${series}', '${releaseDate}', ${warranty}, '${energyRating}')`
  })

  productsSQL += productValues.join(",\n")
  productsSQL += ";\n"

  fs.writeFileSync(path.join(outputDir, "01_products.sql"), productsSQL, "utf8")
  console.log(`製品データSQL生成完了: ${productValues.length}件`)

  // 在庫データのSQL生成
  let inventorySQL = "-- 在庫データ\n"
  inventorySQL += "USE electronics_inventory;\n\n"
  inventorySQL += "INSERT INTO inventory (product_id, warehouse_id, current_stock, stock_status) VALUES\n"

  const inventoryValues = data.map((row) => {
    const productId = row["No"]
    const warehouseId = row["倉庫コード"]
    const currentStock = row["在庫数"]
    const stockStatus = sqlEscape(row["在庫状況"])

    return `(${productId}, '${warehouseId}', ${currentStock}, '${stockStatus}')`
  })

  inventorySQL += inventoryValues.join(",\n")
  inventorySQL += ";\n"

  fs.writeFileSync(path.join(outputDir, "02_inventory.sql"), inventorySQL, "utf8")
  console.log(`在庫データSQL生成完了: ${inventoryValues.length}件`)

  // 入荷データのSQL生成
  let incomingSQL = "-- 入荷データ\n"
  incomingSQL += "USE electronics_inventory;\n\n"
  incomingSQL += "INSERT INTO incoming_shipments (product_id, quantity, shipment_date) VALUES\n"

  const incomingValues = data
    .filter((row) => row["入荷日"] && Number.parseInt(row["入荷数"]) > 0)
    .map((row) => {
      const productId = row["No"]
      const quantity = row["入荷数"]
      const shipmentDate = row["入荷日"]

      return `(${productId}, ${quantity}, '${shipmentDate}')`
    })

  if (incomingValues.length > 0) {
    incomingSQL += incomingValues.join(",\n")
    incomingSQL += ";\n"
  } else {
    incomingSQL += "-- 入荷データがありません\n"
  }

  fs.writeFileSync(path.join(outputDir, "03_incoming_shipments.sql"), incomingSQL, "utf8")
  console.log(`入荷データSQL生成完了: ${incomingValues.length}件`)

  // 出荷データのSQL生成
  let outgoingSQL = "-- 出荷データ\n"
  outgoingSQL += "USE electronics_inventory;\n\n"
  outgoingSQL += "INSERT INTO outgoing_shipments (product_id, quantity, shipment_date) VALUES\n"

  const outgoingValues = data
    .filter((row) => row["出荷日"] && Number.parseInt(row["出荷数"]) > 0)
    .map((row) => {
      const productId = row["No"]
      const quantity = row["出荷数"]
      const shipmentDate = row["出荷日"]

      return `(${productId}, ${quantity}, '${shipmentDate}')`
    })

  if (outgoingValues.length > 0) {
    outgoingSQL += outgoingValues.join(",\n")
    outgoingSQL += ";\n"
  } else {
    outgoingSQL += "-- 出荷データがありません\n"
  }

  fs.writeFileSync(path.join(outputDir, "04_outgoing_shipments.sql"), outgoingSQL, "utf8")
  console.log(`出荷データSQL生成完了: ${outgoingValues.length}件`)

  // バッチファイルの生成
  let batchContent = "@echo off\n"
  batchContent += "echo 電化製品データベースへのデータインポートを開始します...\n"
  batchContent += "echo.\n"
  batchContent += "echo データベーススキーマを作成中...\n"
  batchContent += "mysql -u root -p < ../create-database-complete.sql\n"
  batchContent += "echo.\n"
  batchContent += "echo 製品データをインポート中...\n"
  batchContent += "mysql -u root -p electronics_inventory < 01_products.sql\n"
  batchContent += "echo.\n"
  batchContent += "echo 在庫データをインポート中...\n"
  batchContent += "mysql -u root -p electronics_inventory < 02_inventory.sql\n"
  batchContent += "echo.\n"
  batchContent += "echo 入荷データをインポート中...\n"
  batchContent += "mysql -u root -p electronics_inventory < 03_incoming_shipments.sql\n"
  batchContent += "echo.\n"
  batchContent += "echo 出荷データをインポート中...\n"
  batchContent += "mysql -u root -p electronics_inventory < 04_outgoing_shipments.sql\n"
  batchContent += "echo.\n"
  batchContent += "echo インポート完了！\n"
  batchContent += "pause\n"

  fs.writeFileSync(path.join(outputDir, "import_all.bat"), batchContent, "utf8")
  console.log("インポート用バッチファイル生成完了")
}

// メイン処理
function main() {
  console.log("=== CSVファイルをSQLに変換（エンコーディング対応版） ===")

  // 入力ファイルの確認
  const csvFiles = ["electronics_data_utf8.csv", "electronics_data_sjis.csv", "electronics_data.csv"]

  let csvFile = null
  let encoding = "utf8"

  for (const file of csvFiles) {
    if (fs.existsSync(file)) {
      csvFile = file
      encoding = file.includes("sjis") ? "shift_jis" : "utf8"
      break
    }
  }

  if (!csvFile) {
    console.error("CSVファイルが見つかりません。先にデータ生成スクリプトを実行してください。")
    return
  }

  console.log(`CSVファイル: ${csvFile} (エンコーディング: ${encoding})`)

  // CSVファイルを読み込み
  const csvContent = readCsvFile(csvFile, encoding)
  if (!csvContent) return

  // CSVを解析
  const { headers, data } = parseCsv(csvContent)
  if (data.length === 0) {
    console.error("有効なデータがありません")
    return
  }

  // SQLファイルを生成
  const outputDir = "sql_import"
  generateSqlFiles(data, outputDir)

  console.log("\n=== 変換完了 ===")
  console.log("生成されたファイル:")
  console.log("- sql_import/01_products.sql")
  console.log("- sql_import/02_inventory.sql")
  console.log("- sql_import/03_incoming_shipments.sql")
  console.log("- sql_import/04_outgoing_shipments.sql")
  console.log("- sql_import/import_all.bat")

  console.log("\n次のステップ:")
  console.log("1. create-database-complete.sql を実行してデータベースを作成")
  console.log("2. sql_import フォルダ内のSQLファイルを順番に実行")
  console.log("3. または import_all.bat を実行して一括インポート")
}

// スクリプト実行
main()
