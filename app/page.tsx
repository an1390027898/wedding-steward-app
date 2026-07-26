"use client";

import { useEffect, useMemo, useState } from "react";

type ScheduleItem = { time: string; title: string; place: string; owner: string; script: string; items: string[] };
type Preparation = { side: "男方" | "女方"; name: string; quantity: string; owner: string; deadline: string; done: boolean };
type Wedding = {
  id?: number; groom: string; bride: string; weddingDate: string; banquetTime: string; status: string;
  phone: string; hotel: string; groomAddress: string; brideAddress: string; notes: string;
  customs: string[]; customExecutors: Record<string, string>; preparations: Preparation[]; times: Record<string, string>;
  schedule: ScheduleItem[]; contacts: { role: string; name: string; phone: string; arrival?: string }[];
};

const timeFields = [
  ["gather", "人员集合"], ["depart", "接亲出发"], ["brideArrive", "到女方家"], ["tea", "敬茶拜别"],
  ["brideLeave", "新娘出门"], ["groomArrive", "到男方家"], ["hotelArrive", "到达酒店"], ["ceremony", "仪式／开席"],
] as const;

const defaultContacts = ["管家","主持人","摄影师","摄像师","化妆师"];

const defaultPreparations: Preparation[] = [
  { side:"男方",name:"总流程表、联系人表",quantity:"纸质＋电子版各1份",owner:"男方总管",deadline:"婚前3—7天",done:false },
  { side:"男方",name:"车队表、主路线和备用路线",quantity:"每车1份",owner:"车辆总管",deadline:"婚前3—7天",done:false },
  { side:"男方",name:"分类红包、烟糖",quantity:"按用途贴签分装",owner:"男方父母／总管",deadline:"婚前1天",done:false },
  { side:"男方",name:"捧花、胸花、婚戒",quantity:"各1套",owner:"伴郎",deadline:"接亲出发前",done:false },
  { side:"男方",name:"红伞",quantity:"主用1把＋备用1把",owner:"伴郎",deadline:"接亲出发前",done:false },
  { side:"男方",name:"红毯、防滑胶、年糕",quantity:"按进门路线",owner:"安全员／铺路人",deadline:"婚前1天",done:false },
  { side:"男方",name:"长命灯电源及备用电池",quantity:"双路电源1套",owner:"男方上头奶奶",deadline:"婚前1天",done:false },
  { side:"男方",name:"桂圆水、宽心面／饺子",quantity:"新人及家人少量",owner:"男方上头奶奶／厨房",deadline:"新人到男方家前",done:false },
  { side:"女方",name:"送亲名单、辈分称呼表",quantity:"纸质＋电子版各1份",owner:"女方总管",deadline:"婚前3—7天",done:false },
  { side:"女方",name:"嫁妆总清单和分车清单",quantity:"总表1份＋每车分表",owner:"女方母亲／伴娘",deadline:"婚前1天",done:false },
  { side:"女方",name:"长命灯及桂圆",quantity:"灯2盏、桂圆双数",owner:"伴娘",deadline:"婚前1天",done:false },
  { side:"女方",name:"红皮箱、钥匙及箱内用品",quantity:"1套并贴签",owner:"送亲兄弟",deadline:"婚前1天",done:false },
  { side:"女方",name:"婚纱、敬酒服、婚鞋、首饰",quantity:"按造型分袋",owner:"新娘／伴娘",deadline:"婚前1天",done:false },
  { side:"女方",name:"上马菜",quantity:"整鸡、整鱼、四喜菜等",owner:"女方厨房／上头奶奶",deadline:"接亲到达前",done:false },
  { side:"女方",name:"茶具及改口红包",quantity:"父母各1杯／红包",owner:"女方父母／接待组",deadline:"敬茶前",done:false },
  { side:"女方",name:"红毛巾包、红纸包",quantity:"1包，分小包",owner:"伴娘／行人",deadline:"新娘出门前",done:false },
];

const customs = [
  ["上头礼", "婚礼前由长辈为新人梳头祝福"],
  ["上马菜", "新娘出门前象征性品尝家乡菜"],
  ["长命灯", "女方送灯，男方安排专人接灯进新房"],
  ["接箱接被", "红箱、钥匙、喜被按顺序交接"],
  ["红伞出门", "出门及下车时由指定人员撑伞"],
  ["跨火盆／马鞍", "如双方认可，在进门处提前摆放"],
  ["敬茶改口", "双方父母落座，茶具与改口红包到位"],
  ["压床／滚床", "按家庭习惯安排儿童或指定亲友完成"],
];

