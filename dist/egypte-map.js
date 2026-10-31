'use strict';
(async()=>{
 const status=document.getElementById('map-status');
 try{
  const response=await fetch('/data/egypte-napoleon.geojson');
  if(!response.ok)throw new Error('Les points ne sont pas disponibles.');
  const data=await response.json();
  if(!window.L)throw new Error('Le moteur de carte est indisponible. Les coordonnées restent dans la liste.');
  const map=L.map('atlas-map',{scrollWheelZoom:true}).setView([29.95,31.16],12);
  const tiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri — Esri, HERE, Garmin, OpenStreetMap contributors'}).addTo(map);
  tiles.on('tileerror',()=>{status.textContent='Fond cartographique temporairement indisponible ; les points restent affichés et consultables.'});
  const markers=[];
  const layer=L.geoJSON(data,{pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:10,color:'#fff',weight:3,fillColor:f.properties.status==='candidat'?'#b36a24':'#205e68',fillOpacity:1}),onEachFeature:(f,l)=>{
   const p=f.properties,box=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('p'),a=document.createElement('a');
   title.textContent=p.name;detail.textContent=p.precision;a.textContent='Source des coordonnées ↗';a.href=p.source;a.target='_blank';a.rel='noopener';box.append(title,detail,a);l.bindPopup(box,{maxWidth:Math.min(280,Math.max(140,document.getElementById('atlas-map').clientWidth-70))});l.bindTooltip(p.name);markers.push(l);
  }}).addTo(map);
  const fit=()=>{map.fitBounds(layer.getBounds(),{padding:[35,35],maxZoom:14});status.textContent=data.features.length+' points · 6 repères et 2 localités candidates';};
  document.getElementById('fit-points').addEventListener('click',fit);
  document.getElementById('village-points').addEventListener('click',()=>{map.fitBounds(L.latLngBounds(markers.slice(6).map(m=>m.getLatLng())),{padding:[45,45],maxZoom:14});status.textContent='Les deux localités candidates · correspondances historiques à vérifier.';});
  document.getElementById('giza-points').addEventListener('click',()=>{map.fitBounds(L.latLngBounds(markers.slice(0,2).map(m=>m.getLatLng())),{padding:[50,50],maxZoom:16});status.textContent='Gizeh · 2 repères';});
  document.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.place);map.setView(markers[i].getLatLng(),16,{animate:false});markers[i].openPopup();status.textContent='Lieu affiché : '+data.features[i].properties.name;document.getElementById('atlas-map').scrollIntoView({behavior:'instant',block:'center'});}));
  const baseline=L.polyline([markers[3].getLatLng(),markers[4].getLatLng()],{color:'#69547f',weight:3,dashArray:'7 7'});
  document.getElementById('modern-baseline').addEventListener('click',e=>{const on=map.hasLayer(baseline);if(on){map.removeLayer(baseline);}else{baseline.addTo(map);map.fitBounds(baseline.getBounds(),{padding:[45,45]});}e.currentTarget.setAttribute('aria-pressed',String(!on));status.textContent=on?'Segment de comparaison masqué.':'Comparaison Roudah–Amr · environ 850 m entre les repères publiés ; aucun alignement historique déduit.';});
  fit();
 }catch(e){status.textContent=e.message;}
})();
