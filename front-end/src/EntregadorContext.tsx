import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

/* interface Localizacao {
  latitude: number;
  longitude: number;
}
 */
interface Entregador {
  id?: number; // Propriedade id opcional
  nome: string;
  email: string;
  cpfCnpj: string;
  dataNascimento: string;
  celular: string;
  senha: string;
  cnhNumero: string;
  cnhRegistro: string;
  chavePix: string;
  diasDisponivel: string;
  horaFuncionamento: string;
  imagemCNH?: string | null; // Nova propriedade para imagem da CNH
  imagemEntregador?: string | null;
  /* localizacao?: Localizacao | null;  */ // Nova propriedade para localização
}

// Define a interface para o contexto do entregador
interface EntregadorContextType {
  entregador: Entregador; // Objeto do entregador
  setEntregador: React.Dispatch<React.SetStateAction<Entregador>>; // Função para atualizar o entregador
  saveEntregador: () => Promise<{ id: number; message: string }>; // Função para salvar o entregador
}

// Cria o contexto
const EntregadorContext = createContext<EntregadorContextType | undefined>(
  undefined
);

// Hook para usar o contexto
export const useEntregador = () => {
  const context = useContext(EntregadorContext);
  if (!context) {
    throw new Error('useEntregador must be used within a EntregadorProvider');
  }
  return context;
};

// Provider do contexto
export const EntregadorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entregador, setEntregador] = useState<Entregador>({
    nome: '',
    email: '',
    cpfCnpj: '',
    dataNascimento: '',
    celular: '',
    senha: '',
    cnhNumero: '',
    cnhRegistro: '',
    chavePix: '',
    diasDisponivel: '',
    horaFuncionamento: '',
    imagemCNH: null,
    imagemEntregador: null,
    /* localizacao: null, */ // Inicializa a localização como null
  });

  // Função para obter a localização do dispositivo
  const obterLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          const { latitude, longitude } = posicao.coords;
          setEntregador((prev) => ({
            ...prev,
            localizacao: { latitude, longitude },
          }));
        },
        (erro) => {
          console.error('Erro ao obter localização:', erro);
        }
      );
    } else {
      console.error('Geolocalização não é suportada pelo seu navegador.');
    }
  };

  // Chama a função para obter a localização ao montar o componente
  useEffect(() => {
    obterLocalizacao();
  }, []);

  // Função para salvar os dados do entregador no backend
  const saveEntregador = async () => {
    try {
      console.log('Dados do entregador:', entregador);
      // Salva o entregador
      const response = await axios.post(
        'http://localhost:3002/entregadores',
        entregador
      );
      console.log(
        'Cadastro do entregador realizado com sucesso:',
        response.data
      );

      const entregadorId = response.data.id; // ID do entregador

      // Atualiza o estado do entregador com o ID
      setEntregador((prev) => ({ ...prev, id: entregadorId }));

      return { id: entregadorId, message: 'Cadastro realizado com sucesso.' }; // Retorna o ID e mensagem
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      throw error; // Re-lança o erro
    }
  };

  return (
    <EntregadorContext.Provider
      value={{ entregador, setEntregador, saveEntregador }}
    >
      {children}
    </EntregadorContext.Provider>
  );
};
