import { ref } from "vue";

export function useInput(defaultValue = "") {
  const value = ref(defaultValue);

  function onChange(event) {
    value.value = event.target.value;
  }

  function reset() {
    value.value = defaultValue;
  }

  return [value, onChange, reset];
}
