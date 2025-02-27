import React from 'react';
import styled from 'styled-components';
import PDFButton from '../PDFButton';
import PropTypes from 'prop-types';

const MultiplePdfViewer = ({ fileURL }) => {
  if (!fileURL?.length) {
    return null;
  }

  return (
      <Wrapper>
        {fileURL.map((pdf, index) => (
            <PDFButton
                key={`${pdf.url || ''}-${index}`}
                url={pdf.url}
                label={pdf.label || 'View PDF'}
            />
        ))}
      </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  direction: rtl;
  button {
    height: 28px;
    border-radius: 2px;
    font-size: 14px;
    padding: 0 8px;
    min-width: fit-content;
    flex-grow: 1;
  }
`;

MultiplePdfViewer.propTypes = {
  fileURL: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
    label: PropTypes.string
  }))
};

export default MultiplePdfViewer;