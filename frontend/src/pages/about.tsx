import Footer from "@/components/ui/footer";
import {
  Mail,
  Code,
  Users,
  Github,
  Sparkles,
  Clock,
  Languages,
  Moon,
  Link2,
  Heart,
  Hash,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Code,
      key: "syntax_highlighting",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Sparkles,
      key: "ai_detection",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Hash,
      key: "custom_ids",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Clock,
      key: "expiration",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Languages,
      key: "multi_language",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Moon,
      key: "dark_mode",
      gradient: "from-slate-500 to-zinc-600",
    },
    {
      icon: Heart,
      key: "open_source",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: Link2,
      key: "redirect_urls",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                {t("about_page.features_title")}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
                {t("about_page.title")}{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Snipit
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("about_page.subtitle")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("about_page.features_title")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("about_page.features_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="h-full p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t(`about_page.features.${feature.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`about_page.features.${feature.key}.desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                {t("about_page.story.title")}
              </h2>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("about_page.story.p1")}
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("about_page.story.p2")}
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("about_page.story.p3")}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              {t("about_page.team.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "Durgesh Kapade",
                  email: "durgeshkapade26@gmail.com",
                  github: "https://github.com/durgeshkapade",
                },
                {
                  name: "Tejas Chaudhari",
                  email: "jaybalaji192@gmail.com",
                  github: "https://github.com/tejaschaudhari131",
                },
              ].map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("about_page.team.role")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={`mailto:${member.email}`}
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      </a>
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Github className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-10 md:p-14 text-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  {t("about_page.contribute.title")}
                </h3>
                <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
                  {t("about_page.contribute.desc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://github.com/durgeshkapade/snipit"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-2 px-8 shadow-lg"
                    >
                      <Github className="w-5 h-5" />
                      {t("about_page.contribute.github_button")}
                    </Button>
                  </a>
                  <a href="mailto:durgeshkapade26@gmail.com">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 px-8 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                    >
                      <Mail className="w-5 h-5" />
                      {t("about_page.contribute.contact_button")}
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
