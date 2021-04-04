import contentDisposition from "content-disposition";
import {
  encodeRow,
} from "../../helpers/csv";

export const sendCsv = (
  response,
  {
    fileName,
    headers,
    rows,
  },
) => {
  response.set("Content-Type", "text/csv");
  response.set("Content-Disposition", contentDisposition(fileName));
  response.set("Content-Transfer-Encoding", "binary");

  response.write(encodeRow(headers));
  for (const row of rows) {
    response.write("\n");
    response.write(encodeRow(row));
  }
  response.end();
};
