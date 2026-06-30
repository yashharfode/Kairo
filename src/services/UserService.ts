import { db, storage, auth } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'teal' | 'slate';
  focusArea: string;
  dailyTargetDSA: number;
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  lemmaUserId?: string;
  preferences: UserPreferences;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  focusArea: 'General',
  dailyTargetDSA: 5,
};

class UserService {
  /**
   * Fetch the user profile and preferences from Firestore.
   * If it doesn't exist, create a default profile.
   */
  async getUserProfile(uid: string, email: string, displayName: string, photoURL?: string): Promise<UserProfileData> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserProfileData;
      } else {
        // Create default profile
        const defaultProfile: UserProfileData = {
          uid,
          email,
          displayName: displayName || 'KAIRO User',
          photoURL: photoURL || '',
          preferences: DEFAULT_PREFERENCES,
        };
        await setDoc(docRef, defaultProfile);
        return defaultProfile;
      }
    } catch (error) {
      console.error('[UserService] Failed to get user profile:', error);
      // Fallback
      return {
        uid,
        email,
        displayName,
        photoURL,
        preferences: DEFAULT_PREFERENCES,
      };
    }
  }

  /**
   * Update the user preferences in Firestore.
   */
  async updatePreferences(uid: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        'preferences': preferences,
      });
      // Apply theme class to document element
      if (preferences.theme) {
        this.applyTheme(preferences.theme);
      }
    } catch (error) {
      console.error('[UserService] Failed to update preferences:', error);
    }
  }

  /**
   * Upload an avatar file to Firebase Storage and update the user profile.
   */
  async uploadAvatar(uid: string, file: File): Promise<string> {
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Update Firebase Auth Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL,
        });
      }

      // 3. Update Firestore Document
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        photoURL: downloadURL,
      });

      return downloadURL;
    } catch (error) {
      console.error('[UserService] Failed to upload avatar:', error);
      throw error;
    }
  }

  /**
   * Associate the Lemma session user_id with the Firebase UID.
   */
  async associateLemmaUser(uid: string, lemmaUserId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        lemmaUserId,
      });
      console.log(`[UserService] Successfully associated Lemma User ID: ${lemmaUserId} with Firebase UID: ${uid}`);
    } catch (error) {
      console.error('[UserService] Failed to associate Lemma User:', error);
    }
  }

  /**
   * Apply selected theme to HTML classList
   */
  applyTheme(theme: string) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-teal', 'theme-slate');
    root.classList.add(`theme-${theme}`);
  }
}

export const userService = new UserService();
