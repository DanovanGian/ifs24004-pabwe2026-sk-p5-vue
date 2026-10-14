import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Editor from "@toast-ui/editor";
import MarkdownEditor from "./MarkdownEditor.vue";

vi.mock("@toast-ui/editor", () => ({ default: vi.fn() }));

let instance;

beforeEach(() => {
  instance = {
    on: vi.fn(),
    getMarkdown: vi.fn(() => "# isi baru"),
    destroy: vi.fn(),
  };
  Editor.mockImplementation(function () {
    return instance;
  });
});

describe("MarkdownEditor", () => {
  it("membuat editor dengan nilai awal dari modelValue", () => {
    mount(MarkdownEditor, { props: { modelValue: "awal" } });

    expect(Editor).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: "awal", initialEditType: "markdown" })
    );
  });

  it("memakai string kosong jika modelValue tidak diberikan", () => {
    mount(MarkdownEditor);

    expect(Editor).toHaveBeenCalledWith(expect.objectContaining({ initialValue: "" }));
  });

  it("memancarkan update:modelValue saat isi editor berubah", () => {
    const wrapper = mount(MarkdownEditor);

    const [, handler] = instance.on.mock.calls.find(([event]) => event === "change");
    handler();

    expect(wrapper.emitted("update:modelValue")).toEqual([["# isi baru"]]);
  });

  it("menghancurkan editor saat komponen dilepas", () => {
    const wrapper = mount(MarkdownEditor);

    wrapper.unmount();

    expect(instance.destroy).toHaveBeenCalledTimes(1);
  });
});
