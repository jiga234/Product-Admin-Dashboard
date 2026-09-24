import ProductDetailClient from "./ProductDetailClient";

export async function generateStaticParams() {
  try {
    const res = await fetch("https://dummyjson.com/products?limit=0&select=id");
    const data = await res.json();
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      return data.products.map((p: { id: number }) => ({
        id: String(p.id),
      }));
    }
  } catch (err) {
    console.warn(
      "[generateStaticParams] Could not fetch products, using static ID fallback:",
      err
    );
  }

  // Fallback to generating 1..200
  return Array.from({ length: 200 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
