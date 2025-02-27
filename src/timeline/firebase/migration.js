import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
  deleteField,
} from "firebase/firestore";

export const updateDocuments = async (
  collectionName,
  cbData,
  test = true,
  action = "update"
) => {
  const db = getFirestore();

  if (!collectionName || !cbData) {
    console.error(" ======= EXAMPLE ====== ");
    console.error(`updateDocuments("cases", (data) => {
  const newObj = {};
  newObj.id = data.id;
  newObj.type = data.type;
  newObj.isMyCase = data.relation !== "סרגוסי נ' פורטנוי",
      newObj.appealAccepted = false;
  newObj.court = data.court
  return newObj;
}, true)`);
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);

    snapshot.forEach((docSnap) => {
      console.log(
        "Processing document:",
        docSnap.id,
        "with data:",
        docSnap.data()
      );
      const newData = cbData(docSnap.data());
      console.log("New data to update:", newData);

      // Validate newData is not undefined or null
      if (newData) {
        const docRef = doc(db, collectionName, docSnap.id);
        batch.update(docRef, newData);
        console.log(`Scheduled update for ${docSnap.id}`);
      } else {
        console.warn(`Skipping update for ${docSnap.id} as newData is invalid`);
      }
    });

    if (!test) {
      await batch.commit();
      console.log("Documents updated successfully!");
    } else {
      console.log("Test mode: No changes committed to the database.");
    }
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};

async function deleteFromDocument(collectionName, attributeToDelete) {
  if (!collectionName || !attributeToDelete) {
    console.error(
      "could not delete attribute, missing collectionName or attributeToDelete"
    );
    return;
  }
  try {
    const db = getFirestore();
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const batch = writeBatch(db);

    snapshot.forEach((docSnapshot) => {
      const docRef = doc(db, collectionName, docSnapshot.id);
      batch.update(docRef, {
        [attributeToDelete]: deleteField(),
      });
    });

    await batch.commit();
    console.log(
      `Successfully deleted attribute "${attributeToDelete}" from all documents in collection "${collectionName}"`
    );
  } catch (error) {
    console.error("Error deleting attribute:", error);
  }
}

window.updateDocuments = updateDocuments;
window.deleteFromDocument = deleteFromDocument;
