import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, collection, query, orderBy } from "firebase/firestore";
import { auth, db } from "./config";
import { Profile } from "@/types";

export async function signUp({
  email,
  password,
  name,
  dni,
}: {
  email: string;
  password: string;
  name: string;
  dni: string;
}) {
  // 1. Crear el usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Crear el perfil en Firestore
  await setDoc(doc(db, "profiles", userCredential.user.uid), {
    full_name: name,
    dni_number: dni,
    avatar_url: "",
    is_admin: false,
    created_at: new Date(),
  });

  return userCredential;
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function getUserProfile(uid: string): Promise<Profile | null> {
  const docRef = doc(db, "profiles", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Profile;
  }
  return null;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const q = query(collection(db, "profiles"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Profile[];
}
