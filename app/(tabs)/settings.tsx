import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import images from "@/constants/images";
import dayjs from "dayjs";
import { posthog } from "@/lib/posthog";
import { posthogLog } from "@/lib/posthog-logger";
import { styled } from "nativewind";
import "@/global.css";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
    const { signOut } = useAuth();
    const { user } = useUser();

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    await signOut();
                    posthog?.capture("user_signed_out");
                    posthogLog.userSignedOut();
                    posthog?.reset();
                },
            },
        ]);
    };

    const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
    const joinedDate = user?.createdAt ? dayjs(user.createdAt).format("DD.MM.YYYY.") : "N/A";
    const accountId = user?.id ? `${user.id.slice(0, 16)}...` : "N/A";

    const THEME = {
        border: "#F0ECE1",         // Subtle warm beige card border
        textPrimary: "#111827",    // Dark charcoal for headers/names
        textMuted: "#78716C",      // Muted brown-grey for labels and email
        signOutBtn: "#EA6552",     // Muted coral/red from the video
    };

    return (
        <SafeAreaView className="flex-1 bg-background p-5">

            {/* Screen Title */}
            <Text className="font-sans-bold text-2xl text-primary mt-4 mb-5">
                Settings
            </Text>

            {/* User Profile Card */}
            <View
                className="bg-card"
                style={{
                    borderColor: "#000000",
                    borderWidth: 1,
                    borderRadius: 22,
                    paddingVertical: 18,
                    paddingHorizontal: 16,
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Image
                    source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                    style={{ width: 48, height: 48, borderRadius: 12, marginRight: 14 }}
                    resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "sans-bold", fontSize: 16, color: THEME.textPrimary }} numberOfLines={1}>
                        {user?.fullName || user?.firstName || "User"}
                    </Text>
                    <Text style={{ fontFamily: "sans-regular", fontSize: 12, color: THEME.textMuted, marginTop: 2 }} numberOfLines={1}>
                        {userEmail}
                    </Text>
                </View>
            </View>

            {/* Account Metadata Card */}
            <View
                className="bg-card"
                style={{
                    borderColor: "#000000",
                    borderWidth: 1,
                    borderRadius: 22,
                    paddingVertical: 18,
                    paddingHorizontal: 18,
                    marginBottom: 24,
                }}
            >
                <Text style={{ fontFamily: "sans-bold", fontSize: 14, color: THEME.textPrimary, marginBottom: 12 }}>
                    Account
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 }}>
                    <Text style={{ fontFamily: "sans-regular", fontSize: 13, color: THEME.textMuted }}>Account ID</Text>
                    <Text style={{ fontFamily: "sans-medium", fontSize: 13, color: THEME.textPrimary }} numberOfLines={1}>
                        {accountId}
                    </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 }}>
                    <Text style={{ fontFamily: "sans-regular", fontSize: 13, color: THEME.textMuted }}>Joined</Text>
                    <Text style={{ fontFamily: "sans-medium", fontSize: 13, color: THEME.textPrimary }}>
                        {joinedDate}
                    </Text>
                </View>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSignOut}
                style={{
                    backgroundColor: THEME.signOutBtn,
                    height: 50,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ fontFamily: "sans-bold", fontSize: 15, color: "#FFFFFF" }}>
                    Sign Out
                </Text>

            </TouchableOpacity>

        </SafeAreaView>
    );
}