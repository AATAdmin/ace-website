/* ============================================================
   ACE live content, portal-driven.

   The site is static. Every volatile value (workshop dates, which
   classes are enrolling, prices) is ALSO baked into the HTML so the
   page is correct with no JavaScript and no portal. This script then
   asks the portal for the current values and updates in place.

   Contract: docs/PORTAL_CONTENT_API.md
   ============================================================ */
(function(){
  /* /api/site-content was never built. The portal serves this at
     /api/public/site-content, and the old path fell through the portal's
     SPA catch-all, which answered 200 with an HTML page -- so this fetch
     parsed a web page as JSON and failed silently on every page load since
     the site went live. */
  var ENDPOINT='https://portal.aceacademictutors.com/api/public/site-content';
  var CACHE_KEY='ace-site-content';
  var CACHE_MS=10*60*1000;
  var TIMEOUT_MS=4000;

  function readCache(){
    try{
      var raw=sessionStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      var o=JSON.parse(raw);
      if(!o||!o.at||Date.now()-o.at>CACHE_MS) return null;
      return o.data;
    }catch(e){ return null; }
  }
  function writeCache(data){
    try{ sessionStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),data:data})); }catch(e){}
  }

  /* ---- formatting helpers, en-GB, no em-dashes ---- */
  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function d(v){ return new Date(v); }
  function fmt(v,how){
    var x=d(v);
    if(isNaN(x)) return '';
    var day=x.getDate(), mon=MONTHS[x.getMonth()], wd=DAYS[x.getDay()];
    var hh=String(x.getHours()).padStart(2,'0'), mm=String(x.getMinutes()).padStart(2,'0');
    switch(how){
      case 'day': return String(day);
      case 'mon3': return mon.slice(0,4)==='Sept'?'Sept':mon.slice(0,3);
      case 'time': return hh+':'+mm;
      case 'weekday': return wd;
      case 'short': return wd.slice(0,3)+' '+day+' '+mon;
      default: return wd+' '+day+' '+mon;
    }
  }
  function get(obj,path){
    return path.split('.').reduce(function(o,k){
      if(o==null) return null;
      var m=k.match(/^(\w+)\[(\d+)\]$/);
      return m ? (o[m[1]]||[])[+m[2]] : o[k];
    },obj);
  }

  /* ---- the live workshop is the next one that has not finished ---- */
  function nextWorkshop(data){
    var list=(data&&data.workshops)||[];
    var now=Date.now();
    return list
      .filter(function(w){ return w.published!==false && d(w.end||w.start).getTime()>now; })
      .sort(function(a,b){ return d(a.start)-d(b.start); })[0] || null;
  }

  /* Page scripts register their hooks (ace:data listeners, ACE_WORKSHOP_TIMES)
     in inline scripts that run AFTER this file. So set window.ACE_DATA at once,
     then defer the DOM work until those hooks exist, or a cache hit would apply
     before anything is listening. */
  function apply(data){
    window.ACE_DATA=data||null;
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',function(){ render(data); });
    } else {
      setTimeout(function(){ render(data); },0);
    }
  }

  function render(data){
    var w=nextWorkshop(data);

    /* Scoped blocks: hidden when there is nothing to show. Only when the portal
       actually ANSWERED about workshops -- an absent key means it has nothing to
       say, and the baked HTML must stand. Without this guard, connecting a portal
       that holds no events would silently delete a live advert. */
    if(data&&data.workshops){
      document.querySelectorAll('[data-ace-scope="workshop"]').forEach(function(el){
        el.hidden=!w;
      });
    }
    document.querySelectorAll('[data-ace-empty="workshop"]').forEach(function(el){
      el.hidden=!!w;
    });

    if(w){
      var map={
        'workshop.name': w.name,
        'workshop.date': fmt(w.start),
        'workshop.dateShort': fmt(w.start,'short'),
        'workshop.day': fmt(w.start,'day'),
        'workshop.mon': fmt(w.start,'mon3'),
        'workshop.start': fmt(w.start,'time'),
        'workshop.end': fmt(w.end,'time'),
        'workshop.window': fmt(w.start,'time')+' to '+fmt(w.end,'time'),
        'workshop.capacity': w.capacity!=null?String(w.capacity):'',
        'workshop.places': w.placesLeft!=null?String(w.placesLeft):(w.capacity!=null?String(w.capacity):''),
        'workshop.subject': w.subject||''
      };
      Object.keys(map).forEach(function(k){
        if(map[k]==='') return;
        document.querySelectorAll('[data-ace="'+k+'"]').forEach(function(el){ el.textContent=map[k]; });
      });
      document.querySelectorAll('[data-ace-href="workshop"]').forEach(function(el){
        if(w.url) el.setAttribute('href',w.url);
      });
      if(window.ACE_WORKSHOP_TIMES) window.ACE_WORKSHOP_TIMES(w);
    }

    /* the lead group class: price, start date and a one-line summary */
    var cls=(data&&data.classes||[]).filter(function(c){return c.mode==='group'&&(c.status==='enrolling'||c.status==='full');})[0];
    if(cls){
      var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
      var MONS=['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
      var d=cls.startDate?new Date(cls.startDate):null;
      var start=(d&&!isNaN(d))?(d.getDate()+' '+MON[d.getMonth()]):'';
      var price=cls.priceHourly?('£'+cls.priceHourly+' an hour'):cls.priceMonthly?('£'+cls.priceMonthly+' a month'):'';
      var cmap={
        'class.price':price,
        'class.priceShort':cls.priceHourly?('£'+cls.priceHourly):'',
        'class.start':start,
        'class.startDay':(d&&!isNaN(d))?String(d.getDate()):'',
        'class.startMon':(d&&!isNaN(d))?MONS[d.getMonth()]:'',
        'class.summary':[cls.level&&cls.subject?(cls.level+' '+cls.subject):'',cls.year||'',start?('starting '+start):''].filter(Boolean).join(', ')
      };
      Object.keys(cmap).forEach(function(k){
        if(cmap[k]==='') return;
        document.querySelectorAll('[data-ace="'+k+'"]').forEach(function(el){ el.textContent=cmap[k]; });
      });
    }

    /* prices */
    var p=data&&data.pricing;
    if(p&&p.oneToOne){
      /* byLevel is the source: the full hourly rate per level. The displayed
         range spans every level, from the cheapest at five sessions a week
         (20% off, so 0.8x) to the dearest at full rate. min/max are honoured
         if the portal sends them, so an editorial range can still override. */
      var bl=p.oneToOne.byLevel, lo=p.oneToOne.min, hi=p.oneToOne.max;
      if(bl){
        var vals=Object.keys(bl).map(function(k){return bl[k];}).filter(function(v){return typeof v==='number'&&v>0;});
        if(vals.length){
          if(lo==null) lo=Math.round(Math.min.apply(null,vals)*0.8);
          if(hi==null) hi=Math.round(Math.max.apply(null,vals));
        }
      }
      var r=(lo!=null&&hi!=null&&lo!==hi)?('£'+lo+'–'+hi):('£'+(hi!=null?hi:lo));
      document.querySelectorAll('[data-ace="price.oneToOne"]').forEach(function(el){ el.textContent=r; });
      document.querySelectorAll('[data-ace="price.oneToOneFull"]').forEach(function(el){
        el.textContent=r+' an '+(p.oneToOne.unit||'hour');
      });
    }

    document.dispatchEvent(new CustomEvent('ace:data',{detail:data}));
  }

  /* Expiry safety net: if the portal is unreachable, still hide a workshop
     whose finish time has passed, using the date baked into the HTML. */
  function expireBaked(){
    document.querySelectorAll('[data-ace-scope="workshop"][data-ace-until]').forEach(function(el){
      var t=new Date(el.getAttribute('data-ace-until')).getTime();
      if(!isNaN(t) && t<Date.now()){
        el.hidden=true;
        document.querySelectorAll('[data-ace-empty="workshop"]').forEach(function(x){ x.hidden=false; });
      }
    });
  }

  expireBaked();

  var cached=readCache();
  if(cached){ apply(cached); return; }

  var ctrl=('AbortController' in window)?new AbortController():null;
  var timer=setTimeout(function(){ if(ctrl) ctrl.abort(); },TIMEOUT_MS);

  fetch(ENDPOINT,{mode:'cors',credentials:'omit',signal:ctrl?ctrl.signal:undefined})
    .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(function(data){ clearTimeout(timer); writeCache(data); apply(data); })
    .catch(function(){ clearTimeout(timer); /* baked HTML stands */ });
})();
