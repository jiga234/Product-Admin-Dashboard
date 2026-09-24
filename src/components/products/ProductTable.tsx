"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { Star, Eye, Edit2, Trash2, Package } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const { formatPrice, currencySymbol } = useCurrency();
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handleImageError = (id: number) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const getStockBadge = (stock: number) => {
    if (stock > 20) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
          {stock} in stock
        </span>
      );
    }
    if (stock > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/60 text-amber-400 border border-amber-500/30">
          Low: {stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-500/30">
        Out of stock
      </span>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          {/* Table Header */}
          <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 select-none">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">
                Product
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Category
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Price ({currencySymbol})
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Rating
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Stock
              </th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/60">
            {products.map((product) => {
              const imageSrc =
                product.thumbnail ||
                (product.images && product.images.length > 0 ? product.images[0] : "");
              const isImageFailed = failedImages[product.id] || !imageSrc;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Product Image & Title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {!isImageFailed ? (
                          <Image
                            src={imageSrc}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="48px"
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 max-w-xs">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-slate-100 hover:text-indigo-400 transition-colors truncate"
                          title={product.title}
                        >
                          {product.title}
                        </Link>
                        <span className="text-xs text-slate-400 truncate">
                          {product.brand || "Generic"}
                          {product.isLocal && (
                            <span className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Local
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/50 capitalize">
                      {product.category.replace(/-/g, " ")}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100 text-sm">
                        {formatPrice(product.price)}
                      </span>
                      {product.discountPercentage ? (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          -{Math.round(product.discountPercentage)}% off
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(product.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">{getStockBadge(product.stock)}</td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
