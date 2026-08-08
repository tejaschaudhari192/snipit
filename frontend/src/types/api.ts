export interface PaginatedResponse<T> {
	pastes: T[]; // Assuming backend specifically uses 'pastes' key
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasMore: boolean;
}

export interface ServiceStatus {
	status: string;
	message: string;
}

export interface HealthData {
	status: string;
	progress?: number;
	currentLabel?: string;
	icon?: string;
	services: Record<string, ServiceStatus>;
}

export interface AiIdFileContext {
	name?: string;
	fileName?: string;
	type?: string;
	fileMimeType?: string;
	mimeType?: string;
}
