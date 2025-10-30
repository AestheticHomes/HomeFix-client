export const ROLE_CAPS = {
  admin: {
    canSeeUsers: true,
    canSeeServices: true,
    canSeeBookings: true,
    canSeeCms: true,
    canSeeSettings: true,
  },
  manager: {
    canSeeUsers: true,
    canSeeServices: true,
    canSeeBookings: true,
    canSeeCms: true,
    canSeeSettings: false,
  },
  technician: {
    canSeeUsers: false,
    canSeeServices: false,
    canSeeBookings: true,
    canSeeCms: false,
    canSeeSettings: false,
  },
  support: {
    canSeeUsers: false,
    canSeeServices: false,
    canSeeBookings: true,
    canSeeCms: true,
    canSeeSettings: false,
  },
  user: {
    canSeeUsers: false,
    canSeeServices: false,
    canSeeBookings: false,
    canSeeCms: false,
    canSeeSettings: false,
  },
} as const;

export type RoleKey = keyof typeof ROLE_CAPS;

export function getCaps(role: RoleKey) {
  return ROLE_CAPS[role] ?? ROLE_CAPS.user;
}
