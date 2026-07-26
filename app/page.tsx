"use client";

import { useEffect, useMemo, useState } from "react";

type ScheduleItem = { time: string; title: string; place: string; owner: string; script: string; items: string[] };
type Wedding = {
  id?: number; groom: string; bride: string; weddingDate: string; banquetTime: string; status: string;
  phone: string; hotel: string; groomAddress: string; brideAddress: string; notes: string;
  customs: string[]; schedule: ScheduleItem[]; contacts: { role: string; name: string; phone: string }[];
};

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
  schedule: [], contacts: [{ role: "婚礼管家", name: "安宁", phone: "" }],
};

function minutes(value: string) { const [h, m] = value.split(":").map(Number); return h * 60 + m; }
function clock(value: number) { const n = (value + 1440) % 1440; return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`; }
function makeSchedule(w: Wedding): ScheduleItem[] {
  const banquet = minutes(w.banquetTime || "11:38");
  const add = (offset: number, title: string, place: string, owner: string, script: string, items: string[]) =>
    ({ time: clock(banquet + offset), title, place, owner, script, items });
  const rows = [
    add(-318, "人员集合与物品点验", w.groomAddress || "男方家", "婚礼管家", "大家先不要急着出发。请按清单把花、戒指、红包和车辆逐项给我确认，缺少的现在马上说。", ["手捧花", "婚戒", "分类红包", "车辆表"]),
    add(-288, "接亲车队出发", "男方家 → 女方家", "车辆负责人", "请大家按车辆编号上车，所有人系好安全带。路线只听车辆负责人统一通知，现在准备出发。", ["路线图", "司机通讯录", "备用车辆"]),
    add(-258, "抵达女方家", w.brideAddress || "女方家", "女方总管", "我们先向长辈问好，再进行接亲互动。请大家把通道让出来，摄影准备好后新郎再献花。", ["手捧花", "小红包", "胸花"]),
    add(-218, "敬茶、改口与拜别", w.brideAddress || "女方家", "婚礼管家", "请父母落座，茶和红包就位。接下来把现场安静下来，把时间留给新人和父母。", ["茶具", "改口红包", "纸巾"]),
  ];
  if (w.customs.includes("上马菜")) rows.push(add(-198, "上马菜与新娘出门", w.brideAddress || "女方家", "女方总管", "上马菜每样象征性尝一口即可。吃完拍全家福，再清出房门到婚车的通道。", ["上马菜", "婚鞋"]));
  if (w.customs.some((x) => ["长命灯", "接箱接被"].includes(x))) rows.push(add(-138, "嫁妆与礼俗交接", w.groomAddress || "男方家", "男方总管", "花车先不要开门，我们按约定顺序逐项交接。上一项完成，我再通知下一项。", ["长命灯", "红皮箱", "喜被", "交接红包"]));
  rows.push(
    add(-120, "新娘下车进门", w.groomAddress || "男方家", "婚礼管家", "请亲友往两边让，给新人留出完整通道。新人站稳以后再改口、再进门。", ["红伞", "下车红包", "红毯"]),
    add(-60, "前往酒店与仪式联排", w.hotel || "宴会酒店", "婚礼管家", "到酒店先确认新人、父母和主持人的位置。任何临时增加环节或改时间，请先告诉我。", ["婚戒", "誓言卡", "话筒"]),
    add(0, "婚礼仪式与开席", w.hotel || "宴会酒店", "主持人／婚礼管家", "各岗位按确认后的流程就位。仪式结束后按长辈桌优先顺序敬酒。", ["礼金箱", "敬酒托盘", "备用胸花"]),
  );
  return rows.sort((a, b) => a.time.localeCompare(b.time));
}

export default function Home() {
  const [tab, setTab] = useState<"clients" | "calendar" | "detail" | "execute">("clients");
  const [rows, setRows] = useState<Wedding[]>([]);
  const [current, setCurrent] = useState<Wedding | null>(null);
  const [editing, setEditing] = useState<Wedding | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/weddings");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.weddings);
    } catch { setToast("客户数据暂时无法读取，请稍后重试"); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing || !editing.groom || !editing.bride || !editing.weddingDate) {
      setToast("请先填写新郎、新娘和婚礼日期"); return;
    }
    const payload = { ...editing, schedule: editing.schedule.length ? editing.schedule : makeSchedule(editing) };
    const response = await fetch("/api/weddings", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) { setToast("保存失败，请检查后重试"); return; }
    setEditing(null); setToast("客户档案已保存"); await load();
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
    <header className="topbar"><div className="brand"><span className="brand-mark">囍</span><div><strong>赣榆婚礼管家</strong><small>客户与执行工作台</small></div></div><button className="add-top" onClick={() => setEditing({ ...blank })}>＋ 新建客户</button></header>
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
        <div className="profile-head"><span>{current.status}</span><h1>{current.groom} <i>与</i> {current.bride}</h1><p>{current.weddingDate} · {current.banquetTime} 开席</p><div><button onClick={()=>setEditing({...current})}>编辑档案</button><button className="primary" onClick={()=>setTab("execute")}>进入当天执行</button></div></div>
        <div className="info-card"><h3>客户信息</h3><dl><div><dt>联系电话</dt><dd>{current.phone||"待填写"}</dd></div><div><dt>婚宴酒店</dt><dd>{current.hotel||"待填写"}</dd></div><div><dt>男方地址</dt><dd>{current.groomAddress||"待填写"}</dd></div><div><dt>女方地址</dt><dd>{current.brideAddress||"待填写"}</dd></div></dl></div>
        <div className="info-card"><div className="card-title"><h3>赣榆婚礼风俗</h3><button onClick={()=>setEditing({...current})}>调整</button></div><div className="custom-tags">{current.customs.map(x=><span key={x}>✓ {x}</span>)}</div></div>
        <div className="info-card"><div className="card-title"><div><h3>专属时间表</h3><p>以 {current.banquetTime} 开席倒推，可现场调整</p></div><button onClick={regenerate}>重新生成</button></div><div className="mini-schedule">{current.schedule.map(x=><div key={x.time+x.title}><time>{x.time}</time><span>{x.title}</span><small>{x.place}</small></div>)}</div>{editing?.id===current.id&&<button className="save-generated" onClick={save}>保存新时间表</button>}</div>
        {current.notes&&<div className="info-card"><h3>客户备注</h3><p className="notes">{current.notes}</p></div>}
      </section>}

      {tab === "execute" && current && <section className="page-section execute">
        <button className="back" onClick={()=>setTab("detail")}>‹ 返回客户档案</button>
        <div className="wedding-card"><div><span className="eyebrow">{current.weddingDate}</span><h1>{current.groom} <i>与</i> {current.bride}</h1><p>{current.hotel}</p></div><div className="status-pill"><span />执行中</div></div>
        <div className="execution-list">{current.schedule.map((item,index)=><article key={item.time+item.title} className={done[`${current.id}-${index}`]?"finished":""}><header><time>{item.time}</time><div><small>{item.place}</small><h3>{item.title}</h3></div><button onClick={()=>setDone(old=>({...old,[`${current.id}-${index}`]:!old[`${current.id}-${index}`]}))}>{done[`${current.id}-${index}`]?"已完成":"完成"}</button></header><p><b>管家口令：</b>{item.script}</p><div>{item.items.map(x=><span key={x}>{x}</span>)}</div></article>)}</div>
      </section>}
    </section>

    <nav className="bottom-nav manager-nav"><button className={tab==="clients"?"active":""} onClick={()=>setTab("clients")}><i>客</i><span>客户</span></button><button className={tab==="calendar"?"active":""} onClick={()=>setTab("calendar")}><i>期</i><span>档期</span></button><button className={tab==="detail"||tab==="execute"?"active":""} onClick={()=>current?setTab("detail"):setTab("clients")}><i>案</i><span>当前档案</span></button></nav>

    {editing && <div className="modal-backdrop"><section className="form-sheet"><div className="sheet-top"><div><span>{editing.id?"编辑客户":"新建客户"}</span><h2>婚礼信息建档</h2></div><button onClick={()=>setEditing(null)}>×</button></div>
      <div className="form-grid"><label>新郎姓名<input value={editing.groom} onChange={e=>setEditing({...editing,groom:e.target.value})} placeholder="必填"/></label><label>新娘姓名<input value={editing.bride} onChange={e=>setEditing({...editing,bride:e.target.value})} placeholder="必填"/></label><label>婚礼日期<input type="date" value={editing.weddingDate} onChange={e=>setEditing({...editing,weddingDate:e.target.value})}/></label><label>开席时间<input type="time" value={editing.banquetTime} onChange={e=>setEditing({...editing,banquetTime:e.target.value})}/></label><label className="wide">客户电话<input value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} placeholder="新人主要联系电话"/></label><label className="wide">婚宴酒店<input value={editing.hotel} onChange={e=>setEditing({...editing,hotel:e.target.value})} placeholder="酒店及厅名"/></label><label className="wide">男方地址<input value={editing.groomAddress} onChange={e=>setEditing({...editing,groomAddress:e.target.value})}/></label><label className="wide">女方地址<input value={editing.brideAddress} onChange={e=>setEditing({...editing,brideAddress:e.target.value})}/></label></div>
      <h3>选择本场婚礼风俗</h3><div className="custom-select">{customs.map(([name,desc])=><label key={name} className={editing.customs.includes(name)?"selected":""}><input type="checkbox" checked={editing.customs.includes(name)} onChange={e=>setEditing({...editing,customs:e.target.checked?[...editing.customs,name]:editing.customs.filter(x=>x!==name)})}/><span><b>{name}</b><small>{desc}</small></span></label>)}</div>
      <label className="notes-input">备注<textarea value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})} placeholder="双方家庭特别要求、禁忌、未确认事项……"/></label>
      <button className="done-button" onClick={save}>保存并生成婚礼时间表</button><p className="flex-note">生成时间仅作执行参考，可根据路程、吉时和现场情况随时调整。</p>
    </section></div>}
    {toast&&<div className="toast">{toast}</div>}
  </main>;
}