const blank: Wedding = {
  groom: "", bride: "", weddingDate: "", banquetTime: "11:38", status: "筹备中", phone: "", hotel: "",
  groomAddress: "", brideAddress: "", notes: "", customs: ["上马菜", "长命灯", "接箱接被", "红伞出门", "敬茶改口"],
  customExecutors: {"上马菜":"女方上头奶奶","长命灯":"男方上头奶奶／伴娘","接箱接被":"喜婆婆／送亲兄弟／护被人","红伞出门":"新郎／女方上头奶奶","敬茶改口":"管家／双方父母"},
  preparations: defaultPreparations.map(x=>({...x})), times: {}, schedule: [], contacts: defaultContacts.map(role => ({ role, name: "", phone: "", arrival: "" })),
};

function normalizeWedding(w: Wedding): Wedding {
  const existing = Array.isArray(w.contacts) ? w.contacts : [];
  const fixed = defaultContacts.map(role => {
    const match = existing.find(c => c.role === role || (role === "管家" && c.role === "婚礼管家") || (role === "摄影师" && c.role === "摄影") || (role === "摄像师" && c.role === "摄像"));
    return match ? { ...match, role, arrival: match.arrival || "" } : { role, name: "", phone: "", arrival: "" };
  });
  const others = existing.filter(c => !defaultContacts.includes(c.role) && !["婚礼管家","摄影","摄像"].includes(c.role)).map(c => ({ ...c, arrival: c.arrival || "" }));
  return { ...w, times: w.times || {}, customs: w.customs || [], customExecutors:w.customExecutors||{},
    preparations:Array.isArray(w.preparations)&&w.preparations.length?w.preparations:defaultPreparations.map(x=>({...x})),
    schedule: w.schedule || [], contacts: [...fixed, ...others] };
}

function makeSchedule(w: Wedding): ScheduleItem[] {
  const at = (key: string) => w.times[key] || "待确认";
  const add = (key: string, title: string, place: string, owner: string, script: string, items: string[]) =>
    ({ time: at(key), title, place, owner, script, items });
  const rows = [
    add("gather", "人员集合与物品点验", w.groomAddress || "男方家", "管家", "大家先不要急着出发。请按清单把花、戒指、红包和车辆逐项给我确认，缺少的现在马上说。", ["手捧花", "婚戒", "分类红包", "车辆表"]),
    add("depart", "接亲车队出发", "男方家 → 女方家", "车队负责人", "请大家按车辆编号上车，所有人系好安全带。路线只听车辆负责人统一通知，现在准备出发。", ["路线图", "司机通讯录", "备用车辆"]),
    add("brideArrive", "抵达女方家", w.brideAddress || "女方家", "女方总管", "我们先向长辈问好，再进行接亲互动。请大家把通道让出来，摄影准备好后新郎再献花。", ["手捧花", "小红包", "胸花"]),
    add("tea", "敬茶、改口与拜别", w.brideAddress || "女方家", "管家", "请父母落座，茶和红包就位。接下来把现场安静下来，把时间留给新人和父母。", ["茶具", "改口红包", "纸巾"]),
  ];
  if (w.customs.includes("上马菜")) rows.push(add("brideLeave", "上马菜与新娘出门", w.brideAddress || "女方家", "女方总管", "上马菜每样象征性尝一口即可。吃完拍全家福，再清出房门到婚车的通道。", ["上马菜", "婚鞋"]));
  if (w.customs.some((x) => ["长命灯", "接箱接被"].includes(x))) rows.push(add("groomArrive", "嫁妆与礼俗交接", w.groomAddress || "男方家", "男方总管", "花车先不要开门，我们按约定顺序逐项交接。上一项完成，我再通知下一项。", ["长命灯", "红皮箱", "喜被", "交接红包"]));
  rows.push(
    add("groomArrive", "新娘下车进门", w.groomAddress || "男方家", "管家", "请亲友往两边让，给新人留出完整通道。新人站稳以后再改口、再进门。", ["红伞", "下车红包", "红毯"]),
    add("hotelArrive", "前往酒店与仪式联排", w.hotel || "宴会酒店", "管家", "到酒店先确认新人、父母和主持人的位置。任何临时增加环节或改时间，请先告诉我。", ["婚戒", "誓言卡", "话筒"]),
    add("ceremony", "婚礼仪式与开席", w.hotel || "宴会酒店", "主持人／管家", "各岗位按确认后的流程就位。仪式结束后按长辈桌优先顺序敬酒。", ["礼金箱", "敬酒托盘", "备用胸花"]),
  );
  return rows;
}

