'use client';
import {useEffect,useState,useCallback} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {AlertCircle,Check,CheckCheck,Clock3,Copy,ExternalLink,Headphones,LoaderCircle,ShieldCheck,Wallet,X,RefreshCw} from 'lucide-react';
import PaymentQrMethods from './PaymentQrMethods';

type OrderStatus='PENDING'|'REVIEW'|'PAID'|'DECLINED'|'EXPIRED';
type Props={
  apiUrl:string;orderId:string;amount:number;createdAt?:string;expiresAt?:string;
  cardNumber:string;onClose:()=>void;onPaid:()=>void;
};
const format=(x:number)=>new Intl.NumberFormat('uz-UZ').format(x);
const SUPPORT='https://t.me/khshmx';
const stepTitle:Record<OrderStatus,string>={
  PENDING:'Toʻlov kutilmoqda',REVIEW:'Toʻlov tekshirilmoqda',
  PAID:'Toʻlov tasdiqlandi',DECLINED:'Toʻlov tasdiqlanmadi',EXPIRED:'Buyurtma muddati tugadi'
};
async function authenticated(url:string,init:RequestInit={}){
  const token=localStorage.getItem('tahrir_token');
  const headers=new Headers(init.headers);
  if(token)headers.set('Authorization','Bearer '+token);
  return fetch(url,{...init,headers,cache:'no-store'});
}
function formatClock(seconds:number){
  const s=Math.max(0,seconds);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}
