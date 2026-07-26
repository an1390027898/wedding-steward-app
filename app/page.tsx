"use client";

import { useEffect, useMemo, useState } from "react";

type Stage = {
  id: string;
  time: string;
  title: string;
  place: string;
  owner: string;
  phone: string;
  status: "done" | "active" | "pending";
  steps: string[];
  items: string[];
  script: string;
  warning?: string;
};

const initialStages: Stage[] = [
  {
    id: "gather",
    time: "06:30",
    title: "人员集合与物品点验",
    place: "男方家",
    owner: "婚礼管家",
    phone: "138 0000 1101",
    status: "done",
    steps: ["伴郎展示手捧花、戒指、胸花、红伞和红包", "伴娘确认新娘随身包和长命灯", "车辆负责人点名司机与乘员"],
    items: ["手捧花", "婚戒", "红伞", "分类红包", "车辆表"],
    script: "大家先别急着走。伴郎把花、戒指、胸花、红伞和红包拿出来给我看；伴娘确认随身包和长命灯；车辆负责人现在点名。缺什么马上说。",
  },
  {
    id: "depart",
    time: "07:00",
    title: "接亲队伍出发",
    place: "男方家 → 女方家",
    owner: "车辆负责人",
    phone: "138 0000 1102",
    status: "active",
    steps: ["按车辆编号上车", "向女方总管发送预计到达时间", "全员系好安全带后出发"],
    items: ["路线图", "备用路线", "司机通讯录"],
    script: "人员和物品已经齐了，准备出发。请大家按车辆编号上车，司机只认车辆负责人的路线通知。所有人系好安全带，我们平安去、准时到。",
    warning: "不抢行、不别车；掉队车辆自行导航，不要追车。",
  },
  {
    id: "bride-home",
    time: "07:30",
    title: "到女方家、见新娘",
    place: "女方家",
    owner: "女方总管",
    phone: "138 0000 2201",
    status: "pending",
    steps: ["先向长辈问好，再进行接亲互动", "控制游戏时间", "摄影准备好后新郎献花"],
    items: ["喜糖", "小红包", "手捧花", "胸花"],
    script: "新郎已经到新娘家。我们先向长辈问好，再去见新娘；游戏控制在约定时间内。摄影准备好以后，新郎再献花，其他人给新人留出位置。",
  },
  {
    id: "tea-farewell",
    time: "08:00",
    title: "女方敬茶、装车与拜别",
    place: "女方家",
    owner: "婚礼管家",
    phone: "138 0000 1101",
    status: "pending",
    steps: ["父母落座，茶和红包到位", "敬茶时搬运组同步装车", "拜别时清场并提醒摄影收音"],
    items: ["茶具", "改口红包", "嫁妆清单", "纸巾"],
    script: "下面做女方家的核心礼节。父母先坐好，茶和红包就位；敬茶时搬运组同步装车。拜别时请大家安静一点，把时间留给新人和父母。",
  },
  {
    id: "bride-depart",
    time: "08:38",
    title: "上马菜与新娘出门",
    place: "女方家门口",
    owner: "女方上头奶奶",
    phone: "138 0000 2202",
    status: "pending",
    steps: ["上马菜每样象征性尝一口", "拍全家福", "清出房门到婚车的通道", "换鞋后安全上车"],
    items: ["上马菜", "红伞", "婚鞋", "提鞋红包"],
    script: "上马菜每样尝一口就可以，不催吃、不多拍。吃完先拍全家福，然后清出门口到婚车的通道。红伞、婚鞋和提鞋红包现在全部到位。",
  },
  {
    id: "handoff",
    time: "09:20",
    title: "接灯、接箱、接被",
    place: "男方家门前",
    owner: "男方总管",
    phone: "138 0000 3301",
    status: "pending",
    steps: ["长命灯先交接并送入新房", "红皮箱与钥匙交接", "棉被枕头按清单进房"],
    items: ["长命灯", "红皮箱", "箱子钥匙", "棉被枕头", "交接礼"],
    script: "花车先别开门，门口也不要围人。我们一项一项交接：先把长命灯送进新房，再交红皮箱和钥匙，最后接被子。上一项办完，我再叫下一项。",
  },
  {
    id: "enter",
    time: "09:38",
    title: "新娘下车进门",
    place: "男方家",
    owner: "婚礼管家",
    phone: "138 0000 1101",
    status: "pending",
    steps: ["清空下车与进门通道", "新郎撑伞，伴娘照顾裙摆", "下车改口后新人先进门"],
    items: ["红伞", "下车红包", "红毯", "年糕"],
    script: "门口已经准备好。请亲友往两边让，给新人留出完整通道。伴娘看好裙摆，新郎撑好红伞，新娘慢慢下车；站稳以后再改口、再进门。",
  },
  {
    id: "hotel",
    time: "11:38",
    title: "酒店仪式与开席",
    place: "宴会酒店",
    owner: "主持人 / 婚礼管家",
    phone: "138 0000 4401",
    status: "pending",
    steps: ["确认新人、父母和主持人的位置", "主持、督导、音响最终联排", "礼金组双人到岗", "仪式后按长辈桌优先敬酒"],
    items: ["婚戒", "誓言卡", "话筒", "礼金箱", "敬酒托盘"],
    script: "到酒店以后，先确认新人、父母和主持人的位置，再开仪式。礼金组两个人同时在岗；敬酒按长辈桌优先。任何加环节、改时间，都先告诉我。",
  },
];

