import {
 encodeRedirectParam,
} from "~/helpers/url";

export default function({ store, redirect, route }) {
  if (!store.state.user.user) {
    const query = {
      r: encodeRedirectParam(route),
    };

    return redirect({ name: "PageLogin", query });
  }
}
