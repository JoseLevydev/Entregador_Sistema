import React, { useState, useEffect } from "react";

interface DocumentInputProps {
  value: string; // Valor sem formatação
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+$/, "$1");
};

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+$/, "$1");
};

const DocumentInput: React.FC<DocumentInputProps> = ({
  value,
  onChange,
  required,
}) => {
  const [mask, setMask] = useState<string>("CPF");

  useEffect(() => {
    // Atualiza a máscara com base no valor recebido
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length <= 11) {
      setMask("CPF");
    } else {
      setMask("CNPJ");
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const digitsOnly = inputValue.replace(/\D/g, "");

    // Atualiza a máscara conforme o número de dígitos
    if (digitsOnly.length <= 11) {
      setMask("CPF");
    } else {
      setMask("CNPJ");
    }

    // Passa o valor sem formatação para o onChange
    onChange({
      target: {
        value: digitsOnly, // Armazena apenas os dígitos
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Formatação para exibição
  const formattedValue = mask === "CPF" ? formatCPF(value) : formatCNPJ(value);

  return (
    <input
      type="text"
      value={formattedValue} // Exibe o valor formatado
      onChange={handleChange}
      placeholder="CPF ou CNPJ"
      className="input input-bordered w-full max-w-80"
      required={required}
    />
  );
};

export default DocumentInput;
