export const isObject =
  (value) =>
    "[object Object]" === Object.prototype.toString.call(value) &&
    "Object" === value.constructor.name
;

export const createObject =
  (obj) =>
    isObject(obj)
    ? Object
      .entries(obj)
      .map(
        ([ key, val ]) =>
          isObject(val)
          ? `${ key } { ${ createObject(val) } }`
          : key
        ,
      )
    : String(obj)
;

export const createMutation =
  (name, args, obj) =>
    `mutation ${ name }(${ args.map((arg) => `$${ arg }`).join(", ") }) { ${ createObject(obj) } }`
;
