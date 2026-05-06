---
name: add-sentences
description: >
  新しい例文を sentences.json に追加する。フォーマット検証、ID採番、
  app/ と expo/ 両方への書き込みを行う。
  「例文追加」「問題を追加」「sentences に追加」「新しい問題」などで発動。
---

## 概要

`app/src/data/sentences.json` に新しい例文を追加し、`expo/src/data/sentences.json` にも同期するスキル。

## フォーマット

```json
{
  "id": 301,
  "jp": "私はデザイナーです。",
  "jp_yomi": "わたしはデザイナーです。",
  "de": "Ich bin Designerin.",
  "hint": "sein動詞 + 職業名詞",
  "level": "A1",
  "category": "sein動詞",
  "scene": "仕事・職場"
}
```

### フィールド仕様

| フィールド | 必須 | 値 |
|-----------|------|-----|
| `id` | ✅ | 現在の最大ID + 1（自動採番） |
| `jp` | ✅ | 日本語例文 |
| `jp_yomi` | - | TTS用読み仮名（省略可） |
| `de` | ✅ | ドイツ語訳 |
| `hint` | ✅ | 文法ヒント |
| `level` | ✅ | `"A1"` / `"A2"` / `"B1"` |
| `category` | ✅ | 文法カテゴリ |
| `scene` | ✅ | 使用場面（下記参照） |

### scene の値
`"自己紹介"` / `"日常生活"` / `"買い物"` / `"レストラン・カフェ"` /
`"交通・移動"` / `"仕事・職場"` / `"観光・旅行"` / `"病院・緊急"` / `"学校・勉強"`

## 手順

1. **現在の最大IDと件数を確認**
```bash
node -e "
const s = require('./app/src/data/sentences.json');
const maxId = Math.max(...s.map(x => x.id));
console.log('現在の件数:', s.length);
console.log('最大ID:', maxId);
console.log('次のID:', maxId + 1);
"
```

2. **ユーザーから例文情報を収集**（不足フィールドがあれば質問する）

3. **フォーマット検証**
   - `de` にウムラウト（ä/ö/ü/ß）が含まれているか確認
   - `level` が A1/A2/B1 のいずれかか確認
   - `scene` が定義済みの値か確認

4. **app/src/data/sentences.json に追記**（配列末尾に追加）

5. **expo/src/data/sentences.json に同期**
```bash
cp app/src/data/sentences.json expo/src/data/sentences.json
```

6. **追加後の件数確認**
```bash
node -e "const s=require('./app/src/data/sentences.json'); console.log('追加後:', s.length, '問')"
```

7. **git diff で変更内容を確認して報告**

## 複数追加の場合

ユーザーが複数の例文をまとめて提供した場合は、一括でバリデーションしてから追記する。
