import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface ByokThreeSceneProps {
  onSimulateFailover?: () => void;
}

export const ByokThreeScene: React.FC<ByokThreeSceneProps> = ({ onSimulateFailover }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeRoute, setActiveRoute] = useState<'gemini' | 'groq' | 'openrouter'>('gemini');
  const [isPaused, setIsPaused] = useState(false);
  const activeRouteRef = useRef<'gemini' | 'groq' | 'openrouter'>('gemini');
  const isPausedRef = useRef(false);

  useEffect(() => {
    activeRouteRef.current = activeRoute;
  }, [activeRoute]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0f);
    scene.fog = new THREE.FogExp2(0x090a0f, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 9.5);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      // Fallback if WebGL context is unavailable
      return;
    }

    // 3-Point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x8083ff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x4edea3, 2.2, 18);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // Subtle Reference Grid
    const gridHelper = new THREE.GridHelper(18, 18, 0x2a3042, 0x161926);
    gridHelper.position.y = -2.1;
    scene.add(gridHelper);

    // Central Router Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x312e81,
      emissiveIntensity: 0.65,
      metalness: 0.6,
      roughness: 0.25,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Outer Wireframe Shell
    const shellGeo = new THREE.IcosahedronGeometry(1.38, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shellMesh);

    // 3 Satellite Provider Nodes (Gemini Primary, Groq LPU, OpenRouter Free)
    const nodePositions: Record<'gemini' | 'groq' | 'openrouter', THREE.Vector3> = {
      gemini: new THREE.Vector3(-3.6, 0.9, 0.5),
      groq: new THREE.Vector3(3.6, 0.9, 0.5),
      openrouter: new THREE.Vector3(0, -1.2, 3.1),
    };

    const nodeColors: Record<'gemini' | 'groq' | 'openrouter', number> = {
      gemini: 0x4edea3,
      groq: 0x818cf8,
      openrouter: 0xfbbf24,
    };

    const satellites: Record<'gemini' | 'groq' | 'openrouter', THREE.Mesh> = {} as Record<
      'gemini' | 'groq' | 'openrouter',
      THREE.Mesh
    >;

    (['gemini', 'groq', 'openrouter'] as const).forEach((id) => {
      const geo = new THREE.OctahedronGeometry(0.55, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: nodeColors[id],
        emissive: nodeColors[id],
        emissiveIntensity: 0.35,
        metalness: 0.5,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(nodePositions[id]);
      scene.add(mesh);
      satellites[id] = mesh;

      // Connection Beam to Core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        nodePositions[id],
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: nodeColors[id],
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    });

    // Packet Pulse Sphere traveling between Core and Active Node
    const packetGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x4edea3 });
    const packetMesh = new THREE.Mesh(packetGeo, packetMat);
    scene.add(packetMesh);

    let animId = 0;
    let clock = 0;

    const renderFrame = () => {
      if (!renderer) return;
      if (!isPausedRef.current) {
        clock += isHeadless ? 0.05 : 0.025;
        coreMesh.rotation.y = clock * 0.7;
        coreMesh.rotation.x = clock * 0.35;
        shellMesh.rotation.y = -clock * 0.4;

        const route = activeRouteRef.current;
        (['gemini', 'groq', 'openrouter'] as const).forEach((id) => {
          const sat = satellites[id];
          sat.rotation.y = clock * 1.2;
          const s = id === route ? 1.25 : 0.9;
          sat.scale.set(s, s, s);
        });

        const targetPos = nodePositions[route];
        const t = (Math.sin(clock * 3.2) + 1) * 0.5;
        packetMesh.position.lerpVectors(new THREE.Vector3(0, 0, 0), targetPos, t);
        packetMat.color.setHex(nodeColors[route]);
      }

      renderer.render(scene, camera);
      if (!isHeadless) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
    const headlessTimer = isHeadless ? window.setInterval(renderFrame, 120) : undefined;

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
      if (headlessTimer) clearInterval(headlessTimer);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  const cycleFailoverNode = () => {
    const next =
      activeRoute === 'gemini'
        ? 'groq'
        : activeRoute === 'groq'
        ? 'openrouter'
        : 'gemini';
    setActiveRoute(next);
    if (onSimulateFailover) onSimulateFailover();
  };

  return (
    <div className="relative w-full h-[340px] rounded-xl overflow-hidden border border-[#2A3042] bg-[#090A0F]">
      <div
        ref={mountRef}
        data-testid="byok-three-canvas"
        data-active-route={activeRoute}
        className="w-full h-full"
      />

      {/* Top Left Telemetry Pill */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-[#0d0e13]/85 backdrop-blur-md border border-[#2A3042] font-mono text-[11px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
        <span className="text-white font-semibold">3D API Rotator Mesh</span>
        <span className="text-[#818CF8]">· Active Route: {activeRoute.toUpperCase()}</span>
      </div>

      {/* Bottom Right Interactive Control Dock */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 p-1.5 rounded-lg bg-[#0d0e13]/85 backdrop-blur-md border border-[#2A3042] font-mono text-[11px]">
        <button
          type="button"
          onClick={cycleFailoverNode}
          className="px-2.5 py-1 rounded bg-[#6366F1] hover:bg-[#818CF8] text-white font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Zap className="w-3 h-3" />
          <span>Simulate 429 Failover Hop</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? 'Resume 3D Simulation' : 'Pause 3D Simulation'}
          className="p-1.5 rounded bg-[#1a1b21] hover:bg-[#292a2f] text-[#c7c4d7] cursor-pointer"
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setActiveRoute('gemini')}
          aria-label="Reset to Primary Gemini Node"
          className="p-1.5 rounded bg-[#1a1b21] hover:bg-[#292a2f] text-[#c7c4d7] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
