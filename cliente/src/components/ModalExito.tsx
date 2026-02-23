import { CheckCircle, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  mensaje: string;
  onClose: () => void;
}

const ModalExito = ({ mensaje, onClose }: Props) => {
  // Auto-cierre opcional para mejorar la fluidez
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-0 p-4 animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden border-b-8 border-lime-500 animate-scale-up">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-lime-100 p-4 rounded-full animate-bounce">
              <CheckCircle size={60} className="text-lime-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-indigo-950 italic mb-2 tracking-tighter">
            ¡RECIBIDO!
          </h2>
          <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
            {mensaje}
          </p>

          <button
            onClick={onClose}
            className="w-full bg-indigo-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[3px] hover:bg-indigo-900 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <PartyPopper size={16} /> CONTINUAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalExito;