/* ===== Ace Academic Tutors, shared site chrome (nav + footer) ===== */
(function(){
  const page = document.body.dataset.page || '';
  const nav = (href,label,id)=>`<a href="${href}"${id===page?' class="active"':''}>${label}</a>`;

  const header = `
  <header class="site-header" id="siteHeader">
    <div class="wrap nav">
      <div class="nav-left">
        <a href="index.html" class="brand" aria-label="Ace Academic Tutors home">
          <img src="assets/logo-icon.png" alt="Ace Academic Tutors" class="brand-icon">
          <span class="brand-word"><span class="w-ace">Ace</span><span class="w-acad">Academic</span><span class="w-tut">Tutors</span></span>
        </a>
        <nav class="nav-links">
          ${nav('about.html','About','about')}
          ${nav('services.html','Services','services')}
          ${nav('pricing.html','Pricing','pricing')}
          ${nav('for-schools.html','For Schools','schools')}
        </nav>
      </div>
      <div class="nav-right">
        <a href="contact.html" class="btn btn-primary">Book free consultation</a>
        <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      ${nav('about.html','About','about')}
      ${nav('services.html','Services','services')}
      ${nav('pricing.html','Pricing','pricing')}
      ${nav('for-schools.html','For Schools','schools')}
      ${nav('become-a-tutor.html','Become a tutor','tutor')}
      ${nav('contact.html','Contact','contact')}
      <a href="contact.html" class="btn btn-primary">Book free consultation</a>
    </div>
  </header>`;

  const year = new Date().getFullYear();
  const footer = `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-col">
          <img src="assets/logo-reversed.png" alt="Ace Academic Tutors logo" style="height:62px;width:auto;display:block;">
          <p style="margin-top:18px;max-width:34ch;color:#9fb0ae;font-size:14.5px;line-height:1.7;">
            Expert online tutoring in Maths, English &amp; Science, KS1 to A-Level and 11+. Personalised lessons in a real interactive classroom.
          </p>
          <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
            <span class="tag" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#cfe3e1;">DBS-checked tutors</span>
            <span class="tag" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#cfe3e1;">Maths · English · Science</span>
          </div>
          <div class="footer-social" style="margin-top:20px;display:flex;gap:12px;">
            <a href="https://www.facebook.com/profile.php?id=61563738669588" aria-label="Ace Academic Tutors on Facebook" target="_blank" rel="noopener"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg></a>
            <a href="https://www.instagram.com/aceacademictutors" aria-label="Ace Academic Tutors on Instagram" target="_blank" rel="noopener"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
            <a href="https://www.linkedin.com/company/ace-academic-tutors" aria-label="Ace Academic Tutors on LinkedIn" target="_blank" rel="noopener"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.76V1.74C24 .78 23.2 0 22.22 0z"/></svg></a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Explore</h5>
          <a href="about.html">About us</a><br>
          <a href="services.html">Services</a><br>
          <a href="portal.html">The portal</a><br>
          <a href="pricing.html">Pricing</a><br>
          <a href="for-schools.html">For Schools</a><br>
          <a href="become-a-tutor.html">Become a tutor</a>
        </div>
        <div class="footer-col">
          <h5>Subjects</h5>
          <a href="maths-tutoring.html">Maths tutoring</a><br>
          <a href="english-tutoring.html">English tutoring</a><br>
          <a href="science-tutoring.html">Science tutoring</a><br>
          <a href="11-plus-tutoring.html">11+ preparation</a>
        </div>
        <div class="footer-col">
          <h5>Get in touch</h5>
          <a href="contact.html">Book a free consultation</a><br>
          <a href="tel:+447454905330">07454 905330</a><br>
          <a href="mailto:info@aceacademictutors.com">info@aceacademictutors.com</a><br>
          <a href="https://portal.aceacademictutors.com" target="_blank" rel="noopener">Family &amp; tutor portal</a>
          <address style="font-style:normal;margin-top:14px;color:#9fb0ae;font-size:13.5px;line-height:1.7;">
            Ace Academic Tutors Ltd<br>61 Lower Mardyke Avenue<br>Rainham, RM13 8PR
          </address>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} Ace Academic Tutors Ltd · Registered in England &amp; Wales, Company No.&nbsp;15925436</span>
        <span style="display:flex;gap:22px;flex-wrap:wrap;"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="safeguarding.html">Safeguarding</a></span>
      </div>
    </div>
  </footer>`;

  const hSlot = document.getElementById('site-header-slot');
  const fSlot = document.getElementById('site-footer-slot');
  if(hSlot) hSlot.outerHTML = header;
  if(fSlot) fSlot.outerHTML = footer;

  // pages with static (no-JS-safe) chrome: mark the current nav link and refresh the year
  const pageHref = {about:'about.html',services:'services.html',pricing:'pricing.html',schools:'for-schools.html',tutor:'become-a-tutor.html',contact:'contact.html'}[page];
  if(pageHref) document.querySelectorAll('.nav-links a[href="'+pageHref+'"], .mobile-menu a[href="'+pageHref+'"]:not(.btn)').forEach(a=>a.classList.add('active'));
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=year);

  // render brand marks injected above
  if(window.AceBrand) window.AceBrand.render();

  // header shadow on scroll
  const sh = document.getElementById('siteHeader');
  if(sh){
    const onScroll=()=>sh.classList.toggle('scrolled', window.scrollY>8);
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  }

  // mobile menu
  const tg=document.getElementById('navToggle'), mm=document.getElementById('mobileMenu');
  if(tg&&mm){
    const setOpen=(open)=>{ mm.classList.toggle('open',open); tg.setAttribute('aria-expanded',open?'true':'false'); tg.setAttribute('aria-label',open?'Close menu':'Open menu'); };
    tg.addEventListener('click',()=>setOpen(!mm.classList.contains('open')));
    mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
  }

  // reveal-on-scroll (timer-friendly; rAF is throttled in some preview hosts)
  const obs = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
  },{threshold:.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
  // safety: reveal everything after 2.5s even if observer never fires
  setTimeout(()=>document.querySelectorAll('.reveal:not(.in)').forEach(el=>el.classList.add('in')),2500);

  // animated counters
  window.aceCount = function(el){
    const target=+el.dataset.count, div=+(el.dataset.div||1), suffix=el.dataset.suffix||'', prefix=el.dataset.prefix||'';
    const dur=1200, t0=Date.now();
    const timer=setInterval(()=>{
      const p=Math.min(1,(Date.now()-t0)/dur), e=1-Math.pow(1-p,3);
      let v=target*e; v = div>1 ? (v/div).toFixed(1) : Math.round(v);
      el.textContent = prefix+v+suffix;
      if(p>=1) clearInterval(timer);
    },28);
  };
  const cObs=new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ window.aceCount(e.target); cObs.unobserve(e.target);} });
  },{threshold:.4});
  document.querySelectorAll('[data-count]').forEach(el=>cObs.observe(el));
  setTimeout(()=>document.querySelectorAll('[data-count]').forEach(el=>{ if(el.textContent.replace(/\D/g,'')==='0'||el.textContent==='0'){ window.aceCount(el);} }),2600);
})();
