import { ItemMenuProps } from "../ItemMenu";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";

export const downloadPDF = async (url: string, fileTitle: string, item: ItemMenuProps) => {
  const downloadName = ((item.title || item.type || 'document') + '_' + fileTitle).replaceAll(' ', '_');  
  const isDocxFile = url.includes('/docx')
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${downloadName}.${isDocxFile ? 'docx' : 'pdf'}`; // Fallback name if title is undefined
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback to opening in a new tab if direct download fails
    window.open(url, "_blank");
  }
};


export const extractPDFPages = async (
  url: string, 
  pageNumbers: number[], 
  newFileName: string, 
  item: ItemMenuProps
) => {
  try {
    console.log('Extracting pages:', pageNumbers, 'from:', url);

    // Fetch the original PDF
    const fetchOptions: RequestInit = {};
    const hasPublicToken = url.includes('token=');
    const isFirebaseStorage = url.includes("firebasestorage.googleapis");
    
    if (isFirebaseStorage && !hasPublicToken) {
      // Add auth if needed (same as download function)
      const { auth } = await import("../../firebase");
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        fetchOptions.headers = { 'Authorization': `Bearer ${token}` };
      }
    }

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const pdfBytes = await response.arrayBuffer();
    
    // Load the PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    
    // Validate page numbers
    const validPages = pageNumbers.filter(pageNum => pageNum >= 1 && pageNum <= totalPages);
    if (validPages.length === 0) {
      throw new Error('No valid pages to extract');
    }

    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    
    // Copy the specified pages (pdf-lib uses 0-based indexing)
    const pageIndices = validPages.map(pageNum => pageNum - 1);
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
    
    // Add the copied pages to the new document
    copiedPages.forEach((page) => {
      newPdfDoc.addPage(page);
    });

    // Save the new PDF
    const newPdfBytes = await newPdfDoc.save();
    
    // Create a blob and download
    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${newFileName}.pdf`;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
    
    console.log(`Successfully extracted ${validPages.length} pages`);
    
  } catch (error) {
    console.error("Page extraction failed:", error);
    throw error;
  }
};