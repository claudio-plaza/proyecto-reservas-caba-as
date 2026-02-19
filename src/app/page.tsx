"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cabin } from "@/types";
import { Trees, Calendar, ShieldCheck, ArrowRight, Instagram, Linkedin, Menu, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getCabins } from "@/lib/firebase/cabins";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";

export default function Home() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  useEffect(() => {
    async function loadCabins() {
      try {
        console.log("Iniciando carga de cabañas...");
        const data = await getCabins();
        console.log("Cabañas recibidas:", data);
        setCabins(data || []);
      } catch (err: any) {
        console.error("Error detallado al cargar cabañas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCabins();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-primary">Alquiler de Cabañas</h1>
          <div className="hidden md:flex items-center gap-8">
            <a href="#cabins" className="text-gray-700 hover:text-primary transition-colors">Cabañas</a>
            <a href="#features" className="text-gray-700 hover:text-primary transition-colors">Servicios</a>
            {user ? (
              <>
                <Link href="/bookings" className="text-gray-700 hover:text-primary transition-colors font-medium">
                  Mis Reservas
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-primary transition-colors font-medium cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary transition-colors font-medium">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">
                  Registrarse
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t px-6 py-4 space-y-4"
          >
            <a href="#cabins" className="block text-gray-700">Cabañas</a>
            <a href="#features" className="block text-gray-700">Servicios</a>
            <Link href="/register" className="block bg-primary text-white px-6 py-2 rounded-full text-center">
              Registrarse
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
            alt="Alquiler de Cabañas Hero"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-serif mb-6 drop-shadow-lg">Alquiler de Cabañas</h1>
          <p className="text-xl md:text-2xl font-light mb-8 opacity-90 tracking-widest">DONDE EL LUJO SE ENCUENTRA CON LA NATURALEZA</p>
          <a href="#cabins" className="inline-flex bg-primary hover:bg-opacity-90 text-white px-10 py-4 rounded-full text-lg font-medium transition-all transform hover:scale-105 shadow-2xl items-center gap-2">
            Explorar Cabañas <ArrowRight size={20} />
          </a>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          {[
            { icon: Calendar, title: "Gestión Inteligente", desc: "Calendario intuitivo con sincronización en tiempo real." },
            { icon: ShieldCheck, title: "Check-in Digital", desc: "Escaneo de DNI ultra-rápido para registros seguros." },
            { icon: Trees, title: "Ecosistema Premium", desc: "Galería curada con los más altos estándares visuales." },
          ].map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-serif mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Preview */}
      <section id="cabins" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16">Nuestras Cabañas</h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-gray-500 font-serif">Buscando refugios exclusivos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
                <p className="text-red-600 mb-2">Ups! Algo salió mal al conectar con Firebase.</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : cabins.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Trees className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-xl font-serif">Aún no hay cabañas disponibles.</p>
              <p className="text-gray-400 mt-2">Asegúrate de haber insertado los datos en Firebase.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {cabins.map((cabin, index) => (
                <motion.div 
                  key={cabin.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={cabin.image_urls[0] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"}
                      alt={cabin.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-primary font-bold">
                      ${cabin.price_per_night} <span className="text-xs font-normal">/ noche</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-serif mb-2">{cabin.name}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-2">{cabin.description}</p>
                    <Link
                      href={`/cabins/${cabin.id}`}
                      className="w-full py-3 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      Ver Disponibilidad <ArrowRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-serif mb-2">Alquiler de Cabañas</h2>
            <p className="opacity-70">El estándar de oro en gestión vacacional.</p>
          </div>
          <div className="flex gap-6">
            <Instagram className="cursor-pointer hover:text-accent transition-colors" />
            <Linkedin className="cursor-pointer hover:text-accent transition-colors" />
          </div>
          <div className="text-sm opacity-50">
            © 2026 Alquiler de Cabañas. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
