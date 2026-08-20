import Footer from "@/components/footer/footer";
import { Hero } from "@/components/about/Hero";
import { AppScreenshot } from "@/components/about/AppScreenshot";
import { Features } from "@/components/about/Features";
import { Story } from "@/components/about/Story";
import { TeamSection } from "@/components/about/TeamSection";
import { FAQSection } from "@/components/about/FAQSection";
import { ContributeSection } from "@/components/about/ContributeSection";

const AboutPage = () => {
	return (
		<div className="bg-background text-foreground transition-colors duration-300">
			<Hero />
			<AppScreenshot />
			<Features />
			<Story />
			<TeamSection />
			<FAQSection />
			<ContributeSection />
			<Footer />
		</div>
	);
};

export default AboutPage;
