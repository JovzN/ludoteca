import { useState, useEffect } from 'react';
import Sidebar from './components/siderbar'; 
import Login from './components/Login';     
import Inicio from './components/Inicio';   
import api from './services/api';
import { MapPin, Mail, Search, Edit3, Trash2, Handshake, Users as UsersIcon, RotateCcw, History, ArrowLeft, UserPlus } from 'lucide-react';
import ModalJuego from './components/ModalJuego';
import ModalConfirmacion from './components/ModalConfimacion';
import ModalPrestamo from './components/ModalPrestamo';
import ModalExito from './components/ModalExito'; 
import ModalUsuario from './components/ModalUsuario'; // Asegúrate de crear este archivo

export interface Juego {
  id_juego: number;
  titulo: string;
  descripcion: string;
  nombre_categoria: string;
  id_categoria: number;
  jugadores_min: number;
  jugadores_max: number;
  edad_recomendada: number;
  complejidad: string;
  tags: string[];
  cantidad: number;
}

interface PrestamoActivo {
  id_prestamo: number;
  username: string;
  email: string;
  juego: string;
  fecha_salida: string;
  fecha_devolucion_pactada: string;
}

interface HistorialPrestamo {
  id_prestamo: number;
  username: string;
  juego: string;
  titulo?: string; 
  fecha_salida: string;
  fecha_devolucion_real: string;
  estado_prestamo?: string;
  fecha_devolucion_pactada?: string;
}

