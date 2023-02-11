const TYPES: Record<string, {label: string, color: string}> = {
  DH: { label: 'DH', color: '#e8eaed' },
  OH: { label: 'ÖH', color: '#ffcfc9' },
  POLI: { label: 'POLİ', color: '#ffc8aa' },
  ASM: { label: 'ASM', color: '#ffe5a0' },
  GSM: { label: 'GSM', color: '#d4edbc' },
  TSM: { label: 'TSM', color: '#bfe1f6' },
  ADM: { label: 'ADM', color: '#c6dbe1' },
  SHR: { label: 'SHR', color: '#0a53a8' },
  SYR: { label: 'SYR', color: '#753800' },
  ECZ: { label: 'ECZ', color: '#b10202' },
  default: { label: '--', color: '#EA4335' },
};


export function getTypeColor(type: string) {
  return TYPES[type]?.color ?? TYPES.default.color;
}

export function getTypeLabel(type: string) {
  return TYPES[type]?.label ?? TYPES.default.label;
}
