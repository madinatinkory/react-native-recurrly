import "@/global.css";
import {Text, View, Image, Animated, Pressable} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import {icons} from "@/constants/icons";
import {HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import FlatList = Animated.FlatList;
import SubscriptionCard from "@/components/SubscriptionCard";
import {useState} from "react";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useUser } from "@clerk/expo";
import { posthog } from "@/lib/posthog";
import { posthogLog } from "@/lib/posthog-logger";
import { useSubscriptions } from "@/components/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {

    const { user } = useUser();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const { subscriptions, addSubscription } = useSubscriptions();
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);

    const handleSubscriptionPress = (subscriptionId: string) => {
        if (expandedSubscriptionId !== subscriptionId) {
            posthog?.capture("subscription_details_opened", { subscription_id: subscriptionId });
            posthogLog.subscriptionDetailsOpened(subscriptionId);
        }
        setExpandedSubscriptionId((currentId) => (currentId === subscriptionId ? null : subscriptionId));
    };

    return(
        <SafeAreaView className="flex-1 bg-background p-5">
                <FlatList
                    ListHeaderComponent={() => (
                        <>
                            <View className="home-header">
                                <View className="home-user">
                                    <Image
                                        source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                                        className="home-avatar"
                                    />
                                    <Text className="home-user-name">
                                        {user?.fullName || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || HOME_USER.name}
                                    </Text>
                                </View>

                                <Pressable onPress={() => setCreateModalVisible(true)} accessibilityRole="button" accessibilityLabel="Add subscription">
                                    <Image source={icons.add} className="home-add-icon" />
                                </Pressable>
                            </View>

                            <View className="home-balance-card">
                                <Text className="home-balance-label">Balance</Text>

                                <View className="home-balance-row">
                                    <Text className="home-balance-amount">
                                        {formatCurrency(HOME_BALANCE.amount)}
                                    </Text>
                                    <Text className="home-balance-date">
                                        {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                                    </Text>
                                </View>
                            </View>

                            <View className="mb-5">
                                <ListHeading title="Upcoming" />
                                <FlatList
                                    data={UPCOMING_SUBSCRIPTIONS}
                                    renderItem= {({item}) => (
                                        <UpcomingSubscriptionCard {...item} />
                                    )}
                                    keyExtractor={(item) => item.id}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    ListEmptyComponent={<Text className="home-empty-state">No upcoming Renewals yet.</Text>}
                                />
                            </View>

                            <ListHeading title="All Subscriptions" />
                        </>
                    )}
                    data={subscriptions}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <SubscriptionCard
                            {...item}
                            expanded={expandedSubscriptionId === item.id}
                            onPress={() => handleSubscriptionPress(item.id)}
                        />
                    )}
                    extraData={expandedSubscriptionId}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text className="home-empty-state">No Subscriptions yet.</Text>}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    contentContainerClassName="pb-30"
                />
            <CreateSubscriptionModal
                visible={isCreateModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onCreate={addSubscription}
            />
        </SafeAreaView>
    )
}