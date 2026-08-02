import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "./api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const stored = tokenStore.getUser();
        if (stored)
            setUser(stored);
        setLoading(false);
    }, []);
    const login = useCallback(async (email, password) => {
        const res = await api("/auth/login", { method: "POST", body: { email, password } });
        tokenStore.setSession(res.access_token, res.refresh_token, res.user);
        setUser(res.user);
    }, []);
    const signup = useCallback(async (payload) => {
        await api("/auth/signup", { method: "POST", body: payload });
    }, []);
    const logout = useCallback(async () => {
        try {
            await api("/auth/logout", { auth: true });
        }
        catch {
            // ignore backend errors on logout
        }
        tokenStore.clear();
        setUser(null);
    }, []);
    const refreshProfile = useCallback(async () => {
        try {
            const profile = await api("/auth/profile", { auth: true });
            setUser(profile);
            tokenStore.setSession(tokenStore.getAccess() ?? "", tokenStore.getRefresh(), profile);
        }
        catch {
            // ignore
        }
    }, []);
    return (<AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isAdmin: user?.role === "admin",
            loading,
            login,
            signup,
            logout,
            refreshProfile,
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
