// Qoʻllanma uchun barcha uslublar va animatsiyalar (Tailwindga bogʻliq emas).
export const GUIDE_CSS = `
@property --tg-a{syntax:'<angle>';inherits:false;initial-value:0deg}

.tg-root{position:fixed;inset:0;z-index:120;opacity:0;transition:opacity .7s cubic-bezier(.22,.8,.3,1);
  font-family:inherit;color:#FBF5F0}
.tg-root.tg-on{opacity:1}
.tg-block{position:absolute;inset:0}

/* ---------- orqa fon: blur + aurora + chang ---------- */
.tg-blur{position:absolute;inset:0;pointer-events:none;overflow:hidden;
  background:radial-gradient(120% 95% at 50% 38%,rgba(22,13,8,.46),rgba(4,2,1,.84));
  -webkit-backdrop-filter:blur(9px) saturate(.8) brightness(.82);backdrop-filter:blur(9px) saturate(.8) brightness(.82)}
.tg-blob{position:absolute;border-radius:50%;filter:blur(70px);mix-blend-mode:screen;will-change:transform;opacity:.6}
.tg-blob.b1{width:52vmax;height:52vmax;left:-14vmax;top:-18vmax;background:radial-gradient(circle,rgba(201,128,60,.5),transparent 66%);animation:tg-d1 19s ease-in-out infinite alternate}
.tg-blob.b2{width:44vmax;height:44vmax;right:-12vmax;bottom:-16vmax;background:radial-gradient(circle,rgba(150,70,110,.34),transparent 66%);animation:tg-d2 23s ease-in-out infinite alternate}
.tg-blob.b3{width:38vmax;height:38vmax;left:38%;top:42%;background:radial-gradient(circle,rgba(40,120,115,.26),transparent 66%);animation:tg-d3 27s ease-in-out infinite alternate}
@keyframes tg-d1{to{transform:translate3d(18vmax,10vmax,0) scale(1.2)}}
@keyframes tg-d2{to{transform:translate3d(-16vmax,-8vmax,0) scale(1.15)}}
@keyframes tg-d3{to{transform:translate3d(-14vmax,12vmax,0) scale(.85)}}

.tg-dust{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.tg-dust i{position:absolute;bottom:-12px;border-radius:50%;background:radial-gradient(circle,#fff3e0,rgba(230,193,110,0) 70%);
  animation:tg-rise linear infinite;will-change:transform,opacity}
@keyframes tg-rise{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:var(--o,.5)}88%{opacity:var(--o,.5)}
  100%{transform:translate3d(var(--dx,20px),-108vh,0);opacity:0}}

/* ---------- yoritilgan joy ---------- */
.tg-hole{position:absolute;left:0;top:0;pointer-events:none;box-sizing:border-box;opacity:0;transition:opacity .5s ease;will-change:transform}
.tg-glow{position:absolute;inset:0;border-radius:inherit;
  box-shadow:0 0 0 1px rgba(230,193,110,.16),0 0 70px 8px rgba(199,154,62,.26),inset 0 0 46px rgba(199,154,62,.07);
  animation:tg-breathe 3.4s ease-in-out infinite}
@keyframes tg-breathe{0%,100%{opacity:.75}50%{opacity:1}}
.tg-ring{position:absolute;inset:0;border-radius:inherit;padding:2px;
  background:conic-gradient(from var(--tg-a),rgba(230,193,110,0) 0%,rgba(230,193,110,.18) 38%,#F5E3B3 66%,#fff6ea 74%,#E6C16E 83%,rgba(230,193,110,0) 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);
  animation:tg-spin 3.8s linear infinite}
@keyframes tg-spin{to{--tg-a:360deg}}
.tg-scan{position:absolute;inset:0;border-radius:inherit;overflow:hidden}
.tg-scan::after{content:'';position:absolute;top:-10%;bottom:-10%;width:34%;left:-40%;
  background:linear-gradient(100deg,transparent,rgba(255,238,214,.26),transparent);
  transform:skewX(-14deg);animation:tg-scan 1.25s .4s cubic-bezier(.4,0,.2,1) 1 both}
@keyframes tg-scan{to{left:120%}}
.tg-wave{position:absolute;inset:-2px;border-radius:inherit;border:1.5px solid rgba(247,216,181,.8);
  animation:tg-wave 1.2s cubic-bezier(.2,.7,.2,1) both}
@keyframes tg-wave{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.14);opacity:0}}

/* ---------- vstup (hero) ---------- */
.tg-hero{position:absolute;left:0;top:0;width:min(92vw,560px);box-sizing:border-box;
  will-change:transform;padding:44px 34px 26px;text-align:center;overflow:hidden;border-radius:34px;
  background:radial-gradient(90% 60% at 50% 0%,rgba(230,193,110,.2),transparent 70%),linear-gradient(165deg,rgba(32,21,15,.9),rgba(11,7,5,.94));
  border:1px solid rgba(230,193,110,.34);
  box-shadow:0 50px 120px rgba(0,0,0,.75),0 0 0 1px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,240,220,.1);
  -webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)}
.tg-hero-wrap{animation:tg-hero-in 1.1s .15s cubic-bezier(.16,.9,.2,1) both}
.tg-hero-wrap.tg-out{animation:tg-hero-out .26s cubic-bezier(.5,0,.8,.4) both}
@keyframes tg-hero-in{from{opacity:0;transform:translateY(36px) scale(.93);filter:blur(14px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes tg-hero-out{to{opacity:0;transform:translateY(-14px) scale(.9);filter:blur(12px)}}
.tg-hero .tg-hb{position:absolute;border-radius:50%;filter:blur(46px);pointer-events:none;mix-blend-mode:screen}
.tg-hero .hb1{width:300px;height:300px;left:-90px;top:-110px;background:radial-gradient(circle,rgba(212,140,70,.55),transparent 68%);animation:tg-d1 12s ease-in-out infinite alternate}
.tg-hero .hb2{width:280px;height:280px;right:-90px;bottom:-110px;background:radial-gradient(circle,rgba(160,80,120,.38),transparent 68%);animation:tg-d2 14s ease-in-out infinite alternate}
.tg-mark{position:relative;width:92px;height:92px;margin:0 auto 22px;display:flex;align-items:center;justify-content:center}
.tg-mark .core{position:relative;z-index:2;width:78px;height:78px;border-radius:26px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(145deg,#EBCF8A,#B58A2E 55%,#7A5230);padding:1.5px;
  box-shadow:0 14px 40px rgba(199,154,62,.4),inset 0 1px 0 rgba(255,255,255,.4);animation:tg-mark-in 1.1s .5s cubic-bezier(.2,1.3,.3,1) both}
.tg-mark .core>div{width:100%;height:100%;border-radius:25px;background:linear-gradient(160deg,#1c120d,#0c0705);display:flex;align-items:center;justify-content:center}
.tg-mark .core svg{animation:tg-quill 4.5s ease-in-out infinite}
@keyframes tg-mark-in{from{opacity:0;transform:scale(.3) rotate(-24deg)}to{opacity:1;transform:none}}
@keyframes tg-quill{0%,100%{transform:rotate(-6deg) translateY(0)}50%{transform:rotate(10deg) translateY(-2px)}}
.tg-mark .pr{position:absolute;inset:7px;border-radius:30px;border:1.5px solid rgba(230,193,110,.55);animation:tg-pr 3.6s cubic-bezier(.2,.6,.3,1) infinite;opacity:0}
.tg-mark .pr:nth-child(2){animation-delay:1.2s}.tg-mark .pr:nth-child(3){animation-delay:2.4s}
@keyframes tg-pr{0%{transform:scale(.9);opacity:.8}100%{transform:scale(2.5);opacity:0}}
.tg-title{margin:0;font-family:var(--font-geist-sans),Georgia,serif;font-size:clamp(30px,7vw,44px);font-weight:700;letter-spacing:.09em;line-height:1.1;color:#FBF5F0}
.tg-title .ch{display:inline-block;animation:tg-letter .9s calc(.75s + var(--i) * 70ms) cubic-bezier(.2,.9,.2,1) both}
.tg-title .ai{background:linear-gradient(100deg,#B37E4C 10%,#F5E3B3 45%,#fff6ea 52%,#E6C16E 60%,#B37E4C 90%);background-size:240% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:tg-letter .9s calc(.75s + var(--i) * 70ms) cubic-bezier(.2,.9,.2,1) both,tg-shine 4.5s 2.2s linear infinite}
@keyframes tg-letter{from{opacity:0;transform:translateY(28px) rotateX(-70deg);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes tg-shine{from{background-position:130% 0}to{background-position:-110% 0}}
.tg-sub{margin:14px auto 0;max-width:420px;font-size:14.5px;line-height:1.65;color:#D9C8B7;animation:tg-fade .9s 1.55s both}
@keyframes tg-fade{from{opacity:0;transform:translateY(10px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
.tg-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;margin:22px 0 4px}
.tg-chip{display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;font-size:12px;font-weight:700;color:#EAD7C2;
  background:rgba(255,255,255,.05);border:1px solid rgba(230,193,110,.28);animation:tg-pop .7s calc(1.8s + var(--i) * 120ms) cubic-bezier(.2,1.4,.3,1) both,tg-bob 4s calc(2.6s + var(--i) * .4s) ease-in-out infinite}
@keyframes tg-pop{from{opacity:0;transform:scale(.5) translateY(14px)}to{opacity:1;transform:none}}
@keyframes tg-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.tg-cta{margin-top:26px;animation:tg-fade .8s 2.3s both}

/* ---------- oddiy qadam kartochkasi ---------- */
.tg-card{position:absolute;left:0;top:0;box-sizing:border-box;width:min(92vw,424px);will-change:transform}
.tg-glass{position:relative;border-radius:26px;overflow:hidden;
  background:linear-gradient(165deg,rgba(36,24,17,.93),rgba(13,8,6,.95));
  -webkit-backdrop-filter:blur(22px) saturate(1.2);backdrop-filter:blur(22px) saturate(1.2);
  border:1px solid rgba(230,193,110,.3);
  box-shadow:0 44px 100px rgba(0,0,0,.72),0 0 0 1px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,240,220,.09);
  transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .35s cubic-bezier(.2,.8,.3,1);
  animation:tg-card-in .8s cubic-bezier(.16,.9,.2,1) both}
@keyframes tg-card-in{from{opacity:0;translate:0 30px;scale:.94;filter:blur(10px)}to{opacity:1;translate:0 0;scale:1;filter:blur(0)}}
.tg-glass::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:3;
  background:radial-gradient(380px circle at var(--mx,50%) var(--my,-10%),rgba(255,228,196,.13),transparent 62%);transition:opacity .3s}
.tg-stage{position:relative;height:130px;display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:radial-gradient(120% 150% at 50% 0%,rgba(230,193,110,.18),transparent 62%),linear-gradient(180deg,rgba(255,255,255,.035),transparent);
  border-bottom:1px solid rgba(230,193,110,.13)}
.tg-ghost{position:absolute;right:16px;top:-12px;font-size:92px;font-weight:800;line-height:1;pointer-events:none;
  color:transparent;-webkit-text-stroke:1px rgba(230,193,110,.2);letter-spacing:-.04em}
.tg-body{padding:18px 20px 16px;transition:opacity .2s ease,transform .2s ease,filter .2s ease}
.tg-body.tg-out{opacity:0;transform:translateY(-8px);filter:blur(6px)}
.tg-kicker{font-size:10.5px;letter-spacing:.14em;font-weight:800;color:#B79D84;text-transform:uppercase}
.tg-h{margin:4px 0 0;font-size:21px;line-height:1.2;font-weight:700;color:#FFF8EF;letter-spacing:-.01em}
.tg-w{display:inline-block;white-space:pre;animation:tg-word .6s calc(var(--d) * 1ms) cubic-bezier(.2,.9,.2,1) both}
@keyframes tg-word{from{opacity:0;transform:translateY(14px);filter:blur(7px)}to{opacity:1;transform:none;filter:blur(0)}}
.tg-p{margin:11px 0 0;font-size:13.5px;line-height:1.62;color:#E4D6C7}
.tg-ul{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:8px}
.tg-li{display:flex;gap:10px;font-size:12.5px;line-height:1.5;color:#CDB8A5;opacity:0;animation:tg-li .55s cubic-bezier(.22,.8,.3,1) forwards}
@keyframes tg-li{from{opacity:0;transform:translateX(-12px);filter:blur(4px)}to{opacity:1;transform:none;filter:blur(0)}}
.tg-tick{flex:0 0 auto;margin-top:2px;width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#E6C16E,#8A6420);box-shadow:0 0 12px rgba(199,154,62,.45)}
.tg-seg{display:flex;gap:5px;margin:16px 0 14px}
.tg-seg i{flex:1;height:3px;border-radius:99px;background:rgba(230,193,110,.18);position:relative;overflow:hidden}
.tg-seg i::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,#E6C16E,#F5E3B3);transform:scaleX(0);transform-origin:left;transition:transform .7s cubic-bezier(.22,.8,.3,1)}
.tg-seg i.on::after{transform:scaleX(1)}
.tg-foot{display:flex;align-items:center;justify-content:space-between;gap:8px}

.tg-btn{position:relative;overflow:hidden;cursor:pointer;border:none;font:inherit;font-size:13px;font-weight:700;border-radius:13px;
  padding:10px 17px;transition:transform .25s cubic-bezier(.2,.8,.3,1),box-shadow .25s ease,opacity .2s ease,background .2s ease}
.tg-btn:active{transform:scale(.96)!important}
.tg-next{display:inline-flex;align-items:center;gap:8px;color:#1a0f08;background:linear-gradient(95deg,#E6C16E,#C9A04A 55%,#8A6420);
  box-shadow:0 8px 26px rgba(199,154,62,.3),inset 0 1px 0 rgba(255,255,255,.35)}
.tg-next:hover{box-shadow:0 12px 34px rgba(199,154,62,.5),inset 0 1px 0 rgba(255,255,255,.4)}
.tg-next::after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-60%;transform:skewX(-18deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:tg-shim 3.6s 1.4s ease-in-out infinite}
@keyframes tg-shim{0%{left:-60%}38%,100%{left:140%}}
.tg-next svg{transition:transform .3s cubic-bezier(.2,.8,.3,1)}.tg-next:hover svg{transform:translateX(3px)}
.tg-big{padding:14px 28px;font-size:15px;border-radius:16px}
.tg-back{background:rgba(255,255,255,.06);color:#E8D9C8;border:1px solid rgba(230,193,110,.22)}
.tg-back:hover:not(:disabled){background:rgba(255,255,255,.11)}
.tg-back:disabled{opacity:.3;cursor:default}
.tg-skip{background:none;color:#A89485;font-weight:600;padding:10px 6px}
.tg-skip:hover{color:#D9AE55}
.tg-next:focus-visible,.tg-back:focus-visible,.tg-skip:focus-visible,.tg-x:focus-visible{outline:2px solid #F5E3B3;outline-offset:2px}
.tg-x{position:absolute;right:12px;top:12px;z-index:4;width:30px;height:30px;border-radius:10px;border:none;cursor:pointer;
  background:rgba(0,0,0,.25);color:#B79D84;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s,transform .3s}
.tg-x:hover{background:rgba(255,255,255,.1);color:#F5E3B3;transform:rotate(90deg)}

/* ---------- kursor-yoʻlboshchi ---------- */
.tg-cursor{position:absolute;left:0;top:0;width:34px;height:34px;pointer-events:none;opacity:0;transition:opacity .4s ease;will-change:transform;z-index:5}
.tg-cursor svg{position:absolute;left:0;top:0;filter:drop-shadow(0 6px 10px rgba(0,0,0,.55)) drop-shadow(0 0 14px rgba(247,216,181,.6));
  transform-origin:3px 3px;transition:transform .18s cubic-bezier(.3,.8,.3,1)}
.tg-cursor.tg-press svg{transform:scale(.8)}
.tg-ripple{position:absolute;left:-14px;top:-14px;width:34px;height:34px;border-radius:50%;
  border:2px solid rgba(255,238,214,.9);box-shadow:0 0 24px rgba(247,216,181,.7);animation:tg-rip .75s cubic-bezier(.2,.7,.2,1) both}
@keyframes tg-rip{from{transform:scale(.2);opacity:1}to{transform:scale(2.6);opacity:0}}
.tg-confetti{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6}

/* ---------- demo sahnalar ---------- */
.tg-d-tabs{position:relative;display:grid;grid-template-columns:repeat(3,1fr);padding:4px;border-radius:17px;width:min(88%,330px);
  background:rgba(0,0,0,.4);border:1px solid rgba(230,193,110,.22);box-shadow:inset 0 2px 10px rgba(0,0,0,.4)}
.tg-d-pill{position:absolute;top:4px;bottom:4px;left:4px;width:calc((100% - 8px) / 3);border-radius:13px;
  background:linear-gradient(135deg,rgba(199,154,62,.36),rgba(140,98,57,.3));border:1px solid rgba(230,193,110,.6);
  box-shadow:0 0 28px rgba(199,154,62,.34);animation:tg-d-slide 6.4s cubic-bezier(.65,0,.2,1) infinite}
@keyframes tg-d-slide{0%,26%{transform:translateX(0)}36%,60%{transform:translateX(100%)}70%,94%{transform:translateX(200%)}100%{transform:translateX(0)}}
.tg-d-tab{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:11px 4px 10px;
  font-size:10.5px;font-weight:700;color:#8C7A6B;animation:tg-d-lit 6.4s infinite}
@keyframes tg-d-lit{0%,28%{color:#F5E3B3}38%,100%{color:#8C7A6B}}

.tg-d-tr{display:flex;flex-direction:column;align-items:center;gap:10px;perspective:600px}
.tg-d-tag{font-size:10px;font-weight:800;letter-spacing:.18em;color:#B79D84;display:flex;align-items:center;gap:8px}
.tg-d-tag b{display:inline-block;padding:3px 9px;border-radius:99px;background:rgba(199,154,62,.16);border:1px solid rgba(230,193,110,.4);color:#F5E3B3}
.tg-d-text{font-size:27px;font-weight:700;color:#FFF3E3;letter-spacing:.01em;min-height:36px;white-space:nowrap}
.tg-d-ch{display:inline-block;animation:tg-d-flip .65s cubic-bezier(.2,.9,.2,1) both}
@keyframes tg-d-flip{from{opacity:0;transform:rotateX(95deg) translateY(10px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}

.tg-d-doc{position:relative;width:min(88%,316px);padding:13px 15px 12px;border-radius:14px;background:linear-gradient(180deg,#f6efe6,#e7dccd);
  box-shadow:0 18px 40px rgba(0,0,0,.5);transform:rotate(-1.5deg);color:#2a1d12}
.tg-d-sk{height:6px;border-radius:99px;background:rgba(60,40,20,.16);margin:5px 0}
.tg-d-txt{font-size:12.5px;line-height:1.9;font-weight:600;color:#2a1d12}
.tg-d-wr{position:relative;z-index:0;white-space:nowrap}
.tg-d-wr::before{content:'';position:absolute;inset:1px -3px;background:#f5c542;border-radius:4px;transform:scaleX(0);transform-origin:left;z-index:-1;
  animation:tg-d-hl 6.4s infinite}
.tg-d-wr.w2::before{animation-delay:.9s}.tg-d-wr.w3::before{animation-delay:1.8s}
@keyframes tg-d-hl{0%{transform:scaleX(0)}9%,84%{transform:scaleX(1)}94%,100%{transform:scaleX(0)}}
.tg-d-badge{position:absolute;right:-8px;bottom:-12px;display:flex;align-items:center;gap:6px;padding:6px 11px;border-radius:99px;font-size:10.5px;font-weight:800;color:#1a0f08;
  background:linear-gradient(95deg,#E6C16E,#C9A04A);box-shadow:0 10px 24px rgba(0,0,0,.45);animation:tg-d-badge 6.4s infinite}
@keyframes tg-d-badge{0%,34%{transform:scale(0) rotate(-12deg)}42%{transform:scale(1.12) rotate(3deg)}47%,88%{transform:scale(1) rotate(0)}96%,100%{transform:scale(0)}}

.tg-d-conv{display:flex;align-items:center;gap:14px;perspective:600px}
.tg-d-file{width:64px;height:78px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;
  background:linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.03));border:1px solid rgba(230,193,110,.4);font-size:11px;font-weight:800;color:#F5E3B3;
  box-shadow:0 14px 30px rgba(0,0,0,.4)}
.tg-d-file.fl{animation:tg-d-flip .6s cubic-bezier(.2,.9,.2,1) both}
.tg-d-flow{display:flex;gap:5px}
.tg-d-flow i{width:7px;height:7px;border-radius:50%;background:#E6C16E;animation:tg-d-dot 1.2s ease-in-out infinite}
.tg-d-flow i:nth-child(2){animation-delay:.18s}.tg-d-flow i:nth-child(3){animation-delay:.36s}
@keyframes tg-d-dot{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.25)}}

.tg-d-coins{display:flex;align-items:center;gap:18px}
.tg-d-coin{position:relative;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;color:#5a3a1a;
  background:radial-gradient(circle at 30% 25%,#fff6df,#E6C16E 42%,#8A6420);box-shadow:0 12px 30px rgba(199,154,62,.4),inset 0 -4px 8px rgba(90,58,26,.35);
  animation:tg-d-spin 3.6s cubic-bezier(.6,0,.3,1) infinite;transform-style:preserve-3d}
@keyframes tg-d-spin{0%,10%{transform:rotateY(0)}60%,100%{transform:rotateY(720deg)}}
.tg-d-num{font-size:34px;font-weight:800;color:#F5E3B3;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}
.tg-d-num small{display:block;margin-top:4px;font-size:11px;font-weight:700;letter-spacing:.14em;color:#B79D84}
.tg-d-drop{position:absolute;top:-18px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff6df,#E6C16E);animation:tg-d-fall 3.6s ease-in infinite;opacity:0}
@keyframes tg-d-fall{0%{transform:translateY(0);opacity:0}15%{opacity:1}60%,100%{transform:translateY(96px);opacity:0}}

.tg-d-done svg .c{stroke-dasharray:190;stroke-dashoffset:190;animation:tg-d-draw 1s .15s cubic-bezier(.5,0,.2,1) forwards}
.tg-d-done svg .k{stroke-dasharray:50;stroke-dashoffset:50;animation:tg-d-draw .6s .95s cubic-bezier(.5,0,.2,1) forwards}
.tg-d-done svg .r{transform-origin:50% 50%;animation:tg-d-ray 1.1s .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes tg-d-draw{to{stroke-dashoffset:0}}
@keyframes tg-d-ray{from{opacity:1;transform:scale(.5)}to{opacity:0;transform:scale(1.5)}}

@media (max-width:639px){
  .tg-stage{height:104px}.tg-ghost{font-size:70px}.tg-body{padding:14px 16px 14px}
  .tg-hero{padding:34px 20px 22px}.tg-d-text{font-size:22px}.tg-d-file{width:54px;height:66px}
}
@media (prefers-reduced-motion:reduce){
  .tg-root,.tg-hole{transition:none}
  .tg-blob,.tg-dust i,.tg-ring,.tg-glow,.tg-scan::after,.tg-wave,.tg-mark .pr,.tg-mark .core svg,.tg-chip,.tg-next::after,
  .tg-d-pill,.tg-d-tab,.tg-d-wr::before,.tg-d-badge,.tg-d-coin,.tg-d-drop,.tg-d-flow i,.tg-title .ai{animation:none!important}
  .tg-w,.tg-li,.tg-glass,.tg-hero-wrap,.tg-title .ch,.tg-sub,.tg-cta,.tg-chip{animation-duration:.01ms!important;animation-delay:0s!important}
  .tg-d-wr::before{transform:scaleX(1)}
}

/* ---------- Iliq nur mavzusi: qoʻllanma saytning yumshoq yorugʻ uslubiga moslashadi ---------- */
.tg-root{color:#2a2015}
.tg-blur{background:radial-gradient(120% 95% at 50% 38%,rgba(226,178,98,.22),rgba(28,16,7,.66));
  -webkit-backdrop-filter:blur(12px) saturate(1.05);backdrop-filter:blur(12px) saturate(1.05)}
.tg-blob{mix-blend-mode:screen;opacity:.5}
.tg-hero{background:radial-gradient(90% 60% at 50% 0%,rgba(250,226,160,.7),transparent 70%),linear-gradient(165deg,rgba(243,224,182,.98),rgba(228,196,138,.98));
  border:1px solid rgba(143,101,20,.3);box-shadow:0 40px 100px rgba(52,28,6,.5),inset 0 1px 0 rgba(255,226,160,.7)}
.tg-hero .hb1{background:radial-gradient(circle,rgba(246,176,96,.55),transparent 68%);mix-blend-mode:normal}
.tg-hero .hb2{background:radial-gradient(circle,rgba(244,160,140,.45),transparent 68%);mix-blend-mode:normal}
.tg-mark .core>div{background:linear-gradient(160deg,#6b4021,#3c2210)}
.tg-title{color:#2a2015}
.tg-title .ai{background:linear-gradient(100deg,#5e4008 10%,#8f6514 45%,#d4a73c 52%,#8f6514 60%,#5e4008 90%);background-size:240% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent}
.tg-sub{color:#4a3b28}
.tg-chip{color:#43361f;background:rgba(255,255,255,.6);border:1px solid rgba(120,90,30,.3)}
.tg-glass{background:linear-gradient(165deg,rgba(243,224,182,.98),rgba(230,200,144,.98));border:1px solid rgba(143,101,20,.3);
  box-shadow:0 36px 90px rgba(52,28,6,.5),inset 0 1px 0 rgba(255,226,160,.7)}
.tg-glass::before{background:radial-gradient(380px circle at var(--mx,50%) var(--my,-10%),rgba(255,222,150,.4),transparent 62%)}
.tg-stage{background:radial-gradient(120% 150% at 50% 0%,rgba(236,176,84,.4),transparent 62%),linear-gradient(180deg,rgba(255,226,160,.3),transparent);
  border-bottom:1px solid rgba(120,90,30,.18)}
.tg-ghost{-webkit-text-stroke:1px rgba(143,101,20,.22)}
.tg-kicker{color:#6e5a3a}
.tg-h{color:#2a2015}
.tg-p{color:#43361f}
.tg-li{color:#4a3b28}
.tg-seg i{background:rgba(120,90,30,.2)}
.tg-seg i::after{background:linear-gradient(90deg,#b98a26,#e6c16e)}
.tg-back{background:rgba(143,101,20,.10);color:#43361f;border:1px solid rgba(120,90,30,.3)}
.tg-back:hover:not(:disabled){background:rgba(143,101,20,.18)}
.tg-skip{color:#675540}.tg-skip:hover{color:#7a5412}
.tg-x{background:rgba(120,70,25,.10);color:#675540}
.tg-x:hover{background:rgba(120,70,25,.18);color:#3f2d08}
.tg-next:focus-visible,.tg-back:focus-visible,.tg-skip:focus-visible,.tg-x:focus-visible{outline-color:#b0651a}
.tg-d-tabs{background:rgba(240,214,160,.75);border:1px solid rgba(120,90,30,.28);box-shadow:inset 0 2px 8px rgba(120,90,30,.12)}
.tg-d-pill{background:linear-gradient(135deg,rgba(230,193,110,.5),rgba(199,154,62,.38));border:1px solid rgba(143,101,20,.5);box-shadow:0 6px 20px rgba(199,154,62,.3)}
.tg-d-tab{color:#675540}
@keyframes tg-d-lit{0%,28%{color:#3f2d08}38%,100%{color:#675540}}
.tg-d-tag{color:#6e5a3a}
.tg-d-tag b{background:rgba(199,154,62,.2);border:1px solid rgba(143,101,20,.4);color:#5e4008}
.tg-d-text{color:#2a2015}
.tg-d-doc{box-shadow:0 14px 34px rgba(100,58,18,.28)}
.tg-d-file{background:linear-gradient(160deg,rgba(246,228,186,.95),rgba(232,204,150,.85));border:1px solid rgba(143,101,20,.35);color:#5e4008;box-shadow:0 10px 24px rgba(100,58,18,.2)}
.tg-d-flow i{background:#b98a26}
.tg-d-num{color:#5e4008}
.tg-d-num small{color:#6e5a3a}
.tg-d-drop{background:radial-gradient(circle at 30% 30%,#fff6df,#d4a73c)}
.tg-d-done svg .r{stroke:rgba(143,101,20,.5)}
.tg-d-done svg .c{stroke:#b98a26}


/* ---------- DOCX Transliteration PRO: live premium mini-scene ---------- */
.tg-d-pro{
  position:relative;isolation:isolate;
  width:min(94%,340px);display:flex;align-items:center;justify-content:center;gap:11px;
}
.tg-d-pro-halo{
  position:absolute;z-index:-1;inset:-18px 25px;
  background:radial-gradient(ellipse at 38% 40%,rgba(255,216,145,.37),rgba(196,120,59,.1) 48%,transparent 72%);
  filter:blur(12px);pointer-events:none;animation:tg-pro-halo 5s ease-in-out infinite alternate;
}
@keyframes tg-pro-halo{
  from{transform:scale(.92);opacity:.58}
  to{transform:scale(1.08);opacity:1}
}
.tg-d-pro-paper{
  position:relative;overflow:hidden;
  flex:0 0 auto;width:202px;min-height:111px;padding:10px 12px 9px;
  border:1px solid rgba(255,247,226,.92);border-radius:13px;
  color:#3E281B;
  background:linear-gradient(154deg,#FFFAEB 0%,#F8E6C9 69%,#E6C297 100%);
  box-shadow:0 11px 24px rgba(70,36,15,.26),inset 0 1px 0 #FFFDF2,inset 0 -1px 0 rgba(142,80,38,.13);
  transform:rotate(-2deg);animation:tg-pro-hover 4.8s ease-in-out infinite;
}
.tg-d-pro-paper::before{
  content:"";position:absolute;top:0;bottom:0;width:38%;left:-80%;
  transform:skewX(-20deg);pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,255,245,.44),transparent);
  animation:tg-pro-sweep 5.8s 1.2s ease-in-out infinite;
}
@keyframes tg-pro-sweep{0%,19%{left:-80%}56%,100%{left:160%}}
@keyframes tg-pro-hover{
  0%,100%{transform:translateY(1px) rotate(-2deg)}
  50%{transform:translateY(-3px) rotate(-.6deg)}
}
.tg-d-pro-head{display:flex;align-items:center;gap:6px;min-width:0}
.tg-d-pro-file-icon{
  width:23px;height:23px;flex-shrink:0;border-radius:7px;display:grid;place-items:center;
  color:#FFF6E7;background:linear-gradient(145deg,#B87745,#79502F);
  border:1px solid rgba(216,155,101,.4);
  box-shadow:0 2px 6px rgba(117,62,28,.19),inset 0 1px 0 rgba(255,230,189,.55);
}
.tg-d-pro-filename{font-size:10.5px;font-weight:800;color:#51311F;white-space:nowrap}
.tg-d-pro-filedot{
  margin-left:auto;width:5px;height:5px;flex-shrink:0;border-radius:50%;
  background:#D8A363;box-shadow:0 0 8px rgba(190,126,59,.66);animation:tg-pro-halo 3s ease-in-out infinite alternate;
}
.tg-d-pro-script{
  margin-top:7px;min-height:20px;font-size:16px;line-height:1.28;font-weight:800;
  color:#3B2314;letter-spacing:-.015em;white-space:nowrap;
  animation:tg-pro-script .65s cubic-bezier(.18,.82,.22,1) both;
}
@keyframes tg-pro-script{
  from{opacity:.12;transform:translateY(7px);filter:blur(3px)}
  to{opacity:1;transform:none;filter:blur(0)}
}
.tg-d-pro-underline{display:block;width:86%;height:3px;margin-top:6px;border-radius:5px;background:rgba(117,76,49,.18)}
.tg-d-pro-underline.short{width:58%;margin-top:4px}
.tg-d-pro-lang{
  position:absolute;right:10px;bottom:9px;
  padding:3px 6px;border-radius:5px;
  font-size:7px;letter-spacing:.08em;font-weight:800;
  background:rgba(166,101,55,.15);color:#80502D;
}
.tg-d-pro-side{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:96px}
.tg-d-pro-arrows{
  display:flex;flex-direction:column;align-items:center;gap:5px;
  color:#70401E;font-size:9px;font-weight:800;letter-spacing:.005em;text-align:center;
}
.tg-d-pro-arrows svg{
  color:#AF6D36;filter:drop-shadow(0 0 7px rgba(244,188,102,.5));
  animation:tg-pro-turn 5.4s cubic-bezier(.22,.7,.32,1) infinite;
}
@keyframes tg-pro-turn{
  0%,11%{transform:rotate(0deg)}
  39%,53%{transform:rotate(180deg)}
  82%,100%{transform:rotate(360deg)}
}
.tg-d-pro-price{
  display:flex;align-items:center;gap:5px;padding:7px 9px;
  border:1px solid rgba(255,226,171,.48);border-radius:10px;
  background:linear-gradient(160deg,#BD8853,#85502C 72%,#663A22);
  color:#FFF3DD;font-size:11px;font-weight:700;white-space:nowrap;
  box-shadow:0 6px 13px rgba(94,49,23,.26),inset 0 1px 0 rgba(255,234,196,.51);
  animation:tg-pro-price 5.4s ease-in-out infinite;
}
.tg-d-pro-price strong{font-size:14px;color:#FFF8E8}
.tg-d-pro-price svg{color:#F9D9A2;filter:drop-shadow(0 0 4px rgba(255,222,166,.45))}
@keyframes tg-pro-price{0%,100%{box-shadow:0 5px 13px rgba(94,49,23,.22),inset 0 1px 0 rgba(255,234,196,.51)}
  50%{box-shadow:0 7px 19px rgba(94,49,23,.36),0 0 16px rgba(238,169,88,.23),inset 0 1px 0 rgba(255,234,196,.69)}}
.tg-d-pro-example{font-size:9px;color:#765536;font-weight:600;letter-spacing:.04em}
@media(max-width:639px){
  .tg-d-pro{gap:9px;width:min(96%,302px)}
  .tg-d-pro-paper{width:183px;min-height:93px;padding:8px 10px}
  .tg-d-pro-script{font-size:14px;margin-top:4px}
  .tg-d-pro-underline{margin-top:4px}
  .tg-d-pro-side{min-width:87px;gap:5px}
  .tg-d-pro-price{padding:6px 7px;font-size:10px}
}
@media(prefers-reduced-motion:reduce){
  .tg-d-pro-halo,.tg-d-pro-paper,.tg-d-pro-paper::before,
  .tg-d-pro-filedot,.tg-d-pro-script,.tg-d-pro-arrows svg,
  .tg-d-pro-price{animation:none!important;transform:none!important;filter:none!important}
}
`;
