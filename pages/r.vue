<template>
  <div>
    Please wait...
  </div>
</template>

<router>
Name: PageRedirect
</router>

<script>
  import {
    decodeRedirectParam,
  } from "../helpers/url";

  export default {
    middleware(
      {
        route,
        redirect,
      },
    ) {
      const { r } = route.query;

      const routeData = decodeRedirectParam(
        r,
        {
          name: "Index",
          params: {},
        },
      );

      redirect(routeData);
    },
  };
</script>
