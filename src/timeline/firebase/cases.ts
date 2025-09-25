import { add, getAll, update } from "./crud";
import { Case } from "../types.ts";

const COLLECTION_NAME = "cases";

export async function getAllCases(): Promise<Array<Case>> {
  const dbCases = await getAll(COLLECTION_NAME);
  if (!dbCases) return [];
  
  return (dbCases as Case[]).sort((a, b) => {
    const dateA = parseDate(a.caseNumber);
    const dateB = parseDate(b.caseNumber);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });
}

const parseDate = (str: string): Date | null => {
  let match;
  if ((match = str.match(/^(\d+)-(\d+)-(\d+)$/))) {
    const [, , month, year] = match;
    return new Date(`20${year}-${month.padStart(2, "0")}-01`);
  } else if ((match = str.match(/^(\d+)\/(\d+)$/))) {
    const [, , year] = match;
    return new Date(`20${year}-01-01`);
  }
  return null;
};

export async function updateCase(updatedData: Case) {
  if (!updatedData.id) {
    throw new Error("Case ID is required for updating a case.");
  }
  
  // Ensure files array exists and is properly structured
  const caseData = {
    ...updatedData,
    files: updatedData.files || [],
    updatedAt: new Date().toISOString(),
  };
  
  return await update(COLLECTION_NAME, updatedData.id, caseData);
}

export async function addCase(newCase: Omit<Case, 'id'>) {
  const caseData = {
    ...newCase,
    files: newCase.files || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return await add(COLLECTION_NAME, caseData);
}
