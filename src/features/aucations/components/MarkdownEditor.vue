<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const props = defineProps({
  modelValue: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

const root = ref(null);
let editor = null;

onMounted(() => {
  editor = new Editor({
    el: root.value,
    initialValue: props.modelValue,
    height: "260px",
    initialEditType: "markdown",
    previewStyle: "tab",
    usageStatistics: false,
  });
  editor.on("change", () => {
    emit("update:modelValue", editor.getMarkdown());
  });
});

onBeforeUnmount(() => {
  editor?.destroy();
});
</script>

<template>
  <div ref="root" data-testid="markdown-editor" />
</template>
