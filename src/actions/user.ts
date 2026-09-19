'use server'

import { currentUser } from '@clerk/nextjs/server';
import { resolveAppUserForClerkUser } from '@/lib/user-compat';


export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403 };
    }

    const appUser = await resolveAppUserForClerkUser(user);
    if (!appUser) {
      return { status: 400 };
    }

    // Always 200, including a first visit. This used to return 201 for a
    // freshly created row while all 13 callers test `status !== 200`, so a
    // brand new user was turned away on their very first action.
    return { status: 200, user: appUser };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Auth error:", message);
    return { status: 500 };
  }
};
