import { Redirect, Tabs } from "expo-router";
import { tabs } from "@/constants/data";
import clsx from "clsx";
import { ActivityIndicator, View, Image, ImageSourcePropType } from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {colors, components} from "@/constants/theme";
import { useAuth } from "@clerk/expo";

const tabBar = components.tabBar;

interface TabIconsProps {
    focused: boolean;
    icon: ImageSourcePropType;
}

const TabIcon = ({ focused, icon }: TabIconsProps) => {
    return (
        <View className="tab-icon">
            <View className={clsx("tabs-pill", focused && "tabs-active")}>
                <Image source={icon} resizeMode="contain" className="tabs-glyph" />
            </View>
        </View>
    );
};

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) return <ActivityIndicator className="flex-1 bg-background" color={colors.primary} />;
    if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            sceneStyle: { backgroundColor: colors.background || "#FBF9F1" },
            tabBarStyle: {
                position: 'absolute',
                bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                height: tabBar.height,
                marginHorizontal: tabBar.horizontalInset,
                borderRadius: tabBar.radius,
                backgroundColor: colors.primary,
                borderTopWidth: 0,
                elevation: 0,
            },
            tabBarItemStyle: {
                paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
            },
            tabBarIconStyle: {
                width: tabBar.iconFrame,
                height: tabBar.iconFrame,
                alignItems: "center",
            }
        }}>
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={tab.icon} />
                        ),
                    }}
                />
            ))}
            <Tabs.Screen
                name="subscriptions/[id]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}