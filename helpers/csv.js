export const escapeCsvValue =
  (str) =>
    String(str)
      .replaceAll("\"", "\"\"")
      .replaceAll("\n", "\t")
;

export const encodeRow =
  (entries) =>
    `"${ entries.map(escapeCsvValue).join("\",\"") }"`
;
