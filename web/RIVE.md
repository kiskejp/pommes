# RIVE.md — Pommes マスコットアニメーション

## ファイル

| 場所 | パス |
|------|------|
| Web版（ソース） | `app/public/pommes.riv` |
| Expo版（取得元） | `https://kiskejp.github.io/pommes/pommes.riv` |

**変更時**: `app/public/pommes.riv` を差し替え → GitHub Pages にデプロイ → Expo が自動反映。

---

## State Machine "Main" — 構成

| レイヤー | 役割 |
|---------|------|
| Body    | 胴体・表情アニメーション |
| Arms    | 腕アニメーション（arms_flap / arms_wiggle） |
| Blink   | まばたき |

### Input

| 名前 | 種類 | デフォルト |
|------|------|-----------|
| `scene` | Number | 0 |

### scene 値

| scene | Body の状態 | Arms の状態 | 使用箇所 |
|-------|------------|------------|---------|
| 0 | idle        | arms_flap  | デフォルト / Completion 中間スコア |
| 1 | jump        | arms_flap  | Completion 高スコア（80%以上） |
| 2 | idle        | arms_wiggle | TitleScreen ホバー時 |
| 3 | bad         | arms_flap  | CardMode・Completion 低スコア（50%未満） |

> scene=2 は Body に遷移が定義されていないため idle のまま。Arms 層のみ切り替わる。

---

## 遷移構造

### Body レイヤー

```
Entry        ──▶ idle
idle         ──(scene == 1)──▶ jump
idle         ──(scene == 3)──▶ bad
jump         ──(scene == 0)──▶ idle
bad          ──(scene == 0)──▶ idle
```

### Arms レイヤー

```
Entry        ──▶ arms_flap
arms_flap    ──(scene == 2)──▶ arms_wiggle
arms_wiggle  ──(scene == 0)──▶ arms_flap
```

---

## RiveMascot コンポーネント（Web版）

`app/src/components/RiveMascot.jsx`

```jsx
<RiveMascot size={160} scene={mascotScene} />
// scene: 0=idle, 2=arms_wiggle, 3=bad
```

```js
useRive({
  stateMachines: 'Main',
  animations: 'arms_flap',   // 初期ロード時の Arms デフォルト
  autoplay: true,
})
```

State Machine input に `scene` をそのまま渡す（変換しない）:

```js
const sceneInput = rive.stateMachineInputs('Main')?.find(i => i.name === 'scene')
if (sceneInput) sceneInput.value = scene
```

---

## TitleScreen のホバー実装

ホバー開始・終了で scene を切り替える。終了時は `key` を変えて **RiveMascot を再マウント**することで、Rive 内部の arms_wiggle 再生状態を確実にリセットする。

```jsx
const [mascotScene, setMascotScene] = useState(0)
const [mascotKey,   setMascotKey]   = useState(0)

<div
  onPointerEnter={() => setMascotScene(2)}
  onPointerLeave={() => {
    setMascotScene(0)
    setMascotKey(k => k + 1)   // 再マウントで Rive 状態をリセット
  }}
>
  <RiveMascot key={mascotKey} size={160} scene={mascotScene} />
</div>
```

> **なぜ再マウントが必要か**  
> `scene=0` を渡しても Rive 内部の arms_wiggle 状態が残ることがある。  
> `key` を変えてコンポーネントごと作り直すことで初期状態（idle / arms_flap）に確実に戻る。

---

## Riveエディタの罠

| 罠 | 症状 | 対処 |
|----|------|------|
| `[Any State]` からの遷移 | `exceeded max iterations` ループ | 使わない。明示的な遷移のみ |
| トランジション条件が空欄 | 常にtrueになり無限ループ | 必ず入力名（`scene`）を選択してから値を設定 |
| 空の Lua スクリプト | `Blank Script 1:1: module must return a value` | Scripts パネルで削除 |
| Arms に outgoing 遷移あり（条件空欄） | `exceeded max iterations in layer Arms` | 条件は必ず明示。`[Any State]` を使わない |
| scene=2 を `? 0 : scene` で変換 | Arms State Machine に届かず arms_wiggle 未発火 | `sceneInput.value = scene` をそのまま渡す |

---

## Expo版

`expo/src/components/RiveMascot.jsx`

```jsx
<RiveMascot size={96} scene={0} />
```

Expo 版は GitHub Pages の URL からファイルを取得するため、  
`app/public/pommes.riv` を更新したら必ずデプロイすること。
