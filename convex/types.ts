import type { Doc } from './_generated/dataModel';

export type Role = 'member' | 'admin';

export type Status = 'pending' | 'accepted' | 'banned';

export type Household = Doc<'households'>;
