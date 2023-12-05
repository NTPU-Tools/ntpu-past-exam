import { create } from "zustand";

interface UserStore {
  userData: any;
  // eslint-disable-next-line no-unused-vars
  setUserData: (data: any) => void;
}

const userStore = create<UserStore>((set) => ({
  userData: {},
  setUserData: (data: any) => set(() => ({ userData: data })),
}));

export default userStore;
