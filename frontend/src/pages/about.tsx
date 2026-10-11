import Footer from "@/components/footer/footer";
import { Hero } from "@/components/about/hero-section";
import { AppScreenshot } from "@/components/about/app-screenshot";
import { Features } from "@/components/about/features-section";
import { Story } from "@/components/about/story-section";
import { TeamSection } from "@/components/about/team-section";
import { TestimonialsGrid } from "@/components/testimonials-grid";
import { FAQSection } from "@/components/about/faq-section";
import { ContributeSection } from "@/components/about/contribute-section";

const AboutPage = () => {
	return (
		<div className="bg-background text-foreground transition-colors duration-300">
			<Hero />
			<AppScreenshot />
			<Features />
			<Story />
			<TeamSection />
			<TestimonialsGrid />
			<FAQSection />
			<ContributeSection />
			<Footer />
		</div>
	);
};

export default AboutPage;
