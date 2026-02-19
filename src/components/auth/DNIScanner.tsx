"use client";

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { Shield, Camera, RefreshCw, CheckCircle } from "lucide-react";

export default function DNIScanner({ onScanComplete }: { onScanComplete: (data: { name: string, dni: string }) => void }) {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsScanning(true);
        setStatus("Analizando documento...");
        
        try {
          const result = await Tesseract.recognize(imageSrc, 'spa', {
            logger: m => {
              if (m.status === 'recognizing text') {
                setStatus(`Analizando: ${Math.round(m.progress * 100)}%`);
              }
            }
          });

          // Lógica simplificada de extracción para demo
          const text = result.data.text;
          const dniMatch = text.match(/\d{7,8}[A-Z]/i) || text.match(/\d{2}\.\d{3}\.\d{3}/);
          const nameMatch = text.match(/[A-ZáéíóúÁÉÍÓÚ\s]{10,}/);

          const extractedData = {
            name: nameMatch ? nameMatch[0].trim().split('\n')[0] : "No detectado",
            dni: dniMatch ? dniMatch[0] : "No detectado"
          };

          setStatus("¡Escaneo completado!");
          setSuccess(true);
          onScanComplete(extractedData);
        } catch (error) {
          setStatus("Error en el escaneo. Intente nuevamente.");
          console.error(error);
        } finally {
          setIsScanning(false);
        }
      }
    }
  }, [webcamRef, onScanComplete]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-6 text-primary">
        <Shield size={24} />
        <h2 className="text-xl font-serif">Verificación de Identidad</h2>
      </div>

      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-6">
        {!success ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-primary/5 text-primary">
            <CheckCircle size={64} className="mb-4 animate-in zoom-in duration-300" />
            <p className="font-medium">Documento Verificado</p>
          </div>
        )}
        
        {!success && (
          <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-6 min-h-[1.25rem]">{status}</p>
        
        {!success ? (
          <button
            onClick={capture}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="animate-spin" /> : <Camera size={20} />}
            {isScanning ? "Procesando..." : "Capturar DNI"}
          </button>
        ) : (
          <button
            onClick={() => setSuccess(false)}
            className="text-primary font-medium hover:underline"
          >
            Escanear otro documento
          </button>
        )}
      </div>
    </div>
  );
}
