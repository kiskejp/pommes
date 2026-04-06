# CLAUDE.md — 瞬間Deutsch作文

## プロジェクト概要

アプリ名: **Pommes**（ポムス）
日本語→ドイツ語の瞬間作文トレーニングアプリ。
Vite + React (SPA)。状態管理はすべて React hooks のみ。外部ライブラリなし。

## ブランド

- **アプリ名**: Pommes（ドイツ語でフライドポテトの意）
- **マスコット**: じゃがいも（フラットイラスト）
  - シンプルな2Dフラットスタイル
  - DESIGN.md の白黒ミニマルなUIと対比して、キャラクターのみ色を持たせてよい
  - 使用場面: Completion画面、空状態、ローディングなど

## 起動

```
npm run dev   → http://localhost:5173
npm run build
npm run preview
```

## ファイル構成

```
src/
  data/sentences.json   # 問題データ（ここに追記するだけで問題が増える）
  hooks/
    useTTS.js           # Web Speech API（日本語・ドイツ語TTS）
    useSession.js       # セッション管理（シャッフル・採点・進行）
  components/
    CardMode.jsx        # カードモード（見て答える）
    InputMode.jsx       # 入力モード（タイピング採点）
    ScoreBar.jsx        # スコア表示
    AudioButton.jsx     # 音声再生ボタン
    Completion.jsx      # 完了画面
  App.jsx
  main.jsx

DESIGN.md     # UIデザイン仕様（Figmaスタイル）
```

## デザインシステム

DESIGN.md を参照。Figmaスタイル（白黒ミニマル）。

- 背景: `#ffffff` / サーフェス: `#f8f8f8`
- テキスト: `#000000` / サブ: `#999999`
- ボタン: ピル形（border-radius: 50px）、黒 solid または白 ghost
- アクセントカラーなし — UI chrome は白黒のみ
- フォント: DM Serif Display（日本語・見出し）/ IBM Plex Mono（ドイツ語・ラベル）/ Barlow（本文）

UIを変更する際は必ず DESIGN.md のルールに従うこと。

## 問題データの追加

`src/data/sentences.json` にオブジェクトを追記するだけ。

```json
{
  "id": 13,
  "jp": "私はデザイナーです。",
  "de": "Ich bin Designer.",
  "hint": "sein動詞 + 職業名詞（男性形）",
  "level": "A1",
  "category": "sein動詞"
}
```

- `level`: `"A1"` | `"A2"` | `"B1"`
- `category`: 自由に設定（画面に表示される）

## アーキテクチャの注意点

- `useSession` はシャッフル済みインデックス配列で管理（sentences 配列を直接変更しない）
- `submitInput` は完全一致で採点（trim のみ、大文字小文字は区別する）
- TTS は `voiceschanged` イベント後に初期化されるため、初回レンダリング時は音声なしの可能性あり

## 将来の移行計画

- **Supabase**: sentences.json → DB化、study_logs テーブルで苦手問題管理（README参照）
- **Expo移行**: `useTTS.js` の `speak()` を `expo-speech` に差し替えるだけ（README参照）
