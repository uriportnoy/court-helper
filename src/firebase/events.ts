import { TimelineEventData } from "@/theTimeline/types";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

const db = getFirestore();

export const addEvent = async (event: Partial<TimelineEventData>) => {
  try {
    const docRef = await addDoc(collection(db, "events"), event);
    console.log("Event added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event:", error);
  }
};

export const getEvents = async () => {
  try {
    const q = query(collection(db, "events"), orderBy("date"));
    const querySnapshot = await getDocs(q);
    console.log(
      "Query Snapshot:",
      querySnapshot.docs.map((t) => t.data()),
    );
    const events = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    console.log("Ordered Events:", events);
    return events;
  } catch (error) {
    console.error("Error getting events:", error);
    return [];
  }
};

export const updateEvent = async (eventData: Partial<TimelineEventData>) => {
  try {
    const eventRef = doc(db, "events", eventData.id as string);
    await updateDoc(eventRef, eventData);
    console.log("Event updated successfully!");
  } catch (error) {
    console.error("Error updating event:", error);
  }
};
