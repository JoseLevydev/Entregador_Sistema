import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useEntregador } from "./EntregadorContext";

interface Veiculo {
  idVeiculo: number;
  placa: string;
  tipo: number;
}

function CadastroVeiculo() {
  const navigate = useNavigate();
  const { entregador } = useEntregador();
  const [tipoVeiculo, setTipoVeiculo] = useState<string>(""); // Tipo do veículo
  const [placa, setPlaca] = useState<string>("");
  const [placaValida, setPlacaValida] = useState<boolean>(true);
  const [placaExistente, setPlacaExistente] = useState<boolean>(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false); // Controle do modal

  const validatePlaca = (placa: string): boolean => {
    const regexNovo = /^[A-Z]{3}\d[A-Z]\d{2}$/; // Formato novo AAA0A00
    const regexAntigo = /^[A-Z]{3}-\d{4}$/; // Formato antigo AAA-0000
    return regexNovo.test(placa) || regexAntigo.test(placa);
  };

  const handleClick = () => {
    navigate("/login");
  };

  const voltar = () => {
    navigate("/cadastro2");
  };

  const handleCadastrar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!entregador.id) {
      alert("Erro: entregador não cadastrado.");
      return;
    }

    if (!placaValida) {
      alert("Placa inválida! Formato deve ser AAA0A00 ou AAA-0000.");
      return;
    }

    if (placaExistente) {
      alert("Placa já cadastrada!");
      return;
    }

    // Cadastro do veículo
    try {
      await axios.post("http://localhost:3002/entregador_veiculo", {
        placa,
        tipo: parseInt(tipoVeiculo, 10),
        codIdEntregador: entregador.id,
      });

      setShowSuccessAlert(true);
      setShowModal(true); // Mostrar o modal após sucesso no cadastro
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error);
      alert("Erro ao cadastrar veículo. Tente novamente.");
    }
  };

  const handleCadastrarOutroVeiculo = () => {
    setPlaca(""); // Limpa o campo de placa

    setShowModal(false); // Fecha o modal
    setShowSuccessAlert(false);
  };

  const handleVoltarLogin = () => {
    navigate("/login");
  };

  const handleChangePlaca = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toUpperCase(); // Converte para letras maiúsculas
    setPlaca(inputValue);

    const isValid = validatePlaca(inputValue);
    setPlacaValida(isValid);

    if (isValid) {
      setPlacaExistente(false); // Reseta o estado antes da verificação
      try {
        const response = await axios.get<Veiculo[]>(
          `http://localhost:3002/veiculos?placa=${inputValue}`
        );
        console.log("Resposta da API:", response.data); // Log detalhado da resposta

        // Verifique se a resposta contém a placa correta
        const placaExistente = response.data.some(
          (veiculo) => veiculo.placa === inputValue
        );
        setPlacaExistente(placaExistente);
      } catch (error) {
        console.error("Erro ao verificar placa:", error);
        alert("Erro ao verificar a placa. Tente novamente.");
      }
    } else {
      setPlacaExistente(false); // Se a placa não é válida, não pode ser existente
    }
  };

  return (
    <>
      <main>
        <div className="h-24 w-full bg-red-1">
          <label className="flex justify-start">
            <img
              onClick={handleClick}
              className="mt-6 ml-4 cursor-pointer"
              src="./public/LOGORS.png"
              alt="Logo"
            />
          </label>
        </div>

        <div className="flex justify-center m-2">
          <ul className="steps">
            <li className="step step-success">Cadastro</li>
            <li className="step step-success">Cadastro-2</li>
            <li className="step step-success">Cadastro de Veículo</li>
          </ul>
        </div>

        <div className="m-6">
          <span className="font-bold">Cadastrar veículo:</span>
        </div>

        {showSuccessAlert && (
          <div
            role="alert"
            className="alert alert-success mb-2 w-full max-w-xs mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0 stroke-current inline"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Cadastro realizado com sucesso!</span>
          </div>
        )}

        <form
          onSubmit={handleCadastrar}
          className="flex flex-col gap-8 mt-8 ml-8 items-start"
        >
          <div className="flex flex-col gap-8 md:flex-row md:gap-8">
            <div className="flex items-center">
              <input
                type="radio"
                name="tipoVeiculo"
                value="0" // Valor para MOTO
                onChange={(e) => setTipoVeiculo(e.target.value)}
                className="mr-2"
              />
              <span className="font-semibold"> - MOTO</span>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                name="tipoVeiculo"
                value="1" // Valor para CARRO
                onChange={(e) => setTipoVeiculo(e.target.value)}
                className="mr-2"
              />
              <span className="font-semibold"> - CARRO</span>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                name="tipoVeiculo"
                value="2" // Valor para OUTRO
                onChange={(e) => setTipoVeiculo(e.target.value)}
                className="mr-2"
              />
              <span className="font-semibold"> - OUTRO</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Placa do veículo"
            className="input input-bordered w-full max-w-80 flex"
            value={placa}
            onChange={handleChangePlaca}
            maxLength={8}
          />
          {!placaValida && placa && (
            <div className="text-red-500 text-sm">
              Placa inválida! Formato deve ser AAA0A00 ou AAA-0000.
            </div>
          )}
          {placaExistente && (
            <div className="text-red-500 text-sm">
              A placa já está cadastrada!
            </div>
          )}
          <div className="">
            <button type="submit" className="btn bg-green text-white mr-8">
              Cadastrar
            </button>

            <button onClick={voltar} className="btn bg-red-1 text-white">
              Voltar
            </button>
          </div>
        </form>

        {showModal && (
          <dialog open id="my_modal_1" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                Veículo cadastrado com sucesso!
              </h3>
              <p className="py-4 font-semibold">
                Você deseja cadastrar outro veículo?
              </p>
              <div className="modal-action">
                <button
                  className="btn bg-green text-white"
                  onClick={handleCadastrarOutroVeiculo}
                >
                  Sim
                </button>
                <button
                  className="btn bg-red-1 text-white"
                  onClick={handleVoltarLogin}
                >
                  Não
                </button>
              </div>
            </div>
          </dialog>
        )}

        <footer className="footer footer-center text-base-content p-4 pt-72">
          <aside>
            <p>©2018 - 2024 Rede Software Comércio e Serviços de Infor. LTDA</p>
          </aside>
        </footer>
      </main>
    </>
  );
}

export default CadastroVeiculo;
