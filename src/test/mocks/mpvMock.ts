import { usePlayerStore } from "@/stores/playerStore";

/**
 * Dispatches an MPV property change event directly into the playerStore.
 */
export function dispatchMpvProperty(name: string, data: any) {
  usePlayerStore.getState().handleMpvEvent({
    event: "property-change",
    name,
    data,
  });
}

/**
 * Dispatches an MPV custom event (e.g. mpv-ready, mpv-disconnected, eof-reached).
 */
export function dispatchMpvEvent(event: string, extra: Record<string, any> = {}) {
  usePlayerStore.getState().handleMpvEvent({
    event,
    ...extra,
  });
}
