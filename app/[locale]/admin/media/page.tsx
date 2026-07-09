"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { activities as ACTIVITIES } from "@/lib/activities-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Upload, Trash2, Pencil, Check, X,
  Video, LogOut, Loader2, ExternalLink,
  ChevronDown, ChevronUp, ZoomIn, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl: string;
  captionEn: string;
  captionAr: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  order: number;
}

// Fields editable inline on a media item
type EditableField = "captionEn" | "captionAr" | "titleEn" | "titleAr" | "descriptionEn" | "descriptionAr";
type AllMedia = Record<string, MediaItem[]>;

export default function AdminMediaPage() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const ar = locale === "ar";

  const [allMedia, setAllMedia]         = useState<AllMedia>({});
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [uploading, setUploading]       = useState<Record<string, boolean>>({});
  const [progress, setProgress]         = useState<Record<string, number>>({});
  const [dragOver, setDragOver]         = useState<string | null>(null);
  const [editCaption, setEditCaption]   = useState<{ slug: string; id: string; field: EditableField; value: string } | null>(null);
  // project detail form: open itemId → { titleEn, titleAr, descriptionEn, descriptionAr }
  const [projectForm, setProjectForm]   = useState<Record<string, { titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string }>>({});
  const [savingProject, setSavingProject] = useState<string | null>(null);
  const [savingCaption, setSavingCaption] = useState(false);
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [lightbox, setLightbox]         = useState<{ slug: string; index: number } | null>(null);

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => { loadAll(); }, []);

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

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (slug: string, files: File[]) => {
    if (!files.length) return;
    setUploading(p => ({ ...p, [slug]: true }));
    setProgress(p => ({ ...p, [slug]: 0 }));
    let done = 0;
    for (const file of files) {
      const isVideo    = file.type.startsWith("video/");
      const resType    = isVideo ? "video" : "image";
      const formData   = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", `activities/${slug}`);
      try {
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resType}/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error();
        const thumbUrl = isVideo
          ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,w_400,h_250,c_fill/${data.public_id}.jpg`
          : data.secure_url;
        const current = allMedia[slug] || [];
        const payload = { type: resType as "image" | "video", url: data.secure_url, thumbUrl, captionEn: "", captionAr: "", titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", order: current.length + done, createdAt: serverTimestamp() };
        const ref = await addDoc(collection(db, `activityMedia/${slug}/items`), payload);
        setAllMedia(prev => ({ ...prev, [slug]: [...(prev[slug] || []), { id: ref.id, ...payload }] }));
      } catch { /* silent */ }
      done++;
      setProgress(p => ({ ...p, [slug]: Math.round((done / files.length) * 100) }));
    }
    setUploading(p => ({ ...p, [slug]: false }));
  }, [allMedia]);

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(slug: string, itemId: string) {
    if (!confirm(ar ? "هل تريد حذف هذا العنصر؟" : "Delete this item?")) return;
    setDeleting(itemId);
    await deleteDoc(doc(db, `activityMedia/${slug}/items/${itemId}`));
    setAllMedia(prev => ({ ...prev, [slug]: (prev[slug] || []).filter(m => m.id !== itemId) }));
    setDeleting(null);
  }

  // ── Save caption ──────────────────────────────────────────────────────────
  async function saveCaption() {
    if (!editCaption) return;
    setSavingCaption(true);
    await updateDoc(doc(db, `activityMedia/${editCaption.slug}/items/${editCaption.id}`), { [editCaption.field]: editCaption.value });
    setAllMedia(prev => ({
      ...prev,
      [editCaption.slug]: (prev[editCaption.slug] || []).map(m =>
        m.id === editCaption.id ? { ...m, [editCaption.field]: editCaption.value } : m
      ),
    }));
    setEditCaption(null);
    setSavingCaption(false);
  }

  async function saveProjectFields(slug: string, itemId: string) {
    const form = projectForm[itemId];
    if (!form) return;
    setSavingProject(itemId);
    await updateDoc(doc(db, `activityMedia/${slug}/items/${itemId}`), form);
    setAllMedia(prev => ({
      ...prev,
      [slug]: (prev[slug] || []).map(m => m.id === itemId ? { ...m, ...form } : m),
    }));
    setSavingProject(null);
  }

  const totalItems = Object.values(allMedia).reduce((s, arr) => s + arr.length, 0);
  const filledCount = ACTIVITIES.filter(a => (allMedia[a.slug] || []).length > 0).length;

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col" dir={ar ? "rtl" : "ltr"}>

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin`}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-mauve hover:border-mauve transition-colors">
            <ArrowLeft className={`w-4 h-4 ${ar ? "rotate-180" : ""}`} />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-none">
              {ar ? "مدير وسائط الأنشطة" : "Activity Media Manager"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {ar
                ? `${filledCount} من ${ACTIVITIES.length} صفحات تحتوي على محتوى`
                : `${filledCount} of ${ACTIVITIES.length} pages have content`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/activities`} target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-mauve border border-gray-200 hover:border-mauve px-3 py-2 rounded-xl transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            {ar ? "عرض الصفحة" : "View live"}
          </Link>
          <button onClick={async () => { await signOut(auth); router.push(`/${locale}/admin/login`); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{ar ? "خروج" : "Sign out"}</span>
          </button>
        </div>
      </header>

      {/* ── Stats strip ── */}
      <div className="bg-white border-b border-gray-100 px-6 md:px-10 py-3 flex items-center gap-6">
        {[
          { label: ar ? "إجمالي العناصر" : "Total items", value: totalItems },
          { label: ar ? "صفحات نشطة" : "Active pages",   value: filledCount },
          { label: ar ? "صفحات فارغة"  : "Empty pages",   value: ACTIVITIES.length - filledCount },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800">{loading ? "—" : value}</span>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Cards ── */}
      <main className="flex-1 p-6 md:p-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-36 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-50 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACTIVITIES.map((activity, idx) => {
              const items      = allMedia[activity.slug] || [];
              const isExpanded = expanded === activity.slug;
              const isUploading = uploading[activity.slug];
              const pct        = progress[activity.slug] ?? 0;
              const hasContent = items.length > 0;
              const Icon       = activity.icon;

              return (
                <motion.div
                  key={activity.slug}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  {/* ── Card header (gradient banner) ── */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : activity.slug)}
                    className="w-full text-left block"
                  >
                    {/* Gradient top */}
                    <div className="relative h-28 overflow-hidden" style={{ background: activity.gradient }}>
                      {/* Dot grid */}
                      <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
                      {/* Decorative circles */}
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                      <div className="absolute -bottom-10 -left-4 w-24 h-24 rounded-full bg-white/10" />
                      {/* Status pill */}
                      <div className="absolute top-3 right-3">
                        {hasContent ? (
                          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {items.length} {ar ? "عنصر" : items.length === 1 ? "item" : "items"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-black/20 backdrop-blur-sm text-white/70 text-[10px] font-medium px-2.5 py-1 rounded-full">
                            {ar ? "فارغ" : "Empty"}
                          </span>
                        )}
                      </div>
                      {/* Thumbnail strip */}
                      {hasContent && (
                        <div className="absolute bottom-3 left-4 flex gap-1.5">
                          {items.slice(0, 5).map(m => (
                            <div key={m.id} className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white/40 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={m.thumbUrl || m.url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {items.length > 5 && (
                            <div className="w-9 h-9 rounded-lg bg-black/30 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold">+{items.length - 5}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="px-5 pt-4 pb-4 flex items-center gap-4">
                      {/* Icon badge */}
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ background: activity.gradient }}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: activity.iconBg }}>
                            {ar ? activity.typeAr : activity.typeEn}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {ar ? activity.titleAr : activity.titleEn}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {ar ? activity.descAr : activity.descEn}
                        </p>
                      </div>

                      {/* Expand toggle */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isExpanded ? "bg-mauve text-white" : "bg-gray-100 text-gray-400"}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* ── Expanded panel ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 pt-1 border-t border-gray-50 space-y-5">

                          {/* Upload zone */}
                          <div
                            onDragOver={e => { e.preventDefault(); setDragOver(activity.slug); }}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={e => {
                              e.preventDefault(); setDragOver(null);
                              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
                              handleUpload(activity.slug, files);
                            }}
                            onClick={() => fileRefs.current[activity.slug]?.click()}
                            className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden ${
                              dragOver === activity.slug
                                ? "border-mauve bg-lilac/20 scale-[1.01]"
                                : "border-gray-200 hover:border-mauve hover:bg-lilac/5"
                            }`}
                          >
                            <input type="file" multiple accept="image/*,video/*" className="hidden"
                              ref={el => { fileRefs.current[activity.slug] = el; }}
                              onChange={e => {
                                handleUpload(activity.slug, Array.from(e.target.files || []));
                                e.target.value = "";
                              }} />

                            {isUploading ? (
                              <div className="py-6 px-4 text-center space-y-3">
                                <Loader2 className="w-6 h-6 mx-auto text-mauve animate-spin" />
                                <p className="text-sm text-gray-500 font-medium">{ar ? "جاري الرفع..." : "Uploading..."} {pct}%</p>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div className="h-full rounded-full" style={{ background: activity.gradient, width: `${pct}%` }} />
                                </div>
                              </div>
                            ) : (
                              <div className="py-7 px-4 flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: activity.gradient }}>
                                  <Upload className="w-5 h-5 text-white" />
                                </div>
                                <p className="font-semibold text-gray-700 text-sm">{ar ? "اسحب الملفات أو انقر للاختيار" : "Drag files or click to browse"}</p>
                                <p className="text-xs text-gray-400">{ar ? "صور أو فيديو — JPG, PNG, MP4, MOV" : "Images or videos — JPG, PNG, MP4, MOV"}</p>
                              </div>
                            )}
                          </div>

                          {/* Media / Projects list */}
                          {items.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {ar ? "المحتوى المنشور" : "Published content"} · {items.length}
                              </p>

                              {activity.type === "projects" ? (
                                /* ── Projects: card-per-item with title + description form ── */
                                <div className="space-y-4">
                                  {items.map((item, i) => {
                                    const form = projectForm[item.id] ?? { titleEn: item.titleEn || "", titleAr: item.titleAr || "", descriptionEn: item.descriptionEn || "", descriptionAr: item.descriptionAr || "" };
                                    const isDirty = form.titleEn !== (item.titleEn || "") || form.titleAr !== (item.titleAr || "") || form.descriptionEn !== (item.descriptionEn || "") || form.descriptionAr !== (item.descriptionAr || "");
                                    return (
                                      <div key={item.id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                        <div className="flex gap-4 p-4">
                                          {/* Thumbnail */}
                                          <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 relative cursor-pointer"
                                            onClick={() => setLightbox({ slug: activity.slug, index: i })}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.thumbUrl || item.url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                                              <ZoomIn className="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/40 text-white text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                                          </div>

                                          {/* Fields */}
                                          <div className="flex-1 min-w-0 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                              {[
                                                { key: "titleEn", placeholder: "Project name (EN)" },
                                                { key: "titleAr", placeholder: "اسم المشروع (AR)" },
                                              ].map(({ key, placeholder }) => (
                                                <input key={key}
                                                  value={form[key as keyof typeof form]}
                                                  onChange={e => setProjectForm(p => ({ ...p, [item.id]: { ...form, [key]: e.target.value } }))}
                                                  placeholder={placeholder}
                                                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-mauve transition-colors bg-white font-semibold"
                                                />
                                              ))}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              {[
                                                { key: "descriptionEn", placeholder: "Short description (EN)" },
                                                { key: "descriptionAr", placeholder: "وصف قصير (AR)" },
                                              ].map(({ key, placeholder }) => (
                                                <textarea key={key}
                                                  value={form[key as keyof typeof form]}
                                                  onChange={e => setProjectForm(p => ({ ...p, [item.id]: { ...form, [key]: e.target.value } }))}
                                                  placeholder={placeholder}
                                                  rows={2}
                                                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-mauve transition-colors bg-white resize-none"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="px-4 pb-3 flex items-center justify-between">
                                          <button
                                            onClick={() => saveProjectFields(activity.slug, item.id)}
                                            disabled={!isDirty || savingProject === item.id}
                                            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
                                              isDirty
                                                ? "bg-mauve text-white hover:bg-mauve/90"
                                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                            }`}
                                          >
                                            {savingProject === item.id
                                              ? <><Loader2 className="w-3 h-3 animate-spin" />{ar ? "جاري الحفظ..." : "Saving..."}</>
                                              : <><Check className="w-3 h-3" />{ar ? "حفظ" : "Save"}</>}
                                          </button>
                                          <button onClick={() => handleDelete(activity.slug, item.id)} disabled={deleting === item.id}
                                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                                            {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                            {ar ? "حذف" : "Delete"}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                /* ── Photos / Videos: thumbnail grid with hover overlay ── */
                                <div className="grid grid-cols-3 gap-2">
                                  {items.map((item, i) => (
                                    <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-video bg-gray-100 shadow-sm">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={item.thumbUrl || item.url} alt="" className="w-full h-full object-cover" />
                                      {item.type === "video" && (
                                        <div className="absolute top-1 left-1 bg-black/60 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                                          <Video className="w-2.5 h-2.5 text-white" /><span className="text-[9px] text-white font-bold">VID</span>
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                                        {editCaption?.id === item.id ? (
                                          <div className="space-y-1" onClick={e => e.stopPropagation()}>
                                            <input autoFocus value={editCaption.value}
                                              onChange={e => setEditCaption(p => p ? { ...p, value: e.target.value } : p)}
                                              className="w-full text-[10px] px-2 py-1 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 outline-none"
                                              placeholder="Caption (EN)" />
                                            <div className="flex gap-1">
                                              <button onClick={saveCaption} disabled={savingCaption}
                                                className="flex-1 flex items-center justify-center gap-1 bg-turquoise/80 text-white text-[10px] py-1 rounded-lg font-semibold">
                                                {savingCaption ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
                                                {ar ? "حفظ" : "Save"}
                                              </button>
                                              <button onClick={() => setEditCaption(null)} className="px-2 bg-white/20 text-white text-[10px] py-1 rounded-lg">
                                                <X className="w-2.5 h-2.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <button onClick={() => setEditCaption({ slug: activity.slug, id: item.id, field: "captionEn", value: item.captionEn || "" })}
                                            className="flex items-center gap-1 text-[10px] text-white/70 hover:text-white transition-colors text-left">
                                            <Pencil className="w-2.5 h-2.5 flex-shrink-0" />
                                            <span className="truncate">{item.captionEn || (ar ? "إضافة تعليق" : "Add caption")}</span>
                                          </button>
                                        )}
                                        <div className="flex items-center justify-between">
                                          <button onClick={() => setLightbox({ slug: activity.slug, index: i })}
                                            className="flex items-center gap-1 text-[10px] text-white/70 hover:text-white transition-colors">
                                            <ZoomIn className="w-2.5 h-2.5" />{ar ? "معاينة" : "Preview"}
                                          </button>
                                          <button onClick={e => { e.stopPropagation(); handleDelete(activity.slug, item.id); }} disabled={deleting === item.id}
                                            className="flex items-center gap-1 text-[10px] text-red-300 hover:text-red-100 transition-colors">
                                            {deleting === item.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Trash2 className="w-2.5 h-2.5" />}
                                            {ar ? "حذف" : "Delete"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Empty state */}
                          {items.length === 0 && !isUploading && (
                            <div className="text-center py-2">
                              <p className="text-xs text-gray-400">
                                {ar ? "ارفع أول ملف باستخدام المنطقة أعلاه." : "Upload the first file using the zone above."}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (() => {
          const items = allMedia[lightbox.slug] || [];
          const item  = items[lightbox.index];
          if (!item) return null;
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
              onClick={() => setLightbox(null)}>
              <button onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
              <div className="max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
                {item.type === "video"
                  ? <video src={item.url} controls autoPlay className="w-full rounded-2xl max-h-[80vh]" />
                  /* eslint-disable-next-line @next/next/no-img-element */
                  : <img src={item.url} alt={item.captionEn} className="w-full rounded-2xl object-contain max-h-[80vh]" />
                }
                {item.captionEn && <p className="text-white/60 text-xs text-center mt-3">{item.captionEn}</p>}
                <p className="text-white/30 text-xs text-center mt-1">{lightbox.index + 1} / {items.length}</p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
