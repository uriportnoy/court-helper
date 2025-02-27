import { storage } from "./index";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

const db = getFirestore();

export const addEvent = async (event) => {
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
      querySnapshot.docs.map((t) => t.data())
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

export const updateEvent = async (eventData) => {
  try {
    const eventRef = doc(db, "events", eventData.id);
    await updateDoc(eventRef, eventData);
    console.log("Event updated successfully!");
  } catch (error) {
    console.error("Error updating event:", error);
  }
};

export const deleteEvent = async (event) => {
  try {
    const { id: eventId, fileURL } = event;
    if (Array.isArray(fileURL) && fileURL.length > 0) {
      const storage = getStorage();
      const fileRefs = fileURL.map(({ url }) => ref(storage, url));
      await Promise.all(
        fileRefs.map(async (fileRef) => {
          try {
            await getDownloadURL(fileRef); // Check if the file exists
            await deleteObject(fileRef); // Delete the file if it exists
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              console.warn(`File not found: ${fileRef.fullPath}`);
            } else {
              console.error("Error checking file existence:", error);
            }
          }
        })
      );
    }
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    console.log("Event deleted successfully!");
  } catch (error) {
    console.error("Error deleting event:", error);
  }
};

export const uploadFile = async (event) => {
  const file = event.files[0];
  const storageRef = ref(storage, `pdfs/${file.name}`);
  try {
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    console.log("File available at:", downloadUrl);
    return downloadUrl; // Save the URL to your database as needed
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};
