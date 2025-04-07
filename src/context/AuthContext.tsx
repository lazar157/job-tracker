import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebase/config"; // Import Firebase auth instance
import { db } from "../firebase/config"; // Import Firestore instance
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions\


export interface ExtendedUser extends User {
  fullName?: string; // Add fullName as an optional property
}
interface AuthContextProps {
  user: ExtendedUser | null; // The currently logged-in user
  loading: boolean; // Whether the authentication state is still loading
  logout: () => Promise<void>; // Function to log out the user
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const additionalData = userDoc.exists() ? userDoc.data() : {};
  
        // Set the user with additional data (e.g., fullname)
        setUser({
          ...currentUser,
          fullName: additionalData?.fullName || null, // Add fullname if it exists
        } as ExtendedUser);
      } else {
        setUser(null); // No user is logged in
      }
      setLoading(false);
    });
  
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children} {/* Render children only when loading is complete */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};