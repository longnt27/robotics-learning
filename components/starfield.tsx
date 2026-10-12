"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh, Points } from "three";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color } from "three";

function OrbitingCore() {
  const root = useRef<Group>(null);
  const inner = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (root.current) {
      root.current.rotation.y += Math.min(delta, 0.05) * 0.065;
      root.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.095;
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.13;
    }
    if (inner.current) inner.current.rotation.x += Math.min(delta, 0.05) * 0.12;
  });
  return <group ref={root} position={[3.4, 0.25, -3.5]} rotation={[0.3, 0.5, 0.1]}>
    <mesh ref={inner}>
      <icosahedronGeometry args={[2.0, 3]}/>
      <meshBasicMaterial color="#6438ba" wireframe transparent opacity={0.19} depthWrite={false}/>
    </mesh>
    <Float speed={1.2} rotationIntensity={0.11} floatIntensity={0.05}>
      <mesh rotation={[1.15, 0.2, 0.55]}><torusGeometry args={[2.55, 0.012, 8, 160]}/><meshBasicMaterial color="#9d72ed" transparent opacity={0.54}/></mesh>
      <mesh rotation={[0.35, 0.95, -0.4]}><torusGeometry args={[2.23, 0.009, 8, 160]}/><meshBasicMaterial color="#d7ec9b" transparent opacity={0.48}/></mesh>
      <mesh rotation={[0.65, -0.55, 0.2]}><torusGeometry args={[2.9, 0.005, 8, 160]}/><meshBasicMaterial color="#6c7cde" transparent opacity={0.36}/></mesh>
    </Float>
    <mesh><sphereGeometry args={[1.25, 32, 32]}/><meshBasicMaterial color="#321b6e" transparent opacity={0.12}/></mesh>
    <pointLight position={[0,0,0]} color="#724ec8" intensity={13} distance={12}/>
  </group>;
}

function Dust() {
  const ref = useRef<Points>(null);
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const n = 320;
    const vertices = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const angle = i * 2.39996;
      const r = 2 + Math.sqrt(i / n) * 13;
      vertices[i * 3] = Math.cos(angle) * r;
      vertices[i * 3 + 1] = Math.sin(angle * 1.5) * 4.5;
      vertices[i * 3 + 2] = -2 - Math.sin(angle) * r * 0.6;
    }
    geo.setAttribute("position", new BufferAttribute(vertices, 3));
    return geo;
  }, []);
  useFrame((_, delta) => { if(ref.current) ref.current.rotation.z += Math.min(delta, .05)*0.002; });
  return <points ref={ref} geometry={geometry}><pointsMaterial size={0.035} color={new Color("#a98aff")} transparent opacity={0.7} blending={AdditiveBlending} sizeAttenuation depthWrite={false}/></points>;
}

function World() {
  const {size} = useThree();
  return <><ambientLight intensity={0.6}/><Stars radius={90} depth={70} count={size.width < 900 ? 650 : 1100} factor={2.2} saturation={0} fade speed={0.25}/><OrbitingCore/><Dust/></>;
}

export default function Starfield() {
  return <div className="starfield" aria-hidden="true"><Canvas camera={{position:[0,0,11.3], fov:52}} dpr={[1,1.5]} frameloop="always" gl={{antialias:false, alpha:true, powerPreference:"low-power"}} fallback={<div/>}><World/></Canvas></div>;
}
