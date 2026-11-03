'use client';
import {useEffect,useRef,useState} from 'react';

const clientId=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID||'';
type GIS={
 accounts:{id:{
   initialize:(config:{client_id:string;callback:(response:{credential?:string})=>void;auto_select?:boolean})=>void;
   renderButton:(parent:HTMLElement,options:{theme:string;size:string;text:string;shape:string;width:number;logo_alignment:string})=>void;
 }};
};
export default function GoogleSignIn({onCredential,disabled=false}:{
 onCredential:(credential:string)=>void;
 disabled?:boolean;
}){
 const container=useRef<HTMLDivElement>(null);
 const latest=useRef(onCredential);
 const [error,setError]=useState(false);
 useEffect(()=>{latest.current=onCredential;},[onCredential]);
 useEffect(()=>{
   if(!clientId)return;
   let cancelled=false;
   const render=()=>{
     const g=(window as Window & {google?:GIS}).google;
     if(!g||!container.current||cancelled)return;
     try{
       container.current.replaceChildren();
       g.accounts.id.initialize({
         client_id:clientId,
         auto_select:false,
         callback:response=>{if(response.credential&&!cancelled)latest.current(response.credential);}
       });
       const width=Math.max(220,Math.min(container.current.clientWidth||340,380));
       g.accounts.id.renderButton(container.current,{theme:'outline',size:'large',text:'continue_with',shape:'pill',width,logo_alignment:'left'});
     }catch{if(!cancelled)setError(true);}
   };
   const existing=document.querySelector<HTMLScriptElement>('script[data-google-identity]');
   if(existing){
     if((window as Window & {google?:GIS}).google)render();
     else existing.addEventListener('load',render,{once:true});
   }else{
     const script=document.createElement('script');
     script.src='https://accounts.google.com/gsi/client';
     script.async=true;script.defer=true;script.dataset.googleIdentity='true';
     script.onload=render;script.onerror=()=>{if(!cancelled)setError(true);};
     document.head.appendChild(script);
   }
   return()=>{cancelled=true;existing?.removeEventListener('load',render);};
 },[]);
 if(!clientId)return null;
 return <div className={disabled?'opacity-60 pointer-events-none':'w-full'}>
   <div ref={container} className="flex min-h-[42px] justify-center rounded-xl overflow-hidden"/>
   {error&&<p className="mt-2 text-center text-xs text-rose-700">Google orqali kirish vaqtincha mavjud emas.</p>}
 </div>;
}
