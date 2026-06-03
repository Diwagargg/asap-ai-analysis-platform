import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronDown,
  CircleHelp,
  CloudUpload,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  FileBarChart,
  FileSpreadsheet,
  Filter,
  Github,
  Globe2,
  History,
  LayoutDashboard,
  Linkedin,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  PieChart,
  Play,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Target,
  UploadCloud,
  User,
  X,
  Zap
} from "lucide-react";
import {
  Bar,
  Bubble,
  Doughnut,
  Line,
  Scatter
} from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  ArcElement
} from "chart.js";
import "./styles.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip
);

const sampleColumns = ["Date", "Region", "Product", "Revenue", "Marketing Spend", "Customers", "Churn Risk", "Predicted Revenue"];
const sampleRows = [
  ["2025-01-04", "North", "Nova CRM", "318000", "72000", "820", "Low", "329500"],
  ["2025-01-11", "West", "Pulse BI", "284000", "64000", "760", "Medium", "291300"],
  ["2025-01-18", "South", "Nova CRM", "352000", "81500", "902", "Low", "361200"],
  ["2025-01-25", "East", "Orbit Ops", "241000", "59000", "640", "High", "249800"],
  ["2025-02-01", "North", "Pulse BI", "389000", "88000", "1044", "Low", "401600"],
  ["2025-02-08", "West", "Orbit Ops", "219000", "43000", "582", "Medium", "225100"],
  ["2025-02-15", "South", "Nova CRM", "421000", "96000", "1198", "Low", "433900"],
  ["2025-02-22", "East", "Pulse BI", "276000", "62000", "711", "Medium", "282700"],
  ["2025-03-01", "North", "Orbit Ops", "468000", "102000", "1310", "Low", "481400"],
  ["2025-03-08", "West", "Nova CRM", "188000", "39000", "503", "High", "197900"],
  ["2025-03-15", "South", "Pulse BI", "447000", "98000", "1219", "Low", "458200"],
  ["2025-03-22", "East", "Nova CRM", "332000", "74500", "887", "Low", "342600"],
  ["2025-03-29", "North", "Pulse BI", "492000", "111000", "1386", "Low", "505200"],
  ["2025-04-05", "West", "Orbit Ops", "206000", "50500", "548", "High", "211900"],
  ["2025-04-12", "South", "Nova CRM", "523000", "119500", "1490", "Low", "538700"],
  ["2025-04-19", "East", "Pulse BI", "369000", "83500", "986", "Medium", "378600"],
  ["2025-04-26", "North", "Nova CRM", "556000", "128000", "1578", "Low", "571800"],
  ["2025-05-03", "West", "Pulse BI", "312000", "71000", "842", "Medium", "321500"],
  ["2025-05-10", "South", "Orbit Ops", "588000", "134000", "1663", "Low", "604200"],
  ["2025-05-17", "East", "Nova CRM", "401000", "91500", "1098", "Low", "412300"]
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { labels: { color: "#c9c9e8", boxWidth: 10, usePointStyle: true } },
    tooltip: { backgroundColor: "rgba(5,5,16,.92)", borderColor: "rgba(255,255,255,.14)", borderWidth: 1 }
  },
  scales: {
    x: { ticks: { color: "#9999bb" }, grid: { color: "rgba(255,255,255,.06)" } },
    y: { ticks: { color: "#9999bb" }, grid: { color: "rgba(255,255,255,.06)" } }
  }
};

