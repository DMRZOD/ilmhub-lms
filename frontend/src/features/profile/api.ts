import { api } from "@/lib/api-client";

import type { PublicProfile } from "./types";

export async function fetchPublicProfile(id: string): Promise<PublicProfile> {
  const { data } = await api.get<PublicProfile>(
    `/users/${encodeURIComponent(id)}/profile`,
  );
  return data;
}
