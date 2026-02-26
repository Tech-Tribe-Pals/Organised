"use client";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const CalendarWidget = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-lg">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={previousMonth}
                        className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-400" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs text-gray-500 font-medium pb-2">
                        {day}
                    </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = isCurrentMonth && day === today.getDate();

                    return (
                        <div
                            key={day}
                            className={`
                aspect-square flex items-center justify-center text-sm rounded-lg
                transition-colors cursor-pointer
                ${isToday
                                    ? 'bg-accent-green text-black font-black'
                                    : 'text-gray-300 hover:bg-white/5'
                                }
              `}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarWidget;
