/* global React, Card, Button, Pill, Tile, Icon, Avatar */
function LessonPlayer({ courseId, go }) {
  const D = window.ILMHUB_DATA;
  const course = D.courses.find(c => String(c.id) === String(courseId)) || D.courses[0];
  const flat = [];
  D.curriculum.forEach(m => m.lessons.forEach(l => flat.push({ ...l, module: m.module })));
  const [idx, setIdx] = React.useState(flat.findIndex(l => l.active) || 0);
  const current = flat[idx] || flat[0];

  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(34);

  return (
    <div className="grid" style={{gridTemplateColumns:"1fr 360px", gap:20}}>
      <div className="col gap-5">
        {/* Breadcrumb */}
        <div className="center gap-3 small">
          <a href="#browse" onClick={e=>{e.preventDefault();go("browse");}} style={{color:"var(--fg-3)", fontWeight:600}}>Kurslar</a>
          <Icon name="chevron-right" size={12} color="var(--ilm-muted)" />
          <a href={"#course:"+course.id} onClick={e=>{e.preventDefault();go("course", course.id);}} style={{color:"var(--fg-3)", fontWeight:600}}>{course.title}</a>
        </div>

        {/* Video */}
        <div style={{position:"relative", aspectRatio:"16/9", background:"var(--ilm-ink)", borderRadius:24, overflow:"hidden"}}>
          {/* faux scene */}
          <div style={{position:"absolute", inset:0, background:"radial-gradient(circle at 30% 40%, rgba(255,255,255,0.04), transparent 60%)"}} />
          <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <button onClick={()=>setPlaying(p=>!p)} style={{
              width:84, height:84, borderRadius:999, background:"rgba(255,255,255,0.95)", border:0, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Icon name={playing?"pause":"play"} size={32} />
            </button>
          </div>
          {/* code-on-blackboard placeholder */}
          <div style={{position:"absolute", top:24, left:32, color:"rgba(255,255,255,0.55)", fontFamily:"ui-monospace, SF Mono, monospace", fontSize:13, lineHeight:1.6}}>
            <div>// {current.title}</div>
            <div style={{color:"rgba(255,255,255,0.85)"}}>const ilm = (sen) =&gt; sen + "+1";</div>
            <div>ilm("o'rganish");</div>
          </div>
          {/* control bar */}
          <div style={{position:"absolute", left:0, right:0, bottom:0, padding:"16px 24px", background:"linear-gradient(transparent, rgba(0,0,0,0.55))", display:"flex", alignItems:"center", gap:14, color:"#fff"}}>
            <button onClick={()=>setPlaying(p=>!p)} style={{background:"transparent", border:0, color:"#fff", cursor:"pointer"}}>
              <Icon name={playing?"pause":"play"} size={22} />
            </button>
            <div style={{flex:1, height:6, background:"rgba(255,255,255,0.18)", borderRadius:999, position:"relative"}}>
              <div style={{height:"100%", width: progress + "%", background:"#fff", borderRadius:999}} />
              <input type="range" min="0" max="100" value={progress} onChange={e=>setProgress(+e.target.value)} style={{position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%"}}/>
            </div>
            <div style={{fontSize:12, fontWeight:600, opacity:0.85}}>05:48 / {current.dur}</div>
            <Icon name="volume-2" size={20} />
            <Icon name="settings" size={20} />
            <Icon name="maximize" size={20} />
          </div>
        </div>

        {/* Lesson meta */}
        <div className="between">
          <div className="col gap-2">
            <div className="eyebrow">{current.module}</div>
            <h1 className="h2">{current.title}</h1>
          </div>
          <div className="center gap-3">
            <Button variant="secondary" icon="arrow-left" size="sm" onClick={()=>setIdx(Math.max(0, idx-1))}>Oldingi</Button>
            <Button variant="primary" iconAfter="arrow-right" size="sm" onClick={()=>setIdx(Math.min(flat.length-1, idx+1))}>Keyingi dars</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="center gap-1" style={{borderBottom:"1px solid var(--ilm-border)", paddingBottom:0}}>
          <Tab active>Tavsif</Tab>
          <Tab>Resurslar</Tab>
          <Tab>Savol-javob <span style={{marginLeft:6, fontSize:11, padding:"2px 6px", borderRadius:999, background:"var(--ilm-surface)", fontWeight:700}}>12</span></Tab>
          <Tab>Eslatmalarim</Tab>
        </div>

        <Card surface style={{borderRadius:20, padding:24}}>
          <p className="body" style={{color:"var(--fg-1)", fontWeight:500}}>
            Bu darsda biz shartli operatorlarning uchta asosiy formasini — <b>if</b>, <b>else if</b>, <b>switch</b> — ko'rib chiqamiz.
            Har bir holatda qachon qaysi birini ishlatish samaraliroq ekanini misol bilan tushuntiramiz.
          </p>
          <div className="grid" style={{gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginTop:18}}>
            <Resource icon="file-text" name="Slaydlar.pdf" size="2.4 MB" />
            <Resource icon="code" name="Misollar.zip" size="864 KB" />
            <Resource icon="file-check-2" name="Topshiriq.md" size="12 KB" />
          </div>
        </Card>
      </div>

      {/* Side: lesson list */}
      <div className="col gap-3" style={{position:"sticky", top:24, height:"fit-content"}}>
        <Card style={{borderRadius:20, padding:18}}>
          <div className="between" style={{marginBottom:8}}>
            <div className="h4">Dasturlar</div>
            <Pill>{flat.filter(l=>l.done).length} / {flat.length}</Pill>
          </div>
          <div className="col" style={{maxHeight:520, overflowY:"auto"}}>
            {D.curriculum.map((m, i) => (
              <div key={i} className="col gap-1" style={{padding:"10px 0", borderTop: i===0 ? "0" : "1px solid var(--ilm-border)"}}>
                <div className="small" style={{fontWeight:700, color:"var(--fg-1)", padding:"4px 0"}}>{m.module}</div>
                {m.lessons.map((l, j) => {
                  const fi = flat.findIndex(x=>x.title===l.title);
                  const isCurrent = fi === idx;
                  return (
                    <div key={j} onClick={()=>setIdx(fi)} className="center gap-3" style={{
                      padding:"10px 12px", borderRadius:12, cursor:"pointer",
                      background: isCurrent ? "var(--ilm-ink)" : "transparent",
                      color: isCurrent ? "#fff" : "var(--ilm-ink)",
                    }}>
                      <span style={{
                        width:22, height:22, borderRadius:999,
                        background: l.done ? "var(--ilm-success)" : isCurrent ? "rgba(255,255,255,0.18)" : "var(--ilm-border)",
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        {l.done ? <Icon name="check" size={11} color="#fff"/> : <Icon name="play" size={10} color={isCurrent?"#fff":"var(--fg-2)"}/>}
                      </span>
                      <div style={{flex:1, fontSize:13, fontWeight: isCurrent?700:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{l.title}</div>
                      <div style={{fontSize:11, fontWeight:600, opacity: isCurrent?0.7:0.5}}>{l.dur}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Tab({ active, children }) {
  return <button style={{
    background:"transparent", border:0, padding:"12px 16px", fontFamily:"inherit",
    fontSize:14, fontWeight: active ? 700 : 600, color: active ? "var(--ilm-ink)" : "var(--fg-3)",
    borderBottom: "2px solid " + (active ? "var(--ilm-ink)" : "transparent"),
    marginBottom: -1, cursor:"pointer",
  }}>{children}</button>;
}

function Resource({ icon, name, size }) {
  return <div className="center gap-3" style={{padding:"12px 14px", background:"#fff", borderRadius:14, boxShadow:"var(--shadow-xs)"}}>
    <Tile size="sm" icon={icon} />
    <div className="col" style={{lineHeight:1.2, flex:1}}>
      <div style={{fontWeight:700, fontSize:13}}>{name}</div>
      <div className="small">{size}</div>
    </div>
    <Icon name="download" size={16} color="var(--ilm-muted)" />
  </div>;
}

window.LessonPlayer = LessonPlayer;
