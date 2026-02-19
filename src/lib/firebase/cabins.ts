import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "./config";

export async function getCabins(): Promise<any[]> {
  const q = query(collection(db, "cabins"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
