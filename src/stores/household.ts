import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand';
import { ssrSafeCookieStore } from '@/utils/cookie';

export const HOUSEHOLD_COOKIE_NAME = 'householdId';

type HouseholdStore = {
  householdId: string | null;
  setHouseholdId: (id: string) => Promise<void>;
  initialize: (id: string | undefined) => void;
};

export const householdStore = create<HouseholdStore>((set) => ({
  householdId: null,
  setHouseholdId: async (id) => {
    await ssrSafeCookieStore.set(HOUSEHOLD_COOKIE_NAME, id);
    set({ householdId: id });
  },
  initialize: (id) => {
    if (id) {
      set({ householdId: id });
    }
  },
}));

export const useHousehold = createSelectors(householdStore);
