import {
 RoleNames,
} from "../helpers/permissions";
import {
  AuthRouter,
  Router,
} from "../helpers/route";

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
    /*
    {
      name: "page.name.participants",
      to: { name: "PageSudionici" },
    },
    */
    {
      name: "page.name.contact",
      to: { name: "PageKontakt" },
    },
    {
      name: "page.name.press",
      to: { name: "PagePress" },
    },
    // {
    //   name: "button.joinNow",
    //   setting: "Join Now URL",
    // },
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
      name: "Events",
      to: { name: "PageAdminEventsIndex" },
      icon: "mdi-clipboard-account",
    },
    {
      name: "Resumes",
      to: { name: "PageAdminResumes" },
      icon: "mdi-file-document",
    },
    {
      name: "Panel",
      to: { name: "PageAdminPanelsIndex" },
      requiredRole: RoleNames.ADMIN,
      icon: "mdi-human-queue",
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
