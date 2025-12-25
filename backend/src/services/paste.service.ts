import pasteModel from "@/models/Paste.js";
import type { PasteData } from "@/types/index.js";

class PasteService {
  async savePaste(pastedata: PasteData) {
    return await pasteModel.create(pastedata);
  }
  async getPasteById(id: string) {
    return await pasteModel.findOne({ id });
  }
  async deletePaste(id: string) {
    return await pasteModel.deleteOne({ id });
  }
  async updatePaste(id: string, content: string) {
    return await pasteModel.findOneAndUpdate(
      { id },
      { content },
      { new: true },
    );
  }
  async isPasteExpired(id: string): Promise<boolean> {
    const paste = await pasteModel.findOne({ id });
    return paste ? new Date() > paste.expiresAt : false;
  }
}

export default PasteService;
