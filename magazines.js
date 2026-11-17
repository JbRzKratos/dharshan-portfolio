(() => {
  'use strict';
  const data = window.MAGAZINES || [];
  const $ = s => document.querySelector(s);
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const grid = $('#magazineGrid');
  const dialog = $('#magazineReader');
  let category = 'All', query = '', active = null, page = 0, spread = false, zoom = false, returnFocus = null, rendering = 0;
  const total = data.reduce((sum,m) => sum + m.pages.length, 0);
  $('#editionCount').textContent = data.length;
  $('#pageCount').textContent = total;
  const featuredNames = ['farina','pavithra','sai-suraj'];
  const featured = featuredNames.map(n=>data.find(m=>m.id.includes(n))).filter(Boolean);
  (featured.length === 3 ? featured : data.slice(0,3)).forEach(m => {
    const img = new Image();img.className='installation-book';img.src=m.cover;img.alt='';img.width=520;img.height=680;img.decoding='async';$('#coverInstallation').append(img);
  });
  const categories = ['All', ...new Set(data.map(m=>m.category))];
  for(const c of categories){const b=document.createElement('button');b.textContent=c;b.type='button';b.setAttribute('aria-pressed',String(c===category));b.addEventListener('click',()=>{category=c;$('#categoryFilters').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderGrid();});$('#categoryFilters').append(b);}
  function renderGrid(){
    const results=data.filter(m=>(category==='All'||m.category===category)&&[m.title,m.about,m.category].join(' ').toLocaleLowerCase().includes(query));
    grid.replaceChildren();
    results.forEach(m=>{
      const article=document.createElement('article');article.className='magazine-card';
      article.innerHTML=`<button class="cover-button" type="button" aria-label="${m.video?'Watch':'Read'} ${escape(m.title)}"><img src="${escape(m.cover)}" alt="${escape(m.title)} edition preview" width="520" height="680" loading="lazy" decoding="async"/>${m.video?'<span class="film-badge">▶ FILM EDITION</span>':''}<span class="read-hover">${m.video?'Watch the presentation':`Read all ${m.pages.length} pages`} ↗</span></button><div class="edition-meta"><span>${escape(m.category)}</span><span>${m.video?'Video edition':m.pages.length+' pages'}</span></div><h3><button type="button">${escape(m.title)}</button></h3><p>${escape(m.about)}</p>`;
      article.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>openMagazine(m.id)));
      grid.append(article);
    });
    $('#resultsCount').textContent=`${results.length} of ${data.length} editions`;
    $('#noResults').hidden=!!results.length;
  }
  $('#magazineSearch').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase();renderGrid();});
  function setHash(){history.replaceState(null,'',`#read=${encodeURIComponent(active.id)}&page=${page+1}`);}
  function openMagazine(id,index=0){
    active=data.find(m=>m.id===id);if(!active)return;
    if(active.video){openFilm(active);return;}
    returnFocus=document.activeElement;page=Math.max(0,Math.min(index,active.pages.length-1));zoom=false;spread=false;
    $('#readerTitle').textContent=active.title;$('#readerCategory').textContent=active.category+' / KIK MAGAZINES';$('#readerDescription').textContent=active.about;
    $('#pageSlider').max=active.pages.length;$('#totalPageNumber').textContent=` / ${active.pages.length}`;
    $('#thumbnailRail').replaceChildren();$('#thumbnailRail').hidden=true;$('#toggleThumbnails').setAttribute('aria-pressed','false');
    dialog.showModal();$('#librarySite').inert=true;document.body.classList.add('reader-open');renderPage();$('#readerClose').focus();
  }
  function closeMagazine(){if(!dialog.open)return;dialog.close();$('#librarySite').inert=false;document.body.classList.remove('reader-open');rendering++;$('#pageSurface').replaceChildren();history.replaceState(null,'','#collection');returnFocus?.focus();}
  function renderPage(){
    if(!active)return;
    const token=++rendering;
    const surface=$('#pageSurface');surface.replaceChildren();surface.className='page-surface'+(spread?' spread':'')+(zoom?' zoomed':'');
    const pages=[active.pages[page]];
    if(spread&&page>0&&page<active.pages.length-1)pages.push(active.pages[page+1]);
    $('#pageLoading').hidden=false;$('#readerStage').setAttribute('aria-busy','true');let remaining=pages.length;
    const ready=()=>{if(token!==rendering)return;if(--remaining===0){$('#pageLoading').hidden=true;$('#readerStage').setAttribute('aria-busy','false');}};
    pages.forEach(p=>{const img=new Image();img.alt=`${active.title} — ${p.label}`;img.width=p.width;img.height=p.height;img.decoding='async';img.addEventListener('load',ready,{once:true});img.addEventListener('error',()=>{img.alt=`${p.label} could not load. Use View original to open the source.`;ready();},{once:true});surface.append(img);img.src=p.src;});
    $('#pageLabel').textContent=pages.map(p=>p.label).join(' + ');$('#currentPageNumber').textContent=spread&&pages.length===2?`${page+1}–${page+2}`:page+1;
    $('#pageSlider').value=page+1;$('#pageSlider').setAttribute('aria-valuetext',`${pages[0].label}, ${page+1} of ${active.pages.length}`);
    $('#previousPage').disabled=page===0;$('#nextPage').disabled=page+pages.length>=active.pages.length;
    $('#toggleSpread').setAttribute('aria-pressed',String(spread));$('#toggleZoom').setAttribute('aria-pressed',String(zoom));$('#toggleZoom').textContent=zoom?'Fit page －':'Zoom in ＋';
    $('#originalPage').href=`https://drive.google.com/file/d/${encodeURIComponent(active.pages[page].sourceId)}/view`;
    $('#readerStage').scrollTop=0;$('#readerStage').scrollLeft=0;
    $('#thumbnailRail').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-current',String(i>=page&&i<page+pages.length)));
    const next=active.pages[page+pages.length];if(next){const preload=new Image();preload.src=next.src;}
    setHash();
  }
  function turn(direction){if(direction>0){if($('#nextPage').disabled)return;page+=spread&&page>0?2:1;}else{if(page===0)return;page=Math.max(0,page-(spread?2:1));}page=Math.min(page,active.pages.length-1);renderPage();}
  $('#nextPage').addEventListener('click',()=>turn(1));$('#previousPage').addEventListener('click',()=>turn(-1));
  $('#readerClose').addEventListener('click',closeMagazine);dialog.addEventListener('cancel',e=>{e.preventDefault();closeMagazine();});
  $('#pageSlider').addEventListener('input',e=>{page=+e.target.value-1;if(spread&&page>0&&page%2===0)page--;renderPage();});
  $('#toggleZoom').addEventListener('click',()=>{zoom=!zoom;renderPage();});
  $('#toggleSpread').addEventListener('click',()=>{spread=!spread;if(spread&&page>0&&page%2===0)page--;renderPage();});
  $('#toggleThumbnails').addEventListener('click',()=>{
    const rail=$('#thumbnailRail');rail.hidden=!rail.hidden;$('#toggleThumbnails').setAttribute('aria-pressed',String(!rail.hidden));
    if(!rail.hidden&&!rail.children.length)active.pages.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Go to ${p.label}`);b.setAttribute('aria-current',String(i===page));b.innerHTML=`<img src="${escape(p.thumb)}" alt="" loading="lazy" decoding="async"/><span>${escape(p.label)}</span>`;b.addEventListener('click',()=>{page=i;if(spread&&page>0&&page%2===0)page--;renderPage();});rail.append(b);});
  });
  dialog.addEventListener('keydown',e=>{if(e.target.matches('input'))return;if(e.key==='ArrowRight'){e.preventDefault();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}if(e.key==='Home'){e.preventDefault();page=0;renderPage();}if(e.key==='End'){e.preventDefault();page=active.pages.length-1;renderPage();}});
  let touchStart=null;$('#readerStage').addEventListener('touchstart',e=>{if(!zoom)touchStart=[e.changedTouches[0].clientX,e.changedTouches[0].clientY];},{passive:true});$('#readerStage').addEventListener('touchend',e=>{if(!touchStart||zoom)return;const dx=e.changedTouches[0].clientX-touchStart[0],dy=e.changedTouches[0].clientY-touchStart[1];if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)turn(dx<0?1:-1);touchStart=null;},{passive:true});
  const mobile=matchMedia('(max-width:700px)');mobile.addEventListener('change',e=>{if(e.matches&&spread){spread=false;if(dialog.open)renderPage();}});
  renderGrid();
  function openFilm(m){returnFocus=document.activeElement;$('#filmTitle').textContent=m.title;const video=$('#portfolioFilm');video.poster=m.cover;video.src=m.video;$('#filmReader').showModal();$('#librarySite').inert=true;document.body.classList.add('reader-open');$('#filmClose').focus();history.replaceState(null,'',`#read=${encodeURIComponent(m.id)}`);}
  function closeFilm(){const video=$('#portfolioFilm');video.pause();video.removeAttribute('src');video.load();$('#filmReader').close();$('#librarySite').inert=false;document.body.classList.remove('reader-open');history.replaceState(null,'','#collection');returnFocus?.focus();}
  $('#filmClose').addEventListener('click',closeFilm);$('#filmReader').addEventListener('cancel',e=>{e.preventDefault();closeFilm();});
  const params=new URLSearchParams(location.hash.slice(1));if(params.get('read'))openMagazine(params.get('read'),Math.max(0,(+params.get('page')||1)-1));
})();
