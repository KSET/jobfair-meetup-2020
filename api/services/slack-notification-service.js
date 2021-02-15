import {
  keysFromCamelCaseToSnakeCase,
  pickKeysFn,
  pipe,
} from "../../helpers/object";
import {
  post,
} from "../helpers/axios";
import SettingsService from "./settings-service";

export default class SlackNotificationService {
  static async notifyOfNewApplication(
    {
      companyNameLegal,
      companyNameDisplay,
      companyHomepage,
      contactName,
      contactEmail,
      contactPhone,
      talk,
      workshop,
      panel,
    },
  ) {
    const has = (bool) => bool ? ":white_check_mark:" : ":x:";

    const text = `
*NOVA PRIJAVA*
-------------------------
*Poduzeće*
 - Ime: ${ companyNameDisplay }
 - Pravno ime: ${ companyNameLegal }
 - Stranica: ${ companyHomepage }

*Kontakt*
 - Ime: ${ contactName }
 - Email: ${ contactEmail }
 - Broj: ${ contactPhone }

*Odabrano*
 - Talk: ${ has(talk) }
 - Workshop: ${ has(workshop) }
 - Panel: ${ has(panel) }
-------------------------
`;

    const channel =
      ("production" === process.env.NODE_ENV)
      ? "#prijave"
      : "#prijave-test"
    ;

    return await this.SendPayload({
      username: "JFM Prijavljivator",
      channel,
      text,
    });
  }

  static async SendPayload(
    {
      text,
      channel,
      username = "JFM Notifikator",
      iconUrl = "https://jobfairmeetup.fer.unizg.hr/icon.png",
      iconEmoji = null,
    },
  ) {
    const webhookUrl = await SettingsService.getValue("Slack Webhook URL");

    if (!webhookUrl) {
      return false;
    }

    const format = pipe(
      keysFromCamelCaseToSnakeCase,
      pickKeysFn.bind(null, (a) => a),
    );

    const payload = format({
      text,
      channel,
      username,
      iconUrl,
      iconEmoji,
    });

    return await post(webhookUrl, payload);
  }
}
