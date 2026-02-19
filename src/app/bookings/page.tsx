"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  ArrowRight,
  Home,
  Loader2,
  ChevronRight,
  MapPin,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBookings } from "@/lib/firebase/bookings";
import { format, differenceInDays, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { BookingStatus } from "@/types";

type TabFilter = "all" | "active" | "pending" | "past";

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: any }> = {
  confirmed: {
    label: "Confirmada",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: CheckCircle2,
  },
  pending_payment: {
    label: "Pago Pendiente",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Clock,
  },
  pending_transfer: {
    label: "Transferencia en Verificación",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: Building2,
  },
  pending: {
    label: "Pendiente",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelada",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
  },
};

function parseBooking(raw: any) {
  const booking = { ...raw };
  
  // Dates already converted by getUserBookings
  booking.nights = 0;
  booking.totalPrice = 0;
  booking.depositAmount = 0;

  if (booking.startDate && booking.endDate && isValid(booking.startDate) && isValid(booking.endDate)) {
    booking.nights = Math.max(0, differenceInDays(booking.endDate, booking.startDate));
    booking.totalPrice = booking.nights * (booking.cabins?.price_per_night || 0);
    booking.depositAmount = booking.totalPrice * 0.25;
  }

  return booking;
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadBookings() {
      setLoading(true);
      setError(null);
      try {
        const rawData = await getUserBookings(user!.uid);
        const parsed = rawData.map(parseBooking);
        setBookings(parsed);
      } catch (err: any) {
        console.error("Error al cargar reservas:", err);
        setError(err.message || "No se pudieron cargar las reservas");
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [user, authLoading, router]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return b.status === "confirmed";
    if (activeTab === "pending") return b.status === "pending_payment" || b.status === "pending_transfer" || b.status === "pending";
    if (activeTab === "past") return b.status === "cancelled";
    return true;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => ["pending_payment", "pending_transfer", "pending"].includes(b.status)).length,
    totalSpent: bookings.filter((b) => b.status === "confirmed").reduce((sum: number, b: any) => sum + b.depositAmount, 0),
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-gray-400 text-sm">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center p-8 bg-white rounded-3xl border border-red-100 shadow-sm max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-serif text-gray-900 mb-2">Error al cargar reservas</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabFilter; label: string; count: number }[] = [
    { id: "all", label: "Todas", count: stats.total },
    { id: "active", label: "Confirmadas", count: stats.confirmed },
    { id: "pending", label: "Pendientes", count: stats.pending },
    { id: "past", label: "Canceladas", count: bookings.filter((b) => b.status === "cancelled").length },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-2 mb-6 text-gray-400 text-sm">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home size={14} /> Inicio
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">Mis Reservas</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-serif text-gray-900 mb-2">Mis Reservas</h1>
              <p className="text-gray-500">Gestiona tus reservas y revisa el estado de tus pagos.</p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-primary">{stats.confirmed}</p>
                <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Confirmadas</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Pendientes</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Señas Pagadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.id ? "text-primary" : "text-gray-400 hover:text-gray-600"}
                `}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booking List */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <AnimatePresence mode="wait">
          {filteredBookings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-gray-300" size={32} />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No hay reservas aquí</h3>
              <p className="text-gray-400 mb-8">Cuando hagas una reserva, aparecerá en esta sección.</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Explorar Cabañas <ArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredBookings.map((booking, index) => (
                <BookingCard key={booking.id} booking={booking} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function BookingCard({ booking, index }: { booking: any; index: number }) {
  const statusConfig = STATUS_CONFIG[booking.status as BookingStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={
          booking.status === "pending_payment"
            ? `/bookings/${booking.id}/checkout`
            : `/bookings/${booking.id}/confirmation`
        }
        className="block bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-56 h-44 md:h-auto shrink-0 overflow-hidden rounded-t-[1.5rem] md:rounded-l-[1.5rem] md:rounded-tr-none">
            <img
              src={booking.cabins?.image_urls?.[0] || "/placeholder.jpg"}
              alt={booking.cabins?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-serif text-gray-900 mb-1 group-hover:text-primary transition-colors">
                    {booking.cabins?.name || "Cabaña"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <MapPin size={13} />
                    <span>Valle de los Pinos</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                  <StatusIcon size={13} />
                  {statusConfig.label}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={15} className="text-gray-300" />
                  {booking.startDate && booking.endDate ? (
                    <span>
                      {format(booking.startDate, "d MMM", { locale: es })} → {format(booking.endDate, "d MMM yyyy", { locale: es })}
                    </span>
                  ) : (
                    <span>Fechas no disponibles</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={15} className="text-gray-300" />
                  <span>{booking.nights} {booking.nights === 1 ? "noche" : "noches"}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mb-0.5">Total</p>
                  <p className="text-sm font-bold text-gray-900">${booking.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mb-0.5">Seña (25%)</p>
                  <p className="text-sm font-bold text-primary">${booking.depositAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold mb-0.5">Reservado</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(booking.created_at), "d/MM/yy", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver Detalle <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
