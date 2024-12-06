import express, { Request, Response } from 'express';
import mysql, { Pool, QueryError, RowDataPacket } from 'mysql2';
import cors from 'cors';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Pool de conexões com o BD
const pool: Pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'meu_delivery',
  port: 3306,
});

// Testar a conexão
pool.getConnection((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com o banco de dados estabelecida com sucesso.');
});

// Interface de dados retornados
interface Entregador {
  id: number;
  nome: string;
  email?: string;
  senha?: string;
  dataCadastro?: Date;
  dataNascimento: Date;
  celular: string;
  cpfCnpj: string;
  cnhNumero?: string;
  cnhRegistro?: string;
  chavePix?: string;
  diasDisponivel?: string;
  horaFuncionamento?: string;
  imagemCNH?: string;
  imagemEntregador?: string;
}

// Rota principal para obter entregadores
app.get('/', async (req: Request, res: Response) => {
  try {
    const entregadores = await new Promise<Entregador[]>((resolve, reject) => {
      pool.query(
        'SELECT * FROM entregadores',
        (err: QueryError | null, results: RowDataPacket[]) => {
          if (err) {
            console.error('Erro ao executar a consulta:', err);
            reject(err);
            return;
          }

          const entregadores: Entregador[] = results.map((row) => ({
            id: row['COD_ID_ENTREGADOR'],
            nome: row['DSC_NOME'],
            email: row['DSC_EMAIL'],
            senha: row['DSC_SENHA'],
            dataCadastro: row['DAT_CADASTRO']
              ? dayjs(row['DAT_CADASTRO']).toDate()
              : undefined,
            dataNascimento: dayjs(row['DAT_NASCIMENTO']).toDate(),
            celular: row['DSC_CELULAR'],
            cpfCnpj: row['DSC_CPF_CNPJ'],
            cnhNumero: row['DSC_CNH_NUMERO'],
            cnhRegistro: row['DSC_CNH_REGISTRO'],
            chavePix: row['COD_CHAVE_PIX'],
            diasDisponivel: row['DAT_DIAS_DISPONIVEL'],
            horaFuncionamento: row['DAT_HORA_FUNCIONAMENTO'],
            imagemCNH: row['IMG_CNH'],
            imagemEntregador: row['IMG_ENTREGADOR'],
          }));

          resolve(entregadores);
        }
      );
    });

    return res.json(entregadores);
  } catch (err: unknown) {
    console.error('Erro ao processar a solicitação:', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

// Rota para cadastrar entregadores
app.post('/entregadores', async (req: Request, res: Response) => {
  const {
    nome,
    email,
    senha,
    dataNascimento,
    celular,
    cpfCnpj,
    cnhNumero,
    cnhRegistro,
    chavePix,
    diasDisponivel,
    horaFuncionamento,
    imagemCNH,
    imagemEntregador,
  } = req.body;

  // Verifica se todos os campos obrigatórios estão preenchidos
  if (
    !nome ||
    !email ||
    !senha ||
    !dataNascimento ||
    !celular ||
    !cpfCnpj ||
    !cnhNumero ||
    !cnhRegistro ||
    !chavePix ||
    !diasDisponivel ||
    !horaFuncionamento ||
    !imagemCNH ||
    !imagemEntregador
  ) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const status = 1;
  const NumDisponivel = 1;
  const dataCadastro = new Date();
  const formattedDataNascimento = dayjs(dataNascimento).toDate();
  const NUM_TIPO = cpfCnpj.length === 11 ? 0 : 1;

  const hashedPassword = await bcrypt.hash(senha, 10);

  const imagemCNHBase64 = Buffer.from(imagemCNH, 'base64'); // Se a imagem já estiver em Base64
  const imagemEntregadorBase64 = Buffer.from(imagemEntregador, 'base64'); // Se a imagem já estiver em Base64

  const query = `
  INSERT INTO entregadores (
    DSC_NOME, DSC_EMAIL, DSC_SENHA, DAT_NASCIMENTO, DSC_CELULAR, DSC_CPF_CNPJ,
    DSC_CNH_NUMERO, DSC_CNH_REGISTRO, COD_CHAVE_PIX, DAT_DIAS_DISPONIVEL, DAT_HORA_FUNCIONAMENTO, IMG_CNH, IMG_ENTREGADOR, NUM_STATUS, DAT_CADASTRO, NUM_DISPONIVEL, NUM_TIPO
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nome,
    email,
    hashedPassword,
    formattedDataNascimento,
    celular,
    cpfCnpj,
    cnhNumero,
    cnhRegistro,
    chavePix,
    diasDisponivel,
    horaFuncionamento,
    imagemCNHBase64,
    imagemEntregadorBase64,
    status,
    dataCadastro,
    NumDisponivel,
    NUM_TIPO,
  ];

  pool.query(
    query,
    values,
    (err: QueryError | null, results: mysql.ResultSetHeader) => {
      if (err) {
        console.error('Erro ao cadastrar entregador:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar entregador.' });
      }

      const entregadorId = results.insertId; // Obtendo o ID do entregador criado

      return res.status(201).json({
        id: entregadorId,
        message: 'Entregador criado com sucesso',
      });
    }
  );
});
// Rota para verificar se e-mail, celular ou CPF/CNPJ já existem
app.post('/verificar', async (req: Request, res: Response) => {
  const { email, celular, cpfCnpj } = req.body;

  // Verifica se pelo menos um dos parâmetros foi fornecido
  if (!email && !celular && !cpfCnpj) {
    return res.status(400).json({
      error:
        'Pelo menos um dos campos (email, celular, cpfCNPJ) deve ser fornecido.',
    });
  }

  try {
    // Variável para armazenar mensagens de erro
    let errorMessages: string[] = [];

    if (cpfCnpj) {
      const cpfCnpjQuery = 'SELECT * FROM entregadores WHERE DSC_CPF_CNPJ = ?';
      const cpfCnpjResults = await new Promise<any[]>((resolve, reject) => {
        pool.query(
          cpfCnpjQuery,
          [cpfCnpj],
          (err: QueryError | null, results: RowDataPacket[]) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });
      if (cpfCnpjResults.length > 0) {
        errorMessages.push('CPF/CNPJ já cadastrado.');
      }
    }

    // Verifica o celular
    if (celular) {
      const celularQuery = 'SELECT * FROM entregadores WHERE DSC_CELULAR = ?';
      const celularResults = await new Promise<any[]>((resolve, reject) => {
        pool.query(
          celularQuery,
          [celular],
          (err: QueryError | null, results: RowDataPacket[]) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });
      if (celularResults.length > 0) {
        errorMessages.push('Celular já cadastrado.');
      }
    }

    if (email) {
      const emailQuery = 'SELECT * FROM entregadores WHERE DSC_EMAIL = ?';
      const emailResults = await new Promise<any[]>((resolve, reject) => {
        pool.query(
          emailQuery,
          [email],
          (err: QueryError | null, results: RowDataPacket[]) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });
      if (emailResults.length > 0) {
        errorMessages.push('E-mail já cadastrado.');
      }
    }

    // Se houver mensagens de erro, retorna a primeira
    if (errorMessages.length > 0) {
      return res.status(400).json({ error: errorMessages[0] });
    }

    // Se não houver erros, retorna mensagem de dados disponíveis
    return res.status(200).json({ message: 'Dados disponíveis.' });
  } catch (err) {
    console.error('Erro ao processar a solicitação:', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

// Rota para obter veículos
app.get('/veiculos', async (req: Request, res: Response) => {
  const placa = req.query.placa as string; // Pega o parâmetro placa se existir
  let query = `
    SELECT ev.COD_ID_VEICULO, ev.DSC_PLACA, ev.NUM_TIPO, e.DSC_NOME 
    FROM entregador_veiculo ev
    JOIN entregadores e ON ev.COD_ID_ENTREGADOR = e.COD_ID_ENTREGADOR
  `;

  // Define o tipo de queryParams como string[]
  const queryParams: string[] = [];
  if (placa) {
    query += ` WHERE UPPER(ev.DSC_PLACA) = UPPER(?)`; // Adiciona a verificação case insensitive
    queryParams.push(placa);
  }

  try {
    const veiculos = await new Promise<any[]>((resolve, reject) => {
      pool.query(
        query,
        queryParams,
        (err: QueryError | null, results: RowDataPacket[]) => {
          if (err) {
            console.error('Erro ao executar a consulta:', err);
            reject(err);
            return;
          }

          const veiculosList = results.map((row) => ({
            idVeiculo: row['COD_ID_VEICULO'],
            placa: row['DSC_PLACA'],
            tipo: row['NUM_TIPO'],
          }));

          resolve(veiculosList);
        }
      );
    });

    return res.json(veiculos);
  } catch (err: unknown) {
    console.error('Erro ao processar a solicitação:', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

// Rota para cadastrar veículo
// Rota para cadastrar veículo
app.post('/entregador_veiculo', async (req: Request, res: Response) => {
  const { codIdEntregador, placa, tipo } = req.body;

  if (!codIdEntregador || !placa || tipo === undefined) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Verifica se a placa já está cadastrada para o mesmo entregador
  const existingVehicles = await new Promise<any[]>((resolve, reject) => {
    pool.query(
      `SELECT * FROM entregador_veiculo WHERE COD_ID_ENTREGADOR = ? AND UPPER(DSC_PLACA) = UPPER(?)`,
      [codIdEntregador, placa],
      (err: QueryError | null, results: RowDataPacket[]) => {
        if (err) {
          console.error('Erro ao verificar placa:', err);
          reject(err);
          return;
        }
        resolve(results);
      }
    );
  });

  if (existingVehicles.length > 0) {
    return res
      .status(400)
      .json({ error: 'Placa já cadastrada para este entregador.' });
  }

  // Atualiza todos os veículos do entregador para inativo
  await new Promise<void>((resolve, reject) => {
    pool.query(
      `UPDATE entregador_veiculo SET NUM_STATUS = 0 WHERE COD_ID_ENTREGADOR = ?`,
      [codIdEntregador],
      (err: QueryError | null) => {
        if (err) {
          console.error('Erro ao atualizar veículos:', err);
          reject(err);
          return;
        }
        resolve();
      }
    );
  });

  const query = `
    INSERT INTO entregador_veiculo (COD_ID_ENTREGADOR, DSC_PLACA, NUM_TIPO, NUM_STATUS)
    VALUES (?, ?, ?, ?)
  `;

  const status = 1; // 1 = ATIVO
  const values = [codIdEntregador, placa, tipo, status];

  pool.query(
    query,
    values,
    async (err: QueryError | null, results: mysql.ResultSetHeader) => {
      if (err) {
        console.error('Erro ao cadastrar veículo:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar veículo.' });
      }

      // Atualiza o tipo de veículo do entregador
      await new Promise<void>((resolve, reject) => {
        pool.query(
          `UPDATE entregadores SET TIPO_DE_VEICULO = ? WHERE COD_ID_ENTREGADOR = ?`,
          [tipo, codIdEntregador],
          (err: QueryError | null) => {
            if (err) {
              console.error(
                'Erro ao atualizar tipo de veículo do entregador:',
                err
              );
              reject(err);
              return;
            }
            resolve();
          }
        );
      });

      return res.status(201).json({
        id: results.insertId,
        message: 'Veículo cadastrado com sucesso',
      });
    }
  );
});

// Rota para login
// Rota para login
app.post('/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ error: 'Os campos email e senha são obrigatórios.' });
  }

  try {
    const user = await new Promise<RowDataPacket[]>((resolve, reject) => {
      pool.query(
        'SELECT * FROM entregadores WHERE DSC_EMAIL = ?',
        [email],
        (err: QueryError | null, results: RowDataPacket[]) => {
          if (err) {
            console.error('Erro ao buscar usuário:', err);
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const foundUser = user[0];

    const isPasswordCorrect = await bcrypt.compare(
      senha,
      foundUser['DSC_SENHA']
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // Gerar o token JWT
    const token = jwt.sign(
      { id: foundUser['COD_ID_ENTREGADOR'], nome: foundUser['DSC_NOME'] },
      'secrect-key', // chave secreta, armazene em uma variável de ambiente
      { expiresIn: '1h' } // Defina o tempo de expiração do token
    );

    // Resposta com token e dados do entregador
    return res.status(200).json({
      token,
      entregador: {
        id: foundUser['COD_ID_ENTREGADOR'],
        nome: foundUser['DSC_NOME'],
        email: foundUser['DSC_EMAIL'],
      },
    });
  } catch (err) {
    console.error('Erro ao processar o login:', err);
    return res.status(500).json({ error: 'Erro ao processar o login.' });
  }
});

app.get('/entregadores/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await new Promise<RowDataPacket[]>((resolve, reject) => {
      pool.query(
        'SELECT COD_ID_ENTREGADOR, DSC_NOME, DSC_EMAIL, IMG_ENTREGADOR FROM entregadores WHERE COD_ID_ENTREGADOR = ?',
        [id],
        (err: QueryError | null, results: RowDataPacket[]) => {
          if (err) {
            console.error('Erro ao buscar entregador:', err);
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (user.length === 0) {
      return res.status(404).json({ error: 'Entregador não encontrado.' });
    }

    const entregador = user[0];

    // Verifique se a imagem foi retornada e converta para base64, se necessário
    if (entregador.IMG_ENTREGADOR) {
      // Assumindo que a imagem esteja armazenada como um BLOB ou binário
      entregador.IMG_ENTREGADOR = entregador.IMG_ENTREGADOR.toString('base64');
    }

    return res.status(200).json(entregador); // Retorna o entregador com a imagem convertida
  } catch (err) {
    console.error('Erro ao processar a consulta:', err);
    return res.status(500).json({ error: 'Erro ao processar a requisição.' });
  }
});

app.get('/entregadores/:id/veiculos', async (req: Request, res: Response) => {
  const { id } = req.params; // ID do entregador

  try {
    const query = `
      SELECT ev.COD_ID_VEICULO, ev.DSC_PLACA, ev.NUM_TIPO, e.DSC_NOME
      FROM entregador_veiculo ev
      JOIN entregadores e ON ev.COD_ID_ENTREGADOR = e.COD_ID_ENTREGADOR
      WHERE ev.COD_ID_ENTREGADOR = ?
    `;

    // Buscando os veículos cadastrados para o entregador
    const veiculos = await new Promise<any[]>((resolve, reject) => {
      pool.query(
        query,
        [id], // Passando o ID do entregador como parâmetro
        (err: QueryError | null, results: RowDataPacket[]) => {
          if (err) {
            console.error('Erro ao executar a consulta:', err);
            reject(err);
            return;
          }

          const veiculosList = results.map((row) => ({
            id: row['COD_ID_VEICULO'],
            placa: row['DSC_PLACA'],
            tipo:
              row['NUM_TIPO'] === 1
                ? 'Carro'
                : row['NUM_TIPO'] === 0
                ? 'Moto'
                : 'Outro', // Converte para tipo legível
          }));

          resolve(veiculosList);
        }
      );
    });

    if (veiculos.length === 0) {
      return res
        .status(404)
        .json({ message: 'Nenhum veículo encontrado para este entregador.' });
    }

    return res.json(veiculos);
  } catch (err: unknown) {
    console.error('Erro ao processar a solicitação:', err);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

app.patch(
  '/entregadores/:id/veiculos/status',
  async (req: Request, res: Response) => {
    const entregadorId = req.params.id;
    const { codIdVeiculo } = req.body;

    // Verifica se o ID do veículo foi passado
    if (!codIdVeiculo) {
      return res.status(400).json({ error: 'ID do veículo é obrigatório.' });
    }

    try {
      // 1. Atualiza todos os veículos do entregador para inativo (0)
      await pool
        .promise()
        .query(
          'UPDATE entregador_veiculo SET NUM_STATUS = 0 WHERE COD_ID_ENTREGADOR = ?',
          [entregadorId]
        );

      // 2. Atualiza o veículo selecionado para ativo (1)
      await pool
        .promise()
        .query(
          'UPDATE entregador_veiculo SET NUM_STATUS = 1 WHERE COD_ID_VEICULO = ? AND COD_ID_ENTREGADOR = ?',
          [codIdVeiculo, entregadorId]
        );

      return res.status(200).json({ message: 'Status do veículo atualizado.' });
    } catch (err) {
      console.error('Erro ao atualizar status dos veículos:', err);
      return res
        .status(500)
        .json({ error: 'Erro ao atualizar status dos veículos.' });
    }
  }
);

app.patch(
  '/entregadores/:id/disponibilidade',
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { disponibilidade } = req.body;

    if (![0, 1].includes(disponibilidade)) {
      return res.status(400).json({ error: 'Disponibilidade inválida.' });
    }

    try {
      // Atualiza a disponibilidade do entregador
      await new Promise<void>((resolve, reject) => {
        pool.query(
          `UPDATE entregadores SET NUM_DISPONIVEL = ? WHERE COD_ID_ENTREGADOR = ?`,
          [disponibilidade, id],
          (err: QueryError | null) => {
            if (err) {
              console.error('Erro ao atualizar disponibilidade:', err);
              reject(err);
              return;
            }
            resolve();
          }
        );
      });

      return res
        .status(200)
        .json({ message: 'Disponibilidade atualizada com sucesso.' });
    } catch (err) {
      console.error('Erro ao atualizar disponibilidade:', err);
      return res
        .status(500)
        .json({ error: 'Erro ao atualizar disponibilidade.' });
    }
  }
);

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
