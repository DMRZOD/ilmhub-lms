/* global React, Card, Button, Field, Pill, Mascot, Icon */
function SignIn({ go }) {
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  return (
    <div style={{minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr", background:"var(--ilm-paper)"}}>
      <div style={{background:"var(--ilm-ink)", color:"#fff", padding:"56px", display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
        <div className="center gap-3">
          <div style={{width:44, height:44, borderRadius:14, background:"#fff", color:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:28, letterSpacing:"-0.06em", lineHeight:1}}>i.</div>
          <div style={{fontWeight:800, fontSize:22, letterSpacing:"-0.025em", display:"inline-flex", alignItems:"baseline", gap:2}}>
            IlmHub
            <svg width="10" height="13" viewBox="0 0 16 22" fill="none" style={{transform:"translateY(-7px)"}}>
              <path d="M2 13 L8 5 L14 13" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="col gap-4">
          <div style={{filter:"invert(1)"}}><Mascot size={160} /></div>
          <Pill tone="ink" style={{background:"rgba(255,255,255,0.10)", color:"#fff"}}>Bugun</Pill>
          <h1 style={{fontSize:56, fontWeight:800, letterSpacing:"-0.02em", lineHeight:1.05, color:"#fff", margin:0, maxWidth:480}}>
            Kelajak kasbingizni bugun o'rganing.
          </h1>
          <p style={{fontSize:16, color:"rgba(255,255,255,0.7)", maxWidth:420, lineHeight:1.55, fontWeight:500}}>
            48,000+ talaba IT yo'lini IlmHub bilan boshlagan. Sora ham unga qo'shilsangiz.
          </p>
        </div>
        <div className="flex gap-6" style={{paddingTop:16, color:"rgba(255,255,255,0.6)"}}>
          <Stat n="48k+" l="Talabalar" />
          <Stat n="320+" l="Kurslar" />
          <Stat n="120+" l="Mentorlar" />
        </div>
      </div>

      <div style={{padding:"56px", display:"flex", flexDirection:"column", justifyContent:"center", maxWidth:560}}>
        <div className="col gap-2" style={{marginBottom:32}}>
          <div className="eyebrow">Xush kelibsiz</div>
          <h2 className="h1" style={{fontSize:40}}>Hisobingizga kiring</h2>
          <p className="body">Yoki <a href="#signin" className="ilm-link">yangi hisob yarating</a>.</p>
        </div>
        <div className="col gap-3" style={{marginBottom:8}}>
          <Button variant="secondary" icon="globe" size="lg">Google bilan davom etish</Button>
          <Button variant="secondary" icon="github" size="lg">GitHub bilan davom etish</Button>
        </div>
        <div className="center gap-3" style={{margin:"16px 0"}}>
          <div style={{flex:1, height:1, background:"var(--ilm-border)"}}/>
          <span className="small">yoki email orqali</span>
          <div style={{flex:1, height:1, background:"var(--ilm-border)"}}/>
        </div>
        <div className="col gap-3">
          <div className="col gap-2">
            <label className="eyebrow">Email</label>
            <Field icon="mail" placeholder="siz@misol.uz" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="col gap-2">
            <div className="between">
              <label className="eyebrow">Parol</label>
              <a href="#signin" className="ilm-link" style={{fontSize:12}}>Unutdingizmi?</a>
            </div>
            <Field icon="lock" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} />
          </div>
        </div>
        <Button variant="primary" size="lg" iconAfter="arrow-right" style={{marginTop:20}} onClick={()=>go("home")}>Kirish</Button>
        <p className="small" style={{marginTop:18}}>
          Davom etib, siz <a href="#" className="ilm-link">foydalanish shartlari</a> va <a href="#" className="ilm-link">maxfiylik siyosati</a> ga roziligingizni bildirasiz.
        </p>
      </div>
    </div>
  );
}

function Stat({n,l}){return<div className="col" style={{lineHeight:1.1}}><div style={{fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"-0.01em"}}>{n}</div><div style={{fontSize:12, fontWeight:600}}>{l}</div></div>;}

window.SignIn = SignIn;
