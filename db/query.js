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
