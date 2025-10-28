import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "timeline/Context";
import DialogBtn from "../common/DialogBtn.tsx";
import { addCase, updateCase } from "../firebase/cases.js";
import { Case } from "../types";
import CasesDropdown from "./CasesDropdown.js";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Badge } from "primereact/badge";
import { Chip } from "primereact/chip";
import { useRef } from "react";
import Switch from "react-switch";
import styled from "styled-components";
import { useImmer } from "use-immer";


const courts = ["שלום", "מחוזי", "עליון"];

const caseTypes = [
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

interface AddNewCaseProps {
  label?: string;
  initialCase?: Case | null;
  onClose?: () => void;
}

function AddNewCase({
  label = "הוסף תיק",
  initialCase = null,
  onClose,
}: AddNewCaseProps) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(initialCase);
  const { cases: options, loadCases } = useAppContext();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (initialCase) {
      setSelectedCase(initialCase);
    }
  }, [initialCase]);

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
  return (
    <>
      <DialogBtn title={label} header="ניהול תיקים" type="court">
        <CaseFormContainer>
          <SearchSection>
            <h3>בחר תיק קיים</h3>
            <CasesDropdown
              selectedCaseNumber={selectedCase?.caseNumber}
              onChange={setSelectedCase}
              isClearable
              placeholder="חפש תיקים קיימים..."
              isCreatable
            />
          </SearchSection>

          <Divider />

          <AddUpdateCase
            options={options}
            selectedCase={selectedCase}
            onSuccess={(message) => {
              showSuccess(message);
              loadCases();
              onClose?.();
            }}
            onError={showError}
          />
        </CaseFormContainer>
      </DialogBtn>
      <Toast ref={toast} position="top-right" />
    </>
  );
}

const CaseFormContainer = styled.div`
  width: min(700px, 95vw);
  max-height: 85vh;
  overflow-y: auto;
  direction: rtl;
  background: linear-gradient(135deg, var(--surface-0) 0%, var(--surface-50) 100%);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const SearchSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--surface-0);
  border-radius: 8px;
  border: 1px solid var(--surface-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  h3 {
    margin: 0 0 1rem 0;
    color: var(--text-color);
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &::before {
      content: '🔍';
      font-size: 1.1rem;
    }
  }
`;

