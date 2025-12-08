import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check sessionStorage first, then localStorage
    const savedUser =
      sessionStorage.getItem("user") || localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  /*   const [user, setUser] = useState({
    name: "Sarah Carter",
    role: "External Admin",
    client: {
      name: "Test JW",
      id: "22ad3841-22ae-44f2-9639-2b49961fbe71",
    },

    status: "Active",
  }); */
  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    } else {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
    }
  }, [user, rememberMe]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, setLoading, rememberMe, setRememberMe }}
    >
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
