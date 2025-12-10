## ローカル環境での環境変数について

**.env.sample** では DB_HOST=localhost と記述していますが、ローカル環境では Docker Compose でデータベースを起動するので、**.env** には DB_HOST=db と記述して下さい。

## 自動テスト

### プレコミットフック

lefthook を使用してコミット前に自動でテストが実行されます。

```bash
# lefthook のインストール (初回のみ)
bunx lefthook install
```

### CI/CD

GitHub Actions を使用して、プッシュおよびプルリクエスト時に自動テストが実行されます。
