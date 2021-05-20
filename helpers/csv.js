export const escapeCsvValue =
  (str) =>
    String(str)
      .replace(/"/gi, "\"\"")
      .replace(/\n/gi, "\t")
;

export const encodeRow =
  (entries) =>
    `"${ entries.map(escapeCsvValue).join("\",\"") }"`
;
