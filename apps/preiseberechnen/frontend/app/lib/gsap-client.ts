"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let corePluginsRegistered = false;
let splitTextRegistered = false;

export function getGsap() {
  if (!corePluginsRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    corePluginsRegistered = true;
  }
  return gsap;
}

export async function loadSplitTextPlugin() {
  const core = getGsap();
  const mod = await import("gsap/SplitText");
  const SplitText = mod.SplitText;

  if (!splitTextRegistered) {
    core.registerPlugin(SplitText);
    splitTextRegistered = true;
  }

  return SplitText;
}

