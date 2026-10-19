'use client';

import {useEffect,useState} from 'react';
import {ArrowRight,Coins,Loader2,SlidersHorizontal,Wallet} from 'lucide-react';

export type FlexibleCoinQuote={
  coins:number;
  price:number;
  mode:'budget'|'coins';
  minimumPrice?:number;
  limits:{minCoins:number;maxCoins:number;minBudget:number;maxBudget:number};
};

type Props={
  apiUrl:string;
  onCheckout:(mode:'budget'|'coins',value:number,quote:FlexibleCoinQuote)=>Promise<void>;
};
const display=(v:number)=>new Intl.NumberFormat('ru-RU').format(v);

export default function FlexibleCoinOffer({apiUrl,onCheckout}:Props){
  const [mode,setMode]=useState<'budget'|'coins'>('budget');
  const [value,setValue]=useState('20000');
  const [quote,setQuote]=useState<FlexibleCoinQuote|null>(null);
  const [quotedKey,setQuotedKey]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const currentKey=mode+':'+value;
  const ready=quote!==null&&quotedKey===currentKey&&!loading;

  useEffect(()=>{
    const controller=new AbortController();
    setQuote(null);
    setQuotedKey('');
    setError('');
    const number=Number(value);
    if(!/^[1-9]\d*$/.test(value)||!Number.isSafeInteger(number)){
      setLoading(false);
      return ()=>controller.abort();
    }
    setLoading(true);
    const timeout=setTimeout(async()=>{
      try{
        const response=await fetch(apiUrl+'/api/payment/quote',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(mode==='budget'?{budget:number}:{coins:number}),
          signal:controller.signal,
          cache:'no-store'
        });
        const data=await response.json();
        if(!response.ok||!data.success)throw new Error(data.error||'Narxni hisoblab boʻlmadi');
        if(!controller.signal.aborted){
          setQuote(data as FlexibleCoinQuote);
          setQuotedKey(mode+':'+value);
        }
      }catch(e){
        if(!controller.signal.aborted){
          setError(e instanceof Error?e.message:'Aloqa xatosi');
        }
      }finally{
        if(!controller.signal.aborted)setLoading(false);
      }
    },280);
    return ()=>{controller.abort();clearTimeout(timeout);};
  },[mode,value,apiUrl]);

  const switchMode=(next:'budget'|'coins')=>{
    if(mode===next)return;
    setMode(next);
    setValue(next==='budget'?'20000':'50');
  };
  const checkout=async()=>{
    if(!ready||submitting||!quote)return;
    setSubmitting(true);
    try {await onCheckout(mode,Number(value),quote);}
    finally {setSubmitting(false);}
  };
  const temporarilyLimited=ready&&quote.coins>15;
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#D4A373]/40 bg-gradient-to-br from-[#241812] via-[#19110E] to-[#100C09] p-4 sm:p-5 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
      <div className="pointer-events-none absolute -top-16 right-0 h-36 w-36 rounded-full bg-[#D4A373]/10 blur-3xl"/>
      <div className="relative flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4A373]/30 bg-[#D4A373]/15 text-[#E0A96D]">
          <SlidersHorizontal className="h-4 w-4"/>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#FBF5F0]">Oʻzingizga mos tangalar</h3>
          <p className="text-[11px] text-[#BBA899]">Summa yoki tangalar sonini oʻzingiz belgilang</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-[#342319] bg-[#110C09] p-1">
        <button type="button" onClick={()=>switchMode('budget')}
          aria-pressed={mode==='budget'}
          className={'rounded-lg px-3 py-2.5 text-xs font-semibold transition-all '+(mode==='budget'?'bg-[#D4A373] text-[#120D0A] shadow-sm':'text-[#BDA99A] hover:text-white')}>
          Summa kiritish
        </button>
        <button type="button" onClick={()=>switchMode('coins')}
          aria-pressed={mode==='coins'}
          className={'rounded-lg px-3 py-2.5 text-xs font-semibold transition-all '+(mode==='coins'?'bg-[#D4A373] text-[#120D0A] shadow-sm':'text-[#BDA99A] hover:text-white')}>
          Tanga kiritish
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-[#CDB8A8]">
            {mode==='budget'?'Qancha soʻm sarflamoqchisiz?':'Nechta tanga kerak?'}
          </span>
          <div className="flex items-center rounded-xl border border-[#60422D] bg-[#100B08] px-3 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/10">
            <input
              inputMode="numeric"
              type="number" min={1} step={1}
              value={value}
              onChange={e=>setValue(e.target.value)}
              className="w-full min-w-0 bg-transparent py-3 text-lg font-bold tabular-nums text-[#FBF5F0] outline-none"
              aria-label={mode==='budget'?'Summa UZS':'Tanga soni'}
            />
            <span className="shrink-0 text-xs font-semibold text-[#D4A373]">{mode==='budget'?'soʻm':'tanga'}</span>
          </div>
        </label>

        <div className="rounded-xl border border-[#D4A373]/20 bg-[#D4A373]/[0.07] px-4 py-3">
          <p className="text-[10px] text-[#BEA999]">{mode==='budget'?'Siz olasiz':'Taxminiy narx'}</p>
          <div className="mt-1 flex min-h-7 items-center gap-1.5">
            {loading?<Loader2 className="h-5 w-5 animate-spin text-[#D4A373]"/>:
             ready?<><span className="text-xl font-bold tabular-nums text-[#FBF5F0]">{display(mode==='budget'?quote!.coins:quote!.price)}</span>
               <span className="text-xs text-[#D4A373]">{mode==='budget'?'tanga':'soʻm'}</span></>:
             <span className="text-xs text-[#8C7A6B]">—</span>}
          </div>
          {ready&&<p className="mt-1 text-[10px] text-[#C3AC99]">
            {mode==='budget'?('Narx: '+display(quote!.price)+' soʻm'):
              ('1 tanga o‘rtacha '+display(Math.round(quote!.price/quote!.coins))+' soʻm')}
          </p>}
        </div>
      </div>

      {error&&<p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}
      {temporarilyLimited&&<p className="mt-2 text-[11px] text-amber-300">
        Hozir SMS orqali avtomatik tasdiqlash 15 tangagacha cheklangan. Kattaroq miqdor uchun toʻlov keyinroq ochiladi.
      </p>}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] leading-relaxed text-[#A89485] sm:max-w-[58%]">
          Yirikroq buyurtmalar uchun tanga narxi pasayadi. Tayyor paketlar eng qulay taklif boʻlib qoladi.
        </p>
        <button type="button" disabled={!ready||submitting||temporarilyLimited}
          onClick={()=>void checkout()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E0B283] to-[#BA8959] px-5 py-3 text-xs font-bold text-[#160E08] shadow-md shadow-[#D4A373]/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
          {submitting?<Loader2 className="h-4 w-4 animate-spin"/>:<><Wallet className="h-4 w-4"/><span>Toʻlovga oʻtish</span><ArrowRight className="h-4 w-4"/></>}
        </button>
      </div>
      <p className="mt-2.5 text-[10px] text-[#8C7A6B]">Aniq toʻlov summasi buyurtma yaratilganda tasdiqlanadi (99 soʻmgacha kamroq).</p>
    </section>
  );
}
