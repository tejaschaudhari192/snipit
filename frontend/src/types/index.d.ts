export interface PasteData {
  id: string;
  content: string;
  createdAt: string;
  expiresAt: string;
  redirectUrl?: boolean;
}

export type IdType = "system" | "dynamic";
