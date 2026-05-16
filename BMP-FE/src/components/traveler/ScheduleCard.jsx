import React from "react";
import { Controller } from "react-hook-form";
import { BsStopwatch, BsCalendarEvent, BsClock, BsArrowRepeat } from "react-icons/bs";
import TimePicker12h from "../common/TimePicker12h";

const InputField = ({ label, error, helperText, children }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-gray-500">{label}</label>}
    {children}
    {helperText && <p className={`text-xs ml-0.5 ${error ? "text-red-600" : "text-gray-500"}`}>{helperText}</p>}
  </div>
);

const TextInput = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white
      ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300"}`}
  />
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = () => new Date().toLocaleDateString("en-CA");
const currentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export default function ScheduleCard({ control, errors, watch, setValue }) {
  const [departureDate, arrivalDate, departureTime, isRecurring, recurringDays, recurringStartDate] = watch([
    "departureDate", "arrivalDate", "departureTime", "isRecurring", "recurringDays", "recurringStartDate",
  ]);

  const isSameDay = departureDate && arrivalDate && departureDate === arrivalDate;
  const arrivalMinTime = isSameDay && departureTime ? departureTime : arrivalDate === today() ? currentTime() : undefined;

  const toggleDay = (day) => {
    const current = recurringDays || [];
    setValue("recurringDays", current.includes(day) ? current.filter(d => d !== day) : [...current, day]);
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 shadow-lg">
      <div className="flex items-center gap-2 mb-4 font-bold">
        <BsStopwatch className="text-blue-600" size={18} />
        <span>Travel Schedule</span>
      </div>

      {/* Departure */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <BsCalendarEvent className="text-purple-700" size={18} />
          <span className="font-semibold">Departure Details</span>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Controller name="departureDate" control={control} render={({ field }) => (
            <InputField label="Date" error={!!errors.departureDate} helperText={errors.departureDate?.message}>
              <TextInput {...field} type="date" min={today()} error={!!errors.departureDate} />
            </InputField>
          )} />
          <Controller name="departureTime" control={control} render={({ field }) => (
            <TimePicker12h
              label="Time"
              value={field.value}
              onChange={field.onChange}
              minTime={departureDate === today() ? currentTime() : undefined}
              error={!!errors.departureTime}
              helperText={errors.departureTime?.message}
            />
          )} />
        </div>
      </div>

      {/* Arrival */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <BsClock className="text-blue-600" size={18} />
          <span className="font-semibold">Expected Arrival *</span>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Controller name="arrivalDate" control={control} render={({ field }) => (
            <InputField label="Date *" error={!!errors.arrivalDate} helperText={errors.arrivalDate?.message}>
              <TextInput {...field} type="date" min={departureDate || today()} error={!!errors.arrivalDate} />
            </InputField>
          )} />
          <Controller name="arrivalTime" control={control} render={({ field }) => (
            <TimePicker12h
              label="Time *"
              value={field.value}
              onChange={field.onChange}
              minTime={arrivalMinTime}
              error={!!errors.arrivalTime}
              helperText={errors.arrivalTime?.message}
            />
          )} />
        </div>
      </div>

      {/* Recurring */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BsArrowRepeat className="text-orange-600" size={18} />
            <div>
              <p className="font-semibold">Recurring Route</p>
              <p className="text-xs text-gray-500">Travel this route regularly?</p>
            </div>
          </div>
          <Controller name="isRecurring" control={control} render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                ${field.value ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${field.value ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          )} />
        </div>

        {isRecurring && (
          <>
            <p className="text-sm mb-2">Select Days</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-14 text-sm py-1.5 rounded-full border font-medium transition-colors
                    ${recurringDays?.includes(day)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.recurringDays && <p className="text-xs text-red-600 mb-3">{errors.recurringDays.message}</p>}

            <div className="flex flex-col md:flex-row gap-3">
              <Controller name="recurringStartDate" control={control} render={({ field }) => (
                <InputField label="Start Date *" error={!!errors.recurringStartDate} helperText={errors.recurringStartDate?.message}>
                  <TextInput {...field} type="date" min={today()} error={!!errors.recurringStartDate} />
                </InputField>
              )} />
              <Controller name="recurringEndDate" control={control} render={({ field }) => (
                <InputField label="End Date (Optional)" error={!!errors.recurringEndDate} helperText={errors.recurringEndDate?.message}>
                  <TextInput {...field} type="date" min={recurringStartDate || today()} error={!!errors.recurringEndDate} />
                </InputField>
              )} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
