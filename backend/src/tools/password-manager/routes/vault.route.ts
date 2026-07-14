import { Router } from "express";
import { getVault, updateVault } from "../controllers/vault.controller.js";
import {
	getVaultItems,
	createVaultItem,
	updateVaultItem,
	deleteVaultItem,
} from "../controllers/vault-item.controller.js";
import {
	getCollections,
	createCollection,
	deleteCollection,
} from "../controllers/collection.controller.js";
import {
	lookupUserPublicKey,
	shareCollection,
	shareItem,
	shareFolder,
	getCollectionAccess,
	revokeAccess,
} from "../controllers/sharing.controller.js";
import { protect } from "@/middleware/auth.middleware.js";

const router: Router = Router();

// Protect all vault routes
router.use(protect);

// Vault metadata and keys
router.route("/").get(getVault).put(updateVault);

// Vault Items
router
	.route("/items")
	.get(getVaultItems)
	.post(createVaultItem);
router
	.route("/items/:id")
	.put(updateVaultItem)
	.delete(deleteVaultItem);

// Collections
router
	.route("/collections")
	.get(getCollections)
	.post(createCollection);
router
	.route("/collections/:id")
	.delete(deleteCollection);

// Sharing
router.post("/share/lookup", lookupUserPublicKey);
router.post("/share", shareCollection);
router.post("/share/item", shareItem);
router.post("/share/folder", shareFolder);
router.get("/share/:collectionId", getCollectionAccess);
router.delete("/share/:accessId", revokeAccess);

export default router;
