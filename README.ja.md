# cssgrep

<p align="center">
  <img src="docs/assets/header.svg" alt="cssgrep" width="100%">
</p>

<p align="center">
  <a href="https://github.com/izag8216/cssgrep/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/izag8216/cssgrep/ci.yml?branch=main&style=for-the-badge&logo=github&logoColor=white&label=CI" alt="CI">
  </a>
  <img src="https://img.shields.io/badge/Node-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/npm/v/cssgrep?style=for-the-badge&logo=npm&logoColor=white&color=CB3837" alt="npm">
  <img src="https://img.shields.io/badge/License-MIT-3EA638?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License">
</p>

**cssgrep** は、設定不要の CLI ツールで、CSS の監査を行います。未使用セレクタの検出、カラーパレットの抽出、セレクタ特異性の監査を、1つのコマンドで実行できます。

ビルド連携は不要。ローカルで実行し、ネットワーク通信も行いません。

## 機能

- **未使用セレクタ検出** -- CSS を HTML と照合し、マッチする要素がないセレクタを発見
- **カラー抽出** -- スタイルシート全体から色を抽出・正規化・カタログ化
- **特異性監査** -- W3C 特異性スコアを計算し、複雑すぎるセレクタをフラグ
- **複数の出力形式** -- 見やすいターミナル出力、テーブル、JSON（CI 連携用）
- **ゼロ設定** -- 合理的なデフォルトですぐに使える

## インストール

```bash
# グローバルインストール（推奨）
npm install -g cssgrep

# npx で使用（インストール不要）
npx cssgrep unused --css "src/**/*.css" --html "public/**/*.html"

# 開発依存としてインストール
npm install --save-dev cssgrep
```

## クイックスタート

```bash
# 未使用 CSS セレクタを検出
cssgrep unused --css "src/**/*.css" --html "dist/**/*.html"

# スタイルシートからすべての色を抽出
cssgrep colors "src/**/*.css" --format hsl --output palette

# セレクタ特異性を監査
cssgrep specificity "src/**/*.css" --threshold "1,3,3"
```

## コマンド

### `cssgrep unused`

HTML ファイル内にマッチする要素が存在しない CSS セレクタを検出します。

```bash
cssgrep unused --css "src/**/*.css" --html "public/**/*.html"
cssgrep unused --css "dist/bundle.css" --html "index.html" --format json
```

### `cssgrep colors`

CSS ファイルからすべての色の値を抽出し、正規化します。

```bash
cssgrep colors "src/**/*.css"
cssgrep colors "theme.css" --format hsl --output palette --verbose
```

### `cssgrep specificity`

特異性スコアを計算し、閾値を超えるセレクタをフラグします。

```bash
cssgrep specificity "src/**/*.css"
cssgrep specificity "critical.css" --threshold "1,3,3" --sort desc
```

## プログラムatic API

```typescript
import { findUnusedSelectors, extractColors, analyzeSpecificity, scanFiles } from 'cssgrep';

const cssFiles = await scanFiles('src/**/*.css');
const htmlFiles = await scanFiles('public/**/*.html');

const unused = findUnusedSelectors(cssFiles, htmlFiles);
const colors = extractColors(cssFiles, { colorFormat: 'hex', includeKeywords: false });
const highSpec = analyzeSpecificity(cssFiles, [2, 4, 5]);
```

## ライセンス

MIT License. [LICENSE](LICENSE) を参照。

---

[English](README.md) | [日本語](README.ja.md)
