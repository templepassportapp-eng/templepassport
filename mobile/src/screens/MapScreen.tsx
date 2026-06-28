import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {getUserTimeline} from '../api/client';
import {CheckInDetail} from '../types';
import {colors, spacing} from '../theme';
import {DEV_USER_ID} from '../config';
import {useAuth} from '../auth/AuthContext';

const INDIA_MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f1728;overflow:hidden}
svg{width:100vw;height:100vh}
#callout{
  display:none;position:fixed;background:rgba(10,18,45,0.96);
  border:1px solid #2a3a7a;border-radius:10px;padding:12px;
  color:#fff;font-family:sans-serif;font-size:13px;max-width:200px;
  box-shadow:0 4px 20px rgba(0,0,0,0.6);z-index:10;
}
.c-name{font-weight:700;font-size:14px;margin-bottom:3px}
.c-loc{color:#aaa;font-size:11px;margin-bottom:3px}
.c-date{color:#E8A33D;font-size:11px}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;margin-top:5px;font-weight:600}
.v{background:#0F6E56;color:#fff}
.s{background:#6B3A00;color:#E8A33D}
</style>
</head>
<body>
<svg id="map" viewBox="0 0 600 620" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="620" fill="#0f1728"/>
  <path d="M141,28 L206,66 L244,94 L263,121 L281,149
    L263,163 L272,187 L300,196 L338,206 L375,210 L403,206 L413,196
    L465,207 L497,202 L572,183
    L568,206 L525,234 L497,261 L493,281 L488,299
    L450,290 L431,281 L394,308
    L366,337 L347,346 L291,384 L272,412 L249,449 L249,468 L240,505
    L197,559
    L178,543 L167,515 L158,496 L148,477
    L139,449 L128,430 L122,412 L114,384
    L109,365 L109,346 L113,337
    L100,318 L70,315 L50,310 L34,295
    L50,275 L69,268 L38,260 L19,252
    L34,234 L71,215 L62,196 L47,187 L66,168 L71,149
    L141,131 L150,112 L159,94 L146,75 L141,56 L143,37 Z"
    fill="#1a2744" stroke="#2a3a7a" stroke-width="1.5" stroke-linejoin="round"/>
  <rect width="600" height="620" fill="transparent" onclick="hide()"/>
  <g id="markers"></g>
</svg>
<div id="callout">
  <div class="c-name" id="cn"></div>
  <div class="c-loc" id="cl"></div>
  <div class="c-date" id="cd"></div>
  <span class="badge" id="cb"></span>
</div>
<script>
var SW=600,SH=580,ML=67,LR=32,MB=7,LLR=31;
function toSVG(lat,lon){
  return{x:(lon-ML)/LR*SW,y:SH-(lat-MB)/LLR*SH};
}
function render(data){
  var g=document.getElementById('markers');
  g.innerHTML='';
  (data||[]).forEach(function(t){
    var p=toSVG(t.lat,t.lon);
    var isV=t.type==='VERIFIED';
    var col=isV?'#0F6E56':'#E8A33D';
    var glow=document.createElementNS('http://www.w3.org/2000/svg','circle');
    glow.setAttribute('cx',p.x);glow.setAttribute('cy',p.y);
    glow.setAttribute('r','12');
    glow.setAttribute('fill',isV?'rgba(15,110,86,0.25)':'rgba(232,163,61,0.25)');
    var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);
    c.setAttribute('r','7');c.setAttribute('fill',col);
    c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','1.5');
    var grp=document.createElementNS('http://www.w3.org/2000/svg','g');
    grp.style.cursor='pointer';
    grp.appendChild(glow);grp.appendChild(c);
    (function(temple,px,py){
      grp.addEventListener('click',function(e){
        e.stopPropagation();
        document.getElementById('cn').textContent=temple.name;
        document.getElementById('cl').textContent=(temple.city||'')+(temple.state?', '+temple.state:'');
        document.getElementById('cd').textContent=temple.date||'';
        var b=document.getElementById('cb');
        b.textContent=temple.type==='VERIFIED'?'GPS Verified':'Self Reported';
        b.className='badge '+(temple.type==='VERIFIED'?'v':'s');
        var co=document.getElementById('callout');
        var sw=window.innerWidth,sh=window.innerHeight;
        var cx=(px/SW)*sw,cy=(py/SH)*sh;
        co.style.left=Math.min(cx+12,sw-215)+'px';
        co.style.top=Math.max(cy-80,8)+'px';
        co.style.display='block';
      });
    })(t,p.x,p.y);
    g.appendChild(grp);
  });
}
function hide(){document.getElementById('callout').style.display='none';}
document.addEventListener('message',function(e){try{render(JSON.parse(e.data));}catch(err){}});
window.addEventListener('message',function(e){try{render(JSON.parse(e.data));}catch(err){}});
</script>
</body>
</html>`;

export default function MapScreen() {
  const {user} = useAuth();
  const userId = user?.userId ?? DEV_USER_ID;
  const webRef = useRef<WebView>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [checkins, setCheckins] = useState<CheckInDetail[]>([]);
  const [webReady, setWebReady] = useState(false);

  useEffect(() => {
    getUserTimeline(userId)
      .then(setCheckins)
      .catch(() => setError('Could not load your visits.'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (webReady && checkins.length > 0) {
      const payload = checkins.map(c => ({
        name: c.templeName,
        city: c.templeCity,
        state: c.templeState,
        lat: c.templeLatitude,
        lon: c.templeLongitude,
        date: c.visitDate,
        type: c.verificationType,
      }));
      webRef.current?.postMessage(JSON.stringify(payload));
    }
  }, [webReady, checkins]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{html: INDIA_MAP_HTML}}
        style={styles.webview}
        onLoad={() => setWebReady(true)}
        javaScriptEnabled
        scrollEnabled={false}
        onMessage={(_e: WebViewMessageEvent) => {}}
      />
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!loading && checkins.length === 0 && !error && (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyText}>Check in at temples to see them on your map!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f1728'},
  webview: {flex: 1, backgroundColor: '#0f1728'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,40,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  errorBanner: {
    position: 'absolute', bottom: 20, left: spacing.lg, right: spacing.lg,
    backgroundColor: colors.danger, borderRadius: 8, padding: spacing.md,
  },
  errorText: {color: '#fff', textAlign: 'center', fontSize: 13},
  emptyBanner: {
    position: 'absolute', bottom: 20, left: spacing.lg, right: spacing.lg,
    backgroundColor: 'rgba(30,42,120,0.9)', borderRadius: 8, padding: spacing.md,
  },
  emptyText: {color: colors.accent, textAlign: 'center', fontSize: 13},
});
