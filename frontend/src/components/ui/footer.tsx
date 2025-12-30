import { useTranslation } from "react-i18next";
import logo from "@/assets/brand/logo.png";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full mt-auto">
      <footer className="bg-background border-2 border-border py-6 px-6 mx-4 rounded-lg shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-8">
              <img
                src={logo}
                alt="Snipit Logo"
                className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
              <p className="text-muted-foreground text-sm font-medium">
                {t("footer.copyright")}
              </p>
              <div className="flex space-x-8">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300 hover:underline"
                >
                  {t("footer.privacy")}
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300 hover:underline"
                >
                  {t("footer.terms")}
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300 hover:underline"
                >
                  {t("footer.contact")}
                </a>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-muted-foreground text-sm">
                {t("footer.made_by")}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
