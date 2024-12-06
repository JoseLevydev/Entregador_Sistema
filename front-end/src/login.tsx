import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false); // Estado para o alerta
  const [passwordValid, setPasswordValid] = useState<boolean>(true); // Estado para a validade da senha
  const [loginError, setLoginError] = useState<string>(''); // Mensagem de erro do login

  // Função para validar o formato do email
  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleCadastro = () => {
    navigate('/loading');

    setTimeout(() => {
      navigate('/cadastro');
    }, 2000);
  };

  const handleLogin = async () => {
    setLoginError(''); // Resetar mensagens de erro anteriores
    setPasswordValid(true);

    if (!validateEmail(email)) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return;
    }

    if (password.length < 8) {
      setPasswordValid(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3002/login', {
        email,
        senha: password,
      });

      const { token, entregador } = response.data;

      // Salvar o token e as informações do usuário (incluindo ID)
      localStorage.setItem('token', token);
      localStorage.setItem('entregador', JSON.stringify(entregador));
      localStorage.setItem('entregadorId', entregador.id.toString()); // Salvar o ID do entregador

      navigate('/loading');

      setTimeout(() => {
        navigate('/Principal');
      }, 2000);
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Erro de resposta:', error.response.data);
          if (error.response.status === 401) {
            setLoginError('Email ou senha inválidos. Tente novamente.');
          } else {
            setLoginError('Ocorreu um erro. Tente novamente mais tarde.');
          }
        } else if (error.request) {
          setLoginError(
            'Não foi possível se conectar ao servidor. Tente novamente.'
          );
        } else {
          setLoginError('Erro desconhecido. Tente novamente mais tarde.');
        }
      } else {
        setLoginError('Erro desconhecido. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <>
      <main>
        <div className='h-24 w-full bg-red-1'>
          <label className='flex justify-start'>
            <img className='mt-6 ml-4' src='./public/LOGORS.png' alt='' />
          </label>
        </div>

        <div className=''>
          <span className='font-bold flex justify-center text-xl mt-24'>
            Já possui uma conta?
          </span>
          <div className='flex flex-col gap-8 mt-12 items-center'>
            <input
              type='text'
              placeholder='Email'
              className='input input-bordered w-full max-w-96'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {showAlert && (
              <div className='text-red-1 '>
                <span>*Endereço de email inválido</span>
              </div>
            )}
            <div className='w-full max-w-96'>
              <PasswordInput onPasswordChange={(pwd) => setPassword(pwd)} />
            </div>
            {!passwordValid && (
              <div className='text-red-1'>
                <span>A senha deve ter pelo menos 8 caracteres.</span>
              </div>
            )}
            {loginError && (
              <div className='text-red-500 mt-4'>
                <span>{loginError}</span>
              </div>
            )}
          </div>
          <div className='flex justify-center mt-12'>
            <span>Não tem uma conta?</span>
            <a
              className='underline text-slate-600 ml-2 mr-2'
              style={{ cursor: 'pointer' }}
              href=''
            >
              Esqueceu a senha?
            </a>
            <a
              onClick={handleCadastro}
              className='underline text-slate-600'
              style={{ cursor: 'pointer' }}
            >
              Cadastre-se
            </a>
          </div>
          <div className='flex justify-center mt-12 pl-72'>
            <button onClick={handleLogin} className='btn bg-red-1 text-white'>
              Continuar
            </button>
          </div>
        </div>

        <footer className='footer footer-center text-base-content p-4 pt-32'>
          <aside>
            <p>©2018 - 2024 Rede Software Comércio e Serviços de Infor. LTDA</p>
          </aside>
        </footer>
      </main>
    </>
  );
}

export default Login;
