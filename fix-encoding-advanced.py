# 高度なエンコーディング修正スクリプト

import os
import codecs
import chardet

def detect_encoding(file_path, num_bytes=10000):
    """ファイルのエンコーディングを検出"""
    print(f"🔍 ファイル '{file_path}' のエンコーディングを検出中...")
    
    try:
        with open(file_path, 'rb') as f:
            raw_data = f.read(num_bytes)
            result = chardet.detect(raw_data)
            encoding = result['encoding']
            confidence = result['confidence']
            print(f"✅ 検出されたエンコーディング: {encoding} (信頼度: {confidence:.2f})")
            return encoding
    except Exception as e:
        print(f"❌ エンコーディング検出エラー: {e}")
        return 'utf-8'  # デフォルト

def convert_file_encoding(input_file, output_file, source_encoding, target_encoding='utf-8'):
    """ファイルのエンコーディングを変換"""
    print(f"🔄 '{input_file}' を {source_encoding} から {target_encoding} に変換中...")
    
    try:
        with codecs.open(input_file, 'r', encoding=source_encoding, errors='replace') as f_in:
            content = f_in.read()
            
        with codecs.open(output_file, 'w', encoding=target_encoding) as f_out:
            f_out.write(content)
            
        print(f"✅ 変換完了: '{output_file}'")
        return True
    except Exception as e:
        print(f"❌ 変換エラー: {e}")
        return False

def analyze_csv_content(file_path, encoding='utf-8'):
    """CSVファイルの内容を分析"""
    print(f"🔍 CSVファイルの内容を分析中...")
    
    try:
        with codecs.open(file_path, 'r', encoding=encoding, errors='replace') as f:
            lines = f.readlines()
            
        if not lines:
            print("❌ ファイルが空です")
            return
            
        print(f"📊 総行数: {len(lines)}")
        
        # ヘッダー行を分析
        header = lines[0].strip()
        print(f"📋 ヘッダー行: {header[:100]}...")
        
        # カンマの数をカウント
        comma_count = header.count(',')
        print(f"📊 ヘッダー行のカンマ数: {comma_count}")
        
        # 最初の数行を表示
        print("\n📋 最初の3行:")
        for i in range(min(3, len(lines))):
            print(f"  行 {i+1}: {lines[i].strip()[:100]}...")
            
    except Exception as e:
        print(f"❌ 分析エラー: {e}")

def fix_csv_encoding():
    """CSVファイルのエンコーディングを修正"""
    print("=== CSVエンコーディング修正（高度版） ===")
    
    # 入力ファイルの確認
    input_file = 'electronics_data.csv'
    if not os.path.exists(input_file):
        print(f"❌ 入力ファイルが見つかりません: {input_file}")
        return
    
    # ファイルサイズを確認
    file_size = os.path.getsize(input_file)
    print(f"📁 ファイルサイズ: {file_size:,} バイト")
    
    # エンコーディングを検出
    detected_encoding = detect_encoding(input_file)
    
    # 一般的な日本語エンコーディングを試す
    encodings_to_try = [
        detected_encoding,
        'utf-8',
        'utf-8-sig',
        'shift_jis',
        'cp932',
        'euc-jp',
        'iso-2022-jp'
    ]
    
    # 各エンコーディングで変換を試みる
    for i, encoding in enumerate(encodings_to_try):
        output_file = f'electronics_data_enc{i+1}.csv'
        
        print(f"\n🔄 試行 {i+1}: {encoding} エンコーディングで変換")
        success = convert_file_encoding(input_file, output_file, encoding)
        
        if success:
            print(f"📊 変換後のファイル分析:")
            analyze_csv_content(output_file)
    
    print("\n✅ 複数のエンコーディングで変換を試みました")
    print("各ファイルを確認し、最も正しく表示されているものを使用してください")
    print("例: electronics_data_enc1.csv, electronics_data_enc2.csv, ...")

if __name__ == "__main__":
    fix_csv_encoding()
