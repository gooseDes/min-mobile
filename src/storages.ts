import { create } from "zustand";

interface RouteState {
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    previousIndex: number;
    setPreviousIndex: (index: number) => void;
}

export const useRouteStore = create<RouteState>(set => ({
    currentIndex: 0,
    setCurrentIndex: (index: number) => set({ currentIndex: index }),
    previousIndex: 0,
    setPreviousIndex: (index: number) => set({ previousIndex: index }),
}));
