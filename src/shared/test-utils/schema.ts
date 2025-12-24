import { Schema } from "effect";

/**
 * スキーマの特定のフィールドを新しい定義で置き換える (omit + extend のラッパー)
 *
 * @param key - 置き換えるフィールド名
 * @param newSchema - 新しいスキーマ定義
 */
export const replaceField =
  <K extends string, NewA, NewI, NewR>(
    key: K,
    newSchema: Schema.Schema<NewA, NewI, NewR>,
  ) =>
  <A, I, R>(
    self: Schema.Schema<A, I, R>,
  ): Schema.Schema<
    Omit<A, K> & { [P in K]: NewA },
    // biome-ignore lint/suspicious/noExplicitAny: Encoded type is complex to calculate
    any,
    R | NewR
  > =>
    self.pipe(
      // @ts-expect-error omit の型推論を回避してジェネリックに扱う
      Schema.omit(key),
      Schema.extend(
        Schema.Struct({
          [key]: newSchema,
        } as Record<K, Schema.Schema<NewA, NewI, NewR>>),
      ),
      // biome-ignore lint/suspicious/noExplicitAny: Force cast to match the return type
    ) as any;

/**
 * テスト用に DateFromSelf フィールドを Date に置き換える
 *
 * @param key - 置き換える日付フィールド名
 */
export const replaceDateForTest = <K extends string>(key: K) =>
  replaceField(key, Schema.Date);

/**
 * テスト用に Nullable DateFromSelf フィールドを Nullable Date に置き換える
 *
 * @param key - 置き換える日付フィールド名
 */
export const replaceNullableDateForTest = <K extends string>(key: K) =>
  replaceField(key, Schema.NullOr(Schema.Date));
