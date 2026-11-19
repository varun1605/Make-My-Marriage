export type PublicUser = { id: string; name: string; email: string };
export type AuthResult = { user: PublicUser; hasWedding: boolean };
export type CurrentUser = {
  user: PublicUser;
  membership: { role: "ADMIN" | "MANAGER" } | null;
  wedding: { id: string; brideName: string; groomName: string; weddingDate: string } | null;
};
