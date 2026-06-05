// Firebase seeding script — run with: npx tsx seed.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
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
    name: "Quinta Vistalba - Cumpleaños & Eventos de Verano",
    description: "Espectacular casa de verano en el corazón de Vistalba, Luján de Cuyo. Diseñada especialmente para pasar el día, festejar cumpleaños y disfrutar en familia. Cuenta con una amplia piscina con solárium, gran parque verde rodeado de viñedos, quincho cubierto con parrilla completa, vajilla y estacionamiento privado para invitados.",
    price_per_night: 150,
    image_urls: ["/imagen 2.png", "/cabaña con pileta.png", "/image 1.png"],
    location: "Vistalba, Luján de Cuyo",
    capacity: "Eventos hasta 30 personas",
    created_at: Timestamp.now(),
  },
  {
    name: "Cabaña & Club de Campo Chacras",
    description: "Exclusivo refugio de verano en Chacras de Coria. Ofrece un entorno natural inigualable rodeado de añejas arboledas, pileta de natación, amplio deck-solárium y una hermosa galería con churrasquera. Un espacio ideal para asados de cumpleaños y encuentros con amigos en las cálidas tardes mendocinas.",
    price_per_night: 180,
    image_urls: ["/cabaña con pileta.png", "/cabaña moderna.png", "/image 1.png"],
    location: "Chacras de Coria, Mendoza",
    capacity: "Capacidad 10-25 personas",
    created_at: Timestamp.now(),
  },
  {
    name: "Casa Quinta San Rafael - Eventos & Piscina",
    description: "Moderna casa quinta en San Rafael, Mendoza. Ofrece comodidades de primer nivel con una piscina increíble, quincho cerrado y climatizado para eventos de cumpleaños, churrasquera, cancha de fútbol y un amplio espacio verde con vistas espectaculares. El lugar ideal para crear recuerdos inolvidables.",
    price_per_night: 220,
    image_urls: ["/cabaña moderna.png", "/image 1.png", "/imagen 2.png"],
    location: "San Rafael, Mendoza",
    capacity: "Eventos y estadías (hasta 20 personas)",
    created_at: Timestamp.now(),
  },
];

async function cleanCollection() {
  console.log("Limpiando colección 'cabins' existente...");
  const querySnapshot = await getDocs(collection(db, "cabins"));
  for (const docSnapshot of querySnapshot.docs) {
    await deleteDoc(doc(db, "cabins", docSnapshot.id));
    console.log(`Eliminado documento: ${docSnapshot.id}`);
  }
  console.log("Colección limpiada.");
}

async function seed() {
  console.log("Iniciando proceso de seeding en Firestore...");
  console.log("Configuración de Firebase usada:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });

  try {
    await cleanCollection();
    
    console.log("Insertando cabañas de prueba en Firestore...");
    for (const cabin of cabins) {
      console.log(`Intentando insertar ${cabin.name}...`);
      const docRef = await addDoc(collection(db, "cabins"), cabin);
      console.log(`✓ ${cabin.name} — ID: ${docRef.id}`);
    }
    console.log("\n¡Listo! Cabañas mendocinas insertadas en Firestore.");
  } catch (error) {
    console.error("Error al insertar cabañas:", error);
  } finally {
    process.exit(0);
  }
}

seed();
