/* global React, Card, Button, Pill, Tile, Icon, Avatar, Progress */
function CourseDetail({ courseId, go }) {
  const D = window.ILMHUB_DATA;
  const course = D.courses.find(c => String(c.id) === String(courseId)) || D.courses[0];
  const [openModule, setOpenModule] = React.useState(1);

  const totalLessons = D.curriculum.reduce((n, m) => n + m.lessons.length, 0);
  const doneLessons = D.curriculum.reduce((n, m) => n + m.lessons.filter(l=>l.done).length, 0);

  return (
    <div className="col gap-6">
      <div className="center gap-3 small">
        <a href="#browse" onClick={(e)=>{e.preventDefault();go("browse");}} style={{color:"var(--fg-3)", fontWeight:600}}>Kurslar</a>
        <Icon name="chevron-right" size={12} color="var(--ilm-muted)" />
        <span style={{fontWeight:600, color:"var(--fg-2)"}}>{D.categories.find(c=>c.id===course.category)?.name}</span>
        <Icon name="chevron-right" size={12} color="var(--ilm-muted)" />
        <span style={{fontWeight:600, color:"var(--fg-1)"}}>{course.title}</span>
      </div>

      <div className="grid" style={{gridTemplateColumns:"1.6fr 1fr", gap:20}}>
        {/* Hero */}
        <Card style={{borderRadius:24, padding:32, display:"flex", flexDirection:"column", gap:20}}>
          <div className="center gap-4">
            <Tile size="lg" color={course.color} text={course.text} icon={course.icon} />
            <div className="col gap-2" style={{flex:1}}>
              <Pill>{D.categories.find(c=>c.id===course.category)?.name} · {course.level}</Pill>
              <h1 className="h1" style={{fontSize:40}}>{course.title}</h1>
            </div>
          </div>
          <p className="body" style={{fontSize:16, color:"var(--fg-2)", maxWidth:680}}>
            Bu kursda siz {course.title.toLowerCase()} bo'yicha asoslarni, ilg'or texnikalarni va real loyihalarni amalda o'rganasiz.
            Har bir modul oxirida amaliy topshiriq va mentor bilan suhbat bor.
          </p>
          <div className="flex gap-3" style={{flexWrap:"wrap"}}>
            <Pill icon="star">{course.rating} reyting</Pill>
            <Pill icon="users">{course.students} talaba</Pill>
            <Pill icon="clock">{course.hours}</Pill>
            <Pill icon="book-open">{course.lessons} dars</Pill>
            <Pill icon="award">Sertifikat</Pill>
          </div>
        </Card>

        {/* Buy card */}
        <Card style={{borderRadius:24, padding:28, position:"sticky", top:24, display:"flex", flexDirection:"column", gap:18}}>
          <div className="col gap-2">
            <div className="small" style={{textDecoration:"line-through"}}>${course.price + 30}</div>
            <div className="h1" style={{fontSize:48}}>${course.price}</div>
            <Pill tone="success" icon="badge-percent">25% chegirma · 2 kun</Pill>
          </div>
          {course.progress > 0 && course.progress < 100 && (
            <div className="col gap-2">
              <Progress value={course.progress} />
              <div className="between small"><span>{doneLessons} / {totalLessons} dars</span><span style={{fontWeight:700, color:"var(--fg-1)"}}>{course.progress}%</span></div>
            </div>
          )}
          <Button variant="primary" size="lg" iconAfter="arrow-right" onClick={()=>go("lesson", course.id)}>
            {course.progress > 0 && course.progress < 100 ? "Davom etish" : course.progress === 100 ? "Sertifikatni ko'rish" : "Sotib olish"}
          </Button>
          <Button variant="secondary" icon="play">Tanishuv darsini ko'rish</Button>
          <div className="col gap-2" style={{paddingTop:8, borderTop:"1px solid var(--ilm-border)"}}>
            <Bullet icon="infinity">Umrbod kirish</Bullet>
            <Bullet icon="monitor-smartphone">Mobil va kompyuterda</Bullet>
            <Bullet icon="file-down">Yuklab olinadigan resurslar</Bullet>
            <Bullet icon="message-square">Mentor bilan savol-javob</Bullet>
          </div>
        </Card>
      </div>

      {/* Instructor strip */}
      <Card surface style={{borderRadius:24, padding:24, display:"flex", alignItems:"center", gap:20}}>
        <Avatar initials={course.authorInitials} size="lg" />
        <div className="col gap-1" style={{flex:1}}>
          <div className="eyebrow">Mentor</div>
          <div className="h3">{course.author}</div>
          <div className="small">Senior Engineer · 8 yillik tajriba · 12 ta kurs</div>
        </div>
        <div className="flex gap-6" style={{paddingRight:16}}>
          <Stat n="4.9" l="Reyting" />
          <Stat n="3.2k" l="Talabalar" />
          <Stat n="12" l="Kurslar" />
        </div>
        <Button variant="secondary">Profilni ko'rish</Button>
      </Card>

      {/* Curriculum */}
      <div className="col gap-3">
        <div className="between">
          <div className="h2">Dastur</div>
          <div className="small">{totalLessons} ta dars · {course.hours}</div>
        </div>
        <div className="col gap-2">
          {D.curriculum.map((m, i) => {
            const open = openModule === i;
            const done = m.lessons.filter(l=>l.done).length;
            return (
              <Card key={i} style={{borderRadius:20, padding:0, overflow:"hidden"}}>
                <div onClick={()=>setOpenModule(open?-1:i)} style={{cursor:"pointer", padding:"20px 24px", display:"flex", alignItems:"center", gap:16}}>
                  <Tile size="sm" ink={done===m.lessons.length} icon={done===m.lessons.length?"check":"layers"} />
                  <div className="col" style={{flex:1, lineHeight:1.3}}>
                    <div style={{fontWeight:700, fontSize:16}}>{m.module}</div>
                    <div className="small">{m.lessons.length} dars · {m.duration}{done > 0 && ` · ${done} / ${m.lessons.length} tugatildi`}</div>
                  </div>
                  <Icon name={open?"chevron-up":"chevron-down"} size={20} color="var(--ilm-muted)" />
                </div>
                {open && (
                  <div className="col" style={{padding:"4px 16px 16px"}}>
                    {m.lessons.map((l, j) => (
                      <div key={j} className="center gap-3" style={{
                        padding:"12px 14px", borderRadius:12,
                        background: l.active ? "var(--ilm-surface)" : "transparent",
                      }}>
                        <span style={{
                          width:28, height:28, borderRadius:999,
                          background: l.done ? "var(--ilm-success)" : "var(--ilm-border)",
                          color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          {l.done ? <Icon name="check" size={14} color="#fff"/> : <Icon name="play" size={12} color="var(--fg-2)"/>}
                        </span>
                        <div style={{flex:1, fontWeight: l.active ? 700 : 600, fontSize:14}}>{l.title}</div>
                        <div className="small" style={{color:"var(--fg-3)"}}>{l.dur}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Bullet({ icon, children }) {
  return <div className="center gap-3" style={{fontSize:14, fontWeight:500, color:"var(--fg-2)"}}>
    <Icon name={icon} size={16} color="var(--ilm-muted)" />{children}
  </div>;
}
function Stat({ n, l }) {
  return <div className="col" style={{lineHeight:1.1}}>
    <div style={{fontSize:20, fontWeight:800, letterSpacing:"-0.01em"}}>{n}</div>
    <div className="small">{l}</div>
  </div>;
}

window.CourseDetail = CourseDetail;
