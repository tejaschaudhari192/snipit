import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import ReactCrop, {
	type Crop,
	type PixelCrop,
	centerCrop,
	makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
	ZoomIn,
	ZoomOut,
	RotateCw,
	RotateCcw,
	Check,
	Crop as CropIcon,
	RefreshCw,
} from "lucide-react";

interface ImageCropperDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	imageSrc: string;
	onCropComplete: (croppedDataUrl: string) => void;
	cropShape?: "circle" | "rectangle";
	aspectRatio?: number;
}

const TO_RADIANS = Math.PI / 180;

// Center 1:1 crop generator based on natural dimensions
function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number,
) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: "%",
				width: 90,
			},
			aspect,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	);
}

export const ImageCropperDialog: React.FC<ImageCropperDialogProps> = ({
	open,
	onOpenChange,
	imageSrc,
	onCropComplete,
	cropShape = "circle",
	aspectRatio = 1,
}) => {
	const { t } = useTranslation();
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const [scale, setScale] = useState<number>(1);
	const [rotate, setRotate] = useState<number>(0);
	const imgRef = useRef<HTMLImageElement>(null);

	const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const { width, height } = e.currentTarget;
		if (aspectRatio) {
			setCrop(centerAspectCrop(width, height, aspectRatio));
		}
	};

	const resetTransforms = () => {
		setScale(1);
		setRotate(0);
		if (imgRef.current && aspectRatio) {
			setCrop(
				centerAspectCrop(
					imgRef.current.width,
					imgRef.current.height,
					aspectRatio,
				),
			);
		}
	};

	const handleApplyCrop = () => {
		const image = imgRef.current;
		if (!image || !completedCrop) return;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		const pixelRatio = window.devicePixelRatio || 1;
		canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
		canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

		ctx.scale(pixelRatio, pixelRatio);
		ctx.imageSmoothingQuality = "high";

		const cropX = completedCrop.x * scaleX;
		const cropY = completedCrop.y * scaleY;

		const centerX = image.naturalWidth / 2;
		const centerY = image.naturalHeight / 2;

		ctx.save();
		ctx.translate(-cropX, -cropY);
		ctx.translate(centerX, centerY);
		ctx.rotate(rotate * TO_RADIANS);
		ctx.scale(scale, scale);
		ctx.translate(-centerX, -centerY);

		ctx.drawImage(
			image,
			0,
			0,
			image.naturalWidth,
			image.naturalHeight,
			0,
			0,
			image.naturalWidth,
			image.naturalHeight,
		);
		ctx.restore();

		const croppedDataUrl = canvas.toDataURL("image/png");
		onCropComplete(croppedDataUrl);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg p-6 rounded-2xl bg-card border border-border/60 shadow-2xl flex flex-col gap-4">
				<DialogHeader className="space-y-1 text-left">
					<DialogTitle className="text-base font-bold flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
							<CropIcon className="w-4 h-4" />
						</div>
						{t("profile.avatar.crop_title")}
					</DialogTitle>
					<DialogDescription className="text-xs text-muted-foreground">
						{t("profile.avatar.crop_description")}
					</DialogDescription>
				</DialogHeader>

				{/* Cropper Viewport */}
				<div className="relative w-full h-80 bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center border border-border/40 select-none">
					{imageSrc && (
						<ReactCrop
							crop={crop}
							onChange={(_, percentCrop) => setCrop(percentCrop)}
							onComplete={(c) => setCompletedCrop(c)}
							aspect={aspectRatio}
							circularCrop={cropShape === "circle"}
							className="max-h-75 max-w-full"
						>
							<img
								ref={imgRef}
								src={imageSrc}
								alt="Crop preview"
								style={{
									transform: `scale(${scale}) rotate(${rotate}deg)`,
									transition: "transform 0.1s ease-out",
								}}
								onLoad={onImageLoad}
								className="max-h-75 w-auto object-contain block mx-auto"
							/>
						</ReactCrop>
					)}
				</div>

				{/* Adjustment Controls (Zoom & Rotation) */}
				<div className="flex flex-col gap-3 py-1">
					{/* Zoom slider */}
					<div className="flex items-center gap-3">
						<ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
						<Slider
							value={scale}
							min={0.5}
							max={3}
							step={0.05}
							onValueChange={(val) => {
								const next = Array.isArray(val)
									? val[0]
									: (val as number);
								if (typeof next === "number") setScale(next);
							}}
							className="flex-1 cursor-pointer"
						/>
						<ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
						<span className="text-[11px] font-mono font-medium text-muted-foreground w-10 text-right">
							{Math.round(scale * 100)}%
						</span>
					</div>

					{/* Tool action buttons: rotate left/right, reset */}
					<div className="flex items-center justify-between pt-1">
						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setRotate((r) => (r - 90) % 360)}
								className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								<span>-90°</span>
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setRotate((r) => (r + 90) % 360)}
								className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer"
							>
								<RotateCw className="w-3.5 h-3.5" />
								<span>+90°</span>
							</Button>
						</div>

						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={resetTransforms}
							className="h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
						>
							<RefreshCw className="w-3.5 h-3.5" />
							<span>{t("profile.avatar.reset")}</span>
						</Button>
					</div>
				</div>

				{/* Dialog Footer Actions */}
				<DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onOpenChange(false)}
						className="rounded-xl text-xs font-semibold cursor-pointer"
					>
						{t("common.actions.cancel")}
					</Button>
					<Button
						type="button"
						size="sm"
						onClick={handleApplyCrop}
						className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
					>
						<Check className="w-3.5 h-3.5" />
						<span>{t("profile.avatar.apply_crop")}</span>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
