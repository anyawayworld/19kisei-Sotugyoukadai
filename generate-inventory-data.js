// 電化製品データベース用の1万件のサンプルデータを生成するスクリプト（UTF-8エンコーディング対応版）
const fs = require("fs")

// 日付をYYYY-MM-DD形式でフォーマットする関数
function formatDate(date) {
  return date.toISOString().split("T")[0]
}

// 指定範囲内のランダムな日付を生成する関数
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// 指定範囲内のランダムな整数を生成する関数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ランダムな価格を生成する関数（千円単位で切り上げ）
function randomPrice(min, max) {
  return Math.ceil(randomInt(min, max) / 1000) * 1000
}

// 電化製品のカテゴリ
const categories = [
  { name: "テレビ", priceRange: [30000, 300000], sizeUnit: "インチ", sizeRange: [24, 85] },
  { name: "冷蔵庫", priceRange: [50000, 350000], sizeUnit: "L", sizeRange: [100, 600] },
  { name: "洗濯機", priceRange: [30000, 200000], sizeUnit: "kg", sizeRange: [5, 12] },
  { name: "エアコン", priceRange: [40000, 250000], sizeUnit: "畳", sizeRange: [6, 20] },
  { name: "電子レンジ", priceRange: [10000, 80000], sizeUnit: "L", sizeRange: [15, 30] },
  { name: "掃除機", priceRange: [8000, 100000], sizeUnit: "W", sizeRange: [500, 2000] },
  { name: "オーディオ", priceRange: [15000, 200000], sizeUnit: "W", sizeRange: [20, 200] },
  { name: "デジタルカメラ", priceRange: [30000, 250000], sizeUnit: "MP", sizeRange: [12, 50] },
  { name: "ノートパソコン", priceRange: [60000, 300000], sizeUnit: "インチ", sizeRange: [13, 17] },
  { name: "タブレット", priceRange: [20000, 150000], sizeUnit: "インチ", sizeRange: [8, 13] },
  { name: "スマートフォン", priceRange: [30000, 200000], sizeUnit: "インチ", sizeRange: [5, 7] },
  { name: "炊飯器", priceRange: [8000, 100000], sizeUnit: "合", sizeRange: [3, 10] },
  { name: "ドライヤー", priceRange: [3000, 30000], sizeUnit: "W", sizeRange: [800, 1500] },
  { name: "加湿器", priceRange: [5000, 50000], sizeUnit: "L", sizeRange: [2, 10] },
  { name: "扇風機", priceRange: [3000, 40000], sizeUnit: "cm", sizeRange: [20, 40] },
]

// メーカー
const manufacturers = [
  "ソニー",
  "パナソニック",
  "シャープ",
  "東芝",
  "日立",
  "三菱電機",
  "アイリスオーヤマ",
  "ダイキン",
  "富士通",
  "キヤノン",
  "エプソン",
  "カシオ",
  "アップル",
  "サムスン",
  "LG",
  "ファーウェイ",
  "デル",
  "レノボ",
  "エイスース",
  "バルミューダ",
  "ダイソン",
  "フィリップス",
  "ブラウン",
  "タイガー",
  "象印",
]

// カラーバリエーション
const colors = [
  "ブラック",
  "ホワイト",
  "シルバー",
  "ゴールド",
  "レッド",
  "ブルー",
  "グリーン",
  "ピンク",
  "パープル",
  "ブラウン",
  "ベージュ",
  "グレー",
  "ネイビー",
  "オレンジ",
  "イエロー",
  "チタン",
  "マットブラック",
  "クリア",
]

// 機能・特徴
const features = [
  "省エネ",
  "ハイスペック",
  "コンパクト",
  "大容量",
  "高画質",
  "高音質",
  "防水",
  "軽量",
  "スマート機能",
  "音声操作",
  "AI搭載",
  "IoT対応",
  "タッチパネル",
  "リモコン付き",
  "自動運転",
  "静音設計",
  "高速処理",
  "大画面",
  "4K対応",
  "5G対応",
  "防塵",
  "長時間バッテリー",
  "急速充電",
]

// シリーズ名
const series = [
  "プレミアム",
  "スタンダード",
  "エコ",
  "プロ",
  "ライト",
  "アドバンス",
  "ネオ",
  "スマート",
  "クラシック",
  "ウルトラ",
  "マックス",
  "ミニ",
  "スリム",
  "ワイド",
  "ハイブリッド",
  "デラックス",
  "エリート",
  "ベーシック",
]

// 在庫状況
const stockStatus = ["在庫あり", "残りわずか", "入荷待ち", "予約受付中", "生産終了"]

// 倉庫コード
const warehouseCodes = ["TK01", "OS02", "NG03", "FK04", "SP05", "KN06", "HK07", "SD08"]

// 注文ステータス
const orderStatus = ["未注文", "注文済", "キャンセル", "納品済", "返品"]

// 評価
const ratings = [1, 2, 3, 3.5, 4, 4.5, 5]

// 型番の接頭辞
const modelPrefixes = ["MD", "EL", "AP", "HM", "DG", "SM", "AV", "PC"]

