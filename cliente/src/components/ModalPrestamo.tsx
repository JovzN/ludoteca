import { useState, useEffect } from 'react';
import { X, CheckCircle, Search, Clock } from 'lucide-react';
import api from '../services/api';
import type { Juego } from '../App';

interface Props {
  juego: Juego;
  onClose: () => void;
  onSuccess: () => void;
}

interface Usuario {
  id_usuario: number;
  username: string;
  email: string;
}

const ModalPrestamo = ({ juego, onClose, onSuccess }: Props) => {
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<Usuario[]>([]);
  const [usuarioSel, setUsuarioSel] = useState<Usuario | null>(null);
  const [dias, setDias] = useState(7);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const buscar = async () => {
      if (busqueda.length > 1 && !usuarioSel) {
        try {
          const res = await api.get(`/usuarios/buscar?q=${busqueda}`);
          setSugerencias(res.data);
        } catch (error) {
          console.error("Error buscando usuarios", error);
        }
      } else {
        setSugerencias([]);
      }
    };
    const timer = setTimeout(buscar, 300);
    return () => clearTimeout(timer);
  }, [busqueda, usuarioSel]);

  const manejarPrestamo = async () => {
    if (!usuarioSel) return alert("Por favor, selecciona un alumno/usuario.");
    
    setEnviando(true);
    try {
      await api.post('/prestamos', {
        id_juego: juego.id_juego,
        id_usuario: usuarioSel.id_usuario,
        dias_prestamo: dias
      });
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al procesar el préstamo");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center z-70 p-4 text-left">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-500 animate-pop-in text-left">
        <header className="bg-amber-500 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-100" />
            <h2 className="font-black uppercase tracking-tighter text-xl text-left">Registrar Salida</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
        </header>

        <div className="p-8 space-y-6">
          <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100">
            <span className="text-[10px] font-black text-amber-600 uppercase">Juego a entregar:</span>
            <p className="text-xl font-black text-indigo-950 italic">{juego.titulo}</p>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-indigo-950 uppercase mb-1 block">Buscar Alumno (Username o Email)</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Escriba para buscar..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-amber-500 outline-none font-bold text-sm transition-all"
                value={usuarioSel ? usuarioSel.username : busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setUsuarioSel(null); }}
              />
            </div>

            {sugerencias.length > 0 && !usuarioSel && (
              <div className="absolute w-full bg-white border-2 border-slate-100 rounded-xl mt-1 shadow-2xl z-20 max-h-40 overflow-y-auto">
                {sugerencias.map(u => (
                  <div 
                    key={u.id_usuario}
                    onClick={() => setUsuarioSel(u)}
                    className="p-3 hover:bg-amber-50 cursor-pointer font-bold text-sm text-indigo-950 border-b last:border-0 flex justify-between items-center"
                  >
                    <span>{u.username}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{u.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black text-indigo-950 uppercase mb-2 block">Plazo de Devolución</label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDias(d)}
                  className={`py-2 rounded-xl font-black text-xs transition-all border-2 ${
                    dias === d 
                    ? 'bg-indigo-600 border-indigo-700 text-white' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                  }`}
                >
                  {d} DÍAS
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={manejarPrestamo}
            disabled={enviando || !usuarioSel}
            className={`w-full font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 border-b-4 transition-all ${
              enviando || !usuarioSel
              ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 border-indigo-800 text-white hover:bg-indigo-700 active:translate-y-1 active:border-b-0'
            }`}
          >
            <CheckCircle size={20} /> 
            {enviando ? 'PROCESANDO...' : 'CONFIRMAR PRÉSTAMO'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPrestamo;