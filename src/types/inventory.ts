export interface InventoryRow {
  id: string;
  rowNumber: number;
  rawText?: string;
  prefix: string;
  itemCode: string;
  fullCode: string;
  year: string;
  ageType?: 'months' | 'years';
  quantity: number;
  binNumber: string;
  isCarryForward: boolean;
  carryForwardFrom?: string;
  isDuplicate?: boolean;
  sectionIndex?: number;
  sectionName?: string;
}

export interface DuplicateWarning {
  id: string;
  itemCode: string;
  fullCode: string;
  year: string;
  rowIndices: number[];
  message: string;
  resolved: boolean;
  resolutionChoice?: 'merged' | 'kept_both' | 'deleted_duplicate' | 'edited';
}

export interface SectionSummary {
  sectionIndex: number;
  title: string;
  prefix: string;
  binNumber: string;
  rowCount: number;
  totalQty: number;
}

export interface SlipExtractionResult {
  detectedPrefix: string;
  detectedBinNumber: string;
  sections?: SectionSummary[];
  rows: InventoryRow[];
  duplicateWarnings: DuplicateWarning[];
  imageUrl?: string;
}
