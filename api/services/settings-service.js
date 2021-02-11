import {
  querySettingsCreate,
  querySettingsGetAll,
  querySettingsGetByKey,
  querySettingsUpdateByKey,
} from "../../db/helpers/settings";
import {
  Client,
} from "../../db/methods";

export default class SettingsService {
  static async list() {
    return await Client.queryOnce(querySettingsGetAll());
  }

  static async getValue(key, fallback = null) {
    const {
      value = fallback,
    } = await Client.queryOneOnce(querySettingsGetByKey(key)) || {};

    return value;
  }

  static async update(key, value) {
    const client = await Client.inTransaction();

    try {
      const setting = await client.queryOne(querySettingsGetByKey(key)) || {};

      if (!setting.key) {
        setting.key = key;
        setting.value = value;

        const { id } = await client.queryOne(querySettingsCreate(setting));

        setting.id = id;
      } else {
        setting.value = value;

        await client.query(querySettingsUpdateByKey(key, value));
      }

      await client.commit();

      return setting;
    } catch (e) {
      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }
}
