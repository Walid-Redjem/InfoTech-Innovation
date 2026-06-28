"use client";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { exportCSV } from "@/lib/exportCSV";
import { formatDate } from "@/lib/formatDate";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";
import {
  Users, AlertCircle, ClipboardList, PlusCircle,
  Download, LogOut, Trash2, UserCheck, Rocket, Globe, BarChart3,
  ChevronRight, Menu, X, Search, CheckCircle2, Clock,
  FileText, Eye, Mail, ThumbsUp, ThumbsDown, ExternalLink,
  Printer, Copy, ChevronsUpDown, ChevronUp, ChevronDown,
  CalendarDays, Pencil, ImageIcon, MapPin, Star
} from "lucide-react";

type Tab = "registrations" | "issues" | "responses" | "create" | "analytics" | "activities";

interface Question {
  id: string; text: string; type: "text" | "choice" | "rating";
  options: string; required: boolean;
}


export default function AdminDashboard() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  // Persist filters in URL
  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") sp.set(key, value); else sp.delete(key);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }
  const ar = locale === "ar";

  function switchLocale() {
    const next = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "registrations", label: ar ? "التسجيلات"           : "Registrations",    icon: Users },
    { key: "issues",        label: ar ? "الإشكاليات والأفكار" : "Issues & Ideas",   icon: AlertCircle },
    { key: "responses",     label: ar ? "ردود الاستبيانات"    : "Survey Responses", icon: ClipboardList },
    { key: "analytics",     label: ar ? "الإحصائيات"          : "Analytics",        icon: BarChart3 },
    { key: "activities",    label: ar ? "الأنشطة"             : "Activities",       icon: CalendarDays },
    { key: "create",        label: ar ? "الاستبيانات"         : "Surveys",          icon: ClipboardList },
  ];

  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "registrations");
  const [surveySubTab, setSurveySubTab] = useState<"create" | "view">("create");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Registration modal
  const [selectedReg, setSelectedReg] = useState<Record<string, unknown> | null>(null);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const [registrations, setRegistrations] = useState<Record<string, unknown>[]>([]);
  const [issues, setIssues]               = useState<Record<string, unknown>[]>([]);
  const [surveys, setSurveys]             = useState<Record<string, unknown>[]>([]);
  const [responses, setResponses]         = useState<Record<string, unknown>[]>([]);
  const [allResponses, setAllResponses]   = useState<Record<string, unknown>[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<Record<string,unknown> | null>(null);
  const [activities, setActivities] = useState<Record<string,unknown>[]>([]);
  const [activityForm, setActivityForm] = useState({ title:"", titleAr:"", description:"", descriptionAr:"", date:"", category:"workshop", location:"", locationAr:"", imageUrl:"" });
  const [editingActivity, setEditingActivity] = useState<string|null>(null);
  const [savingActivity, setSavingActivity] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [catFilter, setCatFilter]       = useState(searchParams.get("cat") || "all");
  const [regStatusFilter, setRegStatusFilter] = useState(searchParams.get("regStatus") || "all");
  const [typeFilter, setTypeFilter]     = useState(searchParams.get("type") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery]   = useState(searchParams.get("q") || "");
  const [regPage, setRegPage]           = useState(0);
  const PAGE_SIZE                       = 10;
  const [sortField, setSortField]       = useState<string>("createdAt");
  const [sortDir, setSortDir]           = useState<"asc"|"desc">("desc");
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading]   = useState(false);
  const [copiedLink, setCopiedLink]     = useState(false);

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-mauve" /> : <ChevronDown className="w-3 h-3 text-mauve" />;
  }

  async function bulkApprove() {
    if (!selectedIds.size) return;
    setBulkLoading(true);
    await Promise.all([...selectedIds].map(id =>
      updateDoc(doc(db, "registrations", id), { status: "approved" })
    ));
    setRegistrations(prev => prev.map(r => selectedIds.has(String(r.id)) ? { ...r, status: "approved" } : r));
    setSelectedIds(new Set());
    setBulkLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handlePrint() { window.print(); }

  const [overviewStats, setOverviewStats] = useState({ registrations: 0, issues: 0, surveys: 0, responses: 0 });
  const [loading, setLoading] = useState(true);

  // Create survey state
  const [surveyTitle, setSurveyTitle]     = useState("");
  const [surveyDesc, setSurveyDesc]       = useState("");
  const [surveyContext, setSurveyContext] = useState("general");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "q1", text: "", type: "text", options: "", required: true },
  ]);
  const [creating, setCreating]           = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [notifyUsers, setNotifyUsers]     = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
    const [regSnap, issSnap, surSnap, resSnap, actSnap] = await Promise.all([
      getDocs(collection(db, "registrations")),
      getDocs(collection(db, "issues")),
      getDocs(collection(db, "surveys")),
      getDocs(collection(db, "surveyResponses")),
      getDocs(collection(db, "activities")),
    ]);
    const regs = regSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const iss  = issSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const surs = surSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const res  = resSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const acts = actSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setRegistrations(regs); setIssues(iss); setSurveys(surs); setAllResponses(res); setActivities(acts);
    setOverviewStats({ registrations: regs.length, issues: iss.length, surveys: surs.length, responses: res.length });
    } finally {
      setLoading(false);
    }
  }

  async function fetchResponses(surveyId: string) {
    const snap = await getDocs(collection(db, "surveyResponses"));
    setResponses(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => (r as Record<string,unknown>).surveyId === surveyId));
  }

  async function handleLogout() {
    await signOut(auth);
    router.push(`/${locale}/admin/login`);
  }

  async function handleReview(action: "approve" | "reject") {
    if (!selectedReg) return;
    setActionLoading(action);
    try {
      await fetch("/api/review-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_API_SECRET || "" },
        body: JSON.stringify({
          registrationId: String(selectedReg.id),
          action,
          email: String(selectedReg.email),
          name: String(selectedReg.name || selectedReg.institution_name || ""),
          locale: String(selectedReg.locale || "en"),
          reason: action === "reject" ? rejectionReason : undefined,
        }),
      });
      // Remove from local state immediately
      setRegistrations(prev => prev.filter(r => r.id !== selectedReg.id));
      setOverviewStats(prev => ({ ...prev, registrations: prev.registrations - 1 }));
      setSelectedReg(null);
      setRejectionReason("");
      setShowRejectionInput(false);
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleSurveyActive(surveyId: string, currentActive: boolean) {
    await updateDoc(doc(db, "surveys", surveyId), { active: !currentActive });
    setSurveys(prev => prev.map(s => String(s.id) === surveyId ? { ...s, active: !currentActive } : s));
  }

  function addQuestion() {
    setQuestions(prev => [...prev, { id: `q${prev.length + 1}`, text: "", type: "text", options: "", required: true }]);
  }

  function updateQuestion(i: number, field: keyof Question, value: unknown) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }

  async function handleCreateSurvey(e: React.FormEvent) {
    e.preventDefault();
    if (!surveyTitle.trim() || questions.some(q => !q.text.trim())) return;
    setCreating(true);
    try {
      await addDoc(collection(db, "surveys"), {
        title: surveyTitle, description: surveyDesc, context: surveyContext, active: true,
        questions: questions.map(q => ({
          id: q.id, text: q.text, type: q.type, required: q.required,
          ...(q.type === "choice" && { options: q.options.split(",").map(o => o.trim()).filter(Boolean) }),
        })),
        createdAt: serverTimestamp(),
      });
      setCreateSuccess(true);
      if (notifyUsers) {
        fetch("/api/notify-survey", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_API_SECRET || "" },
          body: JSON.stringify({ surveyTitle, surveyDesc }),
        });
      }
      setSurveyTitle(""); setSurveyDesc(""); setSurveyContext("general");
      setNotifyUsers(false);
      setQuestions([{ id: "q1", text: "", type: "text", options: "", required: true }]);
      fetchAll();
      setTimeout(() => setCreateSuccess(false), 3000);
    } finally { setCreating(false); }
  }

  async function toggleIssueStatus(issueId: string, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await updateDoc(doc(db, "issues", issueId), { status: newStatus });
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: newStatus } : i));
  }

  const allFilteredRegs = useMemo(() => {
    let result = catFilter === "all" ? registrations : registrations.filter(r => r.category === catFilter);
    if (regStatusFilter !== "all") result = result.filter(r => (r.status || "pending") === regStatusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        String(r.name || r.institution_name || "").toLowerCase().includes(q) ||
        String(r.email || "").toLowerCase().includes(q) ||
        String(r.category || "").toLowerCase().includes(q) ||
        String(r.phone || "").toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const av = String(a[sortField] ?? "");
      const bv = String(b[sortField] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return result;
  }, [registrations, catFilter, regStatusFilter, searchQuery, sortField, sortDir]);

  const filteredRegs = useMemo(() =>
    allFilteredRegs.slice(regPage * PAGE_SIZE, (regPage + 1) * PAGE_SIZE),
    [allFilteredRegs, regPage]
  );
  const totalRegPages = Math.ceil(allFilteredRegs.length / PAGE_SIZE);

  const filteredIssues = useMemo(() => {
    return issues
      .filter(r => typeFilter === "all" || r.type === typeFilter)
      .filter(r => statusFilter === "all" || (r.status || "pending") === statusFilter);
  }, [issues, typeFilter, statusFilter]);

  const analytics = useMemo(() => {
    const totalRegs    = registrations.length;
    const approvedRegs = registrations.filter(r => r.status === "approved").length;
    const pendingRegs  = registrations.filter(r => (r.status || "pending") === "pending").length;
    const totalIssues  = issues.length;
    const doneIssues   = issues.filter(r => r.status === "done").length;

    // Category breakdown
    const byCategory = (["youth", "teacher", "institution"] as const).map(cat => {
      const count = registrations.filter(r => r.category === cat).length;
      return { key: cat, count, pct: totalRegs > 0 ? Math.round((count / totalRegs) * 100) : 0 };
    });

    // Monthly trend — last 6 months
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString("en", { month: "short" }),
        count: 0,
      };
    });
    registrations.forEach(r => {
      const ts = r.createdAt;
      if (!ts) return;
      let date: Date;
      if (typeof (ts as { toDate?: unknown }).toDate === "function") {
        date = (ts as { toDate: () => Date }).toDate();
      } else if (typeof ts === "string" || typeof ts === "number") {
        date = new Date(ts);
      } else return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const m = months.find(mo => mo.key === key);
      if (m) m.count++;
    });

    // Locale split
    const arCount = registrations.filter(r => r.locale === "ar").length;
    const enCount = registrations.filter(r => r.locale !== "ar").length;

    // Issues by type
    const issueTypes = ["education","environment","youth","technology","health","other"].map(type => ({
      type,
      count: issues.filter(r => r.type === type).length,
      pct: totalIssues > 0 ? Math.round((issues.filter(r => r.type === type).length / totalIssues) * 100) : 0,
    })).filter(t => t.count > 0);

    // Issues by affected group
    const affectedGroups: Record<string, number> = {};
    issues.forEach(r => {
      const g = String(r.affected_group || "Other");
      affectedGroups[g] = (affectedGroups[g] || 0) + 1;
    });

    // Survey engagement
    const surveyEngagement = surveys.map(s => ({
      id: String(s.id),
      title: String(s.title),
      context: String(s.context || "general"),
      responseCount: allResponses.filter(r => r.surveyId === s.id).length,
    }));

    // Recent activity — last 8 across all collections
    type ActivityItem = { type: "reg" | "issue" | "response"; label: string; date: Date | null; color: string };
    const toDate = (ts: unknown): Date | null => {
      if (!ts) return null;
      if (typeof (ts as { toDate?: unknown }).toDate === "function") return (ts as { toDate: () => Date }).toDate();
      if (typeof ts === "string" || typeof ts === "number") return new Date(ts);
      return null;
    };
    const activity: ActivityItem[] = [
      ...registrations.map(r => ({ type: "reg" as const, label: String(r.name || r.institution_name || r.email || "—"), date: toDate(r.createdAt), color: "#9B6B9B" })),
      ...issues.map(r => ({ type: "issue" as const, label: String(r.title || "Issue"), date: toDate(r.createdAt), color: "#f97316" })),
      ...allResponses.map(r => ({ type: "response" as const, label: "Survey response", date: toDate(r.createdAt), color: "#6366f1" })),
    ].filter(a => a.date !== null).sort((a, b) => b.date!.getTime() - a.date!.getTime()).slice(0, 8);

    return {
      totalRegs, approvedRegs, pendingRegs, totalIssues, doneIssues,
      approvalRate: totalRegs > 0 ? Math.round((approvedRegs / totalRegs) * 100) : 0,
      doneRate: totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0,
      byCategory, months, arCount, enCount, issueTypes, affectedGroups, surveyEngagement, activity,
    };
  }, [registrations, issues, surveys, allResponses]);

  const overviewCards = [
    { label: ar ? "التسجيلات"   : "Registrations", value: overviewStats.registrations, icon: UserCheck, color: "#9B6B9B", bg: "bg-purple-50" },
    { label: ar ? "الإشكاليات"  : "Issues Filed",  value: overviewStats.issues,        icon: Rocket,    color: "#f97316", bg: "bg-orange-50" },
    { label: ar ? "الاستبيانات" : "Surveys",        value: overviewStats.surveys,       icon: BarChart3, color: "#2EC4B6", bg: "bg-teal-50" },
    { label: ar ? "الردود"      : "Responses",      value: overviewStats.responses,     icon: Globe,     color: "#6366f1", bg: "bg-indigo-50" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={ar ? "rtl" : "ltr"}>

      {/* ── TOP HEADER ── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 rounded-lg text-mauve hover:bg-lilac transition-colors"
            onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Image src="/logo.png" alt="InfoTech" width={44} height={44} className="object-contain" />
          <div>
            <p className="font-bold text-gray-800 text-sm leading-none">InfoTech Innovation</p>
            <p className="text-xs text-mauve font-medium">{ar ? "لوحة التحكم" : "Admin Dashboard"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={switchLocale}
            className="text-sm font-semibold px-3 py-1.5 rounded-full border-2 border-mauve text-mauve hover:bg-mauve hover:text-white transition-colors">
            {ar ? "EN" : "عربي"}
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">{ar ? "خروج" : "Sign out"}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          <aside className={`
            fixed md:static top-0 left-0 h-full md:h-auto z-30 md:z-auto
            w-60 bg-white border-r border-gray-100 flex flex-col
            transition-transform duration-300 md:translate-x-0 md:flex
            ${sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
            pt-16 md:pt-0
          `}>
            <nav className="p-4 space-y-1 flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">{ar ? "القائمة" : "Navigation"}</p>
              {tabs.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => { setTab(key); updateParam("tab", key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    tab === key
                      ? "bg-gradient-to-r from-mauve to-mauve/80 text-white shadow-md shadow-mauve/20"
                      : "text-gray-500 hover:bg-lilac/50 hover:text-mauve"
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {tab === key && <ChevronRight className="w-4 h-4 ms-auto" />}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <div className="bg-gradient-to-br from-lilac to-white rounded-2xl p-4 text-center">
                <p className="text-xs text-mauve font-semibold">InfoTech Innovation</p>
                <p className="text-xs text-gray-400 mt-0.5">{ar ? "بوابة الإدارة" : "Admin Portal v1.0"}</p>
              </div>
            </div>
          </aside>
        </>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-auto p-4 md:p-8">

          {/* Overview stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {overviewCards.map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className={`${card.bg} rounded-2xl p-5 border border-white shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</span>
                  <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Tab content */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3 animate-pulse">
              {[100, 80, 95, 70, 85].map((w, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-4 bg-gray-200 rounded-full flex-1" style={{ maxWidth: `${w}%` }} />
                  <div className="h-4 w-16 bg-gray-200 rounded-full" />
                  <div className="h-4 w-20 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className={loading ? "hidden" : ""}>

              {/* ── REGISTRATIONS ── */}
              {tab === "registrations" && (
                <Section title={ar ? "التسجيلات" : "Registrations"} count={allFilteredRegs.length}
                  onExport={() => exportCSV(allFilteredRegs as Record<string,unknown>[], "registrations")}
                  exportLabel={ar ? "تصدير CSV" : "Export CSV"}
                  extraActions={
                    <div className="flex gap-2">
                      <Tooltip label={ar ? "نسخ رابط الصفحة" : "Copy page URL"}>
                        <button onClick={copyLink} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-mauve hover:text-mauve transition-colors bg-white shadow-sm">
                          <Copy className="w-3.5 h-3.5" />{copiedLink ? (ar ? "تم النسخ!" : "Copied!") : (ar ? "نسخ الرابط" : "Copy link")}
                        </button>
                      </Tooltip>
                      <Tooltip label={ar ? "طباعة قائمة التسجيلات" : "Print registrations list"}>
                        <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-mauve hover:text-mauve transition-colors bg-white shadow-sm">
                          <Printer className="w-3.5 h-3.5" />{ar ? "طباعة" : "Print"}
                        </button>
                      </Tooltip>
                    </div>
                  }
                  filter={
                    <div className="flex gap-2 flex-wrap">
                      <Select value={catFilter} onChange={v => { setCatFilter(v); updateParam("cat", v); setRegPage(0); }} options={[
                        { value: "all",         label: ar ? "جميع الفئات"  : "All categories" },
                        { value: "youth",       label: ar ? "شباب"         : "Youth" },
                        { value: "teacher",     label: ar ? "معلمون"       : "Teachers" },
                        { value: "institution", label: ar ? "مؤسسات"       : "Institutions" },
                      ]} />
                      <Select value={regStatusFilter} onChange={v => { setRegStatusFilter(v); updateParam("regStatus", v); setRegPage(0); }} options={[
                        { value: "all",      label: ar ? "جميع الحالات" : "All statuses" },
                        { value: "pending",  label: ar ? "قيد المراجعة" : "Pending" },
                        { value: "approved", label: ar ? "مقبول"        : "Approved" },
                      ]} />
                    </div>
                  }
                  searchQuery={searchQuery}
                  onSearch={v => { setSearchQuery(v); updateParam("q", v); setRegPage(0); }}
                  searchPlaceholder={ar ? "ابحث بالاسم أو البريد..." : "Search by name or email..."}
                >
                  {/* Bulk action bar */}
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 mb-3 bg-mauve/10 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-semibold text-mauve">{selectedIds.size} {ar ? "محدد" : "selected"}</span>
                      <button onClick={bulkApprove} disabled={bulkLoading}
                        className="flex items-center gap-1.5 text-xs bg-turquoise text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-turquoise-dark transition-colors disabled:opacity-60">
                        <CheckCircle2 className="w-3.5 h-3.5" />{ar ? "قبول الكل" : "Approve all"}
                      </button>
                      <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-gray-600 ms-auto">
                        {ar ? "إلغاء التحديد" : "Deselect all"}
                      </button>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-4 py-3.5 w-10">
                              <input type="checkbox" className="accent-mauve"
                                checked={filteredRegs.length > 0 && filteredRegs.every(r => selectedIds.has(String(r.id)))}
                                onChange={e => {
                                  if (e.target.checked) setSelectedIds(new Set(filteredRegs.map(r => String(r.id))));
                                  else setSelectedIds(new Set());
                                }} />
                            </th>
                            {[
                              { label: ar ? "الاسم" : "Name", field: "name" },
                              { label: ar ? "البريد" : "Email", field: "email" },
                              { label: ar ? "الهاتف" : "Phone", field: "phone" },
                              { label: ar ? "الفئة" : "Category", field: "category" },
                              { label: ar ? "التاريخ" : "Date", field: "createdAt" },
                              { label: "", field: "" },
                            ].map(({ label, field }) => (
                              <th key={label} onClick={() => field && toggleSort(field)}
                                className={`text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${field ? "cursor-pointer hover:text-mauve select-none" : ""}`}>
                                <span className="inline-flex items-center gap-1">{label}{field && <SortIcon field={field} />}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRegs.length === 0 ? (
                            <tr><td colSpan={7} className="py-16 text-center text-gray-400 text-sm">{ar ? "لا توجد تسجيلات." : "No registrations yet."}</td></tr>
                          ) : filteredRegs.map((r, i) => (
                            <motion.tr key={String(r.id)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                              className="border-b border-gray-50 hover:bg-lilac/20 transition-colors">
                              <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                <input type="checkbox" className="accent-mauve"
                                  checked={selectedIds.has(String(r.id))}
                                  onChange={e => setSelectedIds(prev => { const n = new Set(prev); e.target.checked ? n.add(String(r.id)) : n.delete(String(r.id)); return n; })} />
                              </td>
                              <td className="px-5 py-3.5 font-medium text-gray-700">{String(r.name || r.institution_name || "—")}</td>
                              <td className="px-5 py-3.5 text-gray-500">{String(r.email || "—")}</td>
                              <td className="px-5 py-3.5 text-gray-500">{String(r.phone || "—")}</td>
                              <td className="px-5 py-3.5">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorMap[String(r.category || "")] || "bg-gray-100 text-gray-600"}`}>{String(r.category || "—")}</span>
                              </td>
                              <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{formatDate(r.createdAt)}</td>
                              <td className="px-5 py-3.5">
                                <button onClick={() => setSelectedReg(r)} className="inline-flex items-center gap-1 text-xs font-semibold text-mauve bg-lilac px-3 py-1.5 rounded-full hover:bg-lilac-dark transition-colors">
                                  <Eye className="w-3 h-3" /> {ar ? "عرض" : "View"}
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {totalRegPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-400">
                        {ar
                          ? `${regPage * PAGE_SIZE + 1}–${Math.min((regPage + 1) * PAGE_SIZE, allFilteredRegs.length)} من ${allFilteredRegs.length}`
                          : `${regPage * PAGE_SIZE + 1}–${Math.min((regPage + 1) * PAGE_SIZE, allFilteredRegs.length)} of ${allFilteredRegs.length}`}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setRegPage(p => p - 1)} disabled={regPage === 0}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-mauve hover:text-mauve transition-colors disabled:opacity-40">
                          {ar ? "السابق" : "Prev"}
                        </button>
                        <button onClick={() => setRegPage(p => p + 1)} disabled={regPage >= totalRegPages - 1}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:border-mauve hover:text-mauve transition-colors disabled:opacity-40">
                          {ar ? "التالي" : "Next"}
                        </button>
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* ── ISSUES ── */}
              {tab === "issues" && (
                <Section title={ar ? "الإشكاليات والأفكار" : "Issues & Ideas"} count={filteredIssues.length}
                  onExport={() => exportCSV(filteredIssues as Record<string,unknown>[], "issues")}
                  exportLabel={ar ? "تصدير CSV" : "Export CSV"}
                  filter={
                    <div className="flex gap-2 flex-wrap">
                      <Select value={typeFilter} onChange={setTypeFilter} options={[
                        { value: "all", label: ar ? "جميع الأنواع" : "All types" },
                        ...["education","environment","youth","technology","health","other"].map(t => ({ value: t, label: t.charAt(0).toUpperCase()+t.slice(1) }))
                      ]} />
                      <Select value={statusFilter} onChange={setStatusFilter} options={[
                        { value: "all",     label: ar ? "جميع الحالات" : "All statuses" },
                        { value: "pending", label: ar ? "قيد المعالجة" : "Pending" },
                        { value: "done",    label: ar ? "تم" : "Done" },
                      ]} />
                    </div>
                  }>
                  {/* Issues with status toggle */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {filteredIssues.length === 0 ? (
                      <div className="py-16 text-center text-gray-400 text-sm">{ar ? "لا توجد إشكاليات بعد." : "No issues yet."}</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                              {(ar ? ["العنوان","النوع","الفئة المعنية","التاريخ","الحالة"] : ["Title","Type","Affected Group","Date","Status"]).map(h => (
                                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredIssues.map((r, i) => {
                              const isDone = (r.status || "pending") === "done";
                              return (
                                <motion.tr key={String(r.id)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                  className="border-b border-gray-50 hover:bg-lilac/20 transition-colors">
                                  <td className="px-5 py-3.5 text-gray-700 font-medium max-w-[200px] truncate">{String(r.title || "—")}</td>
                                  <td className="px-5 py-3.5 text-gray-500">{String(r.type || "—")}</td>
                                  <td className="px-5 py-3.5 text-gray-500">{String(r.affected_group || "—")}</td>
                                  <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{formatDate(r.createdAt)}</td>
                                  <td className="px-5 py-3.5">
                                    <button onClick={() => toggleIssueStatus(String(r.id), String(r.status || "pending"))}
                                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                                        isDone
                                          ? "bg-turquoise/10 text-turquoise hover:bg-turquoise/20"
                                          : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                      }`}>
                                      {isDone
                                        ? <><CheckCircle2 className="w-3.5 h-3.5" />{ar ? "تم" : "Done"}</>
                                        : <><Clock className="w-3.5 h-3.5" />{ar ? "قيد المعالجة" : "Pending"}</>
                                      }
                                    </button>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* ── RESPONSES ── */}
              {tab === "responses" && (
                <div>
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{ar ? "ردود الاستبيانات" : "Survey Responses"}</h2>
                    {responses.length > 0 && (
                      <button onClick={() => {
                        const rows = responses.map(r => ({ ...((r.answers as Record<string,unknown>) || {}), date: formatDate(r.createdAt) }));
                        exportCSV(rows, `responses-${selectedSurvey}`);
                      }} className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-mauve hover:text-mauve transition-colors text-gray-500 shadow-sm">
                        <Download className="w-4 h-4" /> {ar ? "تصدير CSV" : "Export CSV"}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-6">{ar ? "اختر استبياناً لعرض ردوده" : "Select a survey to view its responses"}</p>
                  <Select value={selectedSurvey} onChange={v => { setSelectedSurvey(v); if (v) fetchResponses(v); }}
                    options={[{ value: "", label: ar ? "اختر استبياناً..." : "Select a survey..." }, ...surveys.map(s => ({ value: String(s.id), label: String(s.title) }))]}
                    className="max-w-sm mb-6"
                  />
                  {selectedSurvey && responses.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">{ar ? "لا توجد ردود بعد لهذا الاستبيان." : "No responses yet for this survey."}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {responses.map((resp, i) => {
                      const answerCount = resp.answers && typeof resp.answers === "object" ? Object.keys(resp.answers as object).length : 0;
                      return (
                        <motion.button
                          key={String(resp.id)}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          onClick={() => setSelectedResponse(resp)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start hover:bg-lilac/20 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center text-xs font-bold text-mauve shrink-0">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-gray-700">{ar ? `رد #${i + 1}` : `Response #${i + 1}`}</p>
                              <p className="text-xs text-gray-400">{answerCount} {ar ? "إجابة" : "answers"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-gray-400">{formatDate(resp.createdAt)}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── ACTIVITIES ── */}
              {tab === "activities" && (
                <div>
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{ar ? "الأنشطة" : "Activities"}</h2>
                      <p className="text-sm text-gray-400">{activities.length} {ar ? "نشاط" : "activities"}</p>
                    </div>
                    <button onClick={() => { setShowActivityForm(true); setEditingActivity(null); setActivityForm({ title:"", titleAr:"", description:"", descriptionAr:"", date:"", category:"workshop", location:"", locationAr:"", imageUrl:"" }); }}
                      className="flex items-center gap-2 bg-gradient-to-r from-mauve to-turquoise text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-mauve/20">
                      <PlusCircle className="w-4 h-4" />{ar ? "إضافة نشاط" : "Add Activity"}
                    </button>
                  </div>

                  {/* Activity form */}
                  {showActivityForm && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
                      <h3 className="font-bold text-gray-700">{editingActivity ? (ar ? "تعديل النشاط" : "Edit Activity") : (ar ? "نشاط جديد" : "New Activity")}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Title (EN)", key: "title" }, { label: "العنوان (AR)", key: "titleAr" },
                          { label: "Description (EN)", key: "description" }, { label: "الوصف (AR)", key: "descriptionAr" },
                          { label: "Location (EN)", key: "location" }, { label: "الموقع (AR)", key: "locationAr" },
                          { label: "Date", key: "date" }, { label: "Image URL (Cloudinary)", key: "imageUrl" },
                        ].map(({ label, key }) => (
                          <div key={key}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                            <input value={(activityForm as Record<string,string>)[key] || ""} onChange={e => setActivityForm(p => ({ ...p, [key]: e.target.value }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-mauve transition-colors" />
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                          <select value={activityForm.category} onChange={e => setActivityForm(p => ({ ...p, category: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-mauve transition-colors">
                            {["workshop","event","competition","training","other"].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button disabled={savingActivity} onClick={async () => {
                          if (!activityForm.title.trim()) return;
                          setSavingActivity(true);
                          try {
                            if (editingActivity) {
                              await updateDoc(doc(db, "activities", editingActivity), { ...activityForm, active: true });
                              setActivities(prev => prev.map(a => a.id === editingActivity ? { ...a, ...activityForm } : a));
                            } else {
                              const ref = await addDoc(collection(db, "activities"), { ...activityForm, active: true, createdAt: serverTimestamp() });
                              setActivities(prev => [...prev, { id: ref.id, ...activityForm, active: true }]);
                            }
                            setShowActivityForm(false); setEditingActivity(null);
                          } finally { setSavingActivity(false); }
                        }} className="bg-mauve text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-mauve-dark transition-colors disabled:opacity-60">
                          {savingActivity ? "Saving…" : (editingActivity ? (ar ? "حفظ التعديلات" : "Save Changes") : (ar ? "نشر النشاط" : "Publish Activity"))}
                        </button>
                        <button onClick={() => setShowActivityForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                          {ar ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Activities list */}
                  {activities.length === 0 && !showActivityForm ? (
                    <div className="text-center py-20 text-gray-400">
                      <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">{ar ? "لا توجد أنشطة بعد. أضف أول نشاط!" : "No activities yet. Add the first one!"}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activities.map((a, i) => (
                        <motion.div key={String(a.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          {a.imageUrl ? (
                            <div className="h-36 overflow-hidden relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={String(a.imageUrl)} alt={String(a.title)} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-24 bg-lilac/30 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-mauve/30" />
                            </div>
                          )}
                          <div className="p-4">
                            <span className="text-xs font-bold text-mauve uppercase tracking-wide">{String(a.category || "")}</span>
                            <h3 className="font-bold text-gray-800 mb-1 truncate">{String(a.title || "")}</h3>
                            {a.date ? <p className="text-xs text-gray-400 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{String(a.date)}</p> : null}
                            {a.location ? <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{String(a.location)}</p> : null}
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => {
                                setEditingActivity(String(a.id));
                                setActivityForm({ title: String(a.title||""), titleAr: String(a.titleAr||""), description: String(a.description||""), descriptionAr: String(a.descriptionAr||""), date: String(a.date||""), category: String(a.category||"workshop"), location: String(a.location||""), locationAr: String(a.locationAr||""), imageUrl: String(a.imageUrl||"") });
                                setShowActivityForm(true);
                              }} className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-mauve bg-lilac px-3 py-1.5 rounded-lg hover:bg-lilac-dark transition-colors">
                                <Pencil className="w-3 h-3" />{ar ? "تعديل" : "Edit"}
                              </button>
                              <button onClick={async () => {
                                if (!confirm(ar ? "هل تريد حذف هذا النشاط؟" : "Delete this activity?")) return;
                                const { deleteDoc, doc: firestoreDoc } = await import("firebase/firestore");
                                await deleteDoc(firestoreDoc(db, "activities", String(a.id)));
                                setActivities(prev => prev.filter(x => x.id !== a.id));
                              }} className="flex items-center justify-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                <Trash2 className="w-3 h-3" />{ar ? "حذف" : "Delete"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── SURVEYS (create + view) ── */}
              {tab === "create" && (
                <div>
                  {/* Sub-tab bar */}
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
                    {([["create", ar ? "إنشاء استبيان" : "Create Survey", PlusCircle], ["view", ar ? "عرض الاستبيانات" : "View Surveys", ClipboardList]] as const).map(([key, label, Icon]) => (
                      <button key={key} onClick={() => setSurveySubTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${surveySubTab === key ? "bg-white shadow-sm text-mauve" : "text-gray-500 hover:text-gray-700"}`}>
                        <Icon className="w-4 h-4" />{label}
                      </button>
                    ))}
                  </div>

                  {/* Create sub-tab */}
                  {surveySubTab === "create" && <div className="max-w-2xl">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{ar ? "إنشاء استبيان جديد" : "Create New Survey"}</h2>
                  <p className="text-sm text-gray-400 mb-6">{ar ? "أنشئ استبياناً وانشره فوراً على المنصة" : "Build a survey and publish it instantly to the platform"}</p>

                  {createSuccess && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="bg-turquoise/10 border border-turquoise/30 text-turquoise-dark rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
                      <span className="text-xl">✓</span> {ar ? "تم نشر الاستبيان بنجاح!" : "Survey published successfully!"}
                    </motion.div>
                  )}

                  <form onSubmit={handleCreateSurvey} className="space-y-5">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{ar ? "تفاصيل الاستبيان" : "Survey Details"}</h3>
                      <AdminField label={ar ? "العنوان" : "Title"}>
                        <input value={surveyTitle} onChange={e => setSurveyTitle(e.target.value)} required className={adminInput} placeholder={ar ? "مثال: تقييم احتياجات المجتمع" : "e.g. Community Needs Assessment"} />
                      </AdminField>
                      <AdminField label={ar ? "الوصف" : "Description"}>
                        <input value={surveyDesc} onChange={e => setSurveyDesc(e.target.value)} className={adminInput} placeholder={ar ? "وصف قصير (اختياري)" : "Short description (optional)"} />
                      </AdminField>
                      <AdminField label={ar ? "السياق" : "Context"}>
                        <select value={surveyContext} onChange={e => setSurveyContext(e.target.value)} className={adminInput}>
                          {[["general", ar ? "عام" : "General"], ["education", ar ? "تعليم" : "Education"], ["youth", ar ? "شباب" : "Youth"], ["activity", ar ? "نشاط" : "Activity"]]
                            .map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </AdminField>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">{ar ? "الأسئلة" : "Questions"}</h3>
                      <div className="space-y-4">
                        {questions.map((q, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-mauve uppercase">{ar ? `سؤال ${i + 1}` : `Question ${i + 1}`}</span>
                              {questions.length > 1 && (
                                <button type="button" onClick={() => setQuestions(prev => prev.filter((_, idx) => idx !== i))}
                                  className="text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <input value={q.text} onChange={e => updateQuestion(i, "text", e.target.value)} required className={adminInput} placeholder={ar ? "نص السؤال" : "Question text"} />
                            <div className="flex gap-3 flex-wrap">
                              <select value={q.type} onChange={e => updateQuestion(i, "type", e.target.value)} className={`${adminInput} max-w-[180px]`}>
                                <option value="text">{ar ? "نص حر" : "Text answer"}</option>
                                <option value="choice">{ar ? "اختيار متعدد" : "Multiple choice"}</option>
                                <option value="rating">{ar ? "تقييم (1–5)" : "Rating (1–5)"}</option>
                              </select>
                              <label className="flex items-center gap-2 text-sm text-gray-500">
                                <input type="checkbox" checked={q.required} onChange={e => updateQuestion(i, "required", e.target.checked)} className="accent-turquoise" />
                                {ar ? "إلزامي" : "Required"}
                              </label>
                            </div>
                            {q.type === "choice" && (
                              <input value={q.options} onChange={e => updateQuestion(i, "options", e.target.value)} className={adminInput} placeholder={ar ? "الخيارات: خيار أ، خيار ب، خيار ج" : "Options: Option A, Option B, Option C"} />
                            )}
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addQuestion}
                        className="mt-4 flex items-center gap-2 text-sm text-turquoise font-semibold hover:opacity-70 transition-opacity">
                        <PlusCircle className="w-4 h-4" /> {ar ? "إضافة سؤال" : "Add question"}
                      </button>
                    </div>

                    {/* Notify users option */}
                    <label className="flex items-center gap-3 bg-lilac/30 rounded-xl px-4 py-3 cursor-pointer hover:bg-lilac/50 transition-colors">
                      <input type="checkbox" checked={notifyUsers} onChange={e => setNotifyUsers(e.target.checked)} className="accent-turquoise w-4 h-4" />
                      <div>
                        <p className="text-sm font-semibold text-mauve">{ar ? "إشعار المستخدمين المسجلين" : "Notify registered users"}</p>
                        <p className="text-xs text-gray-400">{ar ? "سيتلقى جميع الأعضاء المقبولين بريداً إلكترونياً عن هذا الاستبيان" : "All approved members will receive an email about this survey"}</p>
                      </div>
                    </label>

                    <motion.button type="submit" disabled={creating}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-mauve to-turquoise text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-mauve/20 hover:opacity-90 transition-opacity disabled:opacity-60">
                      {creating ? (ar ? "جارٍ النشر..." : "Publishing...") : (ar ? "نشر الاستبيان" : "Publish Survey")}
                    </motion.button>
                  </form>
                  </div>}

                  {/* View sub-tab */}
                  {surveySubTab === "view" && (
                    <div>
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">{ar ? "جميع الاستبيانات" : "All Surveys"}</h2>
                          <p className="text-sm text-gray-400 mt-0.5">{ar ? "فعّل أو عطّل ظهور الاستبيانات للمستخدمين" : "Control which surveys are visible to users"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-turquoise/10 text-turquoise-dark font-bold px-2.5 py-1 rounded-full">
                            {surveys.filter(s => (s as Record<string,unknown>).active !== false).length} {ar ? "نشط" : "active"}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2.5 py-1 rounded-full">
                            {surveys.filter(s => (s as Record<string,unknown>).active === false).length} {ar ? "معطّل" : "disabled"}
                          </span>
                        </div>
                      </div>

                      {surveys.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">{ar ? "لا توجد استبيانات بعد" : "No surveys yet"}</p>
                          <p className="text-xs mt-1 text-gray-300">{ar ? "أنشئ استبياناً من التبويب أعلاه" : "Create one from the tab above"}</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {surveys.map((s, i) => {
                            const isActive = (s as Record<string,unknown>).active !== false;
                            const qCount = (s.questions as unknown[])?.length || 0;
                            const respCount = allResponses.filter(r => String(r.surveyId) === String(s.id)).length;
                            return (
                              <motion.div key={String(s.id)}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                className={`bg-white rounded-2xl border shadow-sm transition-all ${isActive ? "border-gray-100 hover:shadow-md" : "border-gray-100 opacity-60"}`}
                              >
                                <div className="flex items-center gap-4 p-5">
                                  {/* Left accent */}
                                  <div className={`w-1 self-stretch rounded-full shrink-0 ${isActive ? "bg-turquoise" : "bg-gray-200"}`} />

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className={`font-semibold text-sm truncate ${isActive ? "text-gray-800" : "text-gray-400"}`}>
                                        {String(s.title)}
                                      </p>
                                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-turquoise/10 text-turquoise-dark" : "bg-gray-100 text-gray-400"}`}>
                                        {isActive ? (ar ? "نشط" : "Active") : (ar ? "معطّل" : "Disabled")}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate mb-2">{String(s.description || "")}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <ClipboardList className="w-3 h-3" />
                                        {qCount} {ar ? "سؤال" : "questions"}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {respCount} {ar ? "رد" : "responses"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Toggle */}
                                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => toggleSurveyActive(String(s.id), isActive)}
                                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isActive ? "bg-turquoise shadow-sm shadow-turquoise/30" : "bg-gray-200"}`}
                                    >
                                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isActive ? "left-7" : "left-1"}`} />
                                    </button>
                                    <span className="text-[10px] text-gray-400">{isActive ? (ar ? "تعطيل" : "Disable") : (ar ? "تفعيل" : "Enable")}</span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── ANALYTICS ── */}
              {tab === "analytics" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{ar ? "الإحصائيات والتحليلات" : "Analytics & Insights"}</h2>
                    <p className="text-sm text-gray-400">{ar ? "نظرة شاملة على أداء المنصة" : "A full overview of platform performance"}</p>
                  </div>

                  {/* KPI strip */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {[
                      { label: ar ? "إجمالي التسجيلات" : "Total Registrations", value: analytics.totalRegs,    sub: "",                         color: "#9B6B9B", bg: "bg-purple-50", icon: UserCheck },
                      { label: ar ? "مقبولون"          : "Approved",            value: analytics.approvedRegs,  sub: `${analytics.approvalRate}%`, color: "#2EC4B6", bg: "bg-teal-50",   icon: CheckCircle2 },
                      { label: ar ? "قيد المراجعة"     : "Pending",             value: analytics.pendingRegs,   sub: "",                         color: "#f59e0b", bg: "bg-amber-50",  icon: Clock },
                      { label: ar ? "إشكاليات منجزة"   : "Issues Resolved",     value: analytics.doneIssues,    sub: `${analytics.doneRate}%`,    color: "#22c55e", bg: "bg-green-50",  icon: CheckCircle2 },
                      { label: ar ? "استبيانات نشطة"   : "Active Surveys",      value: surveys.length,          sub: "",                         color: "#6366f1", bg: "bg-indigo-50", icon: BarChart3 },
                      { label: ar ? "إجمالي الردود"    : "Total Responses",     value: overviewStats.responses, sub: "",                         color: "#f97316", bg: "bg-orange-50", icon: Globe },
                    ].map((kpi, i) => (
                      <motion.div key={kpi.label}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className={`${kpi.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                        <div className="flex items-start justify-between mb-2 gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{kpi.label}</span>
                          <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                          </div>
                        </div>
                        <p className="text-3xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
                        {kpi.sub && <p className="text-xs font-bold mt-0.5" style={{ color: kpi.color }}>{kpi.sub} {ar ? "من الإجمالي" : "of total"}</p>}
                      </motion.div>
                    ))}
                  </div>

                  {/* Row 2: Category bars + Monthly trend */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-5">{ar ? "التسجيلات حسب الفئة" : "Registrations by Category"}</h3>
                      <div className="space-y-4">
                        {[
                          { cat: "youth",       label: ar ? "شباب"    : "Youth",        color: "#9B6B9B" },
                          { cat: "teacher",     label: ar ? "معلمون"  : "Teachers",     color: "#2EC4B6" },
                          { cat: "institution", label: ar ? "مؤسسات"  : "Institutions", color: "#6366f1" },
                        ].map(({ cat, label, color }) => {
                          const item = analytics.byCategory.find(b => b.key === cat)!;
                          return (
                            <div key={cat}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                  <span className="text-sm font-medium text-gray-700">{label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold" style={{ color }}>{item.count}</span>
                                  <span className="text-xs text-gray-400">({item.pct}%)</span>
                                </div>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                                  transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                                  className="h-full rounded-full" style={{ backgroundColor: color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400">{ar ? "إجمالي التسجيلات" : "Total registrations"}</span>
                        <span className="text-xl font-black text-mauve">{analytics.totalRegs}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-1">{ar ? "الاتجاه الشهري" : "Monthly Trend"}</h3>
                      <p className="text-xs text-gray-400 mb-4">{ar ? "التسجيلات خلال آخر 6 أشهر" : "Registrations over the last 6 months"}</p>
                      <MiniLineChart points={analytics.months.map(m => m.count)} color="#9B6B9B" />
                      <div className="flex justify-between mt-3">
                        {analytics.months.map(m => (
                          <div key={m.key} className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-mauve">{m.count}</span>
                            <span className="text-[10px] text-gray-400">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Status donut + Locale split */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-5">{ar ? "حالة التسجيلات" : "Registration Status"}</h3>
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <DonutRing value={analytics.approvedRegs} total={analytics.totalRegs || 1} color="#2EC4B6" size={100} />
                          <span className="text-xs text-gray-500">{ar ? "نسبة القبول" : "Approval rate"}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          {[
                            { label: ar ? "مقبول"        : "Approved", value: analytics.approvedRegs, color: "#2EC4B6", bg: "bg-teal-50" },
                            { label: ar ? "قيد المراجعة" : "Pending",  value: analytics.pendingRegs,  color: "#f59e0b", bg: "bg-amber-50" },
                          ].map(({ label, value, color, bg }) => (
                            <div key={label} className={`${bg} rounded-xl p-3 flex items-center justify-between`}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                              </div>
                              <span className="text-2xl font-black" style={{ color }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-5">{ar ? "اللغة المفضلة للمستخدمين" : "User Language Preference"}</h3>
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <DonutRing value={analytics.arCount} total={(analytics.arCount + analytics.enCount) || 1} color="#9B6B9B" size={100} />
                          <span className="text-xs text-gray-500">{ar ? "عربي" : "Arabic"}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          {[
                            { label: "عربي (AR)",      value: analytics.arCount, color: "#9B6B9B", bg: "bg-purple-50" },
                            { label: "English (EN)",   value: analytics.enCount, color: "#6366f1", bg: "bg-indigo-50" },
                          ].map(({ label, value, color, bg }) => (
                            <div key={label} className={`${bg} rounded-xl p-3 flex items-center justify-between`}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                              </div>
                              <span className="text-2xl font-black" style={{ color }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Issues breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-5">{ar ? "الإشكاليات حسب النوع" : "Issues by Type"}</h3>
                      {analytics.issueTypes.length === 0 ? (
                        <p className="text-gray-400 text-sm py-4 text-center">{ar ? "لا توجد إشكاليات بعد." : "No issues yet."}</p>
                      ) : (
                        <div className="space-y-3">
                          {analytics.issueTypes.map(({ type, count, pct }, i) => (
                            <div key={type}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                                <span className="text-sm font-bold text-turquoise">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                                  className="h-full rounded-full bg-turquoise" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center flex-wrap gap-2">
                        <span className="text-xs text-gray-400">{ar ? "الحالة" : "Status breakdown"}</span>
                        <div className="flex gap-2">
                          <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2.5 py-1 rounded-full">
                            {ar ? "قيد المعالجة" : "Pending"}: {analytics.totalIssues - analytics.doneIssues}
                          </span>
                          <span className="text-xs bg-green-50 text-green-600 font-semibold px-2.5 py-1 rounded-full">
                            {ar ? "تم" : "Done"}: {analytics.doneIssues}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-5">{ar ? "حالة الإشكاليات والفئات المعنية" : "Issue Status & Affected Groups"}</h3>
                      <div className="flex items-center gap-6 mb-5">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <DonutRing value={analytics.doneIssues} total={analytics.totalIssues || 1} color="#22c55e" size={80} />
                          <span className="text-xs text-gray-500">{ar ? "نسبة الإنجاز" : "Resolved"}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-green-50 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"/><span className="text-sm text-gray-700">{ar ? "تم" : "Done"}</span></div>
                            <span className="text-xl font-black text-green-500">{analytics.doneIssues}</span>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/><span className="text-sm text-gray-700">{ar ? "قيد المعالجة" : "Pending"}</span></div>
                            <span className="text-xl font-black text-amber-500">{analytics.totalIssues - analytics.doneIssues}</span>
                          </div>
                        </div>
                      </div>
                      {Object.keys(analytics.affectedGroups).length > 0 && (
                        <>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{ar ? "الفئات المعنية" : "Affected Groups"}</p>
                          <div className="space-y-1.5">
                            {Object.entries(analytics.affectedGroups).slice(0, 5).map(([group, count]) => (
                              <div key={group} className="flex items-center justify-between text-sm py-1">
                                <span className="text-gray-600 capitalize truncate max-w-[150px]">{group}</span>
                                <span className="text-xs font-bold text-mauve bg-lilac px-2.5 py-1 rounded-full">{count}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Survey engagement table */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-5">{ar ? "تفاعل الاستبيانات" : "Survey Engagement"}</h3>
                    {analytics.surveyEngagement.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">{ar ? "لا توجد استبيانات بعد." : "No surveys yet."}</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              {(ar ? ["الاستبيان","السياق","عدد الردود","التفاعل"] : ["Survey","Context","Responses","Engagement"]).map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.surveyEngagement.map((s, i) => {
                              const maxR = Math.max(...analytics.surveyEngagement.map(x => x.responseCount), 1);
                              return (
                                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                  className="border-b border-gray-50 hover:bg-lilac/10 transition-colors">
                                  <td className="px-4 py-3.5 font-medium text-gray-700">{s.title}</td>
                                  <td className="px-4 py-3.5">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                      s.context === "education" ? "bg-blue-50 text-blue-600" :
                                      s.context === "youth"     ? "bg-purple-50 text-purple-600" :
                                      s.context === "activity"  ? "bg-orange-50 text-orange-600" :
                                      "bg-gray-100 text-gray-500"
                                    }`}>{s.context}</span>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-lg text-indigo-600">{s.responseCount}</span>
                                      {s.responseCount === 0 && (
                                        <span className="text-xs text-gray-400">{ar ? "لا توجد ردود" : "no responses yet"}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 w-32">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${maxR > 0 ? (s.responseCount / maxR) * 100 : 0}%` }}
                                        transition={{ duration: 0.7, delay: i * 0.1 }}
                                        className="h-full rounded-full bg-indigo-400" />
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Row 6: Recent activity feed */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-5">{ar ? "النشاط الأخير" : "Recent Activity"}</h3>
                    {analytics.activity.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">{ar ? "لا يوجد نشاط بعد." : "No activity yet."}</div>
                    ) : (
                      <div className="space-y-1">
                        {analytics.activity.map((item, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <p className="text-sm font-medium text-gray-700 flex-1 truncate">{item.label}</p>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color + "20", color: item.color }}>
                              {item.type === "reg"      ? (ar ? "تسجيل"  : "Registration") :
                               item.type === "issue"    ? (ar ? "إشكالية" : "Issue")        :
                               (ar ? "رد" : "Response")}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {item.date?.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Response detail modal */}
      {selectedResponse && (() => {
        const survey = surveys.find(s => String(s.id) === String(selectedResponse.surveyId));
        const answers = (selectedResponse.answers as Record<string, string | number>) || {};
        const questions = (survey as Record<string,unknown>)?.questions as { id: string; text: string; type: string }[] | undefined;
        const surveyTitle = String(selectedResponse.surveyTitle || (ar ? "استبيان" : "Survey"));
        const responseDate = formatDate(selectedResponse.createdAt);
        const entries = Object.entries(answers);

        function downloadPDF() {
          const rows = entries.map(([qId, ans], i) => {
            const qText = questions?.find(q => q.id === qId)?.text || qId;
            return `
              <div style="margin-bottom:20px;padding:16px;background:#f9f6fc;border-radius:12px;border-left:4px solid #9B6B9B">
                <p style="font-size:11px;color:#9B6B9B;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px">Question ${i + 1}</p>
                <p style="font-size:15px;font-weight:600;color:#333;margin:0 0 10px">${qText}</p>
                <p style="font-size:14px;color:#555;margin:0;padding:10px 14px;background:#fff;border-radius:8px;border:1px solid #ede0f5">${String(ans)}</p>
              </div>`;
          }).join("");
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${surveyTitle}</title>
            <style>body{font-family:Arial,sans-serif;max-width:680px;margin:40px auto;color:#333;padding:0 20px}
            h1{color:#9B6B9B;font-size:22px;margin-bottom:4px} .meta{color:#999;font-size:13px;margin-bottom:30px}
            @media print{body{margin:20px}}</style></head>
            <body>
              <h1>${surveyTitle}</h1>
              <p class="meta">Date: ${responseDate} &nbsp;·&nbsp; ${entries.length} answers &nbsp;·&nbsp; InfoTech Innovation</p>
              <hr style="border:none;border-top:2px solid #ede0f5;margin-bottom:24px"/>
              ${rows}
              <p style="margin-top:32px;font-size:11px;color:#bbb;text-align:center">InfoTech Innovation — Survey Response</p>
            </body></html>`;
          const w = window.open("", "_blank");
          if (!w) return;
          w.document.write(html);
          w.document.close();
          w.focus();
          setTimeout(() => { w.print(); }, 400);
        }

        function downloadCSV() {
          const rows = entries.map(([qId, ans]) => {
            const qText = questions?.find(q => q.id === qId)?.text || qId;
            return { Question: qText, Answer: String(ans) };
          });
          exportCSV(rows, `response-${surveyTitle}-${responseDate}`);
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedResponse(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden z-10">

              {/* Gradient header */}
              <div className="relative px-7 pt-7 pb-6 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #9B6B9B 0%, #6b3fa0 60%, #2EC4B6 100%)" }}>
                {/* Decorative circles */}
                <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/5" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/10 px-2.5 py-1 rounded-full mb-3">
                      {ar ? "رد استبيان" : "Survey Response"}
                    </span>
                    <h2 className="font-bold text-white text-xl leading-snug mb-2">{surveyTitle}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/60">{responseDate}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="text-xs text-white/60 font-medium">{entries.length} {ar ? "إجابة" : "answers"}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedResponse(null)}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Answers */}
              <div className="overflow-y-auto px-6 py-5 space-y-3 flex-1 bg-gray-50/50">
                {entries.map(([qId, ans], i) => {
                  const questionText = questions?.find(q => q.id === qId)?.text || qId;
                  const isRating = typeof ans === "number";
                  return (
                    <div key={qId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Question row */}
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
                          style={{ background: "linear-gradient(135deg, #9B6B9B, #2EC4B6)" }}>
                          {i + 1}
                        </span>
                        <p className="text-sm font-semibold text-gray-700 leading-snug">{questionText}</p>
                      </div>
                      {/* Answer row */}
                      <div className="px-5 py-3">
                        {isRating ? (
                          <div className="flex items-center gap-1.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-5 h-5 ${s <= (ans as number) ? "fill-turquoise text-turquoise" : "text-gray-200 fill-gray-200"}`} />
                            ))}
                            <span className="text-xs text-gray-400 ms-2">{ans}/5</span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 leading-relaxed">{String(ans)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center gap-3">
                <button onClick={downloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 shadow-sm"
                  style={{ background: "linear-gradient(135deg, #9B6B9B, #6b3fa0)" }}>
                  <Printer className="w-4 h-4" />
                  {ar ? "تحميل PDF" : "Download PDF"}
                </button>
                <button onClick={downloadCSV}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:border-mauve hover:text-mauve transition-colors">
                  <Download className="w-4 h-4" />
                  {ar ? "تصدير CSV" : "Export CSV"}
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Registration detail modal */}
      {selectedReg && (
        <RegistrationModal
          reg={selectedReg}
          ar={ar}
          onClose={() => { setSelectedReg(null); setShowRejectionInput(false); setRejectionReason(""); }}
          onReview={handleReview}
          actionLoading={actionLoading}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          showRejectionInput={showRejectionInput}
          setShowRejectionInput={setShowRejectionInput}
        />
      )}
    </div>
  );
}

// ── REGISTRATION MODAL ───────────────────────────────────────────────────────

function RegistrationModal({ reg, ar, onClose, onReview, actionLoading, rejectionReason, setRejectionReason, showRejectionInput, setShowRejectionInput }: {
  reg: Record<string, unknown>;
  ar: boolean;
  onClose: () => void;
  onReview: (action: "approve" | "reject") => void;
  actionLoading: "approve" | "reject" | null;
  rejectionReason: string;
  setRejectionReason: (v: string) => void;
  showRejectionInput: boolean;
  setShowRejectionInput: (v: boolean) => void;
}) {
  const files = (reg.files as Record<string, string>) || {};
  const interests = (reg.interests as string[]) || [];
  const category = String(reg.category || "");
  const isImage = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url.split("?")[0]) || url.includes("image");

  const fieldRows = [
    { label: ar ? "الاسم" : "Name", value: reg.name || reg.institution_name },
    { label: ar ? "البريد" : "Email", value: reg.email },
    { label: ar ? "الهاتف" : "Phone", value: reg.phone },
    category === "youth" && { label: ar ? "العمر" : "Age", value: reg.age },
    category === "teacher" && { label: ar ? "المؤسسة" : "Institution", value: reg.institution_name },
    category === "teacher" && { label: ar ? "التخصص" : "Specialty", value: reg.specialty },
    category === "institution" && { label: ar ? "المسؤول" : "Contact Person", value: reg.contact_person },
    category === "institution" && { label: ar ? "نوع الشراكة" : "Partnership", value: reg.partnership },
    category === "institution" && reg.description && { label: ar ? "الوصف" : "Description", value: reg.description },
    interests.length > 0 && { label: ar ? "الاهتمامات" : "Interests", value: interests.join(", ") },
    reg.contribution && { label: ar ? "المساهمة" : "Contribution", value: reg.contribution },
    { label: ar ? "الفئة" : "Category", value: category },
    { label: ar ? "اللغة" : "Locale", value: reg.locale },
    { label: ar ? "الحالة" : "Status", value: reg.status },
    { label: ar ? "التاريخ" : "Date", value: reg.createdAt instanceof Timestamp ? reg.createdAt.toDate().toLocaleDateString("en-GB") : "—" },
  ].filter(Boolean) as { label: string; value: unknown }[];

  const fileEntries = [
    { key: "birth_certificate", label: ar ? "شهادة الميلاد" : "Birth Certificate" },
    { key: "adult_form",        label: ar ? "استمارة البالغين" : "Adult Registration Form" },
    { key: "underage_form",     label: ar ? "استمارة الموافقة الأبوية" : "Parental Consent Form" },
    { key: "resume",            label: ar ? "السيرة الذاتية" : "Resume / CV" },
    { key: "selfie",            label: ar ? "الصورة الشخصية" : "Profile Photo" },
    { key: "degree",            label: ar ? "الشهادة" : "Diploma / Degree" },
  ].filter(e => files[e.key]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">
                {String(reg.name || reg.institution_name || "—")}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorMap[category] || "bg-gray-100 text-gray-600"}`}>
                  {category}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  String(reg.status) === "approved" ? "bg-turquoise/10 text-turquoise" : "bg-amber-50 text-amber-600"
                }`}>
                  {String(reg.status || "pending")}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">

            {/* Info fields */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                {ar ? "معلومات المسجّل" : "Registrant Details"}
              </h3>
              <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
                {fieldRows.map(({ label, value }) => (
                  <div key={label} className="flex gap-4 px-4 py-2.5">
                    <span className="text-xs text-gray-400 w-32 shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-gray-700 font-medium">{String(value || "—")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded files */}
            {fileEntries.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                  {ar ? "الوثائق المرفوعة" : "Uploaded Documents"}
                </h3>
                <div className="space-y-3">
                  {fileEntries.map(({ key, label }) => {
                    const url = files[key];
                    const img = isImage(url);
                    return (
                      <div key={key} className="border border-gray-100 rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-mauve" />
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                          </div>
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-mauve font-semibold hover:opacity-70 transition-opacity">
                            <ExternalLink className="w-3.5 h-3.5" />
                            {ar ? "فتح" : "Open"}
                          </a>
                        </div>
                        {img && (
                          <div className="p-3 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={label} className="w-full max-h-48 object-contain rounded-xl" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            {showRejectionInput ? (
              <div className="space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder={ar ? "سبب الرفض (اختياري)..." : "Reason for rejection (optional)..."}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => onReview("reject")} disabled={actionLoading === "reject"}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 text-sm">
                    {actionLoading === "reject"
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Mail className="w-4 h-4" />{ar ? "إرسال الرفض" : "Send Rejection"}</>}
                  </button>
                  <button onClick={() => setShowRejectionInput(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors text-sm">
                    {ar ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => onReview("approve")} disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-turquoise text-white py-3 rounded-xl font-semibold hover:bg-turquoise-dark transition-colors disabled:opacity-60">
                  {actionLoading === "approve"
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ThumbsUp className="w-4 h-4" />{ar ? "قبول" : "Approve"}</>}
                </button>
                <button onClick={() => setShowRejectionInput(true)} disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-200 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-60">
                  <ThumbsDown className="w-4 h-4" />
                  {ar ? "رفض" : "Reject"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function Section({ title, count, onExport, exportLabel = "Export CSV", filter, children, searchQuery, onSearch, searchPlaceholder, extraActions }: {
  title: string; count: number; onExport: () => void; exportLabel?: string;
  filter?: React.ReactNode; children: React.ReactNode;
  searchQuery?: string; onSearch?: (v: string) => void; searchPlaceholder?: string;
  extraActions?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-400">{count} {count !== 1 ? "records" : "record"}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {filter}
          {extraActions}
          <button onClick={onExport}
            className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-mauve hover:text-mauve transition-colors text-gray-500 shadow-sm">
            <Download className="w-4 h-4" /> {exportLabel}
          </button>
        </div>
      </div>
      {onSearch && (
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchQuery} onChange={e => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-mauve transition-colors bg-white" />
        </div>
      )}
      {children}
    </div>
  );
}

const colorMap: Record<string, string> = {
  youth: "bg-purple-100 text-purple-700",
  teacher: "bg-teal-100 text-teal-700",
  institution: "bg-indigo-100 text-indigo-700",
  education: "bg-blue-100 text-blue-700",
  environment: "bg-green-100 text-green-700",
  technology: "bg-cyan-100 text-cyan-700",
  health: "bg-red-100 text-red-700",
};

function DataTable({ headers, rows, badges, emptyLabel = "No data yet.", onRowClick, viewCol }: {
  headers: string[]; rows: string[][];
  badges?: Record<number, Record<string, string>>;
  emptyLabel?: string;
  onRowClick?: (index: number) => void;
  viewCol?: number;
}) {
  if (!rows.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
        <p className="text-gray-400 text-sm">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {headers.map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => onRowClick?.(i)}
                className={`border-b border-gray-50 transition-colors ${onRowClick ? "cursor-pointer hover:bg-lilac/30" : "hover:bg-lilac/20"}`}>
                {row.map((cell, j) => (
                  <td key={j} className="px-5 py-3.5 text-gray-600">
                    {j === viewCol ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-mauve bg-lilac px-3 py-1.5 rounded-full hover:bg-lilac-dark transition-colors">
                        <Eye className="w-3 h-3" /> View
                      </span>
                    ) : badges?.[j]?.[cell.toLowerCase()] ? (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorMap[cell.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                        {cell}
                      </span>
                    ) : cell}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Select({ value, onChange, options, className }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:border-mauve bg-white shadow-sm ${className}`}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const adminInput = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-mauve focus:ring-2 focus:ring-mauve/10 transition-all bg-white";

// ── ANALYTICS CHART COMPONENTS ────────────────────────────────────────────────

function DonutRing({ value, total, color, size = 100 }: { value: number; total: number; color: string; size?: number }) {
  const strokeWidth = size < 90 ? 9 : 11;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? value / total : 0;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy + (size < 90 ? 4 : 6)} textAnchor="middle"
        fill={color} fontSize={size < 90 ? 13 : 17} fontWeight="800">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function MiniLineChart({ points, color = "#9B6B9B" }: { points: number[]; color?: string }) {
  if (points.length < 2) {
    return <div className="w-full h-16 bg-gray-50 rounded-xl flex items-center justify-center text-xs text-gray-400">No data yet</div>;
  }
  const w = 280, h = 72, padX = 12, padY = 10;
  const max = Math.max(...points, 1);
  const xs = points.map((_, i) => padX + (i / (points.length - 1)) * (w - 2 * padX));
  const ys = points.map(p => h - padY - ((p / max) * (h - 2 * padY)));
  const pathD = points.map((_, i) => `${i === 0 ? "M" : "L"} ${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${xs[xs.length-1].toFixed(1)} ${(h - padY).toFixed(1)} L ${xs[0].toFixed(1)} ${(h - padY).toFixed(1)} Z`;
  const gradId = `lg-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 72 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <motion.path d={pathD} fill="none" stroke={color} strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: "easeInOut" }} />
      {points.map((_, i) => (
        <motion.circle key={i} cx={xs[i]} cy={ys[i]} r={4} fill="white" stroke={color} strokeWidth={2}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + i * 0.06 }} />
      ))}
    </svg>
  );
}
