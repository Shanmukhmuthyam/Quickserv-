import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./Home.css";

const SERVICES = [
  { icon:"🔧", title:"Home Repair",     desc:"Expert plumbers, electricians & carpenters at your door.", color:"#f97316" },
  { icon:"🧹", title:"Deep Cleaning",   desc:"Professional sanitization & hygiene for every corner.",   color:"#06b6d4" },
  { icon:"❄️", title:"AC Service",      desc:"Repair, installation & preventive maintenance.",           color:"#3b82f6" },
  { icon:"🧰", title:"Appliance Repair",desc:"Fridge, washer, microwave & oven specialists.",            color:"#a855f7" },
  { icon:"🚿", title:"Bathroom Care",   desc:"Deep clean, tile restoration & leak fixing.",              color:"#10b981" },
  { icon:"🎨", title:"Painting",        desc:"Interior & exterior painting with premium finishes.",      color:"#f43f5e" },
];

const STEPS = [
  { icon:"🔎", num:"01", title:"Search Services",  desc:"Browse 50+ categories and find the right expert nearby." },
  { icon:"📅", num:"02", title:"Book Instantly",   desc:"Select your time slot, confirm and pay securely online." },
  { icon:"✅", num:"03", title:"Get It Done",      desc:"Your verified professional arrives and delivers quality work." },
];

const TESTIMONIALS = [
  { name:"Aarav Sharma",   city:"Visakhapatnam", rating:5, text:"Booked a plumber at 9pm — he arrived next morning sharp. Transparent pricing, zero surprises.", avatar:"AS" },
  { name:"Priya Nair",     city:"Hyderabad",     rating:5, text:"The cleaning team was incredibly thorough. My home looks brand new. Will definitely rebook!", avatar:"PN" },
  { name:"Rahul Verma",    city:"Bangalore",     rating:4, text:"AC servicing done in under an hour. The technician was polite and professional throughout.", avatar:"RV" },
];

// Simple scroll-reveal hook
function useScrollReveal() {
  useEffect(function() {
    var els = document.querySelectorAll(".qs-anim");
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function(el) { obs.observe(el); });
    return function() { obs.disconnect(); };
  }, []);
}

