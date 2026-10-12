"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const Starfield = dynamic(() => import("./starfield"), {ssr:false});
export function AmbientScene() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const limit = window.matchMedia("(max-width: 600px)");
    const canUseWebGL = (() => {try { return !!document.createElement("canvas").getContext("webgl2"); } catch {return false;}})();
    const update = () => setEnabled(canUseWebGL && !reduce.matches && !limit.matches);
    update(); reduce.addEventListener("change", update); limit.addEventListener("change",update);
    return () => {reduce.removeEventListener("change", update);limit.removeEventListener("change",update);};
  }, []);
  return enabled ? <Starfield/> : null;
}
