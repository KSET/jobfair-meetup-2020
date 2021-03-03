import {
  queryCompanyApplicationTokenCreate,
  queryCompanyApplicationTokenGetAll,
  queryCompanyApplicationTokenGetByToken,
  queryCompanyApplicationTokenConsume,
  queryCompanyApplicationTokenDeleteById,
} from "../../db/helpers/companyApplicationToken";
import {
  Client,
} from "../../db/methods";
import {
  keysFromSnakeToCamelCase,
} from "../../helpers/object";

export default class CompanyApplicationTokenService {
  static async createApplicationToken(createdBy, note = "") {
    const client = await Client.inTransaction();

    try {
      const token = this.GenerateToken();

      const newToken = await client.queryOne(queryCompanyApplicationTokenCreate({
        token,
        note: String(note || ""),
        createdBy,
      }));

      await client.commit();

      return this.FixToken(newToken);
    } catch (e) {
      await client.rollback();

      throw e;
    } finally {
      await client.end();
    }
  }

  static async getApplicationTokenByToken(token) {
    const dbToken = await Client.queryOneOnce(queryCompanyApplicationTokenGetByToken({
      token,
    }));

    return this.FixToken(dbToken);
  }

  static async deleteApplicationTokenById(id) {
    return await Client.queryOneOnce(queryCompanyApplicationTokenDeleteById({
      id,
    }));
  }

  static async isApplicationTokenValid(token) {
    const dbToken = await this.getApplicationTokenByToken(token);

    return Boolean(dbToken && !dbToken.used);
  }

  static async consumeApplicationToken({ token, applicationId }, dbClient = null) {
    const client = dbClient || await Client.inTransaction();

    try {
      const dbToken = await client.queryOne(queryCompanyApplicationTokenGetByToken({
        token,
      }));

      if (!dbToken) {
        return false;
      }

      await client.query(queryCompanyApplicationTokenConsume(dbToken.id, applicationId));

      if (!dbClient) {
        await client.commit();
      }

      return true;
    } catch (e) {
      if (!dbClient) {
        await client.rollback();
      }

      return false;
    } finally {
      if (!dbClient) {
        await client.end();
      }
    }
  }

  static async listApplicationTokens() {
    const tokens = await Client.queryOnce(queryCompanyApplicationTokenGetAll());

    return tokens.map(this.FixToken);
  }

  static GenerateToken() {
    const hrTime = process.hrtime.bigint().toString(36);
    const dateTime = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2);

    return `${ dateTime }-${ random }-${ hrTime }`;
  }

  static FixToken(token) {
    return keysFromSnakeToCamelCase(token);
  }
}
