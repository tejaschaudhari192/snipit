import React, { useRef, useEffect, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, Pressable, PanResponder, Animated, Dimensions } from "react-native";
import { X, Star, Eye, EyeOff, Copy, Check, Trash2 } from "lucide-react-native";
import { Icon } from "./ui/icon";
import { PasswordItem } from "../core/vault-storage";
import { ItemAvatar } from "./ItemAvatar";
import { CreditCardVisual } from "./CreditCardVisual";
import { DetailGroupedRow, DetailGroupedCard } from "./DetailGroupedRow";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Card } from "./ui/card";
import { useCustomAlert } from "../hooks/useCustomAlert";

interface Props {
	visible: boolean;
	item: PasswordItem | null;
	theme?: "dark" | "light";
	showPassword: boolean;
	showCardNumber: boolean;
	showCardCVV: boolean;
	copiedField: string | null;
	onClose: () => void;
	onOpenEdit: (item: PasswordItem) => void;
	onToggleFavorite: (item: PasswordItem) => void;
	onDeleteItem: (id: string) => void;
	onTogglePassword: () => void;
	onToggleCardNumber: () => void;
	onToggleCardCVV: () => void;
	onCopyToClipboard: (text: string, fieldId: string) => void;
	getCategoryBadgeStyle: (category: PasswordItem["category"]) => any;
	getCategoryIcon: (category: PasswordItem["category"], size?: number) => React.ReactNode;
}

export function getCategoryItemLabel(cat: PasswordItem["category"]): string {
	switch (cat) {
		case "card":
			return "Card";
		case "apikey":
			return "API Key";
		case "note":
			return "Note";
		case "identity":
			return "Identity";
		case "login":
		default:
			return "Password";
	}
}

