import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface Props {
    total: number;
    imported: number;
    skipped: number;
    onClose: () => void;
}

export default function StepDone({ total, imported, skipped, onClose }: Props) {
    const { t } = useTranslation();
    return (
        <div className="p-8 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-2">{t("password_manager_import_complete")}</h2>
                <p className="text-muted-foreground">
                    {t("password_manager_import_processed_total", { total })}
                </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 w-full max-w-sm space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{t("password_manager_import_successfully_imported")}</span>
                    <span className="font-semibold text-emerald-600">{imported} {t("password_manager_import_items")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{t("password_manager_import_skipped_duplicates")}</span>
                    <span className="font-semibold text-muted-foreground">{skipped} {t("password_manager_import_items")}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-4 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t("password_manager_import_local_processing")}</span>
            </div>

            <div className="pt-4">
                <Button onClick={onClose} size="lg" className="w-full sm:w-auto px-8">
                    {t("password_manager_import_done")}
                </Button>
            </div>
        </div>
    );
}
