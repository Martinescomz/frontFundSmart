// Aplica a máscara "R$ 1.234,56" enquanto o usuário digita
export const maskCurrency = (value) => {
  if (!value) return '';
  
  // Converte para string e remove tudo que não for dígito
  const cleanValue = String(value).replace(/\D/g, '');
  
  if (!cleanValue) return '';

  // Transforma em número e divide por 100 para ajustar as casas decimais
  const numberValue = Number(cleanValue) / 100;

  // Formata no padrão de moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

// Transforma "R$ 1.234,56" de volta para número puro (1234.56) para enviar à API
export const unmaskCurrency = (formattedValue) => {
  if (!formattedValue) return 0;
  const cleanValue = String(formattedValue).replace(/\D/g, '');
  return Number(cleanValue) / 100;
};