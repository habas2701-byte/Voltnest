'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  ContactShadows, 
  RoundedBox, 
  Float, 
  Torus
} from '@react-three/drei';
import * as THREE from 'three';
import BundleSelector, { BUNDLES, Bundle } from './BundleSelector';
import Checkout from './Checkout';
import DecisionExperience from './DecisionExperience';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function MagSafeRing() {
  return (
    <group position={[0, 0, 0.201]}>
      <Torus args={[0.6, 0.02, 16, 64]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#4D7FFF" emissive="#4D7FFF" emissiveIntensity={2} />
      </Torus>
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[0.02, 0.4, 0.01]} />
        <meshStandardMaterial color="#4D7FFF" emissive="#4D7FFF" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Card({ index, scrollProgress }: { index: number, scrollProgress: number }) {
  const cardRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!cardRef.current) return;
    const start = 0.1;
    const end = 0.3;
    if (scrollProgress >= start && scrollProgress <= end) {
      const p = (scrollProgress - start) / (end - start);
      const offset = (index - 2.5) * 0.12;
      cardRef.current.position.x = THREE.MathUtils.lerp(0, 1.3 + offset, p);
      cardRef.current.rotation.z = THREE.MathUtils.lerp(0, (index - 2.5) * 0.15, p);
    } else if (scrollProgress > end) {
      const offset = (index - 2.5) * 0.12;
      cardRef.current.position.x = 1.3 + offset;
      cardRef.current.rotation.z = (index - 2.5) * 0.15;
    } else {
      cardRef.current.position.x = 0;
      cardRef.current.rotation.z = 0;
    }
  });

  return (
    <mesh ref={cardRef} position={[0, 0, 0.15 - index * 0.02]}>
      <RoundedBox args={[1.7, 2.7, 0.01]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={index % 2 === 0 ? "#111" : "#222"} metalness={0.5} roughness={0.5} />
      </RoundedBox>
    </mesh>
  );
}

