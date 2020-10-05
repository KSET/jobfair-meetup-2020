<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>Prijava firmi</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <iframe
          :id="`JotFormIFrame-${formId}`"
          :src="`https://form.jotform.com/${formId}`"
          allow="geolocation; microphone; camera"
          allowfullscreen="true"
          allowtransparency="true"
          frameborder="0"
          onload="window.parent.scrollTo(0,0)"
          scrolling="no"
          style="min-width: 100%; height: 3550px; border: none;"
          title="Form"
        />
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PagePrijavaFirmi
</router>

<script>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";

  export default {
    name: "PagePrijavaFirmi",

    components: {
      AppMaxWidthContainer,
    },

    data: () => ({
      formId: "201544210250336",
    }),

    mounted() {
      const ifr = document.getElementById(`JotFormIFrame-${ this.formId }`);

      if (window.location.href && -1 < window.location.href.indexOf("?")) {
        const get = window.location.href.substr(window.location.href.indexOf("?") + 1);
        if (ifr && 0 < get.length) {
          let { src } = ifr;
          src = -1 < src.indexOf("?") ? `${ src }&${ get }` : `${ src }?${ get }`;
          ifr.src = src;
        }
      }

      window.handleIFrameMessage = function(e) {
        if ("object" === typeof e.data) {
          return;
        }

        const args = e.data.split(":");

        let iframe;
        if (2 < args.length) {
          iframe = document.getElementById(`JotFormIFrame-${ args[(args.length - 1)] }`);
        } else {
          iframe = document.getElementById("JotFormIFrame");
        }

        if (!iframe) {
          return;
        }

        switch (args[0]) {
          case "scrollIntoView":
            iframe.scrollIntoView();
            break;
          case "setHeight":
            iframe.style.height = `${ args[1] }px`;
            break;
          case "collapseErrorPage":
            if (iframe.clientHeight > window.innerHeight) {
              iframe.style.height = `${ window.innerHeight }px`;
            }
            break;
          case "reloadPage":
            window.location.reload();
            break;
          case "loadScript":
            {
              let src = args[1];
              if (3 < args.length) {
                src = `${ args[1] }:${ args[2] }`;
              }
              const script = document.createElement("script");
              script.src = src;
              script.type = "text/javascript";
              document.body.appendChild(script);
            }
            break;
          case "exitFullscreen":
            if (window.document.exitFullscreen) {
              window.document.exitFullscreen();
            } else if (window.document.mozCancelFullScreen) {
              window.document.mozCancelFullScreen();
            } else if (window.document.mozCancelFullscreen) {
              window.document.mozCancelFullScreen();
            } else if (window.document.webkitExitFullscreen) {
              window.document.webkitExitFullscreen();
            } else if (window.document.msExitFullscreen) {
              window.document.msExitFullscreen();
            }
            break;
        }
        const isJotForm = (-1 < e.origin.indexOf("jotform"));
        if (isJotForm && "contentWindow" in iframe && "postMessage" in iframe.contentWindow) {
          const urls = { docurl: encodeURIComponent(document.URL), referrer: encodeURIComponent(document.referrer) };
          iframe.contentWindow.postMessage(JSON.stringify({ type: "urls", value: urls }), "*");
        }
      };
      if (window.addEventListener) {
        window.addEventListener("message", window.handleIFrameMessage, false);
      } else if (window.attachEvent) {
        window.attachEvent("onmessage", window.handleIFrameMessage);
      }
    },
  };
</script>
