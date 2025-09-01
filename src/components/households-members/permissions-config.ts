import type { TupleOf } from '@/utils/types';
import type { HouseholdMember } from './types';

type PermissionKeys = Extract<keyof HouseholdMember, `can${string}`>;

export type Permission<T> = {
  key: T;
  label: string;
  description: string;
  defaultValue?: boolean;
};

type PermissionRecords = Record<PermissionKeys, boolean>;

type MapTuple<T extends unknown[]> = { [K in keyof T]: Permission<T[K]> };

type AllValuesArray<T> = TupleOf<T> extends infer R
  ? R extends unknown[]
    ? MapTuple<R>
    : never
  : never;

/**
 * Configuration for all available member permissions.
 *
 * To add a new permission:
 * 1. Add the permission field to the database schema in convex/households_members/schema.ts
 * 2. Update the mutation in convex/households_members/mutations.ts to accept the new field
 * 3. Update the query in convex/households_members/queries.ts to return the new field
 * 4. Add the new permission to this configuration array
 */
export const PERMISSIONS_CONFIG: AllValuesArray<PermissionKeys> = [
  {
    key: 'canEditHousehold',
    label: 'Modifier le foyer',
    description: 'Permet de modifier les informations du foyer',
    defaultValue: false,
  },
  {
    key: 'canManageProducts',
    label: 'Gérer les produits',
    description: 'Permet de gérer les produits du foyer',
    defaultValue: false,
  },
];

/**
 * Helper function to initialize permissions from a member object
 */
export function initializePermissionsFromMember(
  member: HouseholdMember,
): PermissionRecords {
  return PERMISSIONS_CONFIG.reduce((acc, permission) => {
    const value = member[permission.key];
    acc[permission.key] = value ?? permission.defaultValue ?? false;
    return acc;
  }, {} as PermissionRecords);
}

/**
 * Helper function to get changed permissions by comparing current and new values
 */
export function getChangedPermissions(
  member: HouseholdMember,
  newPermissions: PermissionRecords,
): Partial<PermissionRecords> {
  const changes: Partial<PermissionRecords> = {};

  PERMISSIONS_CONFIG.forEach((permission) => {
    const currentValue =
      member[permission.key] ?? permission.defaultValue ?? false;
    const newValue = newPermissions[permission.key];

    if (currentValue !== newValue) {
      changes[permission.key] = newValue;
    }
  });

  return changes;
}

/**
 * Helper function to check if any permissions have changed
 */
export function hasPermissionChanges(
  member: HouseholdMember,
  newPermissions: PermissionRecords,
): boolean {
  return PERMISSIONS_CONFIG.some((permission) => {
    const currentValue =
      member[permission.key] ?? permission.defaultValue ?? false;
    const newValue = newPermissions[permission.key];
    return currentValue !== newValue;
  });
}
