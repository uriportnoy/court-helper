import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { useRef } from "react";
import Switch from "react-switch";
import styled from "styled-components";
import { useImmer } from "use-immer";

const relation = {
  true: "My Case vs Them",
  false: "Their Case vs Me",
};

const status = {
  true: "Open",
  false: "Closed",
};

const result = {
  true: "Won",
  false: "Lost",
};

const courts = ["שלום", "מחוזי", "עליון"];

const caseTypes = [
  "אזרחי",
  "פלילי", 
  "מנהלי",
  "עבודה",
  "משפחה",
  "מסחרי",
  "מס",
  "אחר"
];

interface AddNewCaseProps {
  label?: string;
  initialCase?: Case | null;
  onClose?: () => void;
}

function AddNewCase({ label = "הוסף תיק", initialCase = null, onClose }: AddNewCaseProps) {
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
      severity: 'success',
      summary: 'הצלחה',
      detail: message,
      life: 3000
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'שגיאה', 
      detail: message,
      life: 3000
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
  width: min(600px, 90vw);
  max-height: 80vh;
  overflow-y: auto;
  direction: rtl;
`;

const SearchSection = styled.div`
  margin-bottom: 1rem;
  
  h3 {
    margin: 0 0 1rem 0;
    color: var(--text-color);
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

interface AddUpdateCaseProps {
  options: Case[];
  selectedCase: Case | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function AddUpdateCase({ options, selectedCase, onSuccess, onError }: AddUpdateCaseProps) {
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

  return (
    <FormCard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormHeader>
          <h3>{isExistingCase ? "ערוך תיק" : "צור תיק חדש"}</h3>
          <p>מלא את פרטי התיק למטה</p>
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
            label={isExistingCase ? "עדכן תיק" : "צור תיק"}
            onClick={apply}
            loading={isLoading}
            icon={isExistingCase ? "pi pi-save" : "pi pi-plus"}
            className="p-button-lg"
          />
        </FormSection>
      </motion.div>
    </FormCard>
  );
}

const FormCard = styled(Card)`
  .p-card-body {
    padding: 0;
  }
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
      `מתוכם ${herCases.length} היא הגישה, ${herAccepted.length} התקבלו, ${herDeclined.length} נדחו`,
    );
    console.log("נדחו:", herDeclined.map((it) => it.caseNumber).join(", "));
    console.log(
      `מתוכם ${myCases.length} אני הגשתי, ${mineAccepted.length} התקבלו, ${mineDeclined.length} נדחו`,
    );
  });
}

export default AddNewCase;
