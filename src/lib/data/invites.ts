import { fetchJson } from "./http";

export async function createInvite(input: {
  displayName: string;
}): Promise<{ code: string; uid: string }> {
  return fetchJson(`/api/invites`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getInvite(
  code: string,
): Promise<{ displayName: string }> {
  return fetchJson(`/api/invites/${code}`);
}

export async function acceptInvite(
  code: string,
  idToken: string,
): Promise<void> {
  await fetchJson(`/api/invites/${code}/accept`, {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}
