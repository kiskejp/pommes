---
name: release-checklist
description: >
  リリース前の確認チェックリストを実行する。バージョン整合、sentences.json 同期状態、
  git の状態、eas.json 設定を自動チェックしてレポートする。
  「リリース前チェック」「checklist」「リリース準備」などで発動。
---

## 概要

App Store リリース前に必要な確認項目を自動チェックしてレポートするスキル。

## チェック項目

### 1. バージョン確認
```bash
node -e "
const app = require('./app/package.json');
const expo = require('./expo/package.json');
const appJson = require('./expo/app.json');
console.log('app/ version:', app.version);
console.log('expo/ version:', expo.version);
console.log('app.json version:', appJson.expo.version);
"
```
→ 3つが一致しているか確認

### 2. sentences.json 同期確認
```bash
diff app/src/data/sentences.json expo/src/data/sentences.json && echo "✅ 同期済み" || echo "❌ 差分あり"
node -e "const s=require('./app/src/data/sentences.json'); console.log('問題数:', s.length)"
```

### 3. git 状態確認
```bash
git status --short
git log --oneline -5
```
→ 未コミットの変更がないか確認

### 4. expo/app.json 確認
```bash
node -e "
const c = require('./expo/app.json').expo;
console.log('name:', c.name);
console.log('slug:', c.slug);
console.log('version:', c.version);
console.log('bundleIdentifier:', c.ios?.bundleIdentifier);
console.log('projectId:', c.extra?.eas?.projectId);
"
```

### 5. eas.json 確認
```bash
node -e "
const e = require('./expo/eas.json');
console.log('CLI version:', e.cli?.version);
console.log('appVersionSource:', e.cli?.appVersionSource);
console.log('production autoIncrement:', e.build?.production?.autoIncrement);
console.log('appleId:', e.submit?.production?.ios?.appleId);
console.log('ascAppId:', e.submit?.production?.ios?.ascAppId);
"
```

### 6. assets 確認
```bash
ls -la expo/assets/
file expo/assets/icon.png expo/assets/splash-icon.png
```
→ icon.png (1024×1024)、splash-icon.png が存在するか確認

## レポート形式

チェック後、以下の形式で報告する：

```
## リリース前チェックレポート

✅ バージョン一致: 1.0.0
✅ sentences.json 同期済み（300問）
✅ git クリーン
✅ app.json 設定OK
✅ eas.json 設定OK
✅ assets 存在確認OK

問題なし。eas build --platform ios を実行できます。
```

問題があれば ❌ で示し、修正方法を提示する。
