import { useAuth, useSignIn, useSignUp } from "@clerk/expo";
import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import "@/global.css";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

type AuthScreenProps = { mode: "sign-in" | "sign-up" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({ mode }: AuthScreenProps) {
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();
    const { isLoaded, isSignedIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    if (isSignedIn) return <Redirect href="/(tabs)" />;

    const submit = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        setError("");
        if (!emailPattern.test(normalizedEmail)) {
            setError("Enter a valid email address to continue.");
            return;
        }
        if (!verifying && (password.length < 8 || password.length > 72)) {
            setError("Your password must be between 8 and 72 characters.");
            return;
        }
        if (verifying && !/^\d{6}$/.test(code.trim())) {
            setError("Enter the 6-digit code sent to your email.");
            return;
        }

        setBusy(true);
        try {
            if (mode === "sign-up" && verifying) {
                const result = await signUp.verifications.verifyEmailCode({ code: code.trim() });
                if (result.error) throw result.error;
                const finalized = await signUp.finalize();
                if (finalized.error) throw finalized.error;
                router.replace("/(tabs)");
            } else if (mode === "sign-up") {
                const created = await signUp.password({ emailAddress: normalizedEmail, password });
                if (created.error) throw created.error;
                const sent = await signUp.verifications.sendEmailCode();
                if (sent.error) throw sent.error;
                setVerifying(true);
            } else {
                const result = await signIn.password({ identifier: normalizedEmail, password });
                if (result.error) throw result.error;
                if (signIn.status === "complete") {
                    const finalized = await signIn.finalize();
                    if (finalized.error) throw finalized.error;
                    router.replace("/(tabs)");
                } else {
                    setError("This account needs another verification step. Try signing in with a different method or contact support.");
                }
            }
        } catch (caught) {
            setError(caught instanceof Error ? caught.message.replace(/\s+/g, " ") : "Something went wrong. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    if (!isLoaded) {
        return <View className="flex-1 items-center justify-center bg-background"><ActivityIndicator color="#081126" /></View>;
    }

    const isSignUp = mode === "sign-up";
    const title = verifying ? "Check your inbox" : isSignUp ? "Start fresh with Recurly" : "Welcome back";
    const subtitle = verifying ? `We sent a 6-digit code to ${email.trim()}.` : isSignUp ? "Keep all your subscriptions in one simple place." : "Sign in to stay on top of your subscriptions.";

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-background">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="mb-10">
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 24
                            }}
                        >
                            {/* Coral Rounded 'R' Icon */}
                            <View
                                style={{
                                    backgroundColor: "#EA6552",
                                    width: 44,
                                    height: 44,
                                    borderRadius: 14,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10,
                                }}
                            >
                                <Text style={{ fontFamily: "sans-bold", fontSize: 24, color: "#FFFFFF" }}>
                                    R
                                </Text>
                            </View>

                            {/* Recurrly / SUBSCRIPTIONS Stack */}
                            <View style={{ justifyContent: "center" }}>
                                <Text
                                    style={{
                                        fontFamily: "sans-bold",
                                        fontSize: 22,
                                        color: "#111827",
                                        lineHeight: 24,
                                    }}
                                >
                                    Recurrly
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: "sans-medium",
                                        fontSize: 9,
                                        color: "#111827",
                                        letterSpacing: 2,
                                        marginTop: 2,
                                    }}
                                >
                                    SUBSCRIPTIONS
                                </Text>
                            </View>
                        </View>

                        <Text className="text-center mb-3 font-sans-extrabold text-3xl leading-10 text-primary">{title}</Text>
                        <Text className="text-center font-sans-regular text-base leading-6 text-muted-foreground">{subtitle}</Text>
                    </View>
                    {!verifying && <>
                        <Text className="mb-2 font-sans-semibold text-sm text-primary">Email address</Text>
                        <TextInput className="mb-5 h-14 rounded-2xl border border-border bg-card px-4 font-sans-regular text-base text-primary" value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#858477" autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" accessibilityLabel="Email address" returnKeyType="next" />
                        <Text className="mb-2 font-sans-semibold text-sm text-primary">Password</Text>
                        <TextInput className="h-14 rounded-2xl border border-border bg-card px-4 font-sans-regular text-base text-primary" value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor="#858477" autoCapitalize="none" autoComplete={isSignUp ? "new-password" : "current-password"} secureTextEntry textContentType={isSignUp ? "newPassword" : "password"} accessibilityLabel="Password" returnKeyType="go" onSubmitEditing={submit} />
                    </>}
                    {verifying && <>
                        <Text className="mb-2 font-sans-semibold text-sm text-primary">Verification code</Text>
                        <TextInput className="h-14 rounded-2xl border border-border bg-card px-4 font-sans-regular text-base tracking-[6px] text-primary" value={code} onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" placeholderTextColor="#858477" keyboardType="number-pad" textContentType="oneTimeCode" maxLength={6} accessibilityLabel="Email verification code" returnKeyType="go" onSubmitEditing={submit} />
                    </>}
                    {!!error && <Text accessibilityRole="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 font-sans-medium text-sm leading-5 text-destructive">{error}</Text>}
                    <Pressable accessibilityRole="button" disabled={busy} onPress={submit} className={`mt-7 h-14 flex-row items-center justify-center rounded-2xl bg-primary ${busy ? "opacity-60" : ""}`}>
                        {busy ? <ActivityIndicator color="#fff9e3" /> : <Text className="font-sans-bold text-base text-background">{verifying ? "Verify email" : isSignUp ? "Create account" : "Sign in"}</Text>}
                    </Pressable>
                    {verifying && <Pressable className="mt-4 items-center py-3" onPress={() => { setVerifying(false); setCode(""); setError(""); }}><Text className="font-sans-semibold text-sm text-muted-foreground">Use a different email</Text></Pressable>}
                    <View className="mt-8 flex-row justify-center">
                        <Text className="font-sans-regular text-sm text-muted-foreground">{isSignUp ? "Already have an account? " : "New to Recurly? "}</Text>
                        <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-sans-bold text-sm text-accent">
                            {isSignUp ? "Sign in" : "Create account"}
                        </Link>
                    </View>
                    <Text className="mt-8 text-center font-sans-regular text-xs leading-5 text-muted-foreground">Your account details are protected and used only to keep your subscriptions in sync.</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}