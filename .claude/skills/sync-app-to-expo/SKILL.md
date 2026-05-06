---
name: sync-app-to-expo
description: >
  app/ から expo/ へソースを同期する。sentences.json のコピー、themes.js の差分確認を行う。
  「expo に反映」「sync」「同期」「sentences をコピー」などで発動。
---

## 概要

`app/src/` の変更を `expo/src/` に反映するスキル。

マスターは常に `app/` 側。`expo/` はコピー先。

## 同期対象ファイル

| app/ | expo/ | 備考 |
|------|-------|------|
| `app/src/data/sentences.json` | `expo/src/data/sentences.json` | 必ず同期 |
| `app/src/themes.js` | `expo/src/themes.js` | 差分確認のみ（構造が異なる場合あり） |

## 手順

1. **差分確認**
```bash
diff app/src/data/sentences.json expo/src/data/sentences.json
diff app/src/themes.js expo/src/themes.js
```

2. **sentences.json をコピー**
```bash
cp app/src/data/sentences.json expo/src/data/sentences.json
```

3. **themes.js は差分を表示して確認を求める**
   - expo版はReact Native用に調整されている場合があるため、自動上書き禁止
   - 差分を見せてユーザーに判断を委ねる

4. **件数確認**
```bash
node -e "const s=require('./app/src/data/sentences.json'); console.log('問題数:', s.length)"
```

5. **git status で変更ファイルを確認して報告**

## 注意

- `expo/src/hooks/` や `expo/src/screens/` は**同期しない**（React Native固有の実装）
- themes.js はオブジェクト構造が同じか確認してから同期
