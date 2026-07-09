"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { activities as ACTIVITIES } from "@/lib/activities-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, Check, X, Video,
  Loader2, ZoomIn, ChevronLeft, ImageIcon,
} from "lucide-react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  order: number;
}
type AllMedia = Record<string, MediaItem[]>;
type ItemForm = { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string };

export default function ActivityMediaManager({ ar }: { ar: boolean }) {
  const [allMedia, setAllMedia]   = useState<AllMedia>({});
  const [loading, setLoading]     = useState(true);
  const [activeSlug, setActiveSlug] = useState(ACTIVITIES[0]?.slug ?? "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const [forms, setForms]         = useState<Record<string, ItemForm>>({});
  const [saving, setSaving]       = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [lightbox, setLightbox]   = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function loadAll() {
    setLoading(true);
    const result: AllMedia = {};
    await Promise.all(ACTIVITIES.map(async (act) => {
      try {
        const snap = await getDocs(query(collection(db, `activityMedia/${act.slug}/items`), orderBy("order", "asc")));
        result[act.slug] = snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));
      } catch { result[act.slug] = []; }
    }));
    setAllMedia(result);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  const handleUpload = useCallback(async (slug: string, files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    let done = 0;
    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const resType = isVideo ? "video" : "image";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET);
      fd.append("folder", `activities/${slug}`);
      try {
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resType}/upload`, { method: "POST", body: fd });
        const data = await res.json();
        if (!data.secure_url) throw new Error();
        const thumbUrl = isVideo
          ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,w_400,h_250,c_fill/${data.public_id}.jpg`
          : data.secure_url;
        const current = allMedia[slug] || [];
        const payload = {
          type: resType as "image" | "video",
          url: data.secure_url, thumbUrl,
          nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
          order: current.length + done,
          createdAt: serverTimestamp(),
        };
        const ref = await addDoc(collection(db, `activityMedia/${slug}/items`), payload);
        setAllMedia(prev => ({ ...prev, [slug]: [...(prev[slug] || []), { id: ref.id, ...payload }] }));
      } catch { /* silent */ }
      done++;
      setProgress(Math.round((done / files.length) * 100));
    }
    setUploading(false);
  }, [allMedia]);

  async function handleDelete(slug: string, itemId: string) {
    if (!confirm(ar ? "هل تريد حذف هذا العنصر؟" : "Delete this item?")) return;
    setDeleting(itemId);
    await deleteDoc(doc(db, `activityMedia/${slug}/items/${itemId}`));
    setAllMedia(prev => ({ ...prev, [slug]: (prev[slug] || []).filter(m => m.id !== itemId) }));
    setDeleting(null);
  }

  async function saveItem(slug: string, itemId: string) {
    const form = forms[itemId];
    if (!form) return;
    setSaving(itemId);
    await updateDoc(doc(db, `activityMedia/${slug}/items/${itemId}`), form);
    setAllMedia(prev => ({ ...prev, [slug]: (prev[slug] || []).map(m => m.id === itemId ? { ...m, ...form } : m) }));
    setSaving(null);
  }

  function getForm(item: MediaItem): ItemForm {
    return forms[item.id] ?? {
      nameEn: item.nameEn || "",
      nameAr: item.nameAr || "",
      descriptionEn: item.descriptionEn || "",
      descriptionAr: item.descriptionAr || "",
    };
  }

  function isDirty(item: MediaItem): boolean {
    const f = forms[item.id];
    if (!f) return false;
    return f.nameEn !== (item.nameEn || "") || f.nameAr !== (item.nameAr || "")
      || f.descriptionEn !== (item.descriptionEn || "") || f.descriptionAr !== (item.descriptionAr || "");
  }

  const activity   = ACTIVITIES.find(a => a.slug === activeSlug) ?? ACTIVITIES[0];
  const items      = allMedia[activeSlug] || [];
  const Icon       = activity.icon;
  const lightboxItem = lightbox !== null ? items[lightbox] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">{ar ? "وسائط الأنشطة" : "Activity Media"}</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {loading ? "—" : `${ACTIVITIES.filter(a => (allMedia[a.slug] || []).length > 0).length}/${ACTIVITIES.length} ${ar ? "صفحات نشطة" : "pages active"}`}
        </p>
      </div>

      {/* Segmented tab bar */}
      <div className="flex gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl overflow-x-auto">
        {ACTIVITIES.map((act) => {
          const isActive = act.slug === activeSlug;
          const ActIcon  = act.icon;
          const count    = (allMedia[act.slug] || []).length;
          return (
            <button key={act.slug} onClick={() => setActiveSlug(act.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? "bg-white shadow-sm border border-gray-100 text-gray-800"
                  : "text-gray-400 hover:text-gray-600"
              }`}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: isActive ? act.gradient : "transparent" }}>
                <ActIcon className={`w-3 h-3 ${isActive ? "text-white" : "text-gray-400"}`} />
              </div>
              {ar ? act.titleAr : act.titleEn}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "text-white" : "bg-gray-200 text-gray-500"}`}
                  style={isActive ? { background: act.iconBg } : {}}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel for active activity */}
      <AnimatePresence mode="wait">
        <motion.div key={activeSlug}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="space-y-5">

          {/* Mini hero strip */}
          <div className="rounded-2xl overflow-hidden relative h-20" style={{ background: activity.gradient }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-4 w-16 h-16 rounded-full bg-white/10" />
            <div className="absolute inset-0 flex items-center px-5 gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                  {ar ? activity.typeAr : activity.typeEn}
                </span>
                <p className="text-white font-bold leading-tight">{ar ? activity.titleAr : activity.titleEn}</p>
              </div>
              <div className="ml-auto">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                  {loading ? "…" : `${items.length} ${ar ? "عنصر" : "items"}`}
                </span>
              </div>
            </div>
          </div>

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault(); setDragOver(false);
              handleUpload(activeSlug, Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/")));
            }}
            onClick={() => fileRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? "border-mauve bg-lilac/20 scale-[1.01]" : "border-gray-200 hover:border-mauve hover:bg-lilac/5"}`}
          >
            <input type="file" multiple accept="image/*,video/*" className="hidden"
              ref={fileRef}
              onChange={e => { handleUpload(activeSlug, Array.from(e.target.files || [])); e.target.value = ""; }} />
            {uploading ? (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-6 h-6 mx-auto text-mauve animate-spin" />
                <p className="text-sm text-gray-500 font-semibold">{ar ? "جاري الرفع..." : "Uploading..."} {progress}%</p>
                <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-auto">
                  <div className="h-full rounded-full transition-all duration-300" style={{ background: activity.gradient, width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-1 shadow-sm" style={{ background: activity.gradient }}>
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-700">{ar ? "اسحب الملفات هنا أو انقر للاختيار" : "Drag files here or click to browse"}</p>
                <p className="text-xs text-gray-400">{ar ? "يدعم الصور والفيديو" : "Supports images and videos"}</p>
              </div>
            )}
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {ar ? "العناصر المرفوعة" : "Uploaded Items"} · {items.length}
              </p>
              {items.map((item, i) => {
                const form  = getForm(item);
                const dirty = isDirty(item);
                return (
                  <motion.div key={item.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative cursor-pointer group"
                        onClick={() => setLightbox(i)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.thumbUrl || item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {item.type === "video" && (
                          <div className="absolute top-1.5 left-1.5 bg-black/60 rounded-lg px-1.5 py-0.5 flex items-center gap-1">
                            <Video className="w-2.5 h-2.5 text-white" />
                            <span className="text-white text-[9px] font-bold">VIDEO</span>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 text-white text-[9px] font-bold flex items-center justify-center">
                          {i + 1}
                        </div>
                      </div>

                      {/* Form fields */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Name (EN)</label>
                            <input value={form.nameEn}
                              onChange={e => setForms(p => ({ ...p, [item.id]: { ...form, nameEn: e.target.value } }))}
                              placeholder="Project name..."
                              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-mauve transition-colors font-semibold text-gray-800 bg-gray-50" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Name (AR)</label>
                            <input dir="rtl" value={form.nameAr}
                              onChange={e => setForms(p => ({ ...p, [item.id]: { ...form, nameAr: e.target.value } }))}
                              placeholder="اسم المشروع..."
                              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-mauve transition-colors font-semibold text-gray-800 bg-gray-50" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Description (EN)</label>
                            <textarea value={form.descriptionEn}
                              onChange={e => setForms(p => ({ ...p, [item.id]: { ...form, descriptionEn: e.target.value } }))}
                              placeholder="Short description..." rows={2}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-mauve transition-colors text-gray-700 bg-gray-50 resize-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Description (AR)</label>
                            <textarea dir="rtl" value={form.descriptionAr}
                              onChange={e => setForms(p => ({ ...p, [item.id]: { ...form, descriptionAr: e.target.value } }))}
                              placeholder="وصف قصير..." rows={2}
                              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-mauve transition-colors text-gray-700 bg-gray-50 resize-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="px-4 pb-3.5 flex items-center justify-between border-t border-gray-50 pt-2.5">
                      <button onClick={() => saveItem(activeSlug, item.id)}
                        disabled={!dirty || saving === item.id}
                        className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all ${dirty ? "bg-mauve text-white hover:bg-mauve/90 shadow-sm shadow-mauve/20" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}>
                        {saving === item.id
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{ar ? "حفظ..." : "Saving..."}</>
                          : <><Check className="w-3.5 h-3.5" />{ar ? "حفظ" : "Save"}</>}
                      </button>
                      <button onClick={() => handleDelete(activeSlug, item.id)} disabled={deleting === item.id}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors">
                        {deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        {ar ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {items.length === 0 && !uploading && !loading && (
            <div className="text-center py-8 text-gray-300">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{ar ? "لا يوجد محتوى بعد. ارفع أول ملف." : "No content yet. Upload the first file."}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center"
            onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            {lightbox !== null && lightbox > 0 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) - 1); }}
                className="absolute left-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="max-w-3xl w-full mx-16" onClick={e => e.stopPropagation()}>
              {lightboxItem.type === "video"
                ? <video src={lightboxItem.url} controls autoPlay className="w-full rounded-2xl max-h-[80vh]" />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={lightboxItem.url} alt="" className="w-full rounded-2xl object-contain max-h-[80vh]" />}
              {lightboxItem.nameEn && <p className="text-white text-sm font-semibold text-center mt-3">{lightboxItem.nameEn}</p>}
              <p className="text-white/30 text-xs text-center mt-1">{(lightbox ?? 0) + 1} / {items.length}</p>
            </div>
            {lightbox !== null && lightbox < items.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) + 1); }}
                className="absolute right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
