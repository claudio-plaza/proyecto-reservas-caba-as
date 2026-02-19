// Firebase seeding script — run with: npx tsx seed.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cabins = [
  {
    name: "Refugio del Bosque",
    description: "Una cabaña acogedora rodeada de pinos centenarios, ideal para escapar de la ciudad.",
    price_per_night: 120,
    image_urls: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"],
    created_at: Timestamp.now(),
  },
  {
    name: "Mirador del Lago",
    description: "Vista panorámica al lago y todas las comodidades premium para una estancia inolvidable.",
    price_per_night: 250,
    image_urls: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070"],
    created_at: Timestamp.now(),
  },
  {
    name: "Cabaña de Piedra",
    description: "Arquitectura clásica en piedra y madera con hogar a leña y jacuzzi privado.",
    price_per_night: 180,
    image_urls: ["https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=2070"],
    created_at: Timestamp.now(),
  },
];

async function seed() {
  console.log("Insertando cabañas de prueba en Firestore...");
  console.log("Configuración de Firebase usada:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });

  try {
    for (const cabin of cabins) {
      console.log(`Intentando insertar ${cabin.name}...`);
      const docRef = await addDoc(collection(db, "cabins"), cabin);
      console.log(`✓ ${cabin.name} — ID: ${docRef.id}`);
    }
    console.log("\n¡Listo! 3 cabañas insertadas en Firestore.");
  } catch (error) {
    console.error("Error al insertar cabañas:", error);
  } finally {
    process.exit(0);
  }
}

seed();
