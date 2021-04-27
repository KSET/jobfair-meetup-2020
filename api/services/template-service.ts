import path from "path";
import fs from "fs";
import * as Eta from "eta";

const readFile =
  (path: string): Promise<string> =>
    new Promise((resolve) => {
      fs.readFile(
        path,
        {
          encoding: "utf-8",
        },
        (_err, data) =>
          resolve(data)
        ,
      );
    })
;

const templatePath = path.join(__dirname, "../templates/");

Eta.configure({
  views: templatePath,
  async: true,
  cache: false,
  rmWhitespace: true,
});


export default class TemplateService {
  static async render(name: string, data: Record<string, unknown>): Promise<string> {
    const template = Eta.render(
      await this.contentsOf(name),
      data,
      {
        filename: this.pathFor(name),
      },
    );

    return template || "";
  }

  static pathFor(name: string): string {
    return path.join(
      templatePath,
      name,
    );
  }

  static async contentsOf(name: string): Promise<string> {
    const path = this.pathFor(name);

    return await readFile(path);
  }
}
