export function normalizeBoardCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
