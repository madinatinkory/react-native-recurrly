import "../global.css";
import {SplashScreen, Stack} from "expo-router";
import {useFonts} from "expo-font";
import {ReactNode, useEffect, useRef} from "react";
import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

SplashScreen.preventAutoHideAsync();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error("Add your authentication publishable key to the .env file");
}

function PostHogIdentity({ children }: { children: ReactNode }) {
    const { isLoaded, user } = useUser();
    const identifiedUserId = useRef<string | null>(null);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            identifiedUserId.current = null;
            return;
        }

        if (!posthog || identifiedUserId.current === user.id) return;

        const personProperties: Record<string, string> = {};
        if (user.primaryEmailAddress?.emailAddress) {
            personProperties.email = user.primaryEmailAddress.emailAddress;
        }
        if (user.fullName) {
            personProperties.name = user.fullName;
        }

        posthog.identify(user.id, { $set: personProperties });
        identifiedUserId.current = user.id;
    }, [isLoaded, user]);

    return children;
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
        'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
        'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
        'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
        'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
        'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
    })

    useEffect(() => {
        if(fontsLoaded) {
            void SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if(!fontsLoaded) return null;

    const router = (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
    );

    return (
        <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
            <PostHogIdentity>
                {posthog ? (
                    <PostHogProvider client={posthog}>{router}</PostHogProvider>
                ) : (
                    router
                )}
            </PostHogIdentity>
        </ClerkProvider>
    );
}