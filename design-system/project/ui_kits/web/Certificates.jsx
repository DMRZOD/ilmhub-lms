/* global React, Card, Button, Pill, Tile, Icon, Avatar */
function Certificates({ go }) {
  const D = window.ILMHUB_DATA;
  const completed = D.courses.filter(c => c.progress === 100);
  return (
    <div className="col gap-6">
      <div className="between">
        <div className="col gap-2">
          <div className="eyebrow">Sertifikatlar</div>
          <h1 className="h1">Mening yutuqlarim</h1>
          <p className="body">Tugatilgan kurslar uchun rasmiy sertifikatlaringiz.</p>
        </div>
        <div className="center gap-3">
          <Pill tone="success" icon="award">{completed.length} ta sertifikat</Pill>
          <Button variant="secondary" icon="share-2">Profil ulanmasi</Button>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:"repeat(2, 1fr)", gap:20}}>
        {completed.map(c => (
          <div key={c.id} className="col gap-3">
            <div style={{
              aspectRatio: "1.6 / 1", background: "var(--ilm-paper)", borderRadius: 22,
              padding: 28, position:"relative", boxShadow:"var(--shadow-sm)",
              display:"flex", flexDirection:"column", justifyContent:"space-between",
              backgroundImage: "radial-gradient(circle at 0 100%, var(--ilm-surface), transparent 40%)",
            }}>
              <div className="between">
                <div className="center gap-3">
                  <div style={{width:36, height:36, borderRadius:10, background:"var(--ilm-ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:22, letterSpacing:"-0.06em", lineHeight:1}}>i.</div>
                  <div className="col" style={{lineHeight:1.1}}>
                    <div style={{fontWeight:800, letterSpacing:"-0.025em", display:"inline-flex", alignItems:"baseline", gap:2}}>
                      IlmHub
                      <svg width="8" height="10" viewBox="0 0 16 22" fill="none" style={{transform:"translateY(-5px)"}}>
                        <path d="M2 13 L8 5 L14 13" stroke="#0A0A0A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="small">Sertifikat</div>
                  </div>
                </div>
                <Icon name="badge-check" size={28} />
              </div>
              <div className="col gap-2">
                <div className="eyebrow">Tugatildi</div>
                <div className="h2" style={{fontSize:24}}>{c.title}</div>
                <div className="small">{c.author} · {c.hours}</div>
              </div>
              <div className="between" style={{paddingTop:10, borderTop:"1px dashed var(--ilm-border)"}}>
                <div className="col" style={{lineHeight:1.2}}>
                  <div className="small">Kim uchun</div>
                  <div style={{fontWeight:700}}>Aziz Karimov</div>
                </div>
                <div className="col" style={{lineHeight:1.2}}>
                  <div className="small">ID</div>
                  <div style={{fontWeight:700, fontFamily:"ui-monospace, monospace", fontSize:12}}>ILM-{(8000+c.id).toString(36).toUpperCase()}</div>
                </div>
              </div>
            </div>
            <div className="between">
              <div className="center gap-3">
                <Tile size="sm" color={c.color} text={c.text} icon={c.icon} />
                <div className="col" style={{lineHeight:1.2}}>
                  <div style={{fontWeight:700, fontSize:14}}>{c.title}</div>
                  <div className="small">Berildi: 14 Mart 2025</div>
                </div>
              </div>
              <div className="center gap-2">
                <Button variant="ghost" size="sm" icon="download">Yuklash</Button>
                <Button variant="primary" size="sm" icon="share-2">Ulashish</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Certificates = Certificates;
