<template>
  <ckeditor
    :config="editorConfig"
    :editor="editor"
    :value="value"
    v-bind="$attrs"
    @input="ev => $emit('input', ev)"
    @ready="ev => $emit('ready', ev)"
  />
</template>

<script>
  import CKEditor from "@ckeditor/ckeditor5-vue";
  import Editor from "@ckeditor/ckeditor5-build-balloon";

  export default {
    name: "RichEditor",

    components: {
      ckeditor: CKEditor.component,
    },

    inheritAttrs: false,

    props: {
      value: {
        required: true,
        type: String,
      },
      options: {
        type: Object,
        default: () => ({
          cloudServices: {
            uploadUrl: "/api/image/upload",
            tokenUrl: "/api/image/upload/token",
          },
        }),
      },
    },

    data() {
      return {
        editor: Editor,
        editorConfig: this.options,
      };
    },
  };
</script>
