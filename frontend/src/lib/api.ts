import axios from "axios";
// import type { RefObject } from "react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const useApiHelpers = () => {
  const getServerStatus = async () => {
    try {
      const response = await api.get("/");
      return response.status == 200;
    } catch {
      return false;
    }
  };

  const submitPaste = async (data: {
    content: string;
    expiresTime: string;
    idType?: "system" | "dynamic";
    customId?: string;
    redirectUrl?: boolean;
    language?: string;
    burnAfterRead?: boolean;
    visibility?: "public" | "private" | "shared";
    allowedUsers?: string[];
  }) => {
    const response = await api.post("/", data);
    return response.data;
  };

  const getPaste = async (id: string) => {
    try {
      const response = await api.get("/" + id);
      const data = response.data;
      return data;
    } catch {
      return null;
    }
  };

  const deletePaste = async (id: string) => {
    const response = await api.delete("/" + id);
    const data = response.data;
    return data;
  };

  const updatePaste = async (
    id: string,
    content: string,
    redirectUrl?: boolean,
    language?: string,
  ) => {
    const response = await api.put("/" + id, {
      content,
      redirectUrl,
      language,
    });
    const data = response.data;
    return data;
  };

  const detectLanguage = async (content: string) => {
    const response = await api.post("/detect-language", { content });
    return response.data;
  };

  return {
    getServerStatus,
    submitPaste,
    getPaste,
    deletePaste,
    updatePaste,
    detectLanguage,
  };
};

export default api;
