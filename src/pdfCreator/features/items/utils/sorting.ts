import { Page } from '../types';

export const getSortedPages = (pages: Page[] = []): Page[] => {
  return [...pages].sort((a, b) => a.position - b.position);
};

// Calculate page spans for all pages
const calculatePageSpans = (pages: Page[]): Map<string, number> => {
  const sortedPages = getSortedPages(pages);
  const spans = new Map<string, number>();

  for (let i = 0; i < sortedPages.length; i++) {
    const currentPage = sortedPages[i];
    const nextPage = sortedPages[i + 1];

    if (nextPage) {
      spans.set(
        currentPage.id,
        Math.max(1, nextPage.pageNumber - currentPage.pageNumber)
      );
    } else {
      // For the last page, keep its current span (distance from previous page)
      const prevPage = sortedPages[i - 1];
      if (prevPage) {
        spans.set(
          currentPage.id,
          Math.max(1, currentPage.pageNumber - prevPage.pageNumber)
        );
      } else {
        spans.set(currentPage.id, 1); // Single page
      }
    }
  }

  return spans;
};

export const updatePageNumbers = (
  pages: Page[],
  updatedPage: Page,
  oldPageNumber: number
): Page[] => {
  const sortedPages = getSortedPages(pages);
  const pageIndex = sortedPages.findIndex((p) => p.id === updatedPage.id);

  if (pageIndex === -1) return pages;

  const difference = updatedPage.pageNumber - oldPageNumber;
  const updatedPages = sortedPages.map((page, index) => {
    if (index < pageIndex) return page;
    if (index === pageIndex) return updatedPage;

    return {
      ...page,
      pageNumber: page.pageNumber + difference,
    };
  });

  return updatedPages;
};

// drag drop
export const updatePagePositions = (
  pages: Page[],
  draggedPage: Page,
  targetPage: Page
): Page[] => {
  const sortedPages = getSortedPages(pages);
  const draggedIndex = sortedPages.findIndex((p) => p.id === draggedPage.id);
  const targetIndex = sortedPages.findIndex((p) => p.id === targetPage.id);

  if (draggedIndex === -1 || targetIndex === -1) return pages;

  // Store original page spans
  const originalSpans = calculatePageSpans(pages);

  // Create reordered array
  const reorderedPages = [...sortedPages];
  reorderedPages.splice(draggedIndex, 1);
  reorderedPages.splice(targetIndex, 0, draggedPage);

  // Recalculate positions and page numbers while maintaining spans
  let currentPageNumber = 1;
  const updatedPages = reorderedPages.map((page, index) => {
    const updatedPage = {
      ...page,
      position: index + 1,
      pageNumber: Math.max(1, currentPageNumber),
    };

    // Update currentPageNumber for next iteration
    if (index < reorderedPages.length - 1) {
      const originalSpan = originalSpans.get(page.id) || 1;
      currentPageNumber += originalSpan;
    }

    return updatedPage;
  });

  return updatedPages;
};

export const createNewPage = (pages: Page[]): Page => {
  const sortedPages = getSortedPages(pages);
  const newPosition =
    pages.length > 0 ? Math.max(...pages.map((p) => p.position)) + 1 : 1;

  // Calculate new page number based on last page and its span
  let newPageNumber = 1;
  if (sortedPages.length > 0) {
    const lastPage = sortedPages[sortedPages.length - 1];
    const lastPageSpan = calculatePageSpans(pages).get(lastPage.id) || 1;
    newPageNumber = Math.max(1, lastPage.pageNumber + lastPageSpan);
  }

  return {
    id: crypto.randomUUID(),
    position: newPosition,
    description: '',
    pageNumber: newPageNumber,
  };
};
