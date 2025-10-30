/**
 * File: /lib/goods.js
 * HomeFix Admin — Goods Library v1.0
 * ------------------------------------------------------------
 * Provides CRUD and upload functions for admin goods management.
 */

import { supabase } from "@/lib/supabaseClient";

// 🔹 List all goods
export async function listGoods() {
  const { data, error } = await supabase.from("goods").select("*");
  if (error) throw error;
  return data;
}

// 🔹 Create a new good
export async function createGood(payload) {
  const { data, error } = await supabase.from("goods").insert([payload])
    .select();
  if (error) throw error;
  return data[0];
}

// 🔹 Update a good
export async function updateGood(id, updates) {
  const { data, error } = await supabase.from("goods").update(updates).eq(
    "id",
    id,
  ).select();
  if (error) throw error;
  return data[0];
}

// 🔹 Delete a good
export async function deleteGood(id) {
  const { error } = await supabase.from("goods").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// 🔹 Upload image to Supabase Storage
export async function uploadGoodImage(file, path = `goods/${file.name}`) {
  const { data, error } = await supabase.storage.from("goods").upload(
    path,
    file,
  );
  if (error) throw error;
  return data?.path;
}
