import React from 'react';

// Component for selecting dates
const DatePicker = ({ selectedDate, onDateChange, availableDates = [] }) => {
    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Convert YYYYMMDD to YYYY-MM-DD
    const formatDateForInput = (dateString) => {
        if (!dateString || dateString.length !== 8) return '';
        return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
    };

    // Convert YYYY-MM-DD to readable format
    const formatDateForDisplay = (dateString) => {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

        return (
        <div className="date-picker">
            <div className="date-picker-header">
                <h3>Select Date</h3>
            </div>
            
            <div className="date-picker-controls">
                {/* Date Input */}
                <div className="date-input-group">
                    <label htmlFor="date-input">Choose Date:</label>
                    <input
                        id="date-input"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        max={getTodayDate()}
                        className="date-input"
                    />
                </div>

                {/* Quick Date Buttons */}
                <div className="quick-dates">
                    <button
                        onClick={() => onDateChange(getTodayDate())}
                        className={`quick-date-btn ${selectedDate === getTodayDate() ? 'active' : ''}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            onDateChange(yesterday.toISOString().split('T')[0]);
                        }}
                        className="quick-date-btn"
                    >
                        Yesterday
                    </button>
                </div>

                {/* Selected Date Display */}
                <div className="selected-date-display">
                    <strong>Selected: </strong>{formatDateForDisplay(selectedDate)}
                </div>

                {/* Available Dates Dropdown (if provided) */}
                {availableDates.length > 0 && (
                    <div className="available-dates">
                        <label htmlFor="available-dates-select">Or choose from available dates:</label>
                        <select
                            id="available-dates-select"
                            onChange={(e) => {
                                if (e.target.value) {
                                    onDateChange(formatDateForInput(e.target.value));
                                }
                            }}
                            className="available-dates-select"
                        >
                            <option value="">Select from available dates...</option>
                            {availableDates.map((dateItem) => (
                                <option key={dateItem.date.slice(0, 8)} value={dateItem.date.slice(0, 8)}>
                                    {formatDateForDisplay(formatDateForInput(dateItem.date.slice(0, 8)))}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatePicker;