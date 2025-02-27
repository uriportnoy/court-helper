import React, { useState } from 'react';
import { PDFSettings, DeclarationData } from 'pdfCreator/types';
import { getCurrentDate } from './features/affidavits';
import {
  createNewPage,
  updatePagePositions,
  updatePageNumbers,
} from './features/items';
import { generatePDF } from './utils/pdf';
import Header from './components/Header';
import { ItemList } from './features/items';
import PDFPreview from './components/PDFPreview';
import { AffidavitForm } from './features/affidavits';
import { Page } from './features/items/types';
import './index.css';

function App() {
  const [pages, setPages] = useState<Page[]>(() => {
    return JSON.parse(localStorage.getItem('court-locl-storage') || '[]');
  });
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [draggedPage, setDraggedPage] = useState<Page | null>(null);
  const [dragOverPage, setDragOverPage] = useState<Page | null>(null);
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    showTable: true,
    showPages: true,
    showDeclaration: true,
    withSignature: false,
  });
  const [declarationData, setDeclarationData] = useState<DeclarationData>({
    name: 'אורי פורטנוי',
    id: '201410438',
    date: getCurrentDate(),
    lawyer: 'טלי בן יקיר',
    comment: 'תגובתי',
    isRemote: true,
    withSignature: true,
  });

  const addPage = () => {
    const newPage = createNewPage(pages);
    setPages([...pages, newPage]);
    setSelectedPageId(newPage.id);
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    const pageToUpdate = pages.find((p) => p.id === id);
    if (!pageToUpdate) return;

    const updatedPage = { ...pageToUpdate, ...updates };

    // If pageNumber is being updated, handle sequential updates
    if ('pageNumber' in updates && updates.pageNumber !== undefined) {
      const updatedPages = updatePageNumbers(
        pages,
        updatedPage,
        pageToUpdate.pageNumber
      );
      setPages(updatedPages);
    } else {
      setPages(pages.map((page) => (page.id === id ? updatedPage : page)));
    }
  };

  const deletePage = (id: string) => {
    setPages(pages.filter((page) => page.id !== id));
    if (selectedPageId === id) {
      setSelectedPageId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, page: Page) => {
    setDraggedPage(page);
  };

  const handleDragOver = (e: React.DragEvent, page: Page) => {
    e.preventDefault();
    if (draggedPage && draggedPage.id !== page.id) {
      setDragOverPage(page);
    }
  };

  const handleDragEnd = () => {
    setDraggedPage(null);
    setDragOverPage(null);
  };

  const handleDrop = (e: React.DragEvent, targetPage: Page) => {
    e.preventDefault();
    if (!draggedPage || draggedPage.id === targetPage.id) return;

    const updatedPages = updatePagePositions(pages, draggedPage, targetPage);
    setPages(updatedPages);
    handleDragEnd();
  };

  const handleSelectPage = (id: string) => {
    setSelectedPageId(selectedPageId === id ? null : id);
  };

  const handleGeneratePDF = async () => {
    try {
      localStorage.setItem('court-locl-storage', JSON.stringify(pages));
      await generatePDF({
        pages,
        selectedPageId: null,
        settings: pdfSettings,
        declarationData,
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{direction: 'rtl'}}>
      <div className="max-w-7xl mx-auto">
        <Header
          pdfSettings={pdfSettings}
          onSettingsChange={setPdfSettings}
          onAddPage={addPage}
          onGeneratePDF={handleGeneratePDF}
          hasPages={pages.length > 0}
          setPages={setPages}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {pdfSettings.showDeclaration && (
              <AffidavitForm
                data={declarationData}
                onChange={setDeclarationData}
              />
            )}
            <ItemList
              pages={pages}
              selectedPageId={selectedPageId}
              onUpdatePage={updatePage}
              onDeletePage={deletePage}
              onSelectPage={handleSelectPage}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              draggedPage={draggedPage}
              dragOverPage={dragOverPage}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">תצוגה מקדימה</h2>
            <PDFPreview
              key={`${pages.length}-${JSON.stringify(pages)}`}
              pages={pages}
              selectedPageId={selectedPageId}
              settings={pdfSettings}
              declarationData={declarationData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
