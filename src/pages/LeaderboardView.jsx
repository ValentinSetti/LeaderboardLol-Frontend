import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function LeaderboardView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copying, setCopying] = useState(false);

  // Traemos la URL de la variable de entorno
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = () => {
    setLoading(true);
    // Cambiamos el localhost por la variable
    fetch(`${API_URL}/api/leaderboard/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        
        setLastUpdated(`${horas}:${minutos}`);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  if (loading && !data) return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center font-bold gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      SINCRONIZANDO CON RIOT...
    </div>
  );

  if (!data || data.error) return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
      Lista no encontrada
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] via-[#0d0d12] to-[#111116] text-gray-200 p-4 md:p-10 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-5">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic border-l-8 border-blue-600 pl-6 drop-shadow-sm">
                {data.titulo}
              </h1>
              <button 
                onClick={copyLink}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${copying ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-gray-500 hover:bg-white/5 hover:text-white hover:border-white/20'}`}
              >
                {copying ? (
                  <span className="text-[10px] font-black uppercase px-1">¡Copiado!</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 pl-8">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  Actualizado: <span className="text-gray-300">{lastUpdated} HS</span>
                </p>
              </div>
            )}
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="group flex items-center gap-3 bg-[#1a1a20] hover:bg-blue-600 border border-white/5 hover:border-blue-400 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Sincronizando...' : 'Refrescar Ranking'}
          </button>
        </div>
        
        {/* Cuerpo de la Tabla */}
        <div className="bg-[#111114]/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-[50px_2fr_1.5fr_100px] gap-4 px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] bg-white/[0.02] border-b border-white/5">
            <span>#</span>
            <span>Invocador</span>
            <span>Rango Actual</span>
            <span className="text-right">Rendimiento</span>
          </div>

          <div className="p-2 space-y-1">
            {data.jugadores.map((player, index) => {
              const isApexTier = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(player.tier.toUpperCase());
              const opggUrl = `https://www.op.gg/summoners/las/${encodeURIComponent(player.gameName)}-${player.tagLine}`;

              return (
                <div 
                  key={index} 
                  className="grid grid-cols-[50px_2fr_1.5fr_100px] gap-4 items-center hover:bg-white/[0.03] p-5 px-6 rounded-2xl transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="text-xl font-black text-gray-700 group-hover:text-blue-500 transition-colors italic pl-2">
                    {index + 1}
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img src={player.profileIcon} className="w-12 h-12 rounded-xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform" alt="Icon" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0a0a0c] rounded-full border border-white/10 flex items-center justify-center text-[8px] text-blue-400 font-bold">
                        •
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <a href={opggUrl} target="_blank" rel="noreferrer" 
                         className="font-bold text-gray-100 text-2xl leading-none hover:text-blue-400 transition-colors tracking-tight italic">
                        {player.gameName}
                      </a>
                      <span className="text-[10px] text-gray-500 font-mono font-bold mt-1 tracking-widest opacity-60">#{player.tagLine}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-20 h-20 flex items-center justify-center">
                      <img 
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${player.tier.toLowerCase()}.png`}
                        className="w-full h-full object-contain scale-[1.8] drop-shadow-[0_0_12px_rgba(0,0,0,0.7)] group-hover:scale-[1.9] transition-transform duration-500"
                        alt={player.tier}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-black text-white uppercase italic leading-none tracking-tighter">
                        {player.tier} {!isApexTier && player.rank}
                      </span>
                      <span className="text-xs text-blue-500 font-black mt-1 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block w-fit">
                        {player.lp} LP
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end pr-2">
                    <div className="text-xs font-black mb-2">
                      <span className="text-green-500">{player.wins}W</span>
                      <span className="text-red-500 ml-2">{player.losses}L</span>
                    </div>
                    <div className="flex items-center gap-3 w-full justify-end">
                        <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden shadow-inner">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" style={{ width: `${player.winrate}%` }}></div>
                        </div>
                        <span className="text-[11px] font-black text-gray-400 italic">{player.winrate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[9px] text-gray-600 mt-12 uppercase tracking-[0.4em] font-bold opacity-50">
          League of Legends Leaderboard • Datos en Tiempo Real
        </p>
      </div>
    </div>
  );
}