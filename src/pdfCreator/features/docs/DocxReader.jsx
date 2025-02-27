import React, { useState } from 'react';
import JSZip from 'jszip';

const DocxReader = ({ onLoad }) => {
  const [file, setFile] = useState(null);

  const onFileChange = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const fileResult = await readFile(content);
        console.log(fileResult);
        const resultObj = fileResult.reduce((acc, item) => {
          const id = Math.random().toString(16).slice(2);
          acc[id] = { ...item, id };
          return acc;
        }, {});
        onLoad(Object.values(resultObj));
      } catch (error) {
        console.error(error);
      }
    };
    reader.onerror = (err) => console.error('File reading error:', err);
    reader.readAsArrayBuffer(uploadedFile);
  };

  async function readFile(content) {
    const paragraphs = await getParagraphs(content);
    const inputString = paragraphs.join();
    const regexPattern = /(?:מסומן|נספח)\s*([0-9]+)/g;

    const matches = new Map();
    let lastPage = 1;
    let match;

    while ((match = regexPattern.exec(inputString)) !== null) {
      const attachment = parseInt(match[1]);

      const matchStartIndex = match.index;
      const hintStartIndex = Math.max(0, matchStartIndex - 300);
      const hint = inputString
        .substring(hintStartIndex, matchStartIndex)
        .trim();

      if (!matches.has(attachment)) {
        lastPage += 2;
        matches.set(attachment, {
          id: crypto.randomUUID(),
          description: '',
          position: attachment,
          pageNumber: lastPage,
          hint,
        });
      }
    }
    console.log(Array.from(matches.values()));
    return Array.from(matches.values());
  }

  function str2xml(str) {
    if (str.charCodeAt(0) === 65279) {
      str = str.substr(1);
    }
    return new DOMParser().parseFromString(str, 'text/xml');
  }

  async function getParagraphs(content) {
    const zip = await JSZip.loadAsync(content);
    const xml = str2xml(await zip.file('word/document.xml').async('text'));
    // const xml = str2xml(zip.files['word/document.xml'].asText());
    const paragraphsXml = xml.getElementsByTagName('w:p');
    const paragraphs = [];
    for (let i = 0; i < paragraphsXml.length; i++) {
      let fullText = '';
      const textsXml = paragraphsXml[i].getElementsByTagName('w:t');
      for (let j = 0; j < textsXml.length; j++) {
        const textXml = textsXml[j];
        if (textXml.childNodes.length) {
          fullText += textXml.childNodes[0].nodeValue;
        }
      }
      if (fullText.trim()) {
        paragraphs.push(fullText.trim());
      }
    }
    return paragraphs;
  }

  return (
    <div>
      {file ? (
        <div>
          <p>{file.name}</p>
        </div>
      ) : (
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Upload File
        </button>
      )}
      <input
        id="fileInput"
        type="file"
        accept=".docx"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DocxReader;
