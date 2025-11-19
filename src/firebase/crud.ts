import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const db = getFirestore();

export async function getAll<T>(collection_name: string): Promise<T[]> {
  const casesCollection = collection(db, collection_name); // Reference to the `cases` collection
  try {
    const snapshot = await getDocs(casesCollection); // Fetch all documents
    const cases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Map to an array of objects
    console.log("Fetched items:", collection_name, cases);
    return cases as T[]; // Return the cases
  } catch (error) {
    console.error(`${collection_name}: Error fetching cases:`, error);
    return [];
  }
}

export async function update<T>(collection_name: string, caseId: string, updatedData: T) {
  const caseDoc = doc(db, collection_name, caseId); // Reference to the specific document
  try {
    await updateDoc(caseDoc, updatedData as any); // Update the document with new data
    console.log(`${collection_name}: id ${caseId} updated successfully.`);
  } catch (error) {
    console.error(`${collection_name}: Error updating case ${caseId}:`, error);
  }
}

export async function add<T>(collection_name: string, newItem: T) {
  try {
    const docRef = await addDoc(collection(db, collection_name), newItem as any);
    console.log(`${collection_name}: id ${docRef.id} created successfully.`);
    return docRef.id;
  } catch (error) {
    console.error(`${collection_name}: Error creating item ${newItem}:`, error);
  }
}

// export async function add(collection_name, newCase) {
//   const casesCollection = collection(db, collection_name); // Reference to the `cases` collection
//   const caseDoc = doc(casesCollection, newCase.id); // Use `id` from the case as document ID
//   try {
//     await setDoc(caseDoc, newCase); // Add the document to Firestore
//     console.log(`${collection_name}: ${newCase.id} added successfully.`);
//   } catch (error) {
//     console.error(
//       `${collection_name}: Error adding case ${newCase.id}:`,
//       error
//     );
//   }
// }

export async function remove(collection_name: string, caseId: string) {
  const caseDoc = doc(db, collection_name, caseId); // Reference to the specific document
  try {
    await deleteDoc(caseDoc);
    console.log(`${collection_name}: id ${caseId} deleted successfully.`);
  } catch (error) {
    console.error(`${collection_name}: Error deleting case ${caseId}:`, error);
  }
}
