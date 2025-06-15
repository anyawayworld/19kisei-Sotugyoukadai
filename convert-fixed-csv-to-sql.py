# 修正されたCSVファイルをSQLに変換するスクリプト

import os
from datetime import datetime

def parse_csv_simple(line):
    fields = []
    current = ''
    in_quotes = False
    
    for char in line:
        if char == '"':
            in_quotes = not in_quotes
        elif char == ',' and not in_quotes:
            fields.append(current.strip().strip('"'))
            current = ''
        else:
            current += char
    fields.append(current.strip().strip('"'))
    return fields

def clean_value(value):
    if isinstance(value, str):
        return value.replace("'", "''")
    return value

def main():
    print("=== 修正済みCSVファイルからSQL変換 ===")
    
    csv_file = 'electronics_data_fixed.csv' if os.path.exists('electronics_data_fixed.csv') else 'electronics_data.csv'
    
    if not os.path.exists(csv_file):
        print(f" CSVファイルが見つかりません: {csv_file}")
        return
    
    print(f" 使用するCSVファイル: {csv_file}")
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        print(f" CSV読み込み成功: {len(lines)}行")
        
        if len(lines) < 2:
            print(" CSVファイルにデータが不足しています")
            return
        
        headers = parse_csv_simple(lines[0].strip())
        print(f" ヘッダー: {len(headers)}列")
        
        data = []
        for line in lines[1:]:
            line = line.strip()
            if not line:
                continue
            values = parse_csv_simple(line)
            if len(values) == len(headers):
                data.append(dict(zip(headers, values)))
        
        print(f" データ読み込み: {len(data)}件")
        
        os.makedirs('sql_import', exist_ok=True)
        
        category_map = {
            'テレビ': 1, '冷蔵庫': 2, '洗濯機': 3, 'エアコン': 4, '電子レンジ': 5,
            '掃除機': 6, 'オーディオ': 7, 'デジタルカメラ': 8, 'ノートパソコン': 9,
            'タブレット': 10, 'スマートフォン': 11, '炊飯器': 12, 'ドライヤー': 13,
            '加湿器': 14, '扇風機': 15
        }
        
        manufacturer_map = {
            'ソニー': 1, 'パナソニック': 2, 'シャープ': 3, '東芝': 4, '日立': 5,
            '三菱電機': 6, 'アイリスオーヤマ': 7, 'ダイキン': 8, '富士通': 9, 'キヤノン': 10,
            'エプソン': 11, 'カシオ': 12, 'アップル': 13, 'サムスン': 14, 'LG': 15,
            'ファーウェイ': 16, 'デル': 17, 'レノボ': 18, 'エイスース': 19, 'バルミューダ': 20,
            'ダイソン': 21, 'フィリップス': 22, 'ブラウン': 23, 'タイガー': 24, '象印': 25
        }
        
        with open('sql_import/01_insert_products.sql', 'w', encoding='utf-8') as f:
            f.write("-- 製品データの挿入\n")
            f.write("USE electronics_inventory;\n\n")
            f.write("INSERT INTO products (product_id, product_name, model_number, category_id, manufacturer_id, price, size, size_unit, color, features, series, release_date, warranty_period, energy_rating) VALUES\n")
            
            values = []
            for row in data:
                try:
                    product_id = int(row.get('No', 0))
                    product_name = clean_value(row.get('商品名', ''))
                    model_number = clean_value(row.get('型式', ''))
                    category_id = category_map.get(clean_value(row.get('カテゴリ', '')), 1)
                    manufacturer_id = manufacturer_map.get(clean_value(row.get('メーカー', '')), 1)
                    price = float(row.get('価格', 0))
                    size = float(row.get('サイズ', 0))
                    size_unit = clean_value(row.get('サイズ単位', ''))
                    color = clean_value(row.get('カラー', ''))
                    features = clean_value(row.get('特徴', ''))
                    series = clean_value(row.get('シリーズ', ''))
                    release_date = row.get('発売日', '2023-01-01')
                    warranty_period = int(row.get('保証期間', 1))
                    energy_rating = clean_value(row.get('省エネ評価', ''))
                    
                    value = f"({product_id}, '{product_name}', '{model_number}', {category_id}, {manufacturer_id}, {price}, {size}, '{size_unit}', '{color}', '{features}', '{series}', '{release_date}', {warranty_period}, '{energy_rating}')"
                    values.append(value)
                except:
                    continue
            
            f.write(',\n'.join(values))
            f.write(';\n')
        
        print(f" SQL生成完了: {len(values)}件")
        print(" sql_import/01_insert_products.sql が作成されました")
        
    except Exception as e:
        print(f" エラー: {e}")

if __name__ == "__main__":
    main()
