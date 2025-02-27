import { useAppContext } from "../Context";
import DialogBtn from "../common/DialogBtn.tsx";
import { origins } from "../common/common";
import { add } from "../firebase/crud";
import { addEvent, updateEvent } from "../firebase/events";
import styles from "../styles.module.scss";
import CasesDropdown from "./CasesDropdown";
import EventsSelect from "./EventsSelect";
import MultipleSelect from "./MultipleSelect";
import PDFUploader from "./UploadPDF/index.tsx";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Editor } from "primereact/editor";
import { InputText } from "primereact/inputtext";
import { cloneElement, useState } from "react";
import styled from "styled-components";
import { useImmer } from "use-immer";

export default function AddNewEvent({ btnClassName, caseNumber }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <DialogBtn
            title={"+"}
            btnClassName={btnClassName}
            isOpen={isOpen}
            header={"יצירת אירוע חדש"}
        >
            <FormDialog close={() => setIsOpen(false)}
                        eventData={{ caseNumber }}/>
        </DialogBtn>
    );
}
const defaultState = {
    selectedCase: null,
    type: null,
    date: null,
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

    console.log("state", state);
    const addNewEvent = async () => {
        setIsLoading(true);
        console.log("addNewEvent:", state);
        addEvent(state)
            .then((createdId) => {
                console.log(createdId);
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
        }
        console.log("updateEventData:", updatedData);

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
    const isEditMode = !!state?.id;
    return (
        <div className={styles.formWrapper}>
            <LabelWrapper title="תיק">
                <CasesDropdown
                    selectedCaseNumber={
                        state.selectedCase?.caseNumber || eventData.caseNumber
                    }
                    onChange={(selectedCase) => {
                        setState((draft) => {
                            console.log(selectedCase);
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
                />
            </LabelWrapper>
            <LabelWrapper title={"תאריך"}>
                <Calendar
                    value={state.date ? new Date(state.date) : new Date()}
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
                    fileName={state.title.replace(" ", "_")}
                    updateUrls={(newUrls) => {
                        setState((draft) => {
                            draft.fileURL = newUrls;
                        });
                    }}
                    defaultType={state.type}
                />
            </LabelWrapper>
            <BottomBar>
                <Button
                    label={isEditMode ? "עדכן" : "הוסף"}
                    onClick={isEditMode ? updateEventData : addNewEvent}
                    disabled={
                        !state.selectedCase || !state.type || !state.date
                        || !state.title
                    }
                    loading={isLoading}
                />
                {isEditMode && (
                    <Button
                        label={"שכפל"}
                        outlined
                        onClick={() => {
                            setState((draft) => {
                                delete draft.id;
                                draft.fileURL = [];
                                draft.content = "";
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
