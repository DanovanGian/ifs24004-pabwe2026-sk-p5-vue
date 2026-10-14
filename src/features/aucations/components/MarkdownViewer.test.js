import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import MarkdownViewer from "./MarkdownViewer.vue";

vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => ({ default: vi.fn() }));

let instance;

beforeEach(() => {
  instance = { setMarkdown: vi.fn(), destroy: vi.fn() };
  Viewer.mockImplementation(function () {
    return instance;
  });
});

describe("MarkdownViewer", () => {
  it("membuat viewer dengan isi dari props", () => {
    mount(MarkdownViewer, { props: { content: "# Judul" } });

    expect(Viewer).toHaveBeenCalledWith(expect.objectContaining({ initialValue: "# Judul" }));
  });

  it("memakai string kosong jika content tidak diberikan", () => {
    mount(MarkdownViewer);

    expect(Viewer).toHaveBeenCalledWith(expect.objectContaining({ initialValue: "" }));
  });

  it("memperbarui tampilan saat content berubah", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "lama" } });

    await wrapper.setProps({ content: "baru" });

    expect(instance.setMarkdown).toHaveBeenCalledWith("baru");
  });

  it("menghancurkan viewer saat komponen dilepas", () => {
    const wrapper = mount(MarkdownViewer);

    wrapper.unmount();

    expect(instance.destroy).toHaveBeenCalledTimes(1);
  });
});
