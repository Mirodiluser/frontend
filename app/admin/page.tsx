'use client';

import {useCallback,useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {Activity,AlertTriangle,ArrowDownRight,ArrowLeft,ArrowUpRight,CheckCircle2,ChevronLeft,ChevronRight,Coins,Download,Eye,FileText,Filter,History,LockKeyhole,Minus,Plus,Receipt,RefreshCw,Search,ShieldCheck,ShoppingBag,TrendingUp,Undo2,Users,X} from 'lucide-react';

type UserRow={id:number;identifier:string;name:string;coins:number;total_spent:number;total_purchased:number;created_at:string;suspicious?:boolean};
type Metric={users:number;coins:number;spent:number;month:{operations:number;spent:number;purchased:number};services:{feature:string;label:string;coins:number;operations:number}[]};
type TxRow={id:number;userId:number;type:string;amount:number;description:string;feature:string;featureLabel:string;createdAt:string;userName?:string;identifier?:string};
type PageUsers={users:UserRow[];total:number;limit:number;offset:number};
type PageTx={transactions:TxRow[];total:number;limit:number;offset:number};
type Detail={user:UserRow;transactions:TxRow[];total:number;limit:number;offset:number;services:Metric['services'];orders:OrderRow[]};
type Signal={id:number;card_type:string;card_last4:string;amount_tiyin:number;operation_time:string|null;channel:string;status:string;received_at:string};
type OrderRow={id?:number;order_id:string;user_id?:number;package_id:string;amount:number;coins:number;status:string;created_at:string};
type Overview={users:UserRow[];smsSignals:Signal[];orders:OrderRow[];note:string};
type Tab='users'|'transactions'|'payments';
type Action={mode:'credit'|'debit'|'refund';transaction?:TxRow};
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000';
const number=(v:number)=>new Intl.NumberFormat('ru-RU').format(Number(v)||0);
function when(v:string){
  if(!v)return '—';
  const date=new Date(v.includes('T')?v:v.replace(' ','T')+'Z');
  return Number.isNaN(date.getTime())?v:new Intl.DateTimeFormat('ru-RU',{
    timeZone:'Asia/Tashkent',day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'
  }).format(date);
}
const inputClass='w-full rounded-xl border border-[#B88653]/35 bg-[#FFF0D9] px-3.5 py-3 text-sm font-medium text-[#3C2515] outline-none placeholder:text-[#907153] focus:border-[#AC7340] focus:ring-2 focus:ring-[#DBAF77]/35';
const smallButton='inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8B982]/30 bg-white/[0.06] px-3.5 py-2.5 text-sm font-semibold text-[#F2DAC0] transition duration-300 hover:border-[#F0C996]/65 hover:bg-[#D8A370]/15 disabled:opacity-40';
const panel='rounded-[22px] border border-[#F7D3A4]/20 bg-[linear-gradient(145deg,rgba(104,64,40,.68),rgba(70,40,27,.74))] shadow-[inset_0_1px_0_rgba(255,243,218,.17),0_22px_48px_rgba(38,19,11,.18)] backdrop-blur-xl';
const fieldLabel='text-xs font-bold uppercase tracking-[0.12em] text-[#826046]';
const kinds:{value:string;label:string}[]=[
  {value:'all',label:'Все операции'},{value:'spend',label:'Расходы'},{value:'purchase',label:'Покупки'},
  {value:'admin_credit',label:'Начисления админа'},{value:'admin_debit',label:'Ручные списания'},
  {value:'admin_refund',label:'Возвраты'},{value:'bonus',label:'Бонусы'}
];
async function adminFetch(path:string,init:RequestInit={}):Promise<any>{
  const token=localStorage.getItem('tahrir_token');
  if(!token)throw Error('Войдите в аккаунт администратора на главной странице.');
  const res=await fetch(API+path,{...init,cache:'no-store',
    headers:{...({'Authorization':'Bearer '+token} as Record<string,string>),...(init.headers||{})}});
  const body=await res.json().catch(()=>({}));
  if(res.status===403)throw Error('Нет доступа. Нужна учётная запись, указанная в ADMIN_USER_ID.');
  if(res.status===401)throw Error('Сессия истекла. Войдите в аккаунт повторно.');
  if(!res.ok)throw Error(body.error||'Не удалось получить ответ сервера');
  return body;
}
function typeText(tx:TxRow){
  if(tx.type==='spend')return 'Расход';
  if(tx.type==='admin_credit')return 'Админ: +';
  if(tx.type==='admin_debit')return 'Админ: −';
  if(tx.type==='admin_refund')return 'Возврат';
  if(tx.type==='bonus')return 'Бонус';
  if(tx.type==='purchase')return 'Покупка';
  return tx.type;
}
function isDebit(type:string){return type==='spend'||type==='admin_debit';}
function Pill({children,warning=false}:{children:React.ReactNode;warning?:boolean}){
  return <span className={'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold '+(warning?
    'border-amber-400/30 bg-amber-400/10 text-amber-100':'border-emerald-300/25 bg-emerald-300/10 text-emerald-100')}>{children}</span>;
}
function Pager({offset,total,onChange,size=25}:{offset:number;total:number;onChange:(value:number)=>void;size?:number}){
  if(total<=size)return null;
  return <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E7B783]/15 px-5 py-3">
    <span className="text-xs text-[#E5C49F]">{number(offset+1)}–{number(Math.min(offset+size,total))} из {number(total)}</span>
    <button aria-label="Назад" onClick={()=>onChange(Math.max(0,offset-size))} disabled={offset===0} className={smallButton}><ChevronLeft size={16}/></button>
    <button aria-label="Вперёд" onClick={()=>onChange(offset+size)} disabled={offset+size>=total} className={smallButton}><ChevronRight size={16}/></button>
  </div>;
}

