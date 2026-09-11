import { useState, useEffect, useRef, useCallback } from "react";
import "./theme.css";
/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL KEYFRAMES — injected once, available to ALL pages/components
═══════════════════════════════════════════════════════════════════════════ */
var GLOBAL_CSS = `
  @keyframes toastIn    { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp    { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn      { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
  @keyframes successBounce { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes cardAnim   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes heroIn     { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin       { to{transform:rotate(360deg)} }
  @keyframes bookingIn  { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
  @keyframes tagIn      { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
  .svc-card:hover { transform:translateY(-5px)!important; box-shadow:0 20px 48px rgba(0,0,0,0.5)!important; border-color:var(--qs-border)!important; }
  .svc-card:hover .svc-img { transform:scale(1.07)!important; }
  .logout-btn:hover { background:rgba(239,68,68,0.12)!important; border-color:#f87171!important; color:#f87171!important; }
  .booking-card:hover { box-shadow:0 8px 32px rgba(0,0,0,0.3)!important; transform:translateY(-2px)!important; }
`;

function useGlobalStyles() {
  useEffect(() => {
    var id = 'qs-global-styles';
    if (!document.getElementById(id)) {
      var el = document.createElement('style');
      el.id = id;
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
  }, []);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES DATA — 22 categories
═══════════════════════════════════════════════════════════════════════════ */
var SERVICES = [
  { id:"plumbing",label:"Plumbing",icon:"💧",tag:"Quick Fix",tagColor:"#0ea5e9",
    location:"Hyderabad",
    description:"Leak repairs, pipe fitting & drain unblocking.",
    image:"https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Pipe Leak Repair",price:299,time:"1-2 hrs"},{name:"Drain Unblocking",price:349,time:"1 hr"},{name:"Water Heater Install",price:799,time:"3-4 hrs"},{name:"Bathroom Fitting",price:999,time:"4-6 hrs"},{name:"Tap Replacement",price:249,time:"30 min"},{name:"Sewer Line Inspection",price:549,time:"2 hrs"}]},
  { id:"electrical",label:"Electrical",icon:"⚡",tag:"Certified",tagColor:"#f59e0b",
    location:"Mumbai",
    description:"Safe wiring, panel upgrades & fixture installation.",
    image:"https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Wiring & Rewiring",price:799,time:"3-5 hrs"},{name:"Switchboard Upgrade",price:649,time:"2-3 hrs"},{name:"Ceiling Fan Install",price:299,time:"1 hr"},{name:"Light Fixture Setup",price:249,time:"45 min"},{name:"MCB / Fuse Repair",price:199,time:"30 min"},{name:"CCTV Wiring",price:999,time:"4 hrs"}]},
  { id:"cleaning",label:"Cleaning",icon:"✨",tag:"Popular",tagColor:"#10b981",
    location:"Bangalore",
    description:"Deep cleans, move-in/out & regular home maintenance.",
    image:"https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Full Home Deep Clean",price:599,time:"4-6 hrs"},{name:"Kitchen Cleaning",price:349,time:"2 hrs"},{name:"Bathroom Sanitization",price:299,time:"1-2 hrs"},{name:"Sofa Clean",price:449,time:"2 hrs"},{name:"Carpet Steam Clean",price:499,time:"2-3 hrs"},{name:"Post-Construction Clean",price:899,time:"6-8 hrs"}]},
  { id:"carpentry",label:"Carpentry",icon:"🪚",tag:"Custom",tagColor:"#8b5cf6",
    location:"Chennai",
    description:"Furniture assembly, shelving & bespoke woodwork.",
    image:"https://images.pexels.com/photos/3637741/pexels-photo-3637741.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Furniture Assembly",price:399,time:"2-3 hrs"},{name:"Wardrobe Installation",price:799,time:"4-5 hrs"},{name:"Custom Shelving",price:549,time:"3 hrs"},{name:"Door Repair",price:249,time:"1 hr"},{name:"Window Frame Repair",price:349,time:"2 hrs"},{name:"Modular Kitchen Fitting",price:1499,time:"8 hrs"}]},
  { id:"painting",label:"Painting",icon:"🎨",tag:"Creative",tagColor:"#ec4899",
    location:"Hyderabad",
    description:"Interior & exterior painting with premium finishes.",
    image:"https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Interior Wall Painting",price:799,time:"1-2 days"},{name:"Exterior Painting",price:1299,time:"2-3 days"},{name:"Texture Finish",price:999,time:"1 day"},{name:"Waterproofing Coat",price:649,time:"4-6 hrs"},{name:"Wood Polish",price:549,time:"3-4 hrs"},{name:"Graffiti Removal",price:449,time:"2 hrs"}]},
  { id:"ac-service",label:"AC Service",icon:"❄️",tag:"Seasonal",tagColor:"#06b6d4",
    location:"Delhi",
    description:"AC installation, servicing, gas refill & repairs.",
    image:"https://images.pexels.com/photos/5835359/pexels-photo-5835359.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"AC Service & Clean",price:399,time:"1-2 hrs"},{name:"Gas Refill R32",price:549,time:"1 hr"},{name:"AC Installation",price:899,time:"3-4 hrs"},{name:"Compressor Repair",price:1199,time:"3-5 hrs"},{name:"PCB Repair",price:699,time:"2-3 hrs"},{name:"Duct Cleaning",price:799,time:"3 hrs"}]},
  { id:"appliance-repair",label:"Appliance Repair",icon:"🔧",tag:"Expert",tagColor:"#f97316",
    location:"Pune",
    description:"Washing machine, fridge, oven & microwave repair.",
    image:"https://images.pexels.com/photos/5246993/pexels-photo-5246993.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Washing Machine Repair",price:499,time:"1-2 hrs"},{name:"Refrigerator Repair",price:549,time:"2-3 hrs"},{name:"Microwave Repair",price:349,time:"1 hr"},{name:"Dishwasher Repair",price:449,time:"2 hrs"},{name:"Oven Repair",price:399,time:"1-2 hrs"},{name:"Water Purifier Service",price:299,time:"1 hr"}]},
  { id:"pest-control",label:"Pest Control",icon:"🛡️",tag:"Safe",tagColor:"#84cc16",
    location:"Mumbai",
    description:"Termite, cockroach & rodent eradication solutions.",
    image:"https://images.pexels.com/photos/5974042/pexels-photo-5974042.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Cockroach Treatment",price:399,time:"1-2 hrs"},{name:"Termite Control",price:799,time:"3-4 hrs"},{name:"Rodent Proofing",price:599,time:"2-3 hrs"},{name:"Bed Bug Treatment",price:699,time:"2-3 hrs"},{name:"Mosquito Fogging",price:449,time:"1-2 hrs"},{name:"General Disinfection",price:549,time:"2 hrs"}]},
  { id:"gardening",label:"Gardening",icon:"🌿",tag:"Organic",tagColor:"#22c55e",
    location:"Bangalore",
    description:"Lawn mowing, pruning, planting & garden design.",
    image:"https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Lawn Mowing",price:299,time:"1-2 hrs"},{name:"Tree Pruning",price:399,time:"2-3 hrs"},{name:"Garden Design",price:999,time:"4-6 hrs"},{name:"Soil Care",price:349,time:"2 hrs"},{name:"Drip Irrigation Setup",price:799,time:"3-4 hrs"},{name:"Seasonal Planting",price:449,time:"2-3 hrs"}]},
  { id:"home-security",label:"Home Security",icon:"🔒",tag:"Smart",tagColor:"#6366f1",
    location:"Chennai",
    description:"CCTV, smart locks & alarm system installation.",
    image:"https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"CCTV Camera Install",price:1299,time:"4-5 hrs"},{name:"Smart Lock Setup",price:699,time:"1-2 hrs"},{name:"Video Doorbell",price:549,time:"1 hr"},{name:"Burglar Alarm",price:899,time:"3-4 hrs"},{name:"Motion Sensor",price:449,time:"1-2 hrs"},{name:"Security Audit",price:349,time:"2 hrs"}]},
  { id:"interior-design",label:"Interior Design",icon:"🛋️",tag:"Premium",tagColor:"#a78bfa",
    location:"Mumbai",
    description:"Space planning, decor consulting & full makeovers.",
    image:"https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Room Space Planning",price:999,time:"3-4 hrs"},{name:"Color Consultation",price:599,time:"2 hrs"},{name:"Furniture Arrangement",price:799,time:"3 hrs"},{name:"Lighting Design",price:849,time:"3 hrs"},{name:"Home Office Setup",price:1099,time:"4-5 hrs"},{name:"Full Room Makeover",price:2499,time:"1-2 days"}]},
  { id:"moving",label:"Moving & Shifting",icon:"📦",tag:"Insured",tagColor:"#fb923c",
    location:"Hyderabad",
    description:"Packing, loading, transport & unpacking services.",
    image:"https://images.pexels.com/photos/4246132/pexels-photo-4246132.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Local Home Shifting",price:1499,time:"4-8 hrs"},{name:"Packing Only",price:799,time:"3-4 hrs"},{name:"Furniture Dismantling",price:699,time:"3 hrs"},{name:"Office Relocation",price:2499,time:"1 day"},{name:"Single Item Transport",price:399,time:"2 hrs"},{name:"Storage Solutions",price:899,time:"Flexible"}]},
  { id:"solar",label:"Solar Installation",icon:"☀️",tag:"Green",tagColor:"#f59e0b",
    location:"Ahmedabad",
    description:"Solar panel setup, inverter install & energy audit.",
    image:"https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Rooftop Panel Install",price:2999,time:"1-2 days"},{name:"Inverter Setup",price:1499,time:"4-5 hrs"},{name:"Solar Water Heater",price:1999,time:"4-6 hrs"},{name:"Energy Audit",price:699,time:"2-3 hrs"},{name:"Battery Backup Install",price:1799,time:"4 hrs"},{name:"Panel Cleaning",price:349,time:"1-2 hrs"}]},
  { id:"roofing",label:"Roofing & Waterproofing",icon:"🏠",tag:"Durable",tagColor:"#64748b",
    location:"Kolkata",
    description:"Roof repair, waterproofing & terrace treatments.",
    image:"https://images.pexels.com/photos/209315/pexels-photo-209315.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Roof Leak Repair",price:899,time:"3-4 hrs"},{name:"Terrace Waterproofing",price:1299,time:"4-6 hrs"},{name:"Roof Tile Replacement",price:799,time:"3 hrs"},{name:"Concrete Crack Filling",price:599,time:"2-3 hrs"},{name:"Gutter Cleaning",price:449,time:"2 hrs"},{name:"Full Roof Inspection",price:349,time:"1-2 hrs"}]},
  { id:"flooring",label:"Flooring",icon:"🪵",tag:"Premium",tagColor:"#b45309",
    location:"Pune",
    description:"Tile, marble, vinyl & wooden flooring installation.",
    image:"https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Tile Installation",price:1099,time:"1-2 days"},{name:"Marble Polishing",price:799,time:"4-6 hrs"},{name:"Wooden Flooring",price:1499,time:"1-2 days"},{name:"Vinyl/PVC Flooring",price:899,time:"4-8 hrs"},{name:"Grouting & Sealing",price:499,time:"3 hrs"},{name:"Floor Crack Repair",price:349,time:"2 hrs"}]},
  { id:"gas",label:"Gas & LPG Services",icon:"🔥",tag:"Safe",tagColor:"#ef4444",
    location:"Delhi",
    description:"Gas line fitting, LPG cylinder & pipeline safety check.",
    image:"https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Gas Pipeline Install",price:799,time:"3-4 hrs"},{name:"Cylinder Regulator Fix",price:249,time:"30 min"},{name:"Gas Stove Repair",price:349,time:"1 hr"},{name:"Piped Gas Connection",price:999,time:"4 hrs"},{name:"Gas Leak Detection",price:449,time:"1-2 hrs"},{name:"Safety Valve Replace",price:299,time:"45 min"}]},
  { id:"laundry",label:"Laundry & Dry Clean",icon:"👕",tag:"Express",tagColor:"#0ea5e9",
    location:"Bangalore",
    description:"Pickup, wash, dry-clean & iron delivery service.",
    image:"https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Wash & Fold (5kg)",price:199,time:"24 hrs"},{name:"Dry Cleaning (5 pcs)",price:349,time:"48 hrs"},{name:"Express Laundry",price:299,time:"6 hrs"},{name:"Ironing (10 pcs)",price:149,time:"Same day"},{name:"Saree Dry Clean",price:499,time:"48 hrs"},{name:"Curtain Dry Clean",price:399,time:"48 hrs"}]},
  { id:"ev-charging",label:"EV & Charging Setup",icon:"🔋",tag:"Modern",tagColor:"#22d3ee",
    location:"Hyderabad",
    description:"EV charger installation, inverter wiring & smart metering.",
    image:"https://images.pexels.com/photos/9800029/pexels-photo-9800029.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Home EV Charger Install",price:1499,time:"3-4 hrs"},{name:"Smart Meter Setup",price:799,time:"2-3 hrs"},{name:"Power Backup Wiring",price:999,time:"3 hrs"},{name:"EV Wiring Inspection",price:449,time:"2 hrs"},{name:"3-Phase Connection",price:1299,time:"4-5 hrs"},{name:"Charging Cable Repair",price:349,time:"1 hr"}]},
  { id:"elder-care",label:"Elder Care",icon:"🧓",tag:"Caring",tagColor:"#f472b6",
    location:"Chennai",
    description:"In-home care, physiotherapy & senior companionship.",
    image:"https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Daily Home Care",price:699,time:"4 hrs"},{name:"Physiotherapy Session",price:799,time:"1 hr"},{name:"Medication Management",price:399,time:"1 hr"},{name:"Doctor Escort",price:549,time:"3 hrs"},{name:"Night Attendant",price:1299,time:"8 hrs"},{name:"Senior Companionship",price:499,time:"3 hrs"}]},
  { id:"baby-care",label:"Babysitting & Nanny",icon:"👶",tag:"Trusted",tagColor:"#fb7185",
    location:"Mumbai",
    description:"Certified babysitters, nannies & child activity support.",
    image:"https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Hourly Babysitting",price:299,time:"Per hr"},{name:"Full-Day Nanny",price:999,time:"8 hrs"},{name:"Night Nanny",price:1199,time:"8 hrs"},{name:"Weekend Babysitter",price:799,time:"8 hrs"},{name:"Child Activity Support",price:449,time:"2 hrs"},{name:"School Pickup & Drop",price:349,time:"Daily"}]},
  { id:"wellness",label:"Wellness & Spa",icon:"💆",tag:"Relaxing",tagColor:"#c084fc",
    location:"Bangalore",
    description:"Home massage, yoga sessions & wellness therapy.",
    image:"https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Full Body Massage",price:799,time:"1 hr"},{name:"Couple Massage",price:1399,time:"1 hr"},{name:"Yoga Session",price:499,time:"1 hr"},{name:"Aromatherapy",price:699,time:"1 hr"},{name:"Head & Shoulder Massage",price:449,time:"45 min"},{name:"Foot Reflexology",price:549,time:"45 min"}]},
  { id:"tutoring",label:"Home Tutoring",icon:"📚",tag:"Education",tagColor:"#34d399",
    location:"Hyderabad",
    description:"School subjects, competitive exams & skill-based coaching.",
    image:"https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600",
    subServices:[{name:"Math & Science (K-10)",price:399,time:"1 hr"},{name:"English Speaking",price:349,time:"1 hr"},{name:"JEE / NEET Coaching",price:699,time:"1 hr"},{name:"Computer Basics",price:299,time:"1 hr"},{name:"Music Lessons",price:449,time:"1 hr"},{name:"Drawing & Art",price:349,time:"1 hr"}]},
];

