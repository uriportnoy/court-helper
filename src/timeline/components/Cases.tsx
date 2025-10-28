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
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import Switch from "react-switch";
import { useImmer } from "use-immer";

// Constants from AddNewCase
const courtsArray = ["שלום", "מחוזי", "עליון"];
const courts = courtsArray.map(court => ({ label: court, value: court }));
const caseTypesArray = [
  `תלה״מ`,
  `עמ״ש`,
  `ש״ש`,
  `רמ״ש`,
  `י״ס`,
  `ע״ל`,
  `תמ״ש`,
  `בע״מ`,
  "אחר",
];

// Format options for dropdown
const caseTypes = caseTypesArray.map(type => ({ label: type, value: type }));

interface EditCaseFormProps {
  initialCase: Case;
  onClose: () => void;
}

const EditCaseForm: React.FC<EditCaseFormProps> = ({ initialCase, onClose }) => {
  const [caseInfo, setCaseInfo] = useImmer<Case>(initialCase);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "הצלחה",
      detail: message,
      life: 3000,
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "שגיאה",
      detail: message,
      life: 3000,
    });
  };

  const validateForm = (): boolean => {
    if (!caseInfo.caseNumber.trim()) {
      showError("מספר תיק נדרש");
      return false;
    }
    if (!caseInfo.court) {
      showError("בחירת בית משפט נדרשת");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const caseData: Case = {
        ...caseInfo,
        updatedAt: new Date().toISOString(),
      };

      await updateCase(caseData);
      showSuccess("התיק עודכן בהצלחה!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating case:", error);
      showError("עדכון התיק נכשל. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EditFormContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormHeader>
          <h3>ערוך תיק</h3>
          <p>עדכן את פרטי התיק למטה</p>
        </FormHeader>

        <FormSection>
          <FormGrid>
            <FormField>
              <label>מספר תיק *</label>
              <StyledInputMask
                value={caseInfo.caseNumber}
                onChange={(e) => {
                  setCaseInfo((draft) => {
                    draft.caseNumber = e.value || "";
                  });
                }}
                mask="99999-99-99"
                placeholder="הכנס מספר תיק (לדוגמה: 12345-01-23)"
              />
            </FormField>

            <FormField>
              <label>סוג התיק</label>
              <Dropdown
                value={caseInfo.type}
                onChange={(e) => {
                  setCaseInfo((draft) => {
                    draft.type = e.value;
                  });
                }}
                options={caseTypes}
                placeholder="בחר סוג תיק"
                className="w-full"
              />
            </FormField>

            <FormField>
              <label>בית משפט *</label>
              <Dropdown
                value={caseInfo.court}
                onChange={(e) => {
                  setCaseInfo((draft) => {
                    draft.court = e.value;
                  });
                }}
                options={courts}
                placeholder="בחר בית משפט"
                className="w-full"
              />
            </FormField>
          </FormGrid>

          <FormField>
            <label>תיאור</label>
            <StyledTextarea
              value={caseInfo.description || ""}
              onChange={(e) => {
                setCaseInfo((draft) => {
                  draft.description = e.target.value;
                });
              }}
              placeholder="תיאור קצר של התיק..."
              rows={3}
            />
          </FormField>

          <ToggleSection>
            <ToggleGroup>
              <ToggleField>
                <ToggleLabel>
                  <ToggleTitle>בעלות על התיק</ToggleTitle>
                  <ToggleDescription>
                    {caseInfo.isMyCase ? "זה התיק שלי" : "זה התיק שלהם"}
                  </ToggleDescription>
                </ToggleLabel>
                <ModernSwitch
                  onChange={() => {
                    setCaseInfo((draft) => {
                      draft.isMyCase = !draft.isMyCase;
                    });
                  }}
                  checked={caseInfo.isMyCase}
                  offColor="#ef4444"
                  onColor="#10b981"
                  offHandleColor="#dc2626"
                  onHandleColor="#059669"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  width={48}
                  height={24}
                />
              </ToggleField>

              <ToggleField>
                <ToggleLabel>
                  <ToggleTitle>סטטוס התיק</ToggleTitle>
                  <ToggleDescription>
                    {caseInfo.isOpen ? "התיק פתוח" : "התיק סגור"}
                  </ToggleDescription>
                </ToggleLabel>
                <ModernSwitch
                  onChange={() => {
                    setCaseInfo((draft) => {
                      draft.isOpen = !draft.isOpen;
                    });
                  }}
                  checked={caseInfo.isOpen}
                  offColor="#ef4444"
                  onColor="#10b981"
                  offHandleColor="#dc2626"
                  onHandleColor="#059669"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  width={48}
                  height={24}
                />
              </ToggleField>

              {!caseInfo.isOpen && (
                <ToggleField>
                  <ToggleLabel>
                    <ToggleTitle>תוצאת התיק</ToggleTitle>
                    <ToggleDescription>
                      {caseInfo.appealAccepted ? "התיק נזכה" : "התיק הפסיד"}
                    </ToggleDescription>
                  </ToggleLabel>
                  <ModernSwitch
                    onChange={() => {
                      setCaseInfo((draft) => {
                        draft.appealAccepted = !draft.appealAccepted;
                      });
                    }}
                    checked={caseInfo.appealAccepted}
                    offColor="#ef4444"
                    onColor="#10b981"
                    offHandleColor="#dc2626"
                    onHandleColor="#059669"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    width={48}
                    height={24}
                  />
                </ToggleField>
              )}
            </ToggleGroup>
          </ToggleSection>

          <ActionButton
            label="עדכן תיק"
            onClick={handleSave}
            loading={isLoading}
            icon="pi pi-save"
            className="p-button-lg"
          />
        </FormSection>
      </motion.div>
      <Toast ref={toast} position="top-right" />
    </EditFormContainer>
  );
};

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
                    {caseItem.type ? `${caseItem.type} ${caseItem.caseNumber}` : caseItem.caseNumber}
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
                              item={{ 
                                id: caseItem.id || "", 
                                title: caseItem.caseNumber,
                                type: caseItem.type || "",
                                content: caseItem.description || "",
                                date: caseItem.updatedAt || "",
                                fileURL: [file.fileUrl]
                              }}
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

      {/* Edit Case Dialog */}
      <Dialog
        visible={!!editingCase}
        onHide={() => setEditingCase(null)}
        header="ערוך תיק"
        style={{ width: "min(600px, 90vw)" }}
        modal
      >
        {editingCase && (
          <EditCaseForm
            initialCase={editingCase}
            onClose={() => {
              setEditingCase(null);
              loadCases();
            }}
          />
        )}
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

// Edit Form Styled Components
const EditFormContainer = styled.div`
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  direction: rtl;
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;

  h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: var(--text-color-secondary);
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: var(--text-color);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const StyledInputMask = styled(InputMask)`
  padding: 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-300);
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem var(--primary-50);
  }
`;

const StyledTextarea = styled(InputTextarea)`
  padding: 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-300);
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;

  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem var(--primary-50);
  }
`;

const ToggleSection = styled.div`
  margin: 1rem 0;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--surface-50);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-200);
`;

const ToggleField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const ToggleLabel = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.25rem;
`;

const ToggleDescription = styled.div`
  font-size: 0.875rem;
  color: var(--text-color-secondary);
`;

const ModernSwitch = styled(Switch)`
  .react-switch-handle {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  }
`;

const ActionButton = styled(Button)`
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  font-weight: 500;
  border-radius: var(--border-radius);

  .p-button-label {
    font-weight: 500;
  }
`;

export default Cases;
