import { useState, useEffect } from "react";

export interface UserLocation {
	region: string;
	state: string;
	loading: boolean;
	error: string | null;
}

const STATE_TO_REGION: Record<string, string> = {
	Maharashtra: "maharashtra",
	"Tamil Nadu": "tamil_nadu",
	Karnataka: "karnataka",
	Kerala: "kerala",
	Telangana: "telangana",
	"Andhra Pradesh": "andhra_pradesh",
	"West Bengal": "west_bengal",
	Punjab: "punjab",
	Gujarat: "gujarat",
	"Uttar Pradesh": "default",
	"Madhya Pradesh": "default",
	Bihar: "default",
	Rajasthan: "default",
	Jharkhand: "default",
	Chhattisgarh: "default",
	Uttarakhand: "default",
	Haryana: "default",
	"Himachal Pradesh": "default",
	Delhi: "default",
};

export const useLocation = () => {
	const [location, setLocation] = useState<UserLocation>({
		region: "default",
		state: "Unknown",
		loading: true,
		error: null,
	});

	useEffect(() => {
		const fetchLocation = async () => {
			// Check session storage first
			const cached = sessionStorage.getItem("snipit-user-location");
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					setLocation({ ...parsed, loading: false });
					return;
				} catch (e) {
					console.error("Failed to parse cached location", e);
				}
			}

			if (!navigator.geolocation) {
				setLocation((prev) => ({
					...prev,
					loading: false,
					error: "Geolocation not supported",
				}));
				return;
			}

			navigator.geolocation.getCurrentPosition(
				async (position) => {
					try {
						const { latitude, longitude } = position.coords;
						const response = await fetch(
							`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
						);

						if (!response.ok)
							throw new Error("Reverse geocoding failed");

						const data = await response.json();
						const state = data.principalSubdivision || "Unknown";
						const region = STATE_TO_REGION[state] || "default";

						const result = {
							region,
							state,
							loading: false,
							error: null,
						};

						sessionStorage.setItem(
							"snipit-user-location",
							JSON.stringify(result),
						);
						setLocation(result);
					} catch (error) {
						const msg =
							error instanceof Error
								? error.message
								: "Failed to fetch location";
						setLocation((prev) => ({
							...prev,
							loading: false,
							error: msg,
						}));
					}
				},
				(error) => {
					setLocation((prev) => ({
						...prev,
						loading: false,
						error: error.message,
					}));
				},
			);
		};

		fetchLocation();
	}, []);

	return location;
};
