import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

const db = getFirestore();

export async function getAll(collection_name) {
  const casesCollection = collection(db, collection_name); // Reference to the `cases` collection
  try {
    const snapshot = await getDocs(casesCollection); // Fetch all documents
    const cases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Map to an array of objects
    console.log("Fetched items:", collection_name, cases);
    return cases; // Return the cases
  } catch (error) {
    console.error(`${collection_name}: Error fetching cases:`, error);
  }
}

export async function update(collection_name, caseId, updatedData) {
  const caseDoc = doc(db, collection_name, caseId); // Reference to the specific document
  try {
    await updateDoc(caseDoc, updatedData); // Update the document with new data
    console.log(`${collection_name}: id ${caseId} updated successfully.`);
  } catch (error) {
    console.error(`${collection_name}: Error updating case ${caseId}:`, error);
  }
}

export async function add(collection_name, newItem) {
  try {
    const docRef = await addDoc(collection(db, collection_name), newItem);
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

export async function remove(collection_name, caseId) {
  const caseDoc = doc(db, collection_name, caseId); // Reference to the specific document
  try {
    await caseDoc.delete();
    console.log(`${collection_name}: id ${caseId} deleted successfully.`);
  } catch (error) {
    console.error(`${collection_name}: Error deleting case ${caseId}:`, error);
  }
}
