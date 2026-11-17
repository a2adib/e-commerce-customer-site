import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ImageUploadZone, UploadedImage } from "./ImageUploadZone";
import { apiClient, ApiError } from "../../lib/api";

interface Category {
  id: number;
  name: string;
}

export function ProductForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    category_id: "",
    inventory: "0",
    is_featured: false,
  });

  // Load categories on mount
  useState(() => {
    apiClient<Category[]>("/api/categories").then(setCategories).catch(() => {});
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageAdd = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) {
      toast.error("Name, price, and category are required");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category_id", form.category_id);
    formData.append("inventory", form.inventory);
    formData.append("is_featured", String(form.is_featured));
    if (form.compare_at_price) formData.append("compare_at_price", form.compare_at_price);

    images.forEach((img) => formData.append("images", img.file));

    try {
      const product = await apiClient<{ name: string }>("/api/admin/products", {
        method: "POST",
        body: formData,
      });
      toast.success(`"${product.name}" created!`);
      navigate("/admin/products");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400) {
        toast.error(err.detail); // Catches Firebase quota error
      } else {
        const msg = err instanceof Error ? err.message : "Failed to create product";
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Product</h1>
        <button
          onClick={() => navigate("/admin/products")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Product name" />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="input-field resize-y"
            placeholder="Product description"
          />
        </div>

        {/* Price & Compare At */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Price *</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Compare At Price</label>
            <input name="compare_at_price" type="number" step="0.01" min="0" value={form.compare_at_price} onChange={handleChange} className="input-field" placeholder="0.00" />
          </div>
        </div>

        {/* Category & Inventory */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Category *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required className="input-field">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Inventory</label>
            <input name="inventory" type="number" min="0" value={form.inventory} onChange={handleChange} className="input-field" />
          </div>
        </div>

        {/* Featured */}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
          Featured product
        </label>

        {/* Image Upload */}
        <div>
          <label className="mb-1 block text-sm font-medium">Images</label>
          <ImageUploadZone images={images} onAdd={handleImageAdd} onRemove={handleImageRemove} />
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Creating product..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
