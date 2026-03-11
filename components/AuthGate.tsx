import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useUser } from "../context/UserContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "(auth)";
        const inTabsGroup = segments[0] === "(tabs)";

        if (!user && inTabsGroup) {
            router.replace("/(auth)/login");
        }

        if (user && inAuthGroup) {
            router.replace("/(tabs)");
        }
    }, [user, loading]);

    if (loading) return null;

    return <>{children}</>;
}