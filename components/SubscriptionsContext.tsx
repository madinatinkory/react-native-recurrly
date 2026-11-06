import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import * as SecureStore from "expo-secure-store";
import { useUser } from "@clerk/expo";

interface SubscriptionsContextValue {
    subscriptions: Subscription[];
    addSubscription: (subscription: Subscription) => Promise<void>;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

export const SubscriptionsProvider = ({ children }: React.PropsWithChildren) => {
    const { user, isLoaded } = useUser();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);
    const subscriptionsRef = useRef(subscriptions);
    const readyRef = useRef<Promise<void>>(Promise.resolve());
    const storageKey = user ? `subscriptions-${user.id}` : null;

    useEffect(() => {
        let isCurrent = true;
        if (!isLoaded || !storageKey) return;

        readyRef.current = (async () => {
            const storedSubscriptions = await SecureStore.getItemAsync(storageKey);
            const restored = storedSubscriptions ? JSON.parse(storedSubscriptions) as Subscription[] : HOME_SUBSCRIPTIONS;
            if (isCurrent) {
                subscriptionsRef.current = restored;
                setSubscriptions(restored);
            }
        })();

        return () => { isCurrent = false; };
    }, [isLoaded, storageKey]);

    const addSubscription = async (subscription: Subscription) => {
        await readyRef.current;
        if (!storageKey) throw new Error("No signed-in account is available");
        const updatedSubscriptions = [subscription, ...subscriptionsRef.current];
        await SecureStore.setItemAsync(storageKey, JSON.stringify(updatedSubscriptions));
        subscriptionsRef.current = updatedSubscriptions;
        setSubscriptions(updatedSubscriptions);
    };

    return (
        <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
            {children}
        </SubscriptionsContext.Provider>
    );
};

export const useSubscriptions = () => {
    const context = useContext(SubscriptionsContext);
    if (!context) throw new Error("useSubscriptions must be used within SubscriptionsProvider");
    return context;
};