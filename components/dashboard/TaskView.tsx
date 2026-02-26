import { ArrowLeft, Plus } from 'lucide-react';
import LineChartDashboard from './LineChartDashboard';

interface TaskViewProps {
  semana: number;
  onBack: () => void;
}

export const TaskView = ({ semana, onBack }: TaskViewProps) => {
  // Simulación de datos específicos de la semana
  const weeklyData = [
    { name: 'Día 1', uv: 100, pv: 400, amt: 200 },
    { name: 'Día 3', uv: 300, pv: 200, amt: 500 },
    { name: 'Día 7', uv: 500, pv: 300, amt: 900 },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Semana {semana} <span className="text-gray-500 font-normal text-lg">/ Desempeño</span></h1>
        </div>
        <div className="text-accent-green bg-accent-green/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          En curso
        </div>
      </header>

      {/* Gráfico de la Semana */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 h-64">
        <LineChartDashboard data={weeklyData} isMini={true} />
      </div>

      {/* Contenedor de Tareas (el de tu Figma) */}
      <div className="bg-card-bg border border-card-border rounded-xl p-8 space-y-8">
        <div className="space-y-6">
          <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Tareas Detalladas</h2>
          <p className="text-gray-300 leading-relaxed italic">
            Revisar la consistencia de los componentes antes del deploy final.
          </p>
          <div className="h-px bg-card-border w-full" />
          
          {/* Items de tareas */}
          {[1, 2].map(i => (
            <div key={i} className="flex flex-col gap-4 opacity-60">
              <span className="text-gray-500 text-sm">Tarea pendiente de definición...</span>
              <div className="h-px bg-card-border w-full" />
            </div>
          ))}
        </div>

        <button className="flex items-center gap-2 text-accent-green hover:text-green-300 transition text-sm font-medium">
          <Plus size={16} /> Agregar hito a la semana
        </button>
      </div>
    </div>
  );
};