export default function AdminPage(){
  const [tab,setTab]=useState<Tab>('users');
  const [revision,setRevision]=useState(0);
  const [metrics,setMetrics]=useState<Metric|null>(null);
  const [overview,setOverview]=useState<Overview|null>(null);
  const [users,setUsers]=useState<PageUsers|null>(null);
  const [transactions,setTransactions]=useState<PageTx|null>(null);
  const [selectedId,setSelectedId]=useState<number|null>(null);
  const [detail,setDetail]=useState<Detail|null>(null);
  const [usersSearch,setUsersSearch]=useState('');
  const [txSearch,setTxSearch]=useState('');
  const [flagged,setFlagged]=useState(false);
  const [txType,setTxType]=useState('all');
  const [detailType,setDetailType]=useState('all');
  const [userOffset,setUserOffset]=useState(0);
  const [txOffset,setTxOffset]=useState(0);
  const [detailOffset,setDetailOffset]=useState(0);
  const [loading,setLoading]=useState(true);
  const [loadingUsers,setLoadingUsers]=useState(false);
  const [loadingTx,setLoadingTx]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [action,setAction]=useState<Action|null>(null);
  const [amount,setAmount]=useState('');
  const [reason,setReason]=useState('');
  const [ack,setAck]=useState(false);
  const [requestId,setRequestId]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const reload=useCallback(()=>{setRevision(v=>v+1);},[]);
  useEffect(()=>{
    let cancelled=false;
    setLoading(true);
    Promise.all([
      adminFetch('/api/admin/overview'),
      adminFetch('/api/admin/metrics')
    ]).then(([o,m])=>{if(!cancelled){setOverview(o);setMetrics(m);setError('');}})
      .catch(e=>{if(!cancelled)setError(e.message);})
      .finally(()=>{if(!cancelled)setLoading(false);});
    return ()=>{cancelled=true;};
  },[revision]);
  useEffect(()=>{
    let gone=false;
    const timer=window.setTimeout(()=>{
      setLoadingUsers(true);
      const qs=new URLSearchParams({search:usersSearch,flagged:String(flagged),limit:'25',offset:String(userOffset)});
      adminFetch('/api/admin/users?'+qs.toString()).then(p=>{if(!gone)setUsers(p);})
        .catch(e=>{if(!gone)setError(e.message);})
        .finally(()=>{if(!gone)setLoadingUsers(false);});
    },220);
    return ()=>{gone=true;window.clearTimeout(timer);};
  },[usersSearch,flagged,userOffset,revision]);
  useEffect(()=>{
    let gone=false;
    const timer=window.setTimeout(()=>{
      setLoadingTx(true);
      const qs=new URLSearchParams({search:txSearch,type:txType,limit:'30',offset:String(txOffset)});
      adminFetch('/api/admin/transactions?'+qs.toString()).then(p=>{if(!gone)setTransactions(p);})
        .catch(e=>{if(!gone)setError(e.message);})
        .finally(()=>{if(!gone)setLoadingTx(false);});
    },220);
    return ()=>{gone=true;window.clearTimeout(timer);};
  },[txSearch,txType,txOffset,revision]);
  useEffect(()=>{
    if(selectedId===null){setDetail(null);return;}
    let gone=false;
    const qs=new URLSearchParams({type:detailType,limit:'25',offset:String(detailOffset)});
    adminFetch('/api/admin/users/'+selectedId+'?'+qs.toString())
      .then(r=>{if(!gone)setDetail(r);})
      .catch(e=>{if(!gone)setError(e.message);});
    return ()=>{gone=true;};
  },[selectedId,detailOffset,detailType,revision]);
  const totalServices=useMemo(()=>metrics?.services.filter(x=>x.coins>0)||[],[metrics]);
  function viewUser(id:number){
    setSelectedId(id);setDetail(null);setDetailOffset(0);setDetailType('all');setNotice('');
  }
  function openAction(mode:Action['mode'],transaction?:TxRow){
    setAction({mode,transaction});setAmount('');setReason('');setAck(false);
    // Keep the same UUID if a write times out and the administrator retries
    // the unchanged request; generate a new one only when opening a new form.
    setRequestId(crypto.randomUUID());setNotice('');
  }
  async function submitAction(){
    if(!detail||!action||!ack||submitting||reason.trim().length<8)return;
    if(action.mode!=='refund'&&(!Number.isSafeInteger(Number(amount))||Number(amount)<1||Number(amount)>5000))return;
    setSubmitting(true);setError('');setNotice('');
    try{
      const refund=action.mode==='refund';
      const body=refund
        ?{transactionId:action.transaction?.id,reason:reason.trim()}
        :{mode:action.mode,amount:Number(amount),reason:reason.trim(),requestId};
      const endpoint='/api/admin/users/'+detail.user.id+(refund?'/refund':'/adjust');
      const response=await adminFetch(endpoint,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
      });
      const label=refund?'Возврат':action.mode==='credit'?'Начисление':'Списание';
      setNotice(label+' выполнено. Баланс: '+number(response.balance)+' монет'+(response.duplicate?' (повтор запроса)':'')+'.');
      setAction(null);setReason('');setAck(false);
      reload();
    }catch(e){setError(e instanceof Error?e.message:'Операция не выполнена');}
    finally{setSubmitting(false);}
  }
  function exportVisible(){
    const current=tab==='transactions'?(transactions?.transactions||[]):detail?.transactions||[];
    if(!current.length)return;
    const esc=(s:any)=>'"'+String(s??'').replace(/"/g,'""').replace(/^[=+\-@]/,'\u0027$&')+'"';
    const fields=['ID','Пользователь','Тип','Функция','Монеты','Дата','Описание'];
    const csv=[fields,...current.map(x=>[x.id,x.identifier||x.userId,x.type,x.featureLabel,x.amount,x.createdAt,x.description])]
      .map(row=>row.map(esc).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    const el=document.createElement('a');el.href=url;el.download='tahrir-admin-transactions.csv';
    document.body.appendChild(el);el.click();el.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),15000);
  }
  return <main className="min-h-screen bg-[radial-gradient(ellipse_at_12%_0%,#906040_0%,#542f21_35%,#24170f_100%)] text-[#FFF0DC] selection:bg-[#DAA66A]/40">
    <div className="pointer-events-none fixed inset-0 opacity-[0.13] bg-[radial-gradient(circle_at_90%_12%,#F6BA74,transparent_30%)]"/>
    <div className="relative mx-auto max-w-[1480px] px-4 pb-24 pt-6 sm:px-7 lg:px-10">
      <header className={panel+' flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'}>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[19px] border border-[#FFE0B1]/60 bg-[linear-gradient(145deg,#DCB282,#94552E_65%,#64341C)] text-[#FFF5DE] shadow-[inset_0_2px_0_rgba(255,250,215,.5),0_10px_23px_rgba(36,14,8,.28)]"><ShieldCheck size={29}/></span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.23em] text-[#EAC39A]">TAHRIR.AI · CONTROL CENTER</p>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#FFF2DF] sm:text-3xl">Панель администратора</h1>
            <p className="mt-1 text-xs text-[#E3C09C]">Пользователи · монеты · операции · контроль платежей</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100"><LockKeyhole size={14}/> Доступ по ADMIN_USER_ID</span>
          <Link href="/" className={smallButton}><ArrowLeft size={15}/> На сайт</Link>
          <button onClick={reload} disabled={loading} className={smallButton}><RefreshCw size={15} className={loading?'animate-spin':''}/> Обновить</button>
        </div>
      </header>

      {error&&<div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-300/35 bg-rose-950/65 p-4 text-sm text-rose-100">
        <AlertTriangle size={18} className="shrink-0"/><span className="flex-1">{error}</span><button onClick={()=>setError('')} aria-label="Закрыть"><X size={16}/></button>
      </div>}
      {notice&&<div role="status" className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-950/45 p-4 text-sm text-emerald-100">
        <CheckCircle2 size={18}/><span className="flex-1">{notice}</span><button onClick={()=>setNotice('')} aria-label="Закрыть"><X size={16}/></button>
      </div>}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {label:'Пользователей',value:metrics?.users,icon:Users,hint:'Активные аккаунты'},
          {label:'Монет на балансах',value:metrics?.coins,icon:Coins,hint:'Суммарный остаток'},
          {label:'Потрачено за 30 дней',value:metrics?.month.spent,icon:TrendingUp,hint:'Монеты за услуги'},
          {label:'Операций за 30 дней',value:metrics?.month.operations,icon:Activity,hint:'Все движения'}
        ].map(item=><div key={item.label} className={panel+' relative overflow-hidden p-4 sm:p-5'}>
          <div className="absolute -right-7 -top-6 h-24 w-24 rounded-full bg-[#E9BA7C]/[.08] blur-xl"/>
          <div className="relative flex items-center justify-between"><span className="text-xs font-semibold text-[#EAC9A7]">{item.label}</span><item.icon size={18} className="text-[#E9B77E]"/></div>
          <p className="relative mt-4 text-2xl font-bold tabular-nums tracking-tight text-[#FFF4E3] sm:text-3xl">{item.value===undefined?'—':number(item.value)}</p>
          <p className="mt-1 text-xs text-[#D7B08B]">{item.hint}</p>
        </div>)}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#F5D2A5]/20 bg-[#2A190F]/35 p-2">
        {([
          {key:'users',text:'Пользователи',icon:Users},
          {key:'transactions',text:'Все транзакции',icon:History},
          {key:'payments',text:'Платежи и мониторинг',icon:ShoppingBag}
        ] as const).map(item=><button key={item.key} type="button" onClick={()=>setTab(item.key)}
          className={'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 '+(tab===item.key?
          'border border-[#FFDFB2]/55 bg-[linear-gradient(155deg,#D6A36C,#A66B3D_62%,#7D4427)] text-[#29160B] shadow-[inset_0_1px_0_#FFE8BF,0_6px_15px_rgba(20,10,3,.22)]':
          'border border-transparent text-[#E7C6A3] hover:border-[#F9D19D]/25 hover:bg-white/[.06]')}>
          <item.icon size={17}/>{item.text}
        </button>)}
      </div>

      {tab==='users'&&<div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={panel+' overflow-hidden'}>
          <div className="flex flex-col gap-4 border-b border-[#D6A273]/20 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-bold">Управление пользователями</h2><p className="mt-1 text-xs text-[#DCB992]">Выберите аккаунт для истории и управления монетами</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-w-[200px] items-center gap-2 rounded-xl border border-[#F6D1A4]/25 bg-[#26170F]/40 px-3 py-2.5 text-[#EDC8A0]">
                <Search size={16}/><input aria-label="Поиск пользователя" value={usersSearch}
                  onChange={e=>{setUsersSearch(e.target.value);setUserOffset(0);}}
                  placeholder="Email, имя, ID" className="min-w-0 flex-1 bg-transparent text-sm text-[#FFF3DE] outline-none placeholder:text-[#C69C78]"/>
              </label>
              <button onClick={()=>{setFlagged(x=>!x);setUserOffset(0);}} aria-pressed={flagged}
                className={smallButton+(flagged?' !border-amber-300/60 !text-amber-100':'')}><Filter size={15}/> Риски</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[670px] text-left text-sm">
              <thead className="border-b border-[#EFC291]/15 bg-[#2C1A12]/25 text-[11px] uppercase tracking-wider text-[#E9C29E]">
                <tr><th className="px-5 py-4">Пользователь</th><th className="px-5 py-4">ID</th><th className="px-5 py-4">Баланс</th><th className="px-5 py-4">Потрачено</th><th className="px-5 py-4">Статус</th><th className="px-5 py-4">Детали</th></tr>
              </thead>
              <tbody className="divide-y divide-[#EFC291]/[.11]">
                {(users?.users||[]).map(u=><tr key={u.id} className="transition-colors hover:bg-white/[.06]">
                  <td className="px-5 py-4"><span className="block font-bold text-[#FFF3DE]">{u.name||'Без имени'}</span><span className="text-xs text-[#E5BF99]">{u.identifier}</span></td>
                  <td className="px-5 py-4 text-[#DEC09F]">#{u.id}</td>
                  <td className="px-5 py-4 font-bold tabular-nums text-[#F9D8A5]">{number(u.coins)}</td>
                  <td className="px-5 py-4 tabular-nums">{number(u.total_spent)}</td>
                  <td className="px-5 py-4"><Pill warning={u.suspicious}>{u.suspicious?'Проверить':'Обычный'}</Pill></td>
                  <td className="px-5 py-4"><button onClick={()=>viewUser(u.id)} className={smallButton+' !px-3 !py-2'}><Eye size={15}/> Открыть</button></td>
                </tr>)}
              </tbody>
            </table>
            {loadingUsers&&<p className="p-5 text-sm text-[#EAC8A4]">Загружаем пользователей…</p>}
            {!loadingUsers&&!users?.users.length&&<p className="p-5 text-sm text-[#EAC8A4]">Совпадений нет.</p>}
          </div>
          <Pager offset={userOffset} total={users?.total||0} onChange={setUserOffset}/>
        </section>
        <aside className={panel+' h-fit p-5'}>
          <div className="flex items-center gap-2"><Activity size={19} className="text-[#F2C38C]"/><h3 className="font-bold">Популярные инструменты</h3></div>
          <p className="mb-5 mt-1 text-xs text-[#D8B38F]">Фактические траты по истории транзакций</p>
          {totalServices.length?totalServices.map((s,i)=>{const mx=totalServices[0]?.coins||1;
            return <div key={s.feature} className="mb-4">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs"><span className="font-semibold">{s.label}</span><span className="text-[#F8D6A9]">{number(s.coins)} монет</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#D8B281]/20">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#C28A4F,#F0C890)]" style={{width:Math.max(4,Math.round(100*s.coins/mx))+'%'}}/>
              </div>
              <p className="mt-1 text-[11px] text-[#DAB897]">{number(s.operations)} операций</p>
            </div>;
          }):<p className="text-xs text-[#D7B38E]">Расходов пока нет.</p>}
          <div className="mt-6 rounded-xl border border-[#F0C992]/25 bg-[#26170F]/35 p-4">
            <div className="flex gap-2"><ShieldCheck size={17} className="shrink-0 text-[#F4CD9B]"/><p className="text-xs leading-relaxed text-[#F3D8BA]">Все ручные начисления, списания и возвраты сохраняются в истории с причиной и ID администратора.</p></div>
          </div>
        </aside>
      </div>}

      {tab==='transactions'&&<section className={panel+' mt-5 overflow-hidden'}>
        <div className="flex flex-col gap-4 border-b border-[#D6A273]/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold">Единый журнал операций</h2><p className="mt-1 text-xs text-[#E0BD9A]">Каждая трата, покупка, бонус, начисление и возврат</p></div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-[#E8C39C]/25 bg-[#26170F]/45 px-3 py-2"><Search size={15}/>
              <input aria-label="Поиск транзакций" value={txSearch} onChange={e=>{setTxSearch(e.target.value);setTxOffset(0);}} placeholder="Email, имя, описание" className="min-w-[150px] bg-transparent text-sm text-[#FFF4E2] outline-none placeholder:text-[#BE9878]"/>
            </label>
            <select aria-label="Тип операции" value={txType} onChange={e=>{setTxType(e.target.value);setTxOffset(0);}} className="max-w-[205px] rounded-xl border border-[#E8C39C]/30 bg-[#563825] px-3 py-2 text-xs font-semibold text-[#FFF0DC] outline-none">
              {kinds.map(v=><option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <button onClick={exportVisible} className={smallButton}><Download size={15}/> CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-[#E6B686]/15 bg-[#2E1A10]/30 text-[11px] uppercase tracking-wider text-[#E9C29E]">
              <tr><th className="px-5 py-4">Пользователь</th><th className="px-5 py-4">Функция</th><th className="px-5 py-4">Тип</th><th className="px-5 py-4">Монеты</th><th className="px-5 py-4">Время</th><th className="px-5 py-4">Описание</th></tr>
            </thead>
            <tbody className="divide-y divide-[#EFC291]/[.11]">{(transactions?.transactions||[]).map(t=>
              <tr key={t.id} className="hover:bg-white/[.05]">
                <td className="px-5 py-4"><button onClick={()=>viewUser(t.userId)} className="text-left font-bold text-[#FFE7C4] hover:underline">{t.userName||t.identifier||'Пользователь'}<span className="block text-xs font-normal text-[#D4AE88]">#{t.userId}</span></button></td>
                <td className="px-5 py-4 font-semibold">{t.featureLabel}</td>
                <td className="px-5 py-4 text-xs text-[#E9C5A2]">{typeText(t)}</td>
                <td className={'px-5 py-4 font-bold tabular-nums '+(isDebit(t.type)?'text-[#F6BBA7]':'text-[#B5E7BE]')}>{isDebit(t.type)?'−':'+'}{number(t.amount)}</td>
                <td className="px-5 py-4 whitespace-nowrap text-xs text-[#E9C4A2]">{when(t.createdAt)}</td>
                <td className="max-w-[330px] truncate px-5 py-4 text-xs text-[#E8CAAC]" title={t.description}>{t.description}</td>
              </tr>)}</tbody>
          </table>
          {loadingTx&&<p className="p-5 text-sm text-[#E0BC98]">Загружаем историю…</p>}
          {!loadingTx&&!transactions?.transactions.length&&<p className="p-5 text-sm text-[#E0BC98]">Операций не найдено.</p>}
        </div>
        <Pager size={30} offset={txOffset} total={transactions?.total||0} onChange={setTxOffset}/>
      </section>}

      {tab==='payments'&&<div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className={panel+' overflow-hidden'}>
          <div className="border-b border-[#F2C18C]/20 p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><ShoppingBag size={19}/> Последние заказы</h2><p className="mt-1 text-xs text-[#DCB48D]">Не меняйте статус оплаты без подтверждения платёжного провайдера</p></div>
          <div className="max-h-[540px] overflow-x-auto">
            <table className="w-full min-w-[570px] text-left text-xs">
              <thead className="bg-[#301B12]/30 text-[#EBD0AF]"><tr><th className="px-4 py-3">Заказ</th><th className="px-4 py-3">Аккаунт</th><th className="px-4 py-3">Сумма</th><th className="px-4 py-3">Монеты</th><th className="px-4 py-3">Статус</th></tr></thead>
              <tbody className="divide-y divide-[#EFC291]/10">{(overview?.orders||[]).map(o=><tr key={o.order_id} className="hover:bg-white/[.04]">
                <td className="px-4 py-3 font-mono">{o.order_id.slice(0,18)}</td><td className="px-4 py-3">#{o.user_id}</td><td className="px-4 py-3">{number(o.amount)} UZS</td><td className="px-4 py-3">{number(o.coins)}</td><td className="px-4 py-3"><Pill warning={o.status!=='PAID'}>{o.status}</Pill></td>
              </tr>)}</tbody>
            </table>
            {!overview?.orders.length&&<p className="p-5 text-sm text-[#E2BD99]">Нет заказов.</p>}
          </div>
        </section>
        <section className={panel+' overflow-hidden'}>
          <div className="border-b border-[#F2C18C]/20 p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><Receipt size={19}/> SMS-сигналы</h2><p className="mt-1 text-xs text-[#DCB48D]">Это уведомления, а не доказательство банковского платежа</p></div>
          <div className="max-h-[540px] overflow-x-auto">
            <table className="w-full min-w-[570px] text-left text-xs">
              <thead className="bg-[#301B12]/30 text-[#EBD0AF]"><tr><th className="px-4 py-3">Карта</th><th className="px-4 py-3">Сумма</th><th className="px-4 py-3">Канал</th><th className="px-4 py-3">Время</th><th className="px-4 py-3">Риск</th></tr></thead>
              <tbody className="divide-y divide-[#EFC291]/10">{(overview?.smsSignals||[]).map(x=><tr key={x.id} className="hover:bg-white/[.04]">
                <td className="px-4 py-3">{x.card_type} •••• {x.card_last4}</td><td className="px-4 py-3">{number(x.amount_tiyin/100)} UZS</td><td className="px-4 py-3">{x.channel}</td><td className="px-4 py-3">{when(x.operation_time||x.received_at)}</td><td className="px-4 py-3"><Pill warning={x.status.startsWith('REVIEW')}>{x.status}</Pill></td>
              </tr>)}</tbody>
            </table>
            {!overview?.smsSignals.length&&<p className="p-5 text-sm text-[#E2BD99]">Нет уведомлений.</p>}
          </div>
        </section>
      </div>}

      <footer className="mt-6 text-xs leading-relaxed text-[#D4AC83]">
        Изменения баланса выполняются только под администратором, атомарно в Neon и с записью причины.
        Экспорт CSV включает только отображаемую страницу журнала. SMS не подтверждает оплату.
      </footer>
    </div>

    {selectedId!==null&&<div className="fixed inset-0 z-40 flex items-center justify-center bg-[#150B06]/80 p-3 backdrop-blur-[10px] sm:p-6"
      onMouseDown={e=>{if(e.target===e.currentTarget&&!action)setSelectedId(null);}}>
      <section role="dialog" aria-modal="true" aria-label="Карточка пользователя" className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-[#FBE2BC]/45 bg-[linear-gradient(160deg,#FBEDD8,#E9C79E)] text-[#342113] shadow-[0_35px_100px_rgba(13,6,2,.5),inset_0_2px_0_#FFF9EC]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#BA8353]/30 px-5 py-5 sm:px-7">
          <div><p className={fieldLabel}>УЧЁТНАЯ ЗАПИСЬ #{selectedId}</p>
            <h2 className="mt-1 font-serif text-2xl font-bold">{detail?.user.name||'Пользователь'}</h2>
            <p className="mt-1 text-sm text-[#765138]">{detail?.user.identifier||'Загружается...'}</p></div>
          <button aria-label="Закрыть карточку" onClick={()=>setSelectedId(null)} className="rounded-xl border border-[#B98B5E]/35 bg-white/60 p-2 hover:bg-white"><X size={20}/></button>
        </div>
        {detail?<div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-3">
            {[['Баланс',detail.user.coins],['Всего потрачено',detail.user.total_spent],['Куплено монет',detail.user.total_purchased]].map(([name,value])=>
              <div key={name} className="rounded-2xl border border-[#A8754A]/25 bg-white/55 p-4">
                <p className={fieldLabel}>{name}</p><p className="mt-2 text-2xl font-bold tabular-nums">{number(Number(value))}</p>
              </div>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button onClick={()=>openAction('credit')} className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(165deg,#98633D,#67371D)] px-4 py-3 text-sm font-bold text-[#FFF2DD] shadow-[inset_0_1px_0_#E9BD8F,0_7px_14px_#74412633] transition hover:brightness-110"><Plus size={17}/> Начислить монеты</button>
            <button onClick={()=>openAction('debit')} className="flex items-center justify-center gap-2 rounded-xl border border-[#AF7852]/45 bg-[#F0D7B7] px-4 py-3 text-sm font-bold text-[#60351F] transition hover:bg-[#E8C89D]"><Minus size={17}/> Списать вручную</button>
            <button onClick={exportVisible} className="flex items-center justify-center gap-2 rounded-xl border border-[#AF7852]/45 bg-white/55 px-4 py-3 text-sm font-bold text-[#60351F] transition hover:bg-white"><Download size={16}/> Экспорт истории</button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <section className="overflow-hidden rounded-2xl border border-[#B58859]/30 bg-white/50">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C89C6C]/35 p-4">
                <div><h3 className="font-bold">История операций</h3><p className="text-xs text-[#845D3E]">Расходы, покупки, начисления и возвраты</p></div>
                <select value={detailType} onChange={e=>{setDetailType(e.target.value);setDetailOffset(0);}}
                  className="rounded-lg border border-[#AC8258]/30 bg-[#FAE9D0] px-3 py-2 text-xs font-semibold outline-none">{kinds.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select>
              </div>
              <div className="max-h-[360px] overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs">
                  <thead className="bg-[#E9D0AD] text-[#684327]"><tr><th className="p-3">Дата</th><th className="p-3">Функция / причина</th><th className="p-3">Монеты</th><th className="p-3">Возврат</th></tr></thead>
                  <tbody className="divide-y divide-[#B88B61]/20">{detail.transactions.map(t=><tr key={t.id} className="hover:bg-white/45">
                    <td className="whitespace-nowrap p-3">{when(t.createdAt)}</td><td className="max-w-[260px] p-3"><strong>{t.featureLabel}</strong><span className="mt-0.5 block truncate text-[#775339]" title={t.description}>{t.description}</span></td>
                    <td className={'p-3 font-bold '+(isDebit(t.type)?'text-[#9B4233]':'text-[#256C4C]')}>{isDebit(t.type)?'−':'+'}{number(t.amount)}</td>
                    <td className="p-3">{t.type==='spend'?<button onClick={()=>openAction('refund',t)} title="Вернуть монеты по этой конкретной операции" className="inline-flex items-center gap-1 rounded-lg border border-[#AE7F4B]/35 bg-[#F5DBB4] px-2 py-1.5 font-bold hover:bg-[#EDC890]"><Undo2 size={13}/> Возврат</button>:'—'}</td>
                  </tr>)}</tbody>
                </table>
                {!detail.transactions.length&&<p className="p-4 text-xs text-[#775339]">Транзакций нет.</p>}
              </div>
              <div className="[&_button]:!border-[#8F674B]/40 [&_button]:!bg-[#EAD0AF] [&_button]:!text-[#5E3721] [&_span]:!text-[#745039]">
                <Pager offset={detailOffset} total={detail.total} onChange={setDetailOffset}/>
              </div>
            </section>
            <aside className="rounded-2xl border border-[#B58859]/30 bg-white/50 p-4">
              <h3 className="font-bold">На какие функции тратили</h3>
              <p className="mt-1 text-xs text-[#77563B]">Только фактические расходы</p>
              <div className="mt-4 space-y-4">{detail.services.length?detail.services.map(t=><div key={t.feature}>
                <div className="flex items-center justify-between gap-2 text-xs"><span>{t.label}</span><strong>{number(t.coins)}</strong></div>
                <p className="mt-1 text-[11px] text-[#956D49]">{number(t.operations)} операций</p>
              </div>):<p className="text-xs text-[#775339]">Расходов пока нет.</p>}</div>
              <div className="mt-5 border-t border-[#B58859]/30 pt-4"><h3 className="font-bold">Последние заказы</h3>
                <div className="mt-3 space-y-2">{detail.orders.slice(0,5).map(t=><div key={t.order_id} className="rounded-lg bg-[#F3DFC3] p-2 text-xs">
                  <div className="flex justify-between gap-2"><span>{number(t.coins)} монет</span><strong>{t.status}</strong></div>
                  <p className="mt-1 text-[#775339]">{number(t.amount)} UZS</p></div>)}</div>
              </div>
            </aside>
          </div>
        </div>:<p className="p-7 text-sm text-[#76513C]">Загружаем данные аккаунта…</p>}
      </section>
    </div>}

    {action&&detail&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#100904]/75 p-4 backdrop-blur-md">
      <section role="dialog" aria-modal="true" aria-label="Подтверждение операции" className="w-full max-w-[470px] rounded-[24px] border border-[#FAE0B9] bg-[linear-gradient(165deg,#FFF1DE,#EBC69B)] p-5 text-[#362114] shadow-[0_35px_80px_rgba(10,5,2,.55)] sm:p-7">
        <div className="flex items-start justify-between gap-3"><div><p className={fieldLabel}>ФИНАНСОВАЯ ОПЕРАЦИЯ</p><h3 className="mt-2 font-serif text-2xl font-bold">{action.mode==='credit'?'Начисление монет':action.mode==='debit'?'Ручное списание':'Возврат монет'}</h3></div>
          <button onClick={()=>!submitting&&setAction(null)} aria-label="Закрыть" className="rounded-xl bg-white/65 p-2"><X size={18}/></button>
        </div>
        <div className="mt-5 rounded-xl border border-[#B78659]/35 bg-white/50 p-4">
          <p className="font-bold">{detail.user.name||'Пользователь'} <span className="font-normal text-[#886442]">#{detail.user.id}</span></p>
          <p className="mt-1 text-xs text-[#805B3E]">{detail.user.identifier} · Баланс: {number(detail.user.coins)} монет</p>
        </div>
        <div className="mt-4 space-y-4">
          {action.mode==='refund'?<div className="rounded-xl border border-[#BD8458]/35 bg-[#E8C399]/50 p-4">
            <p className={fieldLabel}>ИЗНАЧАЛЬНОЕ СПИСАНИЕ #{action.transaction?.id}</p>
            <p className="mt-1 text-xl font-bold">{number(action.transaction?.amount||0)} монет</p>
            <p className="mt-1 text-xs">{action.transaction?.featureLabel} · {when(action.transaction?.createdAt||'')}</p>
            <p className="mt-2 text-xs text-[#83543A]">Повторный возврат одной и той же операции запрещён сервером.</p>
          </div>:<label className="block"><span className={fieldLabel}>КОЛИЧЕСТВО МОНЕТ · до 5 000</span>
            <input type="number" min="1" max="5000" step="1" value={amount} onChange={e=>setAmount(e.target.value)}
              placeholder="Например, 212" className={inputClass+' mt-2'} disabled={submitting}/>
          </label>}
          <label className="block"><span className={fieldLabel}>ПРИЧИНА · обязательно</span>
            <textarea rows={3} maxLength={240} value={reason} onChange={e=>setReason(e.target.value)}
              placeholder="Например: возврат за прерванную обработку документа, заявка #..."
              className={inputClass+' mt-2 resize-none'} disabled={submitting}/>
            <span className="mt-1 block text-[11px] text-[#8F6D50]">Причина будет сохранена в журнале и доступна для проверки.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#B88760]/30 bg-white/40 p-3 text-xs leading-relaxed">
            <input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)} className="mt-0.5 accent-[#8F5632]" disabled={submitting}/>
            <span>Я проверил аккаунт, сумму и причину. Подтверждаю изменение реального баланса в Neon.</span>
          </label>
          <button type="button" onClick={()=>void submitAction()} disabled={submitting||!ack||reason.trim().length<8||(action.mode!=='refund'&&(!Number.isSafeInteger(Number(amount))||Number(amount)<1||Number(amount)>5000))}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(155deg,#B57A4A,#784326)] px-4 py-3.5 font-bold text-[#FFF3E0] shadow-[inset_0_1px_0_#F8D3A6,0_10px_20px_#71412333] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
            {submitting?'Сохраняем…':'Подтвердить операцию'} <CheckCircle2 size={18}/>
          </button>
          <p className="text-center text-[11px] text-[#886044]">Повтор одного запроса защищён от двойной записи.</p>
        </div>
      </section>
    </div>}
  </main>;
}
