/* global React, Card, Button, Pill, Tile, Icon, Avatar, Progress */
function Browse({ go, query = "" }) {
  const D = window.ILMHUB_DATA;
  const [cat, setCat] = React.useState("all");
  const [sort, setSort] = React.useState("popular");

  let courses = D.courses.filter(c => cat === "all" || c.category === cat);
  if (query.trim()) {
    const q = query.toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q));
  }
  if (sort === "rating") courses = [...courses].sort((a,b)=>b.rating-a.rating);
  if (sort === "students") courses = [...courses].sort((a,b)=>b.students-a.students);

  return (
    <div className="col gap-6">
      <div className="between">
        <div className="col gap-2">
          <div className="eyebrow">Katalog</div>
          <h1 className="h1">Kurslar</h1>
          <p className="body" style={{maxWidth:520}}>Texnologiya bo'yicha mutaxassis bo'ling — boshlang'ichdan yuqori darajagacha.</p>
        </div>
        <div className="center gap-3">
          <Button variant="secondary" icon="sliders-horizontal">Filtrlar</Button>
          <Button variant="primary" icon="bookmark-plus">Saqlanganlar</Button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-3" style={{overflowX:"auto", paddingBottom:4}}>
        <CategoryChip active={cat==="all"} onClick={()=>setCat("all")} label="Barchasi" count={D.courses.length} icon="grid-2x2" />
        {D.categories.map(c => (
          <CategoryChip key={c.id} active={cat===c.id} onClick={()=>setCat(c.id)} label={c.name} count={c.count} icon={c.icon} />
        ))}
      </div>

      <div className="between">
        <div className="body" style={{color:"var(--fg-1)", fontWeight:600}}>{courses.length} ta kurs topildi</div>
        <div className="center gap-2">
          <SortChip active={sort==="popular"} onClick={()=>setSort("popular")}>Mashhur</SortChip>
          <SortChip active={sort==="rating"} onClick={()=>setSort("rating")}>Reyting</SortChip>
          <SortChip active={sort==="students"} onClick={()=>setSort("students")}>Talabalar</SortChip>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:"repeat(3, 1fr)", gap:20}}>
        {courses.map(c => (
          <Card key={c.id} hoverable onClick={()=>go("course", c.id)} style={{cursor:"pointer", borderRadius:24, padding:16, display:"flex", flexDirection:"column", gap:14}}>
            <CourseCover course={c} />
            <div className="col gap-2" style={{padding:"4px 8px 0"}}>
              <h3 className="h4">{c.title}</h3>
              <div className="center gap-2">
                <Avatar initials={c.authorInitials} size="sm" />
                <span className="small" style={{fontWeight:600, color:"var(--fg-2)"}}>{c.author}</span>
              </div>
            </div>
            <div className="flex gap-2" style={{flexWrap:"wrap", padding:"0 8px"}}>
              <Pill icon="star">{c.rating}</Pill>
              <Pill icon="users">{c.students}</Pill>
              <Pill icon="clock">{c.hours}</Pill>
            </div>
            <div className="between" style={{marginTop:2, padding:"0 8px 8px"}}>
              <div className="h3">${c.price}</div>
              <Button variant="primary" size="sm" iconAfter="arrow-right">
                {c.progress > 0 && c.progress < 100 ? "Davom etish" : c.progress === 100 ? "Ko'rib chiqish" : "Sotib olish"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CourseCover({ course }) {
  const c = course;
  const dark = c.text === "#fff" || c.color === "#0A0A0A";
  return (
    <div style={{
      position:"relative", aspectRatio:"16 / 9", borderRadius:16, overflow:"hidden",
      background: c.color,
    }}>
      {/* placeholder cross-hair to signal "image goes here" when no color */}
      {(c.color === "#F5F5F5" || !c.color) && (
        <div style={{position:"absolute", inset:0, backgroundImage:
          "linear-gradient(135deg, transparent 49.4%, var(--ilm-border) 49.4%, var(--ilm-border) 50.6%, transparent 50.6%), linear-gradient(45deg, transparent 49.4%, var(--ilm-border) 49.4%, var(--ilm-border) 50.6%, transparent 50.6%)"
        }} />
      )}
      <div style={{position:"absolute", top:12, left:12, width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.9)", color:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, letterSpacing:"-0.04em"}}>i.</div>
      <div style={{position:"absolute", top:12, right:12, width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Icon name="bookmark" size={14} color="#0A0A0A" />
      </div>
      <div style={{position:"absolute", bottom:12, left:12, padding:"4px 10px", borderRadius:999, background: c.progress>0 && c.progress<100 ? "rgba(255,255,255,0.95)" : "rgba(10,10,10,0.85)", color: c.progress>0 && c.progress<100 ? "#0A0A0A" : "#fff", fontSize:11, fontWeight:600}}>
        {c.progress>0 && c.progress<100 ? `${c.progress}% tugatildi` : c.progress===100 ? "Tugatildi" : c.hours}
      </div>
      <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Icon name={c.icon} size={48} color={dark ? "rgba(255,255,255,0.85)" : "rgba(10,10,10,0.85)"} stroke={1.5} />
      </div>
    </div>
  );
}

function CategoryChip({ active, label, count, icon, onClick }) {
  return (
    <button onClick={onClick} className={"btn btn--" + (active ? "primary" : "ghost")} style={{
      whiteSpace:"nowrap",
      background: active ? "var(--ilm-ink)" : "var(--ilm-surface)",
      color: active ? "#fff" : "var(--ilm-ink)",
      height: 44, borderRadius: 999, padding: "0 18px", fontWeight: 600, fontSize: 14, border: 0,
    }}>
      <Icon name={icon} size={16} />
      {label}
      <span style={{marginLeft:4, opacity:active?0.7:0.5, fontWeight:700, fontSize:12}}>{count}</span>
    </button>
  );
}

function SortChip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--ilm-ink)" : "transparent",
      color: active ? "#fff" : "var(--fg-2)",
      border: 0, height: 36, padding: "0 14px", borderRadius: 999,
      fontFamily:"inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
    }}>{children}</button>
  );
}

window.Browse = Browse;