var BASE = "http://localhost:7070";
var TIME_SLOTS = ["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM"];
var ALL_CITIES = ["All Cities", ...Array.from(new Set(SERVICES.map(s => s.location))).sort()];

/* ═══════════════════════════════════════════════════════════════════════════
   EMAIL HELPER
═══════════════════════════════════════════════════════════════════════════ */
async function sendBookingEmail({ toEmail, toName, serviceName, subServiceName, date, slot, address, amount, bookingId, providerName, payMethod }) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',sans-serif;}
    .wrap{max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
    .header{background:linear-gradient(135deg,#020917,#071638);padding:32px;text-align:center;}
    .logo{color:#4f9eff;font-size:28px;font-weight:700;margin-bottom:4px;}
    .tagline{color:#7e97c4;font-size:13px;}
    .body{padding:32px;}
    .badge{display:inline-block;background:#dcfce7;color:#15803d;border-radius:99px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:20px;}
    .title{font-size:22px;font-weight:700;color:#1e293b;margin-bottom:8px;}
    .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px;}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;}
    .row:last-child{border-bottom:none;}
    .rl{font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;}
    .rv{font-size:14px;color:#1e293b;font-weight:600;}
    .total{background:linear-gradient(135deg,#020917,#071638);border-radius:12px;padding:18px 20px;display:flex;justify-content:space-between;margin-bottom:24px;}
    .tl{color:#7e97c4;font-size:13px;font-weight:600;}
    .tv{color:#ffffff;font-size:22px;font-weight:700;}
    .footer{background:#f8fafc;padding:20px 32px;text-align:center;font-size:12px;color:#94a3b8;}
  </style></head><body>
  <div class="wrap">
    <div class="header"><div class="logo">⚡ QuickServ</div><div class="tagline">India's trusted home service marketplace</div></div>
    <div class="body">
      <div class="badge">✅ Booking Confirmed</div>
      <div class="title">Your booking is confirmed, ${toName}!</div>
      <div class="card">
        <div class="row"><span class="rl">Service</span><span class="rv">${serviceName}</span></div>
        <div class="row"><span class="rl">Sub-service</span><span class="rv">${subServiceName}</span></div>
        <div class="row"><span class="rl">Provider</span><span class="rv">👷 ${providerName}</span></div>
        <div class="row"><span class="rl">Date</span><span class="rv">📅 ${date}</span></div>
        <div class="row"><span class="rl">Time</span><span class="rv">⏰ ${slot}</span></div>
        <div class="row"><span class="rl">Address</span><span class="rv">📍 ${address}</span></div>
        <div class="row"><span class="rl">Payment</span><span class="rv">💳 ${payMethod==="cod"?"Pay on Delivery":payMethod==="upi"?"UPI":"Card"}</span></div>
        <div class="row"><span class="rl">Booking ID</span><span class="rv">#${bookingId}</span></div>
      </div>
      <div class="total"><span class="tl">Total Amount</span><span class="tv">₹${amount}</span></div>
      <p style="font-size:13px;color:#64748b;">Need help? Contact <strong>support@quickserv.com</strong></p>
    </div>
    <div class="footer">© 2026 QuickServ · Visakhapatnam, Andhra Pradesh, India</div>
  </div></body></html>`;

  try {
    await fetch(`${BASE}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: toEmail,
        subject: `✅ Booking Confirmed — ${subServiceName} | QuickServ #${bookingId}`,
        html,
      }),
    });
  } catch (e) {
    console.warn("Email send failed (non-critical):", e.message);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function statusMeta(s) {
  if (s === "COMPLETED")   return { color:"#10b981", bg:"rgba(16,185,129,0.12)",  label:"Completed",   icon:"✅" };
  if (s === "CONFIRMED")   return { color:"#4f9eff", bg:"rgba(79,158,255,0.12)",  label:"Confirmed",   icon:"📅" };
  if (s === "IN_PROGRESS") return { color:"#8b5cf6", bg:"rgba(139,92,246,0.12)", label:"In Progress", icon:"🔧" };
  if (s === "CANCELLED")   return { color:"#ef4444", bg:"rgba(239,68,68,0.12)",  label:"Cancelled",   icon:"❌" };
  return { color:"#f59e0b", bg:"rgba(245,158,11,0.12)", label:"Pending", icon:"⏳" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════════════════ */
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed", top:20, right:20, zIndex:9999,
      padding:"13px 22px", borderRadius:12, fontSize:14, fontWeight:600,
      background: type === "error" ? "#ef4444" : "#10b981", color:"#fff",
      boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
      animation:"toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)"
    }}>
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGOUT CONFIRM MODAL
═══════════════════════════════════════════════════════════════════════════ */
function LogoutModal({ onConfirm, onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:2000, background:"rgba(2,9,23,0.8)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16
    }} onClick={onClose}>
      <div style={{
        background:"var(--qs-surface)", borderRadius:20, maxWidth:360, width:"100%",
        padding:"36px 32px", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
        animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width:64, height:64, borderRadius:"50%", background:"rgba(239,68,68,0.12)",
          margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28
        }}>🚪</div>
        <div style={{ fontSize:20, fontWeight:700, color:"var(--qs-text)", marginBottom:8 }}>Sign out?</div>
        <div style={{ fontSize:13, color:"var(--qs-text2)", marginBottom:28, lineHeight:1.6 }}>
          You'll need to log in again to book services or view your bookings.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"12px", borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:600,
            background:"var(--qs-bg2)", color:"var(--qs-text2)", border:"1px solid var(--qs-border2)"
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex:1, padding:"12px", borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:700,
            background:"rgba(239,68,68,0.9)", color:"#fff", border:"none",
            boxShadow:"0 4px 14px rgba(239,68,68,0.3)"
          }}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ★ REVIEW MODAL
═══════════════════════════════════════════════════════════════════════════ */
function ReviewModal({ booking, onClose, onSubmit }) {
  var [rating, setRating]     = useState(0);
  var [hovered, setHovered]   = useState(0);
  var [comment, setComment]   = useState("");
  var [tags, setTags]         = useState([]);
  var [busy, setBusy]         = useState(false);
  var [done, setDone]         = useState(false);

  var QUICK_TAGS = ["On time","Very professional","Clean work","Great value","Friendly","Would recommend","Fixed perfectly","Neat & tidy"];

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleSubmit() {
    if (rating === 0) return;
    setBusy(true);
    try {
      await fetch(`${BASE}/api/reviews/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId:  booking.bookingId,
          providerId: booking.providerId,
          customerId: parseInt(localStorage.getItem("userId") || "0"),
          rating,
          comment,
          tags,
          serviceName:     booking.serviceName,
          serviceCategory: booking.serviceCategory,
        }),
      });
    } catch (e) {
      console.warn("Review API error (non-critical):", e.message);
    }
    setBusy(false);
    setDone(true);
    setTimeout(() => { onSubmit(booking.bookingId, rating); onClose(); }, 1800);
  }

  var STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  if (done) return (
    <div style={{
      position:"fixed", inset:0, zIndex:3000, background:"rgba(2,9,23,0.85)",
      backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16
    }}>
      <div style={{
        background:"var(--qs-surface)", borderRadius:24, maxWidth:400, width:"100%",
        padding:"48px 36px", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
        animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"
      }}>
        <div style={{
          width:80, height:80, borderRadius:"50%",
          background:"linear-gradient(135deg,#f59e0b,#fbbf24)",
          margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:36, boxShadow:"0 12px 32px rgba(245,158,11,0.4)", animation:"successBounce 0.5s ease"
        }}>⭐</div>
        <div style={{ fontSize:22, fontWeight:700, color:"var(--qs-text)", marginBottom:8 }}>Thank you!</div>
        <div style={{ fontSize:14, color:"var(--qs-text2)", lineHeight:1.65 }}>
          Your review has been submitted. It helps others choose the right professional.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:3000, background:"rgba(2,9,23,0.85)",
      backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16
    }} onClick={onClose}>
      <div style={{
        background:"var(--qs-surface)", borderRadius:22, width:"100%", maxWidth:480,
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
        animation:"slideUp 0.42s cubic-bezier(0.34,1.4,0.64,1)"
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          background:"linear-gradient(135deg,#020917,#071638)",
          borderRadius:"22px 22px 0 0", padding:"24px 26px",
          display:"flex", justifyContent:"space-between", alignItems:"flex-start"
        }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#f59e0b", marginBottom:6 }}>
              RATE YOUR EXPERIENCE
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:3 }}>
              {booking.serviceName}
            </div>
            <div style={{ fontSize:12, color:"#7e97c4" }}>
              {booking.serviceCategory} · {booking.serviceDate || booking.date} · {booking.providerName || "Professional"}
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:10, width:36, height:36, cursor:"pointer", color:"#fff", fontSize:15,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
          }}>✕</button>
        </div>

        <div style={{ padding:"24px 26px 28px" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:13, color:"var(--qs-text2)", marginBottom:14, fontWeight:600 }}>
              How was the service?
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:8 }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  style={{
                    background:"none", border:"none", cursor:"pointer", padding:"4px",
                    fontSize:40, lineHeight:1, transition:"transform 0.15s",
                    transform: (hovered || rating) >= n ? "scale(1.2)" : "scale(1)",
                    filter: (hovered || rating) >= n ? "none" : "grayscale(1) opacity(0.35)"
                  }}
                >⭐</button>
              ))}
            </div>
            {(hovered > 0 || rating > 0) && (
              <div style={{ fontSize:13, fontWeight:700, color:"#f59e0b", animation:"toastIn 0.2s ease" }}>
                {STAR_LABELS[hovered || rating]}
              </div>
            )}
          </div>

          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--qs-text3)", marginBottom:10 }}>
              What stood out? (optional)
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {QUICK_TAGS.map(t => {
                var active = tags.includes(t);
                return (
                  <button key={t} onClick={() => toggleTag(t)} style={{
                    padding:"7px 13px", borderRadius:99, cursor:"pointer", fontSize:12, fontWeight:600,
                    background: active ? "rgba(79,158,255,0.12)" : "var(--qs-bg2)",
                    color: active ? "var(--qs-blue)" : "var(--qs-text2)",
                    border:"1.5px solid " + (active ? "var(--qs-blue)" : "var(--qs-border2)"),
                    fontFamily:"var(--qs-ff-body)", transition:"all 0.15s"
                  }}>{active ? "✓ " : ""}{t}</button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--qs-text3)", display:"block", marginBottom:8 }}>
              Write a review (optional)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Share details about your experience…"
              style={{
                width:"100%", padding:"12px 14px", fontSize:13, borderRadius:10,
                border:"1.5px solid var(--qs-border2)", background:"var(--qs-bg2)", color:"var(--qs-text)",
                outline:"none", boxSizing:"border-box", fontFamily:"var(--qs-ff-body)",
                resize:"vertical", lineHeight:1.6, transition:"border-color 0.2s"
              }}
            />
            <div style={{ fontSize:11, color:"var(--qs-text3)", marginTop:4, textAlign:"right" }}>
              {comment.length}/500
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || busy}
            style={{
              width:"100%", padding:"14px",
              background: rating === 0 ? "rgba(79,158,255,0.25)" : "var(--qs-grad)",
              color: rating === 0 ? "var(--qs-text3)" : "#fff",
              border:"none", borderRadius:12, fontSize:15, fontWeight:700,
              cursor: rating === 0 ? "not-allowed" : "pointer",
              boxShadow: rating > 0 ? "0 6px 20px rgba(79,158,255,0.3)" : "none",
              transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8
            }}
          >
            {busy
              ? <><span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", display:"inline-block", animation:"spin 0.7s linear infinite" }}/> Submitting…</>
              : rating === 0 ? "Select a star rating to continue" : `Submit ${rating}-Star Review ⭐`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKING CARD
═══════════════════════════════════════════════════════════════════════════ */
function BookingCard({ b, index, onCancel, onReview }) {
  var m = statusMeta(b.status);
  var progressSteps = ["PENDING","CONFIRMED","IN_PROGRESS","COMPLETED"];
  var currentStep   = progressSteps.indexOf(b.status);

  var accentMap = {
    COMPLETED:   "#10b981",
    CONFIRMED:   "#4f9eff",
    IN_PROGRESS: "#8b5cf6",
    CANCELLED:   "#ef4444",
    PENDING:     "#f59e0b",
  };
  var accent = accentMap[b.status] || "#f59e0b";

  var payLabel = b.paymentMethod === "cod" ? "Cash on Delivery"
               : b.paymentMethod === "upi" ? "UPI"
               : b.paymentMethod === "card" ? "Card"
               : b.paymentMethod || "—";

  return (
    <div style={{
      background:"var(--qs-surface)",
      border:"1px solid var(--qs-border2)",
      borderRadius:16,
      overflow:"hidden",
      display:"flex",
      animation:`bookingIn 0.4s ease ${index * 60}ms both`,
      transition:"box-shadow 0.2s, transform 0.2s",
    }}
    className="booking-card"
    >
      <div style={{ width:4, background:accent, flexShrink:0 }}/>
      <div style={{ flex:1, padding:"18px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--qs-text)", marginBottom:3, lineHeight:1.3 }}>
              {b.serviceName || "Service"}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{
                fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99,
                background:m.bg, color:m.color, letterSpacing:"0.04em", flexShrink:0
              }}>
                {m.icon} {m.label}
              </span>
              <span style={{ fontSize:12, color:"var(--qs-text2)", fontWeight:500 }}>
                {b.serviceCategory || ""}
              </span>
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontSize:20, fontWeight:700, color:"var(--qs-blue)", marginBottom:6 }}>
              ₹{b.amount || "—"}
            </div>
            {(b.status === "PENDING" || b.status === "CONFIRMED") && (
              <button onClick={() => onCancel(b.bookingId || b.id)} style={{
                padding:"6px 14px", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700,
                background:"rgba(239,68,68,0.08)", color:"#f87171",
                border:"1px solid rgba(239,68,68,0.25)", fontFamily:"var(--qs-ff-body)", display:"block", width:"100%"
              }}>Cancel</button>
            )}
            {b.status === "COMPLETED" && !b.reviewSubmitted && (
              <button onClick={() => onReview(b)} style={{
                padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700,
                background:"linear-gradient(135deg,rgba(245,158,11,0.15),rgba(251,191,36,0.1))",
                color:"#f59e0b",
                border:"1px solid rgba(245,158,11,0.35)", fontFamily:"var(--qs-ff-body)",
                display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap"
              }}>⭐ Rate Service</button>
            )}
            {b.status === "COMPLETED" && b.reviewSubmitted && (
              <div style={{
                padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:700,
                background:"rgba(16,185,129,0.08)", color:"#10b981",
                border:"1px solid rgba(16,185,129,0.2)", textAlign:"center"
              }}>
                {"⭐".repeat(b.reviewRating || 0)} Reviewed
              </div>
            )}
          </div>
        </div>

        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))",
          gap:"6px 16px", marginBottom:14,
          padding:"12px 14px",
          background:"var(--qs-bg2)",
          borderRadius:10,
          border:"1px solid var(--qs-border2)"
        }}>
          {[
            { icon:"📅", label:"Date",     val: b.serviceDate || b.date || "—" },
            { icon:"⏰", label:"Time",     val: b.timeSlot || "—" },
            { icon:"💳", label:"Payment",  val: payLabel },
            { icon:"👷", label:"Provider", val: b.providerName || "Assigned Professional" },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ display:"flex", flexDirection:"column", gap:2 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--qs-text3)" }}>
                {icon} {label}
              </span>
              <span style={{ fontSize:13, color:"var(--qs-text)", fontWeight:500, lineHeight:1.4 }}>
                {val}
              </span>
            </div>
          ))}
          {b.address && (
            <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:2 }}>
              <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"var(--qs-text3)" }}>
                📍 Address
              </span>
              <span style={{ fontSize:13, color:"var(--qs-text)", fontWeight:500, lineHeight:1.4 }}>
                {b.address}
              </span>
            </div>
          )}
        </div>

        {b.status !== "CANCELLED" && (
          <div>
            <div style={{ display:"flex", gap:4, marginBottom:5 }}>
              {progressSteps.map((st, si) => {
                var done = currentStep >= si;
                var stm  = statusMeta(st);
                return (
                  <div key={st} style={{ flex:1, position:"relative" }}>
                    <div style={{
                      height:4, borderRadius:99,
                      background: done ? stm.color : "rgba(255,255,255,0.07)",
                      transition:"background 0.4s ease"
                    }}/>
                    <div style={{
                      width:10, height:10, borderRadius:"50%",
                      background: done ? stm.color : "rgba(255,255,255,0.1)",
                      border:"2px solid " + (done ? stm.color : "rgba(255,255,255,0.15)"),
                      position:"absolute", top:-3, left:"50%", transform:"translateX(-50%)",
                      transition:"all 0.3s ease"
                    }}/>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
              {["Booked","Confirmed","On the way","Done"].map((l, li) => (
                <div key={l} style={{
                  flex:1, textAlign:"center",
                  fontSize:10, fontWeight: currentStep >= li ? 600 : 400,
                  color: currentStep >= li ? "var(--qs-text2)" : "var(--qs-text3)",
                  letterSpacing:"0.03em"
                }}>{l}</div>
              ))}
            </div>
          </div>
        )}

        {b.bookingId && (
          <div style={{ fontSize:10, color:"var(--qs-text3)", marginTop:10, fontFamily:"var(--qs-ff-mono)" }}>
            Booking #{b.bookingId}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MY BOOKINGS PAGE
═══════════════════════════════════════════════════════════════════════════ */
function MyBookingsPage({ bookings, onCancel, onBack, onRefresh, onReviewSubmit }) {
  useGlobalStyles();
  var [filter, setFilter]     = useState("ALL");
  var [search, setSearch]     = useState("");
  var [reviewTarget, setReviewTarget] = useState(null);

  var filters = ["ALL","PENDING","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"];

  useEffect(() => {
    var iv = setInterval(onRefresh, 10000);
    return () => clearInterval(iv);
  }, [onRefresh]);

  var filtered = bookings.filter(b => {
    if (filter !== "ALL" && b.status !== filter) return false;
    if (search) {
      var q = search.toLowerCase();
      var name = (b.serviceName || "").toLowerCase();
      var cat  = (b.serviceCategory || "").toLowerCase();
      if (!name.includes(q) && !cat.includes(q) && !(b.address||"").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  var stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "PENDING").length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    inProg:    bookings.filter(b => b.status === "IN_PROGRESS").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
    cancelled: bookings.filter(b => b.status === "CANCELLED").length,
    spent:     bookings.filter(b => b.status === "COMPLETED").reduce((a, b) => a + (Number(b.amount) || 0), 0),
    pending_review: bookings.filter(b => b.status === "COMPLETED" && !b.reviewSubmitted).length,
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--qs-bg)", fontFamily:"var(--qs-ff-body)" }}>
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={(id, stars) => { onReviewSubmit(id, stars); setReviewTarget(null); }}
        />
      )}

      <div style={{
        background:"linear-gradient(135deg,#020917 0%,#061a4a 60%,#071638 100%)",
        padding:"36px 32px 28px", position:"relative", overflow:"hidden"
      }}>
        <button onClick={onBack} style={{
          background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13, color:"var(--qs-text2)",
          fontFamily:"var(--qs-ff-body)", marginBottom:20, display:"inline-flex", alignItems:"center", gap:6
        }}>← Back to Services</button>

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--qs-blue)", marginBottom:8 }}>
          MY BOOKINGS
        </div>
        <h1 style={{ fontFamily:"var(--qs-ff-display)", fontSize:28, fontWeight:700, color:"var(--qs-text)", marginBottom:16, letterSpacing:"-0.02em" }}>
          Your Service History
        </h1>

        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[
            { label:"Total",      value:stats.total,     color:"#4f9eff" },
            { label:"Pending",    value:stats.pending,   color:"#f59e0b" },
            { label:"Confirmed",  value:stats.confirmed, color:"#60a5fa" },
            { label:"In Progress",value:stats.inProg,    color:"#8b5cf6" },
            { label:"Completed",  value:stats.completed, color:"#10b981" },
            { label:"Cancelled",  value:stats.cancelled, color:"#ef4444" },
            { label:"Total Spent",value:"₹" + stats.spent.toLocaleString("en-IN"), color:"#c084fc" },
          ].map((s, i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,0.05)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"10px 16px",
            }}>
              <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {stats.pending_review > 0 && (
          <div style={{
            marginTop:16, padding:"10px 16px", borderRadius:10,
            background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)",
            fontSize:13, color:"#fbbf24", display:"inline-flex", alignItems:"center", gap:8
          }}>
            ⭐ You have <strong>{stats.pending_review}</strong> completed service{stats.pending_review > 1 ? "s" : ""} awaiting your review!
          </div>
        )}
      </div>

      <div style={{ padding:"24px 28px 60px", maxWidth:920, margin:"0 auto" }}>
        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--qs-text3)", fontSize:14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by service, category, address…"
              style={{
                width:"100%", padding:"10px 14px 10px 36px", background:"var(--qs-surface)",
                border:"1px solid var(--qs-border2)", borderRadius:10, color:"var(--qs-text)",
                fontFamily:"var(--qs-ff-body)", fontSize:13, outline:"none", boxSizing:"border-box"
              }}/>
          </div>
          <button onClick={onRefresh} style={{
            background:"rgba(79,158,255,0.12)", border:"1px solid rgba(79,158,255,0.25)",
            borderRadius:9, padding:"9px 16px", cursor:"pointer", fontSize:12, fontWeight:600,
            color:"#60a5fa", fontFamily:"var(--qs-ff-body)", display:"flex", alignItems:"center", gap:6
          }}>↻ Refresh</button>
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
          {filters.map(f => {
            var m   = statusMeta(f);
            var act = filter === f;
            var cnt = f === "ALL" ? bookings.length : bookings.filter(b => b.status === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"7px 15px", borderRadius:99, cursor:"pointer", fontSize:11, fontWeight:700,
                border:"1px solid " + (act ? m.color : "var(--qs-border2)"),
                background: act ? m.bg : "transparent",
                color: act ? m.color : "var(--qs-text2)",
                fontFamily:"var(--qs-ff-body)", transition:"all 0.15s", letterSpacing:"0.04em",
                display:"flex", alignItems:"center", gap:5
              }}>
                {f === "ALL" ? "All" : m.icon + " " + m.label}
                <span style={{
                  background: act ? m.color + "30" : "rgba(255,255,255,0.06)",
                  color: act ? m.color : "var(--qs-text3)",
                  borderRadius:99, padding:"1px 7px", fontSize:10
                }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 24px" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📋</div>
            <div style={{ fontSize:18, fontWeight:700, color:"var(--qs-text)", marginBottom:8 }}>No bookings found</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {filtered.map((b, i) => (
              <BookingCard
                key={b.bookingId || i}
                b={b}
                index={i}
                onCancel={onCancel}
                onReview={setReviewTarget}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKING MODAL — 3 steps
═══════════════════════════════════════════════════════════════════════════ */
function BookingModal({ item, onClose, onConfirm, customerEmail, customerName }) {
  var [step, setStep]       = useState(1);
  var [date, setDate]       = useState("");
  var [slot, setSlot]       = useState("");
  var [addr, setAddr]       = useState("");
  var [city, setCity]       = useState(localStorage.getItem("userLocation") || "");
  var [pin, setPin]         = useState("");
  var [note, setNote]       = useState("");
  var [pay, setPay]         = useState("upi");
  var [upi, setUpi]         = useState("");
  var [cardNum, setCardNum] = useState("");
  var [cardName, setCardName] = useState("");
  var [cardExp, setCardExp] = useState("");
  var [cardCvv, setCardCvv] = useState("");
  var [busy, setBusy]       = useState(false);
  var [errs, setErrs]       = useState({});
  var [bookErr, setBookErr] = useState("");

  if (!item) return null;
  var ss = item.subService, svc = item.service, provider = item.provider;
  var gst   = Math.round(ss.price * 0.18);
  var total = ss.price + gst + 49;
  var today = new Date();
  var minDate = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  function v1() {
    var e = {};
    if (!date) e.date = "Select a date";
    if (!slot) e.slot = "Select a time slot";
    if (!addr.trim()) e.addr = "Address is required";
    if (!city.trim()) e.city = "City is required";
    if (!pin || pin.length !== 6) e.pin = "6-digit PIN required";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function v2() {
    var e = {};
    if (pay === "upi" && !upi.trim()) e.upi = "Enter UPI ID";
    if (pay === "card") {
      if (cardNum.replace(/\s/g, "").length !== 16) e.cardNum = "Enter 16-digit number";
      if (!cardName.trim()) e.cardName = "Cardholder name required";
      if (!cardExp.trim()) e.cardExp = "Enter expiry MM/YY";
      if (cardCvv.length !== 3) e.cardCvv = "3-digit CVV required";
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function handlePay() {
    if (!v2()) return;
    setBusy(true);
    setBookErr("");

    try {
      var cId = parseInt(localStorage.getItem("userId") || "0");
      var fullAddress = addr + ", " + city + " - " + pin;

      // ── FIX: resolve providerId correctly ──────────────────────────────
      // Try multiple ways to get the provider's numeric ID
      var resolvedProviderId = null;
      if (provider) {
        resolvedProviderId = provider.providerId || provider.id || null;
        // Convert to number if it's a string
        if (resolvedProviderId !== null) {
          resolvedProviderId = parseInt(resolvedProviderId) || null;
        }
      }

      var payload = {
        customerId:      cId,
        providerId:      resolvedProviderId,          // ← FIXED: proper numeric ID or null
        serviceName:     ss.name,
        serviceCategory: svc.label,
        serviceDate:     date,
        timeSlot:        slot,
        address:         fullAddress,
        amount:          total,
        paymentMethod:   pay,
        notes:           note,
        status:          "PENDING",
        customerName:    localStorage.getItem("userName")  || customerName || "Customer",
        customerPhone:   localStorage.getItem("userPhone") || "",
        providerName:    provider ? (provider.name || provider.providerName || "Assigned Professional") : "Assigned Professional",
      };

      console.log("📦 Booking payload:", payload); // debug log

      var res = await fetch(BASE + "/api/booking/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        var t = await res.text();
        setBookErr("Booking failed: " + t);
        setBusy(false);
        return;
      }

      var saved = await res.json();
      console.log("✅ Booking saved:", saved); // debug log
      setBusy(false);
      setStep(3);

      sendBookingEmail({
        toEmail:      customerEmail,
        toName:       customerName,
        serviceName:  svc.label,
        subServiceName: ss.name,
        date,
        slot,
        address:      fullAddress,
        amount:       total,
        bookingId:    saved.bookingId || "N/A",
        providerName: provider ? (provider.name || provider.providerName || "Assigned Professional") : "Assigned Professional",
        payMethod:    pay,
      });

      onConfirm({
        bookingId:       saved.bookingId,
        serviceName:     ss.name,
        serviceCategory: svc.label,
        date,
        timeSlot:        slot,
        serviceDate:     date,
        address:         fullAddress,
        amount:          total,
        paymentMethod:   pay,
        status:          "PENDING",
        providerId:      resolvedProviderId,
        providerName:    provider ? (provider.name || provider.providerName || "Assigned Professional") : "Assigned Professional",
      });

    } catch (e) {
      setBookErr("Network error. Please try again.");
      setBusy(false);
    }
  }

  function fmtCard(v) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
  function fmtExp(v)  { var d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; }

  var LBL = { fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--qs-text2)", display:"block", marginBottom:6 };
  var INP = {
    width:"100%", padding:"12px 14px", fontSize:14, borderRadius:10,
    border:"1.5px solid var(--qs-border2)", background:"var(--qs-bg2)", color:"var(--qs-text)",
    outline:"none", boxSizing:"border-box", fontFamily:"var(--qs-ff-body)", transition:"border-color 0.2s"
  };

  if (step === 3) return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000, background:"rgba(2,9,23,0.8)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16
    }} onClick={onClose}>
      <div style={{
        background:"var(--qs-surface)", borderRadius:24, maxWidth:420, width:"100%",
        padding:"44px 36px", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
        animation:"popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          width:80, height:80, borderRadius:"50%",
          background:"linear-gradient(135deg,#10b981,#34d399)",
          margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:36, boxShadow:"0 12px 32px rgba(16,185,129,0.4)", animation:"successBounce 0.5s ease"
        }}>✓</div>
        <div style={{ fontSize:22, fontWeight:700, color:"var(--qs-text)", marginBottom:6 }}>Booking Confirmed!</div>
        <div style={{ fontSize:13, color:"var(--qs-text2)", marginBottom:20, lineHeight:1.65 }}>
          A confirmation email has been sent to<br/>
          <strong style={{ color:"var(--qs-blue)" }}>{customerEmail}</strong>
        </div>
        <div style={{
          background:"var(--qs-bg2)", borderRadius:14, padding:"16px 18px",
          textAlign:"left", fontSize:13, color:"var(--qs-text)", marginBottom:24, lineHeight:1.9
        }}>
          <div>🔧 <strong>{ss.name}</strong></div>
          <div>📅 {date} &nbsp;⏰ {slot}</div>
          <div>📍 {addr}, {city} - {pin}</div>
          <div>💳 {pay === "cod" ? "Pay on Delivery" : pay === "upi" ? "UPI" : "Card"}</div>
          <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid var(--qs-border2)" }}>
            <strong style={{ color:"var(--qs-blue)" }}>Total: ₹{total}</strong>
          </div>
        </div>
        <button onClick={onClose} style={{
          width:"100%", padding:"13px", background:"var(--qs-grad)", color:"#fff",
          border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer",
          boxShadow:"0 6px 20px rgba(79,158,255,0.3)"
        }}>View My Bookings</button>
      </div>
    </div>
  );

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000, background:"rgba(2,9,23,0.8)",
      backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16
    }} onClick={onClose}>
      <div style={{
        background:"var(--qs-surface)", borderRadius:20, width:"100%", maxWidth:520,
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.5)",
        animation:"slideUp 0.45s cubic-bezier(0.34,1.4,0.64,1)"
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          background:"linear-gradient(135deg,#020917,#061a4a)",
          borderRadius:"20px 20px 0 0", padding:"22px 24px"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#60a5fa", marginBottom:5 }}>
                Step {step} of 2 — {step === 1 ? "Booking Details" : "Payment"}
              </div>
              <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>{svc.icon} {ss.name}</div>
              <div style={{ fontSize:12, color:"#7e97c4", marginTop:3 }}>{svc.label} · {ss.time} · ₹{ss.price}</div>
            </div>
            <button onClick={onClose} style={{
              background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:10, width:34, height:34, cursor:"pointer", color:"#fff",
              fontSize:14, display:"flex", alignItems:"center", justifyContent:"center"
            }}>✕</button>
          </div>
          <div style={{ marginTop:14, background:"rgba(255,255,255,0.1)", borderRadius:99, height:4 }}>
            <div style={{
              width: step === 1 ? "50%" : "100%",
              background:"var(--qs-blue)", borderRadius:99, height:4, transition:"width 0.4s ease"
            }}/>
          </div>
        </div>

        <div style={{ padding:24 }}>
          {bookErr && (
            <div style={{
              background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
              borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#f87171"
            }}>⚠ {bookErr}</div>
          )}

          {step === 1 && (
            <div>
              <div style={{ marginBottom:16 }}>
                <label style={LBL}>Select Date *</label>
                <input type="date" value={date} min={minDate}
                  onChange={e => { setDate(e.target.value); setErrs(p => ({ ...p, date:"" })); }}
                  style={{ ...INP, borderColor: errs.date ? "#ef4444" : "var(--qs-border2)" }}/>
                {errs.date && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.date}</div>}
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={LBL}>Time Slot *{errs.slot && <span style={{ color:"#f87171", fontWeight:400, textTransform:"none", letterSpacing:0 }}> — {errs.slot}</span>}</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {TIME_SLOTS.map(t => {
                    var act = slot === t;
                    return (
                      <button key={t} onClick={() => { setSlot(t); setErrs(p => ({ ...p, slot:"" })); }}
                        style={{
                          padding:"9px 4px", borderRadius:9, cursor:"pointer", fontSize:12,
                          fontWeight: act ? 700 : 500,
                          background: act ? "var(--qs-blue)" : "var(--qs-bg2)",
                          color: act ? "#fff" : "var(--qs-text2)",
                          border:"1.5px solid " + (act ? "var(--qs-blue)" : errs.slot ? "#ef4444" : "var(--qs-border2)"),
                          transition:"all 0.15s"
                        }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom:12 }}>
                <label style={LBL}>Full Address *</label>
                <input value={addr} onChange={e => { setAddr(e.target.value); setErrs(p => ({ ...p, addr:"" })); }}
                  placeholder="Street, house no, landmark…"
                  style={{ ...INP, borderColor: errs.addr ? "#ef4444" : "var(--qs-border2)" }}/>
                {errs.addr && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.addr}</div>}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={LBL}>City *</label>
                  <input value={city} onChange={e => { setCity(e.target.value); setErrs(p => ({ ...p, city:"" })); }}
                    placeholder="e.g. Hyderabad"
                    style={{ ...INP, borderColor: errs.city ? "#ef4444" : "var(--qs-border2)" }}/>
                  {errs.city && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.city}</div>}
                </div>
                <div>
                  <label style={LBL}>PIN Code *</label>
                  <input value={pin}
                    onChange={e => { setPin(e.target.value.replace(/\D/g, "").slice(0, 6)); setErrs(p => ({ ...p, pin:"" })); }}
                    placeholder="6-digit PIN"
                    style={{ ...INP, borderColor: errs.pin ? "#ef4444" : "var(--qs-border2)" }}/>
                  {errs.pin && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.pin}</div>}
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={LBL}>Special Notes (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  placeholder="Any special instructions for the professional…"
                  style={{ ...INP, resize:"vertical" }}/>
              </div>

              <div style={{ background:"var(--qs-bg2)", borderRadius:12, padding:"14px 16px", marginBottom:20, fontSize:13 }}>
                {[[`${ss.name}`, `₹${ss.price}`], ["GST (18%)", `₹${gst}`], ["Platform Fee", "₹49"]].map(([k, v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", color:"var(--qs-text2)", marginBottom:6 }}>
                    <span>{k}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid var(--qs-border2)", marginTop:8, paddingTop:8, display:"flex", justifyContent:"space-between", fontWeight:700, color:"var(--qs-text)", fontSize:15 }}>
                  <span>Total</span><span style={{ color:"var(--qs-blue)" }}>₹{total}</span>
                </div>
              </div>

              <button onClick={() => { if (v1()) setStep(2); }} style={{
                width:"100%", padding:"13px", background:"var(--qs-grad)", color:"#fff",
                border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer",
                boxShadow:"0 4px 16px rgba(79,158,255,0.3)"
              }}>Continue to Payment →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
                {[["upi","📱","UPI"], ["card","💳","Card"], ["cod","💵","Cash"]].map(([id, ic, lb]) => (
                  <button key={id} onClick={() => setPay(id)} style={{
                    padding:"12px 8px", borderRadius:12, cursor:"pointer", textAlign:"center",
                    background: pay === id ? "rgba(79,158,255,0.1)" : "var(--qs-bg2)",
                    border:"1.5px solid " + (pay === id ? "var(--qs-blue)" : "var(--qs-border2)"),
                    transition:"all 0.15s"
                  }}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{ic}</div>
                    <div style={{ fontSize:12, fontWeight:700, color: pay === id ? "var(--qs-blue)" : "var(--qs-text2)" }}>{lb}</div>
                  </button>
                ))}
              </div>

              {pay === "upi" && (
                <div style={{ marginBottom:16 }}>
                  <label style={LBL}>UPI ID *</label>
                  <input value={upi} onChange={e => { setUpi(e.target.value); setErrs(p => ({ ...p, upi:"" })); }}
                    placeholder="yourname@upi"
                    style={{ ...INP, borderColor: errs.upi ? "#ef4444" : "var(--qs-border2)" }}/>
                  {errs.upi && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.upi}</div>}
                </div>
              )}

              {pay === "card" && (
                <div>
                  <div style={{ marginBottom:12 }}>
                    <label style={LBL}>Card Number *</label>
                    <input value={cardNum}
                      onChange={e => { setCardNum(fmtCard(e.target.value)); setErrs(p => ({ ...p, cardNum:"" })); }}
                      placeholder="0000 0000 0000 0000" maxLength={19}
                      style={{ ...INP, borderColor: errs.cardNum ? "#ef4444" : "var(--qs-border2)", letterSpacing:"0.1em" }}/>
                    {errs.cardNum && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.cardNum}</div>}
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={LBL}>Cardholder Name *</label>
                    <input value={cardName}
                      onChange={e => { setCardName(e.target.value); setErrs(p => ({ ...p, cardName:"" })); }}
                      placeholder="As on card"
                      style={{ ...INP, borderColor: errs.cardName ? "#ef4444" : "var(--qs-border2)" }}/>
                    {errs.cardName && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.cardName}</div>}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                    <div>
                      <label style={LBL}>Expiry MM/YY *</label>
                      <input value={cardExp}
                        onChange={e => { setCardExp(fmtExp(e.target.value)); setErrs(p => ({ ...p, cardExp:"" })); }}
                        placeholder="MM/YY" maxLength={5}
                        style={{ ...INP, borderColor: errs.cardExp ? "#ef4444" : "var(--qs-border2)" }}/>
                      {errs.cardExp && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.cardExp}</div>}
                    </div>
                    <div>
                      <label style={LBL}>CVV *</label>
                      <input value={cardCvv}
                        onChange={e => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3)); setErrs(p => ({ ...p, cardCvv:"" })); }}
                        placeholder="123" maxLength={3} type="password"
                        style={{ ...INP, borderColor: errs.cardCvv ? "#ef4444" : "var(--qs-border2)" }}/>
                      {errs.cardCvv && <div style={{ fontSize:11, color:"#f87171", marginTop:4 }}>⚠ {errs.cardCvv}</div>}
                    </div>
                  </div>
                </div>
              )}

              {pay === "cod" && (
                <div style={{
                  background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)",
                  borderRadius:12, padding:"14px 16px", marginBottom:16, fontSize:13, color:"#fbbf24"
                }}>
                  💵 You'll pay <strong>₹{total}</strong> in cash when the professional arrives.
                </div>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setStep(1)} style={{
                  flex:1, padding:"13px", background:"var(--qs-bg2)", color:"var(--qs-text2)",
                  border:"1px solid var(--qs-border2)", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer"
                }}>← Back</button>
                <button onClick={handlePay} disabled={busy} style={{
                  flex:2, padding:"13px",
                  background: busy ? "rgba(79,158,255,0.4)" : "var(--qs-grad)",
                  color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700,
                  cursor: busy ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  transition:"all 0.2s", boxShadow:"0 4px 16px rgba(79,158,255,0.3)"
                }}>
                  {busy
                    ? <><span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", display:"inline-block", animation:"spin 0.7s linear infinite" }}/> Processing…</>
                    : `Pay ₹${total} ${pay === "cod" ? "(COD)" : pay === "upi" ? "via UPI" : "via Card"}`
                  }
                </button>
              </div>
              <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"var(--qs-text3)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                🔒 256-bit SSL secured payment
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-SERVICE MODAL
═══════════════════════════════════════════════════════════════════════════ */
function SubServiceModal({ svc, provider, onClose, onBook }) {
  if (!svc) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999, background:"rgba(2,9,23,0.82)",
      backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16
    }} onClick={onClose}>
      <div style={{
        background:"var(--qs-surface)", borderRadius:22, width:"100%", maxWidth:520,
        maxHeight:"88vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
        animation:"slideUp 0.42s cubic-bezier(0.34,1.4,0.64,1)"
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          background:"linear-gradient(135deg,#020917,#061a4a)",
          borderRadius:"22px 22px 0 0", padding:"24px 26px",
          position:"sticky", top:0, zIndex:1, borderBottom:"1px solid var(--qs-border2)"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:32, marginBottom:8 }}>{svc.icon}</div>
              <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:4 }}>{svc.label}</div>
              <div style={{ fontSize:13, color:"var(--qs-text2)" }}>{svc.description}</div>
              <div style={{ marginTop:6, fontSize:12, color:"#a5b4fc" }}>📍 {svc.location}</div>
              {provider ? (
                <div style={{ marginTop:6, fontSize:12, color:"#60a5fa", display:"flex", alignItems:"center", gap:6 }}>
                  👷 {provider.name || provider.providerName || "Assigned Professional"}
                  {provider.experience && <span>· {provider.experience}</span>}
                </div>
              ) : (
                <div style={{
                  marginTop:8, fontSize:11, color:"#f59e0b",
                  background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)",
                  borderRadius:6, padding:"4px 10px", display:"inline-block"
                }}>⚠ No provider registered yet — booking will be unassigned</div>
              )}
            </div>
            <button onClick={onClose} style={{
              background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:10, width:36, height:36, cursor:"pointer", color:"#fff", fontSize:15,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
            }}>✕</button>
          </div>
        </div>

        <div style={{ padding:"20px 24px 28px" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--qs-text3)", marginBottom:14 }}>
            {svc.subServices.length} Services Available
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {svc.subServices.map((ssItem, i) => (
              <div key={ssItem.name} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"var(--qs-bg2)", border:"1px solid var(--qs-border2)",
                borderRadius:13, padding:"14px 16px",
                animation:`bookingIn 0.35s ease ${i * 50}ms both`
              }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--qs-text)", marginBottom:3 }}>{ssItem.name}</div>
                  <div style={{ fontSize:12, color:"var(--qs-text3)", display:"flex", alignItems:"center", gap:4 }}>
                    <span>⏱</span><span>{ssItem.time}</span>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:16, fontWeight:700, color:"var(--qs-blue)" }}>₹{ssItem.price}</div>
                    <div style={{ fontSize:10, color:"var(--qs-text3)" }}>+GST</div>
                  </div>
                  <button onClick={() => onBook(svc, ssItem, provider)} style={{
                    padding:"9px 18px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700,
                    background:"var(--qs-grad)", color:"#fff", border:"none",
                    boxShadow:"0 4px 12px rgba(79,158,255,0.25)", whiteSpace:"nowrap"
                  }}>Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN CUSTOMER DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
export default function CustomerDashboard() {
  useGlobalStyles();
  var [page, setPage]             = useState("services");
  var [expandedSvc, setExpSvc]    = useState(null);
  var [search, setSearch]         = useState("");
  var [activeTag, setTag]         = useState("All");
  var [priceSort, setPriceSort]   = useState("none");
  var [cityFilter, setCityFilter] = useState("All Cities");
  var [bookingItem, setItem]      = useState(null);
  var [myBookings, setMy]         = useState([]);
  var [providers, setProvs]       = useState([]);
  var [toast, setToast]           = useState({ msg:"", type:"" });
  var [mounted, setMounted]       = useState(false);
  var [showLogout, setShowLogout] = useState(false);

  var name  = localStorage.getItem("userName")  || "Guest";
  var email = localStorage.getItem("userEmail") || "";
  var loc   = localStorage.getItem("userLocation") || "";
  var uid   = parseInt(localStorage.getItem("userId") || "0");

  useEffect(() => {
    var t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch(BASE + "/api/providers/all")
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d)) {
          console.log("📋 Providers loaded:", d); // debug
          setProvs(d);
        }
      })
      .catch(() => {});
  }, []);

  const fetchBookings = useCallback(() => {
    if (!uid) return;
    fetch(BASE + "/api/booking/customer/" + uid)
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d)) {
          var normalised = d.map(b => ({
            ...b,
            serviceName:     b.serviceName     || b.service      || b.subServiceName || b.serviceType || "",
            serviceCategory: b.serviceCategory || b.category     || b.serviceCat     || b.categoryName || "",
            serviceDate:     b.serviceDate     || b.date         || b.bookingDate     || b.scheduledDate || "",
            timeSlot:        b.timeSlot        || b.slot         || b.time            || b.scheduledTime || "",
            address:         b.address         || b.serviceAddress || b.location       || "",
            amount:          b.amount          || b.totalAmount  || b.price           || 0,
            paymentMethod:   b.paymentMethod   || b.payment      || b.payMethod       || "",
            providerName:    b.providerName    || b.provider     || b.assignedProvider || "Assigned Professional",
            status:          (b.status || "PENDING").toUpperCase(),
            reviewSubmitted: b.reviewSubmitted || false,
            reviewRating:    b.reviewRating    || 0,
          }));
          setMy(normalised);
        }
      })
      .catch(() => {});
  }, [uid]);

  useEffect(() => {
    fetchBookings();
    var iv = setInterval(fetchBookings, 12000);
    return () => clearInterval(iv);
  }, [fetchBookings]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"" }), 3500);
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      var r = await fetch(BASE + "/api/booking/status/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status:"CANCELLED" }),
      });
      if (r.ok) {
        showToast("Booking cancelled.");
        fetchBookings();
      } else {
        showToast("Failed to cancel.", "error");
      }
    } catch (e) {
      showToast("Network error.", "error");
    }
  }

  function handleReviewSubmit(bookingId, stars) {
    setMy(prev => prev.map(b =>
      (b.bookingId === bookingId || b.id === bookingId)
        ? { ...b, reviewSubmitted:true, reviewRating:stars }
        : b
    ));
    showToast("⭐ Review submitted! Thank you.");
  }

  // ── FIX: improved provider matching — tries multiple field names ──────────
  function findProvider(svc) {
    var cat = svc.label.toLowerCase().trim();
    // Try exact match first
    var match = providers.find(p =>
      p.category && p.category.toLowerCase().trim() === cat && !p.blocked
    );
    // Try partial match
    if (!match) {
      match = providers.find(p =>
        p.category && p.category.toLowerCase().includes(cat.split(" ")[0]) && !p.blocked
      );
    }
    // Try reverse partial match (provider category contains first word of service)
    if (!match) {
      match = providers.find(p =>
        p.category && cat.includes(p.category.toLowerCase().split(" ")[0]) && !p.blocked
      );
    }
    console.log(`🔍 Finding provider for "${svc.label}":`, match || "none found");
    return match || null;
  }

  function openBook(svc, ssItem) {
    var match = findProvider(svc);
    setItem({ service:svc, subService:ssItem, provider:match });
  }

  function handleConfirm(booking) {
    setMy(prev => [booking, ...prev]);
    setPage("bookings");
    showToast("🎉 Booking confirmed! Waiting for provider to accept.");
    setTimeout(fetchBookings, 2000);
  }

  function handleLogout() {
    ["userId","userName","userEmail","userLocation","userRole"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  }

  var TAGS = ["All", ...new Set(SERVICES.map(s => s.tag))];

  var filtered = SERVICES.filter(s => {
    if (activeTag !== "All" && s.tag !== activeTag) return false;
    if (cityFilter !== "All Cities" && s.location !== cityFilter) return false;
    if (search) {
      var q = search.toLowerCase();
      if (
        !s.label.toLowerCase().includes(q) &&
        !s.description.toLowerCase().includes(q) &&
        !s.tag.toLowerCase().includes(q) &&
        !s.location.toLowerCase().includes(q) &&
        !s.subServices.some(ssItem => ssItem.name.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });

  if (priceSort !== "none") {
    filtered = [...filtered].sort((a, b) => {
      var minA = Math.min(...a.subServices.map(s => s.price));
      var minB = Math.min(...b.subServices.map(s => s.price));
      return priceSort === "low-high" ? minA - minB : minB - minA;
    });
  }

  var pendingCount = myBookings.filter(b => b.status === "PENDING" || b.status === "CONFIRMED").length;
  var reviewCount  = myBookings.filter(b => b.status === "COMPLETED" && !b.reviewSubmitted).length;

  var SELECT_STYLE = {
    padding:"9px 12px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer",
    background:"var(--qs-surface)", border:"1px solid var(--qs-border2)",
    color:"var(--qs-text2)", fontFamily:"var(--qs-ff-body)", outline:"none"
  };

  if (page === "bookings") return (
    <>
      <Toast msg={toast.msg} type={toast.type}/>
      <MyBookingsPage
        bookings={myBookings}
        onCancel={handleCancel}
        onBack={() => setPage("services")}
        onRefresh={fetchBookings}
        onReviewSubmit={handleReviewSubmit}
      />
    </>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--qs-bg)", fontFamily:"var(--qs-ff-body)" }}>
      <Toast msg={toast.msg} type={toast.type}/>
      {showLogout && <LogoutModal onConfirm={handleLogout} onClose={() => setShowLogout(false)}/>}

      {bookingItem && (
        <BookingModal
          item={bookingItem}
          onClose={() => setItem(null)}
          onConfirm={b => { handleConfirm(b); setItem(null); }}
          customerEmail={email}
          customerName={name}
        />
      )}

      {expandedSvc && (
        <SubServiceModal
          svc={expandedSvc.svc}
          provider={expandedSvc.provider}
          onClose={() => setExpSvc(null)}
          onBook={(svc, ssItem, prov) => { setExpSvc(null); setItem({ service:svc, subService:ssItem, provider:prov }); }}
        />
      )}

      {/* Navbar */}
      <nav style={{
        position:"sticky", top:0, zIndex:100, height:62, display:"flex",
        alignItems:"center", justifyContent:"space-between", padding:"0 28px",
        background:"rgba(2,9,23,0.92)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid var(--qs-border2)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"var(--qs-grad)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
          <span style={{ fontFamily:"var(--qs-ff-display)", fontSize:18, fontWeight:700, color:"var(--qs-text)" }}>QuickServ</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => setPage("bookings")} style={{
            position:"relative", padding:"8px 18px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600,
            background:"var(--qs-surface)", border:"1px solid var(--qs-border2)", color:"var(--qs-text2)",
            fontFamily:"var(--qs-ff-body)", transition:"all 0.2s", display:"flex", alignItems:"center", gap:6
          }}>
            📋 My Bookings
            {reviewCount > 0 && (
              <span style={{
                position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%",
                background:"#f59e0b", color:"#fff", fontSize:10, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>⭐</span>
            )}
            {reviewCount === 0 && pendingCount > 0 && (
              <span style={{
                position:"absolute", top:-6, right:-6, width:18, height:18, borderRadius:"50%",
                background:"var(--qs-blue)", color:"#fff", fontSize:10, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>{pendingCount}</span>
            )}
          </button>
          <button className="logout-btn" onClick={() => setShowLogout(true)} style={{
            padding:"8px 16px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600,
            background:"var(--qs-surface)", border:"1px solid var(--qs-border2)", color:"var(--qs-text2)",
            fontFamily:"var(--qs-ff-body)", transition:"all 0.2s", display:"flex", alignItems:"center", gap:6
          }}>🚪 Logout</button>
          <div style={{
            width:34, height:34, borderRadius:"50%", background:"var(--qs-grad)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:"#fff"
          }}>{name.charAt(0).toUpperCase()}</div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background:"linear-gradient(135deg,#020917 0%,#061a4a 55%,#071638 100%)",
        padding:"40px 32px 36px", position:"relative", overflow:"hidden",
        animation: mounted ? "heroIn 0.6s ease both" : "none"
      }}>
        <div style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--qs-blue)", marginBottom:8 }}>
            CUSTOMER DASHBOARD
          </div>
          <h1 style={{ fontFamily:"var(--qs-ff-display)", fontSize:"clamp(24px,4vw,36px)", fontWeight:700, color:"var(--qs-text)", marginBottom:8, letterSpacing:"-0.02em" }}>
            Welcome back, {name} 👋
          </h1>
          <p style={{ fontSize:14, color:"var(--qs-text2)", marginBottom:28 }}>
            📍 {loc || "Hyderabad"} &nbsp;·&nbsp; {SERVICES.length} services available &nbsp;·&nbsp; {myBookings.length} booking{myBookings.length !== 1 ? "s" : ""}
          </p>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            {[
              { icon:"📋", label:"Total Bookings", value:myBookings.length, color:"#4f9eff" },
              { icon:"⏳", label:"Pending",        value:myBookings.filter(b => b.status === "PENDING").length, color:"#f59e0b" },
              { icon:"✅", label:"Completed",      value:myBookings.filter(b => b.status === "COMPLETED").length, color:"#10b981" },
              { icon:"⭐", label:"Pending Reviews",value:reviewCount, color:"#f59e0b" },
              { icon:"💰", label:"Total Spent",    value:"₹" + myBookings.filter(b => b.status === "COMPLETED").reduce((a, b) => a + (Number(b.amount) || 0), 0).toLocaleString("en-IN"), color:"#c084fc" },
            ].map((s, i) => (
              <div key={i} style={{
                background:"rgba(255,255,255,0.05)", backdropFilter:"blur(10px)",
                border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 18px",
                minWidth:130, animation: mounted ? `cardAnim 0.5s ease ${i * 80 + 200}ms both` : "none"
              }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--qs-text3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services section */}
      <div style={{ padding:"28px 32px 60px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"flex", gap:12, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, minWidth:240 }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--qs-text3)", fontSize:16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services, categories, locations…"
              style={{
                width:"100%", padding:"12px 14px 12px 42px", background:"var(--qs-surface)",
                border:"1px solid var(--qs-border2)", borderRadius:11, color:"var(--qs-text)",
                fontFamily:"var(--qs-ff-body)", fontSize:14, outline:"none", boxSizing:"border-box"
              }}/>
            {search && (
              <button onClick={() => setSearch("")} style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", color:"var(--qs-text3)", fontSize:16, padding:0
              }}>✕</button>
            )}
          </div>

          <select value={priceSort} onChange={e => setPriceSort(e.target.value)} style={SELECT_STYLE}>
            <option value="none">💰 Sort by Price</option>
            <option value="low-high">↑ Price: Low to High</option>
            <option value="high-low">↓ Price: High to Low</option>
          </select>

          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={SELECT_STYLE}>
            {ALL_CITIES.map(c => (
              <option key={c} value={c}>{c === "All Cities" ? "📍 All Cities" : "📍 " + c}</option>
            ))}
          </select>

          {(priceSort !== "none" || cityFilter !== "All Cities" || activeTag !== "All" || search) && (
            <button onClick={() => { setPriceSort("none"); setCityFilter("All Cities"); setTag("All"); setSearch(""); }} style={{
              padding:"9px 14px", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:600,
              background:"rgba(239,68,68,0.08)", color:"#f87171", border:"1px solid rgba(239,68,68,0.2)",
              fontFamily:"var(--qs-ff-body)", whiteSpace:"nowrap"
            }}>✕ Clear Filters</button>
          )}
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
          {TAGS.map((t, i) => (
            <button key={t} onClick={() => setTag(t)} style={{
              padding:"8px 16px", borderRadius:99, cursor:"pointer", fontSize:12, fontWeight:600,
              background: activeTag === t ? "var(--qs-blue)" : "transparent",
              color: activeTag === t ? "#fff" : "var(--qs-text2)",
              border:"1px solid " + (activeTag === t ? "var(--qs-blue)" : "var(--qs-border2)"),
              fontFamily:"var(--qs-ff-body)", transition:"all 0.15s",
              animation:`tagIn 0.3s ease ${i * 30}ms both`
            }}>{t}</button>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
          {filtered.map((svc, i) => (
            <div key={svc.id} className="svc-card"
              onClick={() => {
                var prov = findProvider(svc);
                setExpSvc({ svc, provider:prov });
              }}
              style={{
                background:"var(--qs-surface)", border:"1px solid var(--qs-border2)",
                borderRadius:18, overflow:"hidden", transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)",
                animation:`cardAnim 0.5s ease ${(i % 12) * 50 + 300}ms both`, cursor:"pointer"
              }}>
              <div style={{ height:160, overflow:"hidden", position:"relative", background:"var(--qs-bg2)" }}>
                <img className="svc-img" src={svc.image} alt={svc.label}
                  style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s ease", display:"block" }}
                  onError={e => { e.target.style.display = "none"; }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 40%,rgba(2,9,23,0.7) 100%)" }}/>
                <span style={{
                  position:"absolute", top:12, left:12, fontSize:10, fontWeight:700,
                  padding:"3px 10px", borderRadius:99, background:svc.tagColor + "30",
                  color:svc.tagColor, border:"1px solid " + svc.tagColor + "50", letterSpacing:"0.06em"
                }}>{svc.tag}</span>
                <span style={{
                  position:"absolute", top:12, right:12, fontSize:10, fontWeight:600,
                  padding:"3px 9px", borderRadius:99, background:"rgba(2,9,23,0.65)",
                  color:"#a5b4fc", backdropFilter:"blur(4px)", border:"1px solid rgba(165,180,252,0.2)"
                }}>📍 {svc.location}</span>
                <span style={{ position:"absolute", bottom:12, left:14, fontSize:28 }}>{svc.icon}</span>
              </div>
              <div style={{ padding:"18px 20px" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"var(--qs-text)", marginBottom:5 }}>{svc.label}</div>
                <div style={{ fontSize:12, color:"var(--qs-text2)", marginBottom:14, lineHeight:1.6 }}>{svc.description}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid var(--qs-border2)" }}>
                  <div style={{ fontSize:12, color:"var(--qs-text2)" }}>
                    From <span style={{ fontSize:17, fontWeight:700, color:"var(--qs-blue)" }}>₹{Math.min(...svc.subServices.map(s => s.price))}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"var(--qs-text3)" }}>{svc.subServices.length} services</span>
                    <div style={{ background:"var(--qs-blue)", color:"#fff", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700 }}>
                      View All →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"64px 24px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div style={{ fontSize:18, fontWeight:700, color:"var(--qs-text)", marginBottom:8 }}>No services found</div>
            <button onClick={() => { setPriceSort("none"); setCityFilter("All Cities"); setTag("All"); setSearch(""); }} style={{
              padding:"10px 24px", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:700,
              background:"var(--qs-grad)", color:"#fff", border:"none"
            }}>Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
