import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { getSubscriptionIcon } from "@/lib/subscription-icon";

const categories = ["Entertainment", "AI Tools", "Developer Tools", "Design", "Productivity", "Cloud", "Music", "Other"];
const categoryColors: Record<string, string> = {
    Entertainment: "#f5c542",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#b8e8d0",
    Productivity: "#f4c7ab",
    Cloud: "#c9ddf5",
    Music: "#f2c6de",
    Other: "#d8dcc8",
};

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({ visible, onClose, onCreate }: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
    const [category, setCategory] = useState<string>(categories[0]);
    const parsedPrice = Number(price);
    const isValid = name.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0;

    const resetAndClose = () => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory(categories[0]);
        onClose();
    };

    const handleSubmit = () => {
        if (!isValid) return;
        const startDate = dayjs();
        onCreate({
            id: `subscription-${Date.now()}`,
            name: name.trim(),
            price: parsedPrice,
            frequency,
            category,
            status: "active",
            startDate: startDate.toISOString(),
            renewalDate: startDate.add(1, frequency === "Monthly" ? "month" : "year").toISOString(),
            icon: getSubscriptionIcon(name),
            billing: frequency,
            color: categoryColors[category],
        });
        resetAndClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
            <View className="modal-overlay">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="mt-auto"
                >
                    <View className="modal-container">
                        <View className="modal-header">
                            <Text className="modal-title">New Subscription</Text>
                            <Pressable onPress={resetAndClose} className="modal-close" accessibilityRole="button" accessibilityLabel="Close">
                                <Text className="modal-close-text">×</Text>
                            </Pressable>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View className="modal-body">
                                <View className="auth-field">
                                    <Text className="auth-label">Name</Text>
                                    <TextInput value={name} onChangeText={setName} placeholder="Subscription name" className="auth-input" returnKeyType="next" />
                                </View>
                                <View className="auth-field">
                                    <Text className="auth-label">Price</Text>
                                    <TextInput value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" className="auth-input" />
                                </View>
                                <View className="auth-field">
                                    <Text className="auth-label">Frequency</Text>
                                    <View className="picker-row">
                                        {(["Monthly", "Yearly"] as const).map((option) => (
                                            <Pressable key={option} onPress={() => setFrequency(option)} className={clsx("picker-option", frequency === option && "picker-option-active")}>
                                                <Text className={clsx("picker-option-text", frequency === option && "picker-option-text-active")}>{option}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                                <View className="auth-field">
                                    <Text className="auth-label">Category</Text>
                                    <View className="category-scroll">
                                        {categories.map((option) => (
                                            <Pressable key={option} onPress={() => setCategory(option)} className={clsx("category-chip", category === option && "category-chip-active")}>
                                                <Text className={clsx("category-chip-text", category === option && "category-chip-text-active")}>{option}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                                <Pressable onPress={handleSubmit} disabled={!isValid} className={clsx("auth-button", !isValid && "auth-button-disabled")}>
                                    <Text className="auth-button-text">Create Subscription</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default CreateSubscriptionModal;