import _ from "lodash/fp";
import {
  queryPressReleaseCreate,
  queryPressReleaseDeleteById,
  queryPressReleaseGetAll,
  queryPressReleaseGetById,
  queryPressReleaseUpdateById,
} from "../../db/helpers/pressRelease";
import {
  Client,
} from "../../db/methods";
import {
  formatDate,
} from "../../helpers/date";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";
import {
  apiFilePath,
} from "../helpers/file";
import {
  HttpStatus,
} from "../helpers/http";
import {
  ServiceError,
} from "./error-service";

interface DbPressRelease {
  id: number;
  title: string;
  // eslint-disable-next-line camelcase
  file_id: number;
  date: Date;
  // eslint-disable-next-line camelcase
  created_at: Date;
  // eslint-disable-next-line camelcase
  updated_at: Date;
  path?: string;
}

export interface MutableFields {
  title: string;
  fileId: number;
  date?: Date;
}

export interface PressRelease {
  id: number;
  title: string;
  fileId: number;
  url: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const formatItem = ({ date, fileId, ...r }: PressRelease): PressRelease => ({
  ...r,
  fileId,
  url: apiFilePath({ fileId }),
  date: formatDate(date),
});

const formatItems = _.flow(
  keysFromSnakeToCamelCase,
  _.omit([ "path" ]),
  _.map(formatItem),
);

const validateMutable =
  (
    {
      title,
      fileId,
    }: MutableFields,
  ): void => {
    if (!title) {
      throw new PressReleaseError(
        "no-title",
        [
          "The title is missing",
        ],
        HttpStatus.Error.Forbidden,
      );
    }

    if (!fileId) {
      throw new PressReleaseError(
        "no-file",
        [
          "The file is missing",
        ],
        HttpStatus.Error.Forbidden,
      );
    }
  }
;

export class PressReleaseError extends ServiceError {
}

export default class PressReleaseService {
  static async list(): Promise<PressRelease[]> {
    const all = await Client.queryOnce<DbPressRelease>(queryPressReleaseGetAll());

    if (!all) {
      return [];
    }

    return this.FormatItems(all);
  }

  static async info(id: number): Promise<PressRelease> {
    const item = await Client.queryOneOnce<DbPressRelease>(queryPressReleaseGetById({ id }));

    if (!item) {
      throw new PressReleaseError("not-found", null, HttpStatus.Error.Client.NotFound);
    }

    return this.FormatItem(item);
  }

  static async create(
    {
      title,
      fileId,
      date,
    }: MutableFields,
  ): Promise<PressRelease> {
    validateMutable({
      title,
      fileId,
      date,
    });

    const release = await Client.queryOneOnce<DbPressRelease>(queryPressReleaseCreate({
      title,
      fileId,
      date,
    }));

    if (!release) {
      throw new PressReleaseError(
        "something-went-wrong",
        [
          "Something went wrong. Please try again",
        ],
        HttpStatus.Error.Forbidden,
      );
    }

    return this.FormatItem(release);
  }

  static async update(
    id: number,
    {
      title,
      fileId,
      date,
    }: MutableFields,
  ): Promise<PressRelease> {
    validateMutable({
      title,
      fileId,
      date,
    });

    const client = new Client();

    try {
      await client.connect();
      await client.startTransaction();

      const release = await client.queryOne<DbPressRelease>(queryPressReleaseGetById({ id }));

      if (!release) {
        throw new PressReleaseError(
          "no-press-release",
          [
            "Press release not found",
          ],
          HttpStatus.Error.Forbidden,
        );
      }

      const newRelease = await client.queryOne<DbPressRelease>(queryPressReleaseUpdateById(
        {
          id,
        },
        {
          title,
          fileId,
          date,
        },
      ));

      if (!newRelease) {
        throw new PressReleaseError(
          "no-press-release",
          [
            "Something went wrong. Please try again",
          ],
          HttpStatus.Error.Forbidden,
        );
      }

      await client.commit();

      return this.FormatItem(newRelease);
    } catch (e) {
      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }

  static async delete(id: number): Promise<number> {
    await Client.queryOnce(queryPressReleaseDeleteById({ id }));

    return id;
  }

  static FormatItems(items: DbPressRelease[]): PressRelease[] {
    return formatItems(items);
  }

  static FormatItem(item: DbPressRelease): PressRelease {
    return formatItems([ item ]).pop();
  }
}
