'use client';

import {useEffect,useState} from 'react';
import {ArrowRight,Coins,Loader2} from 'lucide-react';

export type FlexibleCoinQuote={
  coins:number;
  price:number;
  mode:'budget'|'coins';
  minimumPrice?:number;
  limits:{minCoins:number;maxCoins:number;minBudget:number;maxBudget:number;maxAutoCoins:number};
};

type Props={
  apiUrl:string;
  onCheckout:(mode:'budget'|'coins',value:number,quote:FlexibleCoinQuote)=>Promise<void>;
};
const display=(v:number)=>new Intl.NumberFormat('ru-RU').format(v);

export default function FlexibleCoinOffer({apiUrl,onCheckout}:Props){
  const [mode,setMode]=useState<'budget'|'coins'>('budget');
  const [value,setValue]=useState('7900');
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
    setValue(next==='budget'?'7900':'10');
  };
  const checkout=async()=>{
    if(!ready||submitting||!quote)return;
    setSubmitting(true);
    try {await onCheckout(mode,Number(value),quote);}
    finally {setSubmitting(false);}
  };
  return (
    <section className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[22px] border border-[#AD7E4E]/45 bg-gradient-to-br from-[#261A14] via-[#1B130F] to-[#120D0B] p-3.5 sm:p-4 shadow-[0_12px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,223,173,0.08)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#D4A373]/[0.08] blur-3xl"/>
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#D4A373]/25 bg-gradient-to-br from-[#D4A373]/20 to-[#D4A373]/[0.04] text-[#E9BB83]">
            <Coins className="h-[17px] w-[17px]"/>
          </span>
          <h3 className="text-[13px] font-semibold tracking-wide text-[#F7E5D2]">Oʻzingizga mos tangalar</h3>
        </div>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#CDA074] shadow-[0_0_10px_rgba(212,163,115,0.55)]"/>
      </div>

      <div className="relative mt-3 flex rounded-[11px] border border-[#4E3628]/65 bg-[#0F0B09]/80 p-[3px]">
        <button type="button" onClick={()=>switchMode('budget')} aria-pressed={mode==='budget'}
          className={'min-w-0 flex-1 rounded-[8px] px-2.5 py-2 text-xs font-semibold transition-all duration-200 '+(mode==='budget'
            ? 'bg-gradient-to-r from-[#E5B985] to-[#BB8956] text-[#160E09] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
            : 'text-[#AC9480] hover:text-[#E9D3BD]')}>
          Summa kiritish
        </button>
        <button type="button" onClick={()=>switchMode('coins')} aria-pressed={mode==='coins'}
          className={'min-w-0 flex-1 rounded-[8px] px-2.5 py-2 text-xs font-semibold transition-all duration-200 '+(mode==='coins'
            ? 'bg-gradient-to-r from-[#E5B985] to-[#BB8956] text-[#160E09] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
            : 'text-[#AC9480] hover:text-[#E9D3BD]')}>
          Tanga kiritish
        </button>
      </div>

      <div className="relative mt-3 grid grid-cols-2 items-stretch gap-2">
        <label className="min-w-0 rounded-[12px] border border-[#5C4231]/75 bg-[#120D0A]/90 px-3 py-2.5 transition-colors focus-within:border-[#D4A373] focus-within:ring-1 focus-within:ring-[#D4A373]/25">
          <span className="block text-[10px] font-medium text-[#AA917D]">
            {mode==='budget'?'Sizning summangiz':'Tangalar soni'}
          </span>
          <span className="mt-1 flex min-w-0 items-baseline gap-1">
            <input
              type="number" inputMode="numeric" min={1} step={1} value={value}
              onChange={e=>setValue(e.target.value)}
              aria-label={mode==='budget'?'Summa UZS':'Tanga soni'}
              className="w-full min-w-0 bg-transparent text-[16px] font-semibold leading-6 tabular-nums text-[#FFF5E9] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="shrink-0 text-[10px] font-medium text-[#C69B70]">{mode==='budget'?'soʻm':'tanga'}</span>
          </span>
        </label>

        <div aria-live="polite" className="min-w-0 rounded-[12px] border border-[#D4A373]/20 bg-gradient-to-b from-[#D4A373]/[0.10] to-[#D4A373]/[0.04] px-3 py-2.5">
          <span className="block text-[10px] font-medium text-[#AA917D]">{mode==='budget'?'Siz olasiz':'Toʻlov narxi'}</span>
          <div className="mt-1 flex min-h-6 min-w-0 items-baseline gap-1">
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin self-center text-[#D4A373]"/>
              : ready
                ? <>
                    <span className="min-w-0 text-[16px] font-bold leading-6 tabular-nums text-[#F5D19C]">{display(mode==='budget'?quote!.coins:quote!.price)}</span>
                    <span className="shrink-0 text-[10px] font-medium text-[#C69B70]">{mode==='budget'?'tanga':'soʻm'}</span>
                  </>
                : <span className="text-sm text-[#887362]">—</span>}
          </div>
        </div>
      </div>

      {error&&<p role="alert" className="relative mt-2 text-[11px] text-rose-300">{error}</p>}

      <button type="button" disabled={!ready||submitting}
        onClick={()=>void checkout()}
        className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E5BA86] via-[#D2A06D] to-[#B98552] px-4 py-2.5 text-xs font-bold text-[#1C110A] shadow-[0_5px_16px_rgba(212,163,115,0.13)] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45">
        {submitting
          ? <Loader2 className="h-4 w-4 animate-spin"/>
          : <>Toʻlovga oʻtish <ArrowRight className="h-3.5 w-3.5"/></>}
      </button>
    </section>
  );
}