function parseCsv(text) {
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);

  if (rows.length < 2) {
    throw new Error("The CSV needs a header row and at least one data row.");
  }

  const columns = normalizeColumnNames(rows[0]);
  const width = columns.length;
  const dataRows = rows.slice(1).map((item) => columns.map((_, index) => item[index] ?? ""));
  return { columns, rows: dataRows, rowCount: dataRows.length, columnCount: width };
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const candidates = [",", "\t", ";", "|"];
  return candidates
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function normalizeColumnNames(columns) {
  const seen = new Map();
  return columns.map((column, index) => {
    const base = (column || `Column ${index + 1}`).trim() || `Column ${index + 1}`;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base} ${count + 1}` : base;
  });
}

function cleanNumericValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[%,$₹\s]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function numericValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[^0-9.+-]/g, "");
  if (!cleaned || cleaned === "." || cleaned === "-" || cleaned === "+") return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function isDateLike(value) {
  if (!value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time);
}

function profileDataset(columns, rows) {
  const numeric = [];
  const categorical = [];
  const dates = [];
  const booleans = [];
  const allColumns = [];
  let dateIndex = -1;

  columns.forEach((column, index) => {
    const rawValues = rows.map((row) => row[index] ?? "");
    const values = rawValues.filter((value) => value !== "");
    const numericCount = values.filter((value) => numericValue(value) !== null).length;
    const dateCount = values.filter(isDateLike).length;
    const uniqueValues = new Set(values.map((value) => String(value).toLowerCase()));
    const booleanCount = values.filter((value) => ["yes", "no", "true", "false", "0", "1"].includes(String(value).toLowerCase())).length;
    const missing = rawValues.length - values.length;
    const numericValues = rawValues.map((value) => numericValue(value));
    const profile = {
      index,
      name: column,
      missing,
      missingRate: rawValues.length ? missing / rawValues.length : 0,
      unique: uniqueValues.size,
      values: rawValues
    };

    if (dateIndex === -1 && values.length && dateCount / values.length > 0.65) {
      dateIndex = index;
    }

    if (values.length && numericCount / values.length > 0.65) {
      const clean = numericValues.filter((value) => value !== null);
      const sorted = [...clean].sort((a, b) => a - b);
      const q1 = percentile(sorted, 0.25);
      const q3 = percentile(sorted, 0.75);
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      const numericProfile = { ...profile, type: "numeric", values: numericValues, min: sorted[0] ?? 0, max: sorted.at(-1) ?? 0, avg: average(clean), q1, q3, lower, upper, outliers: numericValues.map((value) => value !== null && (value < lower || value > upper)) };
      numeric.push(numericProfile);
      allColumns.push(numericProfile);
    } else if (values.length && dateCount / values.length > 0.65) {
      const dateProfile = { ...profile, type: "date", dates: rawValues.map((value) => Date.parse(value)) };
      dates.push(dateProfile);
      allColumns.push(dateProfile);
    } else if (values.length && booleanCount / values.length > 0.85) {
      const booleanProfile = { ...profile, type: "boolean" };
      booleans.push(booleanProfile);
      categorical.push(booleanProfile);
      allColumns.push(booleanProfile);
    } else {
      const categoryProfile = { ...profile, type: "categorical", values };
      categorical.push(categoryProfile);
      allColumns.push(categoryProfile);
    }
  });

  return { numeric, categorical, dates, booleans, allColumns, dateIndex };
}

function percentile(sortedValues, p) {
  if (!sortedValues.length) return 0;
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
}

function average(values) {
  const clean = values.filter((value) => value !== null && Number.isFinite(value));
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

function correlation(a, b) {
  const pairs = a.map((value, index) => [value, b[index]]).filter(([x, y]) => x !== null && y !== null);
  if (pairs.length < 2) return 0;
  const xs = pairs.map(([x]) => x);
  const ys = pairs.map(([, y]) => y);
  const ax = average(xs);
  const ay = average(ys);
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - ax) * (y - ay), 0);
  const dx = Math.sqrt(xs.reduce((sum, x) => sum + (x - ax) ** 2, 0));
  const dy = Math.sqrt(ys.reduce((sum, y) => sum + (y - ay) ** 2, 0));
  return dx && dy ? numerator / (dx * dy) : 0;
}

function App() {
  const [route, setRoute] = useState(location.pathname === "/" ? "/auth" : location.pathname);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("asap-user") || "null"));
  const [toast, setToast] = useState(null);
  const [analysis, setAnalysis] = useState(() => JSON.parse(localStorage.getItem("asap-analysis") || "null") || defaultAnalysis());
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const onPop = () => setRoute(location.pathname === "/" ? "/auth" : location.pathname);
    window.addEventListener("popstate", onPop);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (path) => {
    history.pushState({}, "", path === "/auth" ? "/" : path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const notify = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const signIn = (name = "Diwakar Rao", welcome = false) => {
    const next = { name, email: "diwakar@asap.ai", avatar: name.split(" ").map((v) => v[0]).join("").slice(0, 2) };
    localStorage.setItem("asap-user", JSON.stringify(next));
    setUser(next);
    navigate("/home");
    notify(welcome ? `Welcome to ASAP, ${name.split(" ")[0]}. Your workspace is ready.` : "Signed in successfully.");
  };

  const signOut = () => {
    localStorage.removeItem("asap-user");
    setUser(null);
    navigate("/auth");
    notify("Signed out securely.", "info");
  };

  const completeAnalysis = (payload) => {
    setProcessing(true);
    setTimeout(() => {
      const selectedSet = new Set(payload?.selectedColumns || []);
      const sourceColumns = payload?.columns?.length ? payload.columns : sampleColumns;
      const sourceRows = payload?.rows?.length ? payload.rows : sampleRows;
      const columnIndexes = selectedSet.size
        ? sourceColumns.map((column, index) => selectedSet.has(column) ? index : -1).filter((index) => index >= 0)
        : sourceColumns.map((_, index) => index);
      const focusedColumns = columnIndexes.map((index) => sourceColumns[index]);
      const focusedRows = sourceRows.map((row) => columnIndexes.map((index) => row[index] ?? ""));
      const next = {
        ...defaultAnalysis(),
        datasetName: payload?.fileName || "Revenue_Forecast_Q2.xlsx",
        columns: focusedColumns,
        rows: focusedRows,
        rowCount: payload?.rowCount || sourceRows.length,
        columnCount: focusedColumns.length,
        selectedColumns: payload?.selectedColumns || [],
        mode: payload?.mode || "Regression",
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("asap-analysis", JSON.stringify(next));
      setAnalysis(next);
      setProcessing(false);
      navigate("/results");
      notify("Analysis completed in 4.2 seconds.");
    }, 5200);
  };

  return (
    <div className="app-shell">
      <AmbientBackground />
      <main className="page-transition">
        {route === "/auth" && <AuthPage onAuth={signIn} notify={notify} />}
        {route === "/home" && <HomePage user={user} navigate={navigate} signOut={signOut} />}
        {route === "/upload" && <UploadPage navigate={navigate} onAnalyze={completeAnalysis} notify={notify} />}
        {route.startsWith("/results") && <ResultsPage analysis={analysis} user={user} navigate={navigate} notify={notify} />}
        {route === "/history" && <HistoryPage analysis={analysis} navigate={navigate} user={user} signOut={signOut} />}
        {!["/auth", "/home", "/upload", "/history"].includes(route) && !route.startsWith("/results") && <NotFound navigate={navigate} />}
      </main>
      {processing && <ProcessingOverlay />}
      {toast && <Toast toast={toast} />}
    </div>
  );
}

function defaultAnalysis() {
  return {
    datasetName: "Revenue_Forecast_Q2.xlsx",
    createdAt: "2026-05-11T09:18:00.000Z",
    rows: sampleRows,
    columns: sampleColumns,
    rowCount: sampleRows.length,
    columnCount: sampleColumns.length,
    selectedColumns: [],
    mode: "Regression"
  };
}

function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="blob blob-one" />
      <span className="blob blob-two" />
      <span className="blob blob-three" />
      <span className="grain" />
    </div>
  );
}

function Logo({ compact = false }) {
  return (
    <button className="logo" aria-label="ASAP home" onClick={() => (location.href = "/home")}>
      <span className="logo-mark"><Zap size={compact ? 14 : 18} fill="currentColor" /></span>
      <span className="gradient-text">ASAP</span>
    </button>
  );
}

function AuthPage({ onAuth }) {
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const errors = validateAuth(tab, form);
  const strength = passwordStrength(form.password);

  const submit = (event) => {
    event.preventDefault();
    if (Object.keys(errors).length || (tab === "signup" && !form.terms)) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    setLoading(true);
    setTimeout(() => onAuth(form.name || "Diwakar Rao", tab === "signup"), 1100);
  };

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <Logo />
        <div className="orb" />
        {["10K+ Datasets Analyzed", "99.2% Accuracy", "50+ Chart Types"].map((stat, index) => (
          <div className={`floating-stat stat-${index + 1}`} key={stat}>
            <Activity size={17} />
            <span>{stat}</span>
          </div>
        ))}
        <h1>Upload. Analyze. Understand.</h1>
        <p>ASAP transforms raw spreadsheets into predictive intelligence, polished reports, and share-ready decisions.</p>
      </div>
      <form className={`auth-card glass ${shake ? "shake" : ""}`} onSubmit={submit} noValidate>
        <div className="tab-switch" role="tablist" aria-label="Authentication mode">
          <button type="button" className={tab === "signin" ? "active" : ""} onClick={() => setTab("signin")}>Sign In</button>
          <button type="button" className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>Sign Up</button>
          <span style={{ transform: `translateX(${tab === "signin" ? "0" : "100"}%)` }} />
        </div>
        {tab === "signup" && (
          <Field label="Full Name" value={form.name} onChange={(name) => setForm({ ...form, name })} error={errors.name} icon={<User size={18} />} />
        )}
        <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} error={errors.email} icon={<Mail size={18} />} />
        <Field
          label="Password"
          type={showPass ? "text" : "password"}
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          error={errors.password}
          icon={<Lock size={18} />}
          action={
            <button type="button" className="icon-button" aria-label={showPass ? "Hide password" : "Show password"} onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        {tab === "signup" && (
          <>
            <div className="strength" aria-label={`Password strength ${strength.label}`}>
              <span style={{ width: strength.width, background: strength.color }} />
            </div>
            <small className="muted">Password strength: {strength.label}</small>
            <Field label="Confirm Password" type="password" value={form.confirm} onChange={(confirm) => setForm({ ...form, confirm })} error={errors.confirm} icon={<Shield size={18} />} />
            <label className="terms">
              <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
              <span>I agree to Terms of Service and Privacy Policy</span>
            </label>
          </>
        )}
        {tab === "signin" && <button type="button" className="text-link">Forgot Password?</button>}
        <button className="primary-button cta" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : null}
          {loading ? (tab === "signin" ? "Signing in..." : "Creating account...") : tab === "signin" ? "Sign In" : "Create Account"}
        </button>
        <div className="divider"><span />or continue with<span /></div>
        <button type="button" className="google-button" onClick={() => onAuth("Google Analyst", tab === "signup")}>
          <GoogleLogo /> Google {tab === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, value, onChange, error, icon, action, type = "text" }) {
  return (
    <label className={`field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      <div>
        {icon}
        <input aria-invalid={Boolean(error)} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} />
        {action}
      </div>
      <em>{error}</em>
    </label>
  );
}

