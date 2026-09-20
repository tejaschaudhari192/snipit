import { FEEDBACK_RECEIVED } from "./feedback/feedback.template.js";
import { VAULT_ACCESS_GRANTED } from "./access/vault-access.template.js";
import { ACCESS_GRANTED } from "./access/access-granted.template.js";
import { PASSWORD_RESET } from "./auth/password-reset.template.js";
import { LOGIN_NOTIFICATION } from "./auth/login-notification.template.js";
import {
	PNR_STATUS_UPDATE,
	type PnrStatusUpdateEmailData,
} from "./trains/pnr-status-update.template.js";
import {
	PNR_TICKET_SHARED,
	type PnrTicketSharedEmailData,
} from "./trains/pnr-ticket-shared.template.js";

export const EMAIL_TEMPLATES = {
	FEEDBACK_RECEIVED,
	VAULT_ACCESS_GRANTED,
	ACCESS_GRANTED,
	PASSWORD_RESET,
	LOGIN_NOTIFICATION,
	PNR_STATUS_UPDATE,
	PNR_TICKET_SHARED,
};

export {
	FEEDBACK_RECEIVED,
	VAULT_ACCESS_GRANTED,
	ACCESS_GRANTED,
	PASSWORD_RESET,
	LOGIN_NOTIFICATION,
	PNR_STATUS_UPDATE,
	PNR_TICKET_SHARED,
	type PnrStatusUpdateEmailData,
	type PnrTicketSharedEmailData,
};
