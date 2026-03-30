import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import childRoutes from "./routes/child.js";
import monitorRoutes from "./routes/monitorRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import superSafeRoutes from "./routes/superSafeRoutes.js";
import timedBlockRoutes from "./routes/timedBlockRoutes.js";
import { startHeartbeatMonitor } from './utillity/cronMonitor.js';
import { validateEnv } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
dotenv.config();

validateEnv();

const app = express();

// Rate limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  message: { message: "Too many attempts. Please try again later." },
});

app.use(cors({
  origin: '*', // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Device-ID"],
  credentials: true, // Note: Cannot use '*' with credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    startHeartbeatMonitor();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
connectDB();


app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/monitor", monitorRoutes);
app.use("/api/child", childRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/supersafe", superSafeRoutes);
app.use("/api/timed-blocks", timedBlockRoutes);

// Uninstall guard page — Chrome opens this when extension is removed
app.get("/uninstall-guard", (req, res) => {
  const token = req.query.token || "";
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>CyberNest - Confirm Removal</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;background:radial-gradient(circle at top,#0f172a,#020617);color:#e5e7eb;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:rgba(15,23,42,0.95);border:1px solid rgba(148,163,184,0.3);border-radius:16px;padding:32px 28px;width:380px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.5)}
    .shield{font-size:48px;margin-bottom:16px}
    h2{font-size:1.3rem;margin-bottom:8px;color:#f1f5f9}
    p{font-size:0.85rem;color:#94a3b8;margin-bottom:20px;line-height:1.5}
    input[type=password]{width:100%;padding:10px 14px;background:rgba(30,41,59,0.8);border:1px solid rgba(148,163,184,0.3);border-radius:8px;color:#e5e7eb;font-size:0.9rem;outline:none;margin-bottom:12px}
    input[type=password]:focus{border-color:#7c3aed}
    input::placeholder{color:#64748b}
    .btn-remove{width:100%;padding:10px;background:#dc2626;color:white;border:none;border-radius:8px;font-size:0.9rem;font-weight:600;cursor:pointer;margin-bottom:8px}
    .btn-remove:hover{background:#b91c1c}
    .btn-remove:disabled{opacity:0.5;cursor:not-allowed}
    #error{display:none;color:#f87171;font-size:0.8rem;margin-bottom:10px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px}
    #lockout{display:none;color:#fbbf24;font-size:0.85rem;margin-bottom:10px;padding:10px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:6px}
    #success{display:none;color:#4ade80;font-size:0.85rem;padding:12px;background:rgba(74,222,128,0.1);border-radius:6px}
  </style>
</head>
<body>
  <div class="card">
    <div class="shield">🛡️</div>
    <h2>Parent Password Required</h2>
    <p>CyberNest was protecting this device. Enter the parent password to confirm this removal is authorized.</p>
    <div id="lockout">🔒 Too many failed attempts. Locked for: <span id="lockoutTimer">--:--:--</span></div>
    <div id="error"></div>
    <div id="success"></div>
    <input type="password" id="password" placeholder="Enter parent password" autocomplete="off"/>
    <button class="btn-remove" id="confirmBtn">Confirm Removal</button>
  </div>
  <script>
    const BACKEND_URL = window.location.origin;
    const TOKEN = ${JSON.stringify(token)};
    const errorDiv = document.getElementById('error');
    const lockoutDiv = document.getElementById('lockout');
    const lockoutTimer = document.getElementById('lockoutTimer');
    const successDiv = document.getElementById('success');
    const confirmBtn = document.getElementById('confirmBtn');
    const passwordInput = document.getElementById('password');
    let countdownInterval;

    function showError(msg){errorDiv.textContent=msg;errorDiv.style.display='block';successDiv.style.display='none'}
    function showSuccess(msg){successDiv.textContent=msg;successDiv.style.display='block';errorDiv.style.display='none';document.querySelector('input').style.display='none';confirmBtn.style.display='none'}

    function startLockout(until){
      if(countdownInterval)clearInterval(countdownInterval);
      lockoutDiv.style.display='block';errorDiv.style.display='none';
      confirmBtn.disabled=true;passwordInput.disabled=true;
      countdownInterval=setInterval(()=>{
        const d=new Date(until).getTime()-Date.now();
        if(d<=0){clearInterval(countdownInterval);lockoutDiv.style.display='none';confirmBtn.disabled=false;passwordInput.disabled=false;return}
        const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),s=Math.floor((d%60000)/1000);
        lockoutTimer.textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
      },1000);
    }

    confirmBtn.addEventListener('click',async()=>{
      const password=passwordInput.value.trim();
      if(!password){showError('Please enter the parent password.');return}
      if(!TOKEN){showError('Session token missing. The extension may have already been removed.');return}
      confirmBtn.disabled=true;confirmBtn.textContent='Verifying...';
      try{
        const res=await fetch(BACKEND_URL+'/api/monitor/verify-removal',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},
          body:JSON.stringify({password})
        });
        const data=await res.json();
        if(res.status===403&&data.lockoutUntil){startLockout(data.lockoutUntil);confirmBtn.textContent='Confirm Removal';return}
        if(!res.ok){showError(data.message||'Incorrect password.');confirmBtn.disabled=false;confirmBtn.textContent='Confirm Removal';return}
        showSuccess('✅ Removal authorized. The extension has been removed.');
      }catch(e){
        showError('Could not connect to server.');confirmBtn.disabled=false;confirmBtn.textContent='Confirm Removal';
      }
    });

    passwordInput.addEventListener('keydown',e=>{if(e.key==='Enter')confirmBtn.click()});
    passwordInput.addEventListener('input',()=>{errorDiv.style.display='none'});
  </script>
</body>
</html>`);
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

