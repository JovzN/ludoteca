import { Home, UserCircle, Package, LogOut, History } from 'lucide-react';

interface SidebarProps {
  setSeccion: (seccion: 'inicio' | 'inventario' | 'login' | 'usuarios' | 'historial') => void;
  autenticado: boolean;
  setAutenticado: (val: boolean) => void;
  setUsuario: (user: any) => void;
  idRol?: number | string; 
}

const Sidebar = ({ setSeccion, autenticado, setAutenticado, setUsuario, idRol }: SidebarProps) => {
  
  const manejarSalida = () => {
    localStorage.removeItem('usuarioLudoteca');
    setAutenticado(false);
    setUsuario(null);
    setSeccion('inicio');
  };

  return (
    <div className="w-full h-16 bg-blue-600 text-white flex items-center px-6 shadow-md sticky top-0 z-50 border-b-4 border-yellow-400">
      
      <h2 
        onClick={() => setSeccion('inicio')}
        className="text-xl font-black text-white tracking-tight mr-8 uppercase cursor-pointer"
      >
        Ludoteca
      </h2>
      
      <nav className="flex flex-row items-center gap-2 flex-1 text-left">
        <button 
          onClick={() => setSeccion('inicio')}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/20 rounded-xl transition-all font-bold text-sm uppercase"
        >
          <Home size={16} /> Inicio
        </button>

        {autenticado && (
          <>
            <button 
              onClick={() => setSeccion('inventario')}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/20 rounded-xl transition-all font-bold text-sm uppercase animate-fade-in"
            >
              <Package size={16} /> Inventario
            </button>

            {/* BOTÓN DINÁMICO SEGÚN ROL */}
            {Number(idRol) === 1 ? (
              // Vista del Administrador
              <button 
                onClick={() => setSeccion('usuarios')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/20 rounded-xl transition-all font-bold text-sm uppercase animate-fade-in text-lime-200"
              >
                <History size={16} /> Prestamos
              </button>
            ) : (
              // Vista del Alumno 
              <button 
                onClick={() => setSeccion('historial')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/20 rounded-xl transition-all font-bold text-sm uppercase animate-fade-in text-lime-200"
              >
                <History size={16} /> Mis Préstamos
              </button>
            )}
          </>
        )}
      </nav>

      {!autenticado ? (
        <button 
          onClick={() => setSeccion('login')}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/20 rounded-xl transition-all font-bold text-sm uppercase"
        >
          <UserCircle size={18} /> Entrar
        </button>
      ) : (
        <button 
          onClick={manejarSalida}
          className="flex items-center gap-2 px-3 py-1.5 text-red-200 hover:bg-white/10 rounded-xl transition-colors font-bold text-sm uppercase"
        >
          <LogOut size={16} /> Salir
        </button>
      )}
    </div>
  );
};

export default Sidebar;