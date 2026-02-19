"use client";

import React, { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addDays, isWithinInterval, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, CreditCard, Loader2 } from "lucide-react";
import "react-day-picker/dist/style.css";

interface BookingCalendarProps {
  pricePerNight: number;
  bookedRanges: { start: Date; end: Date }[];
  onBookingConfirm: (range: DateRange) => void;
  isLoading?: boolean;
}

export default function BookingCalendar({ pricePerNight, bookedRanges, onBookingConfirm, isLoading }: BookingCalendarProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  // Fechas deshabilitadas (ya reservadas)
  const disabledDays = bookedRanges.flatMap(range => 
    eachDayOfInterval({ start: range.start, end: range.end })
  );

  const isDateBooked = (date: Date) => {
    return bookedRanges.some(range => 
      isWithinInterval(date, { start: range.start, end: range.end })
    );
  };

  const numberOfNights = selectedRange?.from && selectedRange?.to 
    ? Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = numberOfNights * pricePerNight;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6 text-primary">
        <Calendar size={24} />
        <h2 className="text-xl font-serif">Selecciona tus Fechas</h2>
      </div>

      <div className="flex justify-center mb-8">
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={setSelectedRange}
          locale={es}
          disabled={[{ before: new Date() }, ...disabledDays]}
          modifiers={{ booked: disabledDays }}
          modifiersClassNames={{
            booked: "line-through text-red-300",
            selected: "!bg-primary !text-white",
            range_middle: "!bg-primary/20",
          }}
          className="!font-sans"
          classNames={{
            day: "w-10 h-10 rounded-full transition-colors hover:bg-primary/10",
            month_caption: "font-serif text-lg mb-4",
          }}
        />
      </div>

      {selectedRange?.from && selectedRange?.to && (
        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>Check-in</span>
            <span className="font-medium text-gray-900">{format(selectedRange.from, "PPP", { locale: es })}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Check-out</span>
            <span className="font-medium text-gray-900">{format(selectedRange.to, "PPP", { locale: es })}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>${pricePerNight} x {numberOfNights} noches</span>
            <span className="font-medium text-gray-900">${totalPrice}</span>
          </div>
          <hr />
          <div className="flex justify-between text-xl font-serif">
            <span>Total</span>
            <span className="text-primary">${totalPrice}</span>
          </div>

          <button
            onClick={() => onBookingConfirm(selectedRange)}
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-medium transition-all hover:bg-opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Procesando Reserva...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Confirmar Reserva
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
