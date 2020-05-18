export default function({ store, redirect, route }) {
  if (!store.state.user.user) {
    const routeData = [
      route.name,
      route.params,
    ];

    const query = {
      r: Buffer.from(JSON.stringify(routeData), "binary").toString("base64"),
    };

    redirect({ name: "PageLogin", query });
  }
}