interface AddUpdateCaseProps {
  options: Case[];
  selectedCase: Case | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function AddUpdateCase({
  options,
  selectedCase,
  onSuccess,
  onError,
}: AddUpdateCaseProps) {
  const [caseInfo, setCaseInfo] = useImmer<Case>({
    type: "",
    caseNumber: "",
    court: "",
    description: "",
    appealAccepted: false,
    isMyCase: false,
    isOpen: true,
    files: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const isExistingCase = !!selectedCase?.id;

  useEffect(() => {
    if (selectedCase) {
      setCaseInfo(selectedCase);
    } else {
      // Reset form for new case
      setCaseInfo({
        type: "",
        caseNumber: "",
        court: "",
        description: "",
        appealAccepted: false,
        isMyCase: false,
        isOpen: true,
        files: [],
      });
    }
  }, [selectedCase, setCaseInfo]);

  const validateForm = (): boolean => {
    if (!caseInfo.caseNumber.trim()) {
      onError("מספר תיק נדרש");
      return false;
    }
    if (!caseInfo.court) {
      onError("בחירת בית משפט נדרשת");
      return false;
    }
    return true;
  };

  const apply = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const caseData: Case = {
        ...caseInfo,
        updatedAt: new Date().toISOString(),
        ...(isExistingCase ? {} : { createdAt: new Date().toISOString() }),
      };

      if (isExistingCase) {
        await updateCase(caseData);
        onSuccess("התיק עודכן בהצלחה!");
      } else {
        await addCase(caseData);
        onSuccess("התיק נוצר בהצלחה!");
      }
    } catch (error) {
      console.error("Error saving case:", error);
      onError("שמירת התיק נכשלה. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const formProgress = () => {
    let filled = 0;
    let total = 4; // Required fields: caseNumber, court, type, description
    
    if (caseInfo.caseNumber.trim()) filled++;
    if (caseInfo.court) filled++;
    if (caseInfo.type) filled++;
    if (caseInfo.description?.trim()) filled++;
    
    return Math.round((filled / total) * 100);
  };

  return (
    <ProfessionalFormCard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FormHeader>
          <HeaderContent>
            <FormTitle>
              <i className="pi pi-briefcase" />
              {isExistingCase ? "ערוך תיק משפטי" : "צור תיק משפטי חדש"}
            </FormTitle>
            <FormSubtitle>
              {isExistingCase 
                ? "עדכן את פרטי התיק הקיים"
                : "הזן את כל הפרטים הנדרשים ליצירת התיק החדש"
              }
            </FormSubtitle>
          </HeaderContent>
          {!isExistingCase && (
            <ProgressSection>
              <ProgressLabel>התקדמות מילוי הטופס</ProgressLabel>
              <ProgressBar 
                value={formProgress()} 
                showValue={false}
                style={{ height: '6px', borderRadius: '3px' }}
              />
              <ProgressText>{formProgress()}% הושלם</ProgressText>
            </ProgressSection>
          )}
        </FormHeader>

        {/* Basic Information Section */}
        <FormSectionContainer>
          <SectionHeader>
            <SectionTitle>
              <i className="pi pi-info-circle" />
              פרטים בסיסיים
            </SectionTitle>
            <SectionBadge severity="info">שדות חובה</SectionBadge>
          </SectionHeader>
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
              value={caseInfo.description}
              onChange={(e) => {
                setCaseInfo((draft) => {
                  draft.description = e.target.value;
                });
              }}
              placeholder="תיאור קצר של התיק..."
              rows={3}
            />
          </FormField>
        </FormSectionContainer>

        {/* Case Settings Section */}
        <FormSectionContainer>
          <SectionHeader>
            <SectionTitle>
              <i className="pi pi-cog" />
              הגדרות תיק
            </SectionTitle>
            <SectionBadge severity="secondary">אופציונלי</SectionBadge>
          </SectionHeader>
          
          <ProfessionalToggleSection>
            <ToggleGrid>
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
            </ToggleGrid>
          </ProfessionalToggleSection>
        </FormSectionContainer>

        {/* Action Section */}
        <ActionSection>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ProfessionalActionButton
              label={isExistingCase ? "עדכן תיק" : "צור תיק"}
              onClick={apply}
              loading={isLoading}
              icon={isExistingCase ? "pi pi-save" : "pi pi-plus"}
              className="p-button-lg"
              disabled={!caseInfo.caseNumber.trim() || !caseInfo.court}
            />
          </motion.div>
          
          {(!caseInfo.caseNumber.trim() || !caseInfo.court) && (
            <ValidationMessage>
              <i className="pi pi-exclamation-triangle" />
              יש למלא את כל השדות החובה לפני השמירה
            </ValidationMessage>
          )}
        </ActionSection>
      </motion.div>
    </ProfessionalFormCard>
  );
}

// Professional styled components
const ProfessionalFormCard = styled(Card)`
  .p-card-body {
    padding: 0;
    background: transparent;
  }
  
  border: none;
  box-shadow: none;
  background: transparent;
`;

const FormHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
    border-radius: 2px;
  }
`;

const HeaderContent = styled.div`
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  
  i {
    color: var(--primary-500);
    font-size: 1.8rem;
  }
`;

const FormSubtitle = styled.p`
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
`;

const ProgressSection = styled.div`
  margin-top: 1.5rem;
`;

const ProgressLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ProgressText = styled.div`
  font-size: 0.85rem;
  color: var(--primary-600);
  margin-top: 0.25rem;
  font-weight: 600;
  text-align: center;
`;

const FormSectionContainer = styled.div`
  margin-bottom: 2.5rem;
  background: var(--surface-0);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--surface-200);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-400), var(--primary-600), var(--primary-400));
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--surface-200);
`;

const SectionTitle = styled.h4`
  margin: 0;
  color: var(--text-color);
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    color: var(--primary-500);
    font-size: 1.2rem;
  }
`;

const SectionBadge = styled(Badge)`
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
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

const ProfessionalToggleSection = styled.div`
  margin: 1rem 0;
`;

const ToggleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ToggleField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--surface-50);
  border-radius: 12px;
  border: 1px solid var(--surface-300);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-300);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ToggleLabel = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const ToggleDescription = styled.div`
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
`;

const ModernSwitch = styled(Switch)`
  .react-switch-handle {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
    border: 2px solid white !important;
  }
  
  .react-switch-bg {
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2) !important;
  }
`;

const ActionSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid var(--surface-200);
  text-align: center;
`;

const ProfessionalActionButton = styled(Button)`
  padding: 1rem 3rem;
  font-weight: 600;
  border-radius: 50px;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-width: 200px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .p-button-label {
    font-weight: 600;
  }
`;

const ValidationMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--orange-50);
  border: 1px solid var(--orange-200);
  border-radius: 8px;
  color: var(--orange-700);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  i {
    color: var(--orange-500);
  }
`;

function printCases(cases: Case[] = []) {
  const courtTypes = ["שלום", "מחוזי", "עליון"];

  courtTypes.forEach((court) => {
    const courtCases = cases.filter((item) => item.court === court);

    const herCases = courtCases.filter((p) => !p.isMyCase);
    const myCases = courtCases.filter((p) => p.isMyCase);

    const herAccepted = herCases.filter((it) => it.appealAccepted);
    const herDeclined = herCases.filter((it) => !it.appealAccepted);

    const mineAccepted = myCases.filter((it) => it.appealAccepted);
    const mineDeclined = myCases.filter((it) => !it.appealAccepted);

    console.log("==========================================");
    console.log(`${courtCases.length} תיקים ב${court}`);
    console.log(
      `מתוכם ${herCases.length} היא הגישה, ${herAccepted.length} התקבלו, ${herDeclined.length} נדחו`
    );
    console.log("נדחו:", herDeclined.map((it) => it.caseNumber).join(", "));
    console.log(
      `מתוכם ${myCases.length} אני הגשתי, ${mineAccepted.length} התקבלו, ${mineDeclined.length} נדחו`
    );
  });
}

export default AddNewCase;
