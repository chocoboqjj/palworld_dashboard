import { ref } from "vue";

export interface ToastItem {
  id: number;
  msg: string;
  type: "ok" | "err" | "info";
}

const items = ref<ToastItem[]>([]);

export function useToast() {
  function show(msg: string, type: "ok" | "err" | "info" = "info") {
    const id = Date.now() + Math.random();
    items.value.push({ id, msg, type });
    setTimeout(() => {
      items.value = items.value.filter((t) => t.id !== id);
    }, 3600);
  }
  return { show, items };
}
