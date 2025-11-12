import ReactQuill from "react-quill";
import styled from "styled-components";

interface HtmlBoxProps {
  html: string;
  onChange: (html: string) => void;
}
export default function HtmlBox({ html, onChange }: HtmlBoxProps) {
  return (
    <Wrapper className="quill-rtl">
      <ReactQuill
        theme="snow"
        value={html}
        onChange={(value) => onChange(value)}
        className="bg-white rounded-lg border border-slate-200"
        modules={{
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: [] }, { background: [] }],
            ["clean"],
            [{ direction: "rtl" }],
          ],
        }}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .ql-container.ql-snow {
    max-height: 220px;
    overflow-y: auto;
  }
  .ql-container {
    direction: rtl;
    text-align: right;
    li{
      direction: rtl;
      text-align: right;
      padding-right: 1.5em;
    }
  }
`;
