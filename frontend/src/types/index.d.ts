export interface PasteData {
  id: string;
  content: string;
  createdAt: string;
  expiresAt: string;
  redirectUrl?: boolean;
  language?: string;
  burnAfterRead?: boolean;
  expiresTime?: string;
}

export type IdType = "system" | "dynamic";
