import { useState } from 'react'; 
import { Gamepad2, Lock, User } from 'lucide-react';
import api from '../services/api'; 

// 1. Actualizamos la Interface para que acepte el objeto del usuario
interface LoginProps {
  onLogin: (user: { username: string; id_rol: number }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  // 2. Estados para capturar los datos del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 3. Llamada real a tu servidor
      const respuesta = await api.post('/login', { username, password });
      
      if (respuesta.data.success) {
        // 4. Enviamos los datos del usuario (incluyendo el id_rol) a App.tsx
        onLogin(respuesta.data.user); 
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Credenciales incorrectas. Intenta de nuevo, aventurero.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6 text-left">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border-b-12 border-indigo-100 p-10 animate-pop-in">
        
        <div className="text-center mb-10">
          <div className="bg-yellow-400 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
            <Gamepad2 size={40} className="text-indigo-950" />
          </div>
          <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter">Ludoteca</h2>
          <p className="text-orange-600 font-bold italic">¡Bienvenido a la aventura!</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label className="text-xs font-black text-indigo-900 uppercase ml-4 mb-1 block text-left">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-indigo-300" size={20} />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de aventurero"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 focus:border-orange-400 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-black text-indigo-900 uppercase ml-4 mb-1 block text-left">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-indigo-300" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 focus:border-orange-400 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={cargando}
            className={`w-full py-4 rounded-2xl shadow-lg font-black text-lg uppercase tracking-widest transition-all border-b-4 mt-4 active:translate-y-1 active:border-b-0 ${
              cargando 
                ? 'bg-slate-300 border-slate-400 cursor-wait' 
                : 'bg-lime-500 border-lime-700 text-white hover:bg-lime-600 shadow-lime-200'
            }`}
          >
            {cargando ? 'Cargando...' : '¡Entrar a Jugar!'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Sistema de Administración v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;