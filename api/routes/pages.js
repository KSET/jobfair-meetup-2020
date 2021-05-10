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
    {
      name: "page.name.participants",
      to: { name: "PageSudionici" },
      showOffline: false,
    },
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
  ].map((p) => ({
    showOffline: true,
    ...p,
  }));
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
      name: "Event management",
      to: { name: "PageAdminEventIndex" },
      icon: "mdi-eye-settings",
    },
    {
      name: "Site configuration",
      to: { name: "PageAdminConfigurationIndex" },
      icon: "mdi-cog",
    },
  ].map(({ requiredRole = RoleNames.MODERATOR, ...entry }) => ({ ...entry, requiredRole }));
});

export default authRouter;
