import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { PDFPreviewProps } from 'pdfCreator/types';
import { useDebounce } from 'use-debounce';
import PDFContent from './PDFContent';

const PDFPreview: React.FC<PDFPreviewProps> = ({
  pages,
  settings,
  declarationData,
}) => {
  const [debouncedPages] = useDebounce(pages, 500);
  const [debouncedSettings] = useDebounce(settings, 500);
  const [debouncedDeclarationData] = useDebounce(declarationData, 500);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <PDFViewer className="w-full h-[800px] rounded">
        <PDFContent
          pages={debouncedPages}
          settings={debouncedSettings}
          declarationData={debouncedDeclarationData}
          selectedPageId={null}
        />
      </PDFViewer>
    </div>
  );
};

export default PDFPreview;