export default function Home() {
  const [tab, setTab] = useState<"clients" | "calendar" | "detail" | "board" | "execute">("clients");
  const [rows, setRows] = useState<Wedding[]>([]);
  const [current, setCurrent] = useState<Wedding | null>(null);
  const [editing, setEditing] = useState<Wedding | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [customDraft, setCustomDraft] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/weddings");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.weddings.map(normalizeWedding));
    } catch { setToast("客户数据暂时无法读取，请稍后重试"); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing || !editing.groom || !editing.bride || !editing.weddingDate) {
      setToast("请先填写新郎、新娘和婚礼日期"); return;
    }
    const payload = { ...editing, schedule: makeSchedule(editing) };
    const response = await fetch("/api/weddings", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) { setToast("保存失败，请检查后重试"); return; }
    const data = await response.json();
    const saved = { ...payload, id: data.wedding.id } as Wedding;
    setCurrent(saved);
    setRows(old => editing.id ? old.map(x => x.id === saved.id ? saved : x) : [...old, saved]);
    setEditing(null); setToast("已同步到客户档案、手机看板和当天执行");
    await load();
  }
  async function persistWedding(updated: Wedding, message: string) {
    if (!updated.id) return;
    const response = await fetch("/api/weddings", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updated) });
    if (!response.ok) { setToast("保存失败，请稍后重试"); return; }
    setCurrent(updated); setRows(old=>old.map(x=>x.id===updated.id?updated:x)); setToast(message);
  }
  function togglePreparation(index: number) {
    if (!current) return;
    const updated = {...current,preparations:current.preparations.map((x,i)=>i===index?{...x,done:!x.done}:x)};
    persistWedding(updated, updated.preparations[index].done ? "已标记准备完成" : "已恢复为待准备");
  }
  function renameCustom(index:number,value:string) {
    if (!editing) return;
    const oldName=editing.customs[index];
    setEditing({...editing,customs:editing.customs.map((x,i)=>i===index?value:x),
      customExecutors:{...editing.customExecutors,[value]:editing.customExecutors[oldName]||"",[oldName]:""}});
  }
  function removeCustom(index:number) {
    if (!editing) return;
    const name=editing.customs[index]; const executors={...editing.customExecutors}; delete executors[name];
    setEditing({...editing,customs:editing.customs.filter((_,i)=>i!==index),customExecutors:executors});
  }
  function addCustom(name:string) {
    if (!editing) return; const value=name.trim();
    if(value&&!editing.customs.includes(value)) setEditing({...editing,customs:[...editing.customs,value],customExecutors:{...editing.customExecutors,[value]:""}});
  }
  function open(w: Wedding) { setCurrent(w); setTab("detail"); }
  function regenerate() {
    if (!current) return;
    const updated = { ...current, schedule: makeSchedule(current) };
    setCurrent(updated); setEditing(updated); setToast("已按开席时间重新生成，点击保存生效");
  }
  const filtered = rows.filter((w) => w.weddingDate.startsWith(month));
  const dates = useMemo(() => new Map(filtered.map((w) => [Number(w.weddingDate.slice(8)), w])), [filtered]);
  const first = new Date(`${month}-01T00:00:00`).getDay();
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();

  return <main className="app-shell manager">
    <header className="topbar"><div className="brand"><span className="brand-mark">囍</span><div><strong>通用婚礼管家</strong><small>客户与执行工作台</small></div></div><button className="add-top" onClick={() => setEditing({ ...blank, contacts: blank.contacts.map(x=>({...x})) })}>＋ 新建客户</button></header>
    <section className="content">
      {tab === "clients" && <>
        <div className="manager-hero"><div><span>婚礼管家工作台</span><h1>客户档案与近期婚礼</h1><p>先建档，再自动生成专属时间表和风俗执行单。</p></div><b>{rows.length}<small>客户</small></b></div>
        <div className="stats"><div><small>本月婚礼</small><strong>{filtered.length} 场</strong></div><div><small>待完善档案</small><strong>{rows.filter(x => !x.hotel || !x.phone).length} 份</strong></div><div><small>最近档期</small><strong>{rows.find(x => x.weddingDate >= new Date().toISOString().slice(0,10))?.weddingDate.slice(5).replace("-","/") || "暂无"}</strong></div></div>
        <div className="list-head"><div><h2>客户列表</h2><p>点击客户进入档案</p></div><button onClick={() => setEditing({ ...blank })}>新增</button></div>
        {loading ? <div className="empty">正在读取客户档案…</div> : rows.length === 0 ? <div className="empty"><b>还没有客户档案</b><p>点击“新建客户”，录入新人、婚期和风俗后即可生成时间表。</p><button onClick={() => setEditing({ ...blank })}>建立第一位客户</button></div> :
        <div className="client-list">{rows.map(w => <button key={w.id} onClick={() => open(w)}><time><b>{w.weddingDate.slice(8)}</b><small>{w.weddingDate.slice(5,7)}月</small></time><div><span>{w.status}</span><strong>{w.groom} & {w.bride}</strong><p>{w.hotel || "酒店待填写"} · {w.phone || "电话待填写"}</p></div><i>›</i></button>)}</div>}
      </>}

      {tab === "calendar" && <section className="page-section">
        <div className="page-heading"><span>档期管理</span><h2>婚礼日历</h2><p>有客户的日期会自动显示，避免重复接单。</p></div>
        <div className="month-switch"><button onClick={() => { const d=new Date(`${month}-01`); d.setMonth(d.getMonth()-1); setMonth(d.toISOString().slice(0,7)); }}>‹</button><strong>{month.slice(0,4)}年 {month.slice(5)}月</strong><button onClick={() => { const d=new Date(`${month}-01`); d.setMonth(d.getMonth()+1); setMonth(d.toISOString().slice(0,7)); }}>›</button></div>
        <div className="calendar"><div className="week">{["日","一","二","三","四","五","六"].map(x=><b key={x}>{x}</b>)}</div><div className="days">{Array.from({length:first}).map((_,i)=><i key={`e${i}`} />)}{Array.from({length:days},(_,i)=>i+1).map(day => { const w=dates.get(day); return <button key={day} className={w?"booked":""} onClick={()=>w&&open(w)}><span>{day}</span>{w&&<small>{w.groom}·{w.bride}</small>}</button>})}</div></div>
        <div className="month-list">{filtered.length ? filtered.map(w=><button key={w.id} onClick={()=>open(w)}><b>{w.weddingDate.slice(5).replace("-","月")}日</b><span>{w.groom} & {w.bride}</span><small>{w.hotel || "酒店待定"}</small></button>) : <div className="empty">本月暂无婚礼档期</div>}</div>
      </section>}

      {tab === "detail" && current && <section className="page-section detail">
        <button className="back" onClick={()=>setTab("clients")}>‹ 返回客户列表</button>
        <div className="profile-head"><span>{current.status}</span><h1>{current.groom} <i>与</i> {current.bride}</h1><p>{current.weddingDate} · {current.banquetTime} 开席</p><div><button onClick={()=>setEditing({...current})}>编辑档案</button><button onClick={()=>setTab("board")}>手机看板</button><button className="primary" onClick={()=>setTab("execute")}>当天执行</button></div></div>
        <div className="info-card"><h3>客户信息</h3><dl><div><dt>联系电话</dt><dd>{current.phone||"待填写"}</dd></div><div><dt>婚宴酒店</dt><dd>{current.hotel||"待填写"}</dd></div><div><dt>男方地址</dt><dd>{current.groomAddress||"待填写"}</dd></div><div><dt>女方地址</dt><dd>{current.brideAddress||"待填写"}</dd></div></dl></div>
        <div className="info-card"><div className="card-title"><h3>婚礼风俗与执行人</h3><button onClick={()=>setEditing({...current})}>调整</button></div><div className="custom-duty-list">{current.customs.map(x=><div key={x}><span>✓ {x}</span><b>{current.customExecutors[x]||"执行人待确认"}</b></div>)}</div></div>
        <div className="info-card"><div className="card-title"><div><h3>双方物品准备提醒</h3><p>{current.preparations.filter(x=>x.done).length}/{current.preparations.length} 项已完成</p></div><button onClick={()=>setEditing({...current})}>编辑清单</button></div>
          <div className="prep-summary">{(["男方","女方"] as const).map(side=><section key={side}><h4>{side}准备</h4>{current.preparations.map((item,index)=>({item,index})).filter(x=>x.item.side===side).map(({item,index})=><label key={`${side}-${item.name}-${index}`} className={item.done?"done":""}><input type="checkbox" checked={item.done} onChange={()=>togglePreparation(index)}/><span><b>{item.name}</b><small>{item.quantity} · {item.owner} · {item.deadline}</small></span></label>)}</section>)}</div>
        </div>
        <div className="info-card"><div className="card-title"><div><h3>专属时间表</h3><p>只使用你填写的关键时间；空白项显示“待确认”</p></div><button onClick={regenerate}>刷新时间表</button></div><div className="mini-schedule">{current.schedule.map(x=><div key={x.time+x.title}><time className={x.time==="待确认"?"pending-time":""}>{x.time}</time><span>{x.title}</span><small>{x.place}</small></div>)}</div>{editing?.id===current.id&&<button className="save-generated" onClick={save}>保存新时间表</button>}</div>
        {current.notes&&<div className="info-card"><h3>客户备注</h3><p className="notes">{current.notes}</p></div>}
      </section>}

      {tab === "board" && current && <section className="page-section board-page">
        <button className="back no-print" onClick={()=>setTab("detail")}>‹ 返回客户档案</button>
        <div className="board-shot-head"><span>通用婚礼管家 · 手机当日看板</span><h1>{current.groom} & {current.bride}</h1><p>{current.weddingDate} · 请以管家当天通知为准</p></div>
        <div className="board">
          <div className="board-head"><b>模块</b><b>项目</b><b>内容</b></div>
          {[
            ["基础信息",[["婚礼日期",current.weddingDate],["婚宴酒店",current.hotel||"待确认"],["开席时间",current.times.ceremony||current.banquetTime||"待确认"]]],
            ["新人信息",[["新郎姓名",current.groom],["新娘姓名",current.bride],["联系电话",current.phone||"待填写"]]],
            ["地址路线",[["男方地址",current.groomAddress||"待填写"],["女方地址",current.brideAddress||"待填写"],["婚车路线",`${current.groomAddress||"男方家"} → ${current.brideAddress||"女方家"} → ${current.groomAddress||"男方家"} → ${current.hotel||"酒店"}`]]],
            ["重点时间",timeFields.map(([key,label])=>[label,current.times[key]||"待确认"])],
            ["婚礼风俗",current.customs.length?current.customs.map((name)=>[name,current.customExecutors[name]||"执行人待确认"]):[["本场风俗","待确认"]]],
            ["男方物品",current.preparations.filter(x=>x.side==="男方").map(x=>[x.name,`${x.done?"已完成":"待准备"} · ${x.owner} · ${x.deadline}`])],
            ["女方物品",current.preparations.filter(x=>x.side==="女方").map(x=>[x.name,`${x.done?"已完成":"待准备"} · ${x.owner} · ${x.deadline}`])],
            ["工作人员",current.contacts.map(c=>[c.role,`${c.name||"待填写"}${c.phone?` · ${c.phone}`:""}${c.arrival?` · ${c.arrival}到岗`:" · 到岗时间待确认"}`])],
            ["备注",[["现场备注",current.notes||"任何时间或环节变化，由婚礼管家统一通知。"]]],
          ].map(([group,items])=><div className="board-group" key={group as string}><div className="group-label">{group as string}</div><div className="group-rows">{(items as string[][]).map(([label,value])=><div className="board-row" key={label}><b>{label}</b><span>{value}</span></div>)}</div></div>)}
        </div>
        <p className="shot-tip no-print">此页已按手机单页整理，可直接长截图发给所有工作人员。</p>
      </section>}

      {tab === "execute" && current && <section className="page-section execute">
        <button className="back" onClick={()=>setTab("detail")}>‹ 返回客户档案</button>
        <div className="wedding-card"><div><span className="eyebrow">{current.weddingDate}</span><h1>{current.groom} <i>与</i> {current.bride}</h1><p>{current.hotel}</p></div><div className="status-pill"><span />执行中</div></div>
        {current.preparations.some(x=>!x.done)&&<div className="execution-reminder"><b>还有 {current.preparations.filter(x=>!x.done).length} 项物品未确认</b><p>{current.preparations.filter(x=>!x.done).slice(0,4).map(x=>`${x.side}：${x.name}（${x.owner}）`).join("；")}</p></div>}
        <div className="custom-execute">{current.customs.map(name=><span key={name}><b>{name}</b>{current.customExecutors[name]||"执行人待确认"}</span>)}</div>
        <div className="execution-list">{current.schedule.map((item,index)=><article key={item.time+item.title} className={done[`${current.id}-${index}`]?"finished":""}><header><time>{item.time}</time><div><small>{item.place}</small><h3>{item.title}</h3></div><button onClick={()=>setDone(old=>({...old,[`${current.id}-${index}`]:!old[`${current.id}-${index}`]}))}>{done[`${current.id}-${index}`]?"已完成":"完成"}</button></header><p><b>管家口令：</b>{item.script}</p><div>{item.items.map(x=><span key={x}>{x}</span>)}</div></article>)}</div>
      </section>}
    </section>

    <nav className="bottom-nav manager-nav no-print"><button className={tab==="clients"?"active":""} onClick={()=>setTab("clients")}><i>客</i><span>客户</span></button><button className={tab==="calendar"?"active":""} onClick={()=>setTab("calendar")}><i>期</i><span>档期</span></button><button className={["detail","board","execute"].includes(tab)?"active":""} onClick={()=>current?setTab("detail"):setTab("clients")}><i>案</i><span>当前档案</span></button></nav>

    {editing && <div className="modal-backdrop"><section className="form-sheet"><div className="sheet-top"><div><span>{editing.id?"编辑客户":"新建客户"}</span><h2>婚礼信息建档</h2></div><button onClick={()=>setEditing(null)}>×</button></div>
      <div className="form-grid"><label>新郎姓名<input value={editing.groom} onChange={e=>setEditing({...editing,groom:e.target.value})} placeholder="必填"/></label><label>新娘姓名<input value={editing.bride} onChange={e=>setEditing({...editing,bride:e.target.value})} placeholder="必填"/></label><label>婚礼日期<input type="date" value={editing.weddingDate} onChange={e=>setEditing({...editing,weddingDate:e.target.value})}/></label><label>开席时间<input type="time" value={editing.banquetTime} onChange={e=>setEditing({...editing,banquetTime:e.target.value})}/></label><label className="wide">客户电话<input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} placeholder="新人主要联系电话"/></label><label className="wide">婚宴酒店<input value={editing.hotel} onChange={e=>setEditing({...editing,hotel:e.target.value})} placeholder="酒店及厅名"/></label><label className="wide">男方地址<input value={editing.groomAddress} onChange={e=>setEditing({...editing,groomAddress:e.target.value})}/></label><label className="wide">女方地址<input value={editing.brideAddress} onChange={e=>setEditing({...editing,brideAddress:e.target.value})}/></label></div>
      <h3>填写关键时间 <small>不知道的先留空，不会自动猜测</small></h3><div className="time-inputs">{timeFields.map(([key,label])=><label key={key}><span>{label}</span><input type="time" value={editing.times[key]||""} onChange={e=>setEditing({...editing,times:{...editing.times,[key]:e.target.value}})}/></label>)}</div>
      <h3>本场婚礼风俗 <small>名称、执行人都可以修改</small></h3><div className="editable-customs">{editing.customs.map((name,index)=><div key={`${index}`}><input value={name} aria-label={`风俗${index+1}`} onChange={e=>renameCustom(index,e.target.value)}/><input value={editing.customExecutors[name]||""} list="executor-options" aria-label={`${name}执行人`} placeholder="谁来执行，如女方上头奶奶" onChange={e=>setEditing({...editing,customExecutors:{...editing.customExecutors,[name]:e.target.value}})}/><button onClick={()=>removeCustom(index)}>删除</button></div>)}</div>
      <datalist id="executor-options"><option value="男方上头奶奶"/><option value="女方上头奶奶"/><option value="管家"/><option value="男方总管"/><option value="女方总管"/><option value="伴郎"/><option value="伴娘"/><option value="喜婆婆"/><option value="送亲兄弟／抱箱人"/></datalist>
      <div className="add-custom"><input value={customDraft} onChange={e=>setCustomDraft(e.target.value)} placeholder="输入新的风俗名称"/><button onClick={()=>{addCustom(customDraft);setCustomDraft("");}}>＋ 添加风俗</button></div>
      <div className="preset-customs"><span>手册常用风俗：</span>{customs.filter(([name])=>!editing.customs.includes(name)).map(([name])=><button key={name} onClick={()=>addCustom(name)}>＋{name}</button>)}</div>
      <h3>男方、女方物品准备清单 <small>写清谁负责、何时完成</small></h3><div className="prep-editor">{editing.preparations.map((item,index)=><div key={`${item.side}-${index}`}><select value={item.side} onChange={e=>setEditing({...editing,preparations:editing.preparations.map((x,i)=>i===index?{...x,side:e.target.value as "男方"|"女方"}:x)})}><option>男方</option><option>女方</option></select><input value={item.name} placeholder="物品或菜品" onChange={e=>setEditing({...editing,preparations:editing.preparations.map((x,i)=>i===index?{...x,name:e.target.value}:x)})}/><input value={item.quantity} placeholder="数量／规格" onChange={e=>setEditing({...editing,preparations:editing.preparations.map((x,i)=>i===index?{...x,quantity:e.target.value}:x)})}/><input value={item.owner} placeholder="负责人" onChange={e=>setEditing({...editing,preparations:editing.preparations.map((x,i)=>i===index?{...x,owner:e.target.value}:x)})}/><input value={item.deadline} placeholder="最晚完成时间" onChange={e=>setEditing({...editing,preparations:editing.preparations.map((x,i)=>i===index?{...x,deadline:e.target.value}:x)})}/><label><input type="checkbox" checked={item.done} onChange={e=>setEditing({...editing,preparations:editing.preparations.map((x,i)=>i===index?{...x,done:e.target.checked}:x)})}/>完成</label><button onClick={()=>setEditing({...editing,preparations:editing.preparations.filter((_,i)=>i!==index)})}>×</button></div>)}<button className="add-staff" onClick={()=>setEditing({...editing,preparations:[...editing.preparations,{side:"男方",name:"",quantity:"",owner:"",deadline:"",done:false}]})}>＋ 添加准备事项</button></div>
      <h3>参与婚礼的工作人员 <small>固定岗位＋其他自定义岗位</small></h3><div className="staff-inputs">{editing.contacts.map((contact,index)=><div key={`${contact.role}-${index}`}><input value={contact.role} aria-label="岗位" readOnly={index<defaultContacts.length} className={index<defaultContacts.length?"fixed-role":""} onChange={e=>setEditing({...editing,contacts:editing.contacts.map((c,i)=>i===index?{...c,role:e.target.value}:c)})}/><input value={contact.name} aria-label={`${contact.role}姓名`} placeholder="姓名／团队" onChange={e=>setEditing({...editing,contacts:editing.contacts.map((c,i)=>i===index?{...c,name:e.target.value}:c)})}/><input value={contact.phone} aria-label={`${contact.role}电话`} placeholder="联系电话" onChange={e=>setEditing({...editing,contacts:editing.contacts.map((c,i)=>i===index?{...c,phone:e.target.value}:c)})}/><input type="time" value={contact.arrival||""} aria-label={`${contact.role}到岗时间`} onChange={e=>setEditing({...editing,contacts:editing.contacts.map((c,i)=>i===index?{...c,arrival:e.target.value}:c)})}/>{index>=defaultContacts.length&&<button onClick={()=>setEditing({...editing,contacts:editing.contacts.filter((_,i)=>i!==index)})}>×</button>}</div>)}<button className="add-staff" onClick={()=>setEditing({...editing,contacts:[...editing.contacts,{role:"其他岗位",name:"",phone:"",arrival:""}]})}>＋ 添加其他工作人员</button></div>
      <label className="notes-input">备注<textarea value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})} placeholder="双方家庭特别要求、禁忌、未确认事项……"/></label>
      <button className="done-button" onClick={save}>保存并生成婚礼时间表</button><p className="flex-note">生成时间仅作执行参考，可根据路程、吉时和现场情况随时调整。</p>
    </section></div>}
    {toast&&<div className="toast">{toast}</div>}
  </main>;
}