export function IosDetailInspectorModal({
	visible,
	item,
	theme = "dark",
	showPassword,
	showCardNumber,
	showCardCVV,
	copiedField,
	onClose,
	onOpenEdit,
	onDeleteItem,
	onToggleFavorite,
	onTogglePassword,
	onToggleCardNumber,
	onToggleCardCVV,
	onCopyToClipboard,
	getCategoryBadgeStyle,
	getCategoryIcon,
}: Props) {
	const lastItemRef = React.useRef<PasswordItem | null>(item);
	if (item) {
		lastItemRef.current = item;
	}
	const currentItem = item || lastItemRef.current;

	// Self-contained delete confirmation alert — avoids re-rendering PWMGScreen
	const { showAlert, alertModal } = useCustomAlert(theme);

	const handleDeletePress = () => {
		if (!currentItem) return;
		const typeLabel = getCategoryItemLabel(currentItem.category);
		showAlert(
			`Delete ${typeLabel}`,
			`Are you sure you want to delete "${currentItem.title}"?`,
			"warning",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						onDeleteItem(currentItem.id);
						onClose();
					},
				},
			]
		);
	};

	const SCREEN_HEIGHT = Dimensions.get("window").height;
	const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
	const [modalMounted, setModalMounted] = React.useState(false);

	// Manage mount/unmount separately from `visible` so we can animate in/out
	useEffect(() => {
		if (visible) {
			setModalMounted(true);
			translateY.setValue(SCREEN_HEIGHT);
			Animated.spring(translateY, {
				toValue: 0,
				useNativeDriver: true,
				bounciness: 0,
				speed: 22,
			}).start();
		} else if (modalMounted) {
			Animated.timing(translateY, {
				toValue: SCREEN_HEIGHT,
				duration: 180,
				useNativeDriver: true,
			}).start(() => {
				setModalMounted(false);
			});
		}
	}, [visible]);

	const handleRequestClose = useCallback(() => {
		Animated.timing(translateY, {
			toValue: SCREEN_HEIGHT,
			duration: 180,
			useNativeDriver: true,
		}).start(() => {
			onClose();
			setModalMounted(false);
		});
	}, [onClose, translateY, SCREEN_HEIGHT]);

	// Swipe-down pan responder — only attached to the drag handle strip at the top
	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => false,
			onMoveShouldSetPanResponder: (_, gestureState) => {
				return gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 2;
			},
			onPanResponderMove: (_, gestureState) => {
				if (gestureState.dy > 0) {
					translateY.setValue(gestureState.dy);
				}
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dy > 100 || gestureState.vy > 0.5) {
					// Flick/drag far enough — animate out smoothly
					Animated.timing(translateY, {
						toValue: SCREEN_HEIGHT,
						duration: 180,
						useNativeDriver: true,
					}).start(() => {
						onClose();
						setModalMounted(false);
					});
				} else {
					// Snap back
					Animated.spring(translateY, {
						toValue: 0,
						useNativeDriver: true,
						bounciness: 4,
						speed: 20,
					}).start();
				}
			},
		})
	).current;

	if (!currentItem) return null;
	if (!modalMounted) return null;

	return (
		<View
			className="absolute inset-0 z-50 justify-end"
			pointerEvents={visible ? "auto" : "none"}
		>
			<Pressable className="absolute inset-0 bg-black/70" onPress={handleRequestClose} />
			<Animated.View
				style={{ transform: [{ translateY }] }}
				className="rounded-t-2xl max-h-[92%] min-h-[75%] bg-card border-t border-border z-10"
			>
				{/* Pull Handle Bar & Header */}
				<View {...panResponder.panHandlers} className="w-full">
					<View className="items-center pt-2.5 pb-2">
						<View className="w-12 h-1.5 rounded-full bg-muted-foreground/40" />
					</View>
					<View className="flex-row items-center justify-between px-4 py-2 border-b border-border">
						<Button
							variant="ghost"
							size="icon"
							onPress={handleRequestClose}
							className="h-8 w-8"
						>
							<Icon as={X} className="text-foreground" size={18} />
						</Button>

						<Text className="text-base font-semibold text-center flex-1 mx-3 text-foreground" numberOfLines={1}>
							{currentItem.title}
						</Text>

						<Button
							variant="ghost"
							size="sm"
							onPress={() => onOpenEdit(currentItem)}
							className="px-2"
						>
							<Text className="text-sm font-semibold text-foreground">Edit</Text>
						</Button>
					</View>
				</View>

					<ScrollView
						className="flex-1"
						contentContainerClassName="px-4 pt-4 pb-10"
						showsVerticalScrollIndicator={false}
					>
						{/* Hero Brand Icon */}
						<View className="items-center my-4">
							<ItemAvatar
								item={currentItem}
								size={64}
								fallbackIcon={
									<View className="w-16 h-16 rounded-xl bg-muted items-center justify-center border border-border">
										{getCategoryIcon(currentItem.category, 32)}
									</View>
								}
							/>
							<Text className="text-xl font-bold mt-3 text-center text-foreground">{currentItem.title}</Text>
							{currentItem.isFavorite && (
								<View className="flex-row items-center gap-1 bg-muted px-2.5 py-0.5 rounded-full mt-1.5 border border-border">
									<Icon as={Star} className="text-foreground fill-foreground" size={12} />
									<Text className="text-foreground text-xs font-medium">Favorite</Text>
								</View>
							)}
						</View>

						{/* Credit Card Visual */}
						{currentItem.category === "card" && (
							<CreditCardVisual
								cardNumber={currentItem.metadata?.cardNumber}
								cardholderName={currentItem.metadata?.cardholderName}
								expiration={currentItem.metadata?.expiration}
								cvv={currentItem.metadata?.cvv}
								showNumber={showCardNumber}
								showCvv={showCardCVV}
								copied={copiedField === "cardnum"}
								onToggleNumber={onToggleCardNumber}
								onToggleCvv={onToggleCardCVV}
								onCopyCard={() =>
									currentItem.metadata?.cardNumber && onCopyToClipboard(currentItem.metadata.cardNumber, "cardnum")
								}
							/>
						)}

						{/* Primary Account Fields */}
						{(currentItem.username || currentItem.password || currentItem.url) && (
							<DetailGroupedCard theme={theme}>
								{currentItem.username && (
									<DetailGroupedRow
										label="Email / Username"
										value={currentItem.username}
										theme={theme}
										onCopy={() => onCopyToClipboard(currentItem.username!, "user")}
										isCopied={copiedField === "user"}
									/>
								)}

								{currentItem.password && (
									<DetailGroupedRow
										label={currentItem.category === "apikey" ? "API Secret Key" : "Password"}
										value={showPassword ? currentItem.password : "••••••••••••••••"}
										theme={theme}
										isDivider={!!currentItem.username}
										isMasked={!showPassword}
										rightAction={
											<View className="flex-row items-center gap-3.5">
												<TouchableOpacity onPress={onTogglePassword} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
													{showPassword ? (
														<Icon as={EyeOff} className="text-muted-foreground" size={18} />
													) : (
														<Icon as={Eye} className="text-muted-foreground" size={18} />
													)}
												</TouchableOpacity>
												<TouchableOpacity onPress={() => onCopyToClipboard(currentItem.password!, "pass")} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
													{copiedField === "pass" ? (
														<Icon as={Check} className="text-foreground" size={18} />
													) : (
														<Icon as={Copy} className="text-muted-foreground" size={18} />
													)}
												</TouchableOpacity>
											</View>
										}
									/>
								)}

								{currentItem.url && (
									<DetailGroupedRow
										label="Website"
										value={currentItem.url}
										theme={theme}
										isDivider={!!(currentItem.username || currentItem.password)}
										isUrl
										onCopy={() => onCopyToClipboard(currentItem.url!, "url")}
										isCopied={copiedField === "url"}
									/>
								)}
							</DetailGroupedCard>
						)}

						{/* API Key Metadata */}
						{currentItem.category === "apikey" && currentItem.metadata && (
							<DetailGroupedCard theme={theme}>
								{currentItem.metadata.keyId && (
									<DetailGroupedRow
										label="Key ID / Identifier"
										value={currentItem.metadata.keyId}
										theme={theme}
										onCopy={() => onCopyToClipboard(currentItem.metadata!.keyId, "keyid")}
										isCopied={copiedField === "keyid"}
									/>
								)}
								{currentItem.metadata.environment && (
									<DetailGroupedRow
										label="Environment"
										value={currentItem.metadata.environment}
										theme={theme}
										isDivider={!!currentItem.metadata.keyId}
									/>
								)}
							</DetailGroupedCard>
						)}

						{/* Identity Metadata */}
						{currentItem.category === "identity" && currentItem.metadata && (
							<DetailGroupedCard theme={theme}>
								{currentItem.metadata.fullName && (
									<DetailGroupedRow label="Full Name" value={currentItem.metadata.fullName} theme={theme} />
								)}
								{currentItem.metadata.phone && (
									<DetailGroupedRow
										label="Phone Number"
										value={currentItem.metadata.phone}
										theme={theme}
										isDivider={!!currentItem.metadata.fullName}
									/>
								)}
								{currentItem.metadata.address && (
									<DetailGroupedRow
										label="Physical Address"
										value={currentItem.metadata.address}
										theme={theme}
										isDivider={!!(currentItem.metadata.fullName || currentItem.metadata.phone)}
									/>
								)}
							</DetailGroupedCard>
						)}

						{/* Notes */}
						{currentItem.notes && (
							<DetailGroupedCard theme={theme}>
								<DetailGroupedRow label="Notes" value={currentItem.notes} theme={theme} />
							</DetailGroupedCard>
						)}

						{/* Custom Fields */}
						{currentItem.customFields && currentItem.customFields.length > 0 && (
							<DetailGroupedCard theme={theme}>
								{currentItem.customFields.map((cf, idx) => (
									<DetailGroupedRow
										key={cf.id || idx}
										label={cf.name || "Field"}
										value={cf.value || "—"}
										theme={theme}
										isDivider={idx > 0}
										onCopy={cf.value ? () => onCopyToClipboard(cf.value, `cf_${idx}`) : undefined}
										isCopied={copiedField === `cf_${idx}`}
									/>
								))}
							</DetailGroupedCard>
						)}

						{/* Actions (Favorite & Delete) */}
						<Card className="border-border bg-card overflow-hidden mt-4">
							<TouchableOpacity className="flex-row items-center gap-3 px-4 py-3.5" onPress={() => onToggleFavorite(currentItem)} activeOpacity={0.7}>
								<Icon
									as={Star}
									className={currentItem.isFavorite ? "text-foreground fill-foreground" : "text-muted-foreground"}
									size={18}
								/>
								<Text className="text-sm font-medium text-foreground">
									{currentItem.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
								</Text>
							</TouchableOpacity>

							<View className="border-t border-border" />

							<TouchableOpacity className="flex-row items-center gap-3 px-4 py-3.5" onPress={handleDeletePress} activeOpacity={0.7}>
								<Icon as={Trash2} className="text-destructive" size={18} />
								<Text className="text-sm font-medium text-destructive">
									Delete {getCategoryItemLabel(currentItem.category)}
								</Text>
							</TouchableOpacity>
						</Card>
					</ScrollView>
				</Animated.View>
			{/* Delete confirmation alert — isolated in modal tree, not PWMGScreen */}
			{alertModal}
		</View>
	);
}