// 商品名を生成する関数
function generateProductName(category, manufacturer, feature, series, color, size, sizeUnit) {
  const patterns = [
    `${manufacturer} ${category} ${series} ${size}${sizeUnit} ${color}`,
    `${manufacturer} ${series} ${category} ${feature} ${size}${sizeUnit}`,
    `${manufacturer} ${category} ${feature} ${color} ${size}${sizeUnit}`,
    `${manufacturer} ${series} ${size}${sizeUnit} ${category} ${color}`,
    `${manufacturer} ${category} ${color} ${size}${sizeUnit} ${feature}`,
  ]
  return patterns[Math.floor(Math.random() * patterns.length)]
}

// 型番を生成する関数
function generateModelNumber(category, year) {
  const prefix = modelPrefixes[Math.floor(Math.random() * modelPrefixes.length)]
  const categoryCode = category.name.substring(0, 2)
  const serialNumber = randomInt(1000, 9999)
  return `${prefix}-${categoryCode}${year.toString().substring(2)}${serialNumber}`
}

// CSVヘッダーを生成
let csvContent =
  "No,商品名,型式,カテゴリ,メーカー,価格,サイズ,サイズ単位,カラー,特徴,シリーズ,在庫数,入荷数,入荷日,出荷数,出荷日,在庫状況,倉庫コード,注文フラグ,注文ステータス,評価,発売日,保証期間,省エネ評価\n"

// 現在の日付から過去3年間の範囲を設定
const today = new Date()
const threeYearsAgo = new Date()
threeYearsAgo.setFullYear(today.getFullYear() - 3)

console.log("電化製品データベース - サンプルデータ生成開始...")

// 1万件のデータを生成
for (let i = 1; i <= 10000; i++) {
  // 進捗表示
  if (i % 1000 === 0) {
    console.error(`進捗: ${i}/10000 件完了`)
  }

  // ランダムなカテゴリを選択
  const category = categories[Math.floor(Math.random() * categories.length)]

  // ランダムな属性を選択
  const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const feature = features[Math.floor(Math.random() * features.length)]
  const seriesName = series[Math.floor(Math.random() * series.length)]
  const size = randomInt(category.sizeRange[0], category.sizeRange[1])

  // 発売日を生成（過去3年以内）
  const releaseDate = randomDate(threeYearsAgo, today)
  const releaseDateStr = formatDate(releaseDate)

  // 型番を生成
  const modelNumber = generateModelNumber(category, releaseDate.getFullYear())

  // 商品名を生成
  const productName = generateProductName(
    category.name,
    manufacturer,
    feature,
    seriesName,
    color,
    size,
    category.sizeUnit,
  )

  // 価格を生成
  const price = randomPrice(category.priceRange[0], category.priceRange[1])

  // 在庫データを生成
  const incomingQuantity = randomInt(10, 200)
  const outgoingQuantity = randomInt(0, incomingQuantity)
  const currentStock = incomingQuantity - outgoingQuantity

  // 入荷日と出荷日を生成（発売日以降）
  const incomingDate = formatDate(randomDate(releaseDate, today))

  // 出荷日は入荷日以降（出荷数が0の場合は空欄）
  let outgoingDate = ""
  if (outgoingQuantity > 0) {
    const inDate = new Date(incomingDate)
    outgoingDate = formatDate(randomDate(inDate, today))
  }

  // 在庫状況を決定
  let status
  if (currentStock === 0) {
    status = "入荷待ち"
  } else if (currentStock < 5) {
    status = "残りわずか"
  } else if (currentStock > 100) {
    status = "在庫あり"
  } else {
    status = stockStatus[Math.floor(Math.random() * 3)]
  }

  // 倉庫コードをランダムに選択
  const warehouseCode = warehouseCodes[Math.floor(Math.random() * warehouseCodes.length)]

  // 注文フラグをランダムに生成（0または1）
  const orderFlag = Math.random() < 0.3 ? 1 : 0 // 30%の確率で注文あり

  // 注文ステータスを生成
  const order = orderFlag === 1 ? orderStatus[Math.floor(Math.random() * (orderStatus.length - 1)) + 1] : orderStatus[0]

  // 評価をランダムに選択
  const rating = ratings[Math.floor(Math.random() * ratings.length)]

  // 保証期間（1年、3年、5年）
  const warranty = [1, 3, 5][Math.floor(Math.random() * 3)]

  // 省エネ評価（★〜★★★★★）
  const energyRating = "★".repeat(Math.floor(Math.random() * 5) + 1)

  // CSVの行を生成（カンマを含む可能性のある値をダブルクォートで囲む）
  const row = [
    i,
    `"${productName}"`,
    `"${modelNumber}"`,
    `"${category.name}"`,
    `"${manufacturer}"`,
    price,
    size,
    `"${category.sizeUnit}"`,
    `"${color}"`,
    `"${feature}"`,
    `"${seriesName}"`,
    currentStock,
    incomingQuantity,
    incomingDate,
    outgoingQuantity,
    outgoingDate,
    `"${status}"`,
    warehouseCode,
    orderFlag,
    `"${order}"`,
    rating,
    releaseDateStr,
    warranty,
    `"${energyRating}"`,
  ].join(",")

  csvContent += row + "\n"
}

// ファイルに書き込み（UTF-8エンコーディングを明示的に指定）
fs.writeFileSync("electronics_data_utf8.csv", csvContent, "utf8")

console.log("データ生成完了: 10,000件のレコードが生成されました")
console.log("ファイル 'electronics_data_utf8.csv' に保存しました（UTF-8エンコーディング）")
