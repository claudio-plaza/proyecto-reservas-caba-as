"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Cabin } from "@/types";
import { ArrowRight } from "lucide-react";

interface CabinGalleryProps {
  cabins: Cabin[];
}

export default function CabinGallery({ cabins }: CabinGalleryProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
      {cabins.map((cabin, index) => (
        <motion.div
          key={cabin.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative bg-white rounded-radius-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100"
        >
          <div className="relative h-80 overflow-hidden">
            <Image
              src={cabin.image_urls[0] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"}
              alt={cabin.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full text-primary font-bold shadow-sm">
              ${cabin.price_per_night} <span className="text-xs font-normal">/ noche</span>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-2xl font-serif mb-3 text-gray-900">{cabin.name}</h3>
            <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed">
              {cabin.description}
            </p>
            <button className="w-full group/btn relative flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-medium overflow-hidden transition-all hover:bg-opacity-95">
              <span>Reservar Ahora</span>
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
