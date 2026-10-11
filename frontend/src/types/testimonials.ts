export interface TestimonialAuthor {
	name: string;
	role: string;
	company?: string;
	avatar?: string;
	initials: string;
	linkedin?: string;
}

export interface Testimonial {
	id: string;
	content: string;
	author: TestimonialAuthor;
	rating?: number;
	highlight?: string;
	verified?: boolean;
}
