import {
  updateProfile as firebaseUpdateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface ProfileData {
  displayName: string | null;
  photoURL: string | null;
  bio: string | null;
  status: string | null;
}

export async function syncUserDocument(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const displayName =
    user.displayName ||
    (user.email ? user.email.split("@")[0] : "Unknown");

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName,
        photoURL: user.photoURL ?? null,
        provider: user.providerData[0]?.providerId ?? "password",
        createdAt: new Date(),
        status: "Online",
      });
    } else {
      // Always mark Online on login, patch displayName if missing
      await updateDoc(userRef, {
        status: "Online",
        ...(!snap.data().displayName ? { displayName } : {}),
      });
    }
  } catch (err) {
    console.error("[syncUserDocument] FAILED:", err);
    throw err;
  }
}

/** Set the current user's status in Firestore */
export async function setUserStatus(uid: string, status: string): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), { status });
  } catch {
    // Silently ignore — user doc may not exist yet
  }
}

export async function fetchProfile(uid: string): Promise<Partial<ProfileData>> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return {};
  const data = snap.data();
  return {
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    bio: data.bio ?? null,
    status: data.status ?? null,
  };
}

export async function updateDisplayName(displayName: string): Promise<User> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  await firebaseUpdateProfile(user, { displayName });
  await updateDoc(doc(db, "users", user.uid), { displayName });
  return auth.currentUser!;
}

export async function updateBioAndStatus(
  bio: string,
  status: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  await updateDoc(doc(db, "users", user.uid), { bio, status });
}

export async function uploadProfilePicture(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const dataURL = await resizeAndEncode(file, 256);

  // Update user doc
  await updateDoc(doc(db, "users", user.uid), { photoURL: dataURL });

  // Also update participantProfiles in all conversations this user is part of
  // so other users see the new photo immediately
  const convSnap = await getDocs(
    query(collection(db, "conversations"), where("participants", "array-contains", user.uid))
  );
  await Promise.all(
    convSnap.docs.map((d) =>
      updateDoc(d.ref, { [`participantProfiles.${user.uid}.photoURL`]: dataURL })
    )
  );

  return dataURL;
}

/** Resize image to maxSize×maxSize and return a base64 JPEG data URL */
function resizeAndEncode(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectURL = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectURL);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = objectURL;
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Not authenticated");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
