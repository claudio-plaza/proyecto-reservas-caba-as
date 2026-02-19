"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, MapPin, ArrowRight, CreditCard, Home, Building2, Info } from "lucide-react";
import { getBookingById } from "@/lib/firebase/bookings";
import { format, isValid, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      const data = await getBookingById(id);

      if (data) {
        data.totalPrice = 0;

        if (data.startDate && data.endDate && isValid(data.startDate) && isValid(data.endDate)) {
          const nights = Math.max(0, differenceInDays(data.endDate, data.startDate));
          data.totalPrice = nights * (data.cabins?.price_per_night || 0);
        }
        setBooking(data);
      }
      setLoading(false);
    }
    loadBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-serif mb-4">Reserva no encontrada</h1>
        <Link href="/" className="text-primary hover:underline flex items-center gap-2">
          <ArrowRight size={18} className="rotate-180" /> Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden"
        >
          {/* Success/Pending Banner */}
          <div className={`${booking.status === 'pending_transfer' ? 'bg-orange-500' : 'bg-primary'} p-12 text-center text-white transition-colors`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6"
            >
              {booking.status === 'pending_transfer' ? (
                <Building2 size={40} className="text-white" />
              ) : (
                <CheckCircle2 size={40} className="text-white" />
              )}
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-serif mb-4">
              {booking.status === 'pending_transfer' ? 'Reserva en Espera' : '¡Reserva Confirmada!'}
            </h1>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              {booking.status === 'pending_transfer' 
                ? 'Tu reserva está pendiente de la verificación de la transferencia bancaria.'
                : 'Tu refugio en la naturaleza te está esperando. Hemos enviado los detalles a tu correo electrónico.'}
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            {booking.status === 'pending_transfer' && (
              <section className="bg-orange-50 rounded-2xl p-6 border border-orange-100 space-y-4">
                <h3 className="text-orange-900 font-bold flex items-center gap-2">
                  <Info size={18} /> Próximos Pasos - Transferencia
                </h3>
                <div className="space-y-3 text-orange-800 text-sm">
                  <p>Por favor realiza la transferencia del 25% ($ {(booking.totalPrice * 0.25).toLocaleString()}) a los siguientes datos:</p>
                  <div className="bg-white/50 p-4 rounded-xl space-y-2 font-mono">
                    <p>CBU: 0000003100012345678901</p>
                    <p>Alias: CABAÑAS.DEL.VALLE.MP</p>
                    <p>Titular: Juan Pérez</p>
                  </div>
                  <p className="italic">Una vez realizada, envía el comprobante por WhatsApp para agilizar la confirmación.</p>
                </div>
              </section>
            )}

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Detalles del Alojamiento</h2>
                <div>
                  <h3 className="text-2xl font-serif mb-2">{booking.cabins.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={16} />
                    <span>Valle de los Pinos, Argentina</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Calendar className="text-primary" size={24} />
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Fechas</p>
                      <p className="text-gray-700">
                        {booking.startDate && booking.endDate ? (
                          <>
                            {format(booking.startDate, "d 'de' MMMM", { locale: es })} - {format(booking.endDate, "d 'de' MMMM, yyyy", { locale: es })}
                          </>
                        ) : (
                          "Fechas no disponibles"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Resumen del Pago</h2>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Estadía</span>
                    <span>${booking.totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Seña Pagada (25%)</span>
                    <span>${(booking.totalPrice * 0.25).toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-serif text-xl">Pendiente (al ingresar)</span>
                    <span className="text-2xl font-bold text-primary">${(booking.totalPrice * 0.75).toLocaleString()}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs p-2 rounded-lg ${booking.status === 'pending_transfer' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                    {booking.status === 'pending_transfer' ? <Info size={14} /> : <CreditCard size={14} />}
                    <span>{booking.status === 'pending_transfer' ? 'Pendiente de confirmación' : 'Pago procesado con éxito'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 py-4 px-8 bg-gray-900 text-white rounded-2xl font-medium text-center hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Home size={20} /> Volver al Inicio
              </Link>
              <Link
                href="/bookings"
                className="flex-1 py-4 px-8 border-2 border-primary text-primary rounded-2xl font-medium text-center hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                Ver Mis Reservas <ArrowRight size={20} />
              </Link>
            </div>
            
            <p className="text-center text-gray-400 text-sm">
              Código de confirmación: <span className="font-mono text-gray-600">#{booking.id.toString().padStart(6, '0')}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
