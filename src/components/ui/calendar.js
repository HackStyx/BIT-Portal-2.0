import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles
import './customCalendar.css'; // Import your custom styles

function CustomCalendar({ date, setDate, theme }) {
  return (
    <div className={`p-3 ${theme === 'dark' ? 'dark-calendar' : 'light-calendar'}`}>
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={({ date, view }) => {
          if (view === 'month' && date.toDateString() === new Date().toDateString()) {
            return 'highlight-today';
          }
          if (view === 'month' && date.getMonth() !== new Date().getMonth()) {
            return 'dim-other-month';
          }
          return ''; // Ensure other tiles don't have conflicting styles
        }}
      />
    </div>
  );
}

export { CustomCalendar };