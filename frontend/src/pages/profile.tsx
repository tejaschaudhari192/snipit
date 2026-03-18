import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileSnippetList } from "@/components/profile/profile-snippet-list";
import type { PasteData } from "@/types";
import { motion } from "motion/react";

const ProfilePage = () => {
	const { t } = useTranslation();
	const { user, loading: authLoading, setUser } = useAuth();
	const apiHelpers = useApiHelpers();

	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState("");
	const [pastes, setPastes] = useState<PasteData[]>([]);
	const [loadingPastes, setLoadingPastes] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	const fetchPastes = useCallback(async () => {
		try {
			setLoadingPastes(true);
			const data = await apiHelpers.getUserPastes();
			setPastes(data);
		} catch (error) {
			console.error("Failed to fetch pastes", error);
			toast.error(
				t("profile.loading_failed", "Failed to load your snippets"),
			);
		} finally {
			setLoadingPastes(false);
		}
	}, [apiHelpers, t]);

	useEffect(() => {
		if (user) {
			setNewName(user.username);
			fetchPastes();
		}
	}, [user, fetchPastes]);

	const handleUpdateName = async () => {
		if (!newName.trim() || newName === user?.username) {
			setIsEditingName(false);
			return;
		}

		try {
			setIsUpdating(true);
			const updatedUser = await apiHelpers.updateMe({
				username: newName,
			});
			setUser({ ...user!, username: updatedUser.username });
			toast.success(
				t("profile.profile_updated", "Profile updated successfully"),
			);
			setIsEditingName(false);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } })
							.response?.data?.message
					: undefined;
			toast.error(
				errorMessage ||
					t("profile.update_failed", "Failed to update profile"),
			);
		} finally {
			setIsUpdating(false);
		}
	};

	if (authLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[80vh] container mx-auto px-4">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
				<p className="mt-4 text-muted-foreground animate-pulse">
					{t("profile.checking_auth", "Checking authentication...")}
				</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[80vh] container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center space-y-4"
				>
					<div className="p-4 rounded-full bg-muted inline-block">
						<User className="h-12 w-12 text-muted-foreground" />
					</div>
					<h2 className="text-2xl font-bold">
						{t("profile.access_denied", "Access Denied")}
					</h2>
					<p className="text-muted-foreground max-w-sm">
						{t(
							"profile.login_required",
							"Please login to view your profile and manage your snippets.",
						)}
					</p>
					<Link to="/login">
						<Button className="mt-4">
							{t("header.login", "Login Now")}
						</Button>
					</Link>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen bg-background overflow-x-hidden flex flex-col items-center w-full">
			{/* Ambient Background Glows */}
			<div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
			<div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

			<div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl w-full">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
					<ProfileInfo
						user={user}
						isEditingName={isEditingName}
						setIsEditingName={setIsEditingName}
						newName={newName}
						setNewName={setNewName}
						handleUpdateName={handleUpdateName}
						isUpdating={isUpdating}
						pastes={pastes}
					/>
					<ProfileSnippetList
						pastes={pastes}
						loading={loadingPastes}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
