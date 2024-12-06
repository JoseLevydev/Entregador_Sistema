import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraRequestButton from '../components/CameraRequestButton';
import { useEntregador } from './EntregadorContext';
import MultiSelect from '../components/MultiSelect';
import axios from 'axios';
import TimeRangePicker from '../components/TimeRangePicker';

function Cadastro2() {
  const navigate = useNavigate();
  const { entregador, setEntregador } = useEntregador();

  const [cnhNumero, setCnhNumero] = useState<string>('');
  const [cnhRegistro, setCnhRegistro] = useState<string>('');
  const [diasDisponivel, setDias] = useState<string>('');
  const [horaFuncionamentoSemana, setHorarioSemana] = useState<string>('');
  const [horaFuncionamentoFimDeSemana, setHorarioFimDeSemana] =
    useState<string>('');
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [cnhNumeroValido, setCnhNumeroValido] = useState<boolean>(true);
  const [cnhRegistroValido, setCnhRegistroValido] = useState<boolean>(true);
  const [imagemCNH, setImagemCNH] = useState<string | null>(null);
  const [imagemEntregador, setImagemEntregador] = useState<string | null>(null);

  useEffect(() => {
    const storedCnhNumero = sessionStorage.getItem('cnhNumero');
    const storedCnhRegistro = sessionStorage.getItem('cnhRegistro');
    const storedDias = sessionStorage.getItem('diasDisponivel');
    const storedHorarioSemana = sessionStorage.getItem(
      'horaFuncionamentoSemana'
    );
    const storedHorarioFimDeSemana = sessionStorage.getItem(
      'horaFuncionamentoFimDeSemana'
    );

    if (storedCnhNumero) setCnhNumero(storedCnhNumero);
    if (storedCnhRegistro) setCnhRegistro(storedCnhRegistro);
    if (storedDias) setDias(storedDias);
    if (storedHorarioSemana) setHorarioSemana(storedHorarioSemana);
    if (storedHorarioFimDeSemana)
      setHorarioFimDeSemana(storedHorarioFimDeSemana);
  }, []);

  const validateCNHNumero = (numero: string): boolean => {
    const regex = /^[0-9]{10}$/;
    return regex.test(numero);
  };

  const validateCNHRegistro = (registro: string): boolean => {
    const regex = /^[0-9]{10}$/;
    return regex.test(registro);
  };

  const handleDropdownSelect = (valor: string) => {
    setEntregador((prev) => ({
      ...prev,
      chavePix: valor,
    }));
  };

  const voltar = () => {
    navigate('/cadastro');
  };

  const handleClick = async () => {
    if (
      !cnhNumero ||
      !cnhRegistro ||
      !diasDisponivel ||
      !horaFuncionamentoSemana ||
      !horaFuncionamentoFimDeSemana ||
      !imagemCNH ||
      !imagemEntregador
    ) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const isCnhNumeroValido = validateCNHNumero(cnhNumero);
    const isCnhRegistroValido = validateCNHRegistro(cnhRegistro);
    setCnhNumeroValido(isCnhNumeroValido);
    setCnhRegistroValido(isCnhRegistroValido);

    if (!isCnhNumeroValido || !isCnhRegistroValido) {
      alert('Número ou registro da CNH inválidos!');
      return;
    }

    setEntregador((prev) => ({
      ...prev,
      cnhNumero,
      cnhRegistro,
      diasDisponivel,
      horaFuncionamento: `${horaFuncionamentoSemana};${horaFuncionamentoFimDeSemana}`,
      imagemCNH,
      imagemEntregador,
    }));

    const { senha } = entregador; // Acesse a senha do entregador

    const entregadorData = {
      ...entregador,
      cnhNumero,
      senha,
      cnhRegistro,
      diasDisponivel,
      horaFuncionamento: `${horaFuncionamentoSemana};${horaFuncionamentoFimDeSemana}`,
      imagemCNH,
      imagemEntregador,
    };

    sessionStorage.setItem('cnhNumero', cnhNumero);
    sessionStorage.setItem('cnhRegistro', cnhRegistro);
    sessionStorage.setItem('diasDisponivel', diasDisponivel);
    sessionStorage.setItem('horaFuncionamentoSemana', horaFuncionamentoSemana);
    sessionStorage.setItem(
      'horaFuncionamentoFimDeSemana',
      horaFuncionamentoFimDeSemana
    );
    try {
      const response = await axios.post(
        'http://localhost:3002/entregadores',
        entregadorData
      );
      console.log('Cadastro realizado com sucesso:', response.data);
      setShowSuccessAlert(true); // Exibir alerta de sucesso

      // Atualize o estado do entregador com o ID
      setEntregador((prev) => ({ ...prev, id: response.data.id }));

      // Mostre o modal para cadastrar veículo
      const modal = document.getElementById('my_modal_1') as HTMLDialogElement;
      modal.showModal();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao cadastrar entregador. Tente novamente.');
    }
  };

  const handleCadastrarVeiculo = () => {
    navigate('/CadastroVeiculo');
  };

  const handleVoltarLogin = () => {
    navigate('/login');
  };

  return (
    <main>
      <div className='h-24 w-full bg-red-1'>
        <label className='flex justify-start'>
          <img
            onClick={handleVoltarLogin}
            className='mt-6 ml-4 cursor-pointer'
            src='./public/LOGORS.png'
            alt='Logo'
          />
        </label>
      </div>

      <div className='flex justify-center m-2'>
        <ul className='steps'>
          <li className='step step-success'>Cadastro</li>
          <li className='step step-success'>Cadastro-2</li>
          <li className='step'>Cadastro de Veículo</li>
        </ul>
      </div>

      <div className='m-6'>
        <span className='font-bold'>Preencha os campos abaixo:</span>
      </div>
      {showSuccessAlert && (
        <div
          role='alert'
          className='alert alert-success mb-2 w-full max-w-xs mx-auto'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 shrink-0 stroke-current inline'
            fill='none'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <span>Cadastro realizado com sucesso!</span>
        </div>
      )}

      <div className='flex flex-col gap-8 mt-8 ml-8 items-start'>
        <input
          type='text'
          placeholder='Número da CNH'
          className='input input-bordered w-full max-w-80 flex'
          value={cnhNumero}
          onChange={(e) => {
            const inputValue = e.target.value.replace(/\D/g, ''); // Permite apenas dígitos
            setCnhNumero(inputValue);
            setCnhNumeroValido(validateCNHNumero(inputValue));
          }}
          maxLength={10}
          required
        />
        {!cnhNumeroValido && (
          <div className='text-red-500 text-sm'>Número da CNH inválido.</div>
        )}
        <input
          type='text'
          placeholder='Registro da CNH'
          className='input input-bordered w-full max-w-80 flex'
          value={cnhRegistro}
          onChange={(e) => {
            const inputValue = e.target.value.replace(/\D/g, ''); // Permite apenas dígitos
            setCnhRegistro(inputValue);
            setCnhRegistroValido(validateCNHRegistro(inputValue));
          }}
          maxLength={10}
          required
        />
        {!cnhRegistroValido && (
          <div className='text-red-500 text-sm'>Registro da CNH inválido.</div>
        )}

        <div className='w-full max-w-80'>
          <MultiSelect value={diasDisponivel} onChange={setDias} />
        </div>

        <div className='flex flex-col gap-2 w-full max-w-80'>
          <label className='mb-2 font-semibold'>
            Horário de Funcionamento *Dias da semana:
          </label>
          <TimeRangePicker
            onChange={(timeRange) => setHorarioSemana(timeRange)}
          />
        </div>

        <div className='flex flex-col gap-2 w-full max-w-80'>
          <label className='mb-2 font-semibold'>
            Horário de Funcionamento *Fim de semana:
          </label>
          <TimeRangePicker
            onChange={(timeRange) => setHorarioFimDeSemana(timeRange)}
          />
        </div>

        <details className='dropdown'>
          <summary className='btn m-1 bg-red-1 text-white'>
            Cadastrar chave PIX:
          </summary>
          <ul className='menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow'>
            <li>
              <a
                href='#'
                onClick={() => handleDropdownSelect(entregador.cpfCnpj)}
              >
                Documento
              </a>
            </li>
            <li>
              <a
                href='#'
                onClick={() => handleDropdownSelect(entregador.celular)}
              >
                Telefone
              </a>
            </li>
            <li>
              <a
                href='#'
                onClick={() => handleDropdownSelect(entregador.email)}
              >
                Email
              </a>
            </li>
          </ul>
        </details>
        <div>
          <div className='mb-4'>
            <span className='font-bold'>
              *Foto Entregador ( jpg, png 300x300 )
            </span>
          </div>

          <CameraRequestButton
            onCapture={(image) => setImagemEntregador(image)}
          />
        </div>

        <div>
          <div className='mb-4'>
            <span className='font-bold'>*Foto CNH ( jpg, png 300x300 )</span>
          </div>
          <CameraRequestButton onCapture={(image) => setImagemCNH(image)} />
        </div>
        <div className=''>
          <button
            onClick={handleClick}
            className='btn bg-green text-white mr-8'
          >
            Cadastrar
          </button>

          <button onClick={voltar} className='btn bg-red-1 text-white'>
            Voltar
          </button>
        </div>
      </div>

      <dialog id='my_modal_1' className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>Cadastro realizado com sucesso!</h3>
          <p className='py-4 font-semibold'>
            Você deseja cadastrar o veículo agora?
          </p>
          <div className='modal-action'>
            <button
              className='btn bg-green text-white'
              onClick={handleCadastrarVeiculo}
            >
              Sim
            </button>
            <button
              className='btn bg-red-1 text-white'
              onClick={handleVoltarLogin}
            >
              Não
            </button>
          </div>
        </div>
      </dialog>

      <footer className='footer footer-center text-base-content p-4 pt-12'>
        <aside>
          <p>©2018 - 2024 Rede Software Comércio e Serviços de Infor. LTDA</p>
        </aside>
      </footer>
    </main>
  );
}

export default Cadastro2;
