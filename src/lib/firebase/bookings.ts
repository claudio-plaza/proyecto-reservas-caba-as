import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { BookingStatus } from "@/types";

export async function getCabinBookings(cabinId: string) {
  const q = query(
    collection(db, "bookings"),
    where("cabin_id", "==", cabinId),
    where("status", "!=", "cancelled")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      start: d.startDate.toDate(),
      end: d.endDate.toDate(),
      status: d.status,
    };
  });
}

export async function createBooking(
  cabinId: string,
  userId: string,
  startDate: Date,
  endDate: Date,
  status: BookingStatus = "pending_payment"
) {
  const docRef = await addDoc(collection(db, "bookings"), {
    cabin_id: cabinId,
    user_id: userId,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    status,
    created_at: Timestamp.now(),
  });

  return { id: docRef.id, cabin_id: cabinId, user_id: userId, startDate, endDate, status };
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const bookingRef = doc(db, "bookings", bookingId);
  await updateDoc(bookingRef, { status });
}

export async function getUserBookings(userId: string) {
  const q = query(
    collection(db, "bookings"),
    where("user_id", "==", userId),
    orderBy("created_at", "desc")
  );

  const snapshot = await getDocs(q);
  const bookings: any[] = [];

  for (const bookingDoc of snapshot.docs) {
    const d = bookingDoc.data();

    // Fetch the cabin data
    let cabin = null;
    try {
      const cabinDoc = await getDoc(doc(db, "cabins", d.cabin_id));
      if (cabinDoc.exists()) {
        cabin = { id: cabinDoc.id, ...cabinDoc.data() };
      }
    } catch (e) {
      console.error("Error fetching cabin:", e);
    }

    bookings.push({
      id: bookingDoc.id,
      ...d,
      startDate: d.startDate.toDate(),
      endDate: d.endDate.toDate(),
      created_at: d.created_at.toDate(),
      cabins: cabin,
    });
  }

  return bookings;
}

export async function getBookingById(bookingId: string): Promise<any> {
  const bookingDoc = await getDoc(doc(db, "bookings", bookingId));

  if (!bookingDoc.exists()) return null;

  const d = bookingDoc.data();

  // Fetch cabin data
  let cabin = null;
  try {
    const cabinDoc = await getDoc(doc(db, "cabins", d.cabin_id));
    if (cabinDoc.exists()) {
      cabin = { id: cabinDoc.id, ...cabinDoc.data() };
    }
  } catch (e) {
    console.error("Error fetching cabin:", e);
  }

  return {
    id: bookingDoc.id,
    ...d,
    startDate: d.startDate.toDate(),
    endDate: d.endDate.toDate(),
    created_at: d.created_at.toDate(),
    cabins: cabin,
  };
}

export async function getCabinById(id: string): Promise<any> {
  const cabinDoc = await getDoc(doc(db, "cabins", id));
  if (!cabinDoc.exists()) return null;
  return { id: cabinDoc.id, ...cabinDoc.data() };
}