export default function UzsPaymentExperience({
  apiUrl,orderId,amount,createdAt,expiresAt,cardNumber,onClose,onPaid
}:Props){
  const [status,setStatus]=useState<OrderStatus>('PENDING');
  const [seconds,setSeconds]=useState(1800);
  const [elapsed,setElapsed]=useState(0);
  const [loaded,setLoaded]=useState(false);
  const [claimed,setClaimed]=useState(false);
  const [smsReceived,setSmsReceived]=useState(false);
  const [submitBusy,setSubmitBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [copied,setCopied]=useState<'card'|'amount'|null>(null);
  const [serverExpires,setServerExpires]=useState(expiresAt||'');
  const [serverCreated,setServerCreated]=useState(createdAt||'');
  const finalPaid=useCallback(()=>{try{localStorage.removeItem('tahrir_pending_uzs_order');}catch{}onPaid();},[onPaid]);
  useEffect(()=>{
    let active=true;
    let finished=false;
    const refresh=async()=>{
      try{
        const response=await authenticated(apiUrl+'/api/uzs/payment/check-status/'+encodeURIComponent(orderId));
        if(!response.ok){if(response.status===404&&active)setMessage('Buyurtma topilmadi. Yordam uchun qoʻllab-quvvatlashga murojaat qiling.');return;}
        const d=await response.json();
        if(!active)return;
        setLoaded(true);
        setMessage('');
        const next=d.status as OrderStatus;
        if(!['PENDING','REVIEW','PAID','DECLINED','EXPIRED'].includes(next))return;
        setStatus(next);
        setClaimed(Boolean(d.userMarkedPaid));
        setSmsReceived(Boolean(d.smsReceived));
        if(typeof d.expiresAt==='string')setServerExpires(d.expiresAt);
        if(typeof d.createdAt==='string')setServerCreated(d.createdAt);
        if(next==='PAID'&&!finished){finished=true;finalPaid();}
      }catch{if(active)setMessage('Server bilan aloqa uzildi. Tekshiruv qayta davom etadi.');}
    };
    void refresh();
    const poll=window.setInterval(()=>void refresh(),2500);
    return()=>{active=false;window.clearInterval(poll);};
  },[apiUrl,orderId,finalPaid]);
  useEffect(()=>{
    const tick=()=>{
      const now=Date.now();
      if(serverExpires){const ms=Date.parse(serverExpires);if(Number.isFinite(ms))setSeconds(Math.max(0,Math.ceil((ms-now)/1000)));}
      if(serverCreated){const ms=Date.parse(serverCreated);if(Number.isFinite(ms))setElapsed(Math.max(0,Math.floor((now-ms)/1000)));}
    };
    tick();const id=window.setInterval(tick,1000);return()=>window.clearInterval(id);
  },[serverExpires,serverCreated]);
  const markPaid=async()=>{
    if(submitBusy||elapsed<25||status!=='PENDING')return;
    setSubmitBusy(true);setMessage('');
    try{
      const response=await authenticated(apiUrl+'/api/uzs/payment/mark-paid/'+encodeURIComponent(orderId),{
        method:'POST',headers:{'Content-Type':'application/json'},body:'{}'
      });
      const d=await response.json().catch(()=>({}));
      if(d.decision==='REVIEW_PENDING'||d.decision==='REVIEW_ALREADY_SENT'){
        setClaimed(true);setStatus('REVIEW');
      }else if(d.decision==='PAID'){finalPaid();}
      else if(d.decision==='EXPIRED'){setStatus('EXPIRED');}
      else setMessage(d.error||'Xabar yuborilmadi. Iltimos, qayta urinib koʻring.');
    }catch{setMessage('Ulanishda xatolik. Qayta urinib koʻring.');}
    finally{setSubmitBusy(false);}
  };
  const copy=async(kind:'card'|'amount')=>{
    try{await navigator.clipboard.writeText(kind==='card'?cardNumber:String(amount));
      setCopied(kind);window.setTimeout(()=>setCopied(null),1800);}catch{}
  };
  const waiting=status==='PENDING'||status==='REVIEW';
  return <div className="fixed inset-0 z-[65] flex items-center justify-center overflow-y-auto bg-[#0a0908]/75 p-3 backdrop-blur-xl sm:p-5" onClick={onClose}>
    <motion.section role="dialog" aria-modal="true" aria-label="Toʻlov holati"
      initial={{opacity:0,scale:.96,y:24}} animate={{opacity:1,scale:1,y:0}}
      exit={{opacity:0,scale:.96,y:16}} transition={{type:'spring',stiffness:230,damping:27}}
      onClick={e=>e.stopPropagation()}
      className="relative my-auto w-full max-w-[790px] overflow-hidden rounded-[30px] border border-[#C79A3E]/40 bg-[var(--modal-bg)] shadow-[0_32px_120px_rgba(0,0,0,.45)]">
      <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#C79A3E]/15 blur-[72px]"/>
      <div className="relative p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#C79A3E]/35 bg-[#C79A3E]/12 text-[var(--gold-text)] shadow-sm">
              <Wallet className="h-5 w-5"/>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.19em] text-[var(--gold-text)]">TAHRIR AI · TOʻLOV</p>
              <h2 className="mt-0.5 text-lg font-bold text-[var(--text-main)] sm:text-xl">{stepTitle[status]}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} title="Yopish" className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] p-2 text-[var(--text-muted)] transition hover:rotate-90 hover:text-[var(--text-main)]">
            <X className="h-5 w-5"/>
          </button>
        </div>
        <AnimatePresence mode="wait">
        {status==='PENDING'&&<motion.div key="checkout" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="pt-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#C79A3E]/30 bg-[#C79A3E]/10 p-4">
                <p className="text-xs font-medium text-[var(--text-muted)]">Aynan shu summani toʻlang</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-serif text-3xl font-bold tracking-tight text-[var(--text-main)]">{format(amount)} <span className="text-sm">soʻm</span></span>
                  <button type="button" onClick={()=>void copy('amount')} title="Summani nusxalash" className="rounded-lg p-2 text-[var(--gold-text)] transition hover:bg-[#C79A3E]/15">{copied==='amount'?<Check className="h-4 w-4"/>:<Copy className="h-4 w-4"/>}</button>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Clock3 className="h-3.5 w-3.5"/><span>Buyurtma muddati: <b className="tabular-nums text-[var(--text-main)]">{formatClock(seconds)}</b></span>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-4">
                <p className="text-[11px] text-[var(--text-muted)]">Qabul qiluvchi karta</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wider text-[var(--text-main)] sm:text-base">{cardNumber.replace(/(\d{4})/g,'$1 ').trim()}</span>
                  <button type="button" onClick={()=>void copy('card')} className="rounded-lg border border-[var(--line)] p-2 text-[var(--gold-text)] hover:bg-[#C79A3E]/15">{copied==='card'?<Check className="h-4 w-4"/>:<Copy className="h-4 w-4"/>}</button>
                </div>
              </div>
              <div className="flex gap-2 rounded-xl border border-[#C79A3E]/20 p-3 text-xs leading-5 text-[var(--text-muted)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-text)]"/>
                <span>Click, Payme yoki kartaga oʻtkazing. Toʻlovdan soʻng «Men toʻladim» tugmasini bosing. Administrator bankdagi tushumni tekshiradi.</span>
              </div>
            </div>
            <PaymentQrMethods/>
          </div>
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {loaded&&elapsed>=25?(
                <motion.button key="mark" type="button" onClick={()=>void markPaid()} disabled={submitBusy}
                  initial={{opacity:0,y:12,scale:.98}} animate={{opacity:1,y:0,scale:1}}
                  transition={{duration:.45}} whileHover={{scale:1.012}} whileTap={{scale:.985}}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E4BD6D] via-[#CDA14F] to-[#B5893F] px-5 py-4 text-sm font-extrabold text-[#27180B] shadow-[0_12px_28px_rgba(180,130,52,.22)] disabled:opacity-65">
                  {submitBusy?<LoaderCircle className="h-5 w-5 animate-spin"/>:<CheckCheck className="h-5 w-5"/>} Men toʻladim
                </motion.button>
              ):(
                <motion.div key="delay" initial={{opacity:0}} animate={{opacity:1}}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#C79A3E]/25 bg-[var(--surface-alt)] px-4 py-3.5 text-xs text-[var(--text-muted)]">
                  <LoaderCircle className="h-4 w-4 animate-spin text-[var(--gold-text)]"/>
                  «Men toʻladim» tugmasi {Math.max(0,25-elapsed)} soniyadan keyin chiqadi
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>}
        {status==='REVIEW'&&<motion.div key="review" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} className="py-9 text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#C79A3E]/35 bg-[#C79A3E]/10 text-[var(--gold-text)]">
            <div className="absolute inset-0 animate-ping rounded-[28px] border border-[#C79A3E]/20"/>
            <LoaderCircle className="h-9 w-9 animate-spin"/>
          </div>
          <h3 className="mt-5 font-serif text-2xl font-semibold text-[var(--text-main)]">Iltimos, biroz kuting</h3>
          <p className="mx-auto mt-2 max-w-[410px] text-sm leading-6 text-[var(--text-muted)]">
            Toʻlovingiz tekshirishga yuborildi. Administrator bankdagi tushumni tasdiqlagach balansingiz yangilanadi.
          </p>
          <div className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-[var(--surface-alt)] px-4 py-3 text-xs text-[var(--gold-text)]">
            {smsReceived?<Check className="h-4 w-4"/>:<Clock3 className="h-4 w-4"/>}
            {smsReceived?'Bank SMS xabari qabul qilindi':'Administrator javobi kutilmoqda'}
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">{format(amount)} soʻm · Natija avtomatik yangilanadi</p>
        </motion.div>}
        {status==='DECLINED'&&<motion.div key="declined" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="py-9 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-rose-400/30 bg-rose-500/10 text-rose-600"><AlertCircle className="h-10 w-10"/></div>
          <h3 className="mt-5 font-serif text-2xl font-semibold text-[var(--text-main)]">Toʻlov rad etildi</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">Agar pul oʻtkazgan boʻlsangiz, qoʻllab-quvvatlashga yozing. Administrator xato qarorni qayta koʻrib chiqishi mumkin.</p>
        </motion.div>}
        {status==='EXPIRED'&&<motion.div key="expired" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="py-9 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-amber-400/35 bg-amber-500/10 text-amber-700"><Clock3 className="h-10 w-10"/></div>
          <h3 className="mt-5 font-serif text-2xl font-semibold text-[var(--text-main)]">Buyurtma muddati tugadi</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">Agar toʻlovni amalga oshirgan boʻlsangiz, qayta pul oʻtkazmang. Qoʻllab-quvvatlash bilan bogʻlaning.</p>
        </motion.div>}
        {status==='PAID'&&<motion.div key="paid" initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} className="py-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-emerald-400/35 bg-emerald-500/10 text-emerald-700"><CheckCheck className="h-10 w-10"/></div>
          <h3 className="mt-5 font-serif text-2xl font-semibold text-[var(--text-main)]">Toʻlov tasdiqlandi!</h3>
        </motion.div>}
        </AnimatePresence>
        {message&&<div role="alert" className="mt-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-700">{message}</div>}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-4 sm:flex-row">
          <p className="text-[11px] text-[var(--text-muted)]">{waiting?'Holat avtomatik tekshiriladi. Oynani yopish buyurtmani bekor qilmaydi.':'Yordam kerakmi? Biz bilan bogʻlaning.'}</p>
          <a href={SUPPORT} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#C79A3E]/30 bg-[var(--surface-alt)] px-4 py-2.5 text-xs font-bold text-[var(--gold-text)] transition hover:-translate-y-0.5 hover:bg-[#C79A3E]/15">
            <Headphones className="h-4 w-4"/> Qoʻllab-quvvatlash <ExternalLink className="h-3.5 w-3.5"/>
          </a>
        </div>
      </div>
    </motion.section>
  </div>;
}
