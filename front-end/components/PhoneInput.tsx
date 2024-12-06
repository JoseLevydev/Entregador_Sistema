import React from "react";
import InputMask from "react-input-mask";

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, required }) => {
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  return (
    <InputMask
      mask="(99) 99999-9999"
      value={value}
      onChange={handleChange} // Use a função de mudança
      placeholder="Telefone"
      className="input input-bordered w-full max-w-80"
      required={required}
    />
  );
};

export default PhoneInput;
