import { authClient } from "../utils/auth";

export const useAuthSession = () => {
  return authClient.useSession();
};
