import React, { useState, useEffect } from "react";

interface PasswordInputProps {
  onPasswordChange: (password: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ onPasswordChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validatePassword = (password: string): boolean => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*.;,?])(?=.*\d)(?=.{8,})/;
    return passwordPattern.test(password);
  };

  useEffect(() => {
    onPasswordChange(password); // Chama o callback quando a senha muda
  }, [password, onPasswordChange]);

  return (
    <div className="flex input input-bordered">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Senha"
        className="relative w-full pr-12"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 right-0 flex items-center"
      >
        {showPassword ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <rect width="90" height="90" fill="url(#pattern0_109_6)" />
            <defs>
              <pattern
                id="pattern0_109_6"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1"
              >
                <use xlinkHref="#image0_109_6" transform="scale(0.0111111)" />
              </pattern>
              <image
                id="image0_109_6"
                width="90"
                height="90"
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFbUlEQVR4nO2cXYhVVRSAv6vTqJmpY1MvUfRjYWWTlZCQUY2FxIRND0pEvWlSEFpB/5P1Ug8R9OCDCf3RQwWBPSRRNDb+RCONmgyjSH8PhfYzZmozI5Ynlq0Ll8GZuefctc/ZM3d9sOAyc+esnzln773WXvuA4ziO4ziO4ziO4ziO4ziOExnTgIXASmA98DnQC/wGHAESlSP6s179znr9mxuBqUU7ESOTgEXAK8Be4GRFMLOKXONb4GXgJtVRt9wCbAQOGQR2LDkIvAHcTJ0wBXgQ2JNDcEeS3cAq4GwmIDOAdcAfBQZ4uIgtLwDnMAE4S++egxEEdiT5HXhSn7ZxyT3ADxEEMqlSvgPuZhxxAfBuBIFLMsqHwPlEzgNAfwTBSgzG7/uJEJlQ3jN2dgjoBJ7XYWgeMFvH/Ub9fJX+rgPYon9jacM7wHQi4Vpgn6Fz32iGNzODLbN08u0xtKcPuJqCuQ8YMHKoB7jT0Laluma2sO1vYDkFUAKeA04ZODEAPApMDmBnA7AGGDSwU3x9hhyR8fFtoztlPzA/B5tbgANGNr+lMQiKLOo3GRm8E2gmP5qAHUa2b9YqY7A0eouRoV8XlPqKzm4jH74I4cO5Ghyr4WIOxXGe4TCyQ29AE6TK9aWRYYPAdRTPfMPV0naLtbaMyZ8ZGZTo6iIW1hr69WktRamScbbXE2gJl5XJhutskQ80ZqlZZ2hEYpyMWHGXsY9SLkid8VkkI5VpdS3codteMpEeV9mn21NLariu3IG7DP2UmK2oVvkio0yqUlZmDMQVQFcV15fJem5GHQ8Z+zqgG8KjcmGAzdKhjAUi2bw9nEKPfHdxBj1SBTxh7PMhjeWIdYGtxgoTLXVmuZPTBLksUgu/PLU2u+VrpXSNNPm/FEBZpgmC6oaLkUSy16In/rK8OFzRbcC/gZQtyzDx1aqzNaXO9kC+/wPcWlYiKeRPgRQlujOSho0GOjek0vh/YT+U/z+W0/RXAypJMtQ19hvolKVf2vpHyBhIjE83CoZU0pjS6WMGOuUaaZgSOAa/kkP3UGNKp48a6DwaWaClSYfXJ+DQ0RfZ0CExPt0s8ldAJfPqfDL8s3In6ZGAipaldHqJgc7bI1neiTxcqWiS4X7acOkg30ytM6KEZduZmuCvDFBMyur4JTqB5JWChyg9DGkn1Rl5IpDCWRmcX5yyj68/Y1GpKUBRSeSxseqzHwdQuopszK1y570z450srA7g76Zqdltma9qYGG9j1UKrriT6NBk5pp83ZJj4KikZb2eJfJ/mCV4YoDNzKfHRZuyjxOyGtEZYL/l2a807Fhr0uF0MQ6R51riGeLCe+F+rxRhZA35kaMwgsIA4erqtGmjKxzFqPjQ6zbDnLtF2LKktFEWzHgxKDHvwzI5ETzde1HcX2OS409CPrhBHL2YYp+ndOd/ZzcZB3h7yZpH/3ifGw0gL4VlgPFxszuOJbNCud8sJcm2gpZ9c83HjGs6beS5TS1rxsmwb26O9cCUj+9qM18mn9Oy4hX2pacvY6JKMIru0TUtKAVkKRKsDpNWH1ddCuTSAY4lW1Lr0LmrXXZA5ugfZqJ+vAe7Vp2troCpcj5Zto2CqvkHG4u0xSSRyUn2K8rVBLcanVpOCZK8W1qJGzmo/HXjDNwkk8kKsp9SHcUOTPnqDEQRwLDmhtW15Bca45WJtIbAs4ljJgJ4auIgJxEyt1/ZGEOAD+nqfIs87BqekrblyJ/2SY3B/1uGhtaiko0hKwPXa+/GVHgKyCuxxLfw8q7WOugvuaEjx/DJNUDr07N427cfr1/aqyhVCv/5OvvO+ni5o12vU9dsbHcdxHMdxHMdxHMdxHMdxiIv/AFyxU2gxdMHCAAAAAElFTkSuQmCC"
              />
            </defs>
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <rect width="90" height="90" fill="url(#pattern0_109_7)" />
            <defs>
              <pattern
                id="pattern0_109_7"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1"
              >
                <use xlinkHref="#image0_109_7" transform="scale(0.0111111)" />
              </pattern>
              <image
                id="image0_109_7"
                width="90"
                height="90"
                xlinkHref="data:image/png;base64,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"
              />
            </defs>
          </svg>
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
