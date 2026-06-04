import { useState, useEffect, useRef } from "react";

// ── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:        "#030d0d",
  surface:   "#071414",
  card:      "#0a1f1f",
  border:    "rgba(45,200,160,.12)",
  borderHov: "rgba(45,200,160,.25)",
  primary:   "#2dc8a0",
  primaryDim:"rgba(45,200,160,.15)",
  primaryGlow:"rgba(45,200,160,.35)",
  accent:    "#0ff4c6",
  accentDim: "rgba(15,244,198,.1)",
  teal2:     "#14b8a6",
  teal3:     "#0d9488",
  text:      "#e2faf6",
  textMid:   "#6db8a8",
  textDim:   "#2a5550",
  mono:      "'DM Mono',monospace",
  serif:     "'DM Serif Display',serif",
  sans:      "'DM Sans',sans-serif",
};

// ── DATA ─────────────────────────────────────────────────────────────────────
const MEDICINES = [
  {id:1,name:"Amoxicillin",type:"Antibiotic",manufacturer:"GlaxoSmithKline"},
  {id:2,name:"Ibuprofen",type:"Analgesic",manufacturer:"Pfizer"},
  {id:3,name:"Paracetamol",type:"Analgesic",manufacturer:"Johnson & Johnson"},
  {id:4,name:"Metformin",type:"Antidiabetic",manufacturer:"Novartis"},
  {id:5,name:"Lisinopril",type:"ACE Inhibitor",manufacturer:"AstraZeneca"},
  {id:6,name:"Atorvastatin",type:"Statin",manufacturer:"Pfizer"},
  {id:7,name:"Omeprazole",type:"PPI",manufacturer:"AstraZeneca"},
  {id:8,name:"Azithromycin",type:"Antibiotic",manufacturer:"Pfizer"},
  {id:9,name:"Salbutamol",type:"Bronchodilator",manufacturer:"GSK"},
  {id:10,name:"Cetirizine",type:"Antihistamine",manufacturer:"UCB"},
];
const SPECS = ["Cardiology","Neurology","Orthopedics","Pediatrics","Dermatology","General Practice","Gynecology","ENT"];
const BLOOD = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const SEED = {
  users:[
    {id:1,name:"Dr. Fatima Malik",email:"fatima@hapms.pk",role:"doctor",phone:"+92-300-1111111"},
    {id:2,name:"Dr. Usman Tariq",email:"usman@hapms.pk",role:"doctor",phone:"+92-300-2222222"},
    {id:3,name:"Dr. Ayesha Raza",email:"ayesha@hapms.pk",role:"doctor",phone:"+92-300-3333333"},
    {id:4,name:"Ahmed Khan",email:"ahmed@gmail.com",role:"patient",phone:"+92-321-4444444"},
    {id:5,name:"Sara Hussain",email:"sara@gmail.com",role:"patient",phone:"+92-321-5555555"},
    {id:6,name:"Bilal Chaudhry",email:"bilal@gmail.com",role:"patient",phone:"+92-321-6666666"},
    {id:7,name:"Zara Qureshi",email:"zara@gmail.com",role:"patient",phone:"+92-321-7777777"},
  ],
  doctors:[
    {id:1,userId:1,specialization:"Cardiology",licenseNo:"PMC-11001",availStart:"08:00",availEnd:"17:00"},
    {id:2,userId:2,specialization:"Neurology",licenseNo:"PMC-11002",availStart:"09:00",availEnd:"18:00"},
    {id:3,userId:3,specialization:"General Practice",licenseNo:"PMC-11003",availStart:"08:00",availEnd:"16:00"},
  ],
  patients:[
    {id:1,userId:4,dob:"1990-04-15",bloodGroup:"O+",medHistory:"No significant history"},
    {id:2,userId:5,dob:"1985-09-22",bloodGroup:"A+",medHistory:"Hypertension, controlled"},
    {id:3,userId:6,dob:"1978-12-01",bloodGroup:"B+",medHistory:"Type 2 diabetes since 2018"},
    {id:4,userId:7,dob:"1995-03-08",bloodGroup:"AB+",medHistory:"Seasonal allergies"},
  ],
  appointments:[
    {id:1,patientId:1,doctorId:1,scheduledAt:"2025-05-20 10:00:00",status:"completed",notes:"Chest pain follow-up"},
    {id:2,patientId:2,doctorId:2,scheduledAt:"2025-05-21 11:00:00",status:"confirmed",notes:"Headache evaluation"},
    {id:3,patientId:3,doctorId:3,scheduledAt:"2025-05-21 14:00:00",status:"pending",notes:"Diabetes check"},
    {id:4,patientId:4,doctorId:1,scheduledAt:"2025-05-22 09:00:00",status:"pending",notes:"Allergy review"},
  ],
  prescriptions:[
    {id:1,appointmentId:1,doctorId:1,patientId:1,medicineId:5,dosage:"10mg",frequency:"Once daily",durationDays:30,issuedDate:"2025-05-20",diagnosis:"Hypertensive episode"},
  ],
};

function initStore(){ return JSON.parse(JSON.stringify(SEED)); }
function nextId(arr){ return arr.length ? Math.max(...arr.map(x=>x.id))+1 : 1; }

