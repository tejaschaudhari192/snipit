import type { NavigateFunction } from "react-router-dom";
import type { VoiceActionPayload } from "../types/voice.types";
import { DOMOperator } from "./dom-operator";
import { deletePaste } from "@/lib/api/pastes";

export interface ActionDispatcherDependencies {
	navigate: NavigateFunction;
	toggleTheme?: () => void;
	musicControls?: {
		play?: () => void;
		pause?: () => void;
		next?: () => void;
		prev?: () => void;
		searchAndPlay?: (query: string) => void;
	};
}

export class ActionDispatcher {
	private deps: ActionDispatcherDependencies;

	constructor(deps: ActionDispatcherDependencies) {
		this.deps = deps;
	}

	public updateDeps(deps: ActionDispatcherDependencies) {
		this.deps = deps;
	}

	public async dispatch(action: VoiceActionPayload): Promise<boolean> {
		if (!action || action.type === "NONE") return true;

		// Fire global CustomEvent so active page panels can react directly
		if (typeof window !== "undefined") {
			window.dispatchEvent(
				new CustomEvent("snipit:voice:action", { detail: action }),
			);
		}

		switch (action.type) {
			case "NAVIGATE": {
				const path = action.params.path || "/";
				this.deps.navigate(path);
				return true;
			}

			case "CHECK_PNR": {
				const pnr = action.params.pnr;
				this.deps.navigate(
					`/tools/trains?tab=pnr&pnr=${encodeURIComponent(pnr)}`,
				);
				return true;
			}

			case "SEARCH_TRAINS": {
				const { from, to, date } = action.params;
				const query = new URLSearchParams({
					tab: "search",
					from: from || "",
					to: to || "",
				});
				if (date) query.set("date", date);
				this.deps.navigate(`/tools/trains?${query.toString()}`);
				return true;
			}

			case "TRAIN_LIVE_STATUS": {
				const { trainNo, day } = action.params;
				const query = new URLSearchParams({
					tab: "live",
					trainNo: trainNo || "",
				});
				if (day) query.set("day", day);
				this.deps.navigate(`/tools/trains?${query.toString()}`);
				return true;
			}

			case "TRAIN_SCHEDULE": {
				const { trainNo } = action.params;
				this.deps.navigate(
					`/tools/trains?tab=schedule&trainNo=${encodeURIComponent(trainNo || "")}`,
				);
				return true;
			}

			case "CONTROL_MUSIC": {
				const { action: musicAction, query } = action.params;
				if (musicAction === "play" || musicAction === "search") {
					if (query && this.deps.musicControls?.searchAndPlay) {
						this.deps.musicControls.searchAndPlay(query);
					} else if (this.deps.musicControls?.play) {
						this.deps.musicControls.play();
					}
				} else if (
					musicAction === "pause" &&
					this.deps.musicControls?.pause
				) {
					this.deps.musicControls.pause();
				} else if (
					musicAction === "next" &&
					this.deps.musicControls?.next
				) {
					this.deps.musicControls.next();
				} else if (
					musicAction === "prev" &&
					this.deps.musicControls?.prev
				) {
					this.deps.musicControls.prev();
				}
				return true;
			}

			case "CREATE_SNIPPET": {
				const { mode, language, content, title } = action.params || {};

				if (
					typeof window !== "undefined" &&
					(content || language || mode || title)
				) {
					sessionStorage.setItem(
						"snipit:pending_snippet",
						JSON.stringify({ mode, language, content, title }),
					);
					window.dispatchEvent(
						new CustomEvent("snipit:apply_snippet", {
							detail: { mode, language, content, title },
						}),
					);
				}

				const modeParam = mode || (language ? "code" : undefined);
				if (modeParam) {
					this.deps.navigate(
						`/?tab=${encodeURIComponent(modeParam)}`,
					);
				} else {
					this.deps.navigate("/");
				}
				return true;
			}

			case "GENERATE_PASSWORD": {
				this.deps.navigate("/tools/passwords");
				return true;
			}

			case "CHANGE_THEME": {
				const theme = action.params.theme;
				if (theme === "dark") {
					document.documentElement.classList.add("dark");
				} else if (theme === "light") {
					document.documentElement.classList.remove("dark");
				} else if (theme === "toggle" && this.deps.toggleTheme) {
					this.deps.toggleTheme();
				}
				return true;
			}

			case "DOM_CLICK": {
				const el = await DOMOperator.waitForElement(
					action.params.selector,
				);
				if (el) {
					DOMOperator.safeClick(el);
					return true;
				}
				return false;
			}

			case "DOM_INPUT": {
				const el = await DOMOperator.waitForElement<HTMLInputElement>(
					action.params.selector,
				);
				if (el) {
					DOMOperator.safeSetInputValue(el, action.params.value);
					if (action.params.submitSelector) {
						const submitBtn = await DOMOperator.waitForElement(
							action.params.submitSelector,
						);
						if (submitBtn) DOMOperator.safeClick(submitBtn);
					}
					return true;
				}
				return false;
			}

			case "DELETE_PASTE": {
				const idFromParams = action.params?.id;
				const currentPath =
					typeof window !== "undefined"
						? window.location.pathname
						: "";
				const idFromPath =
					currentPath !== "/" &&
					!currentPath.startsWith("/tools") &&
					!currentPath.startsWith("/login") &&
					!currentPath.startsWith("/signup") &&
					!currentPath.startsWith("/profile") &&
					!currentPath.startsWith("/history") &&
					!currentPath.startsWith("/about") &&
					!currentPath.startsWith("/explore")
						? currentPath.replace(/^\//, "").split("/")[0]
						: null;
				const targetId = idFromParams || idFromPath;

				const isCurrentScreen =
					!idFromParams ||
					(idFromPath &&
						idFromParams.toLowerCase() ===
							idFromPath.toLowerCase());

				// 1. If targeting current screen, click the Delete button on the page
				const deleteBtn = document.querySelector(
					"#delete-paste-button",
				) as HTMLElement | null;

				if (isCurrentScreen && deleteBtn) {
					DOMOperator.safeClick(deleteBtn);
					const confirmBtn = await DOMOperator.waitForElement(
						"#confirm-delete-button",
						2000,
					);
					if (confirmBtn) {
						DOMOperator.safeClick(confirmBtn);
						return true;
					}
					// If dialog button was not detected, fall through to direct API
				}

				// 2. Direct API delete for specified target ID
				if (targetId) {
					try {
						await deletePaste(targetId);
						if (isCurrentScreen) {
							this.deps.navigate("/");
						}
						return true;
					} catch (e) {
						console.error("Direct API delete failed", e);
						return false;
					}
				}

				return false;
			}

			default:
				return true;
		}
	}
}
