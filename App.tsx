import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Bookmark, BriefcaseBusiness,
  Calculator, ChevronDown, CircleHelp, Command, Globe2, Landmark, LayoutDashboard,
  LineChart, Menu, Newspaper, Plus, RefreshCw, Search, Settings, ShieldCheck,
  SlidersHorizontal, Star, Wallet, X
} from 'lucide-react'

type MacroPoint = { data: string; valor: string }
type MacroSeries = { key: string; title: string; code: number; unit: string; description: string; data: MacroPoint[]; status: string }
type Section = 'Overview' | 'Markets' | 'Macro' | 'Watchlist' | 'Portfolio' | 'Calculator' | 'News'
const instruments = [
  { symbol:'IBOV', name:'Ibovespa', market:'BR • Índice', kind:'Índice', currency:'PTS' },
  { symbol:'PETR4', name:'Petrobras PN', market:'B3 • Brasil', kind:'Ação', currency:'BRL' },
  { symbol:'VALE3', name:'Vale ON', market:'B3 • Brasil', kind:'Ação', currency:'BRL' },
  { symbol:'ITUB4', name:'Itaú Unibanco PN', market:'B3 • Brasil', kind:'Ação', currency:'BRL' },
  { symbol:'BOVA11', name:'iShares Ibovespa', market:'B3 • Brasil', kind:'ETF', currency:'BRL' },
  { symbol:'AAPL', name:'Apple Inc.', market:'NASDAQ • EUA', kind:'Ação', currency:'USD' },
  { symbol:'MSFT', name:'Microsoft Corp.', market:'NASDAQ • EUA', kind:'Ação', currency:'USD' },
  { symbol:'NVDA', name:'NVIDIA Corp.', market:'NASDAQ • EUA', kind:'Ação', currency:'USD' },
  { symbol:'SPY', name:'SPDR S&P 500 ETF', market:'NYSE Arca • EUA', kind:'ETF', currency:'USD' },
  { symbol:'BTC', name:'Bitcoin', market:'Crypto', kind:'Cripto', currency:'USD' },
  { symbol:'ETH', name:'Ethereum', market:'Crypto', kind:'Cripto', currency:'USD' },
  { symbol:'USD/BRL', name:'Dólar comercial', market:'FX • Brasil', kind:'Câmbio', currency:'BRL' },
]
const nav: {name:Section; icon:any}[] = [
  {name:'Overview',icon:LayoutDashboard},{name:'Markets',icon:Globe2},{name:'Macro',icon:Landmark},
  {name:'Watchlist',icon:Star},{name:'Portfolio',icon:Wallet},{name:'Calculator',icon:Calculator},{name:'News',icon:Newspaper}
]
const fmt = (n:number, digits=2) => n.toLocaleString('pt-BR',{minimumFractionDigits:digits,maximumFractionDigits:digits})
const dateRange = (days:number) => { const d=new Date(); d.setDate(d.getDate()-days); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` }
function Spark({down=false}:{down?:boolean}) {
  const vals = down ? [18,22,19,26,23,31,27,35,30,39,33,44,41,49,45,53,48,57] : [48,44,49,40,43,34,37,30,34,25,29,20,24,14,18,12,16,8]
  const points=vals.map((v,i)=>`${i*6},${v}`).join(' ')
  return <svg viewBox="0 0 102 64" className="spark" preserveAspectRatio="none"><polyline points={points} fill="none" stroke={down?'#ff6670':'#45d49a'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function MiniChart({data}:{data:number[]}) {
  const max=Math.max(...data), min=Math.min(...data), range=max-min||1
  const pts=data.map((v,i)=>`${i*100/(data.length-1)},${55-(v-min)/range*47}`).join(' ')
  const area=`0,60 ${pts} 100,60`
  return <svg viewBox="0 0 100 62" preserveAspectRatio="none" className="line-chart">
    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f49b37" stopOpacity=".25"/><stop offset="100%" stopColor="#f49b37" stopOpacity="0"/></linearGradient></defs>
    <polygon points={area} fill="url(#chartFill)"/><polyline points={pts} fill="none" stroke="#f49b37" strokeWidth="1.6" vectorEffect="non-scaling-stroke"/>
  </svg>
}
function App() {
  const [section,setSection]=useState<Section>('Overview')
  const [query,setQuery]=useState('')
  const [searchOpen,setSearchOpen]=useState(false)
  const [selected,setSelected]=useState('IBOV')
  const [watchlist,setWatchlist]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('atlas-watchlist')||'["IBOV","PETR4","VALE3","AAPL","BTC"]')}catch{return ['IBOV','PETR4','VALE3','AAPL','BTC']}})
  const [macro,setMacro]=useState<MacroSeries[]>([])
  const [macroLoading,setMacroLoading]=useState(false)
  const [macroError,setMacroError]=useState('')
  const [lastRefresh,setLastRefresh]=useState<Date|null>(null)
  const [command,setCommand]=useState('')
  const [commandMessage,setCommandMessage]=useState('')
  const [amount,setAmount]=useState('1000')
  const [rate,setRate]=useState('10')
  const [months,setMonths]=useState('12')
  const [portfolio,setPortfolio]=useState<{symbol:string;qty:number;cost:number}[]>(()=>{try{return JSON.parse(localStorage.getItem('atlas-portfolio')||'[]')}catch{return []}})
  const [newSymbol,setNewSymbol]=useState('PETR4')
  const [newQty,setNewQty]=useState('10')
  const [newCost,setNewCost]=useState('30')
  const [mobileMenu,setMobileMenu]=useState(false)
  const [toast,setToast]=useState('')
  const found = useMemo(()=>instruments.filter(i=>(i.symbol+' '+i.name+' '+i.kind).toLowerCase().includes(query.toLowerCase())).slice(0,7),[query])
  useEffect(()=>{localStorage.setItem('atlas-watchlist',JSON.stringify(watchlist))},[watchlist])
  useEffect(()=>{localStorage.setItem('atlas-portfolio',JSON.stringify(portfolio))},[portfolio])
  const fetchMacro=async()=>{
    setMacroLoading(true);setMacroError('')
    const series=[{key:'selic',title:'Meta Selic',code:432,unit:'% a.a.',description:'Taxa Selic meta definida pelo Copom.'},{key:'ipca',title:'IPCA mensal',code:433,unit:'% mensal',description:'Índice Nacional de Preços ao Consumidor Amplo.'},{key:'usd',title:'USD/BRL (venda)',code:1,unit:'BRL',description:'Taxa de câmbio diária de venda, série histórica do BCB.'}]
    try{
      const results=await Promise.all(series.map(async s=>{
        const start=dateRange(s.key==='ipca'?365:90)
        const url=`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${s.code}/dados?formato=json&dataInicial=${encodeURIComponent(start)}`
        const r=await fetch(url,{headers:{Accept:'application/json'}})
        if(!r.ok)throw new Error(`BCB ${r.status}`)
        const data:MacroPoint[]=await r.json()
        return {...s,data:data.slice(-12),status:data.length?'Dados oficiais do BCB':'Sem observações'}
      }))
      setMacro(results);setLastRefresh(new Date())
    }catch(e){setMacroError('Não foi possível consultar o Banco Central agora. Verifique a conexão e tente novamente.');}
    finally{setMacroLoading(false)}
  }
  useEffect(()=>{fetchMacro()},[])
  const choose=(symbol:string)=>{setSelected(symbol);setQuery('');setSearchOpen(false);setSection('Markets')}
  const runCommand=()=>{
    const raw=command.trim().toUpperCase()
    if(!raw){setCommandMessage('Digite HELP, QUOTE PETR4, SEARCH AAPL, MACRO BR ou WATCHLIST.');return}
    const parts=raw.split(/\s+/); const cmd=parts[0]
    if(cmd==='HELP'){setCommandMessage('Comandos: HOME | SEARCH ticker | QUOTE ticker | CHART ticker | MACRO BR | WATCHLIST | PORTFOLIO | CALCULATOR')}
    else if(cmd==='HOME'){setSection('Overview');setCommandMessage('Painel principal aberto.')}
    else if(cmd==='WATCHLIST'){setSection('Watchlist');setCommandMessage('Lista de acompanhamento aberta.')}
    else if(cmd==='PORTFOLIO'){setSection('Portfolio');setCommandMessage('Carteira aberta.')}
    else if(cmd==='MACRO'){setSection('Macro');setCommandMessage('Painel macroeconômico aberto.')}
    else if(cmd==='CALCULATOR'){setSection('Calculator');setCommandMessage('Calculadora aberta.')}
    else if(['QUOTE','SEARCH','CHART'].includes(cmd)&&parts[1]){choose(parts[1]);setCommandMessage(`Instrumento ${parts[1]} selecionado. Cotações de ações ainda não estão conectadas a um provedor.`)}
    else {setCommandMessage(`Comando não reconhecido: ${cmd}. Digite HELP.`)}
    setCommand('')
  }
  const toggleWatch=(symbol:string)=>setWatchlist(w=>w.includes(symbol)?w.filter(x=>x!==symbol):[...w,symbol])
  const addHolding=()=>{
    const qty=Number(newQty),cost=Number(newCost),symbol=newSymbol.trim().toUpperCase()
    if(!symbol||qty<=0||cost<0||!Number.isFinite(qty)||!Number.isFinite(cost)){setToast('Confira o ativo, quantidade e custo.');return}
    setPortfolio(p=>[...p,{symbol,qty,cost}]);setToast(`${symbol} adicionado à carteira local.`)
  }
  const monthlyRate=(Number(rate)||0)/100/12, principal=Number(amount)||0, n=Math.max(0,Number(months)||0)
  const futureValue=monthlyRate===0?principal:principal*Math.pow(1+monthlyRate,n)
  const title=section==='Overview'?'Market overview':section==='Markets'?'Instrument terminal':section==='Macro'?'Macro monitor':section==='Watchlist'?'My watchlists':section==='Portfolio'?'Portfolio monitor':section==='Calculator'?'Financial calculator':'Financial news'
  const active=instruments.find(i=>i.symbol===selected)||instruments[0]
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu?'open':''}`}>
      <div className="brand"><div className="brand-mark">A</div><div><div className="brand-name">ATLAS<span> / FT</span></div><div className="brand-sub">FINANCIAL TERMINAL</div></div><button className="icon-btn mobile-close" onClick={()=>setMobileMenu(false)}><X size={18}/></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.map(({name,icon:Icon})=><button key={name} className={`nav-item ${section===name?'active':''}`} onClick={()=>{setSection(name);setMobileMenu(false)}}><Icon size={17}/><span>{name}</span>{name==='Watchlist'&&<span className="nav-count">{watchlist.length}</span>}</button>)}</nav>
      <div className="side-label market-label">MARKET SNAPSHOT <span className="live-dot"/></div>
      <div className="side-market"><div><span>IBOVESPA</span><b>—</b></div><small>Dados de cotação não conectados</small></div>
      <div className="side-market"><div><span>S&P 500</span><b>—</b></div><small>Dados de cotação não conectados</small></div>
      <div className="side-market"><div><span>USD / BRL</span><b>{macro.find(m=>m.key==='usd')?.data.slice(-1)[0]?.valor||'—'}</b></div><small>Referência diária BCB</small></div>
      <div className="sidebar-bottom"><div className="status-line"><span className="status-dot"/> Terminal local</div><div className="side-foot">ATLAS v0.1.0 · BUILD OPEN</div></div>
    </aside>
    {mobileMenu&&<button className="scrim" aria-label="Fechar menu" onClick={()=>setMobileMenu(false)}/>}
    <main className="main">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={()=>setMobileMenu(true)}><Menu size={19}/></button>
        <div className="breadcrumb">ATLAS <span>/</span> TERMINAL <span>/</span> <b>{section.toUpperCase()}</b></div>
        <div className="top-actions"><div className="market-open"><span className="status-dot"/> DATA CONNECTION</div><button className="icon-btn" title="Alertas" onClick={()=>setToast('Alertas automáticos ainda não foram conectados a uma fonte de cotações.')}><Bell size={17}/></button><button className="icon-btn" title="Configurações" onClick={()=>setToast('Configurações avançadas serão adicionadas nas próximas versões.')}><Settings size={17}/></button></div>
      </header>
      <section className="commandbar">
        <Command size={17} className="command-icon"/><input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runCommand()} placeholder="Comando...  ex.: QUOTE PETR4, MACRO BR, HELP"/><kbd>ENTER ↵</kbd><button className="run-btn" onClick={runCommand}>EXECUTAR</button>
      </section>
      {commandMessage&&<div className="command-feedback"><CircleHelp size={14}/>{commandMessage}<button onClick={()=>setCommandMessage('')}><X size={13}/></button></div>}
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">ATLAS INTELLIGENCE <span>•</span> {new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()}</div><h1>{title}<span className="title-period">.</span></h1><p>{section==='Overview'?'A consolidated view of markets, macro indicators and your watchlist.':'Terminal pessoal para pesquisa, monitoramento e análise financeira.'}</p></div><div className="heading-actions"><button className="secondary-btn" onClick={fetchMacro} disabled={macroLoading}><RefreshCw size={14} className={macroLoading?'spin':''}/>{macroLoading?'ATUALIZANDO':'ATUALIZAR DADOS'}</button><button className="primary-btn" onClick={()=>{setSection('Watchlist');setToast('Adicione ativos pela pesquisa global.')}}><Plus size={15}/> NOVA LISTA</button></div></div>
        <div className="search-wrap"><Search size={16}/><input value={query} onFocus={()=>setSearchOpen(true)} onChange={e=>{setQuery(e.target.value);setSearchOpen(true)}} placeholder="Pesquisar ticker, empresa, índice ou moeda..."/><kbd>⌘ K</kbd>{query&&<button className="clear-search" onClick={()=>setQuery('')}><X size={14}/></button>}
          {searchOpen&&query&&<div className="search-results">{found.length?found.map(item=><button key={item.symbol} onClick={()=>choose(item.symbol)}><div className="result-symbol">{item.symbol}</div><div className="result-name">{item.name}<small>{item.market}</small></div><span className="result-kind">{item.kind}</span></button>):<div className="no-results">Nenhum instrumento no cadastro inicial.</div>}<button className="search-dismiss" onClick={()=>setSearchOpen(false)}>Fechar pesquisa</button></div>}
        </div>
        {section==='Overview'&&<Overview macro={macro} macroLoading={macroLoading} macroError={macroError} onMacro={()=>setSection('Macro')} watchlist={watchlist} onChoose={choose} onWatch={()=>setSection('Watchlist')} onRefresh={fetchMacro} lastRefresh={lastRefresh}/>}
        {section==='Markets'&&<Markets active={active} watchlist={watchlist} toggleWatch={toggleWatch} macro={macro} onChoose={choose}/>}
        {section==='Macro'&&<MacroPanel macro={macro} loading={macroLoading} error={macroError} refresh={fetchMacro}/>}
        {section==='Watchlist'&&<Watchlist watchlist={watchlist} onChoose={choose} toggleWatch={toggleWatch}/>}
        {section==='Portfolio'&&<Portfolio portfolio={portfolio} newSymbol={newSymbol} setNewSymbol={setNewSymbol} newQty={newQty} setNewQty={setNewQty} newCost={newCost} setNewCost={setNewCost} addHolding={addHolding} remove={(i:number)=>setPortfolio(p=>p.filter((_,idx)=>idx!==i))}/>}
        {section==='Calculator'&&<CalculatorPanel amount={amount} setAmount={setAmount} rate={rate} setRate={setRate} months={months} setMonths={setMonths} futureValue={futureValue}/>}
        {section==='News'&&<NewsPanel/>}
        <footer className="footer"><div><ShieldCheck size={13}/> <span>DATA INTEGRITY FIRST</span><i>•</i> Sem cotações de mercado inventadas</div><div>ATLAS FINANCIAL TERMINAL <span>v0.1.0</span></div></footer>
      </div>
    </main>
    {toast&&<div className="toast"><span>{toast}</span><button onClick={()=>setToast('')}><X size={14}/></button></div>}
  </div>
}
function Overview({macro,macroLoading,macroError,onMacro,watchlist,onChoose,onWatch,onRefresh,lastRefresh}:{macro:MacroSeries[];macroLoading:boolean;macroError:string;onMacro:()=>void;watchlist:string[];onChoose:(s:string)=>void;onWatch:()=>void;onRefresh:()=>void;lastRefresh:Date|null}){
  const cards=[{label:'SELIC META',value:macro.find(m=>m.key==='selic')?.data.slice(-1)[0]?.valor,unit:'% a.a.',key:'selic',color:'orange'},{label:'IPCA MENSAL',value:macro.find(m=>m.key==='ipca')?.data.slice(-1)[0]?.valor,unit:'% m/m',key:'ipca',color:'blue'},{label:'USD / BRL',value:macro.find(m=>m.key==='usd')?.data.slice(-1)[0]?.valor,unit:'BRL',key:'usd',color:'green'}]
  return <>
    <div className="section-row"><div className="section-title">01 <span>KEY INDICATORS</span></div><span className="subtle">{lastRefresh?`Atualizado ${lastRefresh.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:'Fonte: Banco Central do Brasil'}</span></div>
    <div className="metric-grid">{cards.map(c=><div className="metric-card" key={c.key}><div className="metric-top"><span>{c.label}</span><span className={`metric-icon ${c.color}`}><Activity size={15}/></span></div><div className="metric-value">{c.value??(macroLoading?'…':'—')}<small>{c.value?c.unit:''}</small></div><div className="metric-bottom"><span className="metric-source">{c.value?'BCB · SÉRIE OFICIAL':'Aguardando dados'}</span><span className="neutral-tag">{c.key==='ipca'?'Inflação':c.key==='selic'?'Juros':'Câmbio'}</span></div></div>)}</div>
    {macroError&&<div className="warning-box">{macroError}<button onClick={onRefresh}>Tentar novamente</button></div>}
    <div className="section-row"><div className="section-title">02 <span>MARKET RADAR</span></div><span className="subtle">Preços de mercado não conectados</span></div>
    <div className="radar-grid">{[{sym:'IBOV',name:'Ibovespa',desc:'Índice • Brasil',n:1},{sym:'SPY',name:'S&P 500 ETF',desc:'ETF • EUA',n:2},{sym:'BTC',name:'Bitcoin',desc:'Cripto • Global',n:3},{sym:'PETR4',name:'Petrobras PN',desc:'Ação • B3',n:4}].map((x,i)=><button className="radar-card" key={x.sym} onClick={()=>onChoose(x.sym)}><div className="radar-head"><span>{x.sym}</span><span className="radar-index">0{x.n}</span></div><div className="radar-name">{x.name}</div><div className="radar-desc">{x.desc}</div><div className="radar-bottom"><span className="no-quote">COTAÇÃO NÃO CONECTADA</span><LineChart size={16}/></div></button>)}</div>
    <div className="two-col">
      <div className="panel"><div className="panel-head"><div><div className="panel-kicker">YOUR UNIVERSE</div><h2>Watchlist overview</h2></div><button className="text-btn" onClick={onWatch}>VER LISTA <span>↗</span></button></div>
        <div className="watch-table"><div className="table-head"><span>INSTRUMENTO</span><span>TIPO</span><span>ÚLTIMO</span></div>{watchlist.slice(0,5).map(sym=>{const it=instruments.find(i=>i.symbol===sym);return <button className="watch-row" key={sym} onClick={()=>onChoose(sym)}><span><b>{sym}</b><small>{it?.name||sym}</small></span><span className="type-pill">{it?.kind||'Ativo'}</span><span className="dash-value">—</span></button>})}{watchlist.length===0&&<div className="empty-state">Sua lista está vazia. Pesquise um ticker e adicione-o.</div>}</div>
      </div>
      <div className="panel"><div className="panel-head"><div><div className="panel-kicker">ECONOMIC PULSE</div><h2>Macro monitor</h2></div><button className="text-btn" onClick={onMacro}>ABRIR <span>↗</span></button></div>
        <div className="macro-list">{macro.map(m=><div className="macro-row" key={m.key}><div className="macro-icon">{m.key==='selic'?'%':m.key==='ipca':'$'}</div><div className="macro-copy"><b>{m.title}</b><small>{m.data.slice(-1)[0]?.data||'Data indisponível'} · BCB</small></div><strong>{m.data.slice(-1)[0]?.valor||'—'}<small>{m.unit}</small></strong></div>)}{macroLoading&&<div className="loading-line">Consultando séries oficiais…</div>}{!macro.length&&!macroLoading&&<div className="empty-state">Dados macroeconômicos indisponíveis.</div>}</div>
      </div>
    </div>
    <div className="disclaimer"><ShieldCheck size={16}/><div><b>Integridade dos dados</b><span>Os indicadores macroeconômicos são consultados diretamente nas séries do Banco Central. Preços de ações, ETFs, índices e cripto ainda não estão conectados; por isso aparecem como indisponíveis, nunca como valores simulados.</span></div></div>
  </>
}
function Markets({active,watchlist,toggleWatch,macro,onChoose}:{active:any;watchlist:string[];toggleWatch:(s:string)=>void;macro:MacroSeries[];onChoose:(s:string)=>void}){
  const [tab,setTab]=useState('Overview')
  const isWatched=watchlist.includes(active.symbol)
  const related=instruments.filter(i=>i.kind===active.kind)
  return <><div className="instrument-hero"><div className="instrument-ident"><div className="ticker-box">{active.symbol.slice(0,2)}</div><div><div className="eyebrow">{active.market} <span>•</span> {active.kind}</div><h2>{active.symbol} <span>{active.name}</span></h2><p>Instrumento cadastrado · cobertura de cotação pendente</p></div></div><button className={`secondary-btn ${isWatched?'watching':''}`} onClick={()=>toggleWatch(active.symbol)}>{isWatched?<Bookmark size={15} fill="currentColor"/>:<Star size={15}/>} {isWatched?'NA WATCHLIST':'ADICIONAR À WATCHLIST'}</button></div>
    <div className="quote-empty"><div className="quote-empty-icon"><LineChart size={23}/></div><div><b>Feed de cotações não conectado</b><p>Este terminal ainda não tem um provedor licenciado de preços de ações/ETFs/índices. Não exibiremos números inventados. A integração de séries macro oficiais do BCB está ativa quando a API responde.</p></div><span className="neutral-tag">NO LIVE FEED</span></div>
    <div className="tabbar">{['Overview','History','Fundamentals','Related'].map(t=><button className={tab===t?'selected':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>
    {tab==='Overview'&&<div className="metric-grid four"><div className="metric-card"><div className="metric-top"><span>LAST PRICE</span><LineChart size={15}/></div><div className="metric-value">—</div><div className="metric-bottom">Sem fonte conectada</div></div><div className="metric-card"><div className="metric-top"><span>DAY CHANGE</span><Activity size={15}/></div><div className="metric-value">—</div><div className="metric-bottom">Sem fonte conectada</div></div><div className="metric-card"><div className="metric-top"><span>DAY RANGE</span><SlidersHorizontal size={15}/></div><div className="metric-value">—</div><div className="metric-bottom">Sem fonte conectada</div></div><div className="metric-card"><div className="metric-top"><span>VOLUME</span><BarChart3 size={15}/></div><div className="metric-value">—</div><div className="metric-bottom">Sem fonte conectada</div></div></div>}
    {tab==='History'&&<div className="panel"><div className="panel-head"><h2>Historical series</h2><span className="neutral-tag">NOT AVAILABLE</span></div><div className="empty-state">O histórico deste instrumento depende de uma fonte de preços. Os dados macroeconômicos oficiais estão disponíveis no módulo Macro.</div></div>}
    {tab==='Fundamentals'&&<div className="panel"><div className="panel-head"><h2>Fundamental data</h2></div><div className="empty-state">Dados fundamentalistas ainda não conectados. Não há múltiplos estimados ou preenchidos artificialmente.</div></div>}
    {tab==='Related'&&<div className="panel related-list">{related.map(i=><button key={i.symbol} onClick={()=>onChoose(i.symbol)}><b>{i.symbol}</b><span>{i.name}</span><small>{i.market}</small></button>)}</div>}
    <div className="disclaimer"><ShieldCheck size={16}/><div><b>Instrumento selecionado</b><span>Cadastro de instrumentos é um universo inicial para navegação, não confirmação de cobertura, preço negociável ou recomendação de investimento.</span></div></div>
  </>
}
function MacroPanel({macro,loading,error,refresh}:{macro:MacroSeries[];loading:boolean;error:string;refresh:()=>void}){
  const [selected,setSelected]=useState('selic')
  const item=macro.find(m=>m.key===selected)
  const data=item?.data||[]
  return <><div className="panel macro-panel"><div className="panel-head"><div><div className="panel-kicker">OFFICIAL SOURCE</div><h2>Brazilian macroeconomic time series</h2><p>Banco Central do Brasil · SGS API</p></div><button className="secondary-btn" onClick={refresh} disabled={loading}><RefreshCw size={14} className={loading?'spin':''}/> REFRESH</button></div>
    <div className="tabbar">{macro.map(m=><button key={m.key} className={selected===m.key?'selected':''} onClick={()=>setSelected(m.key)}>{m.title}</button>)}</div>
    {error&&<div className="warning-box">{error}</div>}
    {item&&<><div className="macro-detail"><div><span className="panel-kicker">{item.title.toUpperCase()}</span><div className="macro-big">{data.slice(-1)[0]?.valor||'—'} <small>{item.unit}</small></div><p>{item.description}</p></div><div className="source-tag"><ShieldCheck size={14}/> Banco Central do Brasil <a href="https://www.bcb.gov.br/acessoinformacao/dadosabertos" target="_blank" rel="noreferrer">Fonte oficial ↗</a></div></div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>DATA</th><th>VALOR</th><th>FONTE</th></tr></thead><tbody>{[...data].reverse().map((p,i)=><tr key={p.data+i}><td>{p.data}</td><td className="mono">{p.valor}{item.key==='selic'?'%':item.key==='ipca'?'%':''}</td><td><span className="source-dot"/>BCB SGS #{item.code}</td></tr>)}</tbody></table>{!data.length&&!loading&&<div className="empty-state">Nenhuma observação retornada pela API.</div>}{loading&&<div className="loading-line">Consultando API oficial…</div>}</div></>}
  </div><div className="disclaimer"><ShieldCheck size={16}/><div><b>Interpretação dos dados</b><span>As séries têm periodicidades diferentes: Selic meta é uma taxa anualizada, IPCA é variação mensal e USD/BRL é uma taxa de câmbio diária de referência. Não compare seus valores diretamente.</span></div></div></>
}
function Watchlist({watchlist,onChoose,toggleWatch}:{watchlist:string[];onChoose:(s:string)=>void;toggleWatch:(s:string)=>void}){
  return <div className="panel"><div className="panel-head"><div><div className="panel-kicker">PERSONAL UNIVERSE</div><h2>Tracked instruments</h2><p>Salvo localmente neste dispositivo.</p></div><span className="neutral-tag">{watchlist.length} INSTRUMENTOS</span></div>
    {watchlist.length?<div className="data-table-wrap"><table className="data-table"><thead><tr><th>TICKER</th><th>INSTRUMENTO</th><th>MERCADO</th><th>ÚLTIMO</th><th>AÇÃO</th></tr></thead><tbody>{watchlist.map(s=>{const i=instruments.find(x=>x.symbol===s);return <tr key={s}><td><button className="table-link" onClick={()=>onChoose(s)}>{s}</button></td><td>{i?.name||s}</td><td>{i?.market||'Personalizado'}</td><td className="muted">—</td><td><button className="remove-btn" onClick={()=>toggleWatch(s)}>REMOVER</button></td></tr>})}</tbody></table></div>:<div className="empty-state">Nenhum ativo acompanhado. Use a pesquisa global para encontrar um ticker e adicione-o.</div>}
    <div className="panel-note"><Bookmark size={15}/> Watchlists usam o armazenamento local do navegador. Limpar os dados do navegador pode apagá-las.</div>
  </div>
}
function Portfolio({portfolio,newSymbol,setNewSymbol,newQty,setNewQty,newCost,setNewCost,addHolding,remove}:{portfolio:{symbol:string;qty:number;cost:number}[];newSymbol:string;setNewSymbol:(s:string)=>void;newQty:string;setNewQty:(s:string)=>void;newCost:string;setNewCost:(s:string)=>void;addHolding:()=>void;remove:(i:number)=>void}){
  const total=portfolio.reduce((s,p)=>s+p.qty*p.cost,0)
  return <><div className="metric-grid three"><div className="metric-card"><div className="metric-top"><span>CUSTO REGISTRADO</span><Wallet size={15}/></div><div className="metric-value">R$ {fmt(total)}</div><div className="metric-bottom">Soma dos custos informados</div></div><div className="metric-card"><div className="metric-top"><span>POSIÇÕES</span><BriefcaseBusiness size={15}/></div><div className="metric-value">{portfolio.length}</div><div className="metric-bottom">Ativos registrados</div></div><div className="metric-card"><div className="metric-top"><span>VALOR DE MERCADO</span><Activity size={15}/></div><div className="metric-value">—</div><div className="metric-bottom">Preço atual não conectado</div></div></div>
    <div className="panel"><div className="panel-head"><div><div className="panel-kicker">LOCAL PORTFOLIO</div><h2>Registrar posição</h2></div><span className="neutral-tag">SOMENTE NESTE DISPOSITIVO</span></div>
      <div className="holding-form"><label>TICKER<input value={newSymbol} onChange={e=>setNewSymbol(e.target.value)} placeholder="PETR4"/></label><label>QUANTIDADE<input type="number" min="0.0001" value={newQty} onChange={e=>setNewQty(e.target.value)}/></label><label>CUSTO UNITÁRIO (R$)<input type="number" min="0" value={newCost} onChange={e=>setNewCost(e.target.value)}/></label><button className="primary-btn" onClick={addHolding}><Plus size={15}/> ADICIONAR</button></div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>TICKER</th><th>QUANTIDADE</th><th>CUSTO UNITÁRIO</th><th>CUSTO TOTAL</th><th></th></tr></thead><tbody>{portfolio.map((p,i)=><tr key={i}><td className="mono">{p.symbol}</td><td>{p.qty}</td><td>R$ {fmt(p.cost)}</td><td>R$ {fmt(p.qty*p.cost)}</td><td><button className="remove-btn" onClick={()=>remove(i)}>EXCLUIR</button></td></tr>)}</tbody></table>{!portfolio.length&&<div className="empty-state">Sua carteira está vazia. Adicione posições para registrar custo de aquisição.</div>}</div>
    </div><div className="disclaimer"><ShieldCheck size={16}/><div><b>Carteira de acompanhamento</b><span>Não há integração com corretoras. O custo registrado não é valor de mercado, rentabilidade ou saldo financeiro atualizado.</span></div></div></>
}
function CalculatorPanel({amount,setAmount,rate,setRate,months,setMonths,futureValue}:{amount:string;setAmount:(s:string)=>void;rate:string;setRate:(s:string)=>void;months:string;setMonths:(s:string)=>void;futureValue:number}){
  return <div className="calculator-layout"><div className="panel"><div className="panel-head"><div><div className="panel-kicker">SCENARIO TOOL</div><h2>Compound interest calculator</h2><p>Simulação simplificada sem aportes periódicos.</p></div><Calculator size={19}/></div><div className="calc-form"><label>CAPITAL INICIAL (R$)<input type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>TAXA NOMINAL ANUAL (%)<input type="number" value={rate} onChange={e=>setRate(e.target.value)}/></label><label>DURAÇÃO (MESES)<input type="number" min="0" value={months} onChange={e=>setMonths(e.target.value)}/></label></div><div className="formula">Fórmula: VF = VP × (1 + i)<sup>n</sup>, com taxa anual convertida em taxa mensal equivalente por divisão simples. A convenção é aproximada.</div></div><div className="result-card"><div className="panel-kicker">PROJECTED FUTURE VALUE</div><div className="result-value">R$ {fmt(futureValue)}</div><div className="result-caption">Capital final estimado</div><div className="result-divider"/><div className="result-row"><span>Capital inicial</span><b>R$ {fmt(Number(amount)||0)}</b></div><div className="result-row"><span>Juros estimados</span><b className="positive">R$ {fmt(futureValue-(Number(amount)||0))}</b></div><div className="result-row"><span>Prazo</span><b>{months} meses</b></div><div className="result-warning">Não inclui impostos, taxas, inflação ou aportes. Não representa uma oferta de investimento nem garantia de rendimento.</div></div></div>
}
function NewsPanel(){return <div className="panel"><div className="panel-head"><div><div className="panel-kicker">NEWSWIRE</div><h2>Financial news</h2></div><span className="neutral-tag">NOT CONNECTED</span></div><div className="empty-state"><Newspaper size={25}/><b>Fonte de notícias ainda não conectada</b><span>O terminal não mostrará manchetes inventadas. Próxima etapa: integrar RSS/APIs permitidas e exibir fonte, data e link original.</span></div><div className="source-links"><a href="https://www.bcb.gov.br/" target="_blank" rel="noreferrer">Banco Central do Brasil ↗</a><a href="https://www.federalreserve.gov/newsevents.htm" target="_blank" rel="noreferrer">Federal Reserve ↗</a><a href="https://www.bls.gov/" target="_blank" rel="noreferrer">U.S. Bureau of Labor Statistics ↗</a></div></div>}
export default App
