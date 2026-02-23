import { useState, useEffect } from 'react';
import { X, Save, Layers, Users, Award, Clock, Hash } from 'lucide-react';
import api from '../services/api';
import type { Juego } from '../App';

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
  datosEdicion?: Juego | null; 
}

const ModalJuego = ({ onClose, onSuccess, datosEdicion }: ModalProps) => {
  const [categorias, setCategorias] = useState<{ id_categoria: number; nombre_categoria: string }[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    id_categoria: 0,
    descripcion: '',
    jugadores_min: 1,
    jugadores_max: 4,
    edad_recomendada: 8,
    duracion_minutos: 30,
    complejidad: 'Media',
    tags: '',
    sku: '',
    cantidad: 0
  });

  // EFECTO DE CARGA: Si hay datosEdicion, llenamos el formulario
  useEffect(() => {
    if (datosEdicion) {
      setFormData({
        titulo: datosEdicion.titulo,
        id_categoria: datosEdicion.id_categoria || 0,
        descripcion: datosEdicion.descripcion,
        jugadores_min: datosEdicion.jugadores_min,
        jugadores_max: datosEdicion.jugadores_max,
        edad_recomendada: datosEdicion.edad_recomendada,
        duracion_minutos: 30, 
        complejidad: datosEdicion.complejidad,
        tags: Array.isArray(datosEdicion.tags) ? datosEdicion.tags.join(', ') : '',
        sku: 'EDIT-MODE', 
        cantidad: datosEdicion.cantidad
      });
    }
  }, [datosEdicion]);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await api.get('/categorias');
        setCategorias(res.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    cargarCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let idCatFinal = formData.id_categoria;

      if (nuevaCategoria && idCatFinal === 0) {
        const resCat = await api.post('/categorias', { nombre_categoria: nuevaCategoria });
        idCatFinal = resCat.data.id_categoria;
      }

      if (idCatFinal === 0) {
        alert("Por favor selecciona o escribe una categoría válida.");
        return;
      }

      const dataFinal = {
        ...formData,
        id_categoria: idCatFinal,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };
      
      if (datosEdicion) {
        await api.put(`/juegos/${datosEdicion.id_juego}`, dataFinal);
      } else {
        await api.post('/juegos/completo', dataFinal);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al procesar:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  return (
    <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 text-left">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-pop-in border-4 border-indigo-900">
        <header className="bg-indigo-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Layers className="text-yellow-400" />
            <h2 className="font-black uppercase tracking-tighter text-xl">
              {datosEdicion ? 'Actualizar Juego' : 'Registro Maestro'}
            </h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-indigo-950 uppercase mb-1 block">Título del Juego</label>
              <input required value={formData.titulo} className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-sm" 
                onChange={e => setFormData({...formData, titulo: e.target.value})} />
            </div>
            
            <div className="col-span-1">
              <label className="text-[10px] font-black text-blue-600 uppercase mb-1 flex items-center gap-1"><Hash size={12}/> SKU del Ejemplar</label>
              <input 
                required 
                disabled={!!datosEdicion} 
                placeholder="LUD-001" 
                className={`w-full p-3 rounded-xl border-2 font-bold text-sm ${datosEdicion ? 'bg-gray-100 text-gray-400' : 'bg-blue-50/30 border-blue-50 focus:border-blue-500'}`} 
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})} 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-indigo-950 uppercase mb-1 block">Categoría (Busca o Escribe)</label>
              <input 
                list="categorias-list"
                required
                placeholder="Selecciona o crea..."
                className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-sm focus:border-indigo-500 outline-none"
                // Mostramos el nombre de la categoría si estamos editando
                defaultValue={datosEdicion ? datosEdicion.nombre_categoria : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const existe = categorias.find(c => c.nombre_categoria === val);
                  if (existe) {
                    setFormData({...formData, id_categoria: existe.id_categoria});
                    setNuevaCategoria('');
                  } else {
                    setNuevaCategoria(val);
                    setFormData({...formData, id_categoria: 0});
                  }
                }} 
              />
              <datalist id="categorias-list">
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.nombre_categoria} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 bg-amber-50 p-4 rounded-2xl border-2 border-amber-100">
            <div>
              <label className="text-[9px] font-black text-orange-600 uppercase mb-1 flex items-center gap-1"><Users size={12}/> Min</label>
              <input type="number" value={formData.jugadores_min} className="w-full p-2 rounded-lg font-bold text-xs" 
                onChange={e => setFormData({...formData, jugadores_min: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-[9px] font-black text-orange-600 uppercase mb-1 flex items-center gap-1"><Users size={12}/> Max</label>
              <input type="number" value={formData.jugadores_max} className="w-full p-2 rounded-lg font-bold text-xs" 
                onChange={e => setFormData({...formData, jugadores_max: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-[9px] font-black text-orange-600 uppercase mb-1 flex items-center gap-1"><Award size={12}/> Edad</label>
              <input type="number" value={formData.edad_recomendada} className="w-full p-2 rounded-lg font-bold text-xs" 
                onChange={e => setFormData({...formData, edad_recomendada: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-[9px] font-black text-orange-600 uppercase mb-1 flex items-center gap-1"><Clock size={12}/> Minutos</label>
              <input type="number" value={formData.duracion_minutos} className="w-full p-2 rounded-lg font-bold text-xs" 
                onChange={e => setFormData({...formData, duracion_minutos: Number(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-indigo-950 uppercase mb-1 block">Complejidad</label>
              <select value={formData.complejidad} className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-sm"
                onChange={e => setFormData({...formData, complejidad: e.target.value})}>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-green-600 uppercase mb-1 flex items-center gap-1">
                <Layers size={12}/> Stock Disponible
              </label>
              <input 
                type="number" 
                min="0"
                required
                value={formData.cantidad}
                className="w-full p-3 rounded-xl border-2 border-green-50 focus:border-green-500 outline-none font-bold text-sm bg-green-50/30" 
                onChange={e => setFormData({...formData, cantidad: Number(e.target.value)})} 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-indigo-950 uppercase mb-1 block">Descripción del Juego</label>
            <textarea value={formData.descripcion} className="w-full p-3 rounded-xl border-2 border-slate-100 font-medium text-sm h-20 outline-none focus:border-indigo-500"
              onChange={e => setFormData({...formData, descripcion: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black text-indigo-950 uppercase mb-1 block">Etiquetas (Separadas por coma)</label>
            <input value={formData.tags} placeholder="Estrategia, Familia" className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-sm italic"
              onChange={e => setFormData({...formData, tags: e.target.value})} />
          </div>

          <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 border-b-4 active:translate-y-1 active:border-b-0 transition-all ${datosEdicion ? 'bg-indigo-600 border-indigo-800 shadow-indigo-100 hover:bg-indigo-700' : 'bg-lime-500 border-lime-700 shadow-lime-100 hover:bg-lime-600'}`}>
            <Save size={20} /> 
            {datosEdicion ? 'GUARDAR CAMBIOS' : 'FINALIZAR REGISTRO COMPLETO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalJuego;