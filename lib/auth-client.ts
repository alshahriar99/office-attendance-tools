import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // omit baseURL to let it default to the current window location
  // so it works correctly regardless of the port (e.g. 3001)
});

export const { signIn, signUp, signOut, useSession } = authClient;
