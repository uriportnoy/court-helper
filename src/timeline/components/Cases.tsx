import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tooltip } from "primereact/tooltip";
import { Case, CaseFile } from "../types";
import { useAppContext } from "../Context";
import { updateCase, getAllCases } from "../firebase/cases";
import PDFButton from "./PDFView/PDFButton";
import FileUploader from "./UploadPDF/FileUploader";
import AppLoader from "../../common/AppLoader";
import AddNewCase from "./AddNewCase";

const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = cases.filter((c) =>
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCases(filtered);
    } else {
      setFilteredCases(cases);
    }
  }, [searchTerm, cases]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const loadedCases = await getAllCases();
      setCases(loadedCases);
      setFilteredCases(loadedCases);
    } catch (error) {
      console.error("Error loading cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (caseItem: Case, fileId: string) => {
    confirmDialog({
      message: "האם אתה בטוח שברצונך למחוק את הקובץ הזה?",
      header: "מחיקת קובץ",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "מחק",
      rejectLabel: "ביטול",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const updatedFiles = caseItem.files?.filter(f => f.id !== fileId) || [];
          const updatedCase = {
            ...caseItem,
            files: updatedFiles,
            updatedAt: new Date().toISOString()
          };
          
          await updateCase(updatedCase);
          await loadCases();
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
    });
  };

  const handleAddFile = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowFileDialog(true);
  };

  const handleFileUploaded = async (file: { name: string; fileUrl: string; type?: string }) => {
    if (!selectedCase) return;

    const newFile: CaseFile = {
      id: Date.now().toString(),
      name: file.name,
      fileUrl: file.fileUrl,
      type: file.type,
      uploadDate: new Date().toISOString(),
    };

    try {
      const updatedCase = {
        ...selectedCase,
        files: [...(selectedCase.files || []), newFile],
        updatedAt: new Date().toISOString()
      };

      await updateCase(updatedCase);
      await loadCases();
      setShowFileDialog(false);
      setSelectedCase(null);
    } catch (error) {
      console.error("Error adding file:", error);
    }
  };

  const getCaseStatus = (caseItem: Case) => {
    if (caseItem.isOpen) return { label: "פתוח", severity: "success" as const };
    if (caseItem.appealAccepted) return { label: "זכה", severity: "success" as const };
    return { label: "הפסיד", severity: "danger" as const };
  };

  const getCaseTypeColor = (caseItem: Case) => {
    return caseItem.isMyCase ? "var(--green-500)" : "var(--orange-500)";
  };

  if (loading) {
    return <AppLoader text="טוען תיקים..." size={100} />;
  }

  return (
    <CasesContainer>
      <Header>
        <div>
          <h1>ניהול תיקים</h1>
          <p>נהל את התיקים המשפטיים שלך והמסמכים המצורפים</p>
        </div>
        <HeaderActions>
          <SearchInput
            type="text"
            placeholder="חפש תיקים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="pi pi-search"
          />
          <AddNewCase label="הוסף תיק חדש" />
        </HeaderActions>
      </Header>

      <CasesGrid>
        <AnimatePresence>
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CaseNumber>
                    <i className="pi pi-folder" />
                    {caseItem.caseNumber}
                  </CaseNumber>
                  <CaseActions>
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-sm p-button-text"
                      tooltip="ערוך תיק"
                      tooltipOptions={{ position: "top" }}
                      onClick={() => setEditingCase(caseItem)}
                    />
                    <Badge
                      value={getCaseStatus(caseItem).label}
                      severity={getCaseStatus(caseItem).severity}
                    />
                  </CaseActions>
                </CardHeader>

                <CaseInfo>
                  <InfoRow>
                    <InfoLabel>בית משפט:</InfoLabel>
                    <InfoValue>{caseItem.court}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>סוג:</InfoLabel>
                    <InfoValue style={{ color: getCaseTypeColor(caseItem) }}>
                      {caseItem.isMyCase ? "התיק שלי" : "התיק שלהם"}
                    </InfoValue>
                  </InfoRow>
                  {caseItem.description && (
                    <InfoRow>
                      <InfoLabel>תיאור:</InfoLabel>
                      <InfoValue>{caseItem.description}</InfoValue>
                    </InfoRow>
                  )}
                </CaseInfo>

                <Divider />

                <FilesSection>
                  <FilesSectionHeader>
                    <h4>
                      <i className="pi pi-file" />
                      קבצים מצורפים ({caseItem.files?.length || 0})
                    </h4>
                    <Button
                      icon="pi pi-plus"
                      className="p-button-sm p-button-outlined"
                      label="הוסף קובץ"
                      onClick={() => handleAddFile(caseItem)}
                    />
                  </FilesSectionHeader>

                  {caseItem.files && caseItem.files.length > 0 ? (
                    <FilesList>
                      {caseItem.files.map((file) => (
                        <FileItem key={file.id}>
                          <FileInfo>
                            <i className="pi pi-file-pdf" />
                            <div>
                              <FileName>{file.name}</FileName>
                              <FileDate>
                                {new Date(file.uploadDate).toLocaleDateString()}
                              </FileDate>
                            </div>
                          </FileInfo>
                          <FileActions>
                            <PDFButton
                              url={file.fileUrl}
                              label={file.name}
                              type={file.type}
                              date=""
                              item={{ id: caseItem.id, title: caseItem.caseNumber }}
                            />
                            <Button
                              icon="pi pi-trash"
                              className="p-button-sm p-button-text p-button-danger"
                              tooltip="מחק קובץ"
                              tooltipOptions={{ position: "top" }}
                              onClick={() => handleDeleteFile(caseItem, file.id)}
                            />
                          </FileActions>
                        </FileItem>
                      ))}
                    </FilesList>
                  ) : (
                    <EmptyFiles>
                      <i className="pi pi-folder-open" />
                      <p>אין קבצים מצורפים לתיק זה</p>
                      <Button
                        label="הוסף קובץ ראשון"
                        className="p-button-sm"
                        onClick={() => handleAddFile(caseItem)}
                      />
                    </EmptyFiles>
                  )}
                </FilesSection>
              </Card>
            </CaseCard>
          ))}
        </AnimatePresence>
      </CasesGrid>

      {filteredCases.length === 0 && !loading && (
        <EmptyState>
          <i className="pi pi-folder-open" />
          <h3>לא נמצאו תיקים</h3>
          <p>
            {searchTerm ? "נסה לשנות את מונח החיפוש" : "התחל על ידי הוספת התיק הראשון שלך"}
          </p>
          {!searchTerm && <AddNewCase label="הוסף את התיק הראשון שלך" />}
        </EmptyState>
      )}

      {/* File Upload Dialog */}
      <Dialog
        visible={showFileDialog}
        onHide={() => {
          setShowFileDialog(false);
          setSelectedCase(null);
        }}
        header={`הוסף קובץ לתיק: ${selectedCase?.caseNumber}`}
        style={{ width: "600px" }}
        modal
      >
        <FileUploadDialog>
          <p>העלה קובץ חדש לצרף לתיק זה.</p>
          <FileUploader
            file={{ label: "", url: "", type: "" }}
            onFileDelete={() => {}}
            fileName={`case_${selectedCase?.caseNumber}`}
            updateFileList={(file) => {
              if (file.url) {
                handleFileUploaded({
                  name: file.label || `File_${Date.now()}`,
                  fileUrl: file.url,
                  type: file.type,
                });
              }
            }}
          />
        </FileUploadDialog>
      </Dialog>

      <ConfirmDialog />
      <Tooltip />
    </CasesContainer>
  );
};

