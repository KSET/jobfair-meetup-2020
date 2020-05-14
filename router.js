import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export async function createRouter(ssrContext, createDefaultRouter) {
  const defaultRouter = createDefaultRouter(ssrContext);
  return new Router({
    ...defaultRouter.options,
    routes: await fixRoutes(defaultRouter.options.routes),
  });
}

async function fixRoutes(defaultRoutes) {
  const routeChildren = [];

  async function getRouteInfo(route) {
    const { component, children = [] } = route;
    const newComponent = await component();

    if (children) {
      routeChildren.push(...children);
    }

    return newComponent || component;
  }

  async function updateRoute(route) {
    const routeInfo = await getRouteInfo(route);

    // Set the route name
    route.name = routeInfo.name;

    if (!routeInfo.head) {
      return;
    }

    // Add head data to route meta
    route.meta = {
      ...route.meta,
      head: await routeInfo.head(),
    };
  }

  for (const route of defaultRoutes) {
    await updateRoute(route);
  }

  for (const route of routeChildren) {
    await updateRoute(route);
  }

  // Default routes that come from `pages/`
  return defaultRoutes;
}
