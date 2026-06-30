import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { userService, type UserProfileData, type UserPreferences } from '@/services/UserService';

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  associateLemmaUser: (lemmaUserId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Unsubscribe listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile in Firestore
        const userProfile = await userService.getUserProfile(
          currentUser.uid,
          currentUser.email || '',
          currentUser.displayName || 'KAIRO User',
          currentUser.photoURL || undefined
        );
        setProfile(userProfile);
        
        // Apply theme preference
        if (userProfile.preferences?.theme) {
          userService.applyTheme(userProfile.preferences.theme);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!user || !profile) return;
    const updatedPrefs = { ...profile.preferences, ...newPrefs };
    await userService.updatePreferences(user.uid, updatedPrefs);
    setProfile(prev => prev ? { ...prev, preferences: updatedPrefs } : null);
  };

  const uploadAvatar = async (file: File) => {
    if (!user || !profile) return;
    const downloadURL = await userService.uploadAvatar(user.uid, file);
    setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null);
  };

  const associateLemmaUser = async (lemmaUserId: string) => {
    if (!user || !profile) return;
    await userService.associateLemmaUser(user.uid, lemmaUserId);
    setProfile(prev => prev ? { ...prev, lemmaUserId } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      loginWithGoogle, 
      logout, 
      updatePreferences, 
      uploadAvatar,
      associateLemmaUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
