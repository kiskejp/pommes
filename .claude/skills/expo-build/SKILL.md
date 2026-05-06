---
name: expo-build
description: >
  EAS Build を実行してビルド状況を監視し、エラーを解析する。
  「ビルド」「eas build」「App Store 用ビルド」「iOS ビルド」などで発動。
---

## 概要

`eas build --platform ios` を実行し、結果を確認・解析するスキル。

## 前提確認

ビルド前に以下を確認する：

```bash
# expo ディレクトリで実行
cd expo

# 設定確認
node -e "const c=require('./app.json').expo; console.log('version:', c.version, 'bundleId:', c.ios?.bundleIdentifier)"

# git 状態（EAS はgitアーカイブを使用）
git status --short
git log --oneline -1
```

**未コミットの重要な変更があれば、先にコミットするよう促す。**

## ビルド実行

```bash
cd /Volumes/SanDisk/Projects/app/app/pommes/expo
eas build --platform ios 2>&1
```

## よくあるエラーと対処法

### storyboard エラー
```
withIosSplashScreenStoryboardBaseMod: Cannot read properties of undefined (reading '0')
```
→ `npx expo prebuild --clean --platform ios` を実行して storyboard を再生成

### package.json not found
```
package.json does not exist in /Users/expo/workingdir/build/expo
```
→ expo/ ディレクトリが git にコミットされていない  
→ `.gitignore` から `expo/` を削除してコミット

### credentials エラー
```
Credentials are not set up. Run this command again in interactive mode.
```
→ インタラクティブなターミナルで `eas build --platform ios` を実行する必要あり  
→ Claude から直接実行不可。ユーザーにターミナルで実行してもらう

### EAS outage
```
EAS Submit is experiencing a partial outage.
```
→ https://status.expo.dev/ を確認  
→ Transporter アプリで手動アップロードを案内

## ビルド成功後

```bash
# 最新ビルドの情報確認
cd expo && eas build:list --platform ios --limit 1 --json 2>/dev/null
```

成功したら `.ipa` URL を表示し、次のステップ（`eas submit` または Transporter）を案内する。

## submit 手順案内

EAS Submit が使える場合：
```bash
cd expo && eas submit --platform ios
```

EAS が不安定な場合 → **Transporter** アプリを使用：
1. Mac App Store から Transporter をダウンロード（無料）
2. `.ipa` をドラッグ＆ドロップ
3. 「デリバリ」をクリック
