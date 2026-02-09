import { ChevronRight } from 'lucide-react';

interface WeeklyListProps {
  onSelectSemana: (n: number) => void;
}

export const WeeklyList = ({ onSelectSemana }: WeeklyListProps) => {
  const semanas = [4, 3, 2, 1];

  return (
    <div className="space-y-4 animate-fade-in">
      {semanas.map((n) => (
        <div 
          key={n} 
          onClick={() => onSelectSemana(n)}
          className="bg-card-bg border border-card-border rounded-xl p-6 flex justify-between items-center group hover:border-accent-green/50 cursor-pointer transition-all"
        >
          <div>
            <h3 className="text-xl font-bold">Semana {n}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              Haz clic para ver las tareas y el progreso de esta semana.
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-600 group-hover:text-accent-green transition-colors">
            <span className="text-xs italic">ver detalle</span>
            <ChevronRight size={16} />
          </div>
        </div>
      ))}
    </div>
  );
};