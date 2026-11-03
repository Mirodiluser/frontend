'use client';
import {useState} from 'react';
import {ArrowRight,Loader2,Wallet} from 'lucide-react';

type Props={
 balance:number|null;
 onCheckout:(amount:number)=>Promise<void>;
};
const format=(value:number)=>new Intl.NumberFormat('uz-UZ').format(value);
export default function UzsTopupPanel({balance,onCheckout}:Props){
 const [raw,setRaw]=useState('2000');
 const [busy,setBusy]=useState(false);
 const entered=Number(raw);
 const valid=raw.trim()!==''&&Number.isSafeInteger(entered)&&entered>0&&entered<=10000000;
 const rounded=valid?Math.floor(entered/100)*100:0;
 const amount=valid?Math.max(2000,rounded):0;
 const needsMinimum=valid&&entered<2000;
 const needsRounding=valid&&!needsMinimum&&entered!==rounded;
 const submit=async()=>{
  if(!valid||busy)return;
  setBusy(true);
  try{await onCheckout(amount);}finally{setBusy(false);}
 };
 return <div className="space-y-5">
  <div className="rounded-2xl bg-[var(--surface-alt)] border border-[#C79A3E]/30 p-5">
   <p className="text-xs font-semibold text-[var(--text-muted)]">Shaxsiy hisobingiz</p>
   <div className="flex items-center gap-3 mt-2">
    <Wallet className="w-6 h-6 text-[var(--accent)]"/>
    <p className="text-3xl font-serif font-bold text-[var(--text-main)]">{balance===null?'—':format(balance)} <span className="text-base font-medium text-[var(--gold-text)]">soʻm</span></p>
   </div>
  </div>
  <div className="space-y-2">
   <label htmlFor="uzs-topup-amount" className="text-sm font-bold text-[var(--text-main)]">Hisobni toʻldirish summasi</label>
   <div className="flex items-center gap-3 rounded-xl bg-[var(--input-bg)] border border-[var(--line)] px-4 py-3 focus-within:border-[#C79A3E]">
    <input id="uzs-topup-amount" type="number" inputMode="numeric" min="1" step="100" value={raw}
      onChange={e=>setRaw(e.target.value)}
      className="flex-1 min-w-0 bg-transparent outline-none text-xl font-semibold text-[var(--text-main)]" placeholder="2000"/>
    <span className="text-sm font-medium text-[var(--gold-text)]">soʻm</span>
   </div>
   {needsMinimum&&<p className="text-xs font-medium text-amber-700">Minimal toʻlov 2 000 soʻm. Davom etsangiz 2 000 soʻmlik buyurtma yaratiladi.</p>}
   {needsRounding&&<p className="text-xs font-medium text-amber-700">Toʻlov summasi 100 soʻmlik aniqlikka yaxlitlanadi: {format(amount)} soʻm.</p>}
   {!valid&&raw!==''&&<p className="text-xs font-medium text-rose-700">1 dan 10 000 000 gacha butun summa kiriting.</p>}
  </div>
  <div className="rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] p-4 flex items-center justify-between">
   <span className="text-xs font-medium text-[var(--text-muted)]">Toʻlov uchun</span>
   <strong className="text-lg text-[var(--text-main)]">{valid?format(amount):'—'} soʻm</strong>
  </div>
  <button onClick={()=>void submit()} disabled={!valid||busy||balance===null}
    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C79A3E] hover:bg-[#D6AC58] text-[#20180C] px-5 py-3.5 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
    {busy?<Loader2 className="w-4 h-4 animate-spin"/>:<ArrowRight className="w-4 h-4"/>}
    {needsMinimum?'2 000 soʻmga davom etish':'Toʻlovga oʻtish'}
  </button>
  <p className="text-xs text-center text-[var(--text-muted)]">Toʻlov buyurtmasi 5 daqiqa amal qiladi. Faqat ko'rsatilgan aniq summani toʻlang.</p>
 </div>;
}