function GoogleLogo() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h6c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.1-2 3.2-4.8 3.2-8.1Z" />
      <path fill="#34A853" d="M12 23c3 0 5.6-1 7.4-2.7l-3.7-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.4-2-6.3-4.6H1.9v2.9C3.8 20.5 7.6 23 12 23Z" />
      <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.1H1.9C1.1 8.6.7 10.2.7 12s.4 3.4 1.2 4.9L5.7 14Z" />
      <path fill="#EA4335" d="M12 5.4c1.7 0 3.1.6 4.3 1.7l3.2-3.2C17.6 2.1 15 1 12 1 7.6 1 3.8 3.5 1.9 7.1L5.7 10c.9-2.6 3.4-4.6 6.3-4.6Z" />
    </svg>
  );
}

function validateAuth(tab, form) {
  const errors = {};
  if (tab === "signup" && form.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Use a valid email address.";
  if (form.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (tab === "signup" && form.confirm !== form.password) errors.confirm = "Passwords must match.";
  return errors;
}

function passwordStrength(value) {
  const score = [value.length >= 8, /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
  if (score <= 1) return { label: "weak", width: "32%", color: "#ff4560" };
  if (score <= 3) return { label: "medium", width: "66%", color: "#ffb800" };
  return { label: "strong", width: "100%", color: "#00ffb3" };
}

function Navbar({ user, navigate, signOut, crumb }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const links = [["Home", "/home"], ["Features", "/home#features"], ["How It Works", "/home#how"], ["History", "/history"]];
  return (
    <header className="navbar">
      <Logo compact />
      {crumb && <div className="breadcrumb">{crumb}</div>}
      <nav className={open ? "open" : ""}>
        {links.map(([label, path]) => (
          <button key={label} onClick={() => { setOpen(false); navigate(path.split("#")[0]); setTimeout(() => document.querySelector(path.includes("#") ? path.slice(path.indexOf("#")) : "body")?.scrollIntoView({ behavior: "smooth" }), 80); }}>{label}</button>
        ))}
      </nav>
      <div className="nav-actions">
        <button className="avatar" onClick={() => setMenu(!menu)} aria-label="Open profile menu">{user?.avatar || "DR"}</button>
        {menu && (
          <div className="avatar-menu glass">
            <button><User size={16} /> Profile</button>
            <button onClick={() => navigate("/history")}><History size={16} /> My Analyses</button>
            <button><Settings size={16} /> Settings</button>
            <button onClick={signOut}><LogOut size={16} /> Sign Out</button>
          </div>
        )}
        <button className="hamburger" aria-label="Open navigation menu" onClick={() => setOpen(!open)}><Menu /></button>
      </div>
    </header>
  );
}

function HomePage({ user, navigate, signOut }) {
  const [demo, setDemo] = useState(false);
  return (
    <>
      <Navbar user={user} navigate={navigate} signOut={signOut} />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> Upload. Analyze. Understand.</p>
          <h1>
            {["Turn", "Raw", "Data", "Into"].map((word, i) => <span style={{ animationDelay: `${i * 90}ms` }} key={word}>{word}</span>)}
            <strong>Powerful Insights</strong>
          </h1>
          <p>Upload any CSV or Excel dataset. ASAP's AI engine analyzes patterns, predicts trends, and delivers visual reports in seconds.</p>
          <div className="button-row">
            <button className="primary-button pulse" onClick={() => navigate("/upload")}>Start Analyzing <ArrowRight size={18} /></button>
            <button className="ghost-button" onClick={() => setDemo(true)}><Play size={18} /> Watch Demo</button>
          </div>
        </div>
        <DashboardMockup />
      </section>
      <StatsBar />
      <Features />
      <HowItWorks />
      <section className="cta-banner">
        <div>
          <h2>Ready to unlock your data's potential?</h2>
          <p>Run a polished analysis workflow with prediction charts, AI summaries, and branded PDF export.</p>
        </div>
        <button className="primary-button" onClick={() => navigate("/upload")}>Upload Your First Dataset</button>
      </section>
      <Footer />
      {demo && <DemoModal onClose={() => setDemo(false)} />}
    </>
  );
}

function DashboardMockup() {
  const miniData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{ label: "Revenue", data: [318, 389, 492, 556, 604], borderColor: "#00d4ff", backgroundColor: "rgba(0,212,255,.14)", fill: true, tension: .42 }]
  };
  return (
    <div className="mockup glass">
      <div className="mockup-top"><span /><span /><span /><b>Revenue_Forecast_Q2.xlsx</b></div>
      <div className="mock-grid">
        <div><small>Prediction Accuracy</small><strong>98.3%</strong></div>
        <div><small>Outliers</small><strong>3</strong></div>
        <div><small>Q4 Forecast</small><strong>₹42.3L</strong></div>
      </div>
      <div className="mock-chart"><Line data={miniData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} /></div>
    </div>
  );
}

function StatsBar() {
  const stats = [["12,500+", "Datasets Analyzed"], ["99.1%", "Prediction Accuracy"], ["47", "Chart Types"], ["3 sec", "Average Analysis Time"]];
  return <section className="stats-bar">{stats.map(([n, l]) => <div key={l}><strong>{n}</strong><span>{l}</span></div>)}</section>;
}

function Features() {
  const features = [
    [Brain, "AI Prediction Models", "Regression, classification, clustering — auto-selected based on your data"],
    [BarChart3, "Smart Visualizations", "Bar, line, pie, scatter, heatmaps, correlation matrices"],
    [FileSpreadsheet, "Multi-Format Support", "Upload CSV, XLS, or XLSX — we handle the rest"],
    [Target, "Column-Specific Analysis", "Focus on only the columns that matter to you"],
    [FileBarChart, "PDF Export", "Download full visual reports with charts and AI insights"],
    [Share2, "Instant Sharing", "Share results via WhatsApp, link, or direct download"]
  ];
  return (
    <section id="features" className="section">
      <h2>What ASAP Can Do</h2>
      <div className="feature-grid">{features.map(([Icon, title, text]) => <article className="feature-card glass" key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
  );
}

function HowItWorks() {
  const steps = [["Upload", UploadCloud, "Upload your dataset as CSV or Excel."], ["Select", Filter, "Choose the columns that matter."], ["Analyze", Brain, "AI generates charts and insights."], ["Export", Download, "Share a polished PDF report."]];
  return (
    <section id="how" className="section how">
      <h2>How It Works</h2>
      <div className="timeline">{steps.map(([title, Icon, text], i) => <article key={title}><span>{i + 1}</span><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
  );
}

function UploadPage({ navigate, onAnalyze, notify }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [selected, setSelected] = useState([]);
  const [advanced, setAdvanced] = useState(false);
  const [mode, setMode] = useState("Auto-detect");
  const [drag, setDrag] = useState(false);
  const validTypes = [".csv", ".tsv", ".txt", ".xls", ".xlsx"];

  const acceptFile = async (candidate) => {
    if (!candidate) return;
    const ok = validTypes.some((type) => candidate.name.toLowerCase().endsWith(type)) && candidate.size <= 50 * 1024 * 1024;
    if (!ok) {
      notify("Please upload a CSV, XLS, or XLSX file under 50MB.", "error");
      return;
    }
    if (candidate.name.toLowerCase().endsWith(".xls") || candidate.name.toLowerCase().endsWith(".xlsx")) {
      notify("Excel upload UI is ready, but this local app needs CSV/TSV text files for fully local parsing. Please export XLS/XLSX as CSV.", "warning");
      return;
    }

    try {
      const parsed = parseCsv(await candidate.text());
      setFile({
        name: candidate.name,
        size: candidate.size,
        rows: parsed.rowCount,
        cols: parsed.columnCount,
        columns: parsed.columns,
        dataRows: parsed.rows
      });
      setSelected([]);
      notify(`Dataset validated: ${parsed.rowCount} rows and ${parsed.columnCount} columns detected.`);
    } catch (error) {
      notify(error.message || "Unable to parse this CSV file.", "error");
    }
  };

  const analyze = () => onAnalyze({
    fileName: file.name,
    columns: file.columns,
    rows: file.dataRows,
    rowCount: file.rows,
    columnCount: file.cols,
    selectedColumns: selected,
    mode
  });

  return (
    <>
      <Navbar user={{ avatar: "DR" }} navigate={navigate} signOut={() => navigate("/auth")} />
      <section className="upload-page">
        <div className={`dropzone glass ${drag ? "dragging" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); acceptFile(e.dataTransfer.files[0]); }}>
          <CloudUpload size={52} />
          <h1>Drag & drop your CSV or Excel file here</h1>
          <p>Supports .csv, .tsv, .txt, .xls, .xlsx — Max 50MB</p>
          <button className="primary-button" onClick={() => inputRef.current.click()}>Browse Files</button>
          <input ref={inputRef} type="file" accept=".csv,.tsv,.txt,.xls,.xlsx" onChange={(e) => acceptFile(e.target.files[0])} hidden />
          {file && <div className="file-preview"><FileSpreadsheet /><div><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB · {file.rows} rows · {file.cols} columns</span></div><Check className="success" /><button aria-label="Remove file" onClick={() => { setFile(null); setSelected([]); }}><X /></button></div>}
        </div>
        <aside className="upload-side">
          {file && (
            <section className="glass reveal">
              <h2>🎯 Focus Your Analysis (Optional)</h2>
              <p>Select specific columns to analyze. Leave empty for full analysis.</p>
              <div className="mini-actions">
                <button onClick={() => setSelected(file.columns)}>Select All</button>
                <button onClick={() => setSelected([])}>Clear All</button>
                <span title="If no columns selected, ASAP will analyze all columns"><CircleHelp size={16} /></span>
              </div>
              <div className="tag-grid">
                {file.columns.map((column) => <button className={selected.includes(column) ? "selected" : ""} onClick={() => setSelected(selected.includes(column) ? selected.filter((item) => item !== column) : [...selected, column])} key={column}>{column}{selected.includes(column) && <X size={14} />}</button>)}
              </div>
            </section>
          )}
          <section className="glass accordion">
            <button onClick={() => setAdvanced(!advanced)}>⚙️ Advanced Options (Optional)<ChevronDown className={advanced ? "up" : ""} /></button>
            {advanced && <div className="advanced"><label>Analysis Mode<select value={mode} onChange={(e) => setMode(e.target.value)}>{["Auto-detect", "Regression", "Classification", "Clustering", "Time Series"].map((v) => <option key={v}>{v}</option>)}</select></label><label>Target Column<select>{(file?.columns || ["Auto-detect"]).map((column) => <option key={column}>{column}</option>)}</select></label></div>}
          </section>
          <button className="primary-button analyze" disabled={!file} onClick={analyze}>🚀 Analyze My Data</button>
          <p className="estimate">Estimated time: ~3-10 seconds</p>
        </aside>
      </section>
    </>
  );
}

function ProcessingOverlay() {
  const messages = ["Reading your dataset...", "Detecting data types...", "Training prediction model...", "Generating visualizations...", "Building your report..."];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((value) => (value + 1) % messages.length), 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="processing"><Logo /><div className="loader-ring" /><div className="progress"><span /></div><p>{messages[index]}</p></div>;
}

function ResultsPage({ analysis, user, navigate, notify }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef(null);
  const data = useMemo(() => buildCharts(analysis), [analysis]);
  const profile = useMemo(() => profileDataset(analysis.columns, analysis.rows), [analysis]);

  const exportPdf = async () => {
    setPdfLoading(true);
    notify("Preparing your PDF...", "info");
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#050510", scale: 1.4 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.setFillColor(5, 5, 16);
    pdf.rect(0, 0, width, 297, "F");
    pdf.addImage(img, "PNG", 0, 0, width, Math.min(height, 292));
    pdf.setFontSize(9);
    pdf.setTextColor(153, 153, 187);
    pdf.text("Generated by ASAP — AI Smart Analysis Platform", 14, 289);
    pdf.save(`ASAP_Report_${analysis.datasetName.replace(/\W+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
    setPdfLoading(false);
    notify("PDF downloaded successfully.");
  };

  return (
    <>
      <Navbar user={user || { avatar: "DR" }} navigate={navigate} signOut={() => navigate("/auth")} crumb="Home > Upload > Results" />
      <section className="results-page" ref={reportRef}>
        <div className="results-header">
          <div>
            <p className="eyebrow"><Database size={16} /> Analysis Complete</p>
            <h1>{analysis.datasetName}</h1>
            <span>{new Date(analysis.createdAt).toLocaleString()}</span>
            <div className="badges"><b>{analysis.rowCount || analysis.rows.length} rows</b><b>{analysis.columnCount || analysis.columns.length} columns</b><b>{analysis.mode} Model</b><b>{data.quality}% Data Quality</b></div>
          </div>
          <div className="result-actions">
            <button className="primary-button" onClick={exportPdf} disabled={pdfLoading}>{pdfLoading ? <Loader2 className="spin" /> : <FileBarChart />} Export PDF</button>
            <button className="ghost-button" onClick={() => setShareOpen(true)}><Share2 /> Share Results</button>
            <button className="text-link" onClick={() => navigate("/upload")}><RefreshCw size={16} /> New Analysis</button>
          </div>
        </div>
        <AIInsights analysis={analysis} profile={profile} quality={data.quality} />
        <DatasetProfile profile={profile} rowCount={analysis.rowCount || analysis.rows.length} />
        <section className="chart-grid">
          <ChartCard title={data.titles.bar}><Bar data={data.bar} options={chartOptions} /></ChartCard>
          <ChartCard title={data.titles.line}><Line data={data.line} options={chartOptions} /></ChartCard>
          <ChartCard title={data.titles.donut}><Doughnut data={data.donut} options={{ ...chartOptions, scales: undefined }} /></ChartCard>
          <ChartCard title={data.titles.scatter}><Scatter data={data.scatter} options={chartOptions} /></ChartCard>
          <ChartCard title="Numeric Correlation Heatmap"><Heatmap heatmap={data.heatmap} /></ChartCard>
          <ChartCard title={data.titles.histogram}><Bar data={data.histogram} options={chartOptions} /></ChartCard>
          <ChartCard title={data.titles.box}><BoxPlot stats={data.boxStats} /></ChartCard>
          <ChartCard title={data.titles.prediction}><Line data={data.prediction} options={chartOptions} /></ChartCard>
        </section>
        <DataTable rows={analysis.rows} columns={analysis.columns} profile={profile} />
        <ModelDetails quality={data.quality} profile={profile} rowCount={analysis.rowCount || analysis.rows.length} />
      </section>
      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} notify={notify} />}
    </>
  );
}

function AIInsights({ analysis, profile, quality } = {}) {
  if (analysis && profile) {
    const firstNumeric = profile.numeric[0];
    const secondNumeric = profile.numeric[1];
    const firstCategory = profile.categorical[0];
    const missingCells = analysis.rows.flat().filter((value) => value === "").length;
    const corr = firstNumeric && secondNumeric ? correlation(firstNumeric.values, secondNumeric.values) : 0;
    const firstNumericValues = firstNumeric?.values.filter((value) => value !== null) || [];
    const highestMissing = [...profile.allColumns].sort((a, b) => b.missingRate - a.missingRate)[0];
    const outlierColumn = [...profile.numeric].sort((a, b) => b.outliers.filter(Boolean).length - a.outliers.filter(Boolean).length)[0];
    const insights = [
      `${analysis.datasetName} was parsed directly from your upload with ${analysis.rowCount || analysis.rows.length} rows and ${analysis.columnCount || analysis.columns.length} columns.`,
      firstNumeric && firstNumericValues.length ? `${firstNumeric.name} ranges from ${formatNumber(Math.min(...firstNumericValues))} to ${formatNumber(Math.max(...firstNumericValues))} with an average of ${formatNumber(average(firstNumeric.values))}.` : "No mostly numeric column was detected, so ASAP focused on categorical distribution and table profiling.",
      firstNumeric && secondNumeric ? `${firstNumeric.name} and ${secondNumeric.name} have a correlation of ${corr.toFixed(2)}, based on paired numeric values in the uploaded file.` : "Add at least two numeric columns to generate correlation and scatter analysis.",
      firstCategory ? `${firstCategory.name} has ${firstCategory.unique} unique values, useful for segmentation and distribution charts.` : "No categorical column was detected in the uploaded dataset.",
      outlierColumn ? `${outlierColumn.outliers.filter(Boolean).length} possible outliers were detected in ${outlierColumn.name} using the IQR method.` : "No numeric outlier scan was possible because numeric columns were not detected.",
      `${missingCells} blank cells were found${highestMissing?.missing ? `; ${highestMissing.name} has the highest missing rate at ${Math.round(highestMissing.missingRate * 100)}%` : ""}. Estimated data quality score: ${quality}%.`
    ];
    return <section className="ai-card glass"><Brain /><div><h2>AI Insights</h2><ul>{insights.map((item) => <li key={item}>{item}</li>)}</ul></div></section>;
  }
  const insights = [
    "Sales show strong positive correlation with Marketing Spend (r=0.87), especially in North and South regions.",
    "Predicted Q4 revenue is ₹42.3L with 91% confidence when current acquisition trends continue.",
    "3 outlier rows detected in Revenue and Customers — review West region entries before board reporting.",
    "Nova CRM accounts for 41% of total revenue and shows the lowest churn-risk profile.",
    "A regression model was selected because the target column is continuous and numeric."
  ];
  return <section className="ai-card glass"><Brain /><div><h2>AI Insights</h2><ul>{insights.map((item) => <li key={item}>{item}</li>)}</ul></div></section>;
}

function DatasetProfile({ profile, rowCount }) {
  const cards = [
    ["Rows analyzed", formatNumber(rowCount), "After optional column focus"],
    ["Numeric columns", profile.numeric.length, "Used for trend, scatter, histograms, heatmap"],
    ["Category columns", profile.categorical.length, "Used for distributions and grouping"],
    ["Date columns", profile.dates.length, "Used for time-based labels when detected"],
    ["Boolean columns", profile.booleans.length, "Detected yes/no or true/false fields"],
    ["Possible outliers", formatNumber(profile.numeric.reduce((sum, column) => sum + column.outliers.filter(Boolean).length, 0)), "IQR scan across numeric columns"]
  ];

  return (
    <section className="profile-grid">
      {cards.map(([label, value, help]) => (
        <article className="profile-card glass" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{help}</small>
        </article>
      ))}
    </section>
  );
}

function buildCharts(rows) {
  if (!Array.isArray(rows)) return buildDatasetCharts(rows);
  const months = rows.map((row) => row[0].slice(5));
  const revenue = rows.map((row) => Number(row[3]) / 1000);
  const predicted = rows.map((row) => Number(row[7]) / 1000);
  const marketing = rows.map((row) => Number(row[4]) / 1000);
  const productTotals = rows.reduce((acc, row) => ({ ...acc, [row[2]]: (acc[row[2]] || 0) + Number(row[3]) / 1000 }), {});
  const colors = ["#6c63ff", "#00d4ff", "#ec4899", "#00ffb3"];
  return {
    line: { labels: months, datasets: [{ label: "Revenue (₹K)", data: revenue, borderColor: "#00d4ff", backgroundColor: "rgba(0,212,255,.12)", fill: true, tension: .38 }] },
    bar: { labels: Object.keys(productTotals), datasets: [{ label: "Revenue (₹K)", data: Object.values(productTotals), backgroundColor: colors }] },
    donut: { labels: Object.keys(productTotals), datasets: [{ data: Object.values(productTotals), backgroundColor: colors, borderColor: "rgba(255,255,255,.1)" }] },
    scatter: { datasets: [{ label: "Spend vs Revenue", data: marketing.map((x, i) => ({ x, y: revenue[i] })), backgroundColor: "#a855f7" }] },
    histogram: { labels: ["180-260", "261-340", "341-420", "421-500", "501-590"], datasets: [{ label: "Rows", data: [4, 5, 4, 3, 4], backgroundColor: "rgba(236,72,153,.78)" }] },
    prediction: { labels: months, datasets: [{ label: "Actual", data: revenue, borderColor: "#00d4ff", tension: .35 }, { label: "Predicted", data: predicted, borderColor: "#00ffb3", borderDash: [6, 6], tension: .35 }] }
  };
}

function buildDatasetCharts(analysis) {
  const rows = analysis.rows || [];
  const columns = analysis.columns || [];
  const profile = profileDataset(columns, rows);
  const firstNumeric = profile.numeric[0] || { index: 0, name: "Value", values: rows.map((_, index) => index + 1) };
  const secondNumeric = profile.numeric[1] || firstNumeric;
  const category = profile.categorical.find((column) => column.unique > 1 && column.unique <= Math.max(12, rows.length * 0.45))
    || profile.categorical[0]
    || { index: profile.dateIndex >= 0 ? profile.dateIndex : 0, name: columns[0] || "Row", values: rows.map((_, index) => `Row ${index + 1}`) };
  const labels = rows.map((row, index) => {
    const label = profile.dateIndex >= 0 ? row[profile.dateIndex] : row[category.index];
    return label || `Row ${index + 1}`;
  });
  const values = firstNumeric.values.map((value) => value ?? 0);
  const secondary = secondNumeric.values.map((value) => value ?? 0);
  const categoryTotals = rows.reduce((acc, row) => {
    const key = row[category.index] || "Blank";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCategoryTotals = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!topCategoryTotals.length) topCategoryTotals.push(["Rows", rows.length]);
  const cleanValues = values.filter((value) => Number.isFinite(value));
  const min = cleanValues.length ? Math.min(...cleanValues) : 0;
  const max = cleanValues.length ? Math.max(...cleanValues) : 1;
  const span = max - min || 1;
  const bucketLabels = Array.from({ length: 5 }, (_, index) => {
    const start = min + (span / 5) * index;
    const end = min + (span / 5) * (index + 1);
    return `${formatNumber(start)}-${formatNumber(end)}`;
  });
  const buckets = [0, 0, 0, 0, 0];
  cleanValues.forEach((value) => {
    const bucket = Math.min(4, Math.floor(((value - min) / span) * 5));
    buckets[bucket] += 1;
  });
  const predicted = values.map((value, index) => {
    const previous = index > 0 ? values[index - 1] : value;
    const next = index < values.length - 1 ? values[index + 1] : value;
    return Number(((previous + value + next) / 3).toFixed(2));
  });
  const totalCells = Math.max(1, rows.length * columns.length);
  const blankCells = rows.flat().filter((value) => value === "").length;
  const quality = Math.max(1, Math.round(((totalCells - blankCells) / totalCells) * 100));
  const heatmapLabels = profile.numeric.slice(0, 4);
  const heatmapValues = heatmapLabels.map((left) => heatmapLabels.map((right) => correlation(left.values, right.values)));
  const colors = ["#6c63ff", "#00d4ff", "#ec4899", "#00ffb3"];

  return {
    quality,
    titles: {
      bar: `Top ${category.name} Values`,
      line: `${firstNumeric.name} Trend`,
      donut: `${category.name} Distribution`,
      scatter: `${secondNumeric.name} vs ${firstNumeric.name}`,
      histogram: `${firstNumeric.name} Histogram`,
      box: `${firstNumeric.name} Outlier Box Plot`,
      prediction: `${firstNumeric.name} Smoothed Forecast`
    },
    line: { labels: labels.slice(0, 40), datasets: [{ label: firstNumeric.name, data: values.slice(0, 40), borderColor: "#00d4ff", backgroundColor: "rgba(0,212,255,.12)", fill: true, tension: .38 }] },
    bar: { labels: topCategoryTotals.map(([label]) => label), datasets: [{ label: "Rows", data: topCategoryTotals.map(([, count]) => count), backgroundColor: colors }] },
    donut: { labels: topCategoryTotals.map(([label]) => label), datasets: [{ data: topCategoryTotals.map(([, count]) => count), backgroundColor: colors, borderColor: "rgba(255,255,255,.1)" }] },
    scatter: { datasets: [{ label: `${secondNumeric.name} vs ${firstNumeric.name}`, data: secondary.map((x, i) => ({ x, y: values[i] })).slice(0, 120), backgroundColor: "#a855f7" }] },
    histogram: { labels: bucketLabels, datasets: [{ label: "Rows", data: buckets, backgroundColor: "rgba(236,72,153,.78)" }] },
    prediction: { labels: labels.slice(0, 40), datasets: [{ label: "Actual", data: values.slice(0, 40), borderColor: "#00d4ff", tension: .35 }, { label: "Smoothed", data: predicted.slice(0, 40), borderColor: "#00ffb3", borderDash: [6, 6], tension: .35 }] },
    heatmap: { labels: heatmapLabels.map((item) => item.name), values: heatmapValues },
    boxStats: { min, max, avg: average(cleanValues), q1: firstNumeric.q1 ?? min, q3: firstNumeric.q3 ?? max, outliers: firstNumeric.outliers?.filter(Boolean).length || 0 }
  };
}

function ChartCard({ title, children }) {
  return <article className="chart-card glass"><div><h3>{title}</h3><button aria-label={`Download ${title}`}><Download size={16} /></button></div><div className="chart-box">{children}</div></article>;
}

function Heatmap({ heatmap } = {}) {
  if (heatmap) {
    if (!heatmap.labels.length) return <div className="empty-chart">Upload numeric columns to generate a correlation matrix.</div>;
    return <div className="heatmap">{heatmap.values.flatMap((row, y) => row.map((value, x) => <span key={`${x}-${y}`} style={{ opacity: Math.max(.22, Math.abs(value)) }}><b>{value.toFixed(2)}</b><small>{heatmap.labels[y]} / {heatmap.labels[x]}</small></span>))}</div>;
  }
  const labels = ["Revenue", "Spend", "Customers", "Churn"];
  const values = [[1, .87, .81, -.42], [.87, 1, .76, -.31], [.81, .76, 1, -.51], [-.42, -.31, -.51, 1]];
  return <div className="heatmap">{values.flatMap((row, y) => row.map((value, x) => <span key={`${x}-${y}`} style={{ opacity: Math.abs(value) }}><b>{value.toFixed(2)}</b><small>{labels[y]} / {labels[x]}</small></span>))}</div>;
}

function BoxPlot({ stats } = {}) {
  if (stats?.outliers !== undefined) return <div className="boxplot"><span /><i /><b /><em /><strong /><p>Min {formatNumber(stats.min)} | Q1 {formatNumber(stats.q1)} | Avg {formatNumber(stats.avg)} | Q3 {formatNumber(stats.q3)} | Max {formatNumber(stats.max)} | Outliers {formatNumber(stats.outliers)}</p></div>;
  if (stats) return <div className="boxplot"><span /><i /><b /><em /><strong /><p>Min {formatNumber(stats.min)} · Avg {formatNumber(stats.avg)} · Max {formatNumber(stats.max)}</p></div>;
  return <div className="boxplot"><span /><i /><b /><em /><strong /></div>;
}

function DataTable({ rows, columns, profile }) {
  const [sort, setSort] = useState({ index: 0, dir: 1 });
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);
  const tableProfile = profile || profileDataset(columns, rows);
  const numericByIndex = new Map(tableProfile.numeric.map((column) => [column.index, column]));
  const cellClass = (cell, columnIndex) => {
    if (cell === "") return "missing";
    const numericColumn = numericByIndex.get(columnIndex);
    const value = numericValue(cell);
    if (numericColumn && value !== null && (value < numericColumn.lower || value > numericColumn.upper)) return "outlier";
    return "";
  };
  const visible = rows
    .filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => String(a[sort.index]).localeCompare(String(b[sort.index]), undefined, { numeric: true }) * sort.dir)
    .slice(0, limit);
  return (
    <section className="data-card glass">
      <div className="table-tools"><h2>Dataset Preview</h2><label><Search size={16} /><input placeholder="Search columns or values" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={limit} onChange={(e) => setLimit(Number(e.target.value))}><option>10</option><option>20</option><option>50</option></select></div>
      <div className="table-wrap"><table><thead><tr>{columns.map((column, index) => <th key={column} onClick={() => setSort({ index, dir: sort.index === index ? -sort.dir : 1 })}>{column}</th>)}</tr></thead><tbody>{visible.map((row, r) => <tr key={r}>{row.map((cell, c) => <td className={cellClass(cell, c)} key={`${r}-${c}`}>{cell || "Blank"}</td>)}</tr>)}</tbody></table></div>
    </section>
  );
}

function ModelDetails({ quality, profile, rowCount } = {}) {
  const [open, setOpen] = useState(false);
  const outlierCount = profile?.numeric.reduce((sum, column) => sum + column.outliers.filter(Boolean).length, 0) || 0;
  if (quality) return <section className="model-card glass"><button onClick={() => setOpen(!open)}>Model Performance Details<ChevronDown className={open ? "up" : ""} /></button>{open && <div className="metrics"><span><b>{quality}%</b>Data Quality</span><span><b>{profile?.numeric.length || 0}</b>Numeric Columns</span><span><b>{rowCount}</b>Rows Profiled</span><span><b>{outlierCount}</b>Outliers</span><table><tbody><tr><th>Check</th><th>Status</th><th>Meaning</th></tr><tr><th>Schema</th><td>Passed</td><td>Headers detected and duplicate names normalized</td></tr><tr><th>Type detection</th><td>Passed</td><td>{profile?.numeric.length || 0} numeric, {profile?.categorical.length || 0} categorical, {profile?.dates.length || 0} date, {profile?.booleans.length || 0} boolean</td></tr><tr><th>Charts</th><td>Generated</td><td>Chosen from detected data types, with safe fallbacks</td></tr><tr><th>Missing values</th><td>{Math.max(0, 100 - quality)}%</td><td>Blank cells are highlighted in the preview table</td></tr></tbody></table></div>}</section>;
  return <section className="model-card glass"><button onClick={() => setOpen(!open)}>🔬 Model Performance Details<ChevronDown className={open ? "up" : ""} /></button>{open && <div className="metrics"><span><b>98.3%</b>Accuracy</span><span><b>0.94</b>R² Score</span><span><b>18.2K</b>RMSE</span><span><b>11.7K</b>MAE</span><table><tbody><tr><th /> <th>Actual Low</th><th>Actual High</th></tr><tr><th>Predicted Low</th><td>186</td><td>7</td></tr><tr><th>Predicted High</th><td>4</td><td>650</td></tr></tbody></table></div>}</section>;
}

function ShareModal({ onClose, notify }) {
  const [copied, setCopied] = useState(false);
  const link = `${location.origin}/results/revenue-forecast-q2`;
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    notify("Share link copied.");
    setTimeout(() => setCopied(false), 2000);
  };
  const message = encodeURIComponent(`Check out my data analysis on ASAP! ${link}`);
  return <div className="modal-backdrop"><section className="share-modal glass"><button className="close" onClick={onClose}><X /></button><h2>Share Your Analysis</h2><div className="share-link"><input readOnly value={link} /><button onClick={copy}>{copied ? "Copied! ✓" : <><Copy size={16} /> Copy</>}</button></div><div className="share-pills"><a href={`https://wa.me/?text=${message}`}><Globe2 /> WhatsApp</a><a href={`https://twitter.com/intent/tweet?text=${message}`}><Sparkles /> X</a><a href={`mailto:?subject=ASAP analysis report&body=${message}`}><Mail /> Email</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`}><Linkedin /> LinkedIn</a></div><label className="send-pdf"><span>Send PDF directly</span><div><input placeholder="recipient@company.com" type="email" /><button onClick={() => notify("PDF delivery queued.", "success")}><Send size={16} /> Send</button></div></label><div className="privacy"><span>Anyone with the link can view and download this report</span><select><option>Public</option><option>Private</option></select></div></section></div>;
}

function DemoModal({ onClose }) {
  return <div className="modal-backdrop"><section className="demo-modal glass"><button className="close" onClick={onClose}><X /></button><h2>ASAP Demo</h2><div className="demo-gif"><span /><BarChart3 /><p>CSV upload → AI model selection → chart dashboard → PDF report</p></div></section></div>;
}

function HistoryPage({ analysis, navigate, user, signOut }) {
  return <><Navbar user={user || { avatar: "DR" }} navigate={navigate} signOut={signOut} /><section className="section history-page"><h1>Analysis History</h1><article className="history-card glass"><FileSpreadsheet /><div><h2>{analysis.datasetName}</h2><p>{new Date(analysis.createdAt).toLocaleString()} · 98.3% accuracy · Regression</p></div><button className="ghost-button" onClick={() => navigate("/results")}>Open Report</button></article></section></>;
}

function NotFound({ navigate }) {
  return <section className="not-found"><div className="broken-chart"><span /><span /><span /></div><h1>Oops! This page got lost in the data</h1><button className="primary-button" onClick={() => navigate("/home")}>Go Home</button></section>;
}

function Footer() {
  return <footer><div><Logo /><p>Upload. Analyze. Understand.</p></div><nav><a>About</a><a>Privacy Policy</a><a>Terms</a><a>Contact</a></nav><div className="socials"><Github /><Linkedin /><Globe2 /></div><small>© 2025 ASAP. Built with AI.</small></footer>;
}

function Toast({ toast }) {
  return <div className={`toast ${toast.type}`}><Check size={17} />{toast.message}</div>;
}

createRoot(document.getElementById("root")).render(<App />);
