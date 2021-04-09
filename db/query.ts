import _ from "lodash/fp";
import {
  keysFromSnakeToCamelCase,
} from "../helpers/object";
import type {
  Query,
} from "./methods";

interface CleanOptionsValues {
  allowNull: boolean,
  toSnakeCase: boolean,
}

type CleanOptions = Partial<CleanOptionsValues>;
type URecord = Record<string, unknown>;

export const cleanObjectValues = (
  object: URecord,
  {
    allowNull = false,
    toSnakeCase = false,
  }: CleanOptions = {},
): URecord => {
  const filter =
    (val) =>
      val !== undefined &&
      (
        allowNull ||
        null !== val
      )
  ;

  const fixCase =
    (arr) =>
      !toSnakeCase
      ? arr
      : arr.map(([ key, value ]) => [ _.snakeCase(key), value ])
  ;

  const format =
    _.flow(
      _.toPairs,
      _.filter(([ , value ]) => filter(value)),
      fixCase,
      _.fromPairs,
    )
  ;

  return format(object);
};

export const generateSetters: (item: URecord) => string =
  _.flow(
    _.keys,
    _.map.convert({ cap: false })((key, i) => `"${ key }" = $${ i + 1 }`),
    _.join(", "),
  )
;

export const generateValues =
  (item: URecord): unknown[] =>
    Object
      .values(item)
;

export const generateWhere =
  (item: URecord, offset: number): string =>
    Object
      .keys(item)
      .map((key, i) => `"${ key }" = $${ offset + i + 1 }`)
      .join(" and ")
;

export const generateInsertQuery =
  (
    {
      table,
      data,
    }: {
      table: string;
      data: URecord,
    },
    {
      allowNull = false,
      toSnakeCase = true,
    }: CleanOptions = {},
  ): Query => {
    const item = cleanObjectValues(data, { allowNull, toSnakeCase });

    const $keys = Object.keys(item);
    const attributes = `"${ $keys.join("\", \"") }"`;
    const keys = $keys.map((_, i) => `$${ i + 1 }`);
    const values = generateValues(item);

    return {
      text: `
      insert into ${ table }
        (${ attributes })
      values
        (${ keys })
      returning *
    `.replace(/\s+/gi, " ").trim(),
      values: [
        ...values,
      ],
    };
  }
;

const filterData = (data: URecord, allowedKeys: string[]): URecord => {
  const fixedData = keysFromSnakeToCamelCase(data);

  if (0 === allowedKeys.length) {
    return fixedData;
  }

  return _.pick(allowedKeys, fixedData);
};

export const insertQuery =
  (table: string) =>
    (
      {
        allowedKeys = [],
        options = {},
      }: {
        allowedKeys?: string[],
        options?: CleanOptions,
      } = {},
    ) =>
      (data: URecord): Query =>
        generateInsertQuery(
          {
            table,
            data: filterData(data, allowedKeys),
          },
          options,
        )
;

export const generateUpdateQuery =
  (
    {
      table,
      data,
      where = {},
    }: {
      table: string;
      data: URecord;
      where: URecord;
    },
    {
      allowNull = false,
      toSnakeCase = true,
    }: CleanOptions = {},
  ): Query => {
    const item = cleanObjectValues(data, { allowNull, toSnakeCase });

    const setters = generateSetters(item);
    const values = generateValues(item);

    const whereItem = cleanObjectValues(where, { allowNull, toSnakeCase });
    const whereSetters = generateWhere(whereItem, values.length);
    const whereValues = generateValues(whereItem);

    return {
      text: `
      update
        ${ table }
      set
        ${ setters }
      where
        ${ whereSetters }
      returning *
    `.replace(/\s+/gi, " ").trim(),
      values: [
        ...values,
        ...whereValues,
      ],
    };
  }
;

export const updateQuery =
  (table: string) =>
    (
      {
        allowedKeys = [],
        allowedWhereKeys = [],
        options,
      }: {
        allowedKeys?: string[];
        allowedWhereKeys?: string[];
        options?: CleanOptions;
      } = {},
    ) =>
      (
        where: URecord,
        data: URecord,
      ): Query =>
        generateUpdateQuery(
          {
            table,
            data: filterData(data, allowedKeys),
            where: filterData(where, allowedWhereKeys),
          },
          options,
        )
;
