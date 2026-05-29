export function rtkEngine(prompt: string) {
  return `
 Kamu adalah AI coding assistant. 
 Fokus pada:
 - Kode rapi
 - Hemat token
 - Penjelasan singkat
 - Beri solusi cepat

INPUT:
${prompt}

OUTPUT:
`;
}