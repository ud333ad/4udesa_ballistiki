import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import {
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function BallisticsProjectSite() {
  const [darkMode, setDarkMode] = useState(false);
  const [velocity, setVelocity] = useState(60);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);
  const [airResistance, setAirResistance] = useState(0.02);
  const [timeScale, setTimeScale] = useState(1);
  const [comparisonMode, setComparisonMode] = useState(true);
  
  // Параметры для сравнительной траектории
  const [compVelocity, setCompVelocity] = useState(45);
  const [compAngle, setCompAngle] = useState(30);
  const [compAirResistance, setCompAirResistance] = useState(0);
  const [compGravity, setCompGravity] = useState(9.81);
  
  // Анимация
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationSpeed] = useState(0.3);

  const radians = (angle * Math.PI) / 180;
  const compRadians = (compAngle * Math.PI) / 180;

  // Основная траектория
  const flightTime = useMemo(() => {
    const v0y = velocity * Math.sin(radians);
    if (airResistance === 0) {
      return (2 * v0y) / gravity;
    }
    // С сопротивлением: находим время когда y=0
    let t = 0;
    let y = 0;
    const dt = 0.01;
    while (true) {
      const drag = Math.exp(-airResistance * t);
      y = velocity * Math.sin(radians) * t * drag - 0.5 * gravity * t * t;
      if (y < 0 && t > 0.1) break;
      t += dt;
      if (t > 100) break;
    }
    return t;
  }, [velocity, radians, gravity, airResistance]);

  const maxHeight = useMemo(() => {
    const v0y = velocity * Math.sin(radians);
    if (airResistance === 0) {
      return (Math.pow(v0y, 2)) / (2 * gravity);
    }
    let maxH = 0;
    for (let t = 0; t <= flightTime; t += 0.01) {
      const drag = Math.exp(-airResistance * t);
      const y = velocity * Math.sin(radians) * t * drag - 0.5 * gravity * t * t;
      if (y > maxH) maxH = y;
    }
    return maxH;
  }, [velocity, radians, gravity, flightTime, airResistance]);

  const range = useMemo(() => {
    const v0x = velocity * Math.cos(radians);
    if (airResistance === 0) {
      return (Math.pow(velocity, 2) * Math.sin(2 * radians)) / gravity;
    }
    const drag = Math.exp(-airResistance * flightTime);
    return v0x * flightTime * drag;
  }, [velocity, radians, gravity, flightTime, airResistance]);

  const trajectoryData = useMemo(() => {
    const points = [];
    const dt = flightTime / 300;
    
    for (let t = 0; t <= flightTime; t += dt) {
      const drag = airResistance > 0 ? Math.exp(-airResistance * t) : 1;
      const x = velocity * Math.cos(radians) * t * drag;
      const y = velocity * Math.sin(radians) * t * drag - 0.5 * gravity * t * t;
      
      if (y >= -0.1) {
        points.push({
          x: Number(x.toFixed(3)),
          y: Number(Math.max(0, y).toFixed(3)),
          t: Number(t.toFixed(3)),
        });
      }
    }
    return points;
  }, [velocity, radians, gravity, flightTime, airResistance]);

  // Сравнительная траектория
  const compFlightTime = useMemo(() => {
    const v0y = compVelocity * Math.sin(compRadians);
    if (compAirResistance === 0) {
      return (2 * v0y) / compGravity;
    }
    let t = 0;
    let y = 0;
    const dt = 0.01;
    while (true) {
      const drag = Math.exp(-compAirResistance * t);
      y = compVelocity * Math.sin(compRadians) * t * drag - 0.5 * compGravity * t * t;
      if (y < 0 && t > 0.1) break;
      t += dt;
      if (t > 100) break;
    }
    return t;
  }, [compVelocity, compRadians, compGravity, compAirResistance]);

  const compMaxHeight = useMemo(() => {
    const v0y = compVelocity * Math.sin(compRadians);
    if (compAirResistance === 0) {
      return (Math.pow(v0y, 2)) / (2 * compGravity);
    }
    let maxH = 0;
    for (let t = 0; t <= compFlightTime; t += 0.01) {
      const drag = Math.exp(-compAirResistance * t);
      const y = compVelocity * Math.sin(compRadians) * t * drag - 0.5 * compGravity * t * t;
      if (y > maxH) maxH = y;
    }
    return maxH;
  }, [compVelocity, compRadians, compGravity, compFlightTime, compAirResistance]);

  const compRange = useMemo(() => {
    const v0x = compVelocity * Math.cos(compRadians);
    if (compAirResistance === 0) {
      return (Math.pow(compVelocity, 2) * Math.sin(2 * compRadians)) / compGravity;
    }
    const drag = Math.exp(-compAirResistance * compFlightTime);
    return v0x * compFlightTime * drag;
  }, [compVelocity, compRadians, compGravity, compFlightTime, compAirResistance]);

  const comparisonTrajectory = useMemo(() => {
    const points = [];
    const dt = compFlightTime / 300;
    
    for (let t = 0; t <= compFlightTime; t += dt) {
      const drag = compAirResistance > 0 ? Math.exp(-compAirResistance * t) : 1;
      const x = compVelocity * Math.cos(compRadians) * t * drag;
      const y = compVelocity * Math.sin(compRadians) * t * drag - 0.5 * compGravity * t * t;
      
      if (y >= -0.1) {
        points.push({
          x: Number(x.toFixed(3)),
          y: Number(Math.max(0, y).toFixed(3)),
          t: Number(t.toFixed(3)),
        });
      }
    }
    return points;
  }, [compVelocity, compRadians, compGravity, compFlightTime, compAirResistance]);

  // Анимация
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setAnimationProgress(0);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        const next = prev + animationSpeed / 100;
        if (next >= 1) {
          setIsAnimating(false);
          return 1;
        }
        return next;
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [isAnimating, animationSpeed]);

  const projectilePosition = useMemo(() => {
    if (!isAnimating && animationProgress === 0) {
      return trajectoryData[0] || { x: 0, y: 0 };
    }
    const index = Math.floor(animationProgress * (trajectoryData.length - 1));
    return trajectoryData[Math.min(index, trajectoryData.length - 1)] || { x: 0, y: 0 };
  }, [animationProgress, trajectoryData, isAnimating]);

  const compProjectilePosition = useMemo(() => {
    if (!isAnimating && animationProgress === 0) {
      return comparisonTrajectory[0] || { x: 0, y: 0 };
    }
    const index = Math.floor(animationProgress * (comparisonTrajectory.length - 1));
    return comparisonTrajectory[Math.min(index, comparisonTrajectory.length - 1)] || { x: 0, y: 0 };
  }, [animationProgress, comparisonTrajectory, isAnimating]);

  // Максимальные значения для SVG
  const maxX = Math.max(range, comparisonMode ? compRange : 0) * 1.1;
  const maxY = Math.max(maxHeight, comparisonMode ? compMaxHeight : 0) * 1.2;

  // Тема
  const theme = {
    bg: darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950' : 'bg-gradient-to-br from-slate-50 via-white to-cyan-50',
    text: darkMode ? 'text-white' : 'text-slate-900',
    textSecondary: darkMode ? 'text-slate-300' : 'text-slate-600',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-500',
    border: darkMode ? 'border-white/10' : 'border-slate-300/50',
    cardBg: darkMode ? 'bg-white/5' : 'bg-white/80',
    cardBgDark: darkMode ? 'bg-slate-950/70' : 'bg-white',
    buttonOutline: darkMode ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-50',
    headerBg: darkMode ? 'bg-white/5' : 'bg-white/80',
    footerBg: darkMode ? 'bg-black/20' : 'bg-slate-100',
    statBg: darkMode ? 'bg-slate-950/70' : 'bg-white',
    inputBg: darkMode ? 'bg-slate-900/60' : 'bg-slate-100',
    codeBg: darkMode ? 'bg-slate-950/70' : 'bg-slate-100',
    codeText: darkMode ? 'text-cyan-300' : 'text-cyan-700',
    accent: 'text-cyan-300',
    accentDark: darkMode ? 'text-cyan-300' : 'text-cyan-600',
    gridStroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    tooltipBg: darkMode ? '#1e293b' : '#ffffff',
    tooltipBorder: darkMode ? '#334155' : '#cbd5e1',
  };

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen overflow-hidden transition-all duration-500`}>
      <div className={`absolute inset-0 ${darkMode ? 'bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.2),transparent_30%)]' : 'bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.05),transparent_30%)]'}`} />

      <header className={`relative z-10 border-b backdrop-blur-md ${theme.border} ${theme.headerBg}`}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Баллистика
            </h1>
          </div>

          <div className="hidden md:flex gap-4 items-center text-sm">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              {darkMode ? '☀️ Светлая тема' : '🌙 Тёмная тема'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-200 text-sm mb-6">
              Интерактивная симуляция движения
            </div>

            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              Баллистика и
              <span className="block bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                полет снаряда
              </span>
            </h2>

            <p className={`mt-6 text-lg ${theme.textSecondary} leading-relaxed max-w-xl`}>
              Изучайте движение тела, брошенного под углом к горизонту. Изменяйте параметры,
              анализируйте графики и наблюдайте, как меняется траектория полета снаряда.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button 
                onClick={startAnimation}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-2xl shadow-cyan-500/30 hover:scale-105 transition-transform"
              >
                {isAnimating ? '🔄 Перезапустить' : '▶ Запустить симуляцию'}
              </button>

            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />

            <div className={`relative rounded-3xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl p-6 shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${theme.text}`}>Симуляция траектории</h3>
                  <p className={`${theme.textMuted} text-sm`}>Движение снаряда в реальном времени</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isAnimating ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
              </div>

             

              {/* 2D SVG Симуляция */}
              <div className={`rounded-3xl border border-cyan-500/20 p-4 overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                <svg viewBox={`0 0 600 340`} className="w-full h-[340px]">
                  <defs>
                    <linearGradient id="trajectoryGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="compTrajectoryGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>

                  {/* Сетка */}
                  {[...Array(12)].map((_, i) => (
                    <line key={i} x1={40} y1={i * 25 + 20} x2={580} y2={i * 25 + 20}
                      stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                  ))}
                  {[...Array(20)].map((_, i) => (
                    <line key={i + 'v'} x1={i * 27 + 40} y1={20} x2={i * 27 + 40} y2={295}
                      stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  ))}

                  {/* Оси */}
                  <line x1="40" y1="295" x2="580" y2="295" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="40" y1="20" x2="40" y2="295" stroke="#94a3b8" strokeWidth="2" />

                  {/* Подписи */}
                  <text x="50" y="15" fill={darkMode ? "#cbd5e1" : "#475569"} fontSize="12">Высота (м)</text>
                  <text x="500" y="315" fill={darkMode ? "#cbd5e1" : "#475569"} fontSize="12">Дальность (м)</text>

                  {/* Траектории */}
                  {trajectoryData.length > 1 && (
                    <path
                      d={`M ${trajectoryData.map(p => `${40 + (p.x / maxX) * 520},${295 - (p.y / maxY) * 275}`).join(' L ')}`}
                      fill="none" stroke="url(#trajectoryGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.8"
                    />
                  )}

                  {comparisonMode && comparisonTrajectory.length > 1 && (
                    <path
                      d={`M ${comparisonTrajectory.map(p => `${40 + (p.x / maxX) * 520},${295 - (p.y / maxY) * 275}`).join(' L ')}`}
                      fill="none" stroke="url(#compTrajectoryGrad)" strokeWidth="2" strokeLinecap="round" 
                      strokeDasharray="8,4" opacity="0.7"
                    />
                  )}

                  {/* Снаряд */}
                  <circle
                    cx={40 + (projectilePosition.x / maxX) * 520}
                    cy={295 - (projectilePosition.y / maxY) * 275}
                    r="8"
                    fill="#f8fafc"
                    stroke="#06b6d4"
                    strokeWidth="2"
                  />

                  {/* Снаряд сравнения */}
                  {comparisonMode && (
                    <circle
                      cx={40 + (compProjectilePosition.x / maxX) * 520}
                      cy={295 - (compProjectilePosition.y / maxY) * 275}
                      r="6"
                      fill="#f472b6"
                      stroke="#ec4899"
                      strokeWidth="2"
                    />
                  )}
                </svg>
              </div>

              {/* Легенда */}
              <div className="flex gap-6 mt-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-cyan-500 rounded" />
                  <span className={theme.textMuted}>Основная</span>
                </div>
                {comparisonMode && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-pink-500 rounded" style={{borderStyle: 'dashed'}} />
                    <span className={theme.textMuted}>Сравнение</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-8">
          {/* 3D Симуляция Полета */}
<div className={`rounded-3xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl p-8`}>
  <h3 className={`text-3xl font-black mb-6 ${theme.text}`}>🎯 3D Симуляция Полета</h3>

  <div className="h-[500px] rounded-3xl overflow-hidden border border-cyan-500/20">
    <Canvas 
      camera={{ 
        position: [range / 3, Math.max(maxHeight, compMaxHeight) / 2 + 8, 45],
        fov: 55
      }}
      gl={{ antialias: true }}
    >
      {/* Пасмурное небо */}
      <color attach="background" args={['#1e3a5f']} />
      
      {/* Освещение как в пасмурный день */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[20, 15, 10]} intensity={1.5} />
      <hemisphereLight args={['#4a7ba7', '#1a2f44', 0.6]} />
      
      <OrbitControls 
        enableDamping 
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={120}
        target={[
          (projectilePosition.x + (comparisonMode ? compProjectilePosition.x : 0)) / (comparisonMode ? 2 : 1),
          Math.max(projectilePosition.y, comparisonMode ? compProjectilePosition.y : 0),
          0
        ]}
      />

      {/* Земля тёмная */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[Math.max(range, compRange) / 2, -0.5, 0]}>
        <planeGeometry args={[Math.max(range, compRange) * 2, 60]} />
        <meshStandardMaterial color="#2d4a3e" />
      </mesh>

      {/* Линия земли */}
      <Line
        points={[[-5, 0, 0], [Math.max(range, compRange) + 10, 0, 0]]}
        color="#5a7a6e"
        lineWidth={1.5}
      />

      {/* ███ Основная траектория (голубая, яркая) ███ */}
      {trajectoryData.length > 1 && (
        <>
          {/* Внешнее свечение */}
          <Line
            points={trajectoryData.map((p) => [p.x, p.y, 0])}
            color="#67e8f9"
            lineWidth={8}
            transparent
            opacity={0.3}
          />
          {/* Основная линия */}
          <Line
            points={trajectoryData.map((p) => [p.x, p.y, 0])}
            color="#06b6d4"
            lineWidth={5}
          />
        </>
      )}

      {/* ███ Розовая траектория (тоже яркая) ███ */}
      {comparisonMode && comparisonTrajectory.length > 1 && (
        <>
          <Line
            points={comparisonTrajectory.map((p) => [p.x, p.y, 0])}
            color="#fda4d2"
            lineWidth={7}
            transparent
            opacity={0.3}
          />
          <Line
            points={comparisonTrajectory.map((p) => [p.x, p.y, 0])}
            color="#f472b6"
            lineWidth={4}
            dashed
          />
        </>
      )}

      {/* Точки на основной траектории */}
      {trajectoryData.filter((_, i) => i % 20 === 0).map((p, i) => (
        <mesh key={`dot-main-${i}`} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      ))}

      {/* Точки на розовой траектории */}
      {comparisonMode && comparisonTrajectory.filter((_, i) => i % 20 === 0).map((p, i) => (
        <mesh key={`dot-comp-${i}`} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#f9a8d4" />
        </mesh>
      ))}

      {/* След синего */}
      {trajectoryData.slice(
        Math.max(0, Math.floor(animationProgress * (trajectoryData.length - 1)) - 20),
        Math.floor(animationProgress * (trajectoryData.length - 1))
      ).map((p, i) => (
        <mesh key={`trail-main-${i}`} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.25, 6, 6]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={i / 20 * 0.6} />
        </mesh>
      ))}

      {/* След розового */}
      {comparisonMode && comparisonTrajectory.slice(
        Math.max(0, Math.floor(animationProgress * (comparisonTrajectory.length - 1)) - 20),
        Math.floor(animationProgress * (comparisonTrajectory.length - 1))
      ).map((p, i) => (
        <mesh key={`trail-comp-${i}`} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshBasicMaterial color="#f9a8d4" transparent opacity={i / 20 * 0.6} />
        </mesh>
      ))}

      {/* 🚀 СИНИЙ СНАРЯД */}
      <group position={[projectilePosition.x, projectilePosition.y, 0]}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial 
            color="#22d3ee" 
            emissive="#06b6d4"
            emissiveIntensity={2.0}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.35} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.3, 16, 16]} />
          <meshBasicMaterial color="#a5f0ff" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* 🎀 РОЗОВЫЙ СНАРЯД */}
      {comparisonMode && (
        <group position={[compProjectilePosition.x, compProjectilePosition.y, 0]}>
          <mesh>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshStandardMaterial 
              color="#f9a8d4" 
              emissive="#f472b6"
              emissiveIntensity={2.0}
              roughness={0.1}
              metalness={0.2}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.85, 16, 16]} />
            <meshBasicMaterial color="#fbcfe8" transparent opacity={0.35} />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshBasicMaterial color="#fce7f3" transparent opacity={0.15} />
          </mesh>
        </group>
      )}

      {/* Стартовая точка */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color="#34d399" side={2} />
      </mesh>
    </Canvas>
  </div>
  
  <div className="flex gap-8 mt-5 justify-center text-sm flex-wrap">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60" />
      <span className={theme.textMuted}>Основной снаряд</span>
    </div>
    {comparisonMode && (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-pink-400 shadow-lg shadow-pink-400/60" />
        <span className={theme.textMuted}>Сравнительный снаряд</span>
      </div>
    )}
    <div className="flex items-center gap-2">
      <div className="w-4 h-1 bg-cyan-400 rounded shadow-lg shadow-cyan-400/50" />
      <span className={theme.textMuted}>Траектория синего</span>
    </div>
    {comparisonMode && (
      <div className="flex items-center gap-2">
        <div className="w-4 h-1 bg-pink-400 rounded shadow-lg shadow-pink-400/50" />
        <span className={theme.textMuted}>Траектория розового</span>
      </div>
    )}
  </div>
</div>

          {/* Параметры */}
          <div className="space-y-8">
            <div className={`rounded-3xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl p-8`}>
              <h3 className={`text-2xl font-black mb-6 ${theme.text}`}>🎯 Основная траектория</h3>

              <div className="space-y-5">
                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Начальная скорость: {velocity} м/с</label>
                  <input type="range" min="10" max="120" value={velocity}
                    onChange={(e) => setVelocity(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>

                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Угол запуска: {angle}°</label>
                  <input type="range" min="5" max="85" value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>

                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Гравитация: {gravity} м/с²</label>
                  <input type="range" min="1" max="20" step="0.1" value={gravity}
                    onChange={(e) => setGravity(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>

                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Сопротивление воздуха: {airResistance.toFixed(3)}</label>
                  <input type="range" min="0" max="0.1" step="0.005" value={airResistance}
                    onChange={(e) => setAirResistance(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className={`rounded-2xl ${theme.statBg} p-4 border ${theme.border}`}>
                  <p className={`${theme.textMuted} text-sm`}>Дальность</p>
                  <h4 className={`text-xl font-black ${theme.accentDark} mt-1`}>{range.toFixed(2)} м</h4>
                </div>
                <div className={`rounded-2xl ${theme.statBg} p-4 border ${theme.border}`}>
                  <p className={`${theme.textMuted} text-sm`}>Высота</p>
                  <h4 className={`text-xl font-black ${theme.accentDark} mt-1`}>{maxHeight.toFixed(2)} м</h4>
                </div>
                <div className={`rounded-2xl ${theme.statBg} p-4 border ${theme.border}`}>
                  <p className={`${theme.textMuted} text-sm`}>Время</p>
                  <h4 className={`text-xl font-black ${theme.accentDark} mt-1`}>{flightTime.toFixed(2)} c</h4>
                </div>
              </div>
            </div>

            {/* Сравнительная траектория */}
            <div className={`rounded-3xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-black ${theme.text}`}>🔍 Сравнительная траектория</h3>
                <button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${comparisonMode ? 'bg-pink-500 text-white' : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700')}`}
                >
                  {comparisonMode ? 'Включено' : 'Выключено'}
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Скорость: {compVelocity} м/с</label>
                  <input type="range" min="10" max="120" value={compVelocity}
                    onChange={(e) => setCompVelocity(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>

                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Угол: {compAngle}°</label>
                  <input type="range" min="5" max="85" value={compAngle}
                    onChange={(e) => setCompAngle(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>

                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Гравитация: {compGravity} м/с²</label>
                  <input type="range" min="1" max="20" step="0.1" value={compGravity}
                    onChange={(e) => setCompGravity(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>

                <div>
                  <label className={`text-sm ${theme.textMuted}`}>Сопротивление воздуха: {compAirResistance.toFixed(3)}</label>
                  <input type="range" min="0" max="0.1" step="0.005" value={compAirResistance}
                    onChange={(e) => setCompAirResistance(Number(e.target.value))}
                    className="w-full mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className={`rounded-2xl ${theme.statBg} p-4 border border-pink-500/30`}>
                  <p className={`${theme.textMuted} text-sm`}>Дальность</p>
                  <h4 className={`text-xl font-black text-pink-400 mt-1`}>{compRange.toFixed(2)} м</h4>
                </div>
                <div className={`rounded-2xl ${theme.statBg} p-4 border border-pink-500/30`}>
                  <p className={`${theme.textMuted} text-sm`}>Высота</p>
                  <h4 className={`text-xl font-black text-pink-400 mt-1`}>{compMaxHeight.toFixed(2)} м</h4>
                </div>
                <div className={`rounded-2xl ${theme.statBg} p-4 border border-pink-500/30`}>
                  <p className={`${theme.textMuted} text-sm`}>Время</p>
                  <h4 className={`text-xl font-black text-pink-400 mt-1`}>{compFlightTime.toFixed(2)} c</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* График траектории */}
<section className={`rounded-3xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl p-8`}>
  <h3 className={`text-3xl font-black mb-6 ${theme.text}`}>📊 График траектории</h3>
  <p className={`${theme.textMuted} mb-4`}>Расчеты обновляются в реальном времени</p>

  <div className="grid grid-cols-2 gap-8">
    {/* График основной траектории */}
    <div className="h-[450px]">
      <h4 className={`text-lg font-semibold mb-3 ${theme.textSecondary}`}>Основная траектория</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trajectoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} />
          <XAxis dataKey="x" stroke={darkMode ? '#94a3b8' : '#64748b'} 
            label={{ value: 'Дальность (м)', position: 'bottom', fill: darkMode ? '#94a3b8' : '#64748b' }} />
          <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'}
            label={{ value: 'Высота (м)', angle: -90, position: 'insideLeft', fill: darkMode ? '#94a3b8' : '#64748b' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.tooltipBg, 
              border: `1px solid ${theme.tooltipBorder}`,
              color: darkMode ? '#f1f5f9' : '#0f172a'
            }} 
          />
          <RechartsLine
            name="Основная"
            type="monotone"
            dataKey="y"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* График сравнительной траектории */}
    <div className="h-[450px]">
      <h4 className={`text-lg font-semibold mb-3 ${theme.textSecondary}`}>Сравнительная траектория</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={comparisonTrajectory}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} />
          <XAxis dataKey="x" stroke={darkMode ? '#94a3b8' : '#64748b'}
            label={{ value: 'Дальность (м)', position: 'bottom', fill: darkMode ? '#94a3b8' : '#64748b' }} />
          <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'}
            label={{ value: 'Высота (м)', angle: -90, position: 'insideLeft', fill: darkMode ? '#94a3b8' : '#64748b' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.tooltipBg, 
              border: `1px solid ${theme.tooltipBorder}`,
              color: darkMode ? '#f1f5f9' : '#0f172a'
            }} 
          />
          <RechartsLine
            name="Сравнительная"
            type="monotone"
            dataKey="y"
            stroke="#f472b6"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
  
  {/* Совмещенный график для сравнения */}
  <div className="mt-8">
    <h4 className={`text-lg font-semibold mb-3 ${theme.textSecondary}`}>Сравнение траекторий</h4>
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} />
          <XAxis dataKey="x" stroke={darkMode ? '#94a3b8' : '#64748b'} 
            label={{ value: 'Дальность (м)', position: 'bottom', fill: darkMode ? '#94a3b8' : '#64748b' }}
            type="number" />
          <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'}
            label={{ value: 'Высота (м)', angle: -90, position: 'insideLeft', fill: darkMode ? '#94a3b8' : '#64748b' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.tooltipBg, 
              border: `1px solid ${theme.tooltipBorder}`,
              color: darkMode ? '#f1f5f9' : '#0f172a'
            }} 
          />
          <Legend />
          <RechartsLine
            name="Основная"
            data={trajectoryData}
            type="monotone"
            dataKey="y"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={false}
          />
          {comparisonMode && (
            <RechartsLine
              name="Сравнительная"
              data={comparisonTrajectory}
              type="monotone"
              dataKey="y"
              stroke="#f472b6"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</section>

        {/* Карточки теории */}
        <section className="grid lg:grid-cols-3 gap-6">
          {[
            { title: 'Основы баллистики', text: 'Баллистика изучает движение тел, брошенных под действием силы тяжести. Траектория полета представляет собой параболу.' },
            { title: 'Влияние угла', text: 'Максимальная дальность достигается при угле запуска 45°. Изменение угла влияет на высоту и время полета.' },
            { title: 'Сопротивление воздуха', text: 'В реальных условиях сопротивление воздуха изменяет траекторию и уменьшает дальность полета снаряда.' },
          ].map((card) => (
            <div key={card.title} className={`group rounded-3xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl p-6 hover:border-cyan-400/40 transition-all duration-300 hover:-translate-y-2`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/20 flex items-center justify-center mb-5 border border-cyan-400/20">
                <div className="w-6 h-6 rounded-full bg-cyan-400" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>{card.title}</h3>
              <p className={`${theme.textSecondary} leading-relaxed`}>{card.text}</p>
            </div>
          ))}
        </section>

        {/* Формулы */}
        <section className="grid lg:grid-cols-2 gap-8">
          <div className={`rounded-3xl border ${theme.border} ${theme.cardBg} backdrop-blur-xl p-8`}>
            <h3 className={`text-3xl font-black mb-6 ${theme.text}`}>Формулы движения</h3>
            <div className="space-y-6">
              <div className={`${theme.codeBg} rounded-2xl p-5 border ${theme.border}`}>
                <p className={`${theme.textMuted} text-sm mb-2`}>Дальность полета</p>
                <p className={`font-mono ${theme.codeText} text-lg`}>L = (v² · sin(2α)) / g</p>
              </div>
              <div className={`${theme.codeBg} rounded-2xl p-5 border ${theme.border}`}>
                <p className={`${theme.textMuted} text-sm mb-2`}>Максимальная высота</p>
                <p className={`font-mono ${theme.codeText} text-lg`}>H = (v² · sin²(α)) / 2g</p>
              </div>
              <div className={`${theme.codeBg} rounded-2xl p-5 border ${theme.border}`}>
                <p className={`${theme.textMuted} text-sm mb-2`}>Время полета</p>
                <p className={`font-mono ${theme.codeText} text-lg`}>t = (2v · sin(α)) / g</p>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border ${theme.border} bg-gradient-to-br from-cyan-500/10 to-blue-900/20 p-8 overflow-hidden relative`}>
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/20 blur-3xl rounded-full" />
            <div className="relative z-10">
              <h3 className={`text-3xl font-black mb-6 ${theme.text}`}>Возможности проекта</h3>
              <div className="space-y-5">
                {['Интерактивные графики', 'Сравнение траекторий', '3D визуализация', 'Теоретические блоки', 'Современный адаптивный дизайн'].map((item) => (
                  <div key={item} className={`flex items-center gap-4 ${theme.cardBg} rounded-2xl border ${theme.border} px-5 py-4`}>
                    <div className="w-3 h-3 rounded-full bg-cyan-400" />
                    <p className={theme.textSecondary}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={`relative z-10 border-t ${theme.border} mt-16 ${theme.footerBg} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-cyan-500">Баллистика</h4>
          </div>
          <div className={`${theme.textMuted} text-sm`}>© 2026 Белов Дмитрий, студент гр. 1-090207</div>
        </div>
      </footer>
    </div>
  );
}