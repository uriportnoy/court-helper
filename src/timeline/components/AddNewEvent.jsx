import { useAppContext } from "timeline/Context";
import DialogBtn from "../common/DialogBtn.tsx";
import { origins } from "timeline/common";
import { add } from "timeline/firebase/crud";
import { addEvent, updateEvent } from "timeline/firebase/events";
import styles from "../styles.module.scss";
import CasesDropdown from "./CasesDropdown";
import EventsSelect from "./EventsSelect";
import MultipleSelect from "./MultipleSelect";
import PDFUploader from "./UploadPDF";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Editor } from "primereact/editor";
import { InputText } from "primereact/inputtext";
import { cloneElement, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useImmer } from "use-immer";
import AITextButton from "./AITextButton";
import { Tag } from "primereact/tag";

export default function AddNewEvent({ btnClassName, caseNumber }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DialogBtn
      title={"+"}
      btnClassName={btnClassName}
      isOpen={isOpen}
      header={"יצירת אירוע חדש"}
    >
      <FormDialog close={() => setIsOpen(false)} eventData={{ caseNumber }} />
    </DialogBtn>
  );
}
const defaultState = {
  selectedCase: null,
  type: null,
  date: new Date().toLocaleDateString("en-CA"),
  important: false,
  title: "",
  subtitle: "",
  content: "",
  fileURL: [],
  relatedCases: [],
  relatedDates: [],
  relatedEvent: null,
  groups: [],
};
export const FormDialog = ({ eventData = {}, close }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [state, setState] = useImmer({
    ...defaultState,
    ...eventData,
  });
  const { loadEvents, cases: options, groups } = useAppContext();

  const addNewEvent = async () => {
    setIsLoading(true);
    const createdData = {
      ...state,
      fileURL: state.fileURL.filter((file) => !!file.url),
    };
    addEvent(createdData)
      .then((createdId) => {
        setState((draft) => {
          draft.id = createdId;
        });
        loadEvents();
        close();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateEventData = async () => {
    const updatedData = {
      ...state,
      fileURL: state.fileURL.filter((file) => !!file.url),
    };

    setIsLoading(true);
    updateEvent(updatedData)
      .then(() => {
        loadEvents();
        close();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.formWrapper}>
      <FormHeaderBar>
        <div className="flex items-center gap-2">
          <i className="pi pi-plus" />
          <span>פרטי אירוע</span>
        </div>
        <ImportantToggle
          $active={!!state.important}
          onClick={() =>
            setState((draft) => {
              draft.important = !draft.important;
            })
          }
          title={state.important ? "חשוב" : "סמן כחשוב"}
        >
          <i className={`pi ${state.important ? "pi-star-fill" : "pi-star"}`} />
        </ImportantToggle>
      </FormHeaderBar>

      <FieldsGrid>
      <LabelWrapper title="תיק">
        <CasesDropdown
          selectedCaseNumber={
            state.selectedCase?.caseNumber || eventData.caseNumber
          }
          onChange={(selectedCase) => {
            setState((draft) => {
              draft.selectedCase = selectedCase;
              draft.caseNumber = selectedCase.caseNumber;
            });
          }}
        />
      </LabelWrapper>
      <LabelWrapper title="תיקים קשורים">
        <MultipleSelect
          options={options}
          onChange={(cases) => {
            setState((draft) => {
              draft.relatedCases = cases;
            });
          }}
          valKey={"id"}
          selectedOptions={state.relatedCases}
        />
      </LabelWrapper>
      <LabelWrapper title={"גורם"}>
        <Dropdown
          value={state.type}
          onChange={(e) => {
            setState((draft) => {
              draft.type = e.value;
            });
          }}
          options={origins}
          placeholder={"גורם"}
        />
      </LabelWrapper>
      <LabelWrapper title={"אירוע קודם"}>
        <EventsSelect
          onChange={(event) => {
            setState((draft) => {
              draft.relatedEvent = event.id;
            });
          }}
          value={state.relatedEvent}
          itemData={state}
        />
      </LabelWrapper>
      <LabelWrapper title={"תאריך"}>
        <Calendar
          value={new Date(state.date)}
          onChange={(e) => {
            setState((draft) => {
              const pickedDate = e.value;
              draft.date = pickedDate.toLocaleDateString("en-CA");
            });
          }}
          dateFormat="dd/mm/yy"
        />
      </LabelWrapper>
      <LabelWrapper title={"קבוצה"}>
        <MultipleSelect
          options={groups}
          onChange={(g, groups) => {
            setState((draft) => {
              draft.groups = groups;
            });
          }}
          selectedOptions={state.groups || []}
          valKey={"id"}
          labelKey={"name"}
          isCreatable
          onCreateOption={(inputValue) => {
            add("groups", { name: inputValue }).then((id) => {
              setState((draft) => {
                draft.groups.push({
                  value: id,
                  label: inputValue,
                });
              });
            });
          }}
        />
      </LabelWrapper>
      <LabelWrapper title={"כותרת"}>
        <InputText
          value={state.title}
          onChange={(e) => {
            setState((draft) => {
              draft.title = e.target.value;
            });
          }}
          placeholder={"כותרת"}
        />
      </LabelWrapper>
      <LabelWrapper title={"כותרת משנה"}>
        <InputText
          value={state.subtitle}
          onChange={(e) => {
            setState((draft) => {
              draft.subtitle = e.target.value;
            });
          }}
          placeholder={"כותרת משנה"}
        />
      </LabelWrapper>
      </FieldsGrid>

      <SectionTitle>
        <span>תוכן האירוע</span>
        {state.important && <Tag severity="warning" value="חשוב" />}
      </SectionTitle>
      <AITextButton
        originalText={state.content}
        onRewrite={(text) => {
          setState((draft) => {
            draft.content = text;
          });
        }}
      />
      <LabelWrapper title={"בארוכה"}>
        <TextEditor
          value={state.content}
          onTextChange={(e) => {
            // setText(e.htmlValue);
            setState((draft) => {
              draft.content = e.htmlValue;
            });
          }}
          placeholder={"בארוכה"}
        />
      </LabelWrapper>
      <LabelWrapper title={"קובץ"}>
        <PDFUploader
          currentFiles={state?.fileURL}
          fileName={state.title.replace(" ", "_") + "_" + state.date}
          updateFiles={(updatedFiles) => {
            setState((draft) => {
              draft.fileURL = updatedFiles;
            });
          }}
          defaultType={state.type}
        />
      </LabelWrapper>
      <BottomBar>
        <Button
          label={state?.id ? "עדכן" : "הוסף"}
          onClick={() => {
            // Determine action based on current state at the moment of click
            if (state?.id) {
              updateEventData();
            } else {
              addNewEvent();
            }
          }}
          disabled={
            !state.selectedCase || !state.type || !state.date || !state.title
          }
          loading={isLoading}
        />
        {state?.id && (
          <Button
            label={"שכפל"}
            outlined
            onClick={() => {
              setState((draft) => {
                delete draft.id;
                draft.fileURL = [];
                if (!draft.title.includes("- עותק")) {
                  draft.title = `${draft.title} - עותק`;
                }
              });
            }}
          />
        )}
      </BottomBar>
    </div>
  );
};

function LabelWrapper({ children, title }) {
  return (
    <div className={styles.labelWrapper}>
      <span>{title}</span>
      {cloneElement(children, { placeholder: title })}
    </div>
  );
}

AddNewEvent.propTypes = {
  btnClassName: PropTypes.string,
  caseNumber: PropTypes.string,
};

FormDialog.propTypes = {
  eventData: PropTypes.object,
  close: PropTypes.func.isRequired,
};

LabelWrapper.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
};

const FormHeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--surface-50);
  border: 1px solid var(--surface-200);
  border-radius: var(--border-radius);
  margin-bottom: 12px;
`;

const ImportantToggle = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--surface-300);
  border-radius: 50%;
  background: ${(p) => (p.$active ? "var(--yellow-100)" : "var(--surface-0)")};
  color: ${(p) => (p.$active ? "var(--yellow-600)" : "var(--surface-700)")};
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 12px 0 6px 0;
  padding: 0 4px;
  color: var(--text-color);
  font-weight: 600;
`;

const TextEditor = styled(Editor)`
  flex: 1;
  * {
    direction: ltr;
  }
  p {
    text-align: right;
    direction: rtl;
  }
`;
const BottomBar = styled.div`
  position: sticky;
  bottom: -2rem;
  width: 100%;
  background-color: white;
  padding: 1rem;
  gap: 8px;
  display: flex;
`;
