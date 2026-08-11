"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Flame,
  Globe,
  HardDrive,
  Layers,
  LineChart as LineChartIcon,
  RefreshCw,
  Server,
  ShieldCheck,
  Signal,
  Sliders,
  Zap,
  Clock,
  Radio,
  FileCode,
  Check,
  Info,
  MapPin
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from "recharts";

// Mock Time-Series Data for Gardu 3-Phase Monitoring
const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeStr = time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    // Add realistic 3-phase variations
    const baseV = 228.5 + Math.sin(i * 0.4) * 3.5;
    const baseI = 45 + Math.cos(i * 0.3) * 14;
    
    data.push({
      time: timeStr,
      vR: +(baseV + (Math.random() * 2 - 1)).toFixed(1),
      vS: +(baseV - 1.2 + (Math.random() * 2 - 1)).toFixed(1),
      vT: +(baseV + 0.8 + (Math.random() * 2 - 1)).toFixed(1),
      iR: +(baseI + (Math.random() * 4 - 2)).toFixed(1),
      iS: +(baseI - 3.5 + (Math.random() * 4 - 2)).toFixed(1),
      iT: +(baseI + 2.1 + (Math.random() * 4 - 2)).toFixed(1),
      powerKW: +((baseV * baseI * 3 * 0.95) / 1000).toFixed(2),
      unbalancePct: +(3.2 + Math.random() * 2.1).toFixed(1),
      anomalyScore: +(0.08 + Math.random() * 0.07).toFixed(2)
    });
  }
  return data;
};

// Gardu List in PLN UP3 Mojokerto (Mengampu 10 ULP: Mojokerto Kota, Mojosari, Pacet, Mojoagung, Jombang, Ngoro, Ploso, Kertosono, Nganjuk, Warujayeng)
const GARDU_LIST = [
  {
    id: "GARDU-MJK-001",
    name: "Gardu Distribusi MJK-001",
    ulp: "ULP Mojokerto Kota",
    location: "Jl. Gajah Mada, Kota Mojokerto",
    ctRatio: "200/5A",
    feeder: "Penyulang Benteng 20kV"
  },
  {
    id: "GARDU-MJS-002",
    name: "Gardu Distribusi MJS-002",
    ulp: "ULP Mojosari",
    location: "Kawasan Industri Ngoro, Kab. Mojokerto",
    ctRatio: "400/5A",
    feeder: "Penyulang Ngoro Industri 20kV"
  },
  {
    id: "GARDU-PCT-003",
    name: "Gardu Distribusi PCT-003",
    ulp: "ULP Pacet",
    location: "Kawasan Wisata Pacet, Kab. Mojokerto",
    ctRatio: "200/5A",
    feeder: "Penyulang Claket 20kV"
  },
  {
    id: "GARDU-MJG-004",
    name: "Gardu Distribusi MJG-004",
    ulp: "ULP Mojoagung",
    location: "Jl. Raya Surabaya-Madiun, Mojoagung, Jombang",
    ctRatio: "250/5A",
    feeder: "Penyulang Gambiran 20kV"
  },
  {
    id: "GARDU-JBG-005",
    name: "Gardu Distribusi JBG-005",
    ulp: "ULP Jombang",
    location: "Jl. KH. Wahid Hasyim, Kab. Jombang",
    ctRatio: "300/5A",
    feeder: "Penyulang Ringin Anom 20kV"
  },
  {
    id: "GARDU-NGR-006",
    name: "Gardu Distribusi NGR-006",
    ulp: "ULP Ngoro (Jombang)",
    location: "Kawasan Pasar Ngoro, Kab. Jombang",
    ctRatio: "250/5A",
    feeder: "Penyulang Pulorejo 20kV"
  },
  {
    id: "GARDU-PLS-007",
    name: "Gardu Distribusi PLS-007",
    ulp: "ULP Ploso",
    location: "Kawasan Industri Ploso Utara, Kab. Jombang",
    ctRatio: "400/5A",
    feeder: "Penyulang Ploso 20kV"
  },
  {
    id: "GARDU-KTS-008",
    name: "Gardu Distribusi KTS-008",
    ulp: "ULP Kertosono",
    location: "Kawasan Stasiun Kertosono, Kab. Nganjuk",
    ctRatio: "300/5A",
    feeder: "Penyulang Kertosono Kota 20kV"
  },
  {
    id: "GARDU-NGJ-009",
    name: "Gardu Distribusi NGJ-009",
    ulp: "ULP Nganjuk",
    location: "Jl. A. Yani, Kab. Nganjuk",
    ctRatio: "250/5A",
    feeder: "Penyulang Anjuk Ladang 20kV"
  },
  {
    id: "GARDU-WRJ-010",
    name: "Gardu Distribusi WRJ-010",
    ulp: "ULP Warujayeng",
    location: "Pasar Warujayeng, Tanjunganom, Kab. Nganjuk",
    ctRatio: "200/5A",
    feeder: "Penyulang Tanjunganom 20kV"
  }
];


