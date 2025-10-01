import React from 'react';

const DatePicker = ({ selectedDate, onDateChange, availableDates = [] }) => {
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const formatDateForInput = (dateString) => {
        if (!dateString || dateString.length !== 8) return '';
        return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
    };

    const formatDateForDisplay = (dateString) => {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="date-picker flex flex-col items-center gap-3 text-white">
            {/* Quick Date Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onDateChange(getTodayDate())}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition bg-white text-indigo-600 shadow-md`}
                >
                    Today
                </button>
                <button
                    onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        onDateChange(yesterday.toISOString().split('T')[0]);
                    }}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition bg-white text-indigo-600 shadow-md`}
                >
                    Yesterday
                </button>
            </div>

            {/* Date Input */}
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                max={getTodayDate()}
                className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-60"
            />

            {/* Selected Date Display */}
            <div className="text-sm font-medium opacity-8 text-amber-700">
                Selected: <span className="font-semibold">{formatDateForDisplay(selectedDate)}</span>
            </div>

            {/* Available Dates Dropdown */}
            {availableDates.length > 0 && (
                <select
                    onChange={(e) => {
                        if (e.target.value) onDateChange(formatDateForInput(e.target.value));
                    }}
                    className="mt-1 px-3 py-1 rounded-lg bg-white text-indigo-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-60"
                >
                    <option value="">Select from available dates...</option>
                    {availableDates.map((dateItem) => (
                        <option key={dateItem.date.slice(0, 8)} value={dateItem.date.slice(0, 8)}>
                            {formatDateForDisplay(formatDateForInput(dateItem.date.slice(0, 8)))}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default DatePicker;
