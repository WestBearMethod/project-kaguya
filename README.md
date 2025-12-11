# リポジトリの内容

プログラミング実務未経験者が Google Antigravity を利用し、以下の動画内容のアプリケーションを実装したものです。  
https://youtu.be/lJaHSbygvTM

## 使用技術スタック

| 役割 | 技術 |
| -- | -- |
| アプリケーション | TypeScript / Elysia / Effect |
| データベース | PostgreSQL |
| DB クライアント | Drizzle ORM |
| リンター / フォーマッター | Biome |
| パッケージ管理 / 実行 | Bun |
| テストランナー | Bun |

## Effect の簡易的な説明

当リポジトリのコードを読むにあたって必要な Effect の知識を以下に記述します。  
この説明による記述以外にも Effect を用いて同様の処理を実現させる方法はあるので、冗長な書き方になっている可能性があります。  
また、間違っている可能性もあるので正確な説明は以下の公式ドキュメントを参照して下さい。  
https://effect.website/docs

関数のシグネチャを見ただけで処理に失敗する可能性があるか判断するために Effect を使用しています。  
**『入力型 => 出力型』** というシグネチャを Effect を用いて **『入力型 => Effect.Effect<成功型, 失敗型, 依存関係>』** というシグネチャで表します。

出力型をアンラップしたい場合は、値の前に `*yield` と記述します。  
これによって、`Effect.Effect<成功型, 失敗型, 依存関係>` が `成功型` だった場合は成功型を返します。  
しかし、もしアンラップしようとした値が `失敗型` だった場合はアンラップを試みた関数自体が失敗型を返すことになります。  
また、Effect.Effect をアンラップするために `*yield` を使用するには `Effect.gen(function* (){})` で定義されたスコープ内である必要があります。  
いまいち分かりづらい場合は、Promise 型をアンラップするために `await` を実行するには `async` の関数内である必要があるようなものと思って下さい。  
`Effect.gen(function* (){})` が返す値は `async` が Promise でラップした値を返すように `Effect.Effect<成功型, 失敗型, 依存関係>` でラップされます。

なので最終的に、Effect でラップされた値を使用するために `Effect.runPromiseExit` を使用しています。  
これによって Effect.runPromiseExit での戻り値を受け取った変数は `成功型 もしくは 失敗型` の値を保持する `Exit<成功型, 失敗型>` 型の値になります。  
そして、Exit 型の値を扱うには `Exit.match` を使用します。  
このパターンマッチにより、成功型と失敗型で処理を分岐させ、それぞれの値を用いた処理を実行しています。  
今回の例でいうと 分岐先で HTTP ステータスコード 200 と 500 の値を返す処理を実行しています。

## セットアップ

このセットアップは前提条件として、 Docker Compose を利用できる環境に関して記述しています。  
GitHub からリポジトリをクローンして、**.env.sample** を **.env** にコピーして下さい。  
しかし、書き換える場所が 1 点必要で、**.env.sample** では DB_HOST=localhost と記述していますが、ローカル環境では Docker Compose でデータベースを起動するので、**.env** には DB_HOST=db と記述して下さい。

プロジェクトルート上で以下のコマンドを実行して下さい。

```sh
docker compose up -d
```

次に、以下のコマンドを実行して下さい。

```sh
bun i
bun run db:push
bun run dev
```

これでターミナル上に開発サーバーにアクセスする URL が表示されると思います。

## 手動テスト

以下のコマンドで開発サーバーを起動させます。

```sh
bun run dev
```

ブラウザで http://localhost:3000/openapi にアクセスすれば、HTTP リクエスト、レスポンスの型情報が表示されます。
そこで直接リクエストを送信することもできます。

もし、データベースのマイグレーションが必要な場合は、以下のコマンドを実行して下さい。

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

## コードの記述例

### HTTP リクエスト、レスポンスの定義を /openapi エンドポイントから確認するために必要なコード

https://github.com/WestBearMethod/project-kaguya/blob/2af503a099e2a482dafda70236cca8cce662fa22/src/index.ts

### Effect.schema を用いて HTTP リクエスト、レスポンスを安全に処理するために必要なコード

Elysia が受け取った HTTP リクエストを自動的に型安全な値に変換します。  
また、返す HTTP レスポンスを自動的に JSON 形式に変換します。  https://github.com/WestBearMethod/project-kaguya/blob/2af503a099e2a482dafda70236cca8cce662fa22/src/infrastructure/description/description.ts

他にも Effect 外で Effect 型でラップされた値を利用するために Effect.runPromiseExit を使用し Exit 型に変換し、パターンマッチで値をアンラップしています。

### 成功型を返す処理と失敗型を返す処理をテストコードで保証する

コントローラーが Effect のレイヤーを受け取れるようにしています。  
なので成功用のレイヤーと失敗用のレイヤー、テストしたい方のレイヤーを渡すことで、成功型と失敗型の処理をテストコードで保証することができます。  
https://github.com/WestBearMethod/project-kaguya/blob/2af503a099e2a482dafda70236cca8cce662fa22/src/infrastructure/description/description.test.ts
