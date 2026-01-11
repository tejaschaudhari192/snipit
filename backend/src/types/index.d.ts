import type { Document } from "mongoose";

export type PasteData = {
  id: string;
  content: string;
  expiresAt: Date;
  createdAt: Date;
  redirectUrl?: boolean;
  language?: string;
  burnAfterRead?: boolean;
  expiresTime?: string;
};

export type IPaste = Document & {
  id: string;
  content: string;
  expiresAt: Date;
  createdAt: Date;
  redirectUrl?: boolean;
  language?: string;
  burnAfterRead?: boolean;
  expiresTime?: string;
};
