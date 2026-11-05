import { Text, TextInput, View, FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useMemo, useState } from 'react'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/components/SubscriptionsContext";
const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const { subscriptions } = useSubscriptions();
    const filteredSubscriptions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return subscriptions;

        return subscriptions.filter((subscription) =>
            [subscription.name, subscription.category, subscription.plan]
                .some((value) => value?.toLowerCase().includes(query))
        );
    }, [searchQuery, subscriptions]);

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                className="flex-1 p-5"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
            <Text className="text-2xl font-bold text-foreground mb-4">Subscriptions</Text>
            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search subscriptions"
                placeholderTextColor="#8A8A8A"
                accessibilityLabel="Search subscriptions"
                returnKeyType="search"
                className="bg-card rounded-xl px-4 py-3 mb-5 text-foreground"
            />
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)}
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={<Text className="home-empty-state">No subscriptions found.</Text>}
            />
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
export default Subscriptions