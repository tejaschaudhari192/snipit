import { Button } from "@/components/ui/button";
import { ContentTypeSelector } from "@/components/common/content-type-selector";

import { ExpirySelector } from "@/components/common/expiry-selector";
import { useTranslation } from "react-i18next";

interface MainToolbarProps {
	contentType: "text" | "code" | "link";
	setContentType: (val: "text" | "code" | "link") => void;
	expiresTime: string;
	setExpiresTime: (val: string) => void;
	setIsCustomExpiryDialogOpen: (val: boolean) => void;
	textValue: string;
	handleCreationClick: () => void;
}

export const MainToolbar = ({
	contentType,
	setContentType,
	expiresTime,
	setExpiresTime,
	setIsCustomExpiryDialogOpen,
	textValue,
	handleCreationClick,
}: MainToolbarProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
			<ContentTypeSelector
				value={contentType}
				onValueChange={setContentType}
				className="w-full sm:w-auto"
			/>

			<div className="flex items-center gap-2 justify-between sm:justify-end">
				<ExpirySelector
					expiresTime={expiresTime}
					setExpiresTime={setExpiresTime}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
				/>

				<Button
					disabled={!textValue.length}
					size="lg"
					className="px-6 h-11 shadow-lg shadow-primary/20 font-bold"
					onClick={handleCreationClick}
				>
					{t("home.paste_button")}
				</Button>
			</div>
		</div>
	);
};
