import { AlertTriangle, Trash2, X } from 'lucide-react';

interface Props {
  titulo: string;
  mensaje: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ModalConfirmacion = ({ titulo, mensaje, onConfirm, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center z-60 p-4 text-left">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-pop-in border-4 border-red-600">
        <header className="bg-red-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" size={20} />
            <h2 className="font-black uppercase tracking-tighter text-lg">Confirmar Acción</h2>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
        </header>

        <div className="p-8 space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Vas a devolver:</p>
            <h3 className="text-xl font-black text-indigo-950 leading-tight">{titulo}</h3>
            <p className="text-sm text-slate-500 mt-2">{mensaje}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3 rounded-xl transition-all"
            >
              CANCELAR
            </button>
            <button 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg shadow-red-100 flex items-center justify-center gap-2 border-b-4 border-red-800 active:translate-y-1 active:border-b-0 transition-all"
            >
              <Trash2 size={18} /> Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;