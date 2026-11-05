import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return <View className="flex-1 items-center justify-center bg-background"><ActivityIndicator color="#081126" /></View>;
    }

    return <Redirect href={isSignedIn ? "/(tabs)" : "/sign-in"} />;
}