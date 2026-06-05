// Script para asignar permisos de administrador — Ejecutar con: npx tsx make_admin.ts <USER_UID>
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import * as dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("Error: No se encontraron variables de entorno en .env.local");
  process.exit(1);
}

const uid = process.argv[2];

if (!uid) {
  console.error("Error: Debes proporcionar el UID del usuario como argumento.");
  console.log("Uso: npx tsx make_admin.ts <USER_UID>");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeAdmin() {
  console.log(`Buscando perfil para el UID: ${uid}...`);
  const profileRef = doc(db, "profiles", uid);
  
  try {
    const docSnap = await getDoc(profileRef);
    if (!docSnap.exists()) {
      console.error(`\nError: No se encontró ningún perfil de usuario con el UID: "${uid}"`);
      console.log("Sugerencia: Asegúrate de que el usuario ya se haya registrado en la aplicación web.");
      process.exit(1);
    }

    const userData = docSnap.data();
    console.log(`Perfil encontrado: ${userData.full_name || "Sin Nombre"} (DNI: ${userData.dni_number || "Sin DNI"}).`);
    console.log("Asignando rol de administrador...");
    
    await updateDoc(profileRef, {
      is_admin: true
    });
    
    console.log(`\n¡Éxito! El usuario ahora tiene permisos de administrador.`);
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
  } finally {
    process.exit(0);
  }
}

makeAdmin();
