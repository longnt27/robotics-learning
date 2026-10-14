"use client";
import dynamic from "next/dynamic";
import {useEffect,useState} from "react";

const Starfield = dynamic(() => import("./starfield"), {ssr:false});

export function AmbientScene() {
  const [enabled,setEnabled] = useState(false);

  useEffect(()=>{
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const limit = window.matchMedia("(max-width: 600px)");
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)");
    let webGlSupported: boolean | null = null;

    const update=()=>{
      const connection=(navigator as Navigator & {
        connection?: {saveData?:boolean; effectiveType?:string};
      }).connection;
      const metered=connection?.saveData === true ||
        connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
      if (reduce.matches || limit.matches || reducedData.matches || metered || document.hidden){
        setEnabled(false);
        return;
      }
      // Do not even request a GPU context on phones or low-data connections.
      if (webGlSupported === null){
        try {webGlSupported=!!document.createElement("canvas").getContext("webgl2");}
        catch {webGlSupported=false;}
      }
      setEnabled(webGlSupported);
    };

    update();
    reduce.addEventListener("change",update);
    limit.addEventListener("change",update);
    reducedData.addEventListener("change",update);
    document.addEventListener("visibilitychange",update);
    return ()=>{
      reduce.removeEventListener("change",update);
      limit.removeEventListener("change",update);
      reducedData.removeEventListener("change",update);
      document.removeEventListener("visibilitychange",update);
    };
  },[]);

  return enabled ? <Starfield/> : null;
}
