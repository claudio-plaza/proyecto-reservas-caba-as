"use client";

import Image from "next/image";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import BookingCalendar from "@/components/booking/BookingCalendar";
import { MapPin, Users, Wifi, Car, Trees, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { getCabinById, getCabinBookings, createBooking } from "@/lib/firebase/bookings";
import { Cabin } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function CabinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = use(params);
  
  const [cabin, setCabin] = useState<any>(null);
  const [bookedRanges, setBookedRanges] = useState<{ start: Date; end: Date }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function loadData() {
      console.log("Cargando datos para cabaña ID:", id);
      setLoading(true);
      try {
        const cabinData = await getCabinById(id);
        console.log("Datos de la cabaña:", cabinData);
        setCabin(cabinData);

        if (cabinData) {
          try {
            const bookingsData = await getCabinBookings(id);
            console.log("Reservas encontradas:", bookingsData);
            setBookedRanges(bookingsData as { start: Date; end: Date }[]);
          } catch (bookingError) {
            console.error("Error al cargar reservas:", bookingError);
            // No bloqueamos la vista de la cabaña si fallan las reservas
          }
        }
      } catch (error) {
        console.error("Error al cargar datos de la cabaña:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBookingConfirm = async (range: DateRange) => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!range.from || !range.to) return;

    setBookingLoading(true);
    try {
      const data = await createBooking(id, user.uid, range.from, range.to, 'pending_payment');
      
      if (data) {
        router.push(`/bookings/${data.id}/checkout`);
      }
    } catch (error: any) {
      alert(error.message || "Error al realizar la reserva");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!cabin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-serif">Cabaña no encontrada</h2>
        <Link href="/" className="text-primary hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} />
            <span className="font-medium">Volver</span>
          </Link>
          <h1 className="text-2xl font-serif text-primary">Alquiler de Cabañas</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Galería de imágenes */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <motion.div 
            className="relative h-[500px] rounded-3xl overflow-hidden"
            layoutId="main-image"
          >
            <Image
              src={cabin.image_urls?.[selectedImage] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"}
              alt={cabin.name}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {(cabin.image_urls || []).slice(0, 4).map((url: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-60 rounded-2xl overflow-hidden transition-all ${
                  selectedImage === index ? "ring-4 ring-primary" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image src={url} alt={`Vista ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Información de la cabaña */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">{cabin.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <MapPin size={18} /> Valle de los Pinos, Argentina
                </span>
                <span className="flex items-center gap-2">
                  <Users size={18} /> 4 huéspedes
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {cabin.description}
            </p>

            {/* Amenidades */}
            <div>
              <h3 className="text-2xl font-serif mb-6">Comodidades</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Wifi, label: "Wi-Fi" },
                  { icon: Car, label: "Estacionamiento" },
                  { icon: Trees, label: "Jardín Privado" },
                ].map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100"
                  >
                    <amenity.icon size={24} className="text-primary" />
                    <span>{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendario de reserva (sticky) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <BookingCalendar
              pricePerNight={cabin.price_per_night}
              bookedRanges={bookedRanges}
              onBookingConfirm={handleBookingConfirm}
              isLoading={bookingLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
