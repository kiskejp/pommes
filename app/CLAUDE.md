# CLAUDE.md — Pommes（瞬間ドイツ語作文）

## プロジェクト概要

アプリ名: **Pommes**（ポムス）
日本語→ドイツ語の瞬間作文トレーニングアプリ。A1〜B1、300問収録。

## プロジェクト構成

```
pommes/
├── app/          ← Web版（Vite + React SPA）★メイン開発
├── expo/         ← モバイル版（Expo + React Native）★開発中
└── design/       ← デザインファイル
```

**開発ルール:**
- 新機能は `app/` で先に開発・確認してから `expo/` に反映する
- `sentences.json` は `app/src/data/` がマスター、`expo/src/data/` にコピーして使用
- git commit は機能単位でこまめに行う
- **git操作はすべて `pommes/` ディレクトリから行う**（リポジトリルートが `pommes/` のため）

## ブランド

- **アプリ名**: Pommes（ドイツ語でフライドポテトの意）
- **マスコット**: じゃがいも（16×16ピクセルアートスタイル）
  - 使用場面: TitleScreen（吹き出し付き浮遊）、Completion画面（バウンス）など
  - `variant`: `normal` | `happy` | `happy-no-mouth` | `blink-no-mouth` | `thinking`

## app/ — Web版

### 起動

```
cd app/
npm run dev   → http://localhost:5173
npm run build
npm run preview
```

### ファイル構成

```
src/
  data/sentences.json        # 問題データ（マスター）
  context/
    ThemeContext.jsx          # テーマ管理（Context API）
  themes.js                  # 4テーマ定義（pommes/figma/pop/mint）
  pages/
    TitleScreen.jsx           # タイトル・スタート画面
  components/
    CardMode.jsx              # カードモード（見て答える）
    InputMode.jsx             # 入力モード（タイピング採点）
    Completion.jsx            # 完了画面
    PotatoMascot.jsx          # SVGマスコット
    ScoreBar.jsx              # スコア表示
    AudioButton.jsx           # 音声再生ボタン
  hooks/
    useSession.js             # セッション管理（シャッフル・採点・進行）
    useTTS.js                 # Web Speech API（日本語・ドイツ語TTS）
    useWeakIds.js             # 苦手問題ID管理（localStorage）
    useStudyRecord.js         # 学習記録・連続日数（localStorage）
    useAutoPlay.js            # 自動再生（JP→pause→DE→pause→次へ）
    useAudioSettings.js       # JP/DE音声ON/OFF設定
    useAutoPlay.js
  App.jsx
  main.jsx
```

### デザインシステム

`src/themes.js` に4テーマ定義。デフォルトは `pommes`（じゃがいも色）。

| テーマ | 背景 | アクセント |
|--------|------|-----------|
| pommes | `#fffdf7` | `#d4a96a` |
| figma  | `#ffffff` | `#000000` |
| pop    | `#ffffff` | `#FFD600` |
| mint   | `#f5fffc` | `#3dbf8a` |

- ボタン: ピル形（border-radius: 50px）、solidまたはghost
- フォント: Paytone One（ロゴ）/ IBM Plex Mono（ラベル・ドイツ語）/ Barlow（本文）

## expo/ — モバイル版

### 起動

```
cd expo/
npx expo start
```

### ファイル構成

```
src/
  data/sentences.json        # app/からコピー
  themes.js                  # app/と同内容
  hooks/
    useSession.js             # app/と同一（変更なし）
    useTTS.js                 # expo-speech に移植
    useWeakIds.js             # AsyncStorage に移植
    useStudyRecord.js         # AsyncStorage に移植
    useAutoPlay.js            # Expo用に移植
  components/
    Mascot.jsx                # react-native-svg でSVG実装・Animatedアニメーション付き
    ScoreBar.jsx
  screens/
    TitleScreen.jsx           # マスコット吹き出し・テーマ/モード切替
    StudyScreen.jsx           # カードモード（自動再生・スコア3列）
    InputScreen.jsx           # 入力モード（ウムラウトキー付き）
    CompletionScreen.jsx
App.js
```

### app/ → expo/ 移植ポイント

| app/ | expo/ |
|------|-------|
| `localStorage` | `AsyncStorage` |
| `window.speechSynthesis` | `expo-speech` (`Speech.speak/stop`) |
| `div/button/p` | `View/TouchableOpacity/Text` |
| CSS | `StyleSheet.create()` |
| SVG（`<svg>`） | `react-native-svg`（`<Svg><Rect>`） |
| CSSアニメーション | `Animated` API（`Animated.loop/sequence/timing`） |

## 問題データの追加

`app/src/data/sentences.json` にオブジェクトを追記するだけ。

```json
{
  "id": 13,
  "jp": "私はデザイナーです。",
  "jp_yomi": "わたしはデザイナーです。",
  "de": "Ich bin Designer.",
  "hint": "sein動詞 + 職業名詞（男性形）",
  "level": "A1",
  "category": "sein動詞",
  "scene": "仕事・職場"
}
```

- `level`: `"A1"` | `"A2"` | `"B1"`
- `jp_yomi`: TTS用読み仮名（省略可。ある場合はTTSで優先使用）
- `scene` の値:
  `"自己紹介"` / `"日常生活"` / `"買い物"` / `"レストラン・カフェ"` /
  `"交通・移動"` / `"仕事・職場"` / `"観光・旅行"` / `"病院・緊急"` / `"学校・勉強"`

追記後、`expo/src/data/sentences.json` にコピーすること。

## アーキテクチャの注意点

- `useSession` はシャッフル済みインデックス配列で管理（sentences 配列を直接変更しない）
- `submitInput` は完全一致で採点（trim のみ、大文字小文字は区別する）
- テーマはすべての画面に `theme` prop で渡す（Context不使用、expo版）
- expo版の `useStudyRecord.addResult` は async（AsyncStorage）のため副作用に注意
