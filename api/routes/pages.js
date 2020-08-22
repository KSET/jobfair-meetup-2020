import {
  Router,
  AuthRouter,
} from "../helpers/route";
import {
  RoleNames,
} from "../helpers/permissions";

const router = new Router();

router.get("/list", () => {
  return [
    {
      name: "page.name.blog",
      to: { name: "PageBlogHome" },
    },
    {
      name: "page.name.about",
      to: { name: "PageAbout" },
    },
    {
      name: "page.name.participants",
      to: { name: "PageSudionici" },
    },
    {
      name: "page.name.contact",
      to: { name: "PageKontakt" },
    },
    {
      name: "page.name.press",
      to: { name: "PagePress" },
    },
    {
      name: "button.joinNow",
      setting: "Join Now URL",
    },
  ];
});

const authRouter = AuthRouter.boundToRouter(router, { role: RoleNames.MODERATOR });

authRouter.get("/admin", () => {
  return [
    {
      name: "Home",
      to: { name: "PageAdminIndex" },
      exact: true,
      icon: "mdi-home",
    },
    {
      name: "Press",
      to: { name: "PageAdminPressIndex" },
      icon: "mdi-account-voice",
    },
    {
      name: "News",
      to: { name: "PageAdminNewsList" },
      icon: "mdi-newspaper",
    },
    {
      name: "Translations",
      to: { name: "PageAdminTranslationsList" },
      requiredRole: RoleNames.ADMIN,
      icon: "mdi-transcribe",
    },
    {
      name: "Settings",
      to: { name: "PageAdminSettingsList" },
      requiredRole: RoleNames.ADMIN,
      icon: "mdi-cog",
    },
  ].map(({ requiredRole = RoleNames.MODERATOR, ...entry }) => ({ ...entry, requiredRole }));
});

export default authRouter;
