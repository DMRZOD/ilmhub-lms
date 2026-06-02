/* global React, Icon */
function Sidebar({ route, go }) {
  const items = [
    { key: "home",    label: "Bosh sahifa",      icon: "house" },
    { key: "browse",  label: "Kurslar",          icon: "graduation-cap" },
    { key: "my",      label: "Mening kurslarim", icon: "book-open" },
    { key: "certs",   label: "Sertifikatlar",    icon: "award" },
    { key: "mentor",  label: "Mentorlar",        icon: "users-round" },
    { key: "messages",label: "Xabarlar",         icon: "mail" },
  ];
  const bottom = [
    { key: "settings", label: "Sozlamalar", icon: "settings" },
    { key: "signout",  label: "Chiqish",    icon: "log-out" },
  ];
  return (
    <aside className="rail">
      <a className="rail__logo" href="#home" onClick={(e)=>{e.preventDefault();go("home");}} title="IlmHub">i.</a>
      {items.map(it => (
        <div key={it.key}
          className={"rail__item " + (route === it.key ? "active" : "")}
          onClick={() => go(it.key)} title={it.label}>
          <Icon name={it.icon} size={20} />
        </div>
      ))}
      <div className="rail__spacer" />
      {bottom.map(it => (
        <div key={it.key} className="rail__item" title={it.label}
          onClick={() => it.key === "signout" ? go("signin") : null}>
          <Icon name={it.icon} size={20} />
        </div>
      ))}
    </aside>
  );
}

function TopBar({ go, withMascot = false, query, setQuery }) {
  return (
    <div className="topbar">
      <div className="topbar__search">
        <Field icon="search" pill placeholder="Kurslar yoki mentorlar..." value={query||""} onChange={e=>setQuery&&setQuery(e.target.value)} />
      </div>
      <div style={{flex:1}} />
      <div className="topbar__bell" title="Bildirishnomalar">
        <Icon name="bell" size={20} />
        <span className="dot" />
      </div>
      <div className="center gap-3" style={{padding:"4px 14px 4px 4px", borderRadius:999, background:"var(--ilm-surface)", flexShrink:0}}>
        <Avatar initials="AK" size="sm" ink />
        <div className="col" style={{lineHeight:1.15}}>
          <div style={{fontSize:13, fontWeight:700}}>Aziz K.</div>
          <div style={{fontSize:11, color:"var(--fg-3)", fontWeight:500}}>Talaba</div>
        </div>
        <Icon name="chevron-down" size={16} color="var(--ilm-muted)" />
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, TopBar });
