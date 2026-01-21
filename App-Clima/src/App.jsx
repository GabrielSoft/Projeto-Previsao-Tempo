import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [clima, setClima] = useState(null);
  const [cidadeBusca, setCidadeBusca] = useState("");
  const [cidadeAtual, setCidadeAtual] = useState("Sao Paulo");
  const [dataHora, setDataHora] = useState("");
  const [erro, setErro] = useState(null);
  
  const API_KEY = "be658f5aaedcc14d60dbb1033dc99a80"; 

  // Atualiza a hora em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date();
      setDataHora(agora.toLocaleString('pt-BR', { 
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const buscarClima = async () => {
    try {
      setErro(null);
      const resAtual = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidadeAtual}&units=metric&lang=pt_br&appid=${API_KEY}`);
      const dadosAtual = await resAtual.json();

      const resPrev = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cidadeAtual}&units=metric&lang=pt_br&appid=${API_KEY}`);
      const dadosPrev = await resPrev.json();

      if (resAtual.ok && resPrev.ok) {
        // Filtra exatamente os 5 dias solicitados 
        const lista5Dias = dadosPrev.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
        setClima({ atual: dadosAtual, forecast: lista5Dias });
      } else {
        setErro("Cidade não encontrada");
      }
    } catch (err) {
      setErro("Erro de conexão");
    }
  };

  useEffect(() => { buscarClima(); }, [cidadeAtual]);

  const handlePesquisa = (e) => {
    e.preventDefault();
    if (cidadeBusca.trim() !== "") setCidadeAtual(cidadeBusca);
  };

  if (!clima && !erro) return <div className="loading">Sincronizando...</div>;

  return (
    <div className="app-container">
      <p className="data-topo">{dataHora}</p>

      <form onSubmit={handlePesquisa} className="busca-container">
        <input 
          type="text" 
          placeholder="Pesquisar cidade..." 
          value={cidadeBusca}
          onChange={(e) => setCidadeBusca(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      {erro && <p className="erro-msg">{erro}</p>}

      {clima && (
        <>
          {/* Card Principal Largo  */}
          <div className="bloco-atual">
            <h1>{clima.atual.name}</h1>
            <div className="temp-info">
              <h2>{Math.round(clima.atual.main.temp)}°C</h2>
              <img src={`http://openweathermap.org/img/wn/${clima.atual.weather[0].icon}@4x.png`} alt="icon" />
            </div>
            <p className="desc">{clima.atual.weather[0].description}</p>
          </div>

          {/* Grid dos 5 Dias Quadrados  */}
          <div className="grid-previsao">
            {clima.forecast.map((dia, i) => (
              <div key={i} className="card-dia">
                <h4>Dia {i + 1}</h4>
                <img src={`http://openweathermap.org/img/wn/${dia.weather[0].icon}.png`} alt="icon" />
                <div className="temps-container">
                  <span className="max">{Math.round(dia.main.temp_max)}°</span> {/* Temp_Maxima [cite: 21-25] */}
                  <span className="min">{Math.round(dia.main.temp_min)}°</span> {/* Temp_Minima [cite: 16-20] */}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;