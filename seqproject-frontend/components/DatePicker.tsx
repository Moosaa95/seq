'use client';

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfToday, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    label: string;
    selectedDate: string;
    onChange: (date: string) => void;
    minDate?: string; // YYYY-MM-DD
    maxDate?: string;
    excludeDates?: string[]; // Array of YYYY-MM-DD
    placeholder?: string;
    required?: boolean;
}

export default function DatePicker({
    label,
    selectedDate,
    onChange,
    minDate,
    maxDate,
    excludeDates = [],
    placeholder = "Select date",
    required = false
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());

    const today = startOfToday();
    const min = minDate ? new Date(minDate) : null;
    const max = maxDate ? new Date(maxDate) : null;

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleSelect = (day: Date) => {
        // Check if disabled
        if (isDisabled(day)) return;

        // Check if excluded
        const dateStr = format(day, 'yyyy-MM-dd');
        if (excludeDates.includes(dateStr)) return;

        onChange(dateStr);
        setIsOpen(false);
    };

    const isDisabled = (day: Date) => {
        if (min && isBefore(day, min)) return true;
        if (max && isAfter(day, max)) return true;
        if (excludeDates.includes(format(day, 'yyyy-MM-dd'))) return true;
        return false;
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    // Calculate starting empty cells
    const startDay = days[0].getDay(); // 0-6
    const emptyDays = Array(startDay).fill(null);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                {label}
            </label>

            {/* Input Trigger */}
            <button
                type="button"
                onClick={toggle}
                className={`w-full px-4 py-3 text-left border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isOpen ? 'ring-2 ring-emerald-500 border-transparent' : 'border-gray-300'
                    } ${selectedDate ? 'text-gray-900' : 'text-gray-400'}`}
            >
                <div className="flex items-center justify-between">
                    <span>{selectedDate ? format(new Date(selectedDate), 'MMM d, yyyy') : placeholder}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar h-4 w-4 text-gray-400"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
                </div>
            </button>

            {/* Simplified Mobile-Friendly Calendar Popover */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-full max-w-[300px] left-0 right-0 sm:left-auto sm:right-auto">
                        <div className="flex items-center justify-between mb-4">
                            <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="font-bold text-gray-900">
                                {format(currentMonth, 'MMMM yyyy')}
                            </div>
                            <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-500">
                            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                            {days.map((day) => {
                                const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
                                const disabled = isDisabled(day);
                                const isExcluded = excludeDates.includes(format(day, 'yyyy-MM-dd'));

                                return (
                                    <button
                                        key={day.toISOString()}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleSelect(day)}
                                        className={`h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-emerald-600 text-white font-bold' : ''}
                            ${!isSelected && !disabled ? 'hover:bg-gray-100 text-gray-900 font-medium' : ''}
                            ${disabled ? 'text-gray-300 cursor-not-allowed line-through' : ''}
                            ${isExcluded ? 'bg-red-50 text-red-300' : ''}
                            ${isToday(day) && !isSelected ? 'text-emerald-600 font-bold' : ''}
                        `}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
