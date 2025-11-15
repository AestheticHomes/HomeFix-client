export interface HomeFixUser {
  id?: string | null;

  phone?: string | null;
  phone_verified?: boolean | null;
  loggedIn?: boolean | null;

  role?: string | null;

  name?: string | null;
  email?: string | null;
  address?: string | null;

  latitude?: number | null;
  longitude?: number | null;
}
