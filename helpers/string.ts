import camelCase from "lodash/fp/camelCase";
import snakeCase from "lodash/fp/snakeCase";
import _isString from "lodash/fp/isString";
import kebabCase from "lodash/fp/kebabCase";
import _capitalize from "lodash/fp/capitalize";
import {
  CamelCase,
  KebabCase,
  SnakeCase,
} from "type-fest";

export const snakeToCamelCase: (val: string) => CamelCase<string> =
  camelCase
;

export const camelToSnakeCase: (val: string) => SnakeCase<string> =
  snakeCase
;

export const camelToKebabCase: (val: string) => KebabCase<string> =
  kebabCase
;

export const isString: (val: unknown) => val is string =
  _isString
;

export const capitalize: (val: string) => Capitalize<string> =
  _capitalize
;

export const toSlug: (val: string) => KebabCase<string> =
  kebabCase
;
