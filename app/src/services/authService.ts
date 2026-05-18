import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  reload,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  getEmailVerificationSettings,
  getPasswordResetSettings,
} from "@/app/src/lib/auth/actionCodeSettings";
import { auth, db } from "@/lib/firebase";

async function ensureUserDocument(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  // Use displayName if set, otherwise fall back to the part before @ in email
  const displayName =
    user.displayName ||
    (user.email ? user.email.split("@")[0] : "Unknown");

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName,
      photoURL: user.photoURL,
      provider: user.providerData[0]?.providerId ?? "password",
      createdAt: new Date(),
      status: "Online",
    });
  }
}

export const signUp = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  // Send verification first so a Firestore failure does not skip the email
  await sendEmailVerification(user, getEmailVerificationSettings());

  try {
    await ensureUserDocument(user);
  } catch (error) {
    console.error("User created but profile save failed:", error);
  }

  return user;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  try {
    await ensureUserDocument(user);
  } catch (error) {
    console.error("Google sign-in profile save failed:", error);
  }

  return user;
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email, getPasswordResetSettings());
};

export const resendVerificationEmail = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to resend a verification email.");
  }
  await sendEmailVerification(user, getEmailVerificationSettings());
};

export const reloadCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  await reload(user);
  return auth.currentUser;
};

export const logout = async (): Promise<void> => {
  await firebaseSignOut(auth);
};