function getDoctorName(store,id){
  const d=store.doctors.find(x=>x.id===id); if(!d) return "—";
  const u=store.users.find(x=>x.id===d.userId); return u?u.name:"—";
}
function getPatientName(store,id){
  const p=store.patients.find(x=>x.id===id); if(!p) return "—";
  const u=store.users.find(x=>x.id===p.userId); return u?u.name:"—";
}
function getMedName(id){ const m=MEDICINES.find(x=>x.id===id); return m?m.name:"—"; }
function statusColor(s){
  return {completed:C.primary,confirmed:"#60a5fa",pending:"#f59e0b",cancelled:"#f87171"}[s]||"#888";
}

// ── PARTICLES ────────────────────────────────────────────────────────────────
function Particles(){
  const ref=useRef();
  useEffect(()=>{
    const cv=ref.current, ctx=cv.getContext("2d");
    let W,H,pts,id;
    const resize=()=>{
      W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight;
      pts=Array.from({length:50},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.2+.3}));
    };
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="rgba(45,200,160,.3)"; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(45,200,160,${.12*(1-d/120)})`;ctx.lineWidth=.5;ctx.stroke();}
      }
      id=requestAnimationFrame(draw);
    };
    resize(); draw();
    const ro=new ResizeObserver(resize); ro.observe(cv);
    return()=>{cancelAnimationFrame(id);ro.disconnect();};
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
}

// ── TILT CARD ────────────────────────────────────────────────────────────────
function TiltCard({children,style}){
  const ref=useRef();
  const onMove=e=>{
    const r=ref.current.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    ref.current.style.transform=`perspective(700px) rotateY(${x*9}deg) rotateX(${-y*9}deg) translateZ(10px)`;
  };
  const onLeave=()=>{ ref.current.style.transform="perspective(700px) rotateY(0) rotateX(0) translateZ(0)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{transition:"transform .2s ease",willChange:"transform",...style}}>{children}</div>;
}

// ── MODAL ────────────────────────────────────────────────────────────────────
function Modal({title,onClose,children}){
  useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)",background:"rgba(0,8,8,.8)"}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"2rem",width:"min(520px,95vw)",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 0 60px ${C.primaryGlow}, 0 32px 80px rgba(0,0,0,.7)`,animation:"mIn .22s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <span style={{fontFamily:C.serif,fontSize:"1.2rem",color:C.text}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:"1.5rem",lineHeight:1,transition:"color .15s"}}
            onMouseEnter={e=>e.target.style.color=C.primary} onMouseLeave={e=>e.target.style.color=C.textDim}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── FORM PRIMITIVES ──────────────────────────────────────────────────────────
const inp={width:"100%",background:"rgba(45,200,160,.06)",border:`1px solid ${C.border}`,borderRadius:9,padding:".58rem .8rem",color:C.text,fontSize:".88rem",outline:"none",fontFamily:C.sans,boxSizing:"border-box",transition:"border-color .15s"};
const focusInp=e=>{e.target.style.borderColor=C.primary;};
const blurInp=e=>{e.target.style.borderColor=C.border;};

function Field({label,children}){
  return(
    <div style={{marginBottom:"1rem"}}>
      <label style={{display:"block",fontSize:".7rem",letterSpacing:".09em",textTransform:"uppercase",color:C.textMid,marginBottom:".35rem",fontFamily:C.mono}}>{label}</label>
      {children}
    </div>
  );
}

function Inp(props){ return <input {...props} style={{...inp,...(props.style||{})}} onFocus={focusInp} onBlur={blurInp}/>; }
function Sel({children,...props}){ return <select {...props} style={{...inp,...(props.style||{})}} onFocus={focusInp} onBlur={blurInp}>{children}</select>; }
function Txta(props){ return <textarea {...props} style={{...inp,minHeight:76,resize:"vertical",...(props.style||{})}} onFocus={focusInp} onBlur={blurInp}/>; }

function Btn({variant="primary",children,...props}){
  const base={padding:".56rem 1.2rem",borderRadius:9,border:"none",cursor:"pointer",fontSize:".87rem",fontWeight:600,fontFamily:C.sans,transition:"all .15s"};
  const v={
    primary:{background:C.primary,color:"#03100e"},
    ghost:{background:C.primaryDim,color:C.primary,border:`1px solid ${C.border}`},
    danger:{background:"rgba(248,113,113,.1)",color:"#f87171",border:"1px solid rgba(248,113,113,.25)"},
  };
  return(
    <button {...props} style={{...base,...v[variant]}}
      onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.15)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.transform="";}}>
      {children}
    </button>
  );
}

