# Pommes — 瞬間ドイツ語作文

日本語→ドイツ語の瞬間作文トレーニングアプリ。A1〜B1、300問収録。

[![App Storeからダウンロード](https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/ja-jp)](https://apps.apple.com/us/app/pommes/id6766652125)

🌐 **Web版**: https://kiskejp.github.io/pommes/

---

## 機能

- カードモード（見て・聞いて答える）
- 入力モード（タイピング採点）
- 苦手問題の自動管理・復習
- 自動再生（JP→DE 連続再生）
- 学習ストリーク記録

## 開発

```bash
cd app/
npm install
npm run dev   # http://localhost:5173
```

詳細は [`app/README.md`](app/README.md) を参照。

## 構成

```
pommes/
├── app/     — Web版（Vite + React）→ GitHub Pages
├── expo/    — iOS版（Expo + React Native）→ App Store
└── design/  — デザインファイル
```
