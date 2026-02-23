import { Dice5, Trophy, Users2 } from 'lucide-react';

// 1. Actualizamos la interface para recibir 'usuario'
interface InicioProps {
  setSeccion: (s: 'inicio' | 'inventario') => void;
  usuario: { username: string; id_rol: number } | null;
}

const Inicio = ({ usuario }: InicioProps) => {
console.log("Usuario en Inicio:", usuario);

  return (
    <div className="animate-fade-in">
      <section className="relative bg-indigo-900 rounded-[3rem] overflow-hidden mb-12 shadow-2xl min-h-125 flex items-center">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=2070" 
            alt="Ludoteca Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-indigo-950 to-transparent"></div>
        </div>

        <div className="relative z-10 p-12 lg:p-20 max-w-3xl">
          {/* 2. NOMBRE DINÁMICO: Se añade el nombre si existe usuario */}
          <h1 className="text-6xl font-black text-white leading-none mb-6 tracking-tighter uppercase">
            Bienvenido a <span className="text-yellow-400">Ludoteca</span>
            {usuario && (
              <span className="block text-4xl mt-4 text-orange-500 italic normal-case font-black tracking-normal">
                {usuario.username}
              </span>
            )}
          </h1>
          <p className="text-indigo-100 text-xl font-medium mb-10 leading-relaxed border-l-4 border-orange-500 pl-6">
            Gestionando espacios de aprendizaje y diversión. Formando mentes creativas a través del juego y la colaboración.
          </p>
        </div>
      </section>

      {/* SECCIÓN DE MISIÓN Y VISIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-l-8 border-lime-500 flex flex-col justify-center">
          <h2 className="text-3xl font-black text-indigo-950 mb-4 uppercase italic">Misión</h2>
          <p className="text-slate-600 leading-relaxed text-lg italic font-medium">
            "Fomentar el desarrollo integral de la comunidad mediante el acceso gratuito a herramientas lúdicas y juegos educativos de excelencia."
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-l-8 border-purple-500 flex flex-col justify-center">
          <h2 className="text-3xl font-black text-indigo-950 mb-4 uppercase italic">Visión</h2>
          <p className="text-slate-600 leading-relaxed text-lg italic font-medium">
            "Ser el espacio líder en la región en formación lúdica, integrando tecnología y juegos tradicionales para inspirar a las futuras generaciones."
          </p>
        </div>
      </div>

      {/* SECCIÓN DE ESTADÍSTICAS - Ajustada con rounded-4xl */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-8 rounded-4xl shadow-xl flex items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Dice5 size={32} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black uppercase opacity-80 tracking-widest">Catálogo</p>
            <p className="text-3xl font-black">+200 Juegos</p>
          </div>
        </div>

        <div className="bg-yellow-500 text-indigo-950 p-8 rounded-4xl shadow-xl flex items-center gap-6">
          <div className="bg-indigo-950/10 p-4 rounded-2xl">
            <Trophy size={32} />
          </div>
          <div>
            <p className="text-sm font-black uppercase opacity-80 tracking-widest">Torneos</p>
            <p className="text-3xl font-black">Activos</p>
          </div>
        </div>

        <div className="bg-lime-500 text-white p-8 rounded-4xl shadow-xl flex items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Users2 size={32} />
          </div>
          <div>
            <p className="text-sm font-black uppercase opacity-80 tracking-widest">Aforo</p>
            <p className="text-3xl font-black">95% Mensual</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;