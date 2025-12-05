import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: "Sarah Carter",
    role: "External Admin",
    client: {
      name: "Test JW",
      id: "22ad3841-22ae-44f2-9639-2b49961fbe71",
    },

    status: "Active",
  });
  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