const contacts = [
  ["婚礼管家", "安宁", "138 0000 1101"],
  ["男方总管", "张叔", "138 0000 3301"],
  ["女方总管", "李姨", "138 0000 2201"],
  ["车辆负责人", "王师傅", "138 0000 1102"],
  ["主持人", "陈老师", "138 0000 4401"],
  ["摄影摄像", "光影团队", "138 0000 5501"],
];

const boardGroups = [
  ["基础信息", [["婚礼日期", "2026年10月3日"], ["宴会酒店", "赣榆海州湾宴会中心 · 百合厅"]]],
  ["新人信息", [["新郎姓名", "张承"], ["新郎电话", "138 0000 0011"], ["新娘姓名", "李悦"], ["新娘电话", "138 0000 0022"], ["婚礼管家", "安宁 · 138 0000 1101"]]],
  ["婚车路线", [["婚车路线", "男方家 → 女方家 → 男方家 → 酒店"]]],
  ["地址信息", [["男方地址", "赣榆区青口镇示范路18号"], ["女方地址", "赣榆区沙河镇幸福路26号"], ["酒店地址", "赣榆区海城路88号"]]],
  ["婚纱礼服", [["新郎", "黑色西装"], ["新娘", "秀禾服 / 主纱 / 敬酒服"]]],
  ["亲友到达时间", [["接亲人员", "06:30"], ["送亲人员", "08:20"], ["伴郎", "06:20"], ["伴娘", "05:40"]]],
  ["重点时间", [["出发接亲", "07:00 出发，预计07:30到女方家"], ["新娘发嫁", "08:38 发嫁，预计09:20到男方家"]]],
  ["工作人员抵达时间", [["男方化妆师", "06:00"], ["女方化妆师", "05:30"], ["男方摄影摄像", "06:00"], ["女方摄像", "05:30"], ["婚礼管家", "06:10"], ["女方摄影", "05:30"], ["车队集合", "06:30"]]],
  ["备注", [["备注", "各团队提前安排到场时间；任何临时变化由婚礼管家统一同步。"]]],
] as const;

