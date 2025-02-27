import React from 'react';
import { Page, PDFSettings } from '../types';
import { Table, FileText, FileSignature, Plus, Download, Trash2 } from 'lucide-react';
import DocxReader from '../features/docs/DocxReader';

interface HeaderProps {
  pdfSettings: PDFSettings;
  onSettingsChange: (settings: PDFSettings) => void;
  onAddPage: () => void;
  onGeneratePDF: () => void;
  hasPages: boolean;
  setPages: (pages: Page[]) => void;
}

const Header: React.FC<HeaderProps> = ({
  pdfSettings,
  onSettingsChange,
  onAddPage,
  onGeneratePDF,
  hasPages,
  setPages,
}) => (
  <div className="flex flex-col gap-4 mb-8">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">מחולל מסמכים</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-l pl-4">
          {/* Toggle Buttons */}
          <button
            onClick={() => onSettingsChange({ ...pdfSettings, showTable: !pdfSettings.showTable })}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all
              ${pdfSettings.showTable 
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
            title={pdfSettings.showTable ? 'הסתר טבלת תוכן' : 'הצג טבלת תוכן'}
          >
            <Table className="w-4 h-4 ml-2" />
            טבלת תוכן
          </button>

          <button
            onClick={() => onSettingsChange({ ...pdfSettings, showDeclaration: !pdfSettings.showDeclaration })}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all
              ${pdfSettings.showDeclaration 
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
            title={pdfSettings.showDeclaration ? 'הסתר תצהיר' : 'הצג תצהיר'}
          >
            <FileSignature className="w-4 h-4 ml-2" />
            תצהיר
          </button>

          <button
            onClick={() => onSettingsChange({ ...pdfSettings, showPages: !pdfSettings.showPages })}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all
              ${pdfSettings.showPages 
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
            title={pdfSettings.showPages ? 'הסתר עמודי נספחים' : 'הצג עמודי נספחים'}
          >
            <FileText className="w-4 h-4 ml-2" />
            עמודי נספחים
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddPage}
            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="ml-2 h-5 w-5" />
            הוסף עמוד
          </button>

          <button
            onClick={onGeneratePDF}
            disabled={!hasPages || (!pdfSettings.showTable && !pdfSettings.showPages && !pdfSettings.showDeclaration)}
            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="ml-2 h-5 w-5" />
            ייצא PDF
          </button>

          <DocxReader onLoad={setPages} />

          <button
            onClick={() => {
              setPages([]);
              localStorage.removeItem('court-locl-storage');
            }}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="ml-2 h-5 w-5" />
            מחק הכל
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Header;