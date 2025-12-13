import { Schema } from "effect";

/**
 * テスト用に DateFromSelf フィールドを Date に置き換える
 *
 * HTTP レスポンスをテストでパースする際、Schema.DateFromSelf は
 * すでに Date オブジェクトとして受け取った値を再パースしようとして失敗する。
 * この関数でテスト用のスキーマに変換する。
 *
 * @param fieldName - 置き換える日付フィールド名
 * @returns テスト用の Schema.Date を持つ Struct
 *
 * @example
 * ```typescript
 * export const DescriptionSummaryResponse = DescriptionSummary.pipe(
 *   Schema.omit("createdAt"),
 *   Schema.extend(dateFieldForTest("createdAt")),
 * );
 * ```
 */
export const dateFieldForTest = <K extends string>(fieldName: K) =>
  Schema.Struct({
    [fieldName]: Schema.Date,
  } as Record<K, typeof Schema.Date>);

/**
 * Nullable な日付フィールド用
 *
 * @param fieldName - 置き換える日付フィールド名
 * @returns テスト用の Schema.NullOr(Schema.Date) を持つ Struct
 *
 * @example
 * ```typescript
 * export const DescriptionResponse = Description.pipe(
 *   Schema.omit("deletedAt"),
 *   Schema.extend(nullableDateFieldForTest("deletedAt")),
 * );
 * ```
 */
export const nullableDateFieldForTest = <K extends string>(fieldName: K) => {
  const schema = Schema.NullOr(Schema.Date);
  return Schema.Struct({
    [fieldName]: schema,
  } as Record<K, typeof schema>);
};
