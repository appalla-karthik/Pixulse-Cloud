function createUnityInstance(t,n,l){function d(e,t){if(!d.aborted&&n.showBanner)return"error"==t&&(d.aborted=!0),n.showBanner(e,t);switch(t){case"error":console.error(e);break;case"warning":console.warn(e);break;default:console.log(e)}}function r(e){var t=e.reason||e.error,n=t?t.toString():e.message||e.reason||"",r=t&&t.stack?t.stack.toString():"";(n+="\n"+(r=r.startsWith(n)?r.substring(n.length):r).trim())&&c.stackTraceRegExp&&c.stackTraceRegExp.test(n)&&k(n,e.filename||t&&(t.fileName||t.sourceURL)||"",e.lineno||t&&(t.lineNumber||t.line)||0)}function e(e,t,n){var r=e[t];void 0!==r&&r||(console.warn('Config option "'+t+'" is missing or empty. Falling back to default value: "'+n+'". Consider updating your WebGL template to include the missing config option.'),e[t]=n)}l=l||function(){};var o,c={canvas:t,webglContextAttributes:{preserveDrawingBuffer:!1,powerPreference:2},cacheControl:function(e){return e==c.dataUrl?"must-revalidate":"no-store"},streamingAssetsUrl:"StreamingAssets",downloadProgress:{},deinitializers:[],intervals:{},setInterval:function(e,t){e=window.setInterval(e,t);return this.intervals[e]=!0,e},clearInterval:function(e){delete this.intervals[e],window.clearInterval(e)},preRun:[],postRun:[],print:function(e){console.log(e)},printErr:function(e){console.error(e),"string"==typeof e&&-1!=e.indexOf("wasm streaming compile failed")&&(-1!=e.toLowerCase().indexOf("mime")?d('HTTP Response Header "Content-Type" configured incorrectly on the server for file '+c.codeUrl+' , should be "application/wasm". Startup time performance will suffer.',"warning"):d('WebAssembly streaming compilation failed! This can happen for example if "Content-Encoding" HTTP header is incorrectly enabled on the server for file '+c.codeUrl+", but the file is not pre-compressed on disk (or vice versa). Check the Network tab in browser Devtools to debug server header configuration.","warning"))},locateFile:function(e){return e},disabledCanvasEvents:["contextmenu","dragstart"]};for(o in e(n,"companyName","Unity"),e(n,"productName","WebGL Player"),e(n,"productVersion","1.0"),n)c[o]=n[o];c.streamingAssetsUrl=new URL(c.streamingAssetsUrl,document.URL).href;var a=c.disabledCanvasEvents.slice();function i(e){e.preventDefault()}a.forEach(function(e){t.addEventListener(e,i)}),window.addEventListener("error",r),window.addEventListener("unhandledrejection",r),c.deinitializers.push(function(){for(var e in c.disableAccessToMediaDevices(),a.forEach(function(e){t.removeEventListener(e,i)}),window.removeEventListener("error",r),window.removeEventListener("unhandledrejection",r),c.intervals)window.clearInterval(e);c.intervals={}}),c.QuitCleanup=function(){for(var e=0;e<c.deinitializers.length;e++)c.deinitializers[e]();c.deinitializers=[],"function"==typeof c.onQuit&&c.onQuit()};var s,u,f,h,b,m,p,g,w="",v="",y=(document.addEventListener("webkitfullscreenchange",function(e){document.webkitCurrentFullScreenElement===t?t.style.width&&(w=t.style.width,v=t.style.height,t.style.width="100%",t.style.height="100%"):w&&(t.style.width=w,t.style.height=v,v=w="")}),{Module:c,SetFullscreen:function(){if(c.SetFullscreen)return c.SetFullscreen.apply(c,arguments);c.print("Failed to set Fullscreen mode: Player not loaded yet.")},SendMessage:function(){if(c.SendMessage)return c.SendMessage.apply(c,arguments);c.print("Failed to execute SendMessage: Player not loaded yet.")},Quit:function(){return new Promise(function(e,t){c.shouldQuit=!0,c.onQuit=e})}});function k(e,t,n){-1==e.indexOf("fullscreen error")&&(c.startupErrorHandler?c.startupErrorHandler(e,t,n):c.errorHandler&&c.errorHandler(e,t,n)||(console.log("Invoking error handler due to\n"+e),"function"==typeof dump&&dump("Invoking error handler due to\n"+e),k.didShowErrorMessage||(-1!=(e="An error occurred running the Unity content on this page. See your browser JavaScript console for more info. The error was:\n"+e).indexOf("DISABLE_EXCEPTION_CATCHING")?e="An exception has occurred, but exception handling has been disabled in this build. If you are the developer of this content, enable exceptions in your project WebGL player settings to be able to catch the exception or see the stack trace.":-1!=e.indexOf("Cannot enlarge memory arrays")?e="Out of memory. If you are the developer of this content, try allocating more memory to your WebGL build in the WebGL player settings.":-1==e.indexOf("Invalid array buffer length")&&-1==e.indexOf("Invalid typed array length")&&-1==e.indexOf("out of memory")&&-1==e.indexOf("could not allocate memory")||(e="The browser could not allocate enough memory for the WebGL content. If you are the developer of this content, try allocating less memory to your WebGL build in the WebGL player settings."),alert(e),k.didShowErrorMessage=!0)))}function x(e,t){if("symbolsUrl"!=e){var n=c.downloadProgress[e],r=(n=n||(c.downloadProgress[e]={started:!1,finished:!1,lengthComputable:!1,total:0,loaded:0}),"object"!=typeof t||"progress"!=t.type&&"load"!=t.type||(n.started||(n.started=!0,n.lengthComputable=t.lengthComputable),n.total=t.total,n.loaded=t.loaded,"load"==t.type&&(n.finished=!0)),0),o=0,a=0,i=0,s=0;for(e in c.downloadProgress){if(!(n=c.downloadProgress[e]).started)return;a++,n.lengthComputable?(r+=n.loaded,o+=n.total,i++):n.finished||s++}l(.9*(a?(a-s-(o?i*(o-r)/o:0))/a:0))}}function _(){var o=this;o.isConnected=new Promise(function(t,n){try{function r(){o.openDBTimeout&&(clearTimeout(o.openDBTimeout),o.openDBTimeout=null)}o.openDBTimeout=setTimeout(function(){void 0===o.database&&n(new Error("Could not connect to database: Timeout."))},2e3);var e=h.open(s.name,s.version);e.onupgradeneeded=function(e){var t;(e=(e=e).target.result).objectStoreNames.contains(f.name)||e.createObjectStore(f.name),e.objectStoreNames.contains(u.name)||(t=e.createObjectStore(u.name,{keyPath:"url"}),["version","company","product","updated","revalidated","accessed"].forEach(function(e){t.createIndex(e,e)}))},e.onsuccess=function(e){r(),o.database=e.target.result,t()},e.onerror=function(e){r(),o.database=null,n(new Error("Could not connect to database."))}}catch(e){r(),o.database=null,n(new Error("Could not connect to database."))}})}function S(e){console.log("[UnityCache] "+e)}function E(e){return E.link=E.link||document.createElement("a"),E.link.href=e,E.link.href}function C(t){t=t||{},this.headers=new Headers,Object.keys(t.headers).forEach(function(e){this.headers.set(e,t.headers[e])}.bind(this)),this.redirected=t.redirected,this.status=t.status,this.statusText=t.statusText,this.type=t.type,this.url=t.url,this.parsedBody=t.parsedBody,Object.defineProperty(this,"ok",{get:function(){return 200<=this.status&&this.status<=299}.bind(this)})}function B(e,t,n,r,o){var a={url:e,version:p.version,company:t,product:n,updated:r,revalidated:r,accessed:r,response:{headers:{}}};return o&&(o.headers.forEach(function(e,t){a.response.headers[t]=e}),["redirected","status","statusText","type","url"].forEach(function(e){a.response[e]=o[e]}),a.response.parsedBody=o.parsedBody),a}c.SystemInfo=function(){var e,t,n,r,o=navigator.userAgent+" ",a=[["Firefox","Firefox"],["OPR","Opera"],["Edg","Edge"],["SamsungBrowser","Samsung Browser"],["Trident","Internet Explorer"],["MSIE","Internet Explorer"],["Chrome","Chrome"],["CriOS","Chrome on iOS Safari"],["FxiOS","Firefox on iOS Safari"],["Safari","Safari"]];function i(e,t,n){return(e=RegExp(e,"i").exec(t))&&e[n]}for(var s=0;s<a.length;++s)if(t=i(a[s][0]+"[/ ](.*?)[ \\)]",o,1)){e=a[s][1];break}"Safari"==e&&(t=i("Version/(.*?) ",o,1)),"Internet Explorer"==e&&(t=i("rv:(.*?)\\)? ",o,1)||t);for(var l=[["Windows (.*?)[;)]","Windows"],["Android ([0-9_.]+)","Android"],["iPhone OS ([0-9_.]+)","iPhoneOS"],["iPad.*? OS ([0-9_.]+)","iPadOS"],["FreeBSD( )","FreeBSD"],["OpenBSD( )","OpenBSD"],["Linux|X11()","Linux"],["Mac OS X ([0-9_\\.]+)","MacOS"],["bot|google|baidu|bing|msn|teoma|slurp|yandex","Search Bot"]],d=0;d<l.length;++d)if(c=i(l[d][0],o,1)){n=l[d][1],c=c.replace(/_/g,".");break}var u,c={"NT 5.0":"2000","NT 5.1":"XP","NT 5.2":"Server 2003","NT 6.0":"Vista","NT 6.1":"7","NT 6.2":"8","NT 6.3":"8.1","NT 10.0":"10"}[c]||c,f=((f=document.createElement("canvas"))&&(u=(h=f.getContext("webgl2"))?2:0,h||(h=f&&f.getContext("webgl"))&&(u=1),h&&(r=h.getExtension("WEBGL_debug_renderer_info")&&h.getParameter(37446)||h.getParameter(7937))),"undefined"!=typeof SharedArrayBuffer),h="object"==typeof WebAssembly&&"function"==typeof WebAssembly.compile;return{width:screen.width,height:screen.height,userAgent:o.trim(),browser:e||"Unknown browser",browserVersion:t||"Unknown version",mobile:/Mobile|Android|iP(ad|hone)/.test(navigator.appVersion),os:n||"Unknown OS",osVersion:c||"Unknown OS Version",gpu:r||"Unknown GPU",language:navigator.userLanguage||navigator.language,hasWebGL:u,hasCursorLock:!!document.body.requestPointerLock,hasFullscreen:!!document.body.requestFullscreen||!!document.body.webkitRequestFullscreen,hasThreads:f,hasWasm:h,hasWasmThreads:!1}}(),c.abortHandler=function(e){returnÊKˆ‹
KLK\œ›Ü‹œÝXÚÕ˜XÙS[Z]SX]›X^
\œ›Ü‹œÝXÚÕ˜XÙS[Z]L
KËœ™XY›ÙUÚ]›ÙÜ™\ÜÏY[˜Ý[ÛŠKKÊ^Ý˜\ˆOXK˜›ÙOØK˜›ÙK™Ù]™XY\Š
N›ÚY]›ÚYOOXKšXY\œË™Ù]
ÛÛ[S[™ÝŠKY[˜Ý[ÛŠK
^ÚYŠ]
\™]\›ˆÝ˜\ˆYKšXY\œË™Ù]
ÛÛ[Q[˜ÛÙ[™ÈŠK\\œÙR[
KšXY\œË™Ù]
ÛÛ[S[™ÝŠJNÜÝÚ]Ú

^ØØ\ÙH˜œˆŽœ™]\›ˆX]œ›Ý[™
J›ŠNØØ\ÙH™Þš\Žœ™]\›ˆX]œ›Ý[™

›ŠNÙY˜][œ™]\›ˆŸ_JK
KO[™]ÈZ[\œ˜^J
KÏV×KLLÜ™]\›ˆÛÛœÛÛKØ\›Š–Õ[š]PØXÚWH™\ÜÛœÙH\ÈÙ\™YÚ]Ý]ÛÛ[S[™ÝXY\‹ˆX\ÙH™XÛÛ™šYÝ\™HÙ\™\ˆÈ[˜ÛYH˜[YÛÛ[S[™Ý›Üˆ™]\ˆÝÛ›ØY\™›Ü›X[˜ÙKˆŠK[˜Ý[ÛˆÊ
^Ü™]\›ˆ›ÚYOOYOØK˜\œ˜^PY™™\Š
K[Š[˜Ý[ÛŠJ^Ý˜\ˆ[™]ÈZ[\œ˜^JJNÜ™]\›ˆJÝ\Nˆœ›ÙÜ™\ÜÈ‹™\ÜÛœÙN˜KÝ[™K›[™ÝØYYŒ[™ÝÛÛ\]X›N›Ú[šÎœÏÝ›[JKJN™Kœ™XY

K[Š[˜Ý[ÛŠJ^ÚYŠK™Û™J^ÚYŠOOY
\™]\›ˆNÚYŠ
\™]\›ˆKœÛXÙJŠNÙ›ÜŠ˜\ˆ[™]ÈZ[\œ˜^JŠKJœÙ]
K
K
KLÜË›[™ÝÊÊÜŠ]œÙ]
ÖÜ—KŠKŠÏXÖÜ—K›[™ÝÜ™]\›ˆ\™]\›ˆŠÙK˜[YK›[™Ý]K›[™ÝÊKœÙ]
K˜[YKŠKYŠÙK˜[YK›[™Ý
N˜Ëœ\Ú
K˜[YJKŠÏYK˜[YK›[™ÝJÝ\Nˆœ›ÙÜ™\ÜÈ‹™\ÜÛœÙN˜KÝ[“X]›X^
ŠKØYY™‹[™ÝÛÛ\]X›N›Ú[šÎœÏÙK˜[YN›[JKÊ
_J_J
K[Š[˜Ý[ÛŠJ^Ü™]\›ˆJÝ\Nˆ›ØY‹™\ÜÛœÙN˜KÝ[™K›[™ÝØYY™K›[™Ý[™ÝÛÛ\]X›N›Ú[šÎ›[JKKœ\œÙY›ÙOYK_J_KË™™]ÚÚ]›ÙÜ™\ÜÏY[˜Ý[ÛŠK
^Ý˜\ˆY[˜Ý[ÛŠ
^ßNÜ™]\›ˆ	‰›Û”›ÙÜ™\ÜÉ‰Š]›Û”›ÙÜ™\ÜÊK™]Ú
K
K[Š[˜Ý[ÛŠJ^Ü™]\›ˆËœ™XY›ÙUÚ]›ÙÜ™\ÜÊK‹™[˜X›TÝ™X[Z[™ÑÝÛ›ØY
_J_KË•[š]PØXÚOJÏ^Û˜[YNˆ•[š]PØXÚH‹™\œÚ[ÛŽŒßKO^Û˜[YNˆ”™\]Y\ÝÝÜ™H‹™\œÚ[ÛŽŒ_K^Û˜[YNˆ•ÙX\ÜÙ[X›H‹™\œÚ[ÛŽŒ_K]Ú[™ÝËš[™^YŸÚ[™ÝË›[Þ’[™^YŸÚ[™ÝËÙXšÚ][™^YŸÚ[™ÝË›\Ò[™^Y‹Ë•[š]PØXÚQ]X˜\ÙO\ËË”™\]Y\ÝÝÜ™O]KË•ÙX\ÜÙ[X›TÝÜ™OY‹[[Ë™Ù][œÝ[˜ÙOY[˜Ý[ÛŠ
^Ü™]\›ˆXŸ™]ÈßKË™\Ý›ÞR[œÝ[˜ÙOY[˜Ý[ÛŠ
^Ü™]\›ˆØ‹˜ÛÜÙJ
K[Š[˜Ý[ÛŠ
^Ø[[JN”›ÛZ\ÙKœ™\ÛÛ™J
_KË˜ÛX\ØXÚOY[˜Ý[ÛŠ
^Ü™]\›ˆË™\Ý›ÞR[œÝ[˜ÙJ
K[Š[˜Ý[ÛŠ
^Ü™]\›ˆ™]È›ÛZ\ÙJ[˜Ý[ÛŠK
^Ý˜\ˆZ™[]Q]X˜\ÙJË›˜[YJNÛ‹›ÛœÝXØÙ\ÜÏY[˜Ý[ÛŠ
^ÙJ
_K‹›Û™\œ›ÜY[˜Ý[ÛŠ
^Ý
™]È\œ›ÜŠÛÝ[›Ý[]H]X˜\ÙKˆŠJ_K‹›Û˜›ØÚÙYY[˜Ý[ÛŠ
^Ý
™]È\œ›ÜŠ‘]X˜\ÙH›ØÚÙYˆŠJ__J_J_KËœ›ÝÝ\K™^XÝ]OY[˜Ý[ÛŠKKÊ^Ü™]\›ˆ\Ëš\ÐÛÛ›™XÝY[Š[˜Ý[ÛŠ
^Ü™]\›ˆ™]È›ÛZ\ÙJ[˜Ý[ÛŠŠ^Ýž^Ý˜\ˆK‹ÎÛ[OO]\Ë™]X˜\ÙOÛŠ™]È\œ›ÜŠš[™^YˆXØÙ\ÜÈ[šYYŠJNŠOKLHOVÈœ]‹™[]H‹˜ÛX\ˆ—Kš[™^ÙŠJOÈœ™XYÜš]HŽˆœ™XYÛ›H‹]\Ë™]X˜\ÙK˜[œØXÝ[ÛŠØWKJK›Øš™XÝÝÜ™JJK›Ü[’Ù^PÝ\œÛÜˆOZI‰Š\‹š[™^
ÖÌJKÏ\ËœÛXÙJJJK
Ï\–ÚWK˜\J‹ÊJK›ÛœÝXØÙ\ÜÏY[˜Ý[ÛŠJ^Ý
K\™Ù]œ™\Ý[
_KË›Û™\œ›ÜY[˜Ý[ÛŠJ^ÛŠJ_J_XØ]Ú
J^ÛŠJ__K˜š[™
\ÊJ_K˜š[™
\ÊJ_KËœ›ÝÝ\K›ØY™\]Y\ÝY[˜Ý[ÛŠJ^Ü™]\›ˆ\Ë™^XÝ]JK›˜[YK™Ù]‹ÙWJ_KËœ›ÝÝ\KœÝÜ™T™\]Y\ÝY[˜Ý[ÛŠJ^Ü™]\›ˆ\Ë™^XÝ]JK›˜[YKœ]‹ÙWJ_KËœ›ÝÝ\K˜ÛÜÙOY[˜Ý[ÛŠ
^Ü™]\›ˆ\Ëš\ÐÛÛ›™XÝY[Š[˜Ý[ÛŠ
^Ý\Ë™]X˜\ÙI‰Š\Ë™]X˜\ÙK˜ÛÜÙJ
K\Ë™]X˜\ÙO[[
_K˜š[™
\ÊJ_KÊKË˜ØXÚY™]ÚJOXË•[š]PØXÚK[K”™\]Y\ÝÝÜ™KÏXË™™]ÚÚ]›ÙÜ™\ÜËËœ›ÝÝ\K˜\œ˜^PY™™\Y[˜Ý[ÛŠ
^Ü™]\›ˆ›ÛZ\ÙKœ™\ÛÛ™J\Ëœ\œÙY›ÙK˜Y™™\Š_KËœ›ÝÝ\K˜›ØY[˜Ý[ÛŠ
^Ü™]\›ˆ\Ë˜\œ˜^PY™™\Š
K[Š[˜Ý[ÛŠJ^Ü™]\›ˆ™]È›ØŠÙWJ_J_KËœ›ÝÝ\KšœÛÛY[˜Ý[ÛŠ
^Ü™]\›ˆ\Ë^

K[Š[˜Ý[ÛŠJ^Ü™]\›ˆ”ÓÓ‹œ\œÙJJ_J_KËœ›ÝÝ\K^Y[˜Ý[ÛŠ
^Ý˜\ˆO[™]È^XÛÙ\ŽÜ™]\›ˆ›ÛZ\ÙKœ™\ÛÛ™JK™XÛÙJ\Ëœ\œÙY›ÙJJ_K[˜Ý[ÛŠ‹Ê^Ý˜\ˆKO[K™Ù][œÝ[˜ÙJ
KQJœÝš[™ÈOO]\ËœØš™XÝˆO]\[Ùˆ›ÝÈ™]È\Q\œ›ÜŠŠÈ›]\Ý™H›Û‹[Øš™XÝŠNÙ›ÜŠ˜\ˆˆ[ˆŠ[‹š\ÓÝÛ”›Ü\JŠI‰ŠVÜ—O[–Ü—J__\™]\›ˆ_K‹œÚš[šÐYY[˜Ý[ÛŠK
^ÚYŠK›[™ÝOO]
^ÚYŠKœÝX˜\œ˜^J\™]\›ˆKœÝX˜\œ˜^J
NÙK›[™Ý]\™]\›ˆ_KØ\œ˜^TÙ]™[˜Ý[ÛŠK‹‹Ê^ÚYŠœÝX˜\œ˜^I‰™KœÝX˜\œ˜^JYKœÙ]
œÝX˜\œ˜^J‹ŠÜŠKÊNÙ[ÙH›ÜŠ˜\ˆOLØOØJÊÊYVÛÊØWO]ÛŠØW_K›][Ú[šÜÎ™[˜Ý[ÛŠJ^Ù›ÜŠ˜\ˆ‹‹ÏLOLOYK›[™ÝØONØJÊÊ[ÊÏYVØWK›[™ÝÙ›ÜŠ[™]ÈZ[\œ˜^JJKO]LOYK›[™ÝØONØJÊÊ[YVØWK‹œÙ]
‹
K
Ï[‹›[™ÝÜ™]\›ˆŸ_JKO^Ø\œ˜^TÙ]™[˜Ý[ÛŠK‹‹Ê^Ù›ÜŠ˜\ˆOLØONØJÊÊYVÛÊØWO]ÛŠØW_K›][Ú[šÜÎ™[˜Ý[ÛŠJ^Ü™]\›–×K˜ÛÛ˜Ø]˜\J×KJ__NÛ‹œÙ]\YY[˜Ý[ÛŠJ^ÙOÊ‹YŽUZ[\œ˜^K‹YŒMUZ[M\œ˜^K‹YŒÌR[Ì\œ˜^K‹˜\ÜÚYÛŠ‹ÊJNŠ‹YŽP\œ˜^K‹YŒMP\œ˜^K‹YŒÌP\œ˜^K‹˜\ÜÚYÛŠ‹JJ_K‹œÙ]\Y
Š_K][ËÜÝš[™ÜËšœÈŽ™[˜Ý[ÛŠKŠ^È\ÙHÝšXÝŽÝ˜\ˆYJ‹‹ØÛÛ[[ÛˆŠKÏHLOHLÝž^ÔÝš[™Ë™œ›ÛPÚ\ÛÙK˜\J[ÌJ_XØ]Ú
J^ÛÏHL_]ž^ÔÝš[™Ë™œ›ÛPÚ\ÛÙK˜\J[™]ÈZ[\œ˜^JJJ_XØ]Ú
J^ØOHL_Y›ÜŠ˜\ˆ[™]ÈYŽ
MŠKLÜMŽÜŠÊÊYÜ—OLL\ÍŽŒ\ÍNŒ\ÍŒŒ\ÌÎŒNL\ÌŽŒNÙ[˜Ý[ÛˆJK
^ÚYŠMLÍÉ‰ŠKœÝX˜\œ˜^I‰˜_YKœÝX˜\œ˜^I‰›ÊJ\™]\›ˆÝš[™Ë™œ›ÛPÚ\ÛÙK˜\J[œÚš[šÐYŠK
JNÙ›ÜŠ˜\ˆHˆ‹LÜÜŠÊÊ[ŠÏTÝš[™Ë™œ›ÛPÚ\ÛÙJVÜ—JNÜ™]\›ˆŸYÌMOYÌMOLK‹œÝš[™Ì˜YY[˜Ý[ÛŠJ^Ù›ÜŠ˜\ˆ‹‹ËOYK›[™ÝOLÏLÜÏNÜÊÊÊMMLŽMOJLL‰ŠYK˜Ú\ÛÙP]
ÊJJI‰œÊÌOI‰MŒÌŒOJLL‰ŠYK˜Ú\ÛÙP]
ÊÌJJJI‰ŠMMLÍŠÊ‹MMLŽML
JÊ‹MMŒÌŒ
KÊÊÊKJÏ[LŽÌN›ŒÌŽ››MLÍÌÎÙ›ÜŠ[™]ÈYŽ
JKÏ[ÏLÛÏNÜÊÊÊMMLŽMOJLL‰ŠYK˜Ú\ÛÙP]
ÊJJI‰œÊÌOI‰MŒÌŒOJLL‰ŠYK˜Ú\ÛÙP]
ÊÌJJJI‰ŠMMLÍŠÊ‹MMLŽML
JÊ‹MMŒÌŒ
KÊÊÊKLŽÝÛÊÊ×O[ŽŠŒÝÛÊÊ×OLNLŸŽŠMLÍÝÛÊÊ×OLŒŒLŽŠÛÊÊ×OLŒNÛÊÊ×OLLŽŒL‰ŒÊKÛÊÊ×OLLŽ‰ŒÊKÛÊÊ×OLLŽŒÉ›ŠNÜ™]\›ˆK‹˜YŒ˜š[œÝš[™ÏY[˜Ý[ÛŠJ^Ü™]\›ˆJKK›[™Ý
_K‹˜š[œÝš[™Ì˜YY[˜Ý[ÛŠJ^Ù›ÜŠ˜\ˆ[™]ÈYŽ
K›[™Ý
KL]›[™ÝÛŽÛŠÊÊ]Û—OYK˜Ú\ÛÙP]
ŠNÜ™]\›ˆK‹˜YŒœÝš[™ÏY[˜Ý[ÛŠK
^Ù›ÜŠ˜\ˆ‹‹Ï]K›[™ÝO[™]È\œ˜^JŠ›ÊKOLÏLÜÏÎÊZYŠ
YVÜÊÊ×JOLŽ
XVÚJÊ×O[ŽÙ[ÙHYŠ
YÛ—JJXVÚJÊ×OMMLÌËÊÏ\‹LNÙ[Ù^Ù›ÜŠ‰LOO\ÌÌNŒÏOO\ÌMNÎÌO‰‰œÏÎÊ[[ŸŒÉ™VÜÊÊ×K‹KNÌOØVÚJÊ×OMMLÌÎ›MLÍØVÚJÊ×O[ŽŠ‹OMMLÍ‹VÚJÊ×OMMLŽMŸŒL	ŒLŒËVÚJÊ×OMMŒÌŒLŒÉ›Š_\™]\›ˆJKJ_K‹]Ž›Ü™\Y[˜Ý[ÛŠK
^Ù›ÜŠ˜\ˆJJ]K›[™Ý
O™K›[™ÝÙK›[™Ý
KLNÌ[‰‰ŒLŽOJNL‰™VÛ—JNÊ[‹KNÜ™]\›ˆJ
I‰ŒOO[‰‰›ŠÙÙVÛ—WOÛŽ_Kž›X‹Ú[™›]KšœÈŽ™[˜Ý[ÛŠKŠ^È\ÙHÝšXÝŽÝ˜\ˆYJ‹‹‹Ý][ËØÛÛ[[ÛˆŠKÏYJ‹‹ØY\ŒÌˆŠKOYJ‹‹ØÜ˜ÌÌˆŠKOYJ‹‹Ú[™™˜\ÝŠKYJ‹‹Ú[™™Y\ÈŠKLKL‹LKNL‹ÏMNLŽÙ[˜Ý[ÛˆŠJ^Ü™]\›ŠOŒ	ŒMJJÊOŽ	LŽ
JÊ
LŽ	™JO
JÊ
MI™JO
_Y[˜Ý[ÛˆJ
^Ý\Ë›[ÙOL\Ë›\ÝHLK\ËÜ˜\L\Ëš]™YXÝHLK\Ë™›YÜÏL\Ë™X^L\Ë˜ÚXÚÏL\ËÝ[L\ËšXY[[\ËØš]ÏL\ËÜÚ^™OL\ËÚ]™OL\ËÛ™^L\ËÚ[™ÝÏ[[\ËšÛL\Ë˜š]ÏL\Ë›[™ÝL\Ë›Ù™œÙ]L\Ë™^˜OL\Ë›[˜ÛÙO[[\Ë™\ÝÛÙO[[\Ë›[˜š]ÏL\Ë™\Ýš]ÏL\Ë›˜ÛÙOL\Ë››[L\Ë›™\ÝL\Ëš]™OL\Ë›™^[[\Ë›[œÏ[™]ÈYŒMŠÌŒ
K\ËÛÜšÏ[™]ÈYŒMŠŽ
K\Ë›[™[[[\Ë™\Ý[[[\ËœØ[™OL\Ë˜˜XÚÏL\ËØ\ÏLY[˜Ý[ÛˆJJ^Ý˜\ˆÜ™]\›ˆI‰™KœÝ]OÊYKœÝ]KKÝ[Ú[YKÝ[ÛÝ]]Ý[LK›\ÙÏHˆ‹Ü˜\	‰ŠK˜Y\LIÜ˜\
K›[ÙO^‹›\ÝLš]™YXÝL™X^LÌÍŽšXY[[šÛL˜š]ÏL›[˜ÛÙO]›[™[[™]ÈYŒÌŠŠK™\ÝÛÙO]™\Ý[[™]ÈYŒÌŠÊKœØ[™OLK˜˜XÚÏKLK
N“ŸY[˜Ý[ÛˆÊJ^Ý˜\ˆÜ™]\›ˆI‰™KœÝ]OÊ
YKœÝ]JKÜÚ^™OLÚ]™OLÛ™^LJJJN“ŸY[˜Ý[Ûˆ
K
^Ý˜\ˆ‹ŽÜ™]\›ˆY_YKœÝ]_
YKœÝ]KÊLK]
NŠLJÊ
K	‰Š	LMJJK	‰ŠMO
JOÓŽŠ[OO\‹Ú[™ÝÍ‰‰ˆÈOLÊ
K[Ù^Ù›ÜŠVÍ—O]VÍ—KVÌO^ÌKVÌWO^ÌWKÌO^Ö^PXØÙ\ÜÓ[ÙN‘‹›Ü˜ÙTÚ\™YY™™\™\žTÝXœÙ]–_KLÛNÛŠÊÊYJÊÛŠNØØ]Ú
J^ÛÏJÛŸZNŠJJÛŠKJNØØXØÚ
J[ÛÛ›ÝÊJNÜ™]\›Ÿ\ŠJJ_WJ__J
_K