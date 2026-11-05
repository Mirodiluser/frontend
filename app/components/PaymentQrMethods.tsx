'use client';

import {useState} from 'react';
import {Check, Copy, QrCode} from 'lucide-react';

// These matrices encode the payment data from the QR codes supplied by the owner.
// Keeping the matrices in source avoids remote image hosting or third-party tracking.
const CODES = {
  click: {
    size: 37,
    rows: '1fd14d6d7f 105b5baf41 174c150d5d 175a1e7a5d 17436c575d 104492d841 1fd555557f 0015af0600 16e452c54b 1fb238acae 17fee50b48 1c89e6689c 034b041edb 0d9f315b78 1df2005855 038a0e1232 1adc1f0f1e 11b93b9817 07c831b71b 1e9f3b8022 11ee9f0535 1f248e6508 015f80a0e2 130974dc9c 12f724a1f4 06831e0ab7 0cc67352fa 179914b311 05e164adf5 00159ef915 1fd0ab8955 105b620710 17458415fa 175164f9db 175b52a8d2 1048504c70 1fdababc17'.split(' '),
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
      {method==='click' && (
        <g aria-hidden="true">
          <circle cx={size/2+4} cy={size/2+4} r="5.9" fill="#fff"/>
          <rect x={size/2} y={size/2} width="8" height="8" rx="3.4"
            transform={`rotate(45 ${size/2+4} ${size/2+4})`} fill="#087cf6"/>
          <circle cx={size/2+4} cy={size/2+4} r="1.45" fill="#fff"/>
        </g>
      )}
    </svg>
  );
}

export default function PaymentQrMethods() {
  const [selected,setSelected]=useState<keyof typeof CODES>('click');
  const [copied,setCopied]=useState(false);
  const item=CODES[selected];
  const copyPaymentData=async()=>{
    const value=selected==='click'
      ? 'https://my.click.uz/clickp2p/4B93BE8781CA620547655EA4223BCADD0DA84F8C31F3DD416914653CF798610A'
      : '50507049072656567940';
    try {await navigator.clipboard.writeText(value);setCopied(true);window.setTimeout(()=>setCopied(false),2000);} catch {/* Clipboard permission can be denied. */}
  };
  return (
    <section aria-label="QR orqali to‘lov" className="h-full rounded-[22px] border border-[#C79A3E]/25 bg-[var(--surface-alt)] p-3 sm:p-4 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="mb-2.5 flex items-center gap-2">
        <QrCode className="h-4 w-4 text-[var(--gold-text)]"/>
        <h3 className="text-sm font-bold text-[var(--text-main)]">QR orqali to‘lov</h3>
      </div>
      <div role="group" aria-label="To‘lov ilovasini tanlang" className="grid grid-cols-2 gap-2">
        {(['click','payme'] as const).map(method=>(
          <button key={method} type="button" onClick={()=>{setSelected(method);setCopied(false)}}
            aria-pressed={selected===method}
            className={`flex min-w-0 items-center justify-center rounded-xl border p-2 transition-all duration-200 ${selected===method?'border-[#C79A3E] bg-[#C79A3E]/10 shadow-[0_5px_18px_rgba(199,154,62,0.16)]':'border-[var(--line)] bg-[var(--input-bg)] hover:border-[#C79A3E]/40'}`}>
            <img src={method==='click'?'https://api.logobank.uz/media/logos_png/Click-02.png':'https://cdn.payme.uz/logo/new/svg/payme_blue.svg'}
              alt={CODES[method].title} loading="lazy" className="h-8 w-full max-w-[116px] rounded-md object-contain" />
          </button>
        ))}
      </div>
      <div className="mx-auto mt-2.5 w-full max-w-[190px] overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
        <PaymentCode method={selected}/>
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-[var(--text-main)]">{item.tag} skaner qiling</p>
      <button type="button" onClick={()=>void copyPaymentData()}
        className="mx-auto mt-1 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--gold-text)] hover:bg-[#C79A3E]/10">
        {copied?<Check className="h-3.5 w-3.5"/>:<Copy className="h-3.5 w-3.5"/>}
        {copied?'Nusxalandi':'Maʼlumotni nusxalash'}
      </button>
    </section>
  );
}