function Scene({ scrollProgress }: { scrollProgress: { value: number } }) {
  const modelRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!modelRef.current) return;
    
    const progress = scrollProgress.value;
    const t = state.clock.getElapsedTime();

    // Reset visibility/intensity
    if (shieldRef.current) {
      shieldRef.current.visible = false;
    }
    
    // SECTION 1: HERO (0.0 - 0.1)
    if (progress < 0.1) {
      const p = progress / 0.1;
      modelRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 0.15, p);
      modelRef.current.position.x = THREE.MathUtils.lerp(0, -0.8, p);
      modelRef.current.scale.setScalar(THREE.MathUtils.lerp(1.2, 1, p));
    } 
    // SECTION 2: 6-CARD PAYLOAD (0.1 - 0.3)
    else if (progress < 0.3) {
      const p = (progress - 0.1) / 0.2;
      modelRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI * 0.15, Math.PI * 0.4, p);
      modelRef.current.position.x = THREE.MathUtils.lerp(-0.8, -1.8, p);
      modelRef.current.position.z = 0;
    } 
    // SECTION 3: RFID SHIELDING (0.3 - 0.45)
    else if (progress < 0.45) {
      const p = (progress - 0.3) / 0.15;
      modelRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI * 0.4, Math.PI * 0.8, p);
      modelRef.current.position.x = THREE.MathUtils.lerp(-1.8, 1.5, p);
      
      // Shield Pulse Effect
      if (shieldRef.current) {
        shieldRef.current.visible = true;
        const pulse = (Math.sin(t * 10) + 1) * 0.5;
        shieldRef.current.scale.setScalar(1 + pulse * 0.05);
        (shieldRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + pulse * 4;
      }
    } 
    // SECTION 4: THE SNAP PROTOCOL (0.45 - 0.6)
    else if (progress < 0.6) {
      const p = (progress - 0.45) / 0.15;
      modelRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI * 0.8, Math.PI, p);
      modelRef.current.position.x = THREE.MathUtils.lerp(1.5, 0, p);
      modelRef.current.position.z = THREE.MathUtils.lerp(0, 2, p);
      
      // Ring Snap Animation
      if (ringRef.current) {
        const ringPulse = (Math.sin(t * 8) + 1) * 0.5;
        ringRef.current.scale.setScalar(1 + ringPulse * 0.05 * (1 - p));
      }
    } 
    // SECTION 5: TITANIUM SHELL (0.6 - 0.75)
    else if (progress < 0.75) {
      const p = (progress - 0.6) / 0.15;
      modelRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI, Math.PI * 1.5, p);
      modelRef.current.position.z = THREE.MathUtils.lerp(2, 0, p);
      modelRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.1, p);
    } 
    // SECTION 6: STAND MODE (0.75 - 1.0)
    else {
      const p = (progress - 0.75) / 0.25;
      modelRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI * 1.5, Math.PI * 2, p);
      modelRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.1, -Math.PI * 0.35, p);
      modelRef.current.position.y = THREE.MathUtils.lerp(0, 0.6, p);
      modelRef.current.position.z = THREE.MathUtils.lerp(0, 1, p);
    }

    // Gentle idle motion
    modelRef.current.position.y += Math.sin(t * 1.2) * 0.03;
    modelRef.current.rotation.z += Math.cos(t * 0.4) * 0.01;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#4D7FFF" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#08101F" />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      
      <group ref={modelRef}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
          <RoundedBox args={[2.2, 3.2, 0.4]} radius={0.15} smoothness={4} castShadow>
            <meshStandardMaterial 
              color="#050505" 
              metalness={1} 
              roughness={0.05} 
              envMapIntensity={2}
            />
          </RoundedBox>

          <group ref={ringRef}>
            <MagSafeRing />
          </group>

          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} index={i} scrollProgress={scrollProgress.value} />
          ))}

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

          <mesh position={[-1.11, 0, 0]}>
            <boxGeometry args={[0.02, 2.5, 0.3]} />
            <meshStandardMaterial color="#4D7FFF" emissive="#4D7FFF" emissiveIntensity={1} />
          </mesh>
        </Float>
      </group>

      <Environment preset="night" />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={3} far={5} color="#08101F" />
    </>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-10 py-8 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl italic">A</div>
        <span className="font-bold tracking-[0.4em] text-xs uppercase opacity-80">AstroCase&trade; Labs</span>
      </div>
      <div className="hidden md:flex gap-10 pointer-events-auto">
        {['Mission', 'Engineering', 'Safety', 'Order'].map((item) => (
          <button key={item} className="text-[10px] uppercase tracking-[0.3em] font-bold hover:text-blue-400 transition-colors">
            {item}
          </button>
        ))}
      </div>
      <button 
        onClick={() => document.getElementById('decision-experience')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-6 py-2 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest pointer-events-auto hover:bg-blue-400 hover:text-white transition-all"
      >
        Buy Now
      </button>
    </nav>
  );
}

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef({ value: 0 });
  const [selectedBundle, setSelectedBundle] = useState<Bundle>(BUNDLES[0]);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        scrollProgress.current.value = self.progress;
      }
    });

    gsap.to(canvasContainerRef.current, {
      opacity: 0,
      scrollTrigger: {
        trigger: "#decision-experience",
        start: "top bottom",
        end: "top 20%",
        scrub: true,
      }
    });

    gsap.utils.toArray<HTMLElement>('.section-content').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 100 },
        { 
          opacity: 1, y: 0, duration: 1.5, ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%",
            toggleActions: "play reverse play reverse"
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative bg-black text-white">
      <Nav />
      
      <div ref={canvasContainerRef} className="fixed inset-0 z-0 h-screen w-full">
        <Canvas shadows camera={{ position: [0, 0, 7], fov: 40 }}>
          <Scene scrollProgress={scrollProgress.current} />
        </Canvas>
      </div>

      <section className="relative h-screen flex items-center px-12 md:px-32 z-10 pointer-events-none">
        <div className="max-w-3xl section-content">
          <h1 className="text-9xl font-black tracking-tighter leading-[0.8] italic mb-8 uppercase">
            Beyond<br />
            <span className="text-gradient">Utility.</span>
          </h1>
          <p className="text-2xl font-light tracking-wide text-gray-500 max-w-xl leading-relaxed">
            The world&apos;s most advanced MagSafe ecosystem. Engineered for the next generation of explorers.
          </p>
        </div>
      </section>

      <section className="relative h-screen flex items-center justify-end px-12 md:px-32 z-10 pointer-events-none">
        <div className="max-w-xl text-right section-content">
          <h2 className="text-7xl font-bold tracking-tighter mb-6 uppercase">6-Card<br />Payload.</h2>
          <p className="text-xl text-gray-400 font-light">
            A proprietary internal tension system allows for up to 6 cards while maintaining a profile thinner than a standard smartphone.
          </p>
          <div className="mt-8 flex justify-end gap-4 font-mono text-[10px] text-blue-500 tracking-widest">
            <span>{"// CAPACITY: 06 UNITS"}</span>
            <span>{"// TENSION: ACTIVE"}</span>
          </div>
        </div>
      </section>

      <section className="relative h-screen flex items-center justify-start px-12 md:px-32 z-10 pointer-events-none">
        <div className="max-w-xl section-content">
          <h2 className="text-7xl font-bold tracking-tighter mb-6 uppercase">Digital<br /><span className="text-blue-500 text-glow">Fortress.</span></h2>
          <p className="text-xl text-gray-400 font-light leading-relaxed">
            Integrated military-grade RFID shielding prevents unauthorized data extraction. Your identity remains in orbit, out of reach.
          </p>
        </div>
      </section>

      <section className="relative h-screen flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center section-content">
          <h2 className="text-8xl font-black italic tracking-tighter uppercase mb-4">The Snap Protocol.</h2>
          <p className="text-blue-400 font-mono tracking-[0.5em] text-sm underline underline-offset-8">MAGSAFE COMPATIBLE // N52 NEODYMIUM</p>
        </div>
      </section>

      <section className="relative h-screen flex items-end justify-center pb-32 z-10 pointer-events-none">
        <div className="max-w-4xl text-center section-content">
          <h2 className="text-6xl font-bold tracking-tighter mb-6 uppercase">Milled Titanium Shell.</h2>
          <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto">
            Grade 5 Titanium provides the highest strength-to-weight ratio of any metal. It&apos;s the same material found in the hull of the Starship.
          </p>
        </div>
      </section>

      <section className="relative h-screen flex items-center justify-end px-12 md:px-32 z-10 pointer-events-none">
        <div className="max-w-xl text-right section-content">
          <h2 className="text-7xl font-bold tracking-tighter mb-6 uppercase">Multi-Angle<br />Deployment.</h2>
          <p className="text-xl text-gray-400 font-light">
            A precision-engineered hinge allows for instant transformation into a viewing stand. Landscape or portrait, the mission continues.
          </p>
        </div>
      </section>

      <section className="relative h-screen flex items-center justify-start px-12 md:px-32 z-10 pointer-events-none">
        <div className="max-w-xl section-content">
          <h2 className="text-6xl font-bold tracking-tight mb-8">Design Obsession.</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-px bg-blue-500" />
              <p className="text-sm font-mono text-gray-300 uppercase tracking-widest">Matte Bead-Blasted Finish</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-px bg-blue-500" />
              <p className="text-sm font-mono text-gray-300 uppercase tracking-widest">Laser-Etched Serial Numbers</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-px bg-blue-500" />
              <p className="text-sm font-mono text-gray-300 uppercase tracking-widest">Zero Interference Core</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative h-screen flex flex-col items-center justify-center z-10 pointer-events-none text-center">
        <div className="section-content">
          <span className="text-blue-500 font-mono text-sm tracking-[0.8em] mb-4 block">LIMITED RELEASE</span>
          <h2 className="text-9xl font-black italic tracking-tighter uppercase leading-none mb-12">Batch 01<br />Initiated.</h2>
          <div className="flex gap-12 justify-center font-bold text-xl tracking-tighter">
            <div>
              <p className="text-4xl">500</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Total Units</p>
            </div>
            <div className="w-px h-16 bg-white/10" />
            <div>
              <p className="text-4xl text-blue-500">142</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Remaining</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative h-screen flex items-center justify-center z-10 pointer-events-none px-6">
        <div className="max-w-4xl text-center section-content">
          <p className="text-4xl font-light italic leading-relaxed text-gray-300">
            &quot;AstroCase has fundamentally changed how I interact with my EDC. The magnetic snap is the most satisfying interaction I&apos;ve felt in years.&quot;
          </p>
          <p className="mt-12 font-mono text-xs tracking-[0.5em] text-blue-500 uppercase">&mdash; Marques B. // Tech Lead</p>
        </div>
      </section>

      <DecisionExperience />

      <div className="fixed bottom-10 left-10 z-20 pointer-events-none hidden lg:block">
        <div className="font-mono text-[8px] tracking-[0.3em] text-gray-600 space-y-2 uppercase">
          <p className="flex justify-between w-64"><span>System:</span> <span className="text-blue-500">Active</span></p>
          <p className="flex justify-between w-64"><span>Shielding:</span> <span className="text-blue-500">13.56 MHz Block</span></p>
          <p className="flex justify-between w-64"><span>Mass:</span> <span className="text-blue-500">28.4 Grams</span></p>
          <p className="flex justify-between w-64"><span>Material:</span> <span className="text-blue-500">Ti-6Al-4V</span></p>
        </div>
      </div>

      <footer className="relative z-10 py-12 text-center text-gray-800 font-mono text-[8px] tracking-[0.5em] uppercase border-t border-white/5">
        &copy; 2026 ASTROCASE LABORATORIES. CALIFORNIA. EARTH.
      </footer>
    </div>
  );
}
