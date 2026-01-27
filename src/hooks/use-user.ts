import { useSession } from "@/lib/auth/auth-client";

export function useUser() {
    const { data: session, isPending, error } = useSession();

    return {
        user: session?.user || null,
        isLoading: isPending,
        error
    };
}
