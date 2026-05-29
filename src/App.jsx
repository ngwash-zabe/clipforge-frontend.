import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const API      = import.meta.env.VITE_API_URL || "https://shonkazee-clipforge-backend.hf.space";
const supabase = SUPA_URL ? createClient(SUPA_URL, SUPA_KEY) : null;

const cf = {
  upload: async (file, uid, niche) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("user_id", uid);
    fd.append("niche", niche || "general");
    fd.append("clip_count", "10");
    const r = await fetch(API + "/process/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error("Upload failed: " + r.status);
    return r.json();
  },
  url: async (url, uid, niche) => {
    const r = await fetch(API + "/process/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, user_id: uid, niche: niche || "general", clip_count: 10 }),
    });
    if (!r.ok) throw new Error("URL failed: " + r.status);
    return r.json();
  },
  job: async (id) => {
    const r = await fetch(API + "/job/" + id);
    if (!r.ok) throw new Error("Job fetch failed: " + r.status);
    return r.json();
  },
  clips: async (uid) => {
    try {
      const r = await fetch(API + "/clips/" + uid);
      if (!r.ok) return { clips: [] };
      return r.json();
    } catch { return { clips: [] }; }
  },
  chat: async (uid, niche, msg) => {
    const r = await fetch(API + "/growth/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: uid, niche: niche || "general", message: msg, context: "" }),
    });
    if (!r.ok) throw new Error("Chat failed: " + r.status);
    return r.json();
  },
  intel: async () => {
    try {
      const r = await fetch(API + "/growth/algorithm-intel");
      if (!r.ok) return { signals: [] };
      return r.json();
    } catch { return { signals: [] }; }
  },
  post: async (platform, clipUrl, caption, hashtags) => {
    const r = await fetch(API + "/post/" + platform, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "me", clip_url: clipUrl, caption, hashtags: hashtags || [], account_id: "" }),
    });
    return r.json();
  },
  health: async () => {
    const r = await fetch(API + "/");
    return r.json();
  },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --bg:#03050a;--s1:#080d18;--s2:#0c1220;--s3:#111827;
  --g1:#00e5ff;--g2:#7c3aed;--g3:#10b981;
  --warn:#f59e0b;--danger:#ef4444;
  --t1:#f0f4ff;--t2:#8892a4;--t3:#4b5563;--br:#1e293b;
}
html,body{background:var(--bg);color:var(--t1);font-family:'Space Grotesk',sans-serif;min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:var(--g1);border-radius:99px;}
input,textarea{font-family:'Space Grotesk',sans-serif;outline:none;}
button{cursor:pointer;font-family:'Space Grotesk',sans-serif;}
@keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes in{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes glow{0%,100%{box-shadow:0 0 12px rgba(0,229,255,.12)}50%{box-shadow:0 0 26px rgba(0,229,255,.38)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes drop{from{opacity:0;transform:translateY(-18px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
`;

function Btn({ children, onClick, v="primary", sz="md", full, icon, disabled, style={} }) {
  const pad={sm:"6px 13px",md:"10px 19px",lg:"13px 28px"}[sz];
  const fs={sm:11,md:13,lg:15}[sz];
  const vs={
    primary:{bg:"linear-gradient(135deg,#00e5ff,#7c3aed)",color:"#000",border:"none",shadow:"0 0 18px rgba(0,229,255,.22)"},
    ghost:{bg:"rgba(0,229,255,.05)",color:"var(--g1)",border:"1px solid rgba(0,229,255,.2)",shadow:"none"},
    dark:{bg:"var(--s2)",color:"var(--t1)",border:"1px solid var(--br)",shadow:"none"},
    danger:{bg:"rgba(239,68,68,.1)",color:"var(--danger)",border:"1px solid rgba(239,68,68,.25)",shadow:"none"},
    success:{bg:"rgba(16,185,129,.1)",color:"var(--g3)",border:"1px solid rgba(16,185,129,.25)",shadow:"none"},
  };
  const s=vs[v]||vs.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{background:s.bg,color:s.color,border:s.border,boxShadow:s.shadow,
        padding:pad,fontSize:fs,fontWeight:600,borderRadius:8,
        width:full?"100%":"auto",display:"inline-flex",alignItems:"center",
        justifyContent:full?"center":"flex-start",gap:6,
        transition:"all .18s",opacity:disabled?.5:1,letterSpacing:.3,...style}}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.filter="brightness(1.12)";e.currentTarget.style.transform="translateY(-1px)";}}}
      onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.transform="";}}>
      {icon&&<span style={{fontSize:fs+2}}>{icon}</span>}{children}
    </button>
  );
}

function Card({ children, style={}, glow }) {
  return (
    <div style={{background:"var(--s1)",border:"1px solid var(--br)",borderRadius:12,padding:16,
      ...(glow?{animation:"glow 3s ease-in-out infinite",borderColor:"rgba(0,229,255,.2)"}:{}),
      ...style}}>
      {children}
    </div>
  );
}

function Badge({ children, color="var(--g1)" }) {
  return (
    <span style={{background:color+"18",border:"1px solid "+color+"30",color,
      borderRadius:99,padding:"2px 8px",fontSize:9,fontWeight:700,
      letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>
      {children}
    </span>
  );
}

function Ring({ val=0, size=44 }) {
  const r=(size-6)/2, c=2*Math.PI*r, d=(val/100)*c;
  const col=val>=80?"var(--g3)":val>=60?"var(--warn)":"var(--danger)";
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={5}
          strokeDasharray={d+" "+c} strokeLinecap="round"
          style={{filter:"drop-shadow(0 0 5px "+col+")",transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:size*.23,fontWeight:700,color:col,fontFamily:"'JetBrains Mono',monospace"}}>
        {val}
      </div>
    </div>
  );
}

function Spin({ size=20, color="var(--g1)" }) {
  return (
    <div style={{width:size,height:size,border:"2px solid "+color+"20",
      borderTop:"2px solid "+color,borderRadius:"50%",
      animation:"spin .7s linear infinite",flexShrink:0}}/>
  );
}

function Toast({ msg, type="success", onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,4500); return ()=>clearTimeout(t); },[]);
  const col=type==="error"?"var(--danger)":type==="warn"?"var(--warn)":"var(--g1)";
  return (
    <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",
      background:"rgba(3,5,10,.97)",backdropFilter:"blur(20px)",
      border:"1px solid "+col+"40",borderRadius:10,padding:"11px 20px",
      color:"var(--t1)",fontSize:13,fontWeight:600,zIndex:9999,
      whiteSpace:"nowrap",animation:"drop .25s ease",
      boxShadow:"0 0 20px "+col+"20"}}>
      {msg}
    </div>
  );
}

function TopBar({ title, sub, right }) {
  return (
    <div style={{position:"sticky",top:0,background:"rgba(3,5,10,.95)",
      backdropFilter:"blur(16px)",borderBottom:"1px solid var(--br)",
      padding:"11px 16px",zIndex:100,display:"flex",
      justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,
          color:"var(--t1)",letterSpacing:2}}>{title}</div>
        {sub&&<div style={{fontSize:10,color:"var(--t2)",marginTop:1}}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Nav({ page, go }) {
  const tabs=[
    {id:"home",icon:"⚡",label:"Home"},
    {id:"upload",icon:"🎬",label:"Upload"},
    {id:"clips",icon:"✂️",label:"Clips"},
    {id:"growth",icon:"🚀",label:"Growth"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ];
  return (
    <nav style={{position:"fixed",bottom:0,left:0,right:0,
      background:"rgba(8,13,24,.97)",backdropFilter:"blur(20px)",
      borderTop:"1px solid var(--br)",display:"flex",zIndex:1000}}>
      {tabs.map(t=>{
        const a=page===t.id;
        return (
          <button key={t.id} onClick={()=>go(t.id)}
            style={{flex:1,padding:"9px 4px 7px",border:"none",background:"transparent",
              color:a?"var(--g1)":"var(--t3)",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              minHeight:54,transition:"all .15s",position:"relative"}}>
            <span style={{fontSize:18,filter:a?"drop-shadow(0 0 6px var(--g1))":"none",transition:"filter .15s"}}>{t.icon}</span>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>{t.label}</span>
            {a&&<div style={{position:"absolute",bottom:0,width:18,height:2,
              background:"linear-gradient(90deg,var(--g1),var(--g2))",borderRadius:99}}/>}
          </button>
        );
      })}
    </nav>
  );
}

function Home({ clips, go, toast }) {
  const [health,setHealth]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    cf.health().then(h=>{setHealth(h);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  const top=clips.slice(0,3);
  const avg=clips.length?Math.round(clips.reduce((a,c)=>a+(c.viral_score||0),0)/clips.length):0;

  return (
    <div style={{animation:"up .35s ease",paddingBottom:80}}>
      <TopBar title="CLIPFORGE" sub="clip-forge.site · AI Video Empire"
        right={<Btn sz="sm" onClick={()=>go("upload")} icon="🎬">Upload</Btn>}/>
      <div style={{padding:16}}>

        <Card style={{marginBottom:12,padding:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {loading?<Spin size={14}/>:
              <div style={{width:8,height:8,borderRadius:"50%",
                background:health?"var(--g3)":"var(--danger)",
                animation:"pulse 2s ease-in-out infinite"}}/>}
            <span style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>
              {loading?"Connecting to backend...":
               health?"✅ ClipForge V3.1 Backend Online":
               "❌ Backend offline — check HF Spaces"}
            </span>
          </div>
          {health&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
              {Object.entries(health.services||{}).map(([k,v])=>(
                <Badge key={k} color={v==="ready"?"var(--g3)":v.startsWith("missing")?"var(--danger)":"var(--warn)"}>
                  {k.replace(/_/g," ")}: {v==="ready"?"✓":"⚠"}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {icon:"✂️",label:"Clips Generated",value:clips.length,color:"var(--g1)"},
            {icon:"🔥",label:"Avg Viral Score",value:avg||"—",color:"var(--warn)"},
            {icon:"📅",label:"Scheduled Posts",value:0,color:"var(--g2)"},
            {icon:"💰",label:"Est. Monthly",value:"$0",color:"var(--g3)"},
          ].map((s,i)=>(
            <Card key={i} style={{padding:13,animation:"up .35s ease both",animationDelay:i*.06+"s"}}>
              <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color,fontFamily:"'JetBrains Mono',monospace"}}>{s.value}</div>
              <div style={{fontSize:10,color:"var(--t2)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{s.label}</div>
            </Card>
          ))}
        </div>

        {top.length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--t1)",textTransform:"uppercase",letterSpacing:.5}}>Recent Clips</span>
              <button onClick={()=>go("clips")} style={{fontSize:10,color:"var(--g1)",background:"none",border:"none",cursor:"pointer"}}>View all →</button>
            </div>
            {top.map((c,i)=>(
              <Card key={i} style={{padding:11,marginBottom:7,animation:"up .35s ease both",animationDelay:i*.07+"s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:42,height:42,borderRadius:8,flexShrink:0,
                    background:c.thumb_url?"url("+c.thumb_url+") center/cover":"var(--s3)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,backgroundSize:"cover"}}>
                    {!c.thumb_url&&"▶"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {c.title||"Clip "+(i+1)}
                    </div>
                    <div style={{fontSize:10,color:"var(--t2)",marginTop:2}}>
                      {c.best_platform||"TikTok"} · {c.best_post_time||"7:00 PM"} · {c.duration?Math.floor(c.duration)+"s":"—"}
                    </div>
                  </div>
                  <Ring val={c.viral_score||0} size={38}/>
                </div>
              </Card>
            ))}
          </div>
        )}

        {clips.length===0&&(
          <Card style={{padding:24,textAlign:"center",border:"2px dashed var(--br)",animation:"up .4s ease"}}>
            <div style={{fontSize:40,marginBottom:12,animation:"float 3s ease-in-out infinite"}}>🎬</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--t1)",marginBottom:6,letterSpacing:2}}>START CLIPPING</div>
            <div style={{fontSize:11,color:"var(--t2)",marginBottom:16,lineHeight:1.7}}>
              Upload a video or paste a YouTube URL.<br/>ClipForge AI generates viral clips in minutes.
            </div>
            <Btn full icon="⚡" onClick={()=>go("upload")}>Upload First Video</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}

function Upload({ uid, setClips, go, toast }) {
  const [phase,setPhase]=useState("idle");
  const [url,setUrl]=useState("");
  const [pct,setPct]=useState(0);
  const [label,setLabel]=useState("");
  const [errMsg,setErrMsg]=useState("");
  const [niche,setNiche]=useState("general");
  const fileRef=useRef();
  const gallRef=useRef();
  const pollRef=useRef();

  const poll=(jid)=>{
    let elapsed=0;
    pollRef.current=setInterval(async()=>{
      elapsed+=2;
      try{
        const job=await cf.job(jid);
        const p=job.progress||0;
        setPct(p);
        // Show helpful message when stuck at low % (WhisperX is slow on free CPU)
        if(p<=10 && elapsed>30){
          setLabel("WhisperX transcribing... (~10-20 min on free CPU) "+Math.floor(elapsed/60)+"m "+elapsed%60+"s");
        } else if(p<=20 && elapsed>60){
          setLabel("Still transcribing... HF free CPU is slow but working! "+Math.floor(elapsed/60)+"m elapsed");
        } else {
          setLabel(job.stage_label||job.stage||"Processing...");
        }
        if(job.status==="done"){
          clearInterval(pollRef.current);
          setClips(job.clips||[]);
          setPhase("done");
          toast("🎉 "+(job.clip_count||(job.clips||[]).length)+" clips ready!");
        }else if(job.status==="error"){
          clearInterval(pollRef.current);
          setErrMsg(job.error||"Processing failed. Check HF Spaces logs.");
          setPhase("error");
        }
      }catch(e){
        clearInterval(pollRef.current);
        setErrMsg("Lost connection: "+e.message);
        setPhase("error");
      }
    },2000);
  };

  const startFile=async(file)=>{
    if(!file)return;
    setPhase("processing");setPct(3);setLabel("Uploading video...");
    try{
      const res=await cf.upload(file,uid,niche);
      if(res.job_id)poll(res.job_id);
      else{setErrMsg("Backend error: "+(res.detail||JSON.stringify(res)));setPhase("error");}
    }catch(e){setErrMsg(e.message);setPhase("error");}
  };

  const startURL=async()=>{
    if(!url.trim())return;
    setPhase("processing");setPct(3);setLabel("Downloading video from URL...");
    try{
      const res=await cf.url(url.trim(),uid,niche);
      if(res.job_id)poll(res.job_id);
      else{setErrMsg("Backend error: "+(res.detail||JSON.stringify(res)));setPhase("error");}
    }catch(e){setErrMsg(e.message);setPhase("error");}
  };

  useEffect(()=>()=>clearInterval(pollRef.current),[]);

  const stages=["Uploading","Transcribing","Detecting clips","Gemini Alpha","Gemini Beta","Reframing","Captions","Thumbnails","Upload to R2","Growth plan"];

  if(phase==="done")return(
    <div style={{textAlign:"center",padding:"60px 24px 100px",animation:"up .4s ease"}}>
      <div style={{fontSize:56,marginBottom:14,animation:"float 3s ease-in-out infinite"}}>🎉</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"var(--t1)",marginBottom:6,letterSpacing:2}}>CLIPS READY!</div>
      <div style={{color:"var(--t2)",fontSize:12,marginBottom:28,lineHeight:1.7}}>Your viral clips have been generated.<br/>AI scored and ranked each one.</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:260,margin:"0 auto"}}>
        <Btn full sz="lg" icon="✂️" onClick={()=>go("clips")}>View My Clips</Btn>
        <Btn full v="ghost" onClick={()=>{setPhase("idle");setPct(0);setUrl("");}}>Upload Another</Btn>
      </div>
    </div>
  );

  if(phase==="error")return(
    <div style={{textAlign:"center",padding:"60px 24px 100px",animation:"up .4s ease"}}>
      <div style={{fontSize:48,marginBottom:14}}>⚠️</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--danger)",marginBottom:8,letterSpacing:2}}>FAILED</div>
      <Card style={{padding:14,marginBottom:20,textAlign:"left",borderColor:"rgba(239,68,68,.3)"}}>
        <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.7,wordBreak:"break-all"}}>{errMsg}</div>
      </Card>
      <Btn onClick={()=>{setPhase("idle");setErrMsg("");}}>Try Again</Btn>
    </div>
  );

  if(phase==="processing")return(
    <div style={{padding:"20px 16px 100px",animation:"up .4s ease"}}>
      <TopBar title="PROCESSING" sub="Real AI — WhisperX + Gemini"/>
      <div style={{padding:16}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <Spin size={40}/>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--t1)",marginTop:14,marginBottom:4,letterSpacing:2}}>ANALYZING VIDEO</div>
          <div style={{fontSize:11,color:"var(--t2)"}}>{label}</div>
        </div>
        <div style={{background:"rgba(255,255,255,.04)",borderRadius:99,height:5,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,var(--g1),var(--g2))",
            borderRadius:99,transition:"width .4s ease",boxShadow:"0 0 12px rgba(0,229,255,.4)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,fontSize:10,color:"var(--t2)"}}>
          <span>{label}</span>
          <span style={{color:"var(--g1)",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{pct}%</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {stages.map((s,i)=>{
            const done=pct>=Math.round((i+1)/stages.length*100);
            const active=!done&&pct>=Math.round(i/stages.length*100);
            return(
              <div key={i} style={{padding:"7px 10px",borderRadius:8,
                background:done?"rgba(16,185,129,.08)":active?"rgba(0,229,255,.06)":"rgba(255,255,255,.02)",
                border:"1px solid "+(done?"rgba(16,185,129,.2)":active?"rgba(0,229,255,.15)":"rgba(255,255,255,.04)"),
                fontSize:9,color:done?"var(--g3)":active?"var(--g1)":"var(--t3)",
                display:"flex",alignItems:"center",gap:5,transition:"all .3s"}}>
                {done?"✓":active?<Spin size={9} color="var(--g1)"/>:"○"} {s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return(
    <div style={{animation:"up .35s ease",paddingBottom:80}}>
      <TopBar title="UPLOAD" sub="Video → Viral clips via real AI"/>
      <div style={{padding:16}}>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:"var(--t2)",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Your Niche</div>
          <input value={niche} onChange={e=>setNiche(e.target.value)}
            placeholder="e.g. fitness, business, comedy, motivation..."
            style={{width:"100%",background:"var(--s1)",border:"1px solid var(--br)",borderRadius:8,
              padding:"10px 12px",color:"var(--t1)",fontSize:12}}/>
        </div>

        <div onClick={()=>fileRef.current?.click()}
          style={{border:"2px dashed rgba(0,229,255,.2)",borderRadius:14,padding:"36px 20px",
            textAlign:"center",cursor:"pointer",marginBottom:10,transition:"all .2s",
            animation:"glow 3s ease-in-out infinite"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,229,255,.5)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,229,255,.2)"}>
          <input ref={fileRef} type="file" accept="video/*" style={{display:"none"}}
            onChange={e=>startFile(e.target.files[0])}/>
          <div style={{fontSize:40,marginBottom:10,animation:"float 3s ease-in-out infinite"}}>🎬</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"var(--t1)",marginBottom:4,letterSpacing:2}}>DROP VIDEO HERE</div>
          <div style={{color:"var(--t2)",fontSize:10,marginBottom:14}}>MP4 · MOV · AVI · MKV up to 10GB</div>
          <Btn icon="⚡">Choose File</Btn>
        </div>

        <input ref={gallRef} type="file" accept="video/*" style={{display:"none"}}
          onChange={e=>startFile(e.target.files[0])}/>
        <Btn v="dark" full icon="📱" style={{marginBottom:10}} onClick={()=>gallRef.current?.click()}>Pick from Gallery</Btn>

        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <input value={url} onChange={e=>setUrl(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&startURL()}
            placeholder="YouTube · TikTok · Loom · Vimeo URL..."
            style={{flex:1,background:"var(--s1)",border:"1px solid var(--br)",borderRadius:8,
              padding:"11px 13px",color:"var(--t1)",fontSize:12}}/>
          <Btn onClick={startURL} disabled={!url.trim()}>Go</Btn>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {icon:"🎙️",t:"WhisperX",d:"99% accurate transcription"},
            {icon:"🤖",t:"Gemini Alpha",d:"Viral scoring + titles"},
            {icon:"⚡",t:"Gemini Beta",d:"Growth strategy engine"},
            {icon:"📐",t:"9:16 Reframe",d:"Auto face-tracking crop"},
            {icon:"💬",t:"Captions",d:"Animated word-highlight"},
            {icon:"☁️",t:"R2 Storage",d:"Cloudflare permanent cloud"},
          ].map((f,i)=>(
            <Card key={i} style={{padding:11,animation:"up .35s ease both",animationDelay:i*.05+"s"}}>
              <span style={{fontSize:20}}>{f.icon}</span>
              <div style={{fontSize:11,fontWeight:700,color:"var(--t1)",marginTop:6,marginBottom:2}}>{f.t}</div>
              <div style={{fontSize:10,color:"var(--t2)",lineHeight:1.5}}>{f.d}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Clips({ uid, clips, toast }) {
  const [open,setOpen]=useState(null);
  const [posting,setPosting]=useState("");

  const download=(clip)=>{
    const u=clip.clip_url||"";
    if(!u){toast("No download URL — check R2 storage","error");return;}
    const a=document.createElement("a");
    a.href=u;a.target="_blank";a.download=(clip.title||"clip")+".mp4";a.click();
    toast("⬇ Downloading...");
  };

  const save=(clip)=>{
    const u=clip.clip_url||"";
    if(!u){toast("No clip URL available","error");return;}
    window.open(u,"_blank");
    toast("📱 Long-press video to save to gallery");
  };

  const doPost=async(clip,platform)=>{
    const key=clip.id+platform;
    setPosting(key);
    try{
      const res=await cf.post(platform,clip.clip_url||"",clip.caption||clip.title||"",clip.hashtags||[]);
      if(res.success)toast("✅ Posted to "+platform+"!");
      else toast(platform+" error: "+(res.detail||"Check API keys in HF Spaces"),"error");
    }catch(e){toast(e.message,"error");}
    setPosting("");
  };

  if(clips.length===0)return(
    <div style={{padding:"60px 24px 100px",textAlign:"center",animation:"up .4s ease"}}>
      <div style={{fontSize:44,marginBottom:12}}>✂️</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--t1)",marginBottom:6,letterSpacing:2}}>NO CLIPS YET</div>
      <div style={{color:"var(--t2)",fontSize:11,lineHeight:1.7,maxWidth:240,margin:"0 auto"}}>
        Upload a video first. Real clips from your videos will appear here with AI scores, titles, captions and more.
      </div>
    </div>
  );

  return(
    <div style={{animation:"up .35s ease",paddingBottom:80}}>
      <TopBar title="MY CLIPS" sub={clips.length+" real clips · AI scored"}
        right={<Badge color="var(--g3)">{clips.length} clips</Badge>}/>
      <div style={{padding:"12px 16px 0"}}>
        {clips.map((clip,i)=>(
          <div key={clip.id||i} style={{marginBottom:10}}>
            <Card style={{padding:13,cursor:"pointer",
              border:"1px solid "+(open===i?"rgba(0,229,255,.3)":"var(--br)"),
              animation:"up .35s ease both",animationDelay:i*.06+"s"}}
              onClick={()=>setOpen(open===i?null:i)}>
              <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
                <div style={{width:68,height:68,borderRadius:9,flexShrink:0,position:"relative",overflow:"hidden",
                  background:clip.thumb_url?"url("+clip.thumb_url+") center/cover":"var(--s3)",
                  display:"flex",alignItems:"center",justifyContent:"center",backgroundSize:"cover"}}>
                  {!clip.thumb_url&&<span style={{fontSize:22,opacity:.4}}>▶</span>}
                  <div style={{position:"absolute",bottom:3,right:3,background:"rgba(0,0,0,.9)",
                    borderRadius:3,padding:"1px 4px",fontSize:7,fontFamily:"'JetBrains Mono',monospace"}}>
                    {clip.duration?Math.floor(clip.duration)+"s":"—"}
                  </div>
                  {(clip.viral_score||0)>=90&&(
                    <div style={{position:"absolute",top:3,left:3,background:"linear-gradient(135deg,#ef4444,#f97316)",
                      borderRadius:3,padding:"1px 5px",fontSize:6,fontWeight:800,color:"#fff"}}>🔥VIRAL</div>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:3,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {clip.title||"Clip "+(i+1)}
                  </div>
                  <div style={{fontSize:9,color:"var(--t2)",marginBottom:5,fontStyle:"italic",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    "{(clip.transcript||"").slice(0,50)}..."
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:5}}>
                    {(clip.tags||[]).slice(0,2).map(t=><Badge key={t}>{t}</Badge>)}
                    {clip.best_platform&&<Badge color="var(--g2)">{clip.best_platform}</Badge>}
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    {Object.entries(clip.platform_scores||{}).slice(0,3).map(([p,s])=>(
                      <div key={p} style={{display:"flex",alignItems:"center",gap:2}}>
                        <span style={{fontSize:7,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace"}}>{p.slice(0,2)}</span>
                        <div style={{width:18,height:3,borderRadius:99,background:"rgba(255,255,255,.06)"}}>
                          <div style={{height:"100%",width:s+"%",borderRadius:99,
                            background:s>=90?"var(--g3)":s>=75?"var(--warn)":"var(--danger)"}}/>
                        </div>
                        <span style={{fontSize:7,fontFamily:"'JetBrains Mono',monospace",
                          color:s>=90?"var(--g3)":s>=75?"var(--warn)":"var(--danger)"}}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Ring val={clip.viral_score||0} size={42}/>
              </div>
              <div style={{display:"flex",gap:6,marginTop:10}}>
                <Btn sz="sm" v="ghost" full onClick={e=>{e.stopPropagation();toast("Schedule: connect platforms in Settings first");}} style={{justifyContent:"center"}}>
                  📅 Schedule
                </Btn>
                <Btn sz="sm" v="dark" icon="📱" onClick={e=>{e.stopPropagation();save(clip);}}>Save</Btn>
                <Btn sz="sm" v="dark" icon="⬇" onClick={e=>{e.stopPropagation();download(clip);}}>MP4</Btn>
              </div>
            </Card>

            {open===i&&(
              <div style={{background:"var(--s2)",border:"1px solid rgba(0,229,255,.15)",
                borderRadius:10,padding:13,marginTop:5,animation:"in .2s ease"}}>
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  {[{l:"Hook",v:clip.hook_score},{l:"Retention",v:clip.retention_score},{l:"Emotion",v:clip.emotional_score},{l:"Viral%",v:clip.viral_probability}]
                    .filter(x=>x.v).map(({l,v})=>(
                    <div key={l} style={{flex:1,minWidth:60,textAlign:"center"}}>
                      <Ring val={v} size={36}/>
                      <div style={{fontSize:8,color:"var(--t2)",marginTop:3,textTransform:"uppercase",letterSpacing:.3}}>{l}</div>
                    </div>
                  ))}
                </div>

                {[
                  {t:"🎯 Hook",c:"var(--g1)",d:"Score: "+(clip.hook_score||"—")+"/100 · "+(clip.hook_sentence||"—")+" · Tip: "+(clip.improvement||"—")},
                  {t:"📅 Best Time",c:"var(--g3)",d:(clip.best_post_day||"—")+" at "+(clip.best_post_time||"—")+" · Platform: "+(clip.best_platform||"—")},
                  {t:"💬 Caption",c:"var(--warn)",d:clip.caption||"—"},
                ].map((p,pi)=>(
                  <div key={pi} style={{padding:9,background:p.c+"08",borderRadius:8,
                    border:"1px solid "+p.c+"15",marginBottom:7}}>
                    <div style={{fontSize:9,color:p.c,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:.3}}>{p.t}</div>
                    <div style={{fontSize:10,color:"var(--t2)",lineHeight:1.6}}>{p.d}</div>
                  </div>
                ))}

                {clip.titles&&clip.titles.length>0&&(
                  <div style={{padding:9,background:"rgba(124,58,237,.06)",borderRadius:8,
                    border:"1px solid rgba(124,58,237,.15)",marginBottom:8}}>
                    <div style={{fontSize:9,color:"var(--g2)",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:.3}}>📝 5 Viral Titles</div>
                    {clip.titles.map((t,ti)=>(
                      <div key={ti} style={{fontSize:10,color:"var(--t2)",padding:"3px 0",
                        borderBottom:ti<4?"1px solid rgba(255,255,255,.04)":"none",
                        display:"flex",gap:6}}>
                        <span style={{color:"var(--g2)",fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{ti+1}.</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                  <Btn sz="sm" v="ghost" onClick={()=>{navigator.clipboard?.writeText(clip.caption||"");toast("📋 Caption copied!");}}>Copy Caption</Btn>
                  <Btn sz="sm" v="dark" onClick={()=>{navigator.clipboard?.writeText((clip.hashtags||[]).join(" "));toast("📋 Hashtags copied!");}}>Copy Hashtags</Btn>
                  {clip.clip_url&&<Btn sz="sm" v="dark" onClick={()=>{navigator.clipboard?.writeText(clip.clip_url);toast("🔗 URL copied!");}}>Copy URL</Btn>}
                </div>

                <div style={{borderTop:"1px solid var(--br)",paddingTop:10}}>
                  <div style={{fontSize:9,color:"var(--t3)",marginBottom:7,textTransform:"uppercase",letterSpacing:.3}}>Quick Post</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {[{p:"instagram",icon:"📸",c:"#e1306c",label:"Instagram"},
                      {p:"facebook",icon:"👥",c:"#1877f2",label:"Facebook"},
                      {p:"tiktok",icon:"🎵",c:"#ff0050",label:"TikTok"},
                      {p:"youtube",icon:"▶️",c:"#ff0000",label:"YouTube"},
                      {p:"x",icon:"𝕏",c:"#1da1f2",label:"X"},
                    ].map(({p,icon,c,label})=>(
                      <button key={p} onClick={()=>doPost(clip,p)}
                        disabled={posting===clip.id+p||!clip.clip_url}
                        style={{padding:"5px 10px",borderRadius:7,border:"1px solid "+c+"30",
                          background:c+"12",color:c,fontSize:9,fontWeight:700,
                          cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",
                          opacity:(posting===clip.id+p||!clip.clip_url)?.5:1,
                          display:"flex",alignItems:"center",gap:4}}>
                        {posting===clip.id+p?<Spin size={8} color={c}/>:icon}
                        {label}
                      </button>
                    ))}
                  </div>
                  {!clip.clip_url&&<div style={{fontSize:9,color:"var(--t3)",marginTop:5}}>⚠ No clip URL — check R2 storage config</div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Growth({ uid, toast }) {
  const [tab,setTab]=useState("coach");
  const [msgs,setMsgs]=useState([{r:"ai",m:"Hey! I'm your AI Growth Coach powered by Gemini Key 2. Tell me your niche and I'll build your zero-to-viral strategy!"}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [intel,setIntel]=useState([]);
  const [loadingIntel,setLoadingIntel]=useState(false);
  const endRef=useRef();

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send=async()=>{
    if(!input.trim())return;
    const msg=input;setInput("");
    setMsgs(h=>[...h,{r:"user",m:msg}]);
    setTyping(true);
    try{
      const res=await cf.chat(uid,"general",msg);
      setMsgs(h=>[...h,{r:"ai",m:res.reply||"No response from coach."}]);
    }catch(e){
      setMsgs(h=>[...h,{r:"ai",m:"Error: "+e.message+". Check GEMINI_KEY_2 in HF Spaces secrets."}]);
    }
    setTyping(false);
  };

  const loadIntel=async()=>{
    setLoadingIntel(true);
    try{const res=await cf.intel();setIntel(res.signals||[]);}
    catch(e){toast("Cannot load intel: "+e.message,"error");}
    setLoadingIntel(false);
  };

  useEffect(()=>{if(tab==="intel"&&intel.length===0)loadIntel();},[tab]);

  return(
    <div style={{animation:"up .35s ease",paddingBottom:80}}>
      <TopBar title="GROWTH ENGINE" sub="Real Gemini AI · Algorithm Whisperer"/>
      <div style={{display:"flex",borderBottom:"1px solid var(--br)",overflowX:"auto"}}>
        {[{id:"coach",label:"🤖 Coach"},{id:"intel",label:"📡 Intel"},{id:"plan",label:"📅 Plan"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:"0 0 auto",padding:"10px 16px",border:"none",
              borderBottom:"2px solid "+(tab===t.id?"var(--g1)":"transparent"),
              background:"transparent",color:tab===t.id?"var(--g1)":"var(--t3)",
              fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{padding:16}}>

        {tab==="coach"&&(
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 260px)"}}>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
              {msgs.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:c.r==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"86%",padding:"10px 13px",
                    borderRadius:c.r==="user"?"13px 13px 4px 13px":"13px 13px 13px 4px",
                    background:c.r==="user"?"linear-gradient(135deg,var(--g1),var(--g2))":"var(--s2)",
                    color:c.r==="user"?"#000":"var(--t1)",fontSize:12,lineHeight:1.65,
                    fontWeight:c.r==="user"?600:400,
                    border:c.r==="ai"?"1px solid var(--br)":"none"}}>
                    {c.m}
                  </div>
                </div>
              ))}
              {typing&&(
                <div style={{display:"flex",gap:5,padding:"10px 13px",background:"var(--s2)",
                  borderRadius:"13px 13px 13px 4px",width:"fit-content",border:"1px solid var(--br)"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--g1)",
                      animation:"pulse 1s ease-in-out infinite",animationDelay:i*.2+"s"}}/>
                  ))}
                </div>
              )}
              <div ref={endRef}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&send()}
                placeholder="Ask your AI coach anything..."
                style={{flex:1,background:"var(--s1)",border:"1px solid var(--br)",
                  borderRadius:8,padding:"11px 13px",color:"var(--t1)",fontSize:12}}/>
              <Btn onClick={send} disabled={!input.trim()||typing}>Send</Btn>
            </div>
          </div>
        )}

        {tab==="intel"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {loadingIntel&&(
              <div style={{textAlign:"center",padding:"40px 0"}}>
                <Spin size={28}/>
                <div style={{fontSize:11,color:"var(--t2)",marginTop:10}}>Loading live algorithm intel from backend...</div>
              </div>
            )}
            {!loadingIntel&&intel.length===0&&(
              <Card style={{textAlign:"center",padding:24}}>
                <div style={{fontSize:11,color:"var(--t2)",marginBottom:12}}>Could not load intel from backend</div>
                <Btn v="ghost" onClick={loadIntel}>Retry</Btn>
              </Card>
            )}
            {intel.map((a,i)=>(
              <Card key={i} style={{padding:12,borderLeft:"3px solid "+(a.urgency==="HIGH"?"var(--g3)":a.urgency==="MEDIUM"?"var(--warn)":"var(--danger)")}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--t1)"}}>{a.platform}</span>
                  <Badge color={a.urgency==="HIGH"?"var(--g3)":a.urgency==="MEDIUM"?"var(--warn)":"var(--danger)"}>{a.urgency}</Badge>
                </div>
                <div style={{fontSize:11,color:"var(--t1)",marginBottom:3}}>{a.signal}</div>
                <div style={{fontSize:10,color:"var(--t2)"}}>→ {a.action}</div>
              </Card>
            ))}
          </div>
        )}

        {tab==="plan"&&(
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Card glow>
              <div style={{fontSize:13,fontWeight:700,color:"var(--t1)",marginBottom:14,
                textTransform:"uppercase",letterSpacing:.5,fontFamily:"'Bebas Neue',sans-serif"}}>
                📅 30-Day Zero to Viral
              </div>
              {[
                {w:"WEEK 1",t:"Foundation",d:"Post 3x/day TikTok. Test 5 hook styles. Consistency beats quality. Track completion rates.",c:"var(--g3)"},
                {w:"WEEK 2",t:"Double Down",d:"Kill weak hooks. Double top 2 styles. Start Instagram Reels. Engage every comment in 60 mins.",c:"var(--g1)"},
                {w:"WEEK 3",t:"Expand",d:"Add YouTube Shorts. Target 1 trending topic daily. Cross-post winners. Push for 1K TikTok.",c:"var(--warn)"},
                {w:"WEEK 4",t:"MONETIZE 💰",d:"Apply TikTok Creator Fund at 1K. YouTube Partner push. Instagram Reels Bonus. First income.",c:"var(--danger)"},
              ].map((w,i)=>(
                <div key={i} style={{padding:"11px 13px",borderRadius:9,background:"var(--s2)",
                  borderLeft:"3px solid "+w.c,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:9,color:w.c,fontWeight:700,letterSpacing:.5,textTransform:"uppercase"}}>{w.w}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"var(--t1)"}}>{w.t}</span>
                  </div>
                  <div style={{fontSize:10,color:"var(--t2)",lineHeight:1.65}}>{w.d}</div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{fontSize:12,fontWeight:700,color:"var(--t1)",marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>📈 Predicted Trajectory</div>
              {[
                {p:"Day 7",f:"0 → 340 followers",v:"12K views",c:"var(--g3)"},
                {p:"Day 14",f:"340 → 1.2K",v:"89K views",c:"var(--g1)"},
                {p:"Day 21",f:"1.2K → 4.8K",v:"380K views",c:"var(--warn)"},
                {p:"Day 30",f:"4.8K → 18K",v:"1.4M views",c:"var(--danger)"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",
                  background:"var(--s2)",borderRadius:8,marginBottom:6}}>
                  <Badge color={r.c}>{r.p}</Badge>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--t1)"}}>{r.f}</div>
                    <div style={{fontSize:9,color:"var(--t2)"}}>{r.v}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Settings({ uid, email, toast, onSignIn }) {
  const [health,setHealth]=useState(null);
  const [checking,setChecking]=useState(false);
  const [loginEmail,setLoginEmail]=useState("");
  const [loginPass,setLoginPass]=useState("");
  const [loginErr,setLoginErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [mode,setMode]=useState("login");

  const checkHealth=async()=>{
    setChecking(true);
    try{const h=await cf.health();setHealth(h);}
    catch{setHealth(null);}
    setChecking(false);
  };

  useEffect(()=>{checkHealth();},[]);

  const handleGoogle=async()=>{
    if(!supabase){toast("Supabase not configured — add VITE_SUPABASE_URL to Vercel","error");return;}
    const{error}=await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:"https://clip-forge.site"},
    });
    if(error)toast(error.message,"error");
  };

  const handleEmail=async()=>{
    if(!loginEmail||!loginPass){setLoginErr("Enter email and password");return;}
    if(!supabase){toast("Supabase not configured","error");return;}
    setLoading(true);setLoginErr("");
    try{
      const{data,error}=mode==="login"
        ?await supabase.auth.signInWithPassword({email:loginEmail,password:loginPass})
        :await supabase.auth.signUp({email:loginEmail,password:loginPass,options:{emailRedirectTo:"https://clip-forge.site"}});
      if(error)setLoginErr(error.message);
      else if(data?.user){toast("✅ Signed in!");onSignIn(data.user);}
      else if(mode==="signup")setLoginErr("✅ Check email to confirm account");
    }catch(e){setLoginErr(e.message);}
    setLoading(false);
  };

  const signOut=async()=>{
    if(supabase)await supabase.auth.signOut();
    onSignIn(null);
    toast("Signed out");
  };

  const svcColor=(v)=>v==="ready"?"var(--g3)":v?.startsWith("missing")?"var(--danger)":"var(--warn)";

  return(
    <div style={{animation:"up .35s ease",paddingBottom:80}}>
      <TopBar title="SETTINGS" sub="Account · Status · Platforms"/>
      <div style={{padding:16}}>

        <Card style={{marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--t1)",marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>👤 Account</div>
          {email?(
            <div>
              <div style={{padding:"10px 12px",background:"var(--s2)",borderRadius:8,marginBottom:10}}>
                <div style={{fontSize:10,color:"var(--t2)",marginBottom:2}}>Signed in as</div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{email}</div>
                <div style={{fontSize:9,color:"var(--g3)",marginTop:2}}>clip-forge.site · Free Plan · Unlimited</div>
              </div>
              <Btn v="danger" full onClick={signOut} icon="🚪">Sign Out</Btn>
            </div>
          ):(
            <div>
              <div style={{display:"flex",background:"var(--s2)",borderRadius:8,padding:3,marginBottom:12}}>
                {["login","signup"].map(m=>(
                  <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"8px",borderRadius:6,border:"none",
                    background:mode===m?"linear-gradient(135deg,var(--g1),var(--g2))":"transparent",
                    color:mode===m?"#000":"var(--t3)",fontWeight:700,fontSize:11,
                    cursor:"pointer",transition:"all .2s",fontFamily:"'Space Grotesk',sans-serif"}}>
                    {m==="login"?"Sign In":"Sign Up"}
                  </button>
                ))}
              </div>
              <button onClick={handleGoogle}
                style={{width:"100%",padding:"11px",borderRadius:8,border:"1px solid var(--br)",
                  background:"var(--s2)",color:"var(--t1)",fontSize:13,fontWeight:600,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                  gap:10,marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>
                <span style={{fontSize:17,fontWeight:900,color:"#4285f4"}}>G</span> Continue with Google
              </button>
              <input value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="Email"
                type="email" style={{width:"100%",background:"var(--s2)",border:"1px solid var(--br)",
                  borderRadius:8,padding:"10px 12px",color:"var(--t1)",fontSize:12,marginBottom:8}}/>
              <input value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Password"
                type="password" onKeyDown={e=>e.key==="Enter"&&handleEmail()}
                style={{width:"100%",background:"var(--s2)",border:"1px solid var(--br)",
                  borderRadius:8,padding:"10px 12px",color:"var(--t1)",fontSize:12,marginBottom:8}}/>
              {loginErr&&<div style={{fontSize:11,color:"var(--danger)",marginBottom:8,padding:"7px 10px",
                background:"rgba(239,68,68,.08)",borderRadius:7}}>{loginErr}</div>}
              <Btn full onClick={handleEmail} disabled={loading}>
                {loading?"Loading...":mode==="login"?"Sign In":"Create Account"}
              </Btn>
            </div>
          )}
        </Card>

        <Card style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t1)",textTransform:"uppercase",letterSpacing:.5}}>⚡ Backend Status</div>
            <Btn sz="sm" v="ghost" onClick={checkHealth} disabled={checking}>{checking?"...":"Refresh"}</Btn>
          </div>
          {checking&&<div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}><Spin/></div>}
          {!checking&&health&&(
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--g3)",marginBottom:5}}>{health.status}</div>
              {Object.entries(health.services||{}).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"7px 10px",background:"var(--s2)",borderRadius:7}}>
                  <span style={{fontSize:10,color:"var(--t2)",textTransform:"capitalize"}}>{k.replace(/_/g," ")}</span>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:svcColor(v)}}/>
                    <span style={{fontSize:9,color:svcColor(v),fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{v}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!checking&&!health&&(
            <div style={{fontSize:11,color:"var(--danger)",textAlign:"center",padding:"14px 0"}}>
              ❌ Cannot reach backend.<br/>
              <span style={{color:"var(--t2)",fontSize:10}}>Check VITE_API_URL in Vercel env vars</span>
            </div>
          )}
        </Card>

        <Card>
          <div style={{fontSize:12,fontWeight:700,color:"var(--t1)",marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>🌐 Platform APIs</div>
          <div style={{fontSize:10,color:"var(--t2)",marginBottom:12,lineHeight:1.6,
            padding:"9px 11px",background:"rgba(0,229,255,.05)",borderRadius:8,
            border:"1px solid rgba(0,229,255,.12)"}}>
            API keys loaded in HF Spaces. Direct posting works once Meta/TikTok apps exit sandbox after platform review.
          </div>
          {[
            {name:"Instagram",color:"#e1306c",icon:"📸",status:"Development — works for your own accounts"},
            {name:"Facebook",color:"#1877f2",icon:"👥",status:"Development — works for your own pages"},
            {name:"TikTok",color:"#ff0050",icon:"🎵",status:"Sandbox — works for your 4 test accounts"},
            {name:"YouTube",color:"#ff0000",icon:"▶️",status:"Testing — works for your channels"},
            {name:"X/Twitter",color:"#1da1f2",icon:"𝕏",status:"Free tier — 500 posts/month, live now"},
          ].map((p,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 10px",
              background:"var(--s2)",borderRadius:8,marginBottom:6,borderLeft:"3px solid "+p.color}}>
              <span style={{fontSize:18,flexShrink:0}}>{p.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--t1)"}}>{p.name}</div>
                <div style={{fontSize:9,color:"var(--t2)",marginTop:2,lineHeight:1.5}}>{p.status}</div>
              </div>
              <Badge color={p.name==="X/Twitter"?"var(--g3)":"var(--warn)"}>{p.name==="X/Twitter"?"LIVE":"PENDING"}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [page,setPage]=useState("home");
  const [clips,setClips]=useState([]);
  const [user,setUser]=useState(null);
  const [toast,setToast]=useState(null);
  const [booting,setBooting]=useState(true);

  const showToast=(msg,type="success")=>setToast({msg,type});

  useEffect(()=>{
    if(!supabase){setBooting(false);return;}
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){
        setUser(session.user);
        cf.clips(session.user.id).then(r=>{if(r.clips?.length)setClips(r.clips);}).catch(()=>{});
      }
      setBooting(false);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  const uid=user?.id||"demo-user";
  const email=user?.email||null;

  if(booting)return(
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
        <div style={{textAlign:"center"}}>
          <Spin size={36}/>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"var(--g1)",marginTop:14,letterSpacing:3}}>LOADING CLIPFORGE</div>
        </div>
      </div>
    </>
  );

  const pages={
    home:<Home clips={clips} go={setPage} toast={showToast}/>,
    upload:<Upload uid={uid} setClips={setClips} go={setPage} toast={showToast}/>,
    clips:<Clips uid={uid} clips={clips} toast={showToast}/>,
    growth:<Growth uid={uid} toast={showToast}/>,
    settings:<Settings uid={uid} email={email} toast={showToast} onSignIn={u=>{setUser(u);if(!u)setClips([]);}}/>,
  };

  return(
    <>
      <style>{CSS}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      <div style={{minHeight:"100vh",background:"var(--bg)",paddingBottom:60}}>
        {pages[page]||pages.home}
        <Nav page={page} go={setPage}/>
      </div>
    </>
  );
}
