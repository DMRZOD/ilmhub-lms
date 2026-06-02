/* global React, Card, Pill, Button, Tile, Icon, Avatar, Progress, Mascot */
function Home({ go }) {
  const D = window.ILMHUB_DATA;
  const inProgress = D.courses.filter(c => c.progress > 0 && c.progress < 100).slice(0, 2);
  const upcoming = D.upcoming;
  const max = Math.max(...D.learningHours.map(p => p.h));
  return (
    <div className="col gap-6">
      {/* Hello card */}
      <div className="grid" style={{gridTemplateColumns:"1.4fr 1fr 1fr", gap:16}}>
        <Card surface style={{padding:"28px 32px", display:"flex", alignItems:"center", gap:24, borderRadius:24}}>
          <div className="col gap-2" style={{flex:1}}>
            <h2 className="h2">Salom, Aziz</h2>
            <p className="body">Kursingiz haqida umumiy ko'rinish. Bugun ham bir qadam oldinda bo'ling.</p>
          </div>
          <Mascot size={108} />
        </Card>
        <Card style={{padding:24, display:"flex", alignItems:"center", gap:18, borderRadius:24}}>
          <div className="h1" style={{fontSize:48}}>{D.user.coursesCompleted}</div>
          <div className="col" style={{lineHeight:1.2}}>
            <div style={{fontWeight:700}}>Kurslar</div>
            <div className="small">tugatildi</div>
          </div>
        </Card>
        <Card style={{padding:24, display:"flex", alignItems:"center", gap:18, borderRadius:24}}>
          <div className="h1" style={{fontSize:48}}>{D.user.coursesInProgress}</div>
          <div className="col" style={{lineHeight:1.2}}>
            <div style={{fontWeight:700}}>Kurslar</div>
            <div className="small">jarayonda</div>
          </div>
        </Card>
      </div>

      {/* Continue learning + Daily progress */}
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr 0.9fr", gap:16}}>
        {inProgress.map(c => (
          <Card key={c.id} hoverable surface onClick={()=>go("course", c.id)} style={{cursor:"pointer", borderRadius:24}}>
            <div className="between" style={{marginBottom:18}}>
              <Tile size="md" color={c.color} text={c.text} icon={c.icon} />
              <Pill tone="ink">★ {c.rating}</Pill>
            </div>
            <h3 className="h4" style={{marginBottom:6}}>{c.title}</h3>
            <div className="small" style={{marginBottom:18}}>{c.author}</div>
            <Progress value={c.progress} />
            <div className="between" style={{marginTop:10, fontSize:12, color:"var(--fg-3)", fontWeight:600}}>
              <span>{Math.round(c.lessons * c.progress / 100)} / {c.lessons} dars</span>
              <span>{c.progress}%</span>
            </div>
          </Card>
        ))}
        <Card style={{borderRadius:24, padding:24, display:"flex", flexDirection:"column", gap:14}}>
          <div className="between">
            <div className="h4">Kunlik maqsad</div>
            <Pill tone="success" icon="flame">9 kun</Pill>
          </div>
          {D.categories.slice(0,3).map((c,i)=>(
            <div key={c.id} className="between" style={{padding:"10px 14px", background:i===0?"var(--ilm-surface)":"transparent", borderRadius:12}}>
              <div className="center gap-3"><Icon name={c.icon} size={18} color="var(--fg-2)"/><span style={{fontWeight:600, fontSize:14}}>{c.name}</span></div>
              <Icon name="chevron-right" size={16} color="var(--ilm-muted)"/>
            </div>
          ))}
        </Card>
      </div>

      {/* Statistics + Upcoming */}
      <div className="grid" style={{gridTemplateColumns:"1.4fr 1fr", gap:16}}>
        <Card surface style={{borderRadius:24, padding:28}}>
          <div className="between" style={{marginBottom:24}}>
            <div className="col gap-2">
              <div className="h3">Statistika</div>
              <div className="center gap-4">
                <span style={{fontWeight:700}}>O'qish soatlari</span>
                <span className="muted" style={{fontWeight:600}}>Kurslarim</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" iconAfter="chevron-down">Haftalik</Button>
          </div>
          <LineChart data={D.learningHours} max={max} />
        </Card>
        <Card style={{borderRadius:24, padding:28}}>
          <div className="between" style={{marginBottom:20}}>
            <div className="h3">Yaqinlashayotgan</div>
            <Button variant="ghost" size="sm" iconAfter="arrow-right" onClick={()=>go("browse")}>Barchasi</Button>
          </div>
          <div className="col gap-3">
            {upcoming.map((u,i)=>(
              <div key={i} className="center gap-3" style={{padding:"12px 14px", background:"var(--ilm-surface)", borderRadius:14}}>
                <Tile size="sm" icon={u.icon} />
                <div className="col" style={{flex:1, lineHeight:1.2}}>
                  <div style={{fontWeight:700, fontSize:14}}>{u.title}</div>
                  <div className="small">{u.time}</div>
                </div>
                <Icon name="chevron-right" size={16} color="var(--ilm-muted)" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Premium upsell */}
      <Card style={{background:"var(--ilm-ink)", color:"#fff", borderRadius:24, padding:28, display:"flex", gap:24, alignItems:"center"}}>
        <div className="col gap-3" style={{flex:1}}>
          <Pill tone="ink" style={{background:"rgba(255,255,255,0.10)", color:"#fff"}}>Pro</Pill>
          <div className="h2" style={{color:"#fff"}}>Mentor bilan o'rganing</div>
          <p className="body" style={{color:"rgba(255,255,255,0.7)", maxWidth:520}}>
            Haftada 4 ta jonli mashg'ulot, shaxsiy yo'l xaritasi va sertifikat. Oyiga $19 dan.
          </p>
        </div>
        <Button variant="secondary" size="lg" iconAfter="arrow-right" style={{background:"#fff", color:"#0A0A0A", boxShadow:"none"}}>Boshlash</Button>
      </Card>
    </div>
  );
}

function LineChart({ data, max }) {
  const W = 560, H = 180, P = 20;
  const xs = data.map((_, i) => P + (i * (W - 2*P)) / (data.length - 1));
  const ys = data.map(d => H - P - (d.h / (max || 5)) * (H - 2*P - 16));
  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  // smooth path via Catmull-Rom -> Bezier
  const smooth = (() => {
    let d = `M${xs[0]},${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i - 1] ?? xs[i], y0 = ys[i - 1] ?? ys[i];
      const x1 = xs[i],     y1 = ys[i];
      const x2 = xs[i + 1], y2 = ys[i + 1];
      const x3 = xs[i + 2] ?? x2, y3 = ys[i + 2] ?? y2;
      const cp1x = x1 + (x2 - x0) / 6, cp1y = y1 + (y2 - y0) / 6;
      const cp2x = x2 - (x3 - x1) / 6, cp2y = y2 - (y3 - y1) / 6;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }
    return d;
  })();
  return (
    <div style={{width:"100%", overflow:"hidden"}}>
      <svg viewBox={`0 0 ${W} ${H+28}`} width="100%" preserveAspectRatio="none" style={{maxHeight:240}}>
        {[1,2,3,4].map(i => {
          const y = P + i * (H - 2*P) / 5;
          return <line key={i} x1={P} x2={W-P} y1={y} y2={y} stroke="var(--ilm-border)" strokeDasharray="2 4" />;
        })}
        <path d={smooth} fill="none" stroke="var(--ilm-ink)" strokeWidth="2.5" strokeLinecap="round" />
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r="4" fill="#0A0A0A" />
            <rect x={x-18} y={ys[i]-26} rx="6" width="36" height="18" fill="#0A0A0A" />
            <text x={x} y={ys[i]-13} fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle">{data[i].h}h</text>
            <text x={x} y={H+18} fill="var(--fg-3)" fontSize="11" fontWeight="600" textAnchor="middle">{data[i].d}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

window.Home = Home;