// ── TABLE ────────────────────────────────────────────────────────────────────
function DataTable({cols,rows,onEdit,onDelete}){
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:".84rem"}}>
        <thead>
          <tr>{cols.map(c=>(
            <th key={c.key} style={{padding:".65rem 1rem",textAlign:"left",color:C.textMid,fontFamily:C.mono,fontSize:".68rem",letterSpacing:".09em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,fontWeight:500,whiteSpace:"nowrap"}}>{c.label}</th>
          ))}{(onEdit||onDelete)&&<th style={{padding:".65rem 1rem",borderBottom:`1px solid ${C.border}`}}/>}</tr>
        </thead>
        <tbody>
          {rows.length===0&&<tr><td colSpan={cols.length+1} style={{padding:"2.5rem",textAlign:"center",color:C.textDim,fontFamily:C.mono,fontSize:".8rem",letterSpacing:".06em"}}>— no records —</td></tr>}
          {rows.map((row,i)=>(
            <tr key={row.id??i}
              style={{borderBottom:`1px solid rgba(45,200,160,.05)`,transition:"background .12s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(45,200,160,.04)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {cols.map(c=>(
                <td key={c.key} style={{padding:".68rem 1rem",color:C.text,verticalAlign:"middle"}}>
                  {c.render?c.render(row[c.key],row):<span style={{fontFamily:c.mono?C.mono:"inherit",fontSize:c.mono?".8rem":".84rem"}}>{row[c.key]??"-"}</span>}
                </td>
              ))}
              {(onEdit||onDelete)&&(
                <td style={{padding:".68rem 1rem",textAlign:"right",whiteSpace:"nowrap"}}>
                  {onEdit&&<Btn variant="ghost" onClick={()=>onEdit(row)} style={{padding:"4px 12px",fontSize:".74rem",marginRight:6}}>Edit</Btn>}
                  {onDelete&&<Btn variant="danger" onClick={()=>onDelete(row)} style={{padding:"4px 12px",fontSize:".74rem"}}>Delete</Btn>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({status}){
  const c=statusColor(status);
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 11px",borderRadius:20,background:`${c}18`,border:`1px solid ${c}38`,color:c,fontSize:".73rem",fontFamily:C.mono,letterSpacing:".04em"}}>
    <span style={{width:5,height:5,borderRadius:"50%",background:c,display:"inline-block"}}/>{status}
  </span>;
}

function StatCard({label,value,sub,accent}){
  return(
    <TiltCard style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"1.4rem 1.6rem",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-10,right:-10,width:90,height:90,borderRadius:"50%",background:accent,filter:"blur(44px)",opacity:.3}}/>
      <div style={{fontFamily:C.mono,fontSize:"2.1rem",color:C.text,fontWeight:700,letterSpacing:"-.02em"}}>{value}</div>
      <div style={{fontSize:".72rem",color:C.textMid,marginTop:4,fontFamily:C.mono,letterSpacing:".07em",textTransform:"uppercase"}}>{label}</div>
      {sub&&<div style={{fontSize:".73rem",color:accent,marginTop:6}}>{sub}</div>}
    </TiltCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTIONS
// ══════════════════════════════════════════════════════════════════════════════

function Overview({store}){
  const pending=store.appointments.filter(a=>a.status==="pending").length;
  const upcoming=store.appointments.filter(a=>a.status==="pending"||a.status==="confirmed").slice(0,5);
  const recent=store.prescriptions.slice(-5).reverse();
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"1rem",marginBottom:"2rem"}}>
        <StatCard label="Patients" value={store.patients.length} sub="Registered" accent={C.primary}/>
        <StatCard label="Doctors" value={store.doctors.length} sub="Active staff" accent="#60a5fa"/>
        <StatCard label="Appointments" value={store.appointments.length} sub={`${pending} pending`} accent="#f59e0b"/>
        <StatCard label="Prescriptions" value={store.prescriptions.length} sub="Issued" accent={C.accent}/>
        <StatCard label="Medicines" value={MEDICINES.length} sub="In catalogue" accent="#a78bfa"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.2rem"}}>
        {[
          {title:"Upcoming Appointments",items:upcoming,render:a=>(
            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:".65rem 0",borderBottom:`1px solid rgba(45,200,160,.06)`}}>
              <div><div style={{color:C.text,fontSize:".87rem"}}>{getPatientName(store,a.patientId)}</div>
              <div style={{color:C.textMid,fontSize:".73rem",fontFamily:C.mono}}>{getDoctorName(store,a.doctorId)} · {a.scheduledAt.slice(0,16)}</div></div>
              <Badge status={a.status}/>
            </div>
          ),empty:"No upcoming appointments"},
          {title:"Recent Prescriptions",items:recent,render:p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:".65rem 0",borderBottom:`1px solid rgba(45,200,160,.06)`}}>
              <div><div style={{color:C.text,fontSize:".87rem"}}>{getPatientName(store,p.patientId)}</div>
              <div style={{color:C.textMid,fontSize:".73rem",fontFamily:C.mono}}>{getMedName(p.medicineId)} · {p.dosage}</div></div>
              <span style={{color:C.primary,fontSize:".73rem",fontFamily:C.mono}}>{p.issuedDate}</span>
            </div>
          ),empty:"No prescriptions yet"},
        ].map(panel=>(
          <div key={panel.title} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"1.4rem"}}>
            <div style={{fontSize:".7rem",fontFamily:C.mono,letterSpacing:".09em",textTransform:"uppercase",color:C.textMid,marginBottom:"1rem"}}>{panel.title}</div>
            {panel.items.length===0&&<div style={{color:C.textDim,fontSize:".84rem"}}>{panel.empty}</div>}
            {panel.items.map(panel.render)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DOCTORS (FIXED) ──────────────────────────────────────────────────────────
function Doctors({store,setStore}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [search,setSearch]=useState("");
  const [err,setErr]=useState("");

  function openAdd(){
    setErr("");
    setForm({name:"",email:"",phone:"",specialization:SPECS[0],licenseNo:"",availStart:"08:00",availEnd:"17:00"});
    setModal("add");
  }
  function openEdit(d){
    setErr("");
    const u=store.users.find(x=>x.id===d.userId)||{};
    setForm({_docId:d.id,_userId:d.userId,name:u.name||"",email:u.email||"",phone:u.phone||"",specialization:d.specialization,licenseNo:d.licenseNo,availStart:d.availStart,availEnd:d.availEnd});
    setModal("edit");
  }
  function handleDelete(d){
    if(!confirm("Delete this doctor?"))return;
    setStore(s=>({...s,doctors:s.doctors.filter(x=>x.id!==d.id),users:s.users.filter(x=>x.id!==d.userId)}));
  }
  function handleSave(){
    setErr("");
    if(!form.name.trim())return setErr("Full name is required.");
    if(!form.email.trim())return setErr("Email is required.");
    if(!form.licenseNo.trim())return setErr("License number is required.");

    if(modal==="add"){
      // check duplicate email
      if(store.users.find(u=>u.email.toLowerCase()===form.email.trim().toLowerCase()))
        return setErr("A user with this email already exists.");
      // check duplicate license
      if(store.doctors.find(d=>d.licenseNo.toLowerCase()===form.licenseNo.trim().toLowerCase()))
        return setErr("A doctor with this license number already exists.");

      setStore(prev=>{
        const newUid=nextId(prev.users);
        const newDid=nextId(prev.doctors);
        return{
          ...prev,
          users:[...prev.users,{id:newUid,name:form.name.trim(),email:form.email.trim(),password_hash:"hashed",role:"doctor",phone:form.phone.trim()}],
          doctors:[...prev.doctors,{id:newDid,userId:newUid,specialization:form.specialization,licenseNo:form.licenseNo.trim(),availStart:form.availStart,availEnd:form.availEnd}],
        };
      });
    } else {
      // edit — check dup email excluding self
      if(store.users.find(u=>u.email.toLowerCase()===form.email.trim().toLowerCase()&&u.id!==form._userId))
        return setErr("Email already in use by another user.");
      if(store.doctors.find(d=>d.licenseNo.toLowerCase()===form.licenseNo.trim().toLowerCase()&&d.id!==form._docId))
        return setErr("License number already in use.");

      setStore(prev=>({
        ...prev,
        users:prev.users.map(u=>u.id===form._userId?{...u,name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim()}:u),
        doctors:prev.doctors.map(d=>d.id===form._docId?{...d,specialization:form.specialization,licenseNo:form.licenseNo.trim(),availStart:form.availStart,availEnd:form.availEnd}:d),
      }));
    }
    setModal(null);
  }

  const rows=store.doctors
    .filter(d=>{const u=store.users.find(x=>x.id===d.userId)||{};return !search||(u.name||"").toLowerCase().includes(search.toLowerCase())||d.specialization.toLowerCase().includes(search.toLowerCase());})
    .map(d=>{const u=store.users.find(x=>x.id===d.userId)||{};return{...d,_name:u.name,_email:u.email,_phone:u.phone};});

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.2rem",flexWrap:"wrap",gap:8}}>
        <Inp placeholder="Search doctors…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:240}}/>
        <Btn onClick={openAdd}>+ Add Doctor</Btn>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <DataTable
          cols={[
            {key:"_name",label:"Name"},
            {key:"specialization",label:"Specialization"},
            {key:"licenseNo",label:"License",mono:true},
            {key:"_email",label:"Email"},
            {key:"availStart",label:"Hours",render:(_,r)=><span style={{fontFamily:C.mono,fontSize:".77rem",color:C.textMid}}>{r.availStart}–{r.availEnd}</span>},
          ]}
          rows={rows} onEdit={openEdit} onDelete={handleDelete}
        />
      </div>
      {modal&&(
        <Modal title={modal==="add"?"New Doctor":"Edit Doctor"} onClose={()=>setModal(null)}>
          {err&&<div style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",borderRadius:8,padding:".6rem .9rem",color:"#f87171",fontSize:".83rem",marginBottom:"1rem"}}>{err}</div>}
          <Field label="Full Name"><Inp value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></Field>
          <Field label="Email"><Inp type="email" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></Field>
          <Field label="Phone"><Inp value={form.phone||""} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></Field>
          <Field label="Specialization">
            <Sel value={form.specialization||SPECS[0]} onChange={e=>setForm(f=>({...f,specialization:e.target.value}))}>
              {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
            </Sel>
          </Field>
          <Field label="License No"><Inp value={form.licenseNo||""} onChange={e=>setForm(f=>({...f,licenseNo:e.target.value}))}/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Available From"><Inp type="time" value={form.availStart||"08:00"} onChange={e=>setForm(f=>({...f,availStart:e.target.value}))}/></Field>
            <Field label="Available Until"><Inp type="time" value={form.availEnd||"17:00"} onChange={e=>setForm(f=>({...f,availEnd:e.target.value}))}/></Field>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:"1.4rem"}}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave}>Save Doctor</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PATIENTS ─────────────────────────────────────────────────────────────────
function Patients({store,setStore}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [search,setSearch]=useState("");
  const [err,setErr]=useState("");

  function openAdd(){setErr("");setForm({name:"",email:"",phone:"",dob:"",bloodGroup:"O+",medHistory:""});setModal("add");}
  function openEdit(p){
    setErr("");
    const u=store.users.find(x=>x.id===p.userId)||{};
    setForm({_patId:p.id,_userId:p.userId,name:u.name||"",email:u.email||"",phone:u.phone||"",dob:p.dob,bloodGroup:p.bloodGroup,medHistory:p.medHistory});
    setModal("edit");
  }
  function handleDelete(p){
    if(!confirm("Delete this patient?"))return;
    setStore(s=>({...s,patients:s.patients.filter(x=>x.id!==p.id),users:s.users.filter(x=>x.id!==p.userId)}));
  }
  function handleSave(){
    setErr("");
    if(!form.name.trim())return setErr("Full name is required.");
    if(!form.email.trim())return setErr("Email is required.");
    if(modal==="add"){
      if(store.users.find(u=>u.email.toLowerCase()===form.email.trim().toLowerCase()))return setErr("Email already in use.");
      setStore(prev=>{
        const newUid=nextId(prev.users),newPid=nextId(prev.patients);
        return{...prev,
          users:[...prev.users,{id:newUid,name:form.name.trim(),email:form.email.trim(),password_hash:"hashed",role:"patient",phone:form.phone.trim()}],
          patients:[...prev.patients,{id:newPid,userId:newUid,dob:form.dob,bloodGroup:form.bloodGroup,medHistory:form.medHistory}],
        };
      });
    } else {
      if(store.users.find(u=>u.email.toLowerCase()===form.email.trim().toLowerCase()&&u.id!==form._userId))return setErr("Email already in use.");
      setStore(prev=>({...prev,
        users:prev.users.map(u=>u.id===form._userId?{...u,name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim()}:u),
        patients:prev.patients.map(p=>p.id===form._patId?{...p,dob:form.dob,bloodGroup:form.bloodGroup,medHistory:form.medHistory}:p),
      }));
    }
    setModal(null);
  }

  const rows=store.patients
    .filter(p=>{const u=store.users.find(x=>x.id===p.userId)||{};return !search||(u.name||"").toLowerCase().includes(search.toLowerCase());})
    .map(p=>{const u=store.users.find(x=>x.id===p.userId)||{};return{...p,_name:u.name,_email:u.email};});

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.2rem",flexWrap:"wrap",gap:8}}>
        <Inp placeholder="Search patients…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:240}}/>
        <Btn onClick={openAdd}>+ Add Patient</Btn>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <DataTable
          cols={[
            {key:"_name",label:"Name"},
            {key:"dob",label:"DOB",mono:true},
            {key:"bloodGroup",label:"Blood",render:v=><span style={{fontFamily:C.mono,color:"#f87171",fontWeight:700}}>{v}</span>},
            {key:"_email",label:"Email"},
            {key:"medHistory",label:"History",render:v=><span style={{color:C.textMid,fontSize:".79rem"}}>{(v||"").slice(0,38)}{(v||"").length>38?"…":""}</span>},
          ]}
          rows={rows} onEdit={openEdit} onDelete={handleDelete}
        />
      </div>
      {modal&&(
        <Modal title={modal==="add"?"New Patient":"Edit Patient"} onClose={()=>setModal(null)}>
          {err&&<div style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",borderRadius:8,padding:".6rem .9rem",color:"#f87171",fontSize:".83rem",marginBottom:"1rem"}}>{err}</div>}
          <Field label="Full Name"><Inp value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></Field>
          <Field label="Email"><Inp type="email" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></Field>
          <Field label="Phone"><Inp value={form.phone||""} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Date of Birth"><Inp type="date" value={form.dob||""} onChange={e=>setForm(f=>({...f,dob:e.target.value}))}/></Field>
            <Field label="Blood Group"><Sel value={form.bloodGroup||"O+"} onChange={e=>setForm(f=>({...f,bloodGroup:e.target.value}))}>{BLOOD.map(b=><option key={b} value={b}>{b}</option>)}</Sel></Field>
          </div>
          <Field label="Medical History"><Txta value={form.medHistory||""} onChange={e=>setForm(f=>({...f,medHistory:e.target.value}))}/></Field>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:"1.4rem"}}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave}>Save Patient</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── APPOINTMENTS ─────────────────────────────────────────────────────────────
function Appointments({store,setStore}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [filter,setFilter]=useState("all");
  const [err,setErr]=useState("");

  function openAdd(){
    setErr("");
    setForm({patientId:store.patients[0]?.id||"",doctorId:store.doctors[0]?.id||"",scheduledAt:"",status:"pending",notes:""});
    setModal("add");
  }
  function openEdit(a){setErr("");setForm({...a,scheduledAt:a.scheduledAt.slice(0,16).replace(" ","T")});setModal("edit");}
  function handleDelete(a){
    if(store.prescriptions.find(p=>p.appointmentId===a.id))return alert("Cannot delete — a prescription exists for this appointment.");
    if(!confirm("Delete appointment?"))return;
    setStore(s=>({...s,appointments:s.appointments.filter(x=>x.id!==a.id)}));
  }
  function handleSave(){
    setErr("");
    if(!form.patientId||!form.doctorId||!form.scheduledAt)return setErr("Patient, doctor and time are all required.");
    const slotStr=(form.scheduledAt||"").replace("T"," ")+":00";
    const conflict=store.appointments.find(a=>a.doctorId===Number(form.doctorId)&&a.scheduledAt.slice(0,16)===slotStr.slice(0,16)&&a.id!==form.id);
    if(conflict)return setErr("Double-booking detected — this doctor already has an appointment at that time.");
    if(modal==="add"){
      setStore(prev=>{const id=nextId(prev.appointments);return{...prev,appointments:[...prev.appointments,{id,patientId:Number(form.patientId),doctorId:Number(form.doctorId),scheduledAt:slotStr,status:form.status||"pending",notes:form.notes}]};});
    } else {
      setStore(prev=>({...prev,appointments:prev.appointments.map(a=>a.id===form.id?{...a,patientId:Number(form.patientId),doctorId:Number(form.doctorId),scheduledAt:slotStr,status:form.status,notes:form.notes}:a)}));
    }
    setModal(null);
  }

  const STATUSES=["all","pending","confirmed","completed","cancelled"];
  const rows=store.appointments
    .filter(a=>filter==="all"||a.status===filter)
    .map(a=>({...a,_patient:getPatientName(store,a.patientId),_doctor:getDoctorName(store,a.doctorId)}));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.2rem",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${filter===s?C.primary:C.border}`,background:filter===s?C.primaryDim:"transparent",color:filter===s?C.primary:C.textMid,cursor:"pointer",fontSize:".75rem",fontFamily:C.mono,transition:"all .15s"}}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <Btn onClick={openAdd}>+ Book Appointment</Btn>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <DataTable
          cols={[
            {key:"_patient",label:"Patient"},
            {key:"_doctor",label:"Doctor"},
            {key:"scheduledAt",label:"Date & Time",mono:true,render:v=><span style={{fontFamily:C.mono,fontSize:".78rem"}}>{v.slice(0,16)}</span>},
            {key:"status",label:"Status",render:v=><Badge status={v}/>},
            {key:"notes",label:"Notes",render:v=><span style={{color:C.textMid,fontSize:".79rem"}}>{(v||"").slice(0,34)}{(v||"").length>34?"…":""}</span>},
          ]}
          rows={rows} onEdit={openEdit} onDelete={handleDelete}
        />
      </div>
      {modal&&(
        <Modal title={modal==="add"?"Book Appointment":"Edit Appointment"} onClose={()=>setModal(null)}>
          {err&&<div style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",borderRadius:8,padding:".6rem .9rem",color:"#f87171",fontSize:".83rem",marginBottom:"1rem"}}>{err}</div>}
          <Field label="Patient">
            <Sel value={form.patientId||""} onChange={e=>setForm(f=>({...f,patientId:e.target.value}))}>
              {store.patients.map(p=>{const u=store.users.find(x=>x.id===p.userId);return <option key={p.id} value={p.id}>{u?.name}</option>;})}
            </Sel>
          </Field>
          <Field label="Doctor">
            <Sel value={form.doctorId||""} onChange={e=>setForm(f=>({...f,doctorId:e.target.value}))}>
              {store.doctors.map(d=>{const u=store.users.find(x=>x.id===d.userId);return <option key={d.id} value={d.id}>{u?.name} — {d.specialization}</option>;})}
            </Sel>
          </Field>
          <Field label="Date & Time"><Inp type="datetime-local" value={(form.scheduledAt||"").slice(0,16)} onChange={e=>setForm(f=>({...f,scheduledAt:e.target.value}))}/></Field>
          <Field label="Status">
            <Sel value={form.status||"pending"} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              {["pending","confirmed","completed","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
            </Sel>
          </Field>
          <Field label="Notes"><Txta value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></Field>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:"1.4rem"}}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave}>Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PRESCRIPTIONS ────────────────────────────────────────────────────────────
function Prescriptions({store,setStore}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const [search,setSearch]=useState("");
  const [err,setErr]=useState("");

  const freeAppts=store.appointments.filter(a=>a.status==="completed"&&!store.prescriptions.find(p=>p.appointmentId===a.id));

  function openAdd(){
    setErr("");
    if(freeAppts.length===0)return alert("No completed appointments without a prescription.");
    const a=freeAppts[0];
    setForm({appointmentId:a.id,doctorId:a.doctorId,patientId:a.patientId,medicineId:MEDICINES[0].id,dosage:"",frequency:"Once daily",durationDays:7,issuedDate:new Date().toISOString().slice(0,10),diagnosis:""});
    setModal("add");
  }
  function openEdit(p){setErr("");setForm({...p});setModal("edit");}
  function handleDelete(p){
    if(!confirm("Delete prescription?"))return;
    setStore(s=>({...s,prescriptions:s.prescriptions.filter(x=>x.id!==p.id)}));
  }
  function handleSave(){
    setErr("");
    if(!form.dosage?.trim())return setErr("Dosage is required.");
    if(!form.diagnosis?.trim())return setErr("Diagnosis is required.");
    if(Number(form.durationDays)<1)return setErr("Duration must be at least 1 day.");
    if(modal==="add"){
      setStore(prev=>{const id=nextId(prev.prescriptions);return{...prev,prescriptions:[...prev.prescriptions,{id,...form,medicineId:Number(form.medicineId),durationDays:Number(form.durationDays),appointmentId:Number(form.appointmentId),doctorId:Number(form.doctorId),patientId:Number(form.patientId)}]};});
    } else {
      setStore(prev=>({...prev,prescriptions:prev.prescriptions.map(p=>p.id===form.id?{...form,medicineId:Number(form.medicineId),durationDays:Number(form.durationDays)}:p)}));
    }
    setModal(null);
  }

  const rows=store.prescriptions
    .filter(p=>{const n=getPatientName(store,p.patientId);return !search||n.toLowerCase().includes(search.toLowerCase())||getMedName(p.medicineId).toLowerCase().includes(search.toLowerCase());})
    .map(p=>({...p,_patient:getPatientName(store,p.patientId),_doctor:getDoctorName(store,p.doctorId),_medicine:getMedName(p.medicineId)}));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.2rem",flexWrap:"wrap",gap:8}}>
        <Inp placeholder="Search prescriptions…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:240}}/>
        <Btn onClick={openAdd}>+ Issue Prescription</Btn>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <DataTable
          cols={[
            {key:"_patient",label:"Patient"},
            {key:"_doctor",label:"Doctor"},
            {key:"_medicine",label:"Medicine"},
            {key:"dosage",label:"Dosage",mono:true},
            {key:"frequency",label:"Frequency",render:v=><span style={{color:C.textMid,fontSize:".79rem"}}>{v}</span>},
            {key:"durationDays",label:"Days",mono:true},
            {key:"issuedDate",label:"Issued",mono:true},
            {key:"diagnosis",label:"Diagnosis",render:v=><span style={{color:C.textMid,fontSize:".78rem"}}>{(v||"").slice(0,28)}{(v||"").length>28?"…":""}</span>},
          ]}
          rows={rows} onEdit={openEdit} onDelete={handleDelete}
        />
      </div>
      {modal&&(
        <Modal title={modal==="add"?"Issue Prescription":"Edit Prescription"} onClose={()=>setModal(null)}>
          {err&&<div style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",borderRadius:8,padding:".6rem .9rem",color:"#f87171",fontSize:".83rem",marginBottom:"1rem"}}>{err}</div>}
          {modal==="add"&&(
            <Field label="Appointment">
              <Sel value={form.appointmentId||""} onChange={e=>{const a=store.appointments.find(x=>x.id===Number(e.target.value));if(a)setForm(f=>({...f,appointmentId:a.id,doctorId:a.doctorId,patientId:a.patientId}));}}>
                {freeAppts.map(a=><option key={a.id} value={a.id}>#{a.id} · {getPatientName(store,a.patientId)} with {getDoctorName(store,a.doctorId)}</option>)}
              </Sel>
            </Field>
          )}
          <Field label="Medicine">
            <Sel value={form.medicineId||MEDICINES[0].id} onChange={e=>setForm(f=>({...f,medicineId:e.target.value}))}>
              {MEDICINES.map(m=><option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}
            </Sel>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Dosage"><Inp value={form.dosage||""} placeholder="e.g. 500mg" onChange={e=>setForm(f=>({...f,dosage:e.target.value}))}/></Field>
            <Field label="Duration (days)"><Inp type="number" min={1} value={form.durationDays||7} onChange={e=>setForm(f=>({...f,durationDays:e.target.value}))}/></Field>
          </div>
          <Field label="Frequency">
            <Sel value={form.frequency||"Once daily"} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))}>
              {["Once daily","Twice daily","Three times daily","Every 8 hours","As needed"].map(x=><option key={x} value={x}>{x}</option>)}
            </Sel>
          </Field>
          <Field label="Issued Date"><Inp type="date" value={form.issuedDate||""} onChange={e=>setForm(f=>({...f,issuedDate:e.target.value}))}/></Field>
          <Field label="Diagnosis"><Txta value={form.diagnosis||""} onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))}/></Field>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:"1.4rem"}}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn onClick={handleSave}>Save Prescription</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MEDICINES ────────────────────────────────────────────────────────────────
function Medicines(){
  const [search,setSearch]=useState("");
  const rows=MEDICINES.filter(m=>!search||m.name.toLowerCase().includes(search.toLowerCase())||m.type.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={{marginBottom:"1.2rem"}}><Inp placeholder="Search medicines…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:280}}/></div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <DataTable
          cols={[
            {key:"id",label:"ID",mono:true,render:v=><span style={{color:C.textDim}}>#{v}</span>},
            {key:"name",label:"Medicine"},
            {key:"type",label:"Type",render:v=><span style={{padding:"3px 11px",borderRadius:20,background:`${C.primaryDim}`,color:C.primary,fontSize:".73rem",fontFamily:C.mono}}>{v}</span>},
            {key:"manufacturer",label:"Manufacturer",render:v=><span style={{color:C.textMid}}>{v}</span>},
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHELL
// ══════════════════════════════════════════════════════════════════════════════
const NAV=[
  {id:"overview",label:"Overview",icon:"◈"},
  {id:"doctors",label:"Doctors",icon:"⚕"},
  {id:"patients",label:"Patients",icon:"♡"},
  {id:"appointments",label:"Appointments",icon:"◷"},
  {id:"prescriptions",label:"Prescriptions",icon:"℞"},
  {id:"medicines",label:"Medicines",icon:"⬡"},
];

export default function App(){
  const [store,setStore]=useState(initStore);
  const [active,setActive]=useState("overview");
  const [open,setOpen]=useState(true);
  const titles={overview:"Overview",doctors:"Doctors",patients:"Patients",appointments:"Appointments",prescriptions:"Prescriptions",medicines:"Medicine Catalogue"};

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${C.bg};color:${C.text};font-family:${C.sans};}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
        select option{background:${C.card};}
        @keyframes mIn{from{opacity:0;transform:scale(.95) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px ${C.primaryGlow}}50%{box-shadow:0 0 18px ${C.primaryGlow}}}
      `}</style>
      <div style={{display:"flex",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
        {/* bg */}
        <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 15% 60%, rgba(20,184,166,.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(45,200,160,.05) 0%, transparent 50%)`,pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"fixed",inset:0,zIndex:0}}><Particles/></div>

        {/* SIDEBAR */}
        <aside style={{width:open?222:62,minHeight:"100vh",background:"rgba(4,14,14,.9)",backdropFilter:"blur(24px)",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:100,transition:"width .24s cubic-bezier(.4,0,.2,1)",overflow:"hidden"}}>
          <div style={{padding:"1.4rem 1rem 1rem",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid rgba(45,200,160,.08)`}}>
            <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.teal3})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".95rem",flexShrink:0,boxShadow:`0 4px 18px ${C.primaryGlow}`,animation:"glow 3s infinite"}}>✦</div>
            {open&&<div style={{overflow:"hidden",whiteSpace:"nowrap"}}>
              <div style={{fontFamily:C.serif,fontSize:"1rem",color:C.text}}>HAPMS</div>
              <div style={{fontSize:".62rem",color:C.textMid,fontFamily:C.mono,letterSpacing:".07em"}}>CLINIC OS</div>
            </div>}
          </div>
          <nav style={{flex:1,padding:"1rem .5rem",display:"flex",flexDirection:"column",gap:2}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setActive(n.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",width:"100%",background:active===n.id?C.primaryDim:"transparent",color:active===n.id?C.primary:C.textMid,transition:"all .14s",whiteSpace:"nowrap",borderLeft:active===n.id?`2px solid ${C.primary}`:"2px solid transparent",fontFamily:C.sans}}
                onMouseEnter={e=>{if(active!==n.id){e.currentTarget.style.background="rgba(45,200,160,.06)";e.currentTarget.style.color=C.text;}}}
                onMouseLeave={e=>{if(active!==n.id){e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.textMid;}}}>
                <span style={{fontSize:".95rem",width:20,textAlign:"center",flexShrink:0}}>{n.icon}</span>
                {open&&<span style={{fontSize:".86rem",fontWeight:active===n.id?600:400}}>{n.label}</span>}
              </button>
            ))}
          </nav>
          <button onClick={()=>setOpen(s=>!s)} style={{margin:"1rem .5rem",padding:"10px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontSize:".82rem",transition:"all .14s",fontFamily:C.sans}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.primaryDim;e.currentTarget.style.color=C.primary;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.textMid;}}>
            {open?"◀":"▶"}
          </button>
        </aside>

        {/* MAIN */}
        <main style={{flex:1,marginLeft:open?222:62,transition:"margin-left .24s cubic-bezier(.4,0,.2,1)",position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
          <header style={{padding:"1.3rem 2rem",borderBottom:`1px solid ${C.border}`,background:"rgba(3,13,13,.7)",backdropFilter:"blur(24px)",position:"sticky",top:0,zIndex:50,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <h1 style={{fontFamily:C.serif,fontSize:"1.35rem",color:C.text,letterSpacing:".01em"}}>{titles[active]}</h1>
              <div style={{fontSize:".7rem",color:C.textDim,fontFamily:C.mono,marginTop:2,letterSpacing:".06em"}}>
                {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:C.primary,boxShadow:`0 0 8px ${C.primary}`,animation:"pulse 2s infinite"}}/>
              <span style={{fontFamily:C.mono,fontSize:".72rem",color:C.textMid}}>DB CONNECTED</span>
            </div>
          </header>
          <div key={active} style={{padding:"2rem",flex:1,animation:"fadeUp .28s ease"}}>
            {active==="overview"       && <Overview store={store}/>}
            {active==="doctors"        && <Doctors store={store} setStore={setStore}/>}
            {active==="patients"       && <Patients store={store} setStore={setStore}/>}
            {active==="appointments"   && <Appointments store={store} setStore={setStore}/>}
            {active==="prescriptions"  && <Prescriptions store={store} setStore={setStore}/>}
            {active==="medicines"      && <Medicines/>}
          </div>
        </main>
      </div>
    </>
  );
}
