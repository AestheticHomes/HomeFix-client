"use client";
/**
 * File: /app/admin/content/GoodsManager.js
 * Version: v3.9 — Goods / CMS Manager 🌿
 * ---------------------------------------
 * ✅ Unified with /lib/supabaseClient
 * ✅ Search, Pagination, CSV import/export
 * ✅ Modal with scroll-lock + dark-mode polish
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit, Upload, Download } from "lucide-react";
import {
  listGoods,
  createGood,
  updateGood,
  deleteGood,
  uploadGoodImage,
} from "@/lib/goods";

export default function GoodsManager() {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    sku: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    is_active: true,
    images: [],
  });
  const perPage = 12;

  // 🔒 Scroll lock for modal
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
  }, [modalOpen]);

  // 🔄 Fetch data
  useEffect(() => {
    fetchGoods();
  }, [page, query]);

  async function fetchGoods() {
    setLoading(true);
    try {
      const { data, count } = await listGoods({ page, perPage, q: query });
      setGoods(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("❌ Fetch goods failed:", err);
      alert("Failed to load goods");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setForm({
      title: "",
      sku: "",
      description: "",
      category: "",
      price: 0,
      stock: 0,
      is_active: true,
      images: [],
    });
    setModalOpen(true);
  }

  function openEdit(g) {
    setEditing(g);
    setForm({ ...g });
    setModalOpen(true);
  }

  async function handleUploadFiles(files) {
    if (!files?.length) return;
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadGoodImage(editing?.id || "temp", file);
        urls.push(url);
      }
      setForm((s) => ({ ...s, images: [...(s.images || []), ...urls] }));
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Image upload failed");
    }
  }

  async function handleSave() {
    try {
      if (!form.title) return alert("Title is required");
      setLoading(true);
      if (editing) await updateGood(editing.id, form);
      else await createGood(form);
      setModalOpen(false);
      fetchGoods();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteGood(id);
      fetchGoods();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Delete failed");
    }
  }

  async function handleImportCSV(file) {
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => (obj[h] = cols[i]?.trim() || ""));
        return obj;
      });

      const res = await fetch("/api/goods/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      alert(`✅ Imported ${data.inserted} products successfully`);
      fetchGoods();
    } catch (err) {
      console.error("❌ CSV import failed:", err);
      alert(err.message);
    }
  }

  function handleExportCSV() {
    window.open("/api/goods/export", "_blank");
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Goods Manager
        </h1>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            placeholder="Search title or SKU"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded px-3 py-2 dark:bg-slate-800 dark:text-white transition-colors"
          />
          <Button
            onClick={() => {
              setPage(1);
              fetchGoods();
            }}
          >
            Search
          </Button>

          <label className="cursor-pointer bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Upload size={16} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportCSV(file);
              }}
            />
          </label>

          <Button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </Button>

          <Button
            onClick={openNew}
            className="bg-green-600 text-white flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goods.map((g) => (
          <div
            key={g.id}
            className="shadow-lg rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 transition-all"
          >
            <div className="h-48 w-full bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden mb-3">
              {g.images?.[0] ? (
                <img
                  src={g.images[0]}
                  alt={g.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="px-4 pb-4">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-gray-100">
                {g.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {g.category} • SKU: {g.sku}
              </p>
              <p className="text-lg font-bold text-green-600">₹{g.price}</p>

              <div className="flex gap-2 mt-3">
                <Button onClick={() => openEdit(g)}>
                  <Edit className="mr-1" size={16} /> Edit
                </Button>
                <Button
                  onClick={() => handleDelete(g.id)}
                  className="bg-red-600 text-white"
                >
                  <Trash className="mr-1" size={16} /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} • Total {total} products
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * perPage >= total}
          >
            Next
          </Button>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-[90%] max-w-2xl p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              {editing ? "Edit Product" : "Add Product"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border rounded px-3 py-2 dark:bg-slate-800 dark:text-white transition-colors"
              />
              <input
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="border rounded px-3 py-2 dark:bg-slate-800 dark:text-white transition-colors"
              />
              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border rounded px-3 py-2 dark:bg-slate-800 dark:text-white transition-colors"
              />
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                className="border rounded px-3 py-2 dark:bg-slate-800 dark:text-white transition-colors"
              />
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                }
                className="border rounded px-3 py-2 dark:bg-slate-800 dark:text-white transition-colors"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                Active
              </label>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border rounded px-3 py-2 dark:bg-slate-800 dark:text-white transition-colors col-span-2"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm mb-2 font-medium text-slate-700 dark:text-gray-300">
                Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleUploadFiles(e.target.files)}
              />
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {(form.images || []).map((u, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded overflow-hidden"
                  >
                    <img src={u} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setModalOpen(false)}
                variant="outline"
                className="bg-gray-100 dark:bg-slate-700 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-600 text-white font-semibold"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
