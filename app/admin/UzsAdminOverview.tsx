'use client';
import {useCallback,useEffect,useState} from 'react';
import {ArrowLeft,RefreshCw,Wallet,Receipt,Clock,Users} from 'lucide-react';
import Link from 'next/link';
type User={id:number;identifier:string;name:string;balance_uzs:number|null};
type Entry={id:number;user_id:number;kind:string;amount_uzs:number;description:string;created_at:string;name:string};
type Order={order_id:string;user_id:number;exact_amount_uzs:number;status:string;created_at:string;expires_at:string};
type Data={currency:'UZS';users:User[];ledger:Entry[];orders:Order[];totals:{users:number;balanceUzs:number}};
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000';
const fmt=(n:number|null|undefined)=>n==null?'—':new Intl.NumberFormat('uz-UZ').format(n);
export default function UzsAdminOverview(){
 const [data,setData]=useState<Data|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{
  setLoading(true);
  try{
   const token=localStorage.getItem('tahrir_token');
   if(!token)throw new Error('Administrator hisobiga kiring.');
   const r=await fetch(API+'/api/admin/uzs-overview',{cache:'no-store',headers:{Authorization:'Bearer '+token}});
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.error||'Hisob maʼlumotlari mavjud emas');
   setData(d);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Server xatosi');}finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load();},[load]);
 return <main className="min-h-screen bg-[#24170F] px-4 py-8 text-[#FAEBD6] sm:px-8">
  <div className="mx-auto max-w-6xl space-y-6">
   <div className="flex flex-wrap items-center justify-between gap-4">
    <div><Link href="/" className="inline-flex items-center gap-2 text-sm text-[#E5BE87] hover:text-white"><ArrowLeft size={15}/> Bosh sahifa</Link>
     <h1 className="mt-3 text-3xl font-serif font-bold">UZS · Admin paneli</h1>
     <p className="mt-1 text-sm text-[#D5B793]">Hisoblar va operatsiyalar · faqat koʻrish rejimi</p></div>
    <button onClick={()=>void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#D8AC73]/40 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"><RefreshCw size={15} className={loading?'animate-spin':''}/> Yangilash</button>
   </div>
   {error&&<div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/50 p-4 text-sm">{error}</div>}
   <div className="grid gap-4 sm:grid-cols-2">
    <div className="rounded-2xl border border-[#E8C58B]/20 bg-[#49301E] p-5"><div className="flex items-center gap-2 text-sm text-[#D8BD94]"><Users size={17}/> Foydalanuvchilar</div><p className="mt-3 text-3xl font-bold">{data?fmt(data.totals.users):'—'}</p></div>
    <div className="rounded-2xl border border-[#E8C58B]/20 bg-[#49301E] p-5"><div className="flex items-center gap-2 text-sm text-[#D8BD94]"><Wallet size={17}/> Umumiy balans</div><p className="mt-3 text-3xl font-bold">{data?fmt(data.totals.balanceUzs):'—'} <span className="text-sm font-normal">soʻm</span></p></div>
   </div>
   <section className="overflow-hidden rounded-2xl border border-[#E8C58B]/20 bg-[#3D291D]">
    <h2 className="flex items-center gap-2 border-b border-[#E8C58B]/20 p-5 font-bold"><Users size={18}/> Hisoblar</h2>
    <div className="max-h-96 overflow-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="text-[#D6B98F]"><tr><th className="p-4">ID</th><th className="p-4">Foydalanuvchi</th><th className="p-4 text-right">Balans (UZS)</th></tr></thead>
     <tbody>{data?.users.map(u=><tr key={u.id} className="border-t border-[#E8C58B]/10"><td className="p-4">#{u.id}</td><td className="p-4"><strong className="block">{u.name}</strong><span className="text-xs text-[#C8AC8F]">{u.identifier}</span></td><td className="p-4 text-right font-bold tabular-nums">{fmt(u.balance_uzs)}</td></tr>)}</tbody>
    </table></div>
   </section>
   <section className="overflow-hidden rounded-2xl border border-[#E8C58B]/20 bg-[#3D291D]">
    <h2 className="flex items-center gap-2 border-b border-[#E8C58B]/20 p-5 font-bold"><Receipt size={18}/> Pul operatsiyalari</h2>
    <div className="max-h-96 overflow-auto"><table className="w-full min-w-[540px] text-left text-xs sm:text-sm"><thead className="text-[#D6B98F]"><tr><th className="p-4">ID</th><th className="p-4">Tur</th><th className="p-4">Tavsif</th><th className="p-4 text-right">Summa</th></tr></thead>
     <tbody>{data?.ledger.map(l=><tr key={l.id} className="border-t border-[#E8C58B]/10"><td className="p-4">#{l.user_id}</td><td className="p-4">{l.kind}</td><td className="p-4">{l.description}</td><td className={'p-4 text-right font-bold tabular-nums '+(l.amount_uzs>=0?'text-emerald-300':'text-rose-300')}>{l.amount_uzs>0?'+':''}{fmt(l.amount_uzs)} soʻm</td></tr>)}</tbody>
    </table></div>
   </section>
   <section className="overflow-hidden rounded-2xl border border-[#E8C58B]/20 bg-[#3D291D]">
    <h2 className="flex items-center gap-2 border-b border-[#E8C58B]/20 p-5 font-bold"><Clock size={18}/> Toʻlov buyurtmalari</h2>
    <div className="max-h-96 overflow-auto"><table className="w-full min-w-[500px] text-left text-xs sm:text-sm"><thead className="text-[#D6B98F]"><tr><th className="p-4">Buyurtma</th><th className="p-4">Foydalanuvchi</th><th className="p-4">Summa</th><th className="p-4">Holat</th></tr></thead>
     <tbody>{data?.orders.map(o=><tr key={o.order_id} className="border-t border-[#E8C58B]/10"><td className="p-4 font-mono">{o.order_id.slice(0,18)}…</td><td className="p-4">#{o.user_id}</td><td className="p-4">{fmt(o.exact_amount_uzs)} soʻm</td><td className="p-4">{o.status}</td></tr>)}</tbody>
    </table></div>
   </section>
  </div>
 </main>;
}