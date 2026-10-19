'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type UserRow = {
  id: number;
  identifier: string;
  name: string;
  coins: number;
  total_spent: number;
  total_purchased: number;
  created_at: string;
  suspicious: boolean;
  suspiciousReason: string | null;
};
type SignalRow = {
  id: number;
  card_type: string;
  card_last4: string;
  amount_tiyin: number;
  operation_time: string | null;
  channel: string;
  status: string;
  received_at: string;
};
type OrderRow = {
  id: number;
  order_id: string;
  user_id: number;
  package_id: string;
  amount: number;
  coins: number;
  status: string;
  created_at: string;
};
type Overview = {
  users: UserRow[];
  smsSignals: SignalRow[];
  orders: OrderRow[];
  note: string;
};
const API_URL=process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function fmt(value:number):string {
  return new Intl.NumberFormat('ru-RU').format(Number(value)||0);
}
function statusClasses(status:string):string {
  if(status==='PAID'||status==='AUTO_CREDITED') return 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20';
  if(status==='AUTO_CREDITED_REVIEW')return 'bg-orange-500/15 text-orange-300 ring-orange-400/20';
  if(status.startsWith('REVIEW'))return 'bg-amber-500/15 text-amber-300 ring-amber-400/20';
  return 'bg-slate-500/20 text-slate-300 ring-white/10';
}
export default function AdminPage() {
  const [data,setData]=useState<Overview|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [search,setSearch]=useState('');
  const [onlySuspicious,setOnlySuspicious]=useState(false);

  const reload=useCallback(async()=>{
    setLoading(true);
    setError('');
    try {
      const token=localStorage.getItem('tahrir_token');
      if(!token)throw new Error('Сначала войдите в аккаунт на главной странице.');
      const res=await fetch(API_URL+'/api/admin/overview',{
        headers:{Authorization:'Bearer '+token},
        cache:'no-store'
      });
      if(res.status===403)throw new Error('Доступ разрешён только администратору (ADMIN_USER_ID).');
      if(!res.ok)throw new Error('Не удалось получить данные с сервера.');
      const body=await res.json() as Overview;
      setData(body);
    }catch(e){
      setError(e instanceof Error?e.message:'Ошибка запроса');
      setData(null);
    }finally{setLoading(false);}
  },[]);
  useEffect(()=>{void reload();},[reload]);

  const filtered=useMemo(()=>{
    const needle=search.trim().toLowerCase();
    return (data?.users||[])
      .filter(u=>!onlySuspicious||u.suspicious)
      .filter(u=>!needle||[u.identifier,u.name,String(u.id)].some(v=>v.toLowerCase().includes(needle)))
      .sort((a,b)=>Number(b.suspicious)-Number(a.suspicious) || b.id-a.id);
  },[data,search,onlySuspicious]);
  const metrics=useMemo(()=>({
    total:data?.users.length||0,
    coins:(data?.users||[]).reduce((s,u)=>s+Number(u.coins),0),
    flagged:(data?.users||[]).filter(u=>u.suspicious).length,
    pending:(data?.smsSignals||[]).filter(s=>s.status.startsWith('REVIEW')).length,
  }),[data]);

  return (
    <main className="min-h-screen bg-[#090e1a] text-slate-100 px-4 py-10 sm:px-7 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-xs tracking-[0.3em] uppercase text-sky-400">Tahrir AI / Security</div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Панель администратора</h1>
            <p className="max-w-2xl text-sm text-slate-400">Баланс пользователей берётся из Neon. SMS-сигналы — уведомления, а не подтверждение банка.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10">← На сайт</Link>
            <button onClick={()=>void reload()} disabled={loading} className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50">{loading?'Загрузка…':'Обновить'}</button>
          </div>
        </header>

        {error && <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{error}</div>}
        {!data && loading && <div className="rounded-2xl border border-white/10 p-7 text-slate-400">Получаем защищённую статистику…</div>}
        {data && <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['Пользователи',metrics.total],
              ['Монеты в системе',metrics.coins],
              ['На проверке',metrics.flagged],
              ['SMS с рисками',metrics.pending]
            ].map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{fmt(value as number)}</p>
            </div>)}
          </div>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-semibold">Пользователи</h2><p className="text-xs text-slate-400">Просмотр без возможности вручную менять баланс</p></div>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={onlySuspicious} onChange={e=>setOnlySuspicious(e.target.checked)} className="accent-sky-400"/> Только подозрительные</label>
                <input aria-label="Поиск пользователей" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Имя, email или ID" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-sky-500"/>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400">
                  <tr><th className="px-5 py-4">Пользователь</th><th className="px-5 py-4">ID</th><th className="px-5 py-4">Баланс</th><th className="px-5 py-4">Потрачено</th><th className="px-5 py-4">Статус</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">{filtered.map(u=>
                  <tr key={u.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4"><div className="font-medium">{u.name||'Без имени'}</div><div className="text-xs text-slate-400">{u.identifier}</div></td>
                    <td className="px-5 py-4 text-slate-400">{u.id}</td>
                    <td className="px-5 py-4 tabular-nums font-semibold">{fmt(u.coins)}</td>
                    <td className="px-5 py-4 tabular-nums text-slate-300">{fmt(u.total_spent)}</td>
                    <td className="px-5 py-4"><span className={'inline-flex rounded-full px-3 py-1 text-xs ring-1 '+(u.suspicious?'bg-amber-500/15 text-amber-300 ring-amber-400/20':'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20')}>{u.suspicious?'Нужна проверка':'Обычный'}</span></td>
                  </tr>)}</tbody>
              </table>
              {!filtered.length && <p className="p-5 text-sm text-slate-400">Совпадений нет.</p>}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="p-5 border-b border-white/10"><h2 className="text-xl font-semibold">SMS-уведомления</h2><p className="text-xs text-slate-400">Показываются только метаданные, без полного текста банковских сообщений</p></div>
            <div className="overflow-x-auto">
              <table className="min-w-[780px] w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400 bg-white/[0.03]"><tr><th className="px-5 py-4">Карта</th><th className="px-5 py-4">Сумма</th><th className="px-5 py-4">Канал</th><th className="px-5 py-4">Время</th><th className="px-5 py-4">Статус</th></tr></thead>
                <tbody className="divide-y divide-white/[0.07]">{data.smsSignals.map(s=>
                  <tr key={s.id}><td className="px-5 py-4">{s.card_type} •••• {s.card_last4}</td><td className="px-5 py-4">{fmt(s.amount_tiyin/100)} UZS</td><td className="px-5 py-4 text-slate-400">{s.channel}</td><td className="px-5 py-4 text-slate-400">{s.operation_time||s.received_at}</td><td className="px-5 py-4"><span className={'inline-flex rounded-full px-3 py-1 text-xs ring-1 '+statusClasses(s.status)}>{s.status}</span></td></tr>)}</tbody>
              </table>
              {!data.smsSignals.length && <p className="p-5 text-sm text-slate-400">SMS пока нет.</p>}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="p-5 border-b border-white/10"><h2 className="text-xl font-semibold">Последние заказы</h2></div>
            <div className="overflow-x-auto">
              <table className="min-w-[660px] w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase text-slate-400"><tr><th className="px-5 py-4">Заказ</th><th className="px-5 py-4">Пользователь</th><th className="px-5 py-4">Сумма</th><th className="px-5 py-4">Монеты</th><th className="px-5 py-4">Статус</th></tr></thead>
                <tbody className="divide-y divide-white/[0.07]">{data.orders.map(o=>
                  <tr key={o.id}><td className="px-5 py-4 font-mono text-xs">{o.order_id}</td><td className="px-5 py-4">#{o.user_id}</td><td className="px-5 py-4 tabular-nums">{fmt(o.amount)} UZS</td><td className="px-5 py-4">{fmt(o.coins)}</td><td className="px-5 py-4"><span className={'inline-flex rounded-full px-3 py-1 text-xs ring-1 '+statusClasses(o.status)}>{o.status}</span></td></tr>)}</tbody>
              </table>
              {!data.orders.length && <p className="p-5 text-sm text-slate-400">Заказов пока нет.</p>}
            </div>
          </section>
          <p className="text-xs text-amber-200/90">Примечание: превышение 1000 монет — повод проверить историю, а не доказательство мошенничества. Подлинность банковского платежа по одному SMS не подтверждается.</p>
        </>}
      </div>
    </main>
  );
}
