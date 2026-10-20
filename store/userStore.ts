import { create } from "zustand";

interface UserStore {
  userData: any;
  setUserData: (data: any) => void;
}

const userStore = create<UserStore>((set) => ({
  userData: {},
  setUserData: (data: any) => set(() => ({ userData: data })),
}));

export default userStore;
