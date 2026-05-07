# pommes（公開用リポジトリ）

> **開発は `german-apps` リポジトリに移行しました。**
> このリポジトリは GitHub Pages の公開 URL を維持するために残しています。

## 公開 URL

- https://kiskejp.github.io/pommes/
- https://kiskejp.github.io/pommes/privacy.html （App Store 登録済み・変更禁止）

## ブランチの役割

| branch | 役割 |
|--------|------|
| `main` | 移行前の開発履歴 / このリポジトリの案内（編集不要） |
| `gh-pages` | Pages 公開用ビルド成果物（`german-apps` CI が自動更新） |

## 開発・更新について

Pommes の開発本体は以下に移行しました：

```
github.com/kiskejp/german-apps
  apps/pommes/
    web/    ← Web 版の開発はここ
    expo/   ← Expo / iOS 版の開発はここ
```

`german-apps/apps/pommes/web/` を変更して push すると、
GitHub Actions が自動でビルドし、このリポジトリの `gh-pages` branch に反映されます。

## このリポジトリへの手動コミットについて

- `main` への手動コミットは不要です
- `gh-pages` は CI 専用です。手動で push しないでください
