export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function maskDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10);
}

export function maskCRM(value: string): string {
  // Formato: CRM/SP 123456 — permite letras no prefixo e números no sufixo
  const upper = value.toUpperCase();
  // Aceita digitação livre mas formata automaticamente
  const letters = upper.replace(/[^A-Z/]/g, '').slice(0, 6); // ex: CRM/SP
  const digits = upper.replace(/\D/g, '').slice(0, 6);
  if (!digits) return letters;
  if (letters.length === 0) return digits;
  return `${letters} ${digits}`;
}

/** Remove qualquer caractere não-numérico (para enviar ao backend) */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}