export default function Home() {
  const navigate   = useNavigate();
  const cursorRef  = useRef(null);
  useScrollReveal();

  useEffect(function() {
    function onMove(e) {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top  = e.clientY + "px";
      }
    }
    window.addEventListener("mousemove", onMove);
    return function() { window.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <div style={{ background:"#020917", minHeight:"100vh" }}>

      {/* Cursor glow */}
      <div className="qs-cursor" ref={cursorRef} />
      {/* Noise texture */}
      <div className="qs-noise" />

      {/* ── NAVBAR ── */}
      <nav className="qs-nav">
        <div className="qs-nav-logo" onClick={function() { navigate("/"); }}>
          <div className="qs-nav-logo-icon">⚡</div>
          <span className="qs-nav-logo-text">QuickServ</span>
        </div>

        <div className="qs-nav-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="qs-nav-actions">
          <button className="qs-btn-ghost" onClick={function() { navigate("/login"); }}>
            Login
          </button>
          <button className="qs-btn-primary" onClick={function() { navigate("/register"); }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="qs-hero">
        <div className="qs-hero-badge">
          <span className="qs-hero-badge-dot" />
          Trusted by 10,000+ homeowners across India
        </div>

        <h1 className="qs-hero-title">
          Book{" "}
          <span className="qs-hero-title-gold">Verified Pros</span>
          <br />
          For Every Home
          <br />
          <span className="qs-hero-title-dim">Service You Need</span>
        </h1>

        <p className="qs-hero-sub">
          QuickServ connects you with background-checked experts for cleaning,
          repairs, installations and more — on your schedule.
        </p>

        <div className="qs-hero-actions">
          <button className="qs-hero-btn-main" onClick={function() { navigate("/login"); }}>
            Find Services <span>→</span>
          </button>
          <button className="qs-hero-btn-sec" onClick={function() { navigate("/register"); }}>
            Become a Provider
          </button>
        </div>

        <div className="qs-hero-social-proof">
          <div className="qs-avatar-stack">
            {["👨‍🔧","👩‍🔧","🧑‍🔧","👷","👩‍💼"].map(function(e, i) {
              return <span key={i}>{e}</span>;
            })}
          </div>
          <span className="qs-proof-text">
            <strong>500+</strong> verified professionals ready
          </span>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="qs-stats">
        {[
          { num:"500+", label:"Verified Professionals" },
          { num:"10K+", label:"Services Completed" },
          { num:"4.8★", label:"Average Rating" },
          { num:"24/7", label:"Support Available" },
        ].map(function(s, i) {
          return (
            <div className="qs-stat qs-anim" key={i} style={{ transitionDelay: i * 80 + "ms" }}>
              <div className="qs-stat-num">{s.num}</div>
              <div className="qs-stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── SERVICES ── */}
      <section className="qs-section qs-services-section" id="services">
        <div className="qs-section-header qs-anim" style={{ maxWidth:1200, margin:"0 auto 56px" }}>
          <span className="qs-section-tag">What We Offer</span>
          <h2 className="qs-section-title">Popular Services</h2>
          <p className="qs-section-sub">From quick fixes to complete home makeovers — we've got you covered</p>
        </div>

        <div className="qs-services-grid">
          {SERVICES.map(function(s, i) {
            return (
              <div
                key={i}
                className="qs-service-card qs-anim"
                style={{ "--accent": s.color, transitionDelay: i * 60 + "ms" }}
                onClick={function() { navigate("/login"); }}
              >
                <div className="qs-service-icon-wrap">{s.icon}</div>
                <h3 className="qs-service-name">{s.title}</h3>
                <p className="qs-service-desc">{s.desc}</p>
                <span className="qs-service-arrow">→</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="qs-section" id="about">
        <div className="qs-about-inner">
          <div className="qs-about-text qs-anim">
            <span className="qs-section-tag">Our Story</span>
            <h2 className="qs-section-title">Why Choose QuickServ?</h2>
            <p>
              QuickServ is a modern service marketplace built to connect homeowners
              with trusted, skill-verified professionals in their local area.
            </p>
            <p>
              Every professional on our platform is background-checked, rated by
              real customers, and held to the highest standards of quality and service.
            </p>
            <div className="qs-about-badges">
              <span className="qs-badge">✅ Verified Pros</span>
              <span className="qs-badge">🔒 Secure Payments</span>
              <span className="qs-badge">⭐ Rated & Reviewed</span>
              <span className="qs-badge">📍 Local Experts</span>
            </div>
          </div>

          <div className="qs-about-visual qs-anim" style={{ transitionDelay:"120ms" }}>
            <div className="qs-about-float">
              <div className="qs-about-float-icon">🏠</div>
              <div>
                <div className="qs-about-float-title">Home Services Done Right</div>
                <div className="qs-about-float-sub">Trusted by families across India</div>
              </div>
            </div>
            <div className="qs-about-icons-grid">
              {["🔧","🧹","❄️","🎨","🌿","🔌"].map(function(e, i) {
                return <div key={i} className="qs-about-icon-cell">{e}</div>;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="qs-section qs-how-section" id="how">
        <div className="qs-section-header qs-anim" style={{ textAlign:"center", maxWidth:1000, margin:"0 auto 56px" }}>
          <span className="qs-section-tag">Simple Process</span>
          <h2 className="qs-section-title">How QuickServ Works</h2>
        </div>

        <div className="qs-steps">
          {STEPS.map(function(s, i) {
            return (
              <div key={i} className="qs-step qs-anim" style={{ transitionDelay: i * 100 + "ms" }}>
                <span className="qs-step-num">{s.num}</span>
                <div className="qs-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="qs-section">
        <div className="qs-section-header qs-anim" style={{ textAlign:"center", maxWidth:1100, margin:"0 auto 56px" }}>
          <span className="qs-section-tag">Customer Stories</span>
          <h2 className="qs-section-title">What Our Customers Say</h2>
        </div>

        <div className="qs-reviews-grid">
          {TESTIMONIALS.map(function(t, i) {
            return (
              <div key={i} className="qs-review-card qs-anim" style={{ transitionDelay: i * 80 + "ms" }}>
                <div className="qs-stars">
                  {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                </div>
                <p className="qs-review-text">"{t.text}"</p>
                <div className="qs-review-author">
                  <div className="qs-review-avatar">{t.avatar}</div>
                  <div>
                    <div className="qs-review-name">{t.name}</div>
                    <div className="qs-review-city">📍 {t.city}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <div className="qs-cta qs-anim">
        <h2 className="qs-cta-title">
          Ready to Book Your First Service?
        </h2>
        <p className="qs-cta-sub">
          Join thousands of homeowners who trust QuickServ every day.
        </p>
        <div className="qs-cta-actions">
          <button className="qs-hero-btn-main" onClick={function() { navigate("/register"); }}>
            Get Started Free →
          </button>
          <button className="qs-hero-btn-sec" onClick={function() { navigate("/login"); }}>
            Sign In
          </button>
        </div>
      </div>

      {/* ── CONTACT ── */}
      <section className="qs-section qs-contact-section" id="contact">
        <div className="qs-contact-inner">
          <div className="qs-anim">
            <span className="qs-section-tag">Get In Touch</span>
            <h2 className="qs-section-title">We're Here to Help</h2>

            <div className="qs-contact-info">
              {[
                { icon:"✉️", label:"Email",    val:"support@quickserv.com" },
                { icon:"📞", label:"Phone",    val:"+91 98765 43210" },
                { icon:"📍", label:"Location", val:"Visakhapatnam, India" },
              ].map(function(item) {
                return (
                  <div key={item.label} className="qs-contact-item">
                    <div className="qs-contact-icon">{item.icon}</div>
                    <div>
                      <div className="qs-contact-label">{item.label}</div>
                      <div className="qs-contact-val">{item.val}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qs-contact-form qs-anim" style={{ transitionDelay:"120ms" }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:18, fontWeight:700, color:"var(--text)",
                fontFamily:"var(--ff-display)", marginBottom:6 }}>
                Send us a message
              </div>
              <div style={{ fontSize:13, color:"var(--text2)" }}>
                We'll get back to you within 24 hours.
              </div>
            </div>
            <div className="qs-form-group">
              <label>Your Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
            <div className="qs-form-group">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" />
            </div>
            <div className="qs-form-group">
              <label>Message</label>
              <textarea rows={4} placeholder="How can we help you?" />
            </div>
            <button type="submit" className="qs-form-submit">
              Send Message →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="qs-footer">
        <div className="qs-footer-grid">
          <div className="qs-footer-brand">
            <div className="qs-nav-logo">
              <div className="qs-nav-logo-icon">⚡</div>
              <span className="qs-nav-logo-text">QuickServ</span>
            </div>
            <p>
              Connecting customers with trusted service professionals
              across India since 2024.
            </p>
            <div className="qs-footer-socials">
              {["𝕏","in","f"].map(function(s, i) {
                return <span key={i} className="qs-social-btn">{s}</span>;
              })}
            </div>
          </div>

          {[
            { head:"Company",  links:["About Us","Careers","Press","Contact"] },
            { head:"Services", links:["Cleaning","Repairs","Installation","AC Service"] },
            { head:"Support",  links:["Help Center","Privacy Policy","Terms of Service","Refund Policy"] },
          ].map(function(col, i) {
            return (
              <div key={i} className="qs-footer-col">
                <h4>{col.head}</h4>
                {col.links.map(function(l, j) {
                  return <p key={j}>{l}</p>;
                })}
              </div>
            );
          })}
        </div>

        <div className="qs-footer-bottom">
          <p>© 2026 QuickServ. All Rights Reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </footer>

    </div>
  );
}
