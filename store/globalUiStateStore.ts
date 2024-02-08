import { create } from "zustand";

interface UserStore {
  mainPanelWidth: number;
  setMainPanelWidth: (size: number) => void;
}

const globalUiStateStore = create<UserStore>((set) => ({
  mainPanelWidth: 80,
  setMainPanelWidth: (size) => set(() => ({ mainPanelWidth: size })),
}));

export default globalUiStateStore;
