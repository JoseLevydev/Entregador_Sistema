declare module "react-input-mask" {
  import * as React from "react";

  interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: string;
    maskChar?: string;
    alwaysShowMask?: boolean;
    // Adicione outros props que você pode precisar aqui
  }

  const InputMask: React.FC<InputMaskProps>;

  export default InputMask;
}