// Styled Components
const CasesContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--surface-50);
  direction: rtl;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  h1 {
    margin: 0;
    color: var(--text-color);
    font-size: 2rem;
    font-weight: 600;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    color: var(--text-color-secondary);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchInput = styled(InputText)`
  min-width: 300px;
`;

const CasesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CaseCard = styled(motion.div)`
  .p-card {
    height: 100%;
    box-shadow: var(--shadow-2);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: var(--shadow-4);
      transform: translateY(-2px);
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CaseNumber = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CaseActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CaseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: var(--text-color-secondary);
  min-width: 80px;
`;

const InfoValue = styled.span`
  color: var(--text-color);
`;

const FilesSection = styled.div`
  margin-top: 1rem;
`;

const FilesSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h4 {
    margin: 0;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface-100);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-300);
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  
  i {
    color: var(--red-500);
    font-size: 1.25rem;
  }
`;

const FileName = styled.div`
  font-weight: 500;
  color: var(--text-color);
`;

const FileDate = styled.div`
  font-size: 0.875rem;
  color: var(--text-color-secondary);
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyFiles = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
  
  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    margin-bottom: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color-secondary);
  
  i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  h3 {
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }
  
  p {
    margin-bottom: 2rem;
  }
`;

const FileUploadDialog = styled.div`
  padding: 1rem 0;
  
  p {
    margin-bottom: 1.5rem;
    color: var(--text-color-secondary);
  }
`;

export default Cases;
