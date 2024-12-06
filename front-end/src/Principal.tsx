import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Veiculo {
  id: number;
  tipo: string; // Ex: "Carro", "Moto"
  placa: string; // Placa do veículo
  status: string;
}

interface Entregador {
  id: number;
  nome: string;
  imagemEntregador: { type: string; data: number[] } | null;
  veiculos: Veiculo[];
  NUM_DISPONIVEL?: number;
}

interface MapaRotasProps {
  origem: google.maps.LatLngLiteral; // Localização inicial
  destino: google.maps.LatLngLiteral; // Localização final
  mostrarRota: boolean; // Flag para mostrar a rota
}

const MapaRotas: React.FC<MapaRotasProps> = ({
  origem,
  destino,
  mostrarRota,
}) => {
  const mapaRef = useRef<HTMLDivElement | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(
    null
  );
  const advancedMarker =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null); // Ref para o AdvancedMarkerElement
  const [tempoRota, setTempoRota] = useState<string | null>(null); // Estado para armazenar o tempo da rota
  const [distanciaRota, setDistanciaRota] = useState<string | null>(null); // Estado para armazenar a distância da rota

  useEffect(() => {
    const loadMap = () => {
      const { google } = window;
      if (!google) return;

      const mapa = new google.maps.Map(mapaRef.current!, {
        center: origem,
        zoom: 15,
        mapId: 'map-id',
      });

      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(mapa);

      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer();
      directionsRenderer.current.setMap(mapa);

      advancedMarker.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapa,
        position: origem,
        title: 'Localização Atual',
      });

      if (mostrarRota) {
        // Recalcula a rota com a localização inicial
        recalculateRoute(origem, destino);
      }
    };

    loadMap(); // Inicializa o mapa
  }, [origem, destino, mostrarRota]);

  const recalculateRoute = (
    origem: google.maps.LatLngLiteral,
    destino: google.maps.LatLngLiteral
  ) => {
    if (!directionsService.current || !directionsRenderer.current) return;

    directionsService.current.route(
      {
        origin: origem,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(), // Usa o horário atual para considerar o tráfego
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          if (result && result.routes && result.routes.length > 0) {
            // Define a rota no mapa
            directionsRenderer.current?.setDirections(result);

            const leg = result.routes[0].legs[0];
            if (leg) {
              // Exibe o tempo estimado considerando o tráfego
              if (leg.duration_in_traffic) {
                setTempoRota(
                  `Tempo estimado (com tráfego): ${leg.duration_in_traffic.text}`
                );
              } else if (leg.duration) {
                setTempoRota(`Tempo estimado: ${leg.duration.text}`);
              }

              // Exibe a distância da rota
              if (leg.distance) {
                setDistanciaRota(`Distância: ${leg.distance.text}`);
              }
            }
          } else {
            console.error('Nenhuma rota encontrada.');
          }
        } else {
          console.error('Erro ao calcular a rota:', status);
        }
      }
    );
  };

  return (
    <div>
      <div ref={mapaRef} className='w-full min-h-80 h-full mt-6 mb-4' />

      {/* Exibe o tempo estimado e a distância, se disponíveis */}
      {tempoRota && (
        <div className='mt-4 ml-12'>
          <span className='font-semibold'>Tempo estimado para a entrega:</span>
          <p>{tempoRota}</p>
        </div>
      )}

      {distanciaRota && (
        <div className='mt-4 ml-12'>
          <span className='font-semibold'>Distância da rota:</span>
          <p>{distanciaRota}</p>
        </div>
      )}
    </div>
  );
};

