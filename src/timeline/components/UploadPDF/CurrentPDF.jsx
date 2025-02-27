import { deleteObject, getStorage, ref } from "firebase/storage";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import styled from "styled-components";
import { origins } from "../../common/common";
import { SimpleDropdown } from "../CasesDropdown";

const deleteFile = async (url) => {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, url);
    return await deleteObject(fileRef);
  } catch (err) {
    console.log(err);
    return null;
  }
};
const CurrentFile = ({ url, type, label, cb }) => {
  const [isInProgress, setIsInProgress] = useState(false);
  const [text, setText] = useState(label || "");
  const [_type, setType] = useState(type);

  return (
    <Wrapper>
      <InputText
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
        onBlur={(e) => {
          label !== e.target.value &&
            cb({
              action: "update",
              label: e.target.value,
              url,
            });
        }}
      />
      <SimpleDropdown
        options={origins}
        value={_type}
        onChange={(_t) => {
          setType(_t);
          if (_t !== type) {
            cb({
              action: "update",
              label: text,
              url,
              type: _t,
            });
          }
        }}
        placeholder={"גורם"}
        isClearable={false}
      />
      <textarea disabled defaultValue={url} />
      {isInProgress && <>Deleting...</>}
      <Button
        label={"Delete"}
        onClick={() => {
          setIsInProgress(true);
          deleteFile(url)
            .then(() => {
              cb({
                url,
                action: "delete",
              });
            })
            .finally(() => {
              setIsInProgress(false);
            });
        }}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  textarea {
    width: 100%;
    min-width: 150px;
  }
`;

export default CurrentFile;
