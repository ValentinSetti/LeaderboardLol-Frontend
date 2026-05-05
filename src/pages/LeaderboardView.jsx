import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function LeaderboardView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copying, setCopying] = useState(false);
  const [isEditingPlayers, setIsEditingPlayers] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');

  // Traemos la URL de la variable de entorno
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = () => {
    setLoading(true);
    // Cambiamos el localhost por la variable
    fetch(`${API_URL}/api/leaderboard/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setNewTitle(json.titulo || '');
        
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

  const handleUpdateList = async (updatedAmigos) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/leaderboard/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          titulo: data.titulo, 
          amigos: updatedAmigos 
        })
      });
      
      if (res.ok) {
        fetchData();
        setIsEditingPlayers(false);
        setNewName('');
        setNewTag('');
      }
    } catch (err) {
      console.error("Error updating list:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle) return;
    setIsSaving(true);
    try {
      const currentAmigos = data.jugadores.map(p => ({ gameName: p.gameName, tagLine: p.tagLine }));
      const res = await fetch(`${API_URL}/api/leaderboard/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, titulo: newTitle, amigos: currentAmigos })
      });

      if (res.ok) {
        fetchData();
        setIsEditingTitle(false);
      }
    } catch (err) {
      console.error("Error updating title:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlayer = (gameName, tagLine) => {
    const updatedAmigos = data.jugadores
      .filter(p => !(p.gameName === gameName && p.tagLine === tagLine))
      .map(p => ({ gameName: p.gameName, tagLine: p.tagLine }));
    
    handleUpdateList(updatedAmigos);
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newName || !newTag) return;

    const currentAmigos = data.jugadores.map(p => ({ gameName: p.gameName, tagLine: p.tagLine }));
    const updatedAmigos = [...currentAmigos, { gameName: newName, tagLine: newTag }];
    
    handleUpdateList(updatedAmigos);
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
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center gap-6">
      <p className="text-xl font-bold opacity-50">Lista no encontrada</p>
      <Link 
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
      >
        Volver al Inicio
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] via-[#0d0d12] to-[#111116] text-gray-200 p-3 md:p-10 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Botón Volver */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-4 md:mb-8 group"
        >
          <div className="p-1.5 md:p-2 rounded-lg bg-white/5 group-hover:bg-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em]">Nueva Lista</span>
        </Link>

        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-12 gap-4 md:gap-6">
          <div className="flex flex-col gap-2 md:gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-3 md:gap-5 w-full">
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic focus:border-blue-500 outline-none transition-colors"
                />
                <button
                  onClick={handleUpdateTitle}
                  disabled={isSaving || !newTitle}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all"
                >
                  {isSaving ? 'Guardando...' : 'Guardar título'}
                </button>
                <button
                  onClick={copyLink}
                  className={`p-2 md:p-2.5 rounded-lg md:rounded-xl border transition-all duration-300 ${copying ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-gray-500 hover:bg-white/5 hover:text-white hover:border-white/20'}`}
                >
                  {copying ? (
                    <span className="text-[8px] md:text-[10px] font-black uppercase px-1">¡Copiado!</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-start md:items-center gap-3 md:gap-5">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic border-l-4 md:border-l-8 border-blue-600 pl-3 md:pl-6 drop-shadow-sm">
                  {data.titulo}
                </h1>
                <button 
                  onClick={copyLink}
                  className={`p-2 md:p-2.5 rounded-lg md:rounded-xl border transition-all duration-300 ${copying ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-gray-500 hover:bg-white/5 hover:text-white hover:border-white/20'}`}
                >
                  {copying ? (
                    <span className="text-[8px] md:text-[10px] font-black uppercase px-1">¡Copiado!</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            )}
            {lastUpdated && (
              <div className="flex items-center gap-2 md:pl-6 md:pl-8">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  Actualizado: <span className="text-gray-300">{lastUpdated} HS</span>
                </p>
              </div>
            )}
          </div>

            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                onClick={() => setIsEditingPlayers(!isEditingPlayers)}
                className={`flex items-center gap-2 md:gap-3 border border-white/5 px-3 md:px-6 py-2 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 ${isEditingPlayers ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-[#1a1a20] text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isEditingPlayers ? "M6 18L18 6M6 6l12 12" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                </svg>
                {isEditingPlayers ? 'Cancelar lista' : 'Editar lista'}
              </button>

              <button
                onClick={() => setIsEditingTitle(!isEditingTitle)}
                className={`flex items-center gap-2 md:gap-3 border border-white/5 px-3 md:px-6 py-2 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 ${isEditingTitle ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-[#1a1a20] text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isEditingTitle ? "M6 18L18 6M6 6l12 12" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                </svg>
                {isEditingTitle ? 'Cancelar título' : 'Editar título'}
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="group flex items-center gap-2 md:gap-3 bg-[#1a1a20] hover:bg-blue-600 border border-white/5 hover:border-blue-400 text-white px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 md:h-4 md:w-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Sincronizando...' : 'Refrescar'}
              </button>
            </div>
        </div>

        {/* Formulario Agregar Jugador */}
        {isEditingPlayers && (
          <div className="mb-4 md:mb-8 bg-blue-600/5 border border-blue-500/20 p-3 md:p-6 rounded-2xl md:rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-3 md:mb-4">Agregar Nuevo Invocador</h3>
            <form onSubmit={handleAddPlayer} className="flex flex-col md:flex-row gap-2 md:gap-3">
              <input 
                placeholder="Nombre"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-sm focus:border-blue-500 outline-none transition-colors"
              />
              <input 
                placeholder="TAG"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                className="w-full md:w-24 bg-[#0a0a0c] border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-sm focus:border-blue-500 outline-none transition-colors"
              />
              <button 
                type="submit"
                disabled={isSaving || !newName || !newTag}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
              >
                {isSaving ? 'Agregando...' : 'Agregar'}
              </button>
            </form>
          </div>
        )}
        
        {/* Cuerpo de la Tabla */}
        <div className="bg-[#111114]/40 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
          {/* Encabezado */}
          <div className="hidden md:grid md:grid-cols-[50px_minmax(180px,2fr)_1.5fr_100px_50px] gap-4 px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] bg-white/[0.02] border-b border-white/5">
            <span>#</span>
            <span>Invocador</span>
            <span>Rango Actual</span>
            <span className="text-right">Rendimiento</span>
            {isEditingPlayers && <span></span>}
          </div>

          <div className="p-1 md:p-2 space-y-1">
            {data.jugadores.map((player, index) => {
              const isApexTier = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(player.tier.toUpperCase());
              const opggUrl = `https://www.op.gg/summoners/las/${encodeURIComponent(player.gameName)}-${player.tagLine}`;

              return (
                <div 
                  key={index} 
                  className="flex flex-col gap-3 md:grid md:grid-cols-[50px_minmax(180px,2fr)_1.5fr_100px_50px] md:gap-4 md:items-center hover:bg-white/[0.03] p-3 md:p-5 rounded-xl md:rounded-2xl transition-all duration-300 group"
                >
                  {/* Móvil: Card completa por jugador */}
                  <div className="md:hidden space-y-3">
                    {/* Fila 1: Posición, Icono, Nombre, Rango */}
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center text-lg font-black text-gray-700 italic">{index + 1}</div>
                      <img src={player.profileIcon} className="w-10 h-10 rounded-lg border border-white/10" alt="Icon" />
                      <div className="flex-1 min-w-0">
                        <a href={opggUrl} target="_blank" rel="noreferrer" 
                           className="font-bold text-gray-100 text-lg truncate block hover:text-blue-400 transition-colors">
                          {player.gameName}
                        </a>
                        <span className="text-[9px] text-gray-500 font-mono">#{player.tagLine}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-white uppercase">{player.tier} {!isApexTier && player.rank}</div>
                        <div className="text-[10px] text-blue-500 font-black">{player.lp} LP</div>
                      </div>
                    </div>

{/* Fila 2: Wins/Losses, Winrate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-xs font-black">
                          <span className="text-green-500">{player.wins}W</span>
                          <span className="text-gray-500 mx-1">-</span>
                          <span className="text-red-500">{player.losses}L</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full" style={{ width: `${player.winrate}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-gray-400">{player.winrate}%</span>
                        </div>
</div>
                    </div>

                    {isEditingPlayers && (
                      <div className="flex justify-end pt-1">
                        <button 
                          onClick={() => handleDeletePlayer(player.gameName, player.tagLine)}
                          disabled={isSaving}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desktop: Grid tradicional */}
                  <div className="hidden md:block text-xl font-black text-gray-700 group-hover:text-blue-500 transition-colors italic pl-2">
                    {index + 1}
                  </div>
                  
                  <div className="hidden md:flex items-center gap-5">
                    <div className="relative">
                      <img src={player.profileIcon} className="w-12 h-12 rounded-xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform" alt="Icon" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0a0a0c] rounded-full border border-white/10 flex items-center justify-center text-[8px] text-blue-400 font-bold">
                        •
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <a href={opggUrl} target="_blank" rel="noreferrer" 
                         className="font-bold text-gray-100 text-2xl leading-none hover:text-blue-400 transition-colors tracking-tight italic truncate">
                        {player.gameName}
                      </a>
                      <span className="text-[10px] text-gray-500 font-mono font-bold mt-1 tracking-widest opacity-60">#{player.tagLine}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-20 h-20 flex items-center justify-center shrink-0">
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

                  <div className="hidden md:flex flex-col items-end pr-2">
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

                  {isEditingPlayers && (
                    <div className="hidden md:flex justify-end">
                      <button 
                        onClick={() => handleDeletePlayer(player.gameName, player.tagLine)}
                        disabled={isSaving}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        title="Eliminar Jugador"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[8px] md:text-[9px] text-gray-600 mt-6 md:mt-12 uppercase tracking-[0.4em] font-bold opacity-50">
          League of Legends Leaderboard • Datos en Tiempo Real
        </p>
      </div>
    </div>
  );
}