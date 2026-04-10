# 瞬間Deutsch作文

どんどん話すための瞬間ドイツ語作文トレーニングアプリ。

## セットアップ

```bash
npm install
npm run dev
```

## ファイル構成

```
src/
  data/
    sentences.json       # ← ここに文章を追加するだけ
  hooks/
    useTTS.js            # Web Speech API（日本語・ドイツ語TTS）
    useSession.js        # セッション管理（スコア・シャッフル・採点）
  components/
    CardMode.jsx         # カードモード（見て・聞いて・話す）
    InputMode.jsx        # 入力モード（タイピング採点）
    ScoreBar.jsx         # スコア表示
    AudioButton.jsx      # 音声再生ボタン
    Completion.jsx       # 完了画面
  App.jsx
  main.jsx
```

## 文章データの追加

`src/data/sentences.json` にオブジェクトを追加するだけ：

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

**level**: `"A1"` / `"A2"` / `"B1"`  
**category**: 文型グループ名（自由に設定可）

---

## Supabase移行プラン（次のステップ）

### テーブル設計

```sql
-- 文章マスタ
create table sentences (
  id          serial primary key,
  jp          text not null,
  de          text not null,
  hint        text,
  level       text default 'A1',
  category    text,
  created_at  timestamptz default now()
);

-- 学習履歴（将来：苦手問題の繰り返し機能）
create table study_logs (
  id           serial primary key,
  sentence_id  int references sentences(id),
  result       text check (result in ('ok','ng')),
  mode         text check (mode in ('card','input')),
  studied_at   timestamptz default now()
);
```

### 移行手順

1. Supabaseプロジェクト作成
2. 上記テーブルを作成
3. `sentences.json` の内容を INSERT
4. `useSession.js` の `sentences` prop を `useSentences()` フック（Supabase fetch）に置き換え
5. `submitInput` / `advance` 時に `study_logs` に INSERT

### Expo移行時のTTS差し替え

```js
// useTTS.js の speak() を以下に置き換え
import * as Speech from 'expo-speech'
Speech.speak(text, { language: lang === 'ja' ? 'ja-JP' : 'de-DE', rate: 0.9 })
```
