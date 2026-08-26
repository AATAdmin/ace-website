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
  /* ----------------------------------------------------------------
     THE PRICE MODEL, in one place.

     pricing.html and get-started.html both quote one-to-one rates, and
     both used to work them out themselves: one from a table of tiers,
     the other from the formula "5% per extra session". Two
     implementations of one commercial policy, so a non-linear ladder set
     in the portal would have made the two pages disagree about the same
     family's price.

     They now both read this. The BAKED_ values are the portal-unreachable
     fallback and must stay equal to what the static HTML says; the true
     no-JavaScript fallback is the text in the markup, which this only
     ever overwrites once real values have landed.
     ---------------------------------------------------------------- */
  var BAKED_ANCHOR={'11+':35,'Pre-GCSE':35,'GCSE':35,'A-Level':45};
  /* Index is sessions-a-week minus one. One a week is the full rate by
     definition, which is why it is a 0 here and not a portal setting. */
  var BAKED_LADDER=[0,.05,.10,.15,.20];
  var BAKED_UPFRONT=.05;

  var oneToOne=function(){
    var d=window.ACE_DATA;
    return (d&&d.pricing&&d.pricing.oneToOne)||null;
  };
  var isRate=function(n){ return typeof n==='number'&&n>=0&&n<1; };

  window.ACE_PRICE={
    BAKED_ANCHOR:BAKED_ANCHOR,
    BAKED_LADDER:BAKED_LADDER,
    BAKED_UPFRONT:BAKED_UPFRONT,

    /* The full hourly rate per level, at one session a week. */
    anchors:function(){
      var o=oneToOne(), live=o&&o.byLevel, out={};
      for(var k in BAKED_ANCHOR) out[k]=BAKED_ANCHOR[k];
      if(live) for(var j in out) if(typeof live[j]==='number'&&live[j]>0) out[j]=live[j];
      return out;
    },
    rateFor:function(level){
      var A=this.anchors();
      return A[level]||A.GCSE||BAKED_ANCHOR.GCSE;
    },

    /* Discounts by position: index 0 is one session a week. A portal ladder
       is honoured only when it is the same five rungs in the same order,
       because the tier cards and the segmented control are indexed by
       position -- a shorter ladder would shift every card one place. */
    ladder:function(){
      var o=oneToOne(), live=o&&o.tiers, out=BAKED_LADDER.slice();
      if(!Array.isArray(live)||live.length!==out.length) return out;
      for(var i=0;i<live.length;i++){
        var row=live[i];
        if(!row||row.sessionsPerWeek!==i+1||!isRate(row.discount)) return BAKED_LADDER.slice();
        out[i]=row.discount;
      }
      return out;
    },
    /* Sessions a week -> the discount off the hourly rate. Anything outside
       the ladder is clamped to its ends rather than extrapolated: a made-up
       sixth rung would be a price nobody has agreed to offer. */
    discountFor:function(sessions){
      var L=this.ladder(), i=Math.round(sessions)-1;
      if(!(i>=0)) return 0;
      return L[Math.min(i,L.length-1)];
    },
    deepest:function(){
      var L=this.ladder(), m=0;
      for(var i=0;i<L.length;i++) if(L[i]>m) m=L[i];
      return m;
    },
    /* Taken off after the ladder, for paying the month upfront. */
    upfront:function(){
      var o=oneToOne(), d=o&&o.monthlyUpfrontDiscount;
      return isRate(d)?d:BAKED_UPFRONT;
    },

    /* The hourly rate a family actually pays. One function, so the two
       pages can no longer answer this differently. */
    hourly:function(level,sessions,payUpfront){
      var hr=this.rateFor(level)*(1-this.discountFor(sessions));
      return payUpfront?hr*(1-this.upfront()):hr;
    },

    /* The range printed in prose: cheapest level at the deepest rung, to
       the dearest level at full rate. Never hardcode this -- A-Level is
       not £28-35. */
    bandFor:function(level){
      var A=this.anchors(), off=1-this.deepest(), a=level&&A[level], all=[];
      if(a) return {lo:Math.round(a*off),hi:Math.round(a)};
      for(var k in A) all.push(A[k]);
      return {lo:Math.round(Math.min.apply(null,all)*off),hi:Math.round(Math.max.apply(null,all))};
    },
    pct:function(rate){ return Math.round(rate*100)+'%'; },
    money:function(n){ return n.toFixed(2).replace(/\.00$/,''); }
  };

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
  /* ----------------------------------------------------------------
     ONE SHAPE FOR A CLASS.

     Three pages match a live class against the stage a visitor picked, and
     each learned a different key for it: index.html matches c.stage against
     a slug ("gcse"), get-started.html matches c.level against a label
     ("GCSE"), pricing.html tries c.stage and falls back to c.level. The
     portal sends only `level`.

     So the moment the portal started sending classes at all, two of those
     three matched nothing -- and the failure was invisible, because each page
     had a baked fallback that had been quietly doing the work while the key
     was absent. The group option simply stopped being offered.

     Rather than teach three pages a fourth convention, every class gets BOTH
     keys here, once, before anything reads them.
     ---------------------------------------------------------------- */
  var LEVEL_TO_STAGE={'11+':'11plus','Pre-GCSE':'pregcse','GCSE':'gcse','A-Level':'alevel'};
  var STAGE_TO_LEVEL={'11plus':'11+','pregcse':'Pre-GCSE','gcse':'GCSE','alevel':'A-Level'};
  function normaliseClasses(data){
    if(!data||!data.classes||!data.classes.length) return data;
    data.classes=data.classes.map(function(c){
      var level=c.level||STAGE_TO_LEVEL[c.stage]||null;
      var stage=c.stage||LEVEL_TO_STAGE[level]||null;
      var out={}; for(var k in c) out[k]=c[k];
      out.level=level; out.stage=stage;
      return out;
    /* A class nothing can match is worse than no class: it hides the option
       AND suppresses the baked fallback that would have shown it. */
    }).filter(function(c){ return c.level&&c.stage; });
    return data;
  }

  function apply(data){
    window.ACE_DATA=normaliseClasses(data)||null;
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
         range spans every level, from the cheapest at the deepest rung of the
         ladder to the dearest at full rate. min/max are honoured if the portal
         sends them, so an editorial range can still override. */
      var bl=p.oneToOne.byLevel, lo=p.oneToOne.min, hi=p.oneToOne.max;
      /* The deepest discount on the ladder. Falls back to 20%, which is what
         the ladder has always bottomed out at -- guessing 0 here would print a
         floor price nobody is offered. */
      var deepest=0.2, tl=p.oneToOne.tiers;
      if(Array.isArray(tl)&&tl.length){
        var offs=tl.map(function(t){return t&&t.discount;})
                   .filter(function(d){return typeof d==='number'&&d>=0&&d<1;});
        if(offs.length) deepest=Math.max.apply(null,offs);
      }
      if(bl){
        var vals=Object.keys(bl).map(function(k){return bl[k];}).filter(function(v){return typeof v==='number'&&v>0;});
        if(vals.length){
          if(lo==null) lo=Math.round(Math.min.apply(null,vals)*(1-deepest));
          if(hi==null) hi=Math.round(Math.max.apply(null,vals));
        }
      }
      var r=(lo!=null&&hi!=null&&lo!==hi)?('£'+lo+'–'+hi):('£'+(hi!=null?hi:lo));
      document.querySelectorAll('[data-ace="price.oneToOne"]').forEach(function(el){ el.textContent=r; });
      document.querySelectorAll('[data-ace="price.oneToOneFull"]').forEach(function(el){
        el.textContent=r+' an '+(p.oneToOne.unit||'hour');
      });
      /* The upfront discount appears in prose on several pages ("a further 5%
         off"). Written as a percentage so a change of policy does not leave the
         sentence contradicting the calculator two inches below it. */
      var mu=p.oneToOne.monthlyUpfrontDiscount;
      if(typeof mu==='number'&&mu>=0&&mu<1){
        var mtxt=Math.round(mu*100)+'%';
        document.querySelectorAll('[data-ace="price.monthlyDiscount"]').forEach(function(el){ el.textContent=mtxt; });
      }
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
