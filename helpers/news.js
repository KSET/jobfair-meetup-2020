import {
  formatDate,
} from "./date";
import {
  limitLength,
} from "~/helpers/data";

export const processNewsItem =
  ({ date = "", ...newsItem } = {}) =>
    ({
      ...newsItem,
      date: formatDate(date),
    })
;

export const processNews =
  (news) =>
    limitLength(3)(
      news
        .map(processNewsItem)
      ,
    )
;
