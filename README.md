# 遊びのしおり｜しかざわのTRPG記録

Notionのアナログゲーム管理表から、公開用のシナリオ一覧を作りました。

- 作品名・読み仮名・略称で検索
- 通過済／既知／回せるシナリオで絞り込み
- システム別、通過予定・未知・既知かも・要確認で絞り込み
- スマートフォン対応
- URLの検索条件を共有可能
- 外部ライブラリ、ログイン、APIキーは不要

## GitHub Pagesへの公開

新しいリポジトリに、このフォルダの内容を配置してください。書斎全体のリポジトリやバックアップは不要です。

1. このフォルダの内容を `main` ブランチへ入れる。
2. GitHubの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選ぶ。
3. **Actions → Publish scenario list → Run workflow** を実行する。

付属ワークフローは `index.html` と `.nojekyll` だけをPagesへ配信します。
公開先はGitHubが返すPages URLを使ってください。

`index.html` はデータを内蔵しています。ダウンロードして直接開いても一覧を確認できます。

## 掲載データ

2026-11-09時点。262シナリオ。名前のない行と、システムが「ボドゲ」のみの行は除外しています。

公開フィールドは、作品名・読み仮名/略称・システム・形式・公開状態・回せるか・作品URLだけです。
秘匿HO、役職、日程、自由メモ、感想タグ、所持状況、KP回数、Notion内部リンク、探索者データ、電子書庫データは同梱していません。
状態を判定するために原本の役職やタグを参照しますが、これらの値自体は公開データへ出力しません。

### 初期判定

- **通過済**：原本で「既知」、かつPL側のHO/役職が登録済み。通過予定は除く。
- **既知**：原本が「既知」で、上記の通過済判定に当てはまらない。
- **回せる**：原本に「部屋があるのですぐ回せます」があり、「回さない」がない。
- **既知かも**：原本が「知ってるんだろうなぁ……」。
- **要確認**：状態が未登録、またはPL記録があるのに「未知」など矛盾がある。
- 通過予定の設定、または未来の通過日があれば通過済にはしない。

「所持」「回したい」「KP経験あり」だけでは、現在回せると断定しません。
「回せる」は現在の募集や日程確約を意味しません。

## 更新方法

### 公開データを直接更新

GitHub上で `data/scenarios.json` を編集してコミットすると、公開時にHTMLへ反映されます。ローカルで確認する場合は、Node.jsで以下を実行し、変更したJSONとHTMLを一緒にコミットします。

```sh
node scripts/build.mjs
node --test scripts/build.test.mjs
```

`knowledge` は `played` / `known` / `planned` / `unknown` / `uncertain` / `unconfirmed`。
`canRun` は `true` または `false` です。`updatedAt` も更新してください。

### 個別の判定を修正

`data/overrides.json` に作品名ごとの判定を書いて再ビルドします。

```json
{
  "作品名": { "knowledge": "played", "canRun": true }
}
```

### Notionの最新データから再作成

Notionの行をプロパティ名つきJSON配列として、リポジトリの外へ一時保存します。

```sh
node scripts/build.mjs /absolute/path/to/source-private.json YYYY-MM-DD
node --test scripts/build.test.mjs
```

これは自動同期ではありません。GitHubでの更新時点の内容を公開します。
原本のJSONやCSVはリポジトリに入れないでください。生成されるJSONは公開フィールドのみです。

## ファイル

- `index.html`：公開ページ。CSS・JavaScript・公開データを内蔵。
- `data/scenarios.json`：公開データ。
- `data/overrides.json`：個別判定の上書き。
- `scripts/build.mjs`：公開用フィールドへの変換とHTML更新。
- `scripts/build.test.mjs`：状態判定・非公開項目の除外・埋め込みの検証。
- `.github/workflows/pages.yml`：GitHub Pages公開。

Notionの原本と、本人用の「しかざわの書斎」は変更していません。
