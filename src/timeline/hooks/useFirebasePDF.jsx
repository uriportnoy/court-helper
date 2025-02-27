import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";

const useFirebasePDF = (filePath) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchPDFUrl = async () => {
      const storage = getStorage();
      const fileRef = ref(storage, filePath); // Path to the PDF file in Firebase Storage

      try {
        const url = await getDownloadURL(fileRef);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error fetching PDF URL:", error);
      }
    };

    fetchPDFUrl();
  }, [filePath]);

  return pdfUrl;
};

export default useFirebasePDF;
