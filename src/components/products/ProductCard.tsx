"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Star, Eye, Edit2, Trash2, Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const imageSrc =
    product.thumbnail ||
    (product.images && product.images.length > 0 ? product.images[0] : "");

  const getStockBadge = (stock: number) => {
    if (stock > 20) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
          {stock} in stock
        </span>
      );
    }
    if (stock > 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-500/40">
          Low: {stock} left
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-950/80 text-rose-300 border border-rose-500/40">
        Out of stock
      </span>
    );
  };

  return (
    <div className="flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700/80 transition-all duration-300 group">
      {/* Thumbnail & Badges */}
      <div className="relative w-full h-48 bg-slate-950/80 flex items-center justify-center overflow-hidden">
        {!imgFailed && imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 300px"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Package className="w-10 h-10 stroke-1" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md capitalize">
            {product.category.replace(/-/g, " ")}
          </span>
          {product.isLocal && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-indigo-600/90 text-white backdrop-blur-md">
              Local
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">{getStockBadge(product.stock)}</div>

        {/* Rating Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-700/70 text-amber-300 text-xs font-bold backdrop-blur-md shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{Number(product.rating || 0).toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-3">
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {product.brand || "Nexus Collection"}
          </span>
          <Link
            href={`/products/${product.id}`}
            className="block text-base font-semibold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1 mt-0.5"
            title={product.title}
          >
            {product.title}
          </Link>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.discountPercentage ? (
              <span className="text-[11px] text-emerald-400 font-medium -mt-0.5">
                -{Math.round(product.discountPercentage)}% off
              </span>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Link
              href={`/products/${product.id}`}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 bg-slate-800/70 hover:bg-slate-800 transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 bg-slate-800/70 hover:bg-slate-800 transition-colors"
              title="Edit product"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(product)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/70 hover:bg-slate-800 transition-colors"
              title="Delete product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
