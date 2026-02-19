"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  Wallet, 
  Building2, 
  Info,
  Loader2,
  Lock,
  ChevronRight
} from "lucide-react";
import { getBookingById, updateBookingStatus } from "@/lib/firebase/bookings";
import { format, differenceInDays, isValid } from "date-fns";
import { es } from "date-fns/locale";

type PaymentMethod = "mercadopago" | "card" | "transfer";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("mercadopago");

  useEffect(() => {
    async function loadData() {
      const data = await getBookingById(id);

      if (data) {
        // Dates already parsed by getBookingById
        data.nights = 0;
        data.totalPrice = 0;
        data.depositAmount = 0;

        if (data.startDate && data.endDate && isValid(data.startDate) && isValid(data.endDate)) {
          data.nights = Math.max(0, differenceInDays(data.endDate, data.startDate));
          data.totalPrice = data.nights * (data.cabins?.price_per_night || 0);
          data.depositAmount = data.totalPrice * 0.25;
        }

        setBooking(data);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const newStatus = selectedMethod === "transfer" ? "pending_transfer" : "confirmed";
      await updateBookingStatus(id, newStatus);
      router.push(`/bookings/${id}/confirmation`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Hubo un error al procesar el pago. Por favor intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <main className="min-h-screen bg-[#F8F9FA] py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-8 text-gray-500 text-sm">
          <Link href={`/cabins/${booking.cabin_id}`} className="hover:text-primary transition-colors">Cabaña</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Checkout</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Section */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h1 className="text-3xl font-serif mb-6 text-gray-900">Método de Pago</h1>
              
              <div className="space-y-4">
                {/* Payment Options */}
                <PaymentOption 
                  id="mercadopago"
                  active={selectedMethod === "mercadopago"}
                  onClick={() => setSelectedMethod("mercadopago")}
                  icon={<Wallet className="text-blue-500" />}
                  title="Mercado Pago"
                  description="Paga con tu cuenta de Mercado Pago o Dinero en cuenta."
                />

                <PaymentOption 
                  id="card"
                  active={selectedMethod === "card"}
                  onClick={() => setSelectedMethod("card")}
                  icon={<CreditCard className="text-purple-500" />}
                  title="Tarjeta de Débito/Crédito"
                  description="Visa, Mastercard, American Express y más."
                />

                <PaymentOption 
                  id="transfer"
                  active={selectedMethod === "transfer"}
                  onClick={() => setSelectedMethod("transfer")}
                  icon={<Building2 className="text-orange-500" />}
                  title="Transferencia Bancaria"
                  description="Confirmación manual por el dueño (24-48hs)."
                  badge="Manual"
                />
              </div>

              {selectedMethod === "transfer" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3 text-orange-800 text-sm"
                >
                  <Info size={20} className="shrink-0" />
                  <p>
                    Al elegir transferencia, tu reserva quedará en **estado pendiente** hasta que el dueño verifique el comprobante. Recibirás los datos bancarios en el siguiente paso.
                  </p>
                </motion.div>
              )}
            </section>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-medium text-lg flex items-center justify-center gap-3 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-primary/20"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Procesando...
                </>
              ) : (
                <>
                  Pagar Seña (${booking.depositAmount.toLocaleString()})
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-6 text-gray-400 text-xs py-4">
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-green-500" />
                <span>Pago Seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={14} />
                <span>Encriptación SSL</span>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <aside className="space-y-6">
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-serif mb-6">Resumen de Reserva</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={booking.cabins?.image_urls?.[0]} 
                    alt={booking.cabins?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 leading-tight mb-1">{booking.cabins?.name}</h3>
                  <p className="text-sm text-gray-500">Valle de los Pinos</p>
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estadía ({booking.nights} noches)</span>
                  <span className="text-gray-900">${booking.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Seña para reservar (25%)</span>
                  <span>-${(booking.totalPrice - booking.depositAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total a Pagar Hoy</p>
                    <p className="text-3xl font-bold text-primary">${booking.depositAmount.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                  Restante (${(booking.totalPrice - booking.depositAmount).toLocaleString()}) se abona al ingresar
                </p>
              </div>
            </section>

            <section className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
              <h3 className="font-serif text-primary mb-3">Garantía de Confianza</h3>
              <p className="text-sm text-primary/70 leading-relaxed">
                Utilizamos los estándares más altos de seguridad para proteger tus datos de pago. Tu reserva está garantizada por Alquiler de Cabañas.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PaymentOption({ id, active, onClick, icon, title, description, badge }: any) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex gap-4
        ${active ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}
      `}
    >
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
        ${active ? 'bg-white shadow-sm' : 'bg-white border border-gray-100'}
      `}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-gray-900">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 leading-snug">{description}</p>
      </div>
      {active && (
        <div className="absolute top-4 right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
}
