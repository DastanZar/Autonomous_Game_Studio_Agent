// Timeline for the Point Roberts Short. Every cue is a spoken-word time from the voice track (W(para, word, nth)).
// Inlined into index.html by build.mjs. One paused GSAP timeline, registered under the root composition id.
(function () {
  const D = window.__D, B = window.__B;
  const tl = gsap.timeline({ paused: true });
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  // Word cue lookup. Throws if a cue does not resolve (the render check then reports a runtime error).
  function W(p, w, nth = 1) {
    const ws = D.T[p];
    if (!ws) throw new Error("cue: no paragraph " + p);
    let c = 0;
    for (const x of ws) if (x.w === norm(w) && ++c === nth) return x.t;
    throw new Error("cue: unresolved " + p + "/" + w + "#" + nth);
  }
  const shake = (sel, t, a = 14) =>
    tl.to(sel, { keyframes: [{ x: -a, y: a * 0.6, duration: 0.04 }, { x: a * 0.85, y: -a * 0.6, duration: 0.05 }, { x: -a * 0.5, y: a * 0.35, duration: 0.05 }, { x: 0, y: 0, duration: 0.09 }], ease: "none" }, t);
  const pop = (sel, t, o = {}) =>
    tl.fromTo(sel, { opacity: 0, scale: o.from ?? 0.5, rotation: o.r0 ?? 0 }, { opacity: 1, scale: 1, rotation: o.r1 ?? 0, duration: o.d ?? 0.4, ease: o.ease ?? "back.out(2.2)" }, t);

  // ---------- global: film-grain boil at 12 fps ----------
  tl.fromTo("#grain", { backgroundPosition: "0px 0px" }, { backgroundPosition: "360px 180px", duration: D.DUR, ease: "steps(498)" }, 0);

  // ---------- transitions (verbs: iris, push, wipe, cut...) ----------
  tl.fromTo("#wC", { y: 1920 }, { y: 0, duration: 0.5, ease: "power3.inOut" }, B[2]);
  tl.to("#wB", { y: -420, duration: 0.5, ease: "power3.inOut" }, B[2]);
  tl.fromTo("#wD", { clipPath: "circle(0% at 50% 52%)" }, { clipPath: "circle(80% at 50% 52%)", duration: 0.75, ease: "expo.out" }, B[3]);
  tl.fromTo("#wF", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power2.inOut" }, B[5]);
  tl.fromTo("#wG", { x: 1080 }, { x: 0, duration: 0.45, ease: "power4.out" }, B[6]);
  tl.to("#wF", { x: -260, duration: 0.45, ease: "power4.out" }, B[6]);
  tl.fromTo("#wH", { clipPath: "polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)" }, { clipPath: "polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)", duration: 0.6, ease: "circ.inOut" }, B[7]);
  tl.fromTo("#wI", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "sine.inOut" }, B[8]);
  tl.fromTo("#wJ", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, B[9]);

  // ======================= A. HOOK =======================
  (function () {
    const t0 = W("hook", "there's"), tY = W("hook", "you"), tC = W("hook", "canada"), tU = W("hook", "united");
    tl.fromTo("#aSun", { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 0.9, duration: 0.8, ease: "back.out(1.6)" }, 0.04);
    tl.to("#aSun", { scale: 1.05, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.9);
    tl.fromTo("#aFlagBox", { rotation: -9, y: -40, opacity: 0 }, { rotation: -4, y: 0, opacity: 1, duration: 0.55, ease: "back.out(2)" }, 0.05);
    tl.to("#aFlagBox", { rotation: 1, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0.7);
    tl.fromTo("#aFlag", { skewY: -3 }, { skewY: 5, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 7 }, 0.3);
    tl.fromTo("#aL1", { x: -160, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "expo.out" }, t0);
    tl.fromTo("#aL2", { x: 180, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power4.out" }, tY - 0.1);
    tl.fromTo("#aL3", { scale: 2.1, opacity: 0, rotation: -5 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.24, ease: "power4.in" }, tC - 0.12);
    shake("#wA", tC + 0.12, 16);
    tl.fromTo("#aFlagBox", { scale: 1 }, { scale: 1.12, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, tU);
  })();

  // ======================= B. ONLY WAY IN =======================
  (function () {
    const tS = W("onlyway", "shortcut"), tI = W("onlyway", "it's"), tO = W("onlyway", "only"), tN = W("onlyway", "in");
    tl.fromTo("#bBig", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" }, B[1]);
    tl.to("#bBig", { scale: 1.06, duration: 2, ease: "sine.inOut" }, B[1] + 1.2);
    pop("#bShort", B[1] + 0.05, { from: 0.8, r0: -4, r1: -2, d: 0.35, ease: "back.out(2.5)" });
    tl.fromTo("#bStrike", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, tS + 0.1);
    tl.to(["#bShort", "#bStrikeSvg"], { y: -90, opacity: 0, rotation: 6, duration: 0.28, ease: "power3.in" }, tI);
    tl.fromTo("#bStamp", { scale: 2.5, opacity: 0, rotation: -16 }, { scale: 1, opacity: 1, rotation: -5, duration: 0.2, ease: "power4.in" }, tO - 0.2);
    shake("#wB", tO + 0.02, 20);
    tl.to("#bStamp", { rotation: -3, scale: 1.04, duration: 0.5, ease: "elastic.out(1,0.4)" }, tN);
  })();

  // ======================= C. JUST A MAP MISTAKE? =======================
  (function () {
    const tMap = W("wrongidea", "mapping"), tMis = W("wrongidea", "mistake"), tNo = W("wrongidea", "nobody"), tFix = W("wrongidea", "fixed");
    tl.fromTo("#cFold", { x: 420, rotation: 14 }, { x: 0, rotation: 5, duration: 0.7, ease: "back.out(1.3)" }, B[2] + 0.15);
    tl.to("#cFold", { rotation: 1, y: 18, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 1 }, B[2] + 0.9);
    tl.fromTo("#cL1", { x: -240, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, B[2] + 0.2);
    tl.fromTo("#cL2", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "elastic.out(1,0.5)" }, tMap - 0.05);
    tl.fromTo("#cL3", { x: -420, opacity: 0, skewX: -18 }, { x: 0, opacity: 1, skewX: 0, duration: 0.45, ease: "power4.out" }, tMis - 0.05);
    tl.fromTo(".cX", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, tNo);
    tl.fromTo("#cQ", { scale: 0, rotation: -50, opacity: 0 }, { scale: 1, rotation: 9, opacity: 1, duration: 0.5, ease: "back.out(2.4)" }, tFix - 0.1);
  })();

  // ======================= D. MAP: 49TH PARALLEL =======================
  (function () {
    const tTypo = W("reveal", "typo"), tGuess = W("reveal", "guess");
    const t46 = W("treaty_detail", "eighteen"), tBr = W("treaty_detail", "britain"), tUS = W("treaty_detail", "united");
    const tDraw = W("treaty_detail", "draw"), t49 = W("treaty_detail", "fortynine");
    const O = "50% 60%";
    tl.fromTo("#dCard", { rotation: -3, scale: 0.94 }, { rotation: 0, scale: 1, duration: 0.8, ease: "power3.out" }, B[3]);
    tl.fromTo("#dCam", { scale: 1, transformOrigin: O }, { scale: 1.06, duration: 2.0, ease: "sine.inOut", transformOrigin: O }, B[3]);
    tl.to("#dCam", { scale: 1.22, y: 40, duration: 4.4, ease: "sine.inOut", transformOrigin: O }, t46 - 0.2);
    tl.fromTo("#dBig", { y: 60, opacity: 0 }, { y: -30, opacity: 1, duration: 7, ease: "none" }, B[3]);
    tl.fromTo("#dLblCA", { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "bounce.out" }, tTypo - 0.05);
    tl.fromTo("#dLblUS", { scale: 0.3, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: "back.out(2.4)" }, tGuess - 0.05);
    tl.to("#dUS path", { fill: "#f2c14e", duration: 0.5, ease: "sine.out" }, tGuess);
    tl.fromTo("#dTreaty", { width: 0, opacity: 1 }, { width: 700, duration: 1.15, ease: "steps(22)" }, t46 - 0.05);
    tl.to("#dLblCA", { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, tBr);
    tl.to("#dLblUS", { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, tUS);
    tl.fromTo("#dLine", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: t49 - tDraw + 0.05, ease: "power1.inOut" }, tDraw);
    pop("#dChipLine", t49, { from: 0.4, r0: -6, r1: -2, d: 0.45, ease: "back.out(2.6)" });
    tl.to("#dLine", { attr: { "stroke-width": 14 }, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, t49);
  })();

  // ======================= E. OOPS =======================
  (function () {
    const tCut = W("oops", "cut"), tOff = W("oops", "off");
    tl.fromTo("#eStamp", { scale: 3.2, opacity: 0, rotation: 12 }, { scale: 1, opacity: 1, rotation: -7, duration: 0.17, ease: "power4.in" }, B[4]);
    shake("#wE", B[4] + 0.17, 26);
    tl.fromTo("#eRing", { scale: 0.5, opacity: 1 }, { scale: 2.0, opacity: 0, duration: 0.6, ease: "expo.out" }, B[4] + 0.17);
    tl.to("#eStamp", { scale: 1.05, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, B[4] + 0.5);
    tl.fromTo("#eCutSvg", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.3, ease: "power2.out" }, tCut);
    tl.to("#eStamp", { rotation: -10, y: 16, duration: 0.25, ease: "back.out(3)" }, tOff);
  })();

  // ======================= F. MAP: POINT ROBERTS =======================
  (function () {
    const tTip = W("cutoff", "tip"), tPen = W("cutoff", "peninsula"), tRest = W("cutoff", "rest"), tWa = W("cutoff", "washington");
    const tDrive = W("howfar", "drive"), tMain = W("howfar", "mainland"), tCross = W("howfar", "cross"), tTwice = W("howfar", "twice");
    const pr = D.pr, O = pr[0] + "px " + pr[1] + "px";
    const route = document.getElementById("fRoute"), truck = document.getElementById("fTruck");
    const len = route.getTotalLength();
    // fractions of the route at the two border crossings (route runs Blaine -> BC -> Tsawwassen -> Point Roberts)
    const frac = (pt) => {
      let best = 0, bd = 1e9;
      for (let i = 0; i <= 400; i++) { const q = route.getPointAtLength((len * i) / 400); const d = (q.x - pt[0]) ** 2 + (q.y - pt[1]) ** 2; if (d < bd) { bd = d; best = i / 400; } }
      return best;
    };
    const f1 = frac(D.cross1), f2 = frac(D.cross2);
    tl.fromTo("#fCard", { scale: 0.94, rotation: 2 }, { scale: 1, rotation: 0, duration: 0.7, ease: "power3.out" }, B[5]);
    tl.fromTo("#fCam", { scale: 1, transformOrigin: O }, { scale: 1.45, duration: tWa - B[5] + 0.3, ease: "power2.inOut", transformOrigin: O }, B[5]);
    tl.to("#fCam", { scale: 1.0, duration: 1.0, ease: "power3.inOut", transformOrigin: O }, tDrive - 0.1);
    tl.fromTo("#fLblCA", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, B[5] + 0.3);
    tl.fromTo("#fRing", { scale: 0.4, opacity: 1, transformOrigin: "50% 50%" }, { scale: 2.4, opacity: 0, duration: 0.7, ease: "expo.out", transformOrigin: "50% 50%", repeat: 1, repeatDelay: 0.15 }, tTip);
    tl.to("#fPR", { fill: "#e08a3c", duration: 0.35, ease: "sine.out" }, tTip);
    tl.fromTo("#fPRg", { scale: 1 }, { scale: 1.3, svgOrigin: pr[0] + " " + pr[1], duration: 0.5, ease: "elastic.out(1,0.35)" }, tPen);
    tl.fromTo("#fPin", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.4, ease: "bounce.out" }, tPen + 0.1);
    tl.fromTo("#fLblUS", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, tRest);
    pop("#fChipPR", tWa - 0.05, { from: 0.4, d: 0.45, r0: -4, r1: -2 });
    pop("#fChipSq", tWa + 0.4, { from: 0.7, d: 0.35, ease: "back.out(2.6)", r0: 3, r1: 1 });
    tl.to(["#fChipPR", "#fChipSq"], { y: 60, opacity: 0, duration: 0.3, ease: "power3.in" }, tDrive - 0.1);
    tl.fromTo("#fChipRoute", { y: -160, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.8)" }, tDrive);
    // truck + route drawn on one progress value, hitting each crossing on its spoken cue
    const st = { p: 0 };
    const upd = () => {
      const q = route.getPointAtLength(st.p * len);
      truck.setAttribute("cx", q.x); truck.setAttribute("cy", q.y);
      route.style.strokeDashoffset = String(1 - st.p);
      document.getElementById("fRoute2").style.strokeDashoffset = String(1 - st.p);
    };
    const tA = tMain + 0.1;
    tl.set("#fTruck", { opacity: 1 }, tA - 0.05);
    tl.set("#fRoute2", { opacity: 1 }, tA - 0.05);
    tl.fromTo(st, { p: 0 }, { p: f1, duration: tCross - tA, ease: "power1.in", onUpdate: upd }, tA);
    tl.to(st, { p: f2, duration: tTwice - tCross + 0.05, ease: "none", onUpdate: upd }, tCross);
    tl.to(st, { p: 1, duration: 0.45, ease: "power2.out", onUpdate: upd }, tTwice + 0.05);
    pop("#fX1", tCross, { from: 0.2, d: 0.4, ease: "back.out(3)" });
    pop("#fX2", tTwice + 0.02, { from: 0.2, d: 0.4, ease: "back.out(3)" });
  })();

  // ======================= G. KIDS =======================
  (function () {
    const tCr = W("kids", "cross"), tFour = W("kids", "four"), tTimes = W("kids", "times"), tDay = W("kids", "day"), tSch = W("kids", "school");
    const X0 = 190, X1 = 640; // bus left edge; the border sits at x=520, bus centre = left + 130
    const crossing = [tCr, tFour, tTimes + 0.01, tDay];
    const durs = [0.5, 0.3, 0.24, 0.5];
    tl.set("#gBus", { x: X0 }, 0);
    crossing.forEach((tc, i) => {
      const toRight = i % 2 === 0;
      tl.fromTo("#gBus", { x: toRight ? X0 : X1, scaleX: toRight ? 1 : -1 }, { x: toRight ? X1 : X0, scaleX: toRight ? 1 : -1, duration: durs[i], ease: "none" }, tc - durs[i] / 2);
      tl.fromTo("#gBorder", { scaleX: 1 }, { scaleX: 2.6, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, tc - 0.05);
      const bar = "#gT" + i;
      tl.fromTo(bar, { scaleY: 0, opacity: 1 }, { scaleY: 1, duration: 0.22, ease: "back.out(2.5)" }, tc);
    });
    tl.fromTo("#gFour", { scale: 0.2, opacity: 0, rotation: -25 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.5, ease: "back.out(2.6)" }, tFour - 0.1);
    tl.fromTo("#gCross", { x: 240, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power4.out" }, tTimes - 0.05);
    tl.fromTo("#gADay", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, tDay);
    tl.fromTo("#gRoad", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, B[6] + 0.1);
    tl.fromTo("#gStamp", { scale: 2.4, opacity: 0, rotation: 10 }, { scale: 1, opacity: 1, rotation: -3, duration: 0.2, ease: "power4.in" }, tSch - 0.1);
    shake("#wG", tSch + 0.1, 12);
  })();

  // ======================= H. WATER =======================
  (function () {
    const tTap = W("water", "tap"), tWat = W("water", "water"), tComes = W("water", "comes"), tCa = W("water", "canada"), tDeal = W("water", "deal");
    const t19 = W("water", "nineteen"), t87 = W("water", "eightyseven");
    tl.fromTo("#hBorder", { clipPath: "inset(0 0 100% 0)", width: 10 }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power3.out", width: 10 }, B[7] + 0.2);
    tl.fromTo("#hCanadaTag", { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power4.out" }, B[7] + 0.3);
    tl.fromTo("#hUSTag", { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power4.out" }, B[7] + 0.35);
    tl.fromTo("#hFaucet", { y: -300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "bounce.out" }, tTap);
    tl.fromTo("#hGlass", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, tTap + 0.1);
    // drips: finite, deterministic
    const drops = document.querySelectorAll(".hdrop");
    drops.forEach((d, i) => {
      const t = tWat + 0.12 + i * 0.34;
      tl.set(d, { opacity: 1, y: 0 }, t);
      tl.to(d, { y: 462, duration: 0.5, ease: "power2.in" }, t);
      tl.set(d, { opacity: 0 }, t + 0.5);
    });
    tl.fromTo("#hWater", { attr: { y: 210, height: 0 } }, { attr: { y: 90, height: 120 }, duration: t87 - tWat, ease: "none" }, tWat + 0.55);
    tl.fromTo("#hPipe", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: "power3.out" }, tComes);
    tl.fromTo("#hPipeIn", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: "power3.out" }, tComes);
    tl.set("#hFlow", { opacity: 1 }, tComes + 0.7);
    tl.fromTo("#hFlow", { strokeDashoffset: 0 }, { strokeDashoffset: -0.8, duration: 3.0, ease: "none" }, tComes + 0.7);
    pop("#hFromCanada", tCa - 0.1, { from: 0.4, d: 0.45, r0: 4, r1: -2 });
    tl.fromTo("#hDoc", { y: 500, opacity: 0, rotation: 6 }, { y: 0, opacity: 1, rotation: -2, duration: 0.55, ease: "power4.out" }, tDeal - 0.05);
    tl.fromTo("#hStamp1987", { scale: 2.6, opacity: 0, rotation: 14 }, { scale: 1, opacity: 1, rotation: -9, duration: 0.2, ease: "power4.in" }, t19 - 0.05);
    shake("#wH", t19 + 0.15, 10);
  })();

  // ======================= I. TODAY: 55% =======================
  (function () {
    const t25 = W("todaybeat", "twentyfive"), tShop = W("todaybeat", "shop"), tBus = W("todaybeat", "business"), tFell = W("todaybeat", "fell"), tHalf = W("todaybeat", "half");
    const numEl = document.getElementById("iNum");
    tl.fromTo("#iYear", { scale: 2, opacity: 0, x: -60 }, { scale: 1, opacity: 1, x: 0, duration: 0.5, ease: "expo.out", transformOrigin: "0% 50%" }, t25 - 0.3);
    tl.fromTo("#iSub", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "sine.out" }, t25 + 0.2);
    tl.fromTo("#iBase", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.out", transformOrigin: "0% 50%" }, tShop - 0.2);
    tl.fromTo("#iBar1", { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "power3.out", transformOrigin: "50% 100%" }, tShop);
    tl.fromTo("#iBar2", { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "power3.out", transformOrigin: "50% 100%" }, tShop + 0.14);
    tl.fromTo(["#iLb1", "#iLb2"], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.12 }, tShop + 0.4);
    tl.fromTo("#iChip", { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, tBus);
    tl.fromTo("#iDown", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, tFell - 0.05);
    tl.fromTo("#iBar2", { scaleY: 1 }, { scaleY: 0.45, duration: tHalf - tFell + 0.05, ease: "power2.in", transformOrigin: "50% 100%", immediateRender: false }, tFell);
    const c = { v: 0 };
    tl.fromTo("#iNum", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out", transformOrigin: "100% 50%" }, tFell - 0.05);
    tl.fromTo(c, { v: 0 }, { v: 55, duration: tHalf - tFell + 0.05, ease: "power2.in", onUpdate: () => { numEl.textContent = Math.round(c.v) + "%"; } }, tFell);
    tl.fromTo("#iNum", { rotation: 0 }, { rotation: -2, duration: 0.25, ease: "back.out(3)" }, tHalf + 0.05);
  })();

  // ======================= J. LOOP =======================
  (function () {
    const tRe = W("loopback", "reachable"), tCan = W("loopback", "canada"), tOnly = W("loopback", "only");
    tl.fromTo("#jFlagBox", { rotation: -4 }, { rotation: 1, duration: 0.8, ease: "sine.inOut", yoyo: true, repeat: 1 }, B[9]);
    tl.fromTo("#jFlag", { skewY: 5 }, { skewY: -3, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, B[9]);
    tl.fromTo("#jSun", { scale: 1 }, { scale: 1.05, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, B[9]);
    tl.fromTo("#wJ", { scale: 1.0 }, { scale: 1.03, duration: D.DUR - B[9] - 0.5, ease: "none", transformOrigin: "50% 55%", immediateRender: false }, B[9] + 0.5);
    tl.fromTo("#jLoop", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: tCan - tRe + 0.5, ease: "sine.inOut" }, tRe);
    tl.fromTo("#jL3", { scale: 1 }, { scale: 1.07, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, tCan);
    shake("#jL3", tCan + 0.02, 6);
    tl.fromTo("#jL1", { y: 0 }, { y: -6, duration: 0.2, ease: "power1.out", yoyo: true, repeat: 1 }, tOnly);
  })();

  // ---------- captions (burned in, from script.json chunks) ----------
  D.caps.forEach((c, i) => {
    const sel = "#cap" + i;
    tl.fromTo(sel, { opacity: 0, scale: 0.82, y: 18, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, y: 0, duration: 0.16, ease: "back.out(2.2)" }, c.t0);
    tl.set(sel, { opacity: 0 }, c.t1);
  });

  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
})();
