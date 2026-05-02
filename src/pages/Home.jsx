import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [id, setId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [amigos, setAmigos] = useState([{ gameName: '', tagLine: '' }]);
  const navigate = useNavigate();

  // Traemos la URL de la variable de entorno
  const API_URL = import.meta.env.VITE_API_URL;

  const addAmigo = () => setAmigos([...amigos, { gameName: '', tagLine: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Cambiamos el localhost por la variable
    const res = await fetch(`${API_URL}/api/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, titulo, amigos })
    });
    if (res.ok) navigate(`/leaderboard/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        CREAR LEADERBOARD
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-[#111114] p-8 rounded-xl border border-white/5 w-full max-w-md space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID del Link (ej: los-pibes)</label>
          <input className="w-full bg-[#0a0a0c] border border-white/10 rounded p-2 focus:border-blue-500 outline-none" 
            value={id} onChange={e => setId(e.target.value)} required />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título de la Lista</label>
          <input className="w-full bg-[#0a0a0c] border border-white/10 rounded p-2 focus:border-blue-500 outline-none" 
            value={titulo} onChange={e => setTitulo(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Amigos (Riot ID)</label>
          {amigos.map((amigo, idx) => (
            <div key={idx} className="flex gap-2">
              <input placeholder="Nombre" className="flex-1 bg-[#0a0a0c] border border-white/10 rounded p-2 text-sm"
                onChange={e => {
                  const newAmigos = [...amigos];
                  newAmigos[idx].gameName = e.target.value;
                  setAmigos(newAmigos);
                }} />
              <input placeholder="TAG" className="w-20 bg-[#0a0a0c] border border-white/10 rounded p-2 text-sm"
                onChange={e => {
                  const newAmigos = [...amigos];
                  newAmigos[idx].tagLine = e.target.value;
                  setAmigos(newAmigos);
                }} />
            </div>
          ))}
        </div>

        <button type="button" onClick={addAmigo} className="text-sm text-blue-400 hover:text-blue-300 font-bold">
          + Agregar otro amigo
        </button>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-all mt-4">
          GUARDAR Y VER LISTA
        </button>
      </form>
    </div>
  );
}