<template>
  <span
    :is="info.is"

    v-bind="info"
    v-text="info.text"
  />
</template>

<script>
  import {
    EntryType,
  } from "./entry-type";

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("hr-HR");
  };

  const formatUrl = (url) => {
    try {
      const { protocol } = new URL(url);

      if (!protocol) {
        return url;
      }

      return url.substr(protocol.length + 2);
    } catch {
      return url;
    }
  };

  export default {
    name: "BasicInfoValue",

    props: {
      entry: {
        type: Object,
        required: true,
        validate(val) {
          return (
            val &&
            val.text &&
            val.type &&
            EntryType[val.type]
          );
        },
      },
    },

    computed: {
      EntryType() {
        return EntryType;
      },

      info() {
        const {
          entry,
        } = this;

        const base = {
          text: entry.text,
          is: "span",
        };

        switch (entry.type) {
          case EntryType.Phone: {
            base.href = `tel:${ entry.text }`;
            break;
          }

          case EntryType.Email: {
            base.href = `mailto:${ entry.text }`;
            break;
          }

          case EntryType.Date: {
            base.text = formatDate(base.text);
            break;
          }

          case EntryType.Url: {
            base.href = base.text;
            base.text = formatUrl(base.text);
            break;
          }

          default:
            break;
        }

        if (base.href) {
          base.is = "a";
          base.rel = "noopener noreferrer";
          base.target = "_blank";
        }

        return base;
      },
    },

    methods: {
      formatUrl(url) {
        try {
          const { protocol } = new URL(url);

          if (!protocol) {
            return url;
          }

          return url.substr(protocol.length + 2);
        } catch {
          return url;
        }
      },
    },
  };
</script>
