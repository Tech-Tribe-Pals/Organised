import { ArrowLeft, Plus } from 'lucide-react';

interface TaskDetailsProps {
  semana: number;
  onBack: () => void;
}

const TaskDetails = ({ semana, onBack }: TaskDetailsProps) => {
  return (
    <div className="animate-fade-in">
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-gray-500 text-sm font-medium italic">Tareas</h2>
          <h1 className="text-2xl font-bold text-white">Semana {semana}</h1>
        </div>
      </header>

      <div className="bg-card-bg border border-card-border rounded-xl p-8 min-h-[400px]">
        <div className="space-y-8">
          {/* Item de Tarea con descripción larga */}
          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="h-[1px] bg-card-border w-full" />
          </div>

          {/* Placeholders de Tareas adicionales */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <span className="text-gray-600 text-sm italic">Tarea {i}...</span>
              <div className="h-[1px] bg-card-border w-full" />
            </div>
          ))}
        </div>
        
        <button className="mt-8 flex items-center gap-2 text-accent-green hover:text-green-300 transition text-sm font-medium">
          <Plus size={18} /> Añadir tarea
        </button>
      </div>
    </div>
  );
};

export default TaskDetails;