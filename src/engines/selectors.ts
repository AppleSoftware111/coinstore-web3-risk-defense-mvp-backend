export interface SelectorRule {
  selector: string;
  label: string;
  weight: number;
}

export const DANGEROUS_SELECTORS: SelectorRule[] = [
  { selector: "40c10f19", label: "mint(address,uint256)", weight: 28 },
  { selector: "6a627842", label: "mint(uint256)", weight: 22 },
  { selector: "a0712d68", label: "mint(address)", weight: 20 },
  { selector: "8456cb59", label: "pause()", weight: 18 },
  { selector: "f2fde38b", label: "transferOwnership(address)", weight: 12 },
  { selector: "4378233e", label: "excludeFromFee(address)", weight: 16 },
  { selector: "c9567bf9", label: "setBlacklist(address,bool)", weight: 22 },
];

export const ERC20_SURFACE_SELECTORS = [
  "a9059cbb",
  "23b872dd",
  "095ea7b3",
  "dd62ed3e",
  "18160ddd",
  "70a08231",
];
