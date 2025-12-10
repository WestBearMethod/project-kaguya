## ローカル環境での環境変数について

**.env.sample** では DB_HOST=localhost と記述していますが、ローカル環境では Docker Compose でデータベースを起動するので、**.env** には DB_HOST=db と記述して下さい。

## 手動テスト

以下のコマンドで開発サーバーを起動させます。

```sh
bun run dev
```

ブラウザで http://localhost:3000/openapi にアクセスすれば、HTTP リクエスト、レスポンスの型情報が表示されます。
そこで直接リクエストを送信することもできます。

もし、データベースのマイグレーションが必要な場合は、以下のコマンドを実行してください。

```sh
bun run db:generate
bun run db:push
```

## 自動テスト

### プレコミットフック

lefthook を使用してコミット前に自動でテストが実行されます。

```bash
# lefthook のインストール (初回のみ)
bunx lefthook install
```

### CI/CD

GitHub Actions を使用して、プッシュおよびプルリクエスト時に自動テストが実行されます。
