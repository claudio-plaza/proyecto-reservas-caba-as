"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  getAllBookings, 
  updateBookingStatus 
} from "@/lib/firebase/bookings";
import { getAllProfiles } from "@/lib/firebase/auth";
import { BookingStatus, Profile } from "@/types";
import { 
  Loader2, 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"bookings" | "users">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isAdmin, authLoading, router]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [bookingsData, profilesData] = await Promise.all([
        getAllBookings(),
        getAllProfiles(),
      ]);
      setBookings(bookingsData);
      setProfiles(profilesData);
    } catch (error) {
      console.error("Error al cargar datos de administración:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setActionLoadingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Actualizar localmente el estado de la reserva
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
    } catch (error) {
      alert("Error al actualizar el estado de la reserva");
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading || (!user || !isAdmin)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-gray-500 font-serif text-lg">Cargando panel de administración...</p>
      </div>
    );
  }

  // Cálculos estadísticos
  const totalRevenue = bookings
    .filter(b => b.status === "confirmed" || b.status === "pending_payment" || b.status === "pending_transfer")
    .reduce((acc, curr) => {
      const days = Math.round((curr.endDate.getTime() - curr.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const price = curr.cabin?.price_per_night || 0;
      return acc + (days * price);
    }, 0);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 size={14} /> Confirmada
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={14} /> Cancelada
          </span>
        );
      case "pending_payment":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={14} /> Pendiente Pago
          </span>
        );
      case "pending_transfer":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={14} /> Transf. Pendiente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            <Clock size={14} /> {status}
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-85 transition-opacity">
            <ArrowLeft size={20} />
            <span className="font-medium">Volver a la Web</span>
          </Link>
          <h1 className="text-2xl font-serif text-primary font-bold">Panel de Administración</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-10">
        {/* Tarjetas de Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Recaudación Estimada</p>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mt-1">${totalRevenue}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Reservas Registradas</p>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mt-1">{bookings.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Clientes Registrados</p>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mt-1">{profiles.length}</h3>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-4 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 px-4 font-serif text-lg relative transition-colors ${
              activeTab === "bookings" ? "text-primary font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Gestión de Reservas
            {activeTab === "bookings" && (
              <motion.div 
                layoutId="active-admin-tab" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" 
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 px-4 font-serif text-lg relative transition-colors ${
              activeTab === "users" ? "text-primary font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Clientes Registrados
            {activeTab === "users" && (
              <motion.div 
                layoutId="active-admin-tab" 
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" 
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingData ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-gray-500 font-serif">Obteniendo datos actualizados...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "bookings" ? (
                <motion.div
                  key="bookings-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 overflow-x-auto"
                >
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 font-serif">
                      Aún no se han registrado reservas en el sistema.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-sm font-semibold uppercase tracking-wider text-left">
                          <th className="pb-4">Cliente</th>
                          <th className="pb-4">DNI</th>
                          <th className="pb-4">Quinta / Cabaña</th>
                          <th className="pb-4">Fechas Reservadas</th>
                          <th className="pb-4">Duración</th>
                          <th className="pb-4">Total</th>
                          <th className="pb-4">Estado</th>
                          <th className="pb-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.map((booking) => {
                          const daysCount = Math.round((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          const totalCost = daysCount * (booking.cabin?.price_per_night || 0);
                          const isProcessing = actionLoadingId === booking.id;

                          return (
                            <tr key={booking.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                              <td className="py-5 font-medium text-gray-900">
                                {booking.profile?.full_name || "Usuario Desconocido"}
                              </td>
                              <td className="py-5 text-gray-500">
                                {booking.profile?.dni_number || "—"}
                              </td>
                              <td className="py-5 font-serif text-primary">
                                {booking.cabin?.name || "Cabaña Eliminada"}
                              </td>
                              <td className="py-5 text-sm text-gray-600">
                                {format(booking.startDate, "dd/MM/yyyy")} al {format(booking.endDate, "dd/MM/yyyy")}
                              </td>
                              <td className="py-5 text-sm text-gray-600">
                                {daysCount} {daysCount === 1 ? "día" : "días"}
                              </td>
                              <td className="py-5 font-semibold text-gray-900">
                                ${totalCost}
                              </td>
                              <td className="py-5">
                                {getStatusBadge(booking.status)}
                              </td>
                              <td className="py-5">
                                <div className="flex justify-center gap-2">
                                  {booking.status !== "confirmed" && booking.status !== "cancelled" && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(booking.id, "confirmed")}
                                        disabled={isProcessing}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                      >
                                        Confirmar
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(booking.id, "cancelled")}
                                        disabled={isProcessing}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                    </>
                                  )}
                                  {booking.status === "confirmed" && (
                                    <button
                                      onClick={() => handleStatusChange(booking.id, "cancelled")}
                                      disabled={isProcessing}
                                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                  {booking.status === "cancelled" && (
                                    <span className="text-xs text-gray-400 italic">Sin acciones</span>
                                  )}
                                  {isProcessing && <Loader2 size={16} className="animate-spin text-primary ml-1" />}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="users-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 overflow-x-auto"
                >
                  {profiles.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 font-serif">
                      Aún no hay clientes registrados en el sistema.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-sm font-semibold uppercase tracking-wider text-left">
                          <th className="pb-4">Nombre Completo</th>
                          <th className="pb-4">DNI / Documento</th>
                          <th className="pb-4">Rol</th>
                          <th className="pb-4">Fecha de Registro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {profiles.map((profile) => (
                          <tr key={profile.id} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                            <td className="py-5 font-medium text-gray-900">{profile.full_name || "Sin Nombre"}</td>
                            <td className="py-5 text-gray-500">{profile.dni_number || "—"}</td>
                            <td className="py-5">
                              {profile.is_admin ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                  Administrador
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                  Cliente
                                </span>
                              )}
                            </td>
                            <td className="py-5 text-sm text-gray-500">
                              {profile.created_at ? (
                                typeof profile.created_at.toDate === "function"
                                  ? format(profile.created_at.toDate(), "dd/MM/yyyy HH:mm")
                                  : format(new Date(profile.created_at), "dd/MM/yyyy HH:mm")
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </main>
  );
}
