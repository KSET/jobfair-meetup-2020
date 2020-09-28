export const cleanObjectValues = (
  object,
  {
    allowNull = false,
    toSnakeCase = false,
  } = {},
) => {
  const filter =
    (val) =>
      allowNull
      ? null !== val
      : Boolean(val)
  ;

  const snakeCase =
    (string) =>
      string
        .replace(/([A-Z]+)/g, "_$1")
        .toLowerCase()
        .replace(/^_/, "")
  ;

  const fixCase =
    (arr) =>
      !toSnakeCase
      ? arr
      : arr.map(([ key, value ]) => [ snakeCase(key), value ])
  ;

  const values =
    Object
      .entries(object)
      .filter(([ _, value ]) => filter(value))
  ;

  return Object.fromEntries(fixCase(values));
};

export const generateSetters =
  (item) =>
    Object
      .keys(item)
      .map((key, i) => `"${ key }" = $${ i + 1 }`)
      .join(", ")
;

export const generateValues =
  (item) =>
    Object
      .values(item)
;

export const generateWhere =
  (item, offset) =>
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
    },
    {
      allowNull = false,
      toSnakeCase = true,
    } = {},
  ) => {
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

export const generateUpdateQuery =
  (
    {
      table,
      data,
      where = {},
    },
    {
      allowNull = false,
      toSnakeCase = true,
    } = {},
  ) => {
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