export default function Home() {
  const [tab, setTab] = useState<"home" | "board" | "timeline" | "contacts">("home");
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ganyu-wedding-demo");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.stages) setStages(parsed.stages);
        if (parsed.checked) setChecked(parsed.checked);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ganyu-wedding-demo", JSON.stringify({ stages, checked }));
  }, [stages, checked]);

  const active = useMemo(() => stages.find((s) => s.status === "active") ?? stages.find((s) => s.status === "pending") ?? stages[stages.length - 1], [stages]);
  const activeIndex = stages.findIndex((s) => s.id === active.id);
  const next = stages[activeIndex + 1];
  const doneCount = stages.filter((s) => s.status === "done").length;
  const current = stages.find((s) => s.id === selected);

  function markDone(id: string) {
    setStages((old) => old.map((s, index) => {
      const target = old.findIndex((x) => x.id === id);
      if (index <= target) return { ...s, status: "done" };
      if (index === target + 1) return { ...s, status: "active" };
      return s.status === "done" ? s : { ...s, status: "pending" };
    }));
    setSelected(null);
    setToast("已完成，下一环节已经接棒");
    setTimeout(() => setToast(""), 2200);
  }

  function updateScript(id: string, script: string) {
    setStages((old) => old.map((s) => s.id === id ? { ...s, script } : s));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">囍</span>
          <div><strong>赣榆婚礼管家</strong><small>当天执行台</small></div>
        </div>
        <button className="ghost-btn" onClick={() => { localStorage.removeItem("ganyu-wedding-demo"); setStages(initialStages); setChecked({}); }}>重置演示</button>
      </header>

      <section className="content">
        {tab === "home" && (
          <>
            <div className="wedding-card">
              <div>
                <span className="eyebrow">2026年10月3日 · 星期六</span>
                <h1>张承 <i>与</i> 李悦</h1>
                <p>赣榆海州湾宴会中心 · 百合厅</p>
              </div>
              <div className="status-pill"><span />时间正常</div>
            </div>

            <div className="progress-wrap">
              <div className="progress-label"><span>今日进度</span><strong>{doneCount}/{stages.length}</strong></div>
              <div className="progress"><span style={{ width: `${(doneCount / stages.length) * 100}%` }} /></div>
            </div>

            <article className="now-card">
              <div className="now-head"><span>正在进行</span><time>{active.time}</time></div>
              <div className="now-body">
                <p className="place">{active.place}</p>
                <h2>{active.title}</h2>
                <p className="owner">负责人：{active.owner}</p>
                <div className="now-actions">
                  <button className="primary" onClick={() => setSelected(active.id)}>打开执行卡</button>
                  <button className="complete" onClick={() => markDone(active.id)}>标记完成</button>
                </div>
              </div>
            </article>

            {next && <button className="next-card" onClick={() => setSelected(next.id)}>
              <div><span>下一步 · {next.time}</span><strong>{next.title}</strong><small>{next.place}</small></div>
              <b>›</b>
            </button>}

            <div className="section-title"><h3>现场快捷入口</h3><span>单手就能找到</span></div>
            <div className="quick-grid">
              <button onClick={() => setTab("board")}><i>看</i><span>手机看板</span><small>人车地址</small></button>
              <button onClick={() => setTab("timeline")}><i>时</i><span>全部流程</span><small>时间轴</small></button>
              <button onClick={() => setTab("contacts")}><i>联</i><span>联系人</span><small>一键拨号</small></button>
              <button onClick={() => setSelected(active.id)}><i>词</i><span>当前口令</span><small>可编辑</small></button>
            </div>

            <div className="alert-strip"><span>!</span><div><strong>现场提醒</strong><p>任何临时增加环节或改变时间，先通知婚礼管家。</p></div></div>
          </>
        )}

        {tab === "board" && (
          <section className="page-section">
            <div className="page-heading"><span>单页手机看板</span><h2>婚礼时间日程表</h2><p>沿用执行清单中的字段顺序</p></div>
            <div className="board">
              <div className="board-head"><b>模块</b><b>项目</b><b>内容</b></div>
              {boardGroups.map(([group, rows]) => (
                <div className="board-group" key={group}>
                  <div className="group-label">{group}</div>
                  <div className="group-rows">
                    {rows.map(([label, value]) => <div className="board-row" key={label}><b>{label}</b><span>{value}</span></div>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "timeline" && (
          <section className="page-section">
            <div className="page-heading"><span>按约定时间推进</span><h2>当天时间轴</h2><p>时间可以调整，但只由管家统一通知</p></div>
            <div className="timeline">
              {stages.map((stage) => <button key={stage.id} className={`timeline-item ${stage.status}`} onClick={() => setSelected(stage.id)}>
                <time>{stage.time}</time><i /><div><span>{stage.status === "done" ? "已完成" : stage.status === "active" ? "进行中" : "待开始"}</span><strong>{stage.title}</strong><small>{stage.place} · {stage.owner}</small></div><b>›</b>
              </button>)}
            </div>
          </section>
        )}

        {tab === "contacts" && (
          <section className="page-section">
            <div className="page-heading"><span>关键人员</span><h2>现场通讯录</h2><p>先找负责人，不在大群里反复问</p></div>
            <div className="contact-list">
              {contacts.map(([role, name, phone]) => <a href={`tel:${phone.replace(/\s/g, "")}`} key={role}><span>{name.slice(0, 1)}</span><div><small>{role}</small><strong>{name}</strong><p>{phone}</p></div><b>拨号</b></a>)}
            </div>
          </section>
        )}
      </section>

      <nav className="bottom-nav">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><i>今</i><span>今天</span></button>
        <button className={tab === "board" ? "active" : ""} onClick={() => setTab("board")}><i>看</i><span>看板</span></button>
        <button className={tab === "timeline" ? "active" : ""} onClick={() => setTab("timeline")}><i>序</i><span>流程</span></button>
        <button className={tab === "contacts" ? "active" : ""} onClick={() => setTab("contacts")}><i>人</i><span>联系</span></button>
      </nav>

      {current && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
        <section className="stage-sheet">
          <div className="sheet-grabber" />
          <div className="sheet-top"><div><span>{current.time} · {current.place}</span><h2>{current.title}</h2></div><button onClick={() => setSelected(null)}>×</button></div>
          <a className="owner-card" href={`tel:${current.phone.replace(/\s/g, "")}`}><div><small>本环节负责人</small><strong>{current.owner}</strong><span>{current.phone}</span></div><b>立即联系</b></a>
          <h3>照着做</h3>
          <ol className="steps">{current.steps.map((step, i) => <li key={step}><span>{i + 1}</span><p>{step}</p></li>)}</ol>
          <h3>物品点验</h3>
          <div className="checks">{current.items.map((item) => {
            const key = `${current.id}-${item}`;
            return <label key={item} className={checked[key] ? "checked" : ""}><input type="checkbox" checked={!!checked[key]} onChange={(e) => setChecked((old) => ({ ...old, [key]: e.target.checked }))} /><span>{item}</span></label>;
          })}</div>
          <h3>管家现场口令 <small>自动保存在本机</small></h3>
          <textarea value={current.script} onChange={(e) => updateScript(current.id, e.target.value)} aria-label="管家现场口令" />
          {current.warning && <div className="warning"><b>安全提醒</b><p>{current.warning}</p></div>}
          <button className="done-button" onClick={() => markDone(current.id)}>完成本环节，进入下一步</button>
        </section>
      </div>}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
