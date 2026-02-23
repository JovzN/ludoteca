import { useState } from 'react';
import { X, UserPlus, Mail, Lock, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const ModalUsuario = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '', id_rol: 2 });
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api.post('/usuarios/registro', form);
      onSuccess();
    } catch (error) {
      alert("Error al crear usuario");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <UserPlus size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Nuevo Usuario</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-400 uppercase ml-2 tracking-widest">Nombre de Usuario</label>
            <div className="relative">
              <input required type="text" className="w-full bg-indigo-50/50 border-2 border-indigo-50 rounded-2xl px-11 py-3 text-sm font-bold" 
                placeholder="ej. oscar_dev" onChange={e => setForm({...form, username: e.target.value})} />
              <UserPlus className="absolute left-4 top-3.5 text-indigo-300" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-400 uppercase ml-2 tracking-widest">Correo Electrónico</label>
            <div className="relative">
              <input required type="email" className="w-full bg-indigo-50/50 border-2 border-indigo-50 rounded-2xl px-11 py-3 text-sm font-bold" 
                placeholder="correo@ejemplo.com" onChange={e => setForm({...form, email: e.target.value})} />
              <Mail className="absolute left-4 top-3.5 text-indigo-300" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-400 uppercase ml-2 tracking-widest">Contraseña</label>
            <div className="relative">
              <input required type="password" name="password" className="w-full bg-indigo-50/50 border-2 border-indigo-50 rounded-2xl px-11 py-3 text-sm font-bold" 
                placeholder="••••••••" onChange={e => setForm({...form, password: e.target.value})} />
              <Lock className="absolute left-4 top-3.5 text-indigo-300" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-400 uppercase ml-2 tracking-widest">Rol de Acceso</label>
            <div className="relative">
              <select className="w-full bg-indigo-50/50 border-2 border-indigo-50 rounded-2xl px-11 py-3 text-sm font-bold appearance-none"
                onChange={e => setForm({...form, id_rol: Number(e.target.value)})}>
                <option value={2}>Alumno / Usuario</option>
                <option value={1}>Administrador</option>
              </select>
              <ShieldCheck className="absolute left-4 top-3.5 text-indigo-300" size={18} />
            </div>
          </div>

          <button disabled={cargando} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 uppercase tracking-widest text-xs">
            {cargando ? 'Registrando...' : 'Confirmar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;