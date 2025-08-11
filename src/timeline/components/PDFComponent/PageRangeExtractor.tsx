import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Scissors, Download, Loader2 } from "lucide-react";
import styled from "styled-components";
import { extractPDFPages } from "./utils";
import { ItemMenuProps } from "../ItemMenu";

interface PageRangeExtractorProps {
  url: string;
  title: string;
  item: ItemMenuProps;
  totalPages?: number;
}

export default function PageRangeExtractor({
  url,
  title,
  item,
  totalPages = 0
}: PageRangeExtractorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageRange, setPageRange] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!pageRange.trim()) {
      setError("Please enter a page range");
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const pages = parsePageRange(pageRange, totalPages);
      if (pages.length === 0) {
        throw new Error("Invalid page range");
      }

      await extractPDFPages(url, pages, `${title}_pages_${pageRange.replace(/[^0-9,-]/g, '_')}`, item);
      setIsOpen(false);
      setPageRange("");
    } catch (err: any) {
      setError(err.message || "Failed to extract pages");
    } finally {
      setIsExtracting(false);
    }
  };

  const parsePageRange = (range: string, maxPages: number): number[] => {
    const pages: number[] = [];
    const parts = range.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      
      if (trimmed.includes('-')) {
        // Range like "1-5"
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
          throw new Error(`Invalid range: ${trimmed}`);
        }
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
      } else {
        // Single page like "3"
        const pageNum = parseInt(trimmed);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > maxPages) {
          throw new Error(`Invalid page number: ${trimmed}`);
        }
        if (!pages.includes(pageNum)) pages.push(pageNum);
      }
    }

    return pages.sort((a, b) => a - b);
  };

  const getExampleText = () => {
    if (totalPages > 0) {
      return `e.g., "1,3,5-8" (1 to ${totalPages})`;
    }
    return 'e.g., "1,3,5-8"';
  };

  return (
    <>
      <ExtractButton
        onClick={() => setIsOpen(true)}
        className="hover:bg-gray-100 flex items-center gap-2"
        title="Extract Pages"
      >
        <Scissors className="w-4 h-4" />
      </ExtractButton>

      <Dialog
        visible={isOpen}
        onHide={() => setIsOpen(false)}
        header="Extract PDF Pages"
        style={{ width: '35vw' }}
      >
        <ExtractorContent>
          <Description>
            Select specific pages to extract into a new PDF file.
          </Description>
          
          <InputGroup>
            <Label>Page Range:</Label>
            <StyledInput
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder={getExampleText()}
              disabled={isExtracting}
            />
            <HelpText>
              Enter pages separated by commas (e.g., "1,3,5-8")
            </HelpText>
          </InputGroup>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          <ButtonGroup>
            <Button
              label="Cancel"
              severity="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isExtracting}
            />
            <Button
              onClick={handleExtract}
              disabled={isExtracting || !pageRange.trim()}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Extracting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Extract & Download
                </>
              )}
            </Button>
          </ButtonGroup>
        </ExtractorContent>
      </Dialog>
    </>
  );
}

const StyledDialog = styled(Dialog)`
  width: 400px;
  padding: 20px;
`;

const ExtractButton = styled(Button)`
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ExtractorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const Description = styled.p`
  color: var(--surface-600);
  font-size: 0.875rem;
  margin: 0;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--surface-700);
`;

const StyledInput = styled(InputText)`
  width: 100%;
`;

const HelpText = styled.span`
  font-size: 0.75rem;
  color: var(--surface-500);
`;

const ErrorMessage = styled.div`
  padding: 0.5rem;
  background: var(--red-50);
  color: var(--red-700);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1rem;
`;