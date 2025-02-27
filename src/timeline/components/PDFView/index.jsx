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
                type={pdf.type}
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
`;

MultiplePdfViewer.propTypes = {
  fileURL: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
    label: PropTypes.string
  }))
};

export default MultiplePdfViewer;