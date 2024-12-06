import React from "react";
import Select, { MultiValue } from "react-select";
import { diasSemana } from "../components/data";

// Definição do tipo para as opções
type OptionType = {
  value: string;
  label: string;
};

const MultiSelect: React.FC<{
  value: string; // Ou você pode usar um array de strings: value: string[]
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const options = diasSemana; // Supondo que 'diasSemana' é uma lista de opções

  const handleChange = (selectedOptions: MultiValue<OptionType>) => {
    const dias = selectedOptions.map((option) => option.value).join(", ");
    onChange(dias); // Atualiza o valor no componente pai
  };

  // Converte o valor atual em um array de opções selecionadas
  const selectedValues = value
    ? value.split(", ").map((day) => ({
        value: day,
        label: day,
      }))
    : []; // Evita um valor vazio

  return (
    <Select
      value={selectedValues}
      onChange={handleChange}
      isMulti
      options={options}
      isSearchable={true}
      placeholder="Dias Disponíveis"
      
    />
  );
};

export default MultiSelect;
