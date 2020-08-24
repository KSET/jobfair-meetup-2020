import {
  querySettingsGetByKey,
} from "../../db/helpers/settings";
import {
  Client,
} from "../../db/methods";

/**
 * @param {string} key
 * @template T
 * @param {T} fallback
 * @return {Promise<string|T>}
 */
export const getSetting = async (key, fallback = null) => {
  const client = await Client.connected();
  const { value = null } = await client.queryOne(querySettingsGetByKey(key)) || {};

  if (null === value) {
    return fallback;
  }

  return value;
};
