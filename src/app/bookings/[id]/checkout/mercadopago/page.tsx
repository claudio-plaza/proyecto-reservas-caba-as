"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getBookingById, updateBookingStatus } from "@/lib/firebase/bookings";
import { differenceInDays, isValid } from "date-fns";
import { Loader2, ArrowLeft, CreditCard, Shield, ChevronRight } from "lucide-react";

const MercadoPagoLogo = () => (
  <svg viewBox="0 0 320 60" className="h-8 w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Isotipo: Círculo Azul y manos */}
    <circle cx="30" cy="30" r="28" fill="#009EE3"/>
    <path d="M18 33.5C21.5 28.5 25.5 26 30 26C34.5 26 38.5 28.5 42 33.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 29.5C24.5 25.5 27 23.5 30 23.5C33 23.5 35.5 25.5 38 29.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 37.5C19.5 41.5 24.5 43.5 30 43.5C35.5 43.5 40.5 41.5 45 37.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Texto */}
    <text x="75" y="41" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="30" fill="#003554">mercado</text>
    <text x="200" y="41" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="300" fontSize="30" fill="#009EE3">pago</text>
  </svg>
);

export default function MercadoPagoSimulator({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMethod = searchParams.get("method") || "mercadopago";

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simState, setSimState] = useState<"loading_gateway" | "payment_form" | "processing_payment" | "success">("loading_gateway");
  const [selectedMethod, setSelectedMethod] = useState<string>(initialMethod);

  // Carga inicial simulando la redirección externa a Mercado Pago
  useEffect(() => {
    async function loadData() {
      const data = await getBookingById(id);
      if (data) {
        data.nights = 1;
        if (data.startDate && data.endDate && isValid(data.startDate) && isValid(data.endDate)) {
          data.nights = differenceInDays(data.endDate, data.startDate) + 1;
        }
        data.totalPrice = data.nights * (data.cabins?.price_per_night || 0);
        data.depositAmount = data.totalPrice * 0.25;
        setBooking(data);
      }
      
      // Simular delay de carga de la pasarela
      setTimeout(() => {
        setSimState("payment_form");
        setLoading(false);
      }, 1500);
    }
    loadData();
  }, [id]);

  const handlePay = async () => {
    setSimState("processing_payment");
    
    // 1. Simular procesamiento del cobro bancario
    await new Promise(resolve => setTimeout(resolve, 2200));

    try {
      // 2. Guardar en la base de datos real que el pago fue exitoso y la reserva está confirmada
      await updateBookingStatus(id, "confirmed");
      setSimState("success");

      // 3. Redirigir de vuelta al sitio de Cabañas a los 3 segundos
      setTimeout(() => {
        router.push(`/bookings/${id}/confirmation`);
      }, 3000);
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
      alert("Hubo un error de conexión al procesar el pago ficticio.");
      setSimState("payment_form");
    }
  };

  if (simState === "loading_gateway" || loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F5F5F5] gap-4">
        <Loader2 className="animate-spin text-[#009EE3]" size={48} />
        <p className="text-gray-500 font-sans font-medium text-sm">Conectando de forma segura con Mercado Pago...</p>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#EDEDED] font-sans antialiased text-[#333]">
      <AnimatePresence mode="wait">
        {simState === "payment_form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen justify-between"
          >
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors"
                >
                  <ArrowLeft size={18} /> Volver
                </button>
                <MercadoPagoLogo />
                <div className="w-16"></div> {/* Spacer */}
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8 space-y-6">
              {/* Resumen del cobro */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pagar a</p>
                  <h3 className="font-bold text-gray-800 text-base mt-0.5">Quintas & Cabañas Mendoza</h3>
                  <p className="text-xs text-gray-400 mt-1">Seña de reserva - {booking.cabins?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">${booking.depositAmount.toLocaleString()}</span>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">ARS</p>
                </div>
              </div>

              {/* Opciones de Pago */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <h2 className="font-bold text-gray-800 text-lg">¿Cómo quieres pagar?</h2>
                
                <div className="space-y-3">
                  {/* Dinero en cuenta */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedMethod === "mercadopago" ? "border-[#009EE3] bg-[#009EE3]/5" : "border-gray-100 hover:border-gray-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="mp-method" 
                        checked={selectedMethod === "mercadopago"}
                        onChange={() => setSelectedMethod("mercadopago")}
                        className="w-4 h-4 text-[#009EE3] focus:ring-[#009EE3]"
                      />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Dinero en cuenta</p>
                        <p className="text-xs text-[#00a650] font-medium mt-0.5">Saldo disponible: $184.200</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">Gratis</span>
                  </label>

                  {/* Tarjeta Guardada */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedMethod === "card" ? "border-[#009EE3] bg-[#009EE3]/5" : "border-gray-100 hover:border-gray-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="mp-method" 
                        checked={selectedMethod === "card"}
                        onChange={() => setSelectedMethod("card")}
                        className="w-4 h-4 text-[#009EE3] focus:ring-[#009EE3]"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Visa Débito **** 4821</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Claudio Plaza</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">Debito</span>
                  </label>
                </div>
              </div>

              {/* Botón Pagar */}
              <button
                onClick={handlePay}
                className="w-full bg-[#009EE3] hover:bg-[#008CD0] text-white py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.99] shadow-md shadow-[#009EE3]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                Pagar ${booking.depositAmount.toLocaleString()}
              </button>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-gray-400 text-xs border-t border-gray-200 bg-white">
              <div className="max-w-5xl mx-auto flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                  <Shield size={14} className="text-[#00a650]" />
                  <span className="font-semibold text-gray-500">Tecnología de Mercado Pago de extremo a extremo</span>
                </div>
                <p>Esta es una pasarela de pago simulada con fines de prueba y demostración.</p>
              </div>
            </footer>
          </motion.div>
        )}

        {simState === "processing_payment" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen w-screen flex flex-col items-center justify-center bg-[#EDEDED] gap-4"
          >
            <Loader2 className="animate-spin text-[#009EE3]" size={56} />
            <h2 className="font-bold text-gray-800 text-lg">Procesando tu pago...</h2>
            <p className="text-gray-400 text-sm">No cierres la pestaña ni recargues la página.</p>
          </motion.div>
        )}

        {simState === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen w-screen flex flex-col items-center justify-center bg-[#00a650] text-white p-6"
          >
            {/* Animación del círculo de check de Mercado Pago */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
              <motion.svg 
                viewBox="0 0 24 24" 
                className="w-14 h-14 text-[#00a650]" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.polyline 
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </motion.svg>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold font-sans tracking-tight mb-2">¡Listo! Se acreditó tu pago</h1>
            <p className="text-white/80 font-medium text-base mb-1">Tu reserva para {booking.cabins?.name} está confirmada.</p>
            <p className="text-white/60 text-xs mt-8 flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} /> Redirigiendo de vuelta a Quintas & Cabañas Mendoza...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
