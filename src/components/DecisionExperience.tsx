'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  ContactShadows, 
  Html,
  RoundedBox,
  Torus
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Maximize2, Layers, CheckCircle2, ChevronRight, Minus, Plus } from 'lucide-react';
import gsap from 'gsap';

// --- Types ---
interface HotspotProps {
  position: [number, number, number];
  title: string;
  onClick: () => void;
  active: boolean;
}

// --- Components ---

const Hotspot: React.FC<HotspotProps> = ({ position, title, onClick, active }) => {
  return (
    <Html position={position} center distanceFactor={8}>
      <div className="flex flex-col items-center group cursor-pointer" onClick={onClick}>
        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${active ? 'bg-blue-500 border-white scale-125 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'bg-white/20 border-white/40 hover:bg-white/40'}`}>
          {active && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
        </div>
        <div className={`mt-2 px-2 py-1 glass rounded text-[8px] font-bold uppercase tracking-tighter transition-opacity duration-300 whitespace-nowrap ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {title}
        </div>
      </div>
    </Html>
  );
};

function WalletModel({ 
  mode, 
  showRFID, 
  showCards, 
  isAttached 
}: { 
  mode: 'closed' | 'open', 
  showRFID: boolean, 
  showCards: boolean, 
  isAttached: boolean 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const internalRef = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Gentle rotation if not being interacted with? 
    // Actually OrbitControls handles that.
    
    if (shieldRef.current) {
        shieldRef.current.visible = showRFID;
        if (showRFID) {
            const pulse = (Math.sin(t * 10) + 1) * 0.5;
            (shieldRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + pulse * 4;
        }
    }
  });

  // GSAP animations for transitions
  useEffect(() => {
    if (!internalRef.current) return;
    
    if (showCards) {
      gsap.to(internalRef.current.position, { x: 1.2, duration: 0.5, ease: "power3.out" });
    } else {
      gsap.to(internalRef.current.position, { x: 0, duration: 0.5, ease: "power3.inOut" });
    }
  }, [showCards]);

  return (
    <group ref={groupRef}>
      {/* Main Body */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <group scale={isAttached ? 1.05 : 1}>
            <RoundedBox args={[2.2, 3.2, 0.4]} radius={0.15} smoothness={4}>
                <meshStandardMaterial 
                color="#050505" 
                metalness={1} 
                roughness={0.05} 
                envMapIntensity={2}
                />
            </RoundedBox>

            {/* MagSafe Ring */}
            <group position={[0, 0, 0.201]}>
                <Torus args={[0.6, 0.02, 16, 64]}>
                    <meshStandardMaterial color="#4D7FFF" emissive="#4D7FFF" emissiveIntensity={isAttached ? 5 : 1} />
                </Torus>
                <mesh position={[0, -0.8, 0]}>
                    <boxGeometry args={[0.02, 0.4, 0.01]} />
                    <meshStandardMaterial color="#4D7FFF" emissive="#4D7FFF" emissiveIntensity={isAttached ? 5 : 1} />
                </mesh>
            </group>

            {/* Internal Cards Group */}
            <group ref={internalRef}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <mesh key={i} position={[0, 0, 0.15 - i * 0.02]} rotation={[0, 0, showCards ? (i-2.5) * 0.05 : 0]}>
                        <RoundedBox args={[1.7, 2.7, 0.01]} radius={0.05} smoothness={4}>
                            <meshStandardMaterial color={i % 2 === 0 ? "#111" : "#222"} metalness={0.5} roughness={0.5} />
                        </RoundedBox>
                    </mesh>
                ))}
            </group>

            {/* RFID Shield Visualizer */}
            <mesh ref={shieldRef} position={[0, 0, 0]} visible={false}>
                <RoundedBox args={[2.3, 3.3, 0.45]} radius={0.16} smoothness={4}>
                    <meshStandardMaterial 
                        color="#4D7FFF" 
                        emissive="#4D7FFF" 
                        emissiveIntensity={1} 
                        transparent 
                        opacity={0.15} 
                        wireframe
                    />
                </RoundedBox>
            </mesh>

            {/* Side Accent */}
            <mesh position={[-1.11, 0, 0]}>
                <boxGeometry args={[0.02, 2.5, 0.3]} />
                <meshStandardMaterial color="#4D7FFF" emissive="#4D7FFF" emissiveIntensity={0.5} />
            </mesh>

            {/* Ghost iPhone behind if attached */}
            {isAttached && (
                <group position={[0, 0, -1]}>
                    <RoundedBox args={[3.5, 7, 0.4]} radius={0.4} smoothness={4}>
                        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} transparent opacity={0.3} />
                    </RoundedBox>
                </group>
            )}
        </group>
      </Float>
    </group>
  );
}

const DecisionExperience = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  // States for 3D model
  const [showRFID, setShowRFID] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [isAttached, setIsAttached] = useState(false);

  const prices: Record<number, number> = {
    1: 39.99,
    2: 74.99,
    3: 104.99,
    4: 129.99
  };

  const savings: Record<number, string | null> = {
    1: null,
    2: 'SAVE €4.99',
    3: 'SAVE €14.98',
    4: 'SAVE €29.97'
  };

  const handleHotspotClick = (id: string) => {
    setActiveHotspot(activeHotspot === id ? null : id);
    
    // Trigger 3D changes
    if (id === 'rfid') {
        setShowRFID(!showRFID);
        setShowCards(false);
        setIsAttached(false);
    } else if (id === 'mechanism' || id === 'capacity') {
        setShowCards(!showCards);
        setShowRFID(false);
        setIsAttached(false);
    } else if (id === 'magsafe') {
        setIsAttached(!isAttached);
        setShowRFID(false);
        setShowCards(false);
    }
  };

  const handleBuy = () => {
    setIsBuying(true);
    // Smooth zoom and logo reveal would happen here
    setTimeout(() => {
        // In a real app, this might navigate or show a success overlay
        console.log("Purchase Initiated");
    }, 2000);
  };

  return (
    <section id="decision-experience" className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-space-gradient overflow-hidden border-t border-white/5">
      {/* 3D VIEWER (LEFT) */}
      <div className="relative h-[50vh] lg:h-screen border-r border-white/5">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
          <OrbitControls 
            enablePan={false} 
            minDistance={4} 
            maxDistance={12}
            autoRotate={!activeHotspot}
            autoRotateSpeed={0.5}
          />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#4D7FFF" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#08101F" />
          
          <WalletModel 
            mode="closed" 
            showRFID={showRFID} 
            showCards={showCards} 
            isAttached={isAttached} 
          />

          <Hotspot 
            position={[1, 0.5, 0.25]} 
            title="Ejection System" 
            onClick={() => handleHotspotClick('mechanism')} 
            active={activeHotspot === 'mechanism'}
          />
          <Hotspot 
            position={[-1, -1, 0.25]} 
            title="RFID Shielding" 
            onClick={() => handleHotspotClick('rfid')} 
            active={activeHotspot === 'rfid'}
          />
          <Hotspot 
            position={[0, 1.2, -0.25]} 
            title="MagSafe Tech" 
            onClick={() => handleHotspotClick('magsafe')} 
            active={activeHotspot === 'magsafe'}
          />
          <Hotspot 
            position={[0, -0.5, 0.25]} 
            title="6 Card Capacity" 
            onClick={() => handleHotspotClick('capacity')} 
            active={activeHotspot === 'capacity'}
          />

          <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          <Environment preset="night" />
        </Canvas>

        {/* 3D UI Overlay */}
        <div className="absolute bottom-8 left-8 flex gap-4">
            <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                <Maximize2 size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">360 Viewer</span>
            </div>
            <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                <Layers size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Interactive Hotspots</span>
            </div>
        </div>
      </div>

      {/* PURCHASE PANEL (RIGHT) */}
      <div className="relative h-full flex flex-col justify-center px-12 lg:px-24 py-20">
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
        >
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => <Zap key={i} size={14} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">4.9/5 RATING • BATCH 01</span>
                </div>
                <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.9]">
                    Upgrade Your <br />
                    <span className="text-gradient">Payload.</span>
                </h2>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Select Quantity</span>
                    <span className="text-[10px] font-mono text-blue-500 uppercase">Ships in 24 Hours</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                        <button
                            key={num}
                            onClick={() => setQuantity(num)}
                            className={`relative h-16 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${quantity === num ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                        >
                            <span className="text-lg font-black">{num}</span>
                            {savings[num] && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-[6px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-tighter">
                                    {savings[num]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass p-8 rounded-[2rem] space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Configuration</p>
                        <p className="text-4xl font-black tracking-tighter italic uppercase">€{prices[quantity]}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-1">Free Global Orbit</p>
                        <p className="text-[10px] text-gray-500 uppercase">Secure SSL Checkout</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        'Military Grade RFID Protection',
                        'N52 Neodymium Magnetic Snap',
                        'Milled Grade 5 Titanium Finish',
                        '30-Day Mission Guarantee'
                    ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 size={14} className="text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">{benefit}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleBuy}
                    className="group relative w-full py-6 bg-white text-black rounded-2xl font-black text-xl uppercase tracking-tighter overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                >
                    <div className="absolute inset-0 bg-blue-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Initialize Secure Checkout <ChevronRight size={20} />
                    </span>
                    {/* Magnetic Pulse Animation can be added with CSS or additional Framer Motion */}
                </button>
            </div>
        </motion.div>
      </div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {isBuying && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] bg-black flex flex-center items-center justify-center"
            >
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-4xl italic mx-auto mb-8 shadow-[0_0_50px_rgba(37,99,235,0.5)]">A</div>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Systems Ready.</h3>
                    <p className="text-blue-500 font-mono text-xs tracking-[0.5em] uppercase">Transitioning to Secure Portal...</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DecisionExperience;
