import {
  queryQnaCreate,
  queryQnaDeleteById,
  queryQnaGetAll,
  queryQnaGetById,
  queryQnaUpdateById,
} from "../../db/helpers/qna";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
  objectWithoutKeys,
  pipe,
  reduceArray,
} from "../../helpers/object";
import {
  toSlug,
} from "../../helpers/string";
import {
  ServiceError,
} from "./error-service";

const addSlug =
  (item) =>
    ({
      ...item,
      slug: toSlug(item.question),
    })
;

const segmentParsedItemsIntoCategories =
  (acc, { categoryId, ...item }) => {
    if (!(categoryId in acc)) {
      acc[categoryId] = [];
    }

    const parsedItem = parseItem(item);

    acc[categoryId].push(parsedItem);

    return acc;
  }
;

const parseItem = pipe(
  keysFromSnakeToCamelCase,
  objectWithoutKeys("createdAt", "updatedAt"),
  addSlug,
);

const parseList = pipe(
  keysFromSnakeToCamelCase,
  reduceArray(() => ({}))(segmentParsedItemsIntoCategories),
);

export default class QnaService {
  static async create(
    {
      question,
      answer,
      categoryId,
    },
  ) {
    return await Client.queryOneOnce(queryQnaCreate({
      question,
      answer,
      categoryId,
    }));
  }

  static async list() {
    const data = await Client.queryOnce(queryQnaGetAll());

    return this.ParseList(data);
  }

  static async remove(id) {
    return await Client.queryOneOnce(queryQnaDeleteById({ id }));
  }

  static async update(id, data) {
    const result = await Client.queryOneOnce(queryQnaUpdateById({ id }, data));

    return this.ParseItem(result);
  }

  static async updateOrder(id, by = 1) {
    const client = await Client.inTransaction();

    try {
      const entry = await client.queryOne(queryQnaGetById({ id }));

      if (!entry) {
        throw new ServiceError(`Entry with id ${ id } doesn't exist`);
      }

      const query = queryQnaUpdateById(
        {
          id,
        }, {
          order: entry.order + by,
        },
      );

      const result = await client.queryOne(query);

      await client.commit();

      return this.ParseItem(result);
    } catch (e) {
      await client.rollback();

      return null;
    } finally {
      await client.end();
    }
  }

  static ParseItem(item) {
    return parseItem(item);
  }

  static ParseList(itemList) {
    return parseList(itemList);
  }
}
