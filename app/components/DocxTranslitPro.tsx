'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowRight,CheckCircle2,Coins,FileText,FileUp,Loader2,Sparkles,Trash2} from 'lucide-react';

type Direction='cyr2lat'|'lat2cyr';
type Quote={pages:number;requiredCoins:number};
type Props={
  apiUrl:string;
  loggedIn:boolean;
  coins:number;
  openLogin:()=>void;
  openShop:()=>void;
  reloadWallet:()=>Promise<unknown>;
  notify:(kind:'success'|'error'|'warning'|'info',title:string,message:string)=>void;
};
const LIMIT=25*1024*1024;
const MAX_PAGES=200;
const showSize=(bytes:number)=>bytes>=1048576?(bytes/1048576).toFixed(1)+' MB':Math.ceil(bytes/1024)+' KB';

export default function DocxTranslitPro({apiUrl,loggedIn,coins,openLogin,openShop,reloadWallet,notify}:Props){
  const [direction,setDirection]=useState<Direction>('cyr2lat');
  const [file,setFile]=useState<File|null>(null);
  const [quote,setQuote]=useState<Quote|null>(null);
  const [loadingQuote,setLoadingQuote]=useState(false);
  const [working,setWorking]=useState(false);
  const [dragging,setDragging]=useState(false);
  const [error,setError]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const quoteRequest=useRef<AbortController|null>(null);
  const reduceMotion=useReducedMotion();
  useEffect(()=>()=>{quoteRequest.current?.abort();},[]);

  const requestQuote=useCallback(async(nextFile:File|null,nextDirection:Direction)=>{
    quoteRequest.current?.abort();
    if(!nextFile){setQuote(null);setLoadingQuote(false);return;}
    const controller=new AbortController();
    quoteRequest.current=controller;
    setQuote(null);
    setLoadingQuote(true);
    setError('');
    const form=new FormData();
    form.append('document',nextFile);
    form.append('direction',nextDirection);
    try {
      const response=await fetch(apiUrl+'/api/transliterate/docx/quote',{
        method:'POST',body:form,signal:controller.signal
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Sahifalar hisoblanmadi');
      if(!Number.isSafeInteger(data.pages)||!Number.isSafeInteger(data.requiredCoins)||
         data.pages<1||data.pages>MAX_PAGES||data.requiredCoins<1)throw new Error('Sahifalar soni notoʻgʻri');
      if(!controller.signal.aborted)setQuote({pages:data.pages,requiredCoins:data.requiredCoins});
    }catch(e){
      if(!controller.signal.aborted){
        setQuote(null);
        setError(e instanceof Error?e.message:'Serverga ulanib boʻlmadi');
      }
    }finally{if(!controller.signal.aborted)setLoadingQuote(false);}
  },[apiUrl]);

  const selectFile=(next:File|null)=>{
    if(working)return;
    if(!next){setFile(null);setError('');void requestQuote(null,direction);return;}
    if(!/\.docx$/i.test(next.name)){
      quoteRequest.current?.abort();
      setFile(null);setQuote(null);setLoadingQuote(false);
      setError('Faqat .DOCX formatidagi Word fayli qabul qilinadi.');return;
    }
    if(!next.size||next.size>LIMIT){
      quoteRequest.current?.abort();
      setFile(null);setQuote(null);setLoadingQuote(false);
      setError('DOCX fayli 25 MB dan oshmasligi kerak.');return;
    }
    setFile(next);void requestQuote(next,direction);
  };
  const changeDirection=(next:Direction)=>{
    if(working||next===direction)return;
    setDirection(next);
    if(file)void requestQuote(file,next);
  };
  const convert=async()=>{
    if(!file||!quote||loadingQuote||working)return;
    if(!loggedIn){openLogin();return;}
    if(coins<quote.requiredCoins){
      notify('warning','Tangalar yetarli emas',quote.requiredCoins+' tanga kerak. Hozirgi balans: '+coins+'.');
      openShop();return;
    }
    setError('');setWorking(true);
    const form=new FormData();
    form.append('document',file);
    form.append('direction',direction);
    form.append('expectedCoins',String(quote.requiredCoins));
    try {
      const token=localStorage.getItem('tahrir_token')||'';
      const response=await fetch(apiUrl+'/api/transliterate/docx',{
        method:'POST',body:form,headers:{Authorization:'Bearer '+token}
      });
      if(!response.ok){
        const data=await response.json().catch(()=>({}));
        if(response.status===401){openLogin();throw new Error('Sessiya tugadi, qaytadan kiring');}
        if(response.status===409){void requestQuote(file,direction);}
        if(response.status===402){openShop();}
        throw new Error(data.error||'DOCX faylini oʻgirishda xatolik yuz berdi');
      }
      const blob=await response.blob();
      if(!blob.size)throw new Error('Natija fayli boʻsh');
      const url=URL.createObjectURL(blob);
      const name=file.name.replace(/\.docx$/i,'');
      const link=document.createElement('a');
      link.href=url;
      link.download=(direction==='cyr2lat'?'lotin_':'kirill_')+name+'.docx';
      document.body.appendChild(link);link.click();link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),60000);
      notify('success','DOCX tayyor!','Hujjat muvaffaqiyatli tayyorlandi va yuklandi.');
      await reloadWallet().catch(()=>{});
      window.setTimeout(() => { void reloadWallet().catch(()=>{}); }, 1200);
    }catch(e){
      const message=e instanceof Error?e.message:'Serverga ulanib boʻlmadi';
      setError(message);
      notify('error','DOCX Transliteration PRO',message);
    }finally{setWorking(false);}
  };

  return (
    <section className="tahrir-docxpro mt-6 text-left" aria-label="DOCX Transliteration PRO">
      <div className="tahrir-docxpro-heading">
        <span className="tahrir-docxpro-mark"><FileText size={24} strokeWidth={1.65}/></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-serif font-bold">DOCX Transliteration PRO</h3>
            <span className="tahrir-docxpro-badge"><Sparkles size={12}/> Premium</span>
          </div>
          <p className="text-sm mt-1">Kirill ↔ Lotin: Word hujjatining shriftlari, jadvallari va tuzilishini saqlagan holda</p>
        </div>
      </div>

      <div className="tahrir-docxpro-body">
        <div>
          <p className="tahrir-docxpro-label">Oʻgirish yoʻnalishi</p>
          <div className="tahrir-docxpro-direction" role="group" aria-label="Oʻgirish yoʻnalishi">
            {([{id:'cyr2lat',label:'Kirill → Lotin'},{id:'lat2cyr',label:'Lotin → Kirill'}] as const).map(item=>(
              <motion.button key={item.id} type="button" disabled={working}
                whileHover={reduceMotion?undefined:{y:-1}}
                whileTap={reduceMotion?undefined:{scale:.985}}
                onClick={()=>changeDirection(item.id)}
                aria-pressed={direction===item.id}
                className={'tahrir-docxpro-direction-option '+(direction===item.id?'is-selected':'')}>
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <p className="tahrir-docxpro-label">DOCX faylni yuklang</p>
          <div
            role="button" tabIndex={0}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.current?.click();}}}
            onClick={()=>{if(!working)input.current?.click();}}
            onDragOver={e=>{e.preventDefault();if(!working)setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);selectFile(e.dataTransfer.files?.[0]||null);}}
            className={'tahrir-docxpro-dropzone '+(dragging?'dragging':'')}>
            <input ref={input} type="file" accept=".docx" className="hidden"
              onChange={e=>{const selected=e.currentTarget.files?.[0];e.currentTarget.value='';if(selected)selectFile(selected);}}/>
            <span className="tahrir-docxpro-upload-icon">{file?<CheckCircle2 size={24}/>:<FileUp size={24}/>}</span>
            {file?(
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{file.name}</p>
                <p className="text-xs">{showSize(file.size)} · DOCX</p>
              </div>
            ):(
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">Hujjatni tashlang yoki faylni tanlang</p>
                <p className="text-xs mt-1">.DOCX · 25 MB gacha · format saqlanadi</p>
              </div>
            )}
            {file&&<button type="button" disabled={working}
              onClick={e=>{e.stopPropagation();selectFile(null);}}
              className="tahrir-docxpro-remove" aria-label="Faylni olib tashlash"><Trash2 size={17}/></button>}
          </div>
        </div>

        {file && !error && (
          <div className="tahrir-docxpro-compact-price" role="status" aria-live="polite">
            {loadingQuote ? (
              <><Loader2 size={16} className="animate-spin" /><span>Narx hisoblanmoqda...</span></>
            ) : quote ? (
              <><Coins size={18}/><span>Narxi: <strong>{quote.requiredCoins} tanga</strong></span></>
            ) : null}
          </div>
        )}
        {error&&<p role="alert" className="tahrir-docxpro-error">{error}</p>}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <motion.button type="button" onClick={()=>void convert()}
            disabled={!file||!quote||loadingQuote||working}
            whileHover={reduceMotion?undefined:{y:-2}}
            whileTap={reduceMotion?undefined:{scale:.985}}
            className="tahrir-docxpro-submit">
            {working?<><Loader2 size={17} className="animate-spin"/>Hujjat oʻgirilmoqda...</>:<>
              <Sparkles size={17}/> {loggedIn?'DOCX o‘girish':'Kirish va davom etish'} <ArrowRight size={17}/>
            </>}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
