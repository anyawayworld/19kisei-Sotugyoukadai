# バイナリモードでCSVを読み込み、SQLに変換するスクリプト

import os
import re
from datetime import datetime

def find_csv_file():
    """利用可能なCSVファイルを探す"""
    possible_files = [
        'electronics_data.csv',
        'electronics_data_fixed.csv',
        'electronics_data_enc1.csv',
        'electronics_data_enc2.csv'
    ]
    
    for file in possible_files:
        if os.path.exists(file):
            print(f"✅ CSVファイルを発見: {file}")
            return file
    
    print("❌ CSVファイルが見つかりません")
    return None

def extract_csv_structure(file_path):
    """CSVファイルの構造を抽出（バイナリモード）"""
    print(f"🔍 CSVファイル構造を分析中: {file_path}")
    
    # ファイルをバイナリモードで開く
    with open(file_path, 'rb') as f:
        # 最初の数行を読み込む
        lines = []
        for _ in range(10):  # 最初の10行
            line = f.readline()
            if not line:
                break
            lines.append(line)
    
    # 行区切り文字を検出
    if b'\r\n' in lines[0]:
        line_ending = b'\r\n'
        print("  検出された行区切り: CRLF (Windows)")
    elif b'\n' in lines[0]:
        line_ending = b'\n'
        print("  検出された行区切り: LF (Unix/Linux)")
    else:
        line_ending = b'\n'  # デフォルト
        print("  行区切りを検出できませんでした。LFを使用します")
    
    # 列数を検出（カンマの数+1）
    comma_count = lines[0].count(b',')
    print(f"  検出された列数: {comma_count + 1}")
    
    return {
        'line_ending': line_ending,
        'column_count': comma_count + 1
    }

def convert_binary_csv_to_sql():
    """バイナリモードでCSVを読み込み、SQLに変換"""
    print("=== バイナリモードCSV→SQL変換 ===")
    
    # CSVファイルを探す
    csv_file = find_csv_file()
    if not csv_file:
        return
    
    # 出力ディレクトリを作成
    os.makedirs('sql_binary', exist_ok=True)
    
    try:
        # CSVファイルの構造を抽出
        structure = extract_csv_structure(csv_file)
        line_ending = structure['line_ending']
        expected_columns = structure['column_count']
        
        print(f"📊 予想される列数: {expected_columns}")
        
        # CSVファイルをバイナリモードで読み込み
        with open(csv_file, 'rb') as f:
            content = f.read()
        
        # 行に分割
        lines = content.split(line_ending)
        print(f"📊 総行数: {len(lines)}")
        
        # 空の行を除去
        lines = [line for line in lines if line.strip()]
        print(f"📊 空行除去後: {len(lines)}行")
        
        if not lines:
            print("❌ 有効なデータがありません")
            return
        
        # ヘッダー行を取得
        header_line = lines[0]
        
        # ヘッダーをカンマで分割
        headers = header_line.split(b',')
        print(f"📋 ヘッダー列数: {len(headers)}")
        
        # 製品IDとモデル番号のインデックスを特定
        id_index = -1
        model_index = -1
        
        for i, header in enumerate(headers):
            header_str = header.decode('utf-8', errors='replace').lower()
            if 'no' in header_str or 'id' in header_str:
                id_index = i
            if 'model' in header_str or '型式' in header_str:
                model_index = i
        
        if id_index == -1:
            id_index = 0  # デフォルト: 最初の列
            print(f"⚠️  ID列が見つかりませんでした。インデックス {id_index} を使用します")
        else:
            print(f"✅ ID列を検出: インデックス {id_index}")
            
        if model_index == -1:
            model_index = 1  # デフォルト: 2番目の列
            print(f"⚠️  モデル番号列が見つかりませんでした。インデックス {model_index} を使用します")
        else:
            print(f"✅ モデル番号列を検出: インデックス {model_index}")
        
        # SQLファイルを生成
        print("🔄 SQLファイル生成中...")
        
        with open('sql_binary/simple_products.sql', 'w', encoding='utf-8') as f:
            f.write("-- 製品データ（シンプル版）\n")
            f.write("USE electronics_inventory;\n\n")
            f.write("INSERT INTO products (product_id, model_number) VALUES\n")
            
            values = []
            for i, line in enumerate(lines[1:], 1):  # ヘッダーをスキップ
                try:
                    # カンマで分割
                    fields = line.split(b',')
                    
                    # 必要なフィールドを取得
                    if id_index < len(fields):
                        product_id = i  # 行番号をIDとして使用
                        
                        # モデル番号を取得（文字化けしていても一意の識別子として使用可能）
                        if model_index < len(fields):
                            model_raw = fields[model_index]
                            # 非ASCII文字を除去
                            model_clean = re.sub(rb'[^\x00-\x7F]+', b'', model_raw)
                            model_number = model_clean.decode('ascii', errors='replace')
                        else:
                            model_number = f"MODEL-{i}"
                        
                        # 特殊文字をエスケープ
                        model_number = model_number.replace("'", "''")
                        
                        value = f"({product_id}, '{model_number}')"
                        values.append(value)
                        
                except Exception as e:
                    if i <= 5:  # 最初の5つのエラーのみ表示
                        print(f"⚠️  行 {i} の処理でエラー: {e}")
                    continue
            
            # SQLを書き込み
            f.write(',\n'.join(values))
            f.write(';\n')
        
        print(f"✅ SQLファイル生成完了: sql_binary/simple_products.sql ({len(values)}件)")
        
        # 在庫データも生成
        with open('sql_binary/simple_inventory.sql', 'w', encoding='utf-8') as f:
            f.write("-- 在庫データ（シンプル版）\n")
            f.write("USE electronics_inventory;\n\n")
            f.write("INSERT INTO inventory (product_id, warehouse_id, current_stock) VALUES\n")
            
            values = []
            for i in range(1, len(lines)):
                value = f"({i}, 'TK01', 50)"  # 各製品に50個の在庫を設定
                values.append(value)
            
            # SQLを書き込み
            f.write(',\n'.join(values))
            f.write(';\n')
        
        print(f"✅ SQLファイル生成完了: sql_binary/simple_inventory.sql ({len(values)}件)")
        
        print("\n🎉 変換完了！")
        print("次のステップ:")
        print("1. create-database-complete.sql を実行してデータベースを作成")
        print("2. sql_binary/simple_products.sql を実行して製品データをインポート")
        print("3. sql_binary/simple_inventory.sql を実行して在庫データをインポート")
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    convert_binary_csv_to_sql()
