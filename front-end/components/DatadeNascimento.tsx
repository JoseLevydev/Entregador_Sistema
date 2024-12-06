import React from "react";
import InputMask from "react-input-mask";

interface DateOfBirthInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({
  value,
  onChange,
  required,
}) => {
  // Função para validar a data de nascimento
  const validateDate = (date: string): boolean => {
    // Verifica se a data está no formato DD/MM/YYYY
    return date.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (validateDate(newValue) || newValue.length <= 10) {
      // Permite que o usuário continue digitando
      onChange(e); // Chama a função de mudança passada como prop
    }
  };

  return (
    <InputMask
      mask="99/99/9999"
      value={value}
      onChange={handleChange} // Usar a nova função de mudança
      placeholder="Data de nascimento"
      className="input input-bordered w-full max-w-80"
      required={required}
    />
  );
};

export default DateOfBirthInput;