export default function DashboardGAPIN() {
  const [selectedGardu, setSelectedGardu] = useState(GARDU_LIST[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "lineage" | "ml" | "node">("overview");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("10:30:00");
  const [bootSeq, setBootSeq] = useState(182731);

  // Initialize data on client mount to avoid SSR hydration mismatch
  useEffect(() => {
    setChartData(generateTimeSeriesData());
    setLastUpdated(new Date().toLocaleTimeString("id-ID"));
  }, []);

  // Live simulation tick every 4 seconds
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
      setBootSeq((prev) => prev + 1);

      setChartData((prevData) => {
        if (!prevData || prevData.length === 0) return generateTimeSeriesData();
        const newV = +(229.8 + (Math.random() * 2 - 1)).toFixed(1);
        const newI = +(46.2 + (Math.random() * 5 - 2.5)).toFixed(1);
        
        const newItem = {
          time: nowStr,
          vR: newV,
          vS: +(newV - 1.1).toFixed(1),
          vT: +(newV + 0.7).toFixed(1),
          iR: newI,
          iS: +(newI - 2.8).toFixed(1),
          iT: +(newI + 1.9).toFixed(1),
          powerKW: +((newV * newI * 3 * 0.96) / 1000).toFixed(2),
          unbalancePct: +(3.6 + Math.random() * 1.4).toFixed(1),
          anomalyScore: +(0.09 + Math.random() * 0.04).toFixed(2)
        };

        return [...prevData.slice(1), newItem];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  const currentSnapshot = chartData.length > 0 ? chartData[chartData.length - 1] : {
    vR: 229.8, vS: 228.7, vT: 230.5,
    iR: 46.2, iS: 43.4, iT: 48.1,
    powerKW: 30.52, unbalancePct: 3.8, anomalyScore: 0.1
  };


  // Canonical JSON Object Sample (PLN Ontology Appendix B - UP3 Mojokerto)
  const canonicalJsonSample = {
    schema_version: "1.0",
    message_id: `${selectedGardu.id}-BOOT42-${bootSeq}`,
    device_id: selectedGardu.id,
    unit_up3: "PLN UP3 MOJOKERTO",
    ulp_name: selectedGardu.ulp,
    feeder_name: selectedGardu.feeder,
    boot_id: "BOOT42",
    sequence_no: bootSeq,
    measurement_point_id: `MP-${selectedGardu.id}-INCOMING`,
    meter_asset_id: "MTR-FORT-FCN300-3E4Y",
    sampled_at: `${new Date().toISOString().split("T")[0]}T${lastUpdated}+07:00`,
    sent_at: `${new Date().toISOString().split("T")[0]}T${lastUpdated}+07:00`,
    configuration: {
      ct_configuration_id: `CTCFG-${selectedGardu.ctRatio}`,
      register_map_version: "FCN300-3E4Y-MODBUS-V1",
      firmware_version: "0.1.0-PLATFORMIO"
    },
    observations: [
      { parameter: "VOLTAGE", phase: "R", scope: "PHASE_TO_NEUTRAL", raw_value: "0x08FA", engineering_value: currentSnapshot.vR, unit: "V", quality: "VALID" },
      { parameter: "VOLTAGE", phase: "S", scope: "PHASE_TO_NEUTRAL", raw_value: "0x08F0", engineering_value: currentSnapshot.vS, unit: "V", quality: "VALID" },
      { parameter: "VOLTAGE", phase: "T", scope: "PHASE_TO_NEUTRAL", raw_value: "0x0902", engineering_value: currentSnapshot.vT, unit: "V", quality: "VALID" },
      { parameter: "CURRENT", phase: "R", scope: "PHASE_LINE", raw_value: "0x01C2", engineering_value: currentSnapshot.iR, unit: "A", quality: "VALID" },
      { parameter: "ACTIVE_POWER", phase: "TOTAL", scope: "THREE_PHASE", raw_value: "0x6E10", engineering_value: currentSnapshot.powerKW, unit: "kW", quality: "VALID" },
      { parameter: "CUMULATIVE_ACTIVE_ENERGY_IMPORT", phase: "TOTAL", scope: "THREE_PHASE", raw_value: "0x07A65B", engineering_value: 128456.72, unit: "kWh", quality: "VALID" }
    ],
    communication: {
      modbus_status: "OK",
      network_status: "CONNECTED_4G_LTE",
      rssi_dbm: -73,
      retry_count: 0
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* TOP BAR / HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  GAPIN <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">PLN UP3 Mojokerto</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-mono">Monitoring Gardu Pintar (10 ULP: Mojokerto, Mojosari, Pacet, Mojoagung, Jombang, Ngoro, Ploso, Kertosono, Nganjuk, Warujayeng)</p>
            </div>
          </div>

          {/* Controls & Quick Indicators */}
          <div className="flex items-center space-x-4">
            {/* Gardu Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedGardu.id}
                onChange={(e) => {
                  const g = GARDU_LIST.find((item) => item.id === e.target.value);
                  if (g) setSelectedGardu(g);
                }}
                className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none cursor-pointer font-medium"
              >
                {GARDU_LIST.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} - {g.ulp} ({g.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Indicator Toggle */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isLive
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${isLive ? "animate-pulse" : ""}`} />
              <span>{isLive ? "LIVE STREAM" : "PAUSED"}</span>
            </button>

            {/* Data Quality Status (PLN Ontology) */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>QUALITY: VALID</span>
            </div>
          </div>
        </div>
      </header>

      {/* SUB-HEADER STATUS BAR (UP3 MOJOKERTO REGIONAL DETAILS) */}
      <div className="bg-slate-900/60 border-b border-slate-800/70 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-2">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span>ULP: <strong className="text-slate-200">{selectedGardu.ulp}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span>Lokasi: <strong className="text-slate-200">{selectedGardu.location}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              <span>Penyulang / CT: <strong className="text-slate-200">{selectedGardu.feeder} ({selectedGardu.ctRatio})</strong></span>
            </span>
          </div>

          <div className="flex items-center space-x-6 font-mono">
            <span className="flex items-center space-x-1">
              <Signal className="h-3.5 w-3.5 text-emerald-400" />
              <span>4G LTE (-73 dBm)</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>RTC: {lastUpdated} WIB</span>
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <div className="flex space-x-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Overview Kelistrikan 3-Fasa</span>
          </button>

          <button
            onClick={() => setActiveTab("lineage")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "lineage"
                ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>Data Lineage & Kanonik PLN</span>
          </button>

          <button
            onClick={() => setActiveTab("ml")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "ml"
                ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Machine Learning & Anomali</span>
          </button>

          <button
            onClick={() => setActiveTab("node")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "node"
                ? "border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Telemetri Hardware Node (ESP32)</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {activeTab === "overview" && (
          <>
            {/* TOP METRIC CARDS (TEGANGAN, ARUS, DAYA, UNBALANCE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* TEGANGAN 3-FASA CARD */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tegangan (Fasa-Netral)</span>
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Zap className="h-4 w-4" />
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-rose-400 font-mono font-bold">V_R</span>
                    <span className="text-xl font-bold font-mono text-slate-100">{currentSnapshot.vR} <span className="text-xs font-normal text-slate-400">V</span></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-amber-400 font-mono font-bold">V_S</span>
                    <span className="text-xl font-bold font-mono text-slate-100">{currentSnapshot.vS} <span className="text-xs font-normal text-slate-400">V</span></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-cyan-400 font-mono font-bold">V_T</span>
                    <span className="text-xl font-bold font-mono text-slate-100">{currentSnapshot.vT} <span className="text-xs font-normal text-slate-400">V</span></span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Standard PLN 220V ±10%</span>
                  <span className="text-emerald-400 font-medium">Nominal Normal</span>
                </div>
              </div>

              {/* ARUS 3-FASA CARD */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arus Listrik (3-Fasa)</span>
                  <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Activity className="h-4 w-4" />
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-rose-400 font-mono font-bold">I_R</span>
                    <span className="text-xl font-bold font-mono text-slate-100">{currentSnapshot.iR} <span className="text-xs font-normal text-slate-400">A</span></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-amber-400 font-mono font-bold">I_S</span>
                    <span className="text-xl font-bold font-mono text-slate-100">{currentSnapshot.iS} <span className="text-xs font-normal text-slate-400">A</span></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-cyan-400 font-mono font-bold">I_T</span>
                    <span className="text-xl font-bold font-mono text-slate-100">{currentSnapshot.iT} <span className="text-xs font-normal text-slate-400">A</span></span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Arus Netral (I_N)</span>
                  <span className="font-mono text-slate-200 font-bold">4.2 A</span>
                </div>
              </div>

              {/* DAYA AKTIFF & POWER FACTOR */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Daya & Faktor Daya</span>
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <LineChartIcon className="h-4 w-4" />
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-400">Daya Aktif Total</span>
                    <div className="text-2xl font-black font-mono text-cyan-400">
                      {currentSnapshot.powerKW} <span className="text-xs font-semibold text-slate-300">kW</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs text-slate-400 block">Power Factor</span>
                      <span className="text-lg font-bold font-mono text-slate-100">0.96</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Frekuensi</span>
                      <span className="text-lg font-bold font-mono text-slate-100">50.01 Hz</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Energi Kumulatif</span>
                  <span className="font-mono text-cyan-300 font-semibold">128,456.72 kWh</span>
                </div>
              </div>

              {/* UNBALANCE & ML ANOMALY SCORE */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Beban Unbalance & Anomali</span>
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Flame className="h-4 w-4" />
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Ketidakseimbangan (Unbalance)</span>
                      <span className="text-xs font-bold font-mono text-emerald-400">{currentSnapshot.unbalancePct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(currentSnapshot.unbalancePct * 5, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Isolation Forest Score</span>
                      <span className="text-xs font-bold font-mono text-cyan-400">{currentSnapshot.anomalyScore}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${currentSnapshot.anomalyScore * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Status Algoritma ML</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Normal (Pola Aman)
                  </span>
                </div>
              </div>
            </div>

            {/* REAL-TIME CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TEGANGAN & ARUS 3-PHASE TIME SERIES (2 COLS) */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-cyan-400" />
                      <span>Grafik Tren Kelistrikan 3-Fasa Real-Time ({selectedGardu.id})</span>
                    </h3>
                    <p className="text-xs text-slate-400">Pemantauan Tegangan (V_R, V_S, V_T) & Fluktuasi Arus di {selectedGardu.ulp}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="flex items-center gap-1 text-rose-400"><span className="h-2 w-2 rounded-full bg-rose-500"></span> R</span>
                    <span className="flex items-center gap-1 text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-500"></span> S</span>
                    <span className="flex items-center gap-1 text-cyan-400"><span className="h-2 w-2 rounded-full bg-cyan-500"></span> T</span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                      <YAxis domain={[215, 240]} stroke="#64748b" fontSize={11} unit="V" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem" }}
                        itemStyle={{ fontSize: "12px", color: "#f8fafc" }}
                      />
                      <Line type="monotone" dataKey="vR" stroke="#f43f5e" strokeWidth={2} dot={false} name="Tegangan Fasa R (V)" />
                      <Line type="monotone" dataKey="vS" stroke="#f59e0b" strokeWidth={2} dot={false} name="Tegangan Fasa S (V)" />
                      <Line type="monotone" dataKey="vT" stroke="#06b6d4" strokeWidth={2} dot={false} name="Tegangan Fasa T (V)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* UNBALANCE & POWER LOAD AREA CHART (1 COL) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2 mb-1">
                    <LineChartIcon className="h-4 w-4 text-emerald-400" />
                    <span>Daya Aktif & Profil Beban (kW)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Profil konsumsi daya total tiga fasa di {selectedGardu.ulp}</p>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} unit="kW" />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                        <Area type="monotone" dataKey="powerKW" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPower)" name="Daya Aktif (kW)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">Beban Puncak Diproyeksikan</span>
                    <span className="font-mono font-bold text-amber-400">17:30 WIB (~33.1 kW)</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 font-semibold text-[11px] transition-all">
                    Detail Forecast
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: DATA LINEAGE & KANONIK PLN UP3 MOJOKERTO */}
        {activeTab === "lineage" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON PAYLOAD KANONIK (ONTOLOGI LAMPIRAN B) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileCode className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Payload JSON Kanonik (PLN UP3 Mojokerto)</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Schema v1.0 Valid
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Format pertukaran data standar dari Edge Controller ESP32 di {selectedGardu.ulp} ke Ingestion Service Next.js dengan pencatatan <code className="text-cyan-300">boot_id</code> & <code className="text-cyan-300">sequence_no</code>.
              </p>

              <pre className="bg-slate-950 border border-slate-800 text-cyan-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(canonicalJsonSample, null, 2)}
              </pre>
            </div>

            {/* AUDIT LINEAGE & PROVENANCE TABLE */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Audit Silsilah Data (Data Lineage UP3 Mojokerto)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  Setiap data pengukuran dapat ditelusuri kembali ke unit PLN UP3 Mojokerto, ULP pengampu, register Modbus asal, dan konfigurasi CT.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Unit Pengelola (UP3)</span>
                    <span className="font-mono text-cyan-400 font-bold">PLN UP3 MOJOKERTO</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Unit Layanan Pelanggan (ULP)</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedGardu.ulp}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Identitas Titik Ukur</span>
                    <span className="font-mono text-slate-200 font-semibold">{canonicalJsonSample.measurement_point_id}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Identitas Sesi Boot (Boot ID)</span>
                    <span className="font-mono text-amber-400 font-semibold">{canonicalJsonSample.boot_id}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Nomor Urut Paket (Sequence No)</span>
                    <span className="font-mono text-cyan-400 font-semibold">#{canonicalJsonSample.sequence_no}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Versi Register Map Modbus</span>
                    <span className="font-mono text-emerald-400 font-semibold">{canonicalJsonSample.configuration.register_map_version}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mt-6 flex items-start space-x-3 text-xs text-cyan-300">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  <strong>Idempotency Enforcement:</strong> Ingestion Service memverifikasi Hash (<code className="text-cyan-200">device_id + boot_id + sequence_no</code>) sebelum menulis ke PostgreSQL server PLN UP3 Mojokerto untuk menjamin keabsahan data time-series.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MACHINE LEARNING & ANOMALY DETECTION */}
        {activeTab === "ml" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ISOLATION FOREST CARD */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">Isolation Forest</h4>
                    <span className="text-[11px] text-slate-400">Unsupervised Anomaly Model</span>
                  </div>
                </div>
                <div className="text-3xl font-black font-mono text-cyan-400 mb-2">0.12 <span className="text-xs font-normal text-slate-400">/ 1.0</span></div>
                <p className="text-xs text-slate-400 mb-4">Skor Anomali Profil Gardu di {selectedGardu.ulp}. Nilai &lt; 0.5 menandakan tren pemakaian beban normal.</p>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Pola Beban Normal
                </div>
              </div>

              {/* XGBOOST CLASSIFIER CARD */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">XGBoost Fault Classifier</h4>
                    <span className="text-[11px] text-slate-400">Supervised Maintenance Model</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-100 mb-2">Indikasi Susut: <span className="text-emerald-400 font-mono">0.0%</span></div>
                <p className="text-xs text-slate-400 mb-4">Klasifikasi Jenis Gangguan: Memeriksa risiko susut non-teknis, pencurian, atau koneksi terminal kabel kendor.</p>
                <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5">
                  Status: Terminal Trafo Aman
                </div>
              </div>

              {/* PROPHET FORECAST CARD */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                    <LineChartIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">Prophet Load Predictor</h4>
                    <span className="text-[11px] text-slate-400">Time-Series Load Forecasting</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-100 mb-2">Prediksi Peak: <span className="text-indigo-400 font-mono">33.1 kW</span></div>
                <p className="text-xs text-slate-400 mb-4">Model memprediksi estimasi puncak beban gardu malam ini pukul 17:30 WIB tanpa melampaui kapasitas CT ({selectedGardu.ctRatio}).</p>
                <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5">
                  Kapasitas CT Aman (66.2%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TELEMETRI HARDWARE NODE (ESP32) */}
        {activeTab === "node" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-slate-100 text-sm mb-4 flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <span>Spesifikasi Hardware Node IoT ({selectedGardu.id})</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Mikrokontroler Utama</span>
                  <span className="font-mono text-slate-200">ESP32-WROOM-32U DevKitC V4</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Modem Telekomunikasi 4G</span>
                  <span className="font-mono text-slate-200">SIMCom A7670C (LTE Cat-1)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Antarmuka RS485</span>
                  <span className="font-mono text-slate-200">Modul XY-017 (MAX485/SP3485)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Real-Time Clock (RTC)</span>
                  <span className="font-mono text-slate-200">DS3231 I2C (Precision TCXO)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Catu Daya (Power Supply)</span>
                  <span className="font-mono text-slate-200">MeanWell LRS-35-5 (5V/7A SMPS)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-slate-100 text-sm mb-4 flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-emerald-400" />
                <span>Telemetri Operasional & Kesehatan Node</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Modbus Read Status</span>
                  <span className="font-mono text-emerald-400 font-bold">OK (0 Errors)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Suhu Internal RTC DS3231</span>
                  <span className="font-mono text-slate-200">31.5 °C</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Sisa Memori SRAM (ESP32)</span>
                  <span className="font-mono text-cyan-400 font-bold">284 KB Free</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Status Penyimpanan Buffer</span>
                  <span className="font-mono text-slate-200">0 Cached Messages</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Protokol Transmisi</span>
                  <span className="font-mono text-slate-200">MQTT over TCP (Port 1883)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center space-x-4">
          <span>Proyek GAPIN © 2026 - PT PLN (Persero) UP3 Mojokerto</span>
          <span>•</span>
          <span>Sesuai Ontologi Pengukuran Gardu PLN v0.1</span>
        </div>
        <div className="flex items-center space-x-4 font-mono">
          <span>PostgreSQL Time-Series DB Connected</span>
          <span>•</span>
          <span className="text-emerald-400">System Healthy</span>
        </div>
      </footer>
    </div>
  );
}