function Principal() {
  const [entregador, setEntregador] = useState<Entregador | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<number | null>(
    null
  );

  const [erro, setErro] = useState<string | null>(null);
  const [localizacaoEntregador, setLocalizacaoEntregador] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [mostrarRota, setMostrarRota] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntregador = async () => {
      try {
        const entregadorId = localStorage.getItem('entregadorId');
        if (!entregadorId) {
          setErro('Entregador não logado');
          return;
        }

        const response = await fetch(
          `http://localhost:3002/entregadores/${entregadorId}`
        );
        if (!response.ok)
          throw new Error('Falha ao buscar dados do entregador');

        const data = await response.json();
        if (data?.IMG_ENTREGADOR) {
          data.imagemEntregador = {
            type: 'image/jpeg',
            data: data.IMG_ENTREGADOR,
          };
        }

        setEntregador(data || null);

        const veiculosResponse = await fetch(
          `http://localhost:3002/entregadores/${entregadorId}/veiculos`
        );
        if (!veiculosResponse.ok)
          throw new Error('Falha ao buscar veículos do entregador');

        const veiculosData: Veiculo[] = await veiculosResponse.json();
        setVeiculos(veiculosData);

        // Verificar se o veículo selecionado já está no localStorage
        const veiculoSelecionadoId = localStorage.getItem('veiculoSelecionado');
        if (veiculosData.length > 0) {
          if (veiculoSelecionadoId) {
            const veiculoSelecionadoExistente = veiculosData.find(
              (veiculo) => veiculo.id === Number(veiculoSelecionadoId)
            );
            if (veiculoSelecionadoExistente) {
              setVeiculoSelecionado(Number(veiculoSelecionadoId));
            } else {
              const primeiroVeiculo = veiculosData[0];
              setVeiculoSelecionado(primeiroVeiculo.id);
              localStorage.setItem(
                'veiculoSelecionado',
                String(primeiroVeiculo.id)
              );
            }
          } else {
            const primeiroVeiculo = veiculosData[0];
            setVeiculoSelecionado(primeiroVeiculo.id);
            localStorage.setItem(
              'veiculoSelecionado',
              String(primeiroVeiculo.id)
            );
          }
        }

        setIsLoaded(true);
      } catch (error: unknown) {
        setErro(
          error instanceof Error
            ? `Erro ao carregar entregador: ${error.message}`
            : 'Erro desconhecido'
        );
      }
    };

    fetchEntregador();

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (posicao) => {
          setLocalizacaoEntregador({
            lat: posicao.coords.latitude,
            lng: posicao.coords.longitude,
          });
        },
        (erro) => {
          console.error('Erro ao obter localização:', erro);
        }
      );
    } else {
      console.error('Geolocalização não suportada pelo navegador.');
    }
  }, []);

  const imagemUrl = entregador?.imagemEntregador
    ? `data:${entregador.imagemEntregador.type};base64,${entregador.imagemEntregador.data}`
    : '/fotopadrao.jpg';

  const handleLogout = () => {
    localStorage.removeItem('entregadorId');
    localStorage.removeItem('token');
    localStorage.removeItem('veiculoSelecionado');
    setEntregador(null);
    navigate('/loading');
    setTimeout(() => navigate('/login'), 2000);
  };

  const destinoEntrega: google.maps.LatLngLiteral = {
    /* -7.5667, */ lat: -7.4923174,
    lng: -38.9875798,

    /* -39.6, */
  };

  const handleSelecionarVeiculo = async (veiculoId: number) => {
    const codIdEntregador = localStorage.getItem('entregadorId');
    if (!codIdEntregador) {
      console.error('Entregador não encontrado');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3002/entregadores/${codIdEntregador}/veiculos/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            codIdVeiculo: veiculoId, // Envia apenas o ID do veículo selecionado
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar o status do veículo');
      }

      const data = await response.json();
      console.log('Status atualizado:', data.message);

      // Após o sucesso da atualização do status, atualize o veículo selecionado
      setVeiculoSelecionado(veiculoId);
      localStorage.setItem('veiculoSelecionado', String(veiculoId));

      // Opcional: Recarregar os veículos do entregador para garantir que a seleção está correta
      const veiculosResponse = await fetch(
        `http://localhost:3002/entregadores/${codIdEntregador}/veiculos`
      );
      if (veiculosResponse.ok) {
        const veiculosData: Veiculo[] = await veiculosResponse.json();
        setVeiculos(veiculosData);
      }
    } catch (error) {
      console.error('Erro ao atualizar o status do veículo:', error);
    }
  };

  const handleMudarDisponibilidade = async (novaDisponibilidade: number) => {
    const codIdEntregador = localStorage.getItem('entregadorId');
    if (!codIdEntregador) {
      console.error('Entregador não encontrado');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3002/entregadores/${codIdEntregador}/disponibilidade`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            disponibilidade: novaDisponibilidade, // 1 para disponível, 0 para indisponível
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar a disponibilidade');
      }

      const data = await response.json();
      console.log('Disponibilidade atualizada:', data.message);

      // Atualizar o estado local após a atualização
      setEntregador((prev) => ({
        ...prev!,
        NUM_DISPONIVEL: novaDisponibilidade, // Atualiza o estado local
      }));
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    }
  };

  return (
    <main>
      <header className='flex justify-around shadow w-full'>
        <div>
          <div className='drawer m-4 pl-4'>
            <input id='my-drawer' type='checkbox' className='drawer-toggle' />
            <div className='drawer-content'>
              <label htmlFor='my-drawer' className='cursor-pointer'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  className='w-6 h-6'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              </label>
            </div>
            <div className='drawer-side z-20'>
              <label
                htmlFor='my-drawer'
                aria-label='close sidebar'
                className='drawer-overlay'
              ></label>
              <ul className='menu bg-base-200 text-base-content min-h-full w-80 p-4 ml-2'>
                <li>
                  <button
                    onClick={handleLogout}
                    className='flex justify-center'
                  >
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <label className='swap'>
          <input
            type='checkbox'
            checked={entregador?.NUM_DISPONIVEL === 0} // Se estiver indisponível (checkbox marcado)
            onChange={
              () =>
                handleMudarDisponibilidade(
                  entregador?.NUM_DISPONIVEL === 1 ? 0 : 1
                ) // Inverte a disponibilidade
            }
          />
          <div className='swap-off badge badge-success text-white font-semibold'>
            DISPONÍVEL{' '}
            {/* Este badge será verde quando o entregador estiver disponível */}
          </div>
          <div className='swap-on badge badge-error text-white font-semibold'>
            INDISPONÍVEL{' '}
            {/* Este badge será vermelho quando o entregador estiver indisponível */}
          </div>
        </label>

        <div className='flex items-center'>
          <div className='w-12 h-12 rounded-full'>
            <img
              src={imagemUrl}
              alt={
                entregador?.imagemEntregador
                  ? 'Foto do entregador'
                  : 'Imagem padrão'
              }
              className='w-12 h-12 rounded-full'
            />
          </div>
        </div>
      </header>
      {erro && <p className='text-red-500'>{erro}</p>}

      <div className='ml-8 mt-4 flex justify-start'>
        <span className='font-semibold'>Veículos Cadastrados:</span>
      </div>
      <div className='ml-8 mt-4 flex justify-start flex-col sm:flex-row'>
        {isLoaded ? (
          veiculos.length > 0 ? (
            <details className=' relative'>
              <summary className='btn m-1 bg-red-1 text-white'>
                Selecione um Veículo
              </summary>
              <ul
                tabIndex={0}
                className='dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow mt-2'
              >
                {veiculos.map((veiculo) => (
                  <li key={veiculo.id}>
                    <a
                      onClick={() => handleSelecionarVeiculo(veiculo.id)}
                      className={
                        veiculoSelecionado === veiculo.id
                          ? 'bg-blue-500 text-white'
                          : ''
                      }
                    >
                      {veiculo.tipo}:{' '}
                      <span className='font-semibold'>{veiculo.placa}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <p className='text-gray-500'>Nenhum veículo encontrado.</p>
          )
        ) : (
          <p>Carregando dados...</p>
        )}
      </div>

      {localizacaoEntregador && destinoEntrega && (
        <MapaRotas
          origem={localizacaoEntregador}
          destino={destinoEntrega}
          mostrarRota={mostrarRota}
        />
      )}

      <div className='z-0'>
        <div className='carousel carousel-center grid grid-rows-2 grid-flow-col gap-x-8 gap-y-0 justify-start ml-4'>
          <div className='card max-w-60 w-full max-h-80 h-full shadow-lg bg-gray-100 m-8 carousel-item'>
            <figure>
              <img
                src='/public/logodeck.png'
                alt='Shoes'
                className='rounded-3xl h-20 w-20 mt-2 mb-1'
              />
            </figure>

            <div className='card-body'>
              <h2 className='card-title'>Deck Cariri</h2>
              <p className='text-left'>
                Praça Dionisio Rocha de Lucena - R. Neco Jacinto
              </p>
              <p>Distância: 650,0 m</p>
              <div className='card-actions justify-end'>
                <button
                  className='btn btn-success text-white'
                  onClick={() => setMostrarRota(!mostrarRota)}
                >
                  Verificar
                </button>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Principal;
