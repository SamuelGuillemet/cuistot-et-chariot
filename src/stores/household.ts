import type { Id } from 'convex/_generated/dataModel';
import { create } from 'zustand';
import { createSelectors } from '@/lib/zustand';
import { ssrSafeCookieStore } from '@/utils/cookie';

export const HOUSEHOLD_COOKIE_NAME = 'householdId';

type HouseholdStore = {
  householdId: Id<'households'> | null;
  setHouseholdId: (id: string) => Promise<void>;
  initialize: (id: string | undefined) => void;
};

export const householdStore = create<HouseholdStore>((set) => ({
  householdId: null,
  setHouseholdId: async (id) => {
    await ssrSafeCookieStore.set(HOUSEHOLD_COOKIE_NAME, id);
    set({ householdId: id as Id<'households'> });
  },
  initialize: (id) => {
    if (id) {
      set({ householdId: id as Id<'households'> });
    }
  },
}));

export const useHousehold = createSelectors(householdStore);
