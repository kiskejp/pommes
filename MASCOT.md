# MASCOT.md — Pommes マスコット仕様

## キャラクター概要

| 項目       | 内容                          |
|------------|-------------------------------|
| 名前       | （未命名）                    |
| モチーフ   | じゃがいも                    |
| スタイル   | 8bitピクセルアート（SVG）      |
| 実装場所   | `src/pages/TitleScreen.jsx` — `PotatoMascot` コンポーネント |

---

## ピクセルグリッド

16×16 ピクセルグリッド、表示サイズ 96×96px（`imageRendering: pixelated`）。

```
. . . . . . . . . . . . . . . .   row 0
. . . . . . . G G . . . . . . .   row 1  ← 芽（中央）
. . . . . . G G G . G . . . . .   row 2  ← 芽（広がり）
. . . . T T T T T T T T . . . .   row 3  ← 体（上端）
. . . T T L L L L L L T T . . .   row 4  ← 体（ハイライト開始）
. . A . T L L L L L L T . A . .   row 5  ← 腕
. . A . T L . L L . L T . A . .   row 6  ← 目
. . . . T L L L L L L T . . . .   row 7
. . . . T L L L L L L T . . . .   row 8
. . . S T L . L L L . T S . . .   row 9  ← 口・影（側面）
. . . . T S S S S S S S T . . .   row 10 ← 影（底部）
. . . . T S S S S S S S T . . .   row 11 ← 影（底部）
. . . . . L L . . L L . . . . .   row 12 ← 脚
. . . . . . . . . . . . . . . .   row 13

記号: T=体(#d4a96a)  L=ハイライト(#e0bc85)  S=影(#b8904f)
      G=芽(#6db56d)  A=腕(#d4a96a)  ■=目・口(#000000)
```

---

## カラーパレット

| 部位         | 色コード    | 役割                   |
|--------------|-------------|------------------------|
| `#e0bc85`    | ハイライト  | 体の正面（明るい面）   |
| `#d4a96a`    | ベース      | 体の側面・腕           |
| `#b8904f`    | シャドウ    | 体の底面・脚           |
| `#6db56d`    | グリーン    | 頭の芽                 |
| `#000000`    | 黒          | 目・口                 |

---

## パーツ構成（SVG `<rect>` 定義）

### 体

```svg
<!-- 体（外形） -->
<rect x="4" y="3" width="8" height="9" fill="#d4a96a" />
<rect x="3" y="4" width="10" height="7" fill="#d4a96a" />

<!-- ハイライト（正面） -->
<rect x="4" y="4" width="8" height="7" fill="#e0bc85" />
```

### 影

```svg
<rect x="4"  y="10" width="8" height="2" fill="#b8904f" />
<rect x="3"  y="9"  width="1" height="2" fill="#b8904f" />
<rect x="12" y="9"  width="1" height="2" fill="#b8904f" />
```

### 目

```svg
<rect x="6" y="6" width="1" height="2" fill="#000000" />
<rect x="9" y="6" width="1" height="2" fill="#000000" />
```

### 口

```svg
<rect x="6" y="9" width="4" height="1" fill="#000000" />
<rect x="7" y="9" width="2" height="1" fill="#000000" />
```

> 口は横一直線 + 中央に1pxの厚みを加えて "にっこり" に見せている。

### 芽

```svg
<rect x="7" y="1" width="2" height="2" fill="#6db56d" />
<rect x="6" y="2" width="1" height="1" fill="#6db56d" />
<rect x="9" y="2" width="1" height="1" fill="#6db56d" />
```

### 腕・脚

```svg
<!-- 腕 -->
<rect x="2"  y="6" width="1" height="2" fill="#d4a96a" />
<rect x="13" y="6" width="1" height="2" fill="#d4a96a" />

<!-- 脚 -->
<rect x="5" y="12" width="2" height="1" fill="#b8904f" />
<rect x="9" y="12" width="2" height="1" fill="#b8904f" />
```

---

## 使用場所

| 画面               | 使用方法                        | 備考                                 |
|--------------------|---------------------------------|--------------------------------------|
| タイトル画面       | `<PotatoMascot />` を表示       | ロゴの上に配置、サイズ 96×96px       |
| Completion画面     | 未実装（追加候補）              | スコアに応じて表情バリアント検討     |
| 空状態・エラー     | 未実装（追加候補）              |                                      |

---

## 将来のバリアント案

| バリアント   | 変更箇所                          |
|--------------|-----------------------------------|
| 喜び         | 口を `∧` 形（上向き弧）に変更    |
| 悲しみ       | 口を `∨` 形（下向き弧）に変更    |
| 驚き         | 目を `○` に変更、口を小さく      |
| 完璧クリア   | 芽を大きく、腕を上げたポーズ      |

バリアントは `PotatoMascot` に `variant` prop を追加して実装予定。

---

## 実装ルール

- SVG は常にインライン（`<img>` タグ不使用）
- `imageRendering: 'pixelated'` を必ず指定してぼやけを防ぐ
- viewBox は `"0 0 16 16"` 固定（グリッドを崩さない）
- サイズ変更は `width` / `height` prop のみで行う（viewBox は変更しない）
- UIは白黒ミニマル（DESIGN.md準拠）だが、マスコットのみ上記カラーパレットを使用してよい
