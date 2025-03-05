import { useAppContext } from "timeline/Context";
import DialogBtn from "../common/DialogBtn.tsx";
import { addCase, updateCase } from "../firebase/cases.js";
import styles from "../styles.module.scss";
import CasesDropdown from "./CasesDropdown.js";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import Switch from "react-switch";
import styled from "styled-components";
import { useImmer } from "use-immer";

const relation = {
  true: "פורטנוי נ' סרגוסי",
  false: "סרגוסי נ' פורטנוי",
};
const status = {
  true: "פתוח",
  false: "סגור",
};
const result = {
  true: "התקבל",
  false: "נדחה",
};
const courts = ["שלום", "מחוזי", "העליון"];
function AddNewCase({ label = "+" }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const { cases: options } = useAppContext();
  useEffect(() => {
    printCases(options);
  }, [options]);

  return (
    <DialogBtn title={label} header={"תיק"}>
      <CasesList>
        <CasesDropdown
          selectedCaseNumber={selectedCase}
          onChange={setSelectedCase}
          className={styles.casesSelect}
          isClearable
          placeholder={"תיק קיים"}
          isCreatable
        />
        <AddUpdateCase options={options} selectedCase={selectedCase} />
      </CasesList>
    </DialogBtn>
  );
}

const CasesList = styled.div`
  width: 55vw;
  direction: rtl;
  @media (max-width: 768px) {
    width: 90vw;
  }
`;
function AddUpdateCase({ options, selectedCase }) {
  const [caseInfo, setCaseInfo] = useImmer({
    type: "",
    caseNumber: "",
    court: "",
    description: "",
    appealAccepted: false,
    isMyCase: false,
    isOpen: true,
  });
  const [isLoading, setIsLoading] = useState();
  const isExistingCase = !!selectedCase?.id;

  useEffect(() => {
    selectedCase && setCaseInfo(selectedCase);
  }, [selectedCase]);

  const apply = () => {
    setIsLoading(true);
    const _case = {
      ...caseInfo,
      status: caseInfo.status ? "פתוח" : "סגור",
    };
    const method = isExistingCase ? updateCase : addCase;
    method(_case)
      .then((t) => {
        console.log(t);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <div className="flex-column mid-popup">
      <Dropdown
        value={caseInfo.type}
        onChange={(e) => {
          setCaseInfo((draft) => {
            draft.type = e.value;
          });
        }}
        options={options.map((option) => option.type)}
        className="w-full md:w-14rem"
        placeholder={"סוג"}
      />
      <InputMask
        id="ssn_input"
        value={caseInfo.caseNumber}
        onChange={(e) => {
          setCaseInfo((draft) => {
            draft.caseNumber = e.value;
          });
        }}
        mask="99999-99-99"
        placeholder={"תיק"}
      />
      <Toggles>
        <label>
          <span>{relation[caseInfo.isMyCase]}</span>
          <Switch
            onChange={() => {
              setCaseInfo((draft) => {
                draft.isMyCase = !draft.isMyCase;
              });
            }}
            checked={caseInfo.isMyCase}
            offColor="#b9333c"
            onColor="#207307"
            offHandleColor="#79070e"
            onHandleColor="#068815"
            uncheckedIcon={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                ☹
              </div>
            }
          />
        </label>
        <label>
          <span>{`${status[caseInfo.isOpen]}`}</span>
          <Switch
            onChange={() => {
              setCaseInfo((draft) => {
                draft.isOpen = !draft.isOpen;
              });
            }}
            checked={caseInfo.isOpen}
            offColor="#b9333c"
            onColor="#207307"
            offHandleColor="#79070e"
            onHandleColor="#068815"
          />
        </label>
        {caseInfo.isOpen === false && (
          <label>
            <span>{result[caseInfo.appealAccepted]}</span>
            <Switch
              onChange={() => {
                setCaseInfo((draft) => {
                  draft.appealAccepted = !draft.appealAccepted;
                });
              }}
              checked={caseInfo.appealAccepted}
              offColor="#b9333c"
              onColor="#207307"
              offHandleColor="#79070e"
              onHandleColor="#068815"
              uncheckedIcon={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: 20,
                    color: "#fff",
                  }}
                >
                  ☹
                </div>
              }
            />
          </label>
        )}
      </Toggles>
      <InputText
        value={caseInfo.description}
        onChange={(e) => {
          setCaseInfo((draft) => {
            draft.description = e.target.value;
          });
        }}
        placeholder={"תיאור"}
      />
      <Dropdown
        value={caseInfo.court}
        onChange={(e) => {
          setCaseInfo((draft) => {
            draft.court = e.value;
          });
        }}
        options={courts}
        className="w-full md:w-14rem"
        placeholder={"בית משפט"}
      />
      <Button
        label={isExistingCase ? "Update" : "Add"}
        onClick={apply}
        loading={isLoading}
        // disabled={Object.values(caseInfo).some((val) => !val)}
      />
    </div>
  );
}

const Toggles = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  height: 3rem;
  justify-content: space-between;
  label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex: 1;
    justify-content: center;
  }
`;

function printCases(cases = []) {
  const courtTypes = ["שלום", "מחוזי", "העליון"];

  courtTypes.forEach((court) => {
    const courtCases = cases.filter((item) => item.court === court);

    const herCases = courtCases.filter((p) => !p.isMyCase);
    const myCases = courtCases.filter((p) => p.isMyCase);

    const herAccepted = herCases.filter((it) => it.appealAccepted);
    const herDeclined = herCases.filter((it) => !it.appealAccepted);

    const mineAccepted = myCases.filter((it) => it.appealAccepted);
    const mineDeclined = myCases.filter((it) => !it.appealAccepted);

    console.log("\u202B==========================================");
    console.log(`\u202B${courtCases.length} תיקים ב${court}`);
    console.log(
      `\u202Bמתוכם ${herCases.length} היא הגישה, ${herAccepted.length} התקבלו, ${herDeclined.length} נדחו`,
    );
    console.log("נדחו", herDeclined.map((it) => it.caseNumber).join(", "));
    console.log(
      `\u202Bמתוכם ${myCases.length} אני הגשתי, ${mineAccepted.length} התקבלו, ${mineDeclined.length} נדחו`,
    );
  });
}

export default AddNewCase;
