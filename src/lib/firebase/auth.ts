import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

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
