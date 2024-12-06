import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntregador } from './EntregadorContext';
import DateOfBirthInput from '../components/DatadeNascimento';
import PhoneInput from '../components/PhoneInput';
import DocumentInput from '../components/DocumentInput';

const validateCPF = (cpf: string): boolean => {
  const cleanedCpf = cpf.replace(/\D/g, '');
  if (cleanedCpf.length !== 11) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanedCpf.charAt(i - 1)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanedCpf.charAt(9))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanedCpf.charAt(i - 1)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  return remainder === parseInt(cleanedCpf.charAt(10));
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleanedCNPJ = cnpj.replace(/\D/g, '');
  if (cleanedCNPJ.length !== 14) return false;

  const digits = cleanedCNPJ.split('').slice(-2);
  const base = cleanedCNPJ.slice(0, 12);

  let sum = 0;
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i]) * firstWeights[i];
  }
  let firstDigit = 11 - (sum % 11);
  firstDigit = firstDigit >= 10 ? 0 : firstDigit;

  sum = 0;
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanedCNPJ[i]) * secondWeights[i];
  }
  let secondDigit = 11 - (sum % 11);
  secondDigit = secondDigit >= 10 ? 0 : secondDigit;

  return `${firstDigit}${secondDigit}` === digits.join('');
};

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const { setEntregador } = useEntregador();

  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cpfCnpj, setCpfCnpj] = useState<string>('');
  const [dataNascimento, setDataNascimento] = useState<string>('');
  const [celular, setCelular] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [senhaValida, setSenhaValida] = useState<boolean>(true);
  const [cpfCnpjValido, setCpfCnpjValido] = useState<boolean>(true);
  const [celularValido, setCelularValido] = useState<boolean>(true);
  const [emailValido, setEmailValido] = useState<boolean>(true);
  const [emailError, setEmailError] = useState('');
  const [celularError, setCelularError] = useState('');
  const [cpfCnpjError, setCpfCnpjError] = useState('');

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length === 11; // Supondo que o formato seja DDD + 9 dígitos
  };

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*.;,])(?=.*\d)(?=.{8,})/;
    return passwordPattern.test(password);
  };

  useEffect(() => {
    const storedNome = sessionStorage.getItem('nome');
    const storedEmail = sessionStorage.getItem('email');
    const storedCpfCnpj = sessionStorage.getItem('cpfCnpj');
    const storedDataNascimento = sessionStorage.getItem('dataNascimento');
    const storedCelular = sessionStorage.getItem('celular');
    /* const storedSenha = sessionStorage.getItem("senha"); */

    if (storedNome) setNome(storedNome);
    if (storedEmail) setEmail(storedEmail);
    if (storedCpfCnpj) {
      // Formatar CPF/CNPJ ao recuperar
      /* const documentFormatted = formatDocument(storedCpfCnpj); */
      setCpfCnpj(storedCpfCnpj);
    }
    if (storedDataNascimento) {
      // Formatar a data de nascimento para DD/MM/YYYY
      const [year, month, day] = storedDataNascimento.split('-');
      setDataNascimento(`${day}/${month}/${year}`);
    }
    if (storedCelular) setCelular(storedCelular);
    /*  if (storedSenha) setSenha(storedSenha); */
  }, []);

  const verificarDadosExistentes = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3002/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, celular, cpfCnpj }),
      });

      if (!response.ok) {
        const result = await response.json();
        console.log('Mensagem de erro do servidor:', result.error); // Log da mensagem de erro

        // Verifica se o erro se refere a algum dos campos e define as mensagens de erro
        if (result.error.toLowerCase().includes('e-mail')) {
          setEmailError('E-mail já está cadastrado.');
        }
        if (
          result.error.toLowerCase().includes('celular') ||
          result.error.toLowerCase().includes('telefone')
        ) {
          setCelularError('Telefone já está cadastrado.');
        }
        if (result.error.toLowerCase().includes('cpf/cnpj')) {
          setCpfCnpjError('CPF/CNPJ já está cadastrado.');
        }

        return false; // Dados já existem
      }

      // Limpa as mensagens de erro se tudo estiver ok
      setEmailError('');
      setCelularError('');
      setCpfCnpjError('');

      return true; // Dados disponíveis
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert('Erro ao verificar dados: ' + error.message);
      } else {
        alert('Erro desconhecido ao verificar dados.');
      }
      return false; // Retorna false se houver erro
    }
  };

  const handleClick = async () => {
    setEmailError('');
    setCelularError('');
    setCpfCnpjError('');

    if (!nome || !email || !cpfCnpj || !dataNascimento || !celular || !senha) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const isEmailValido = validateEmail(email);
    setEmailValido(isEmailValido);

    if (!isEmailValido) {
      alert('Email inválido.');
      return;
    }

    if (!validatePassword(senha)) {
      alert(
        'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial.'
      );
      return;
    }

    if (!validateCPF(cpfCnpj) && !validateCNPJ(cpfCnpj)) {
      alert('CPF ou CNPJ inválido!');
      return;
    }

    if (!validatePhoneNumber(celular)) {
      alert('Número de celular inválido!');
      return;
    }

    const dadosExistem = await verificarDadosExistentes();
    if (!dadosExistem) {
      return; // Se já existirem dados, não prossegue
    }

    sessionStorage.setItem('cpfCnpj', cpfCnpj.replace(/\D/g, ''));

    const [day, month, year] = dataNascimento.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    setEntregador((prev) => ({
      ...prev,
      nome,
      email,
      senha,
      dataNascimento: formattedDate,
      celular,
      cpfCnpj,
    }));

    sessionStorage.setItem('nome', nome);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('cpfCnpj', cpfCnpj.replace(/\D/g, ''));
    sessionStorage.setItem('dataNascimento', formattedDate);
    sessionStorage.setItem('celular', celular);
    /*  sessionStorage.setItem("senha", senha);
     */
    navigate('/loading');

    setTimeout(() => {
      navigate('/cadastro2');
    }, 2000);
  };

  const handle = () => {
    navigate('/login');
  };

  return (
    <main>
      <div className='h-24 w-full bg-red-1'>
        <label className='flex justify-start'>
          <img
            onClick={handle}
            className='mt-6 ml-4 cursor-pointer'
            src='./public/LOGORS.png'
            alt=''
          />
        </label>
      </div>
      <div className='flex justify-center m-2'>
        <ul className='steps'>
          <li className='step step-success'>Cadastro</li>
          <li className='step'>Cadastro-2</li>
          <li className='step'>Cadastro de Veículo</li>
        </ul>
      </div>

      <div className='m-6'>
        <span className='font-bold'>Preencha os campos abaixo:</span>
      </div>

      <div className='flex flex-col gap-8 mt-8 ml-8 items-start'>
        <input
          type='text'
          placeholder='Nome'
          className='input input-bordered w-full max-w-80 flex'
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <DateOfBirthInput
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          required
        />
        <DocumentInput
          value={cpfCnpj}
          onChange={(e) => {
            setCpfCnpj(e.target.value);
            setCpfCnpjValido(
              e.target.value.length === 11
                ? validateCPF(e.target.value)
                : validateCNPJ(e.target.value)
            );
            setCpfCnpjError('');
          }}
          required
        />
        {!cpfCnpjValido && (
          <div className='text-red-500 text-sm'>CPF ou CNPJ inválido.</div>
        )}
        {cpfCnpjError && (
          <div className='text-red-500 text-sm'>{cpfCnpjError}</div>
        )}
        <PhoneInput
          value={celular}
          onChange={(e) => {
            setCelular(e.target.value);
            setCelularValido(validatePhoneNumber(e.target.value));
            setCelularError('');
          }}
          required
        />
        {celular && !celularValido && (
          <div className='text-red-500 text-sm'>
            Número de celular inválido.
          </div>
        )}
        {celularError && (
          <div className='text-red-500 text-sm'>{celularError}</div>
        )}

        <input
          type='text'
          placeholder='Email'
          className='input input-bordered w-full max-w-80 flex'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailValido(validateEmail(e.target.value));
            setEmailError(''); // Verifica a validade do email
          }}
          required
        />
        {/* Mensagem de erro */}
        {!emailValido && (
          <div className='text-red-500 text-sm'>
            Endereço de e-mail inválido!
          </div>
        )}
        {emailError && <div className='text-red-500 text-sm'>{emailError}</div>}
        <input
          type='password'
          placeholder='Senha'
          className='input input-bordered w-full max-w-80 flex'
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            setSenhaValida(validatePassword(e.target.value));
          }}
          required
        />
        {/* Mensagens de erro */}
        {!senhaValida && (
          <div className='text-red-500 text-sm'>
            A senha deve ter pelo menos 8 caracteres, incluindo uma letra
            maiúscula, um número e um caractere especial.
          </div>
        )}
      </div>

      <div className='flex justify-start mt-12 pl-36'>
        <button onClick={handleClick} className='btn bg-green text-white mr-10'>
          Cadastrar
        </button>

        <button onClick={handle} className='btn bg-red-1 text-white'>
          Voltar
        </button>
      </div>

      <footer className='footer footer-center text-base-content p-4 pt-12'>
        <aside>
          <p>©2018 - 2024 Rede Software Comércio e Serviços de Infor. LTDA</p>
        </aside>
      </footer>
    </main>
  );
};

export default Cadastro;
