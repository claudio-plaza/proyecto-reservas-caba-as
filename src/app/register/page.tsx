"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import DNIScanner from "@/components/auth/DNIScanner";
import { motion, AnimatePresence } from "framer-motion";
import { signUp } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "dni">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dni: "",
  });

  const handleDNIScan = (data: { name: string; dni: string }) => {
    setFormData(prev => ({
      ...prev,
      name: data.name !== "No detectado" ? data.name : prev.name,
      dni: data.dni !== "No detectado" ? data.dni : prev.dni,
    }));
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        dni: formData.dni,
      });

      setSuccess(true);
      // Opcional: Redirigir después de unos segundos
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      console.error("Error en registro:", err);
      setError(err.message || "Ocurrió un error inesperado durante el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-6">
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
          </Link>
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Únete a Alquiler de Cabañas y reserva tu escape perfecto.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
            >
              {success ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="animate-in zoom-in duration-500" />
                  </div>
                  <h2 className="text-2xl font-serif text-gray-900 mb-2">¡Bienvenido a Alquiler de Cabañas!</h2>
                  <p className="text-gray-600 mb-8">Tu cuenta ha sido creada con éxito. Redirigiendo...</p>
                  <Link href="/" className="text-primary font-medium hover:underline">
                    Ir al inicio ahora
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">⚠️</div>
                      <p>{error}</p>
                    </div>
                  )}

                  {/* DNI Scanner Button */}
                  <button
                    type="button"
                    onClick={() => setStep("dni")}
                    disabled={loading}
                    className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <User size={20} />
                    {formData.dni ? "DNI Escaneado ✓" : "Escanear DNI (Opcional)"}
                  </button>

                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Tu nombre"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* DNI Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de DNI</label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="12.345.678"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="correo@ejemplo.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-xl font-medium transition-all hover:bg-opacity-95 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Crear Cuenta <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="text-center text-gray-500 mt-6 text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="dni"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
              >
                <ArrowLeft size={18} /> Volver al formulario
              </button>
              <DNIScanner onScanComplete={handleDNIScan} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