function App() {
  // --- 1. PERSISTENCIA DE SESIÓN ---
  const [usuario, setUsuario] = useState<{ username: string; id_rol: number; id_usuario: number } | null>(() => {
    const guardado = localStorage.getItem('usuarioLudoteca');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem('usuarioLudoteca') !== null;
  });

  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [prestamosActivos, setPrestamosActivos] = useState<PrestamoActivo[]>([]);
  const [historial, setHistorial] = useState<HistorialPrestamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState<'inicio' | 'inventario' | 'login' | 'usuarios' | 'historial'>('inicio');
  const [busqueda, setBusqueda] = useState('');
  
  const [mostrarExito, setMostrarExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [prestamoADevolver, setPrestamoADevolver] = useState<number | null>(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [complejidadFiltro, setComplejidadFiltro] = useState('Todas');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [juegoAEditar, setJuegoAEditar] = useState<Juego | null>(null);
  const [juegoAEliminar, setJuegoAEliminar] = useState<Juego | null>(null);
  const [juegoAPrestar, setJuegoAPrestar] = useState<Juego | null>(null);
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);
  
  const cargarJuegos = async () => {
    try {
      const p = new URLSearchParams();
      if (busqueda.trim()) p.append('search', busqueda);
      if (complejidadFiltro !== 'Todas') p.append('complejidad', complejidadFiltro);
      if (soloDisponibles) p.append('soloDisponibles', 'true');
      const respuesta = await api.get(`/juegos?${p.toString()}`);
      setJuegos(respuesta.data);
    } catch (error) {
      console.error("Error al cargar juegos:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarPrestamosActivos = async () => {
    try {
      const respuesta = await api.get('/admin/prestamos-activos');
      setPrestamosActivos(respuesta.data);
    } catch (error) {
      console.error("Error al cargar préstamos:", error);
    }
  };

  const cargarHistorialOPrestamosPersonales = async () => {
    if (!autenticado || !usuario?.id_usuario) return; 
    try {
      const url = Number(usuario.id_rol) === 1 
        ? '/admin/historial-prestamos' 
        : `/mis-prestamos/${usuario.id_usuario}`;
      const respuesta = await api.get(url);
      setHistorial(respuesta.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  const ejecutarDevolucion = async () => {
    if (!prestamoADevolver) return;
    try {
      await api.put(`/prestamos/${prestamoADevolver}/devolver`);
      setPrestamoADevolver(null); 
      setMensajeExito("¡El juego ha regresado! El inventario se actualizó correctamente.");
      setMostrarExito(true); 
      cargarPrestamosActivos(); 
      cargarJuegos(); 
    } catch (error) {
      console.error("Error al devolver:", error);
    }
  };

  useEffect(() => {
    if (seccion === 'inventario') {
      cargarJuegos();
    } else if (seccion === 'usuarios') {
      cargarPrestamosActivos();
    } else if (seccion === 'historial') {
      cargarHistorialOPrestamosPersonales();
    }
  }, [seccion, usuario, busqueda, complejidadFiltro, soloDisponibles]); 

  const confirmarEliminacion = async () => {
    if (!juegoAEliminar) return;
    try {
      await api.delete(`/juegos/${juegoAEliminar.id_juego}`);
      cargarJuegos();
      setJuegoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col font-sans text-left">
      <Sidebar 
        setSeccion={setSeccion} 
        autenticado={autenticado} 
        setAutenticado={setAutenticado} 
        idRol={usuario?.id_rol} 
        setUsuario={setUsuario} 
      />

      {/* MODALES DE DISEÑO */}
      {mostrarExito && (
        <ModalExito mensaje={mensajeExito} onClose={() => setMostrarExito(false)} />
      )}

      {prestamoADevolver && (
        <ModalConfirmacion 
          titulo="¿Confirmar Devolución?"
          mensaje="Asegúrate de que el juego esté en buen estado antes de recibirlo."
          onConfirm={ejecutarDevolucion}
          onClose={() => setPrestamoADevolver(null)}
        />
      )}

      {mostrarModal && (
        <ModalJuego 
          datosEdicion={juegoAEditar}
          onClose={() => { setMostrarModal(false); setJuegoAEditar(null); }} 
          onSuccess={() => { cargarJuegos(); setMostrarModal(false); setJuegoAEditar(null); }} 
        />
      )}

      {mostrarModalUsuario && (
        <ModalUsuario 
          onClose={() => setMostrarModalUsuario(false)}
          onSuccess={() => {
            setMostrarModalUsuario(false);
            setMensajeExito("¡Usuario registrado con éxito!");
            setMostrarExito(true);
          }}
        />
      )}

      {juegoAEliminar && (
        <ModalConfirmacion 
          titulo={juegoAEliminar.titulo}
          mensaje="El registro se archivará permanentemente para fines de auditoría."
          onConfirm={confirmarEliminacion}
          onClose={() => setJuegoAEliminar(null)}
        />
      )}
      {mostrarModalPrestamo && juegoAPrestar && (
        <ModalPrestamo 
          juego={juegoAPrestar}
          onClose={() => { setMostrarModalPrestamo(false); setJuegoAPrestar(null); }}
          onSuccess={() => { cargarJuegos(); setMostrarModalPrestamo(false); setJuegoAPrestar(null); }}
        />
      )}

      <main className="flex-1 p-8 w-full max-w-7xl mx-auto">
        {seccion === 'login' ? (
          <Login onLogin={(datosUser: any) => { 
            setAutenticado(true); 
            setUsuario(datosUser); 
            setSeccion('inicio'); 
            localStorage.setItem('usuarioLudoteca', JSON.stringify(datosUser));
          }} />
        ) : seccion === 'inicio' ? (
          <Inicio setSeccion={setSeccion} usuario={usuario} /> 
        ) : seccion === 'usuarios' ? (
          <div className="animate-fade-in text-left">
            <header className="mb-8 border-l-8 border-yellow-400 pl-6 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3"><UsersIcon size={32} className="text-indigo-950" /> <h1 className="text-4xl font-black text-indigo-950 italic">Control de Préstamos</h1></div>
                <p className="text-orange-600 font-bold uppercase text-xs tracking-widest">Seguimiento de entregas pendientes</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMostrarModalUsuario(true)} className="bg-lime-500 text-white px-6 py-3 rounded-xl hover:bg-lime-600 shadow-lg font-black text-sm transition-all border-b-4 border-lime-700 active:border-b-0 active:translate-y-1 flex items-center gap-2">
                  <UserPlus size={18} /> NUEVO USUARIO
                </button>
                <button onClick={() => setSeccion('historial')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-lg font-black text-sm transition-all border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 flex items-center gap-2">
                  <History size={18} /> VER HISTORIAL
                </button>
              </div>
            </header>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-b-8 border-indigo-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                  <tr><th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Usuario</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Juego</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest text-center">Entrega Pactada</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest text-center">Acciones</th></tr>
                </thead>
                <tbody>
                  {prestamosActivos.length > 0 ? (
                    prestamosActivos.map((p) => (
                      <tr key={p.id_prestamo} className="border-b border-gray-50 hover:bg-yellow-50/30 transition-colors">
                        <td className="p-4"><div className="font-bold text-indigo-950">{p.username}</div><div className="text-[10px] text-slate-400 font-medium italic">{p.email}</div></td>
                        <td className="p-4 text-sm font-medium text-slate-700">{p.juego}</td>
                        <td className="p-4 text-center text-sm font-black text-indigo-600">{new Date(p.fecha_devolucion_pactada).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => setPrestamoADevolver(p.id_prestamo)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md mx-auto">
                            <RotateCcw size={14} /> Recibir
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (<tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">No hay préstamos pendientes.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        ) : seccion === 'historial' ? (
          <div className="animate-fade-in text-left">
            <header className="mb-8 border-l-8 border-blue-600 pl-6 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-indigo-950 italic">
                  {Number(usuario?.id_rol) === 1 ? 'Historial de Devoluciones' : 'Mis Préstamos'}
                </h1>
                <p className="text-blue-600 font-bold uppercase text-xs tracking-widest">
                  {Number(usuario?.id_rol) === 1 ? 'Registro permanente de la base de datos' : `¡Hola ${usuario?.username}! Este es tu registro personal.`}
                </p>
              </div>
              {Number(usuario?.id_rol) === 1 && (
                <button onClick={() => setSeccion('usuarios')} className="bg-slate-500 text-white px-6 py-3 rounded-xl hover:bg-slate-600 shadow-lg font-black text-sm transition-all border-b-4 border-slate-700 active:border-b-0 active:translate-y-1 flex items-center gap-2"><ArrowLeft size={18} /> VOLVER A PRÉSTAMOS</button>
              )}
            </header>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-b-8 border-indigo-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                  <tr>
                    <th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest">
                      {Number(usuario?.id_rol) === 1 ? 'Usuario / Juego' : 'Juego'}
                    </th>
                    <th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest text-center">Salida</th>
                    <th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest text-center">Estado / Devolución</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length > 0 ? (
                    historial.map((h, index) => (
                      <tr key={index} className="border-b border-gray-50 bg-white hover:bg-slate-50 transition-colors">
    <td className="p-4">
      <div className="text-sm font-bold text-indigo-950">{h.juego}</div>
      <div className="text-[10px] text-slate-400 italic">Préstamo personal</div>
    </td>
    <td className="p-4 text-center">
      <span className="text-xs font-medium text-slate-600">
        {new Date(h.fecha_salida).toLocaleDateString()}
      </span>
    </td>
    <td className="p-4 text-center">
      {/* AQUÍ DIFERENCIAMOS LO QUE TIENE EN MANO DE LO FINALIZADO */}
      {h.estado_prestamo === 'En curso' ? (
        <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-amber-200 shadow-sm">
          EN TUS MANOS 📖
        </span>
      ) : (
        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-emerald-200">
          ENTREGADO ✅
        </span>
      )}
    </td>
  </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">No se encontraron registros.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in text-left">
            <header className="mb-8 border-l-8 border-indigo-600 pl-6 space-y-6">
              <div className="flex justify-between items-center">
                <div><h1 className="text-4xl font-black text-indigo-950 italic">Inventario de Juegos</h1><p className="text-orange-600 font-bold uppercase text-xs tracking-widest">Gestión de Catálogo y Stock</p></div>
                {autenticado && usuario?.id_rol === 1 && (<button onClick={() => { setJuegoAEditar(null); setMostrarModal(true); }} className="bg-lime-500 text-white px-6 py-3 rounded-xl hover:bg-lime-600 shadow-lg font-black text-sm transition-all border-b-4 border-lime-700 active:border-b-0 active:translate-y-1">+ NUEVO REGISTRO</button>)}
              </div>
              <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
                <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-indigo-400 uppercase ml-1">Dificultad</span><select value={complejidadFiltro} onChange={(e) => setComplejidadFiltro(e.target.value)} className="px-4 py-2 rounded-xl border-2 border-indigo-50 text-sm font-bold text-indigo-900 bg-indigo-50/30"><option value="Todas">Todas</option><option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option></select></div>
                <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-indigo-400 uppercase ml-1">Disponibilidad</span><label className="flex items-center gap-2 cursor-pointer bg-indigo-50/30 px-4 py-2 rounded-xl border-2 border-indigo-50 h-10"><input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} className="w-4 h-4 accent-indigo-600" /><span className="text-xs font-black text-indigo-900 uppercase">Solo con Stock</span></label></div>
                <div className="flex-1 min-w-64 flex flex-col gap-1"><span className="text-[10px] font-black text-indigo-400 uppercase ml-1">Buscador Maestro</span><div className="relative"><Search className="absolute left-3 top-2.5 text-indigo-400" size={18} /><input type="text" placeholder="Título, edad..." className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-indigo-50 text-sm font-bold" onChange={(e) => setBusqueda(e.target.value)} /></div></div>
              </div>
            </header>
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-b-8 border-indigo-100 mb-12">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b-2 border-gray-100">
                  <tr><th className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Juego</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px] text-center">Jugadores</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px] text-center">Edad</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px]">Categoría</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px] text-center">Stock</th><th className="p-4 font-bold text-gray-600 uppercase text-[10px] text-center">Acciones</th></tr>
                </thead>
                <tbody>
                  {cargando ? (<tr><td colSpan={7} className="p-10 text-center text-blue-500 font-bold animate-pulse">Sincronizando Ludoteca...</td></tr>) : (
                    juegos.map((j) => (
                      <tr key={j.id_juego} className="border-b border-gray-50 hover:bg-indigo-50/50 transition-colors">
                        <td className="p-4"><div className="font-bold text-indigo-950 text-sm">{j.titulo}</div><div className="text-gray-400 text-[10px] italic truncate max-w-xs">{j.descripcion}</div></td>
                        <td className="p-4 text-sm font-bold text-indigo-600 text-center">{j.jugadores_min}-{j.jugadores_max}</td>
                        <td className="p-4 text-sm font-bold text-orange-600 text-center">+{j.edad_recomendada}</td>
                        <td className="p-4 text-xs font-black text-slate-500 uppercase">{j.nombre_categoria}</td>
                        <td className="p-4 text-center"><span className={`font-black text-sm ${j.cantidad > 0 ? 'text-green-600' : 'text-red-500'}`}>{j.cantidad ?? 0}</span></td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            {autenticado && Number(usuario?.id_rol) === 1 ? (<><button onClick={() => { setJuegoAPrestar(j); setMostrarModalPrestamo(true); }} disabled={j.cantidad <= 0} className={`p-2 rounded-lg ${j.cantidad > 0 ? 'text-amber-600 hover:bg-amber-50' : 'text-gray-300'}`}><Handshake size={18} /></button><button onClick={() => { setJuegoAEditar(j); setMostrarModal(true); }} className="p-2 text-indigo-600"><Edit3 size={18} /></button><button onClick={() => setJuegoAEliminar(j)} className="p-2 text-red-500"><Trash2 size={18} /></button></>) : (<span className="text-[9px] font-black uppercase text-slate-400">Disponible</span>)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-indigo-950 text-white pt-16 pb-8 px-10 border-t-8 border-orange-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-tighter italic">Ludoteca</h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Espacio líder en formación lúdica y desarrollo creativo mediante el juego.
            </p>
          </div>
          <div>
            <h3 className="text-orange-500 font-black uppercase text-sm tracking-widest mb-6 border-b-2 border-orange-500/20 w-fit">Enlaces Rápidos</h3>
            <ul className="space-y-3 text-indigo-100 text-sm font-medium">
              <li onClick={() => setSeccion('inicio')} className="hover:text-yellow-400 cursor-pointer transition-colors">› Inicio</li>
              <li onClick={() => setSeccion('inventario')} className="hover:text-yellow-400 cursor-pointer transition-colors">› Inventario</li>
            </ul>
          </div>
          <div>
            <h3 className="text-orange-500 font-black uppercase text-sm tracking-widest mb-6 border-b-2 border-orange-500/20 w-fit">Contacto Oficial</h3>
            <ul className="space-y-4 text-indigo-100 text-sm">
              <li className="flex items-center gap-3"><MapPin size={18} className="text-yellow-400" /> Ciudad de México, México</li>
              <li className="flex items-center gap-3"><Mail size={18} className="text-yellow-400" /> contacto@ludoteca.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-indigo-900 text-center text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
          © 2026 Ludoteca. Todos los derechos reservados.
        </div>
      </footer>
    </div> 
  );
}

export default App;