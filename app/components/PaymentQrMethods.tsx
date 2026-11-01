'use client';

import {useState} from 'react';
import {Check, Copy, QrCode} from 'lucide-react';

// These matrices encode the payment data from the QR codes supplied by the owner.
// Keeping the matrices in source avoids remote image hosting or third-party tracking.
const CODES = {
  click: {
    size: 49,
    rows: '1fd326b0a497f 1048e22185f41 1754347d4835d 174463a775a5d 1755807f2305d 104b2d475cc41 1fd555555557f 00131cc4d5100 00c91c7e5a755 0d133a8320bdd 04cf4dc61a969 00117724d437a 0edd21f496eb6 0db13c71a8870 0763892f03b09 1a0f29c31642d 15714fb7c2a61 1c1e9d95b1394 1a54b984876cd 113fefa0bff7b 004b605dcfe64 0619fe7bff7d4 07f169fdaf7f7 0f1d8645c4319 155902d701158 071795c55bb13 05f2397d745ff 0ba45dd1c6cb5 1865e5a957bfb 150c29b7277f3 13df76ae3454e 0e85afe8af183 1f5e8a4d89159 04084f0b77cab 1b489032cde38 17b473fbaf617 0edebfeaeffae 020865c71aae2 08c5de1d2695f 0e0d1c6f1bbf0 1c7803fcff7f1 0012b1457ff18 1fc6d0575fd5d 105ae7c4f2d19 1740b2fc87ff6 174c84f13fdb3 174978494d655 10412e92b0cf1 1fce0b22bdf09'.split(' '),
    title: 'Click', gradient: 'from-[#0079fa] to-[#00b5fa]', tag: 'Click orqali'
  },
  payme: {
    size: 25,
    rows: '1fcb27f 1050e41 174625d 174615d 1744c5d 1052f41 1fd557f 001ab00 01eab62 1682c77 0fc6e46 08092c0 1d572b5 102e557 06f31ab 0793839 18d33fe 001cf1b 1fd0f56 1052718 17559f7 1746251 174c312 1044f54 1fcab29'.split(' '),
    title: 'Payme', gradient: 'from-[#00b9c9] to-[#1688cb]', tag: 'Payme orqali'
  }
} as const;

function PaymentCode({method}: {method: keyof typeof CODES}) {
  const {size,rows,title}=CODES[method];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size+8} ${size+8}`}
      role="img" aria-label={`${title} to‘lov QR-kodi`} shapeRendering="crispEdges"
      className="block aspect-square w-full bg-white">
      <rect width={size+8} height={size+8} fill="white"/>
      {rows.flatMap((row,y)=>Array.from({length:size},(_,x)=>{
        const on=(BigInt('0x'+row)&(BigInt(1)<<BigInt(size-x-1)))!==BigInt(0);
        return on?<rect key={`${y}-${x}`} x={x+4} y={y+4} width="1" height="1" fill="#080808"/>:null;
      }))}
    </svg>
  );
}

export default function PaymentQrMethods() {
  const [selected,setSelected]=useState<keyof typeof CODES>('click');
  const [copied,setCopied]=useState(false);
  const item=CODES[selected];
  const copyPaymentData=async()=>{
    const value=selected==='click'
      ? 'https://my.click.uz/clickp2p/4988AF869F5ACCB9600943BB680A3C335732B454A68BA0B2541DE5C6CCC7FE96'
      : '50507049072656567940';
    try {await navigator.clipboard.writeText(value);setCopied(true);window.setTimeout(()=>setCopied(false),2000);} catch {/* Clipboard permission can be denied. */}
  };
  return (
    <section aria-label="QR orqali to‘lov" className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <QrCode className="h-4 w-4 text-[var(--gold-text)]"/>
        <h3 className="text-sm font-bold text-[var(--text-main)]">QR-kod orqali to‘lov</h3>
      </div>
      <div role="group" aria-label="To‘lov ilovasini tanlang" className="grid grid-cols-2 gap-2">
        {(['click','payme'] as const).map(method=>(
          <button key={method} type="button" onClick={()=>{setSelected(method);setCopied(false)}}
            aria-pressed={selected===method}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${selected===method?'border-[#C79A3E] bg-[#C79A3E]/10 text-[var(--text-main)] shadow-[0_4px_15px_rgba(199,154,62,0.15)]':'border-[var(--line)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:border-[#C79A3E]/40'}`}>
            <span aria-hidden="true" className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${CODES[method].gradient} text-sm font-extrabold text-white`}>
              {method==='click'?'C':'P'}
            </span>
            {CODES[method].title}
          </button>
        ))}
      </div>
      <div className="mx-auto mt-3 w-full max-w-[230px] overflow-hidden rounded-2xl border border-black/5 bg-white p-2.5 shadow-[0_12px_35px_rgba(15,23,42,0.10)]">
        <PaymentCode method={selected}/>
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-[var(--text-main)]">{item.tag} QR-kodni skaner qiling</p>
      <p className="mt-1 text-center text-[11px] leading-5 text-[var(--text-muted)]">
        Buyurtmada ko‘rsatilgan aniq summani kiriting. QR-kod summani avtomatik belgilamasligi mumkin.
      </p>
      <button type="button" onClick={()=>void copyPaymentData()}
        className="mx-auto mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[var(--gold-text)] hover:bg-[#C79A3E]/10">
        {copied?<Check className="h-3.5 w-3.5"/>:<Copy className="h-3.5 w-3.5"/>}
        {copied?'Nusxalandi':'To‘lov maʼlumotini nusxalash'}
      </button>
    </section>
  );
}
