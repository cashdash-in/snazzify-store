var at=()=>{};var lt=function(e){let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===55296&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t},_n=function(e){let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let r=e[n++];t[s++]=String.fromCharCode((i&31)<<6|r&63)}else if(i>239&&i<365){let r=e[n++],o=e[n++],a=e[n++],c=((i&7)<<18|(r&63)<<12|(o&63)<<6|a&63)-65536;t[s++]=String.fromCharCode(55296+(c>>10)),t[s++]=String.fromCharCode(56320+(c&1023))}else{let r=e[n++],o=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(r&63)<<6|o&63)}}return t.join("")},J={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let i=0;i<e.length;i+=3){let r=e[i],o=i+1<e.length,a=o?e[i+1]:0,c=i+2<e.length,l=c?e[i+2]:0,h=r>>2,f=(r&3)<<4|a>>4,g=(a&15)<<2|l>>6,q=l&63;c||(q=64,o||(g=64)),s.push(n[h],n[f],n[g],n[q])}return s.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(lt(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):_n(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();let n=t?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<e.length;){let r=n[e.charAt(i++)],a=i<e.length?n[e.charAt(i)]:0;++i;let l=i<e.length?n[e.charAt(i)]:64;++i;let f=i<e.length?n[e.charAt(i)]:64;if(++i,r==null||a==null||l==null||f==null)throw new ge;let g=r<<2|a>>4;if(s.push(g),l!==64){let q=a<<4&240|l>>2;if(s.push(q),f!==64){let bn=l<<6&192|f;s.push(bn)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}},ge=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},yn=function(e){let t=lt(e);return J.encodeByteArray(t,!0)},me=function(e){return yn(e).replace(/\./g,"")},ut=function(e){try{return J.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};function k(e){return dt(void 0,e)}function dt(e,t){if(!(t instanceof Object))return t;switch(t.constructor){case Date:let n=t;return new Date(n.getTime());case Object:e===void 0&&(e={});break;case Array:e=[];break;default:return t}for(let n in t)!t.hasOwnProperty(n)||!wn(n)||(e[n]=dt(e[n],t[n]));return e}function wn(e){return e!=="__proto__"}function G(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var Sn=()=>G().__FIREBASE_DEFAULTS__,Tn=()=>{if(typeof process>"u"||typeof process.env>"u")return;let e=process.env.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},An=()=>{if(typeof document>"u")return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let t=e&&ut(e[1]);return t&&JSON.parse(t)},Cn=()=>{try{return at()||Sn()||Tn()||An()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}};var Ee=()=>Cn()?.config;var S=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}wrapCallback(t){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(n):t(n,s))}}};function V(){try{return typeof indexedDB=="object"}catch{return!1}}function ht(){return new Promise((e,t)=>{try{let n=!0,s="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(s);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(s),e(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{t(i.error?.message||"")}}catch(n){t(n)}})}var Rn="FirebaseError",O=class e extends Error{constructor(t,n,s){super(n),this.code=t,this.customData=s,this.name=Rn,Object.setPrototypeOf(this,e.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,x.prototype.create)}},x=class{constructor(t,n,s){this.service=t,this.serviceName=n,this.errors=s}create(t,...n){let s=n[0]||{},i=`${this.service}/${t}`,r=this.errors[t],o=r?On(r,s):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new O(i,a,s)}};function On(e,t){try{let n=0,s="";for(;n<e.length;){let i=e.indexOf("{$",n);if(i===-1){s+=e.substring(n);break}let r=e.indexOf("}",i+2);if(r===-1){s+=e.substring(n);break}let o=e.substring(i+2,r),a=t[o];s+=e.substring(n,i)+(a!=null?String(a):`<${o}?>`),n=r+1}return s}catch{return e}}function X(e,t){if(e===t)return!0;let n=Object.keys(e),s=Object.keys(t);for(let i of n){if(!s.includes(i))return!1;let r=e[i],o=t[i];if(ct(r)&&ct(o)){if(!X(r,o))return!1}else if(r!==o)return!1}for(let i of s)if(!n.includes(i))return!1;return!0}function ct(e){return e!==null&&typeof e=="object"}var In=1e3,Dn=2,vn=14400*1e3,kn=.5;function ft(e,t=In,n=Dn){let s=t*Math.pow(n,e),i=Math.round(kn*s*(Math.random()-.5)*2);return Math.min(vn,s+i)}function Q(e){return e&&e._delegate?e._delegate:e}var y=class{constructor(t,n,s){this.name=t,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}};var U="[DEFAULT]";var be=class{constructor(t,n){this.name=t,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){let n=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(n)){let s=new S;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{let i=this.getOrInitializeService({instanceIdentifier:n});i&&s.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(t){let n=this.normalizeInstanceIdentifier(t?.identifier),s=t?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(Ln(t))try{this.getOrInitializeService({instanceIdentifier:U})}catch{}for(let[n,s]of this.instancesDeferred.entries()){let i=this.normalizeInstanceIdentifier(n);try{let r=this.getOrInitializeService({instanceIdentifier:i});s.resolve(r)}catch{}}}}clearInstance(t=U){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){let t=Array.from(this.instances.values());await Promise.all([...t.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...t.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=U){return this.instances.has(t)}getOptions(t=U){return this.instancesOptions.get(t)||{}}initialize(t={}){let{options:n={}}=t,s=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:s,options:n});for(let[r,o]of this.instancesDeferred.entries()){let a=this.normalizeInstanceIdentifier(r);s===a&&o.resolve(i)}return i}onInit(t,n){let s=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(s)??new Set;i.add(t),this.onInitCallbacks.set(s,i);let r=this.instances.get(s);return r&&t(r,s),()=>{i.delete(t)}}invokeOnInitCallbacks(t,n){let s=this.onInitCallbacks.get(n);if(s)for(let i of s)try{i(t,n)}catch{}}getOrInitializeService({instanceIdentifier:t,options:n={}}){let s=this.instances.get(t);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Nn(t),options:n}),this.instances.set(t,s),this.instancesOptions.set(t,n),this.invokeOnInitCallbacks(s,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,s)}catch{}return s||null}normalizeInstanceIdentifier(t=U){return this.component?this.component.multipleInstances?t:U:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function Nn(e){return e===U?void 0:e}function Ln(e){return e.instantiationMode==="EAGER"}var Z=class{constructor(t){this.name=t,this.providers=new Map}addComponent(t){let n=this.getProvider(t.name);if(n.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);n.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);let n=new be(t,this);return this.providers.set(t,n),n}getProviders(){return Array.from(this.providers.values())}};var Pn=[],p;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(p||(p={}));var Mn={debug:p.DEBUG,verbose:p.VERBOSE,info:p.INFO,warn:p.WARN,error:p.ERROR,silent:p.SILENT},xn=p.INFO,Un={[p.DEBUG]:"log",[p.VERBOSE]:"log",[p.INFO]:"info",[p.WARN]:"warn",[p.ERROR]:"error"},$n=(e,t,...n)=>{if(t<e.logLevel)return;let s=new Date().toISOString(),i=Un[t];if(i)console[i](`[${s}]  ${e.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)},N=class{constructor(t){this.name=t,this._logLevel=xn,this._logHandler=$n,this._userLogHandler=null,Pn.push(this)}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in p))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?Mn[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,p.DEBUG,...t),this._logHandler(this,p.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,p.VERBOSE,...t),this._logHandler(this,p.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,p.INFO,...t),this._logHandler(this,p.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,p.WARN,...t),this._logHandler(this,p.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,p.ERROR,...t),this._logHandler(this,p.ERROR,...t)}};var Fn=(e,t)=>t.some(n=>e instanceof n),pt,gt;function Bn(){return pt||(pt=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Hn(){return gt||(gt=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var mt=new WeakMap,ye=new WeakMap,Et=new WeakMap,_e=new WeakMap,Se=new WeakMap;function Gn(e){let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("success",r),e.removeEventListener("error",o)},r=()=>{n(T(e.result)),i()},o=()=>{s(e.error),i()};e.addEventListener("success",r),e.addEventListener("error",o)});return t.then(n=>{n instanceof IDBCursor&&mt.set(n,e)}).catch(()=>{}),Se.set(t,e),t}function Vn(e){if(ye.has(e))return;let t=new Promise((n,s)=>{let i=()=>{e.removeEventListener("complete",r),e.removeEventListener("error",o),e.removeEventListener("abort",o)},r=()=>{n(),i()},o=()=>{s(e.error||new DOMException("AbortError","AbortError")),i()};e.addEventListener("complete",r),e.addEventListener("error",o),e.addEventListener("abort",o)});ye.set(e,t)}var we={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return ye.get(e);if(t==="objectStoreNames")return e.objectStoreNames||Et.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return T(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function bt(e){we=e(we)}function jn(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){let s=e.call(ee(this),t,...n);return Et.set(s,t.sort?t.sort():[t]),T(s)}:Hn().includes(e)?function(...t){return e.apply(ee(this),t),T(mt.get(this))}:function(...t){return T(e.apply(ee(this),t))}}function Wn(e){return typeof e=="function"?jn(e):(e instanceof IDBTransaction&&Vn(e),Fn(e,Bn())?new Proxy(e,we):e)}function T(e){if(e instanceof IDBRequest)return Gn(e);if(_e.has(e))return _e.get(e);let t=Wn(e);return t!==e&&(_e.set(e,t),Se.set(t,e)),t}var ee=e=>Se.get(e);function yt(e,t,{blocked:n,upgrade:s,blocking:i,terminated:r}={}){let o=indexedDB.open(e,t),a=T(o);return s&&o.addEventListener("upgradeneeded",c=>{s(T(o.result),c.oldVersion,c.newVersion,T(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{r&&c.addEventListener("close",()=>r()),i&&c.addEventListener("versionchange",l=>i(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}var zn=["get","getKey","getAll","getAllKeys","count"],Kn=["put","add","delete","clear"],Te=new Map;function _t(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(Te.get(t))return Te.get(t);let n=t.replace(/FromIndex$/,""),s=t!==n,i=Kn.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(i||zn.includes(n)))return;let r=async function(o,...a){let c=this.transaction(o,i?"readwrite":"readonly"),l=c.store;return s&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),i&&c.done]))[0]};return Te.set(t,r),r}bt(e=>({...e,get:(t,n,s)=>_t(t,n)||e.get(t,n,s),has:(t,n)=>!!_t(t,n)||e.has(t,n)}));var Ce=class{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Yn(n)){let s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}};function Yn(e){return e.getComponent()?.type==="VERSION"}var Re="@firebase/app",wt="0.16.7";var C=new N("@firebase/app"),qn="@firebase/app-compat",Jn="@firebase/analytics-compat",Xn="@firebase/analytics",Qn="@firebase/app-check-compat",Zn="@firebase/app-check",es="@firebase/auth",ts="@firebase/auth-compat",ns="@firebase/crashlytics",ss="@firebase/database",is="@firebase/data-connect",rs="@firebase/database-compat",os="@firebase/functions",as="@firebase/functions-compat",cs="@firebase/installations",ls="@firebase/installations-compat",us="@firebase/messaging",ds="@firebase/messaging-compat",hs="@firebase/performance",fs="@firebase/performance-compat",ps="@firebase/remote-config",gs="@firebase/remote-config-compat",ms="@firebase/storage",Es="@firebase/storage-compat",bs="@firebase/firestore",_s="@firebase/ai",ys="@firebase/firestore-compat",ws="firebase";var Oe="[DEFAULT]",Ss={[Re]:"fire-core",[qn]:"fire-core-compat",[Xn]:"fire-analytics",[Jn]:"fire-analytics-compat",[Zn]:"fire-app-check",[Qn]:"fire-app-check-compat",[es]:"fire-auth",[ts]:"fire-auth-compat",[ns]:"fire-cls",[ss]:"fire-rtdb",[is]:"fire-data-connect",[rs]:"fire-rtdb-compat",[os]:"fire-fn",[as]:"fire-fn-compat",[cs]:"fire-iid",[ls]:"fire-iid-compat",[us]:"fire-fcm",[ds]:"fire-fcm-compat",[hs]:"fire-perf",[fs]:"fire-perf-compat",[ps]:"fire-rc",[gs]:"fire-rc-compat",[ms]:"fire-gcs",[Es]:"fire-gcs-compat",[bs]:"fire-fst",[ys]:"fire-fst-compat",[_s]:"fire-vertex","fire-js":"fire-js",[ws]:"fire-js-all"};var ne=new Map,Ts=new Map,Ie=new Map;function St(e,t){try{e.container.addComponent(t)}catch(n){C.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function L(e){let t=e.name;if(Ie.has(t))return C.debug(`There were multiple attempts to register component ${t}.`),!1;Ie.set(t,e);for(let n of ne.values())St(n,e);for(let n of Ts.values())St(n,e);return!0}function W(e,t){let n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}function Rt(e){return e==null?!1:e.settings!==void 0}var As={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},I=new x("app","Firebase",As);var De=class{constructor(t,n,s){this._isDeleted=!1,this._options={...t},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new y("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw I.create("app-deleted",{appName:this._name})}};function Le(e,t={}){let n=e;typeof t!="object"&&(t={name:t});let s={name:Oe,automaticDataCollectionEnabled:!0,...t},i=s.name;if(typeof i!="string"||!i)throw I.create("bad-app-name",{appName:String(i)});if(n||(n=Ee()),!n)throw I.create("no-options");let r=ne.get(i);if(r)if(X(n,r.options)){if(X(s,r.config))return r;throw I.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(r.config),newValue:JSON.stringify(s)})}else throw I.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(r.options),newValue:JSON.stringify(n)});let o=new Z(i);for(let c of Ie.values())o.addComponent(c);let a=new De(n,s,o);return ne.set(i,a),a}function se(e=Oe){let t=ne.get(e);if(!t&&e===Oe&&Ee())return Le();if(!t)throw I.create("no-app",{appName:e});return t}function A(e,t,n){let s=Ss[e]??e;n&&(s+=`-${n}`);let i=s.match(/\s|\//),r=t.match(/\s|\//);if(i||r){let o=[`Unable to register library "${s}" with version "${t}":`];i&&o.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&r&&o.push("and"),r&&o.push(`version name "${t}" contains illegal characters (whitespace or "/")`),C.warn(o.join(" "));return}L(new y(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}var Cs="firebase-heartbeat-database",Rs=1,j="firebase-heartbeat-store",Ae=null;function Ot(){return Ae||(Ae=yt(Cs,Rs,{upgrade:(e,t)=>{switch(t){case 0:try{e.createObjectStore(j)}catch(n){console.warn(n)}}}}).catch(e=>{throw I.create("idb-open",{originalErrorMessage:e.message})})),Ae}async function Os(e){try{let n=(await Ot()).transaction(j),s=await n.objectStore(j).get(It(e));return await n.done,s}catch(t){if(t instanceof O)C.warn(t.message);else{let n=I.create("idb-get",{originalErrorMessage:t?.message});C.warn(n.message)}}}async function Tt(e,t){try{let s=(await Ot()).transaction(j,"readwrite");await s.objectStore(j).put(t,It(e)),await s.done}catch(n){if(n instanceof O)C.warn(n.message);else{let s=I.create("idb-set",{originalErrorMessage:n?.message});C.warn(s.message)}}}function It(e){return`${e.name}!${e.options.appId}`}var Is=1024,Ds=30,ve=class{constructor(t){this.container=t,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new ke(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=At();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(i=>i.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:n}),this._heartbeatsCache.heartbeats.length>Ds){let i=ks(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(t){C.warn(t)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let t=At(),{heartbeatsToSend:n,unsentEntries:s}=vs(this._heartbeatsCache.heartbeats),i=me(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return C.warn(t),""}}};function At(){return new Date().toISOString().substring(0,10)}function vs(e,t=Is){let n=[],s=e.slice();for(let i of e){let r=n.find(o=>o.agent===i.agent);if(r){if(r.dates.push(i.date),Ct(n)>t){r.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),Ct(n)>t){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}var ke=class{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return V()?ht().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await Os(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return Tt(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){if(await this._canUseIndexedDBPromise){let s=await this.read();return Tt(this.app,{lastSentHeartbeatDate:t.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}};function Ct(e){return me(JSON.stringify({version:2,heartbeats:e})).length}function ks(e){if(e.length===0)return-1;let t=0,n=e[0].date;for(let s=1;s<e.length;s++)e[s].date<n&&(n=e[s].date,t=s);return t}function Ns(e){L(new y("platform-logger",t=>new Ce(t),"PRIVATE")),L(new y("heartbeat",t=>new ve(t),"PRIVATE")),A(Re,wt,e),A(Re,wt,"esm2020"),A("fire-js","")}var Ne="firebase-js-sdk-policy",Ls=["https://www.googletagmanager.com/gtag/js","https://apis.google.com/js/api.js","https://www.google.com/recaptcha/api.js","https://www.google.com/recaptcha/enterprise.js"],te,Dt=!1;function vt(e){if(!Ls.some(n=>e.startsWith(n)&&(e.length===n.length||e.charAt(n.length)==="?")))throw new TypeError(`Firebase: Refusing to load untrusted script URL: ${e}`);return e}function Ps(){if(te===void 0){te=null;let e=typeof window<"u"?window.trustedTypes:void 0;if(e?.createPolicy)try{te=e.createPolicy(Ne,{createScriptURL:vt})}catch{Dt=!0}}return te}function kt(e,t){vt(t);let n=Ps();if(n){e.src=n.createScriptURL(t);return}try{e.src=t}catch(s){throw Dt&&C.error(`Unable to load ${t} because this page requires Trusted Types for scripts but does not allow the "${Ne}" Trusted Types policy. To fix this, add "${Ne}" to the trusted-types directive of the page's Content-Security-Policy.`),s}}Ns("");var Ms="firebase",xs="13.4.0";A(Ms,xs,"app");var xe=new Map,Ut={activated:!1,tokenObservers:[]},Us={initialized:!1,enabled:!1};function m(e){return xe.get(e)||{...Ut}}function $s(e,t){return xe.set(e,t),xe.get(e)}function ae(){return Us}var $t="https://content-firebaseappcheck.googleapis.com/v1";var Fs="exchangeRecaptchaEnterpriseToken",Bs="exchangeDebugToken",Nt={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:960*1e3},Hs=1440*60*1e3;var Ue=class{constructor(t,n,s,i,r){if(this.operation=t,this.retryPolicy=n,this.getWaitDuration=s,this.lowerBound=i,this.upperBound=r,this.pending=null,this.nextErrorWaitInterval=i,i>r)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(t){this.stop();try{this.pending=new S,this.pending.promise.catch(n=>{}),await Gs(this.getNextRun(t)),this.pending.resolve(),await this.pending.promise,this.pending=new S,this.pending.promise.catch(n=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(n){this.retryPolicy(n)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(t){if(t)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{let n=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),n}}};function Gs(e){return new Promise(t=>{setTimeout(t,e)})}var Vs={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},_=new x("appCheck","AppCheck",Vs);function Lt(e=!1){return e?self.grecaptcha?.enterprise:self.grecaptcha}function Be(e){if(!m(e).activated)throw _.create("use-before-activation",{appName:e.name})}function Ft(e){let t=Math.round(e/1e3),n=Math.floor(t/(3600*24)),s=Math.floor((t-n*3600*24)/3600),i=Math.floor((t-n*3600*24-s*3600)/60),r=t-n*3600*24-s*3600-i*60,o="";return n&&(o+=ie(n)+"d:"),s&&(o+=ie(s)+"h:"),o+=ie(i)+"m:"+ie(r)+"s",o}function ie(e){return e===0?"00":e>=10?e.toString():"0"+e}async function He({url:e,body:t},n){let s={"Content-Type":"application/json"},i=n.getImmediate({optional:!0});if(i){let f=await i.getHeartbeatsHeader();f&&(s["X-Firebase-Client"]=f)}let r={method:"POST",body:JSON.stringify(t),headers:s},o;try{o=await fetch(e,r)}catch(f){throw _.create("fetch-network-error",{originalErrorMessage:f?.message})}if(o.status!==200)throw _.create("fetch-status-error",{httpStatus:o.status});let a;try{a=await o.json()}catch(f){throw _.create("fetch-parse-error",{originalErrorMessage:f?.message})}let c=a.ttl.match(/^([\d.]+)(s)$/);if(!c||!c[2]||isNaN(Number(c[1])))throw _.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${a.ttl}`});let l=Number(c[1])*1e3,h=Date.now();return{token:a.token,expireTimeMillis:h+l,issuedAtTimeMillis:h}}function js(e,t){let{projectId:n,appId:s,apiKey:i}=e.options;return{url:`${$t}/projects/${n}/apps/${s}:${Fs}?key=${i}`,body:{recaptcha_enterprise_token:t}}}function Bt(e,t){let{projectId:n,appId:s,apiKey:i}=e.options;return{url:`${$t}/projects/${n}/apps/${s}:${Bs}?key=${i}`,body:{debug_token:t}}}var Ws="firebase-app-check-database",zs=1,z="firebase-app-check-store",Ht="debug-token",re=null;function Gt(){return re||(re=new Promise((e,t)=>{try{let n=indexedDB.open(Ws,zs);n.onsuccess=s=>{e(s.target.result)},n.onerror=s=>{t(_.create("storage-open",{originalErrorMessage:s.target.error?.message}))},n.onupgradeneeded=s=>{let i=s.target.result;s.oldVersion===0&&i.createObjectStore(z,{keyPath:"compositeKey"})}}catch(n){t(_.create("storage-open",{originalErrorMessage:n?.message}))}}),re)}function Ks(e){return jt(Wt(e))}function Ys(e,t){return Vt(Wt(e),t)}function qs(e){return Vt(Ht,e)}function Js(){return jt(Ht)}async function Vt(e,t){let s=(await Gt()).transaction(z,"readwrite"),r=s.objectStore(z).put({compositeKey:e,value:t});return new Promise((o,a)=>{r.onsuccess=c=>{o()},s.onerror=c=>{a(_.create("storage-set",{originalErrorMessage:c.target.error?.message}))}})}async function jt(e){let n=(await Gt()).transaction(z,"readonly"),i=n.objectStore(z).get(e);return new Promise((r,o)=>{i.onsuccess=a=>{let c=a.target.result;r(c?c.value:void 0)},n.onerror=a=>{o(_.create("storage-get",{originalErrorMessage:a.target.error?.message}))}})}function Wt(e){return`${e.options.appId}-${e.name}`}var P=new N("@firebase/app-check");async function Xs(e){if(V()){let t;try{t=await Ks(e)}catch(n){P.warn(`Failed to read token from IndexedDB. Error: ${n}`)}return t}}function Pe(e,t){return V()?Ys(e,t).catch(n=>{P.warn(`Failed to write token to IndexedDB. Error: ${n}`)}):Promise.resolve()}async function Qs(e){let t;try{t=await Js()}catch{}if(t)return t;{let n=crypto.randomUUID(),s=`To use this token for app debugging, register it with your project.

Firebase App Check debug token: ${n}

`,i=e?.options.appId,r=e?.options.projectId;return r&&i?s+=`You can do so in the Firebase Console:
https://console.firebase.google.com/project/${r}/appcheck/apps?selectedAppId=${i}

Or using the Firebase CLI:
firebase appcheck:debugtokens:create ${n} --project ${r} --app ${i}

`:s+=`You will need to add it to your app's App Check settings in the Firebase Console for it to work.

`,s+=`Note: To keep your project secure, please revoke and delete this token using the
Firebase Console or the CLI (\`firebase appcheck:debugtokens:delete\`) when you finish debugging.

Warning: This debug token is a secret and should not be shared or uploaded to source code.

Debug Token Guide: https://firebase.google.com/docs/app-check/web/debug-provider
Firebase CLI install instructions: https://firebase.google.com/docs/cli
`,console.log(s),qs(n).catch(o=>P.warn(`Failed to persist debug token to IndexedDB. Error: ${o}`)),n}}function Ge(){return ae().enabled}async function Ve(){let e=ae();if(e.enabled&&e.token)return e.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function Zs(e){let t=G(),n=ae();if(n.initialized=!0,typeof t.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&t.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;n.enabled=!0;let s=new S;n.token=s,typeof t.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?s.resolve(t.FIREBASE_APPCHECK_DEBUG_TOKEN):s.resolve(Qs(e))}var ei={error:"UNKNOWN_ERROR"};function ti(e){return J.encodeString(JSON.stringify(e),!1)}async function $e(e,t=!1,n=!1){let s=e.app;Be(s);let i=m(s),r=i.token,o;if(r&&!F(r)&&(i.token=void 0,r=void 0),!r){let l=await i.cachedTokenPromise;l&&(F(l)?r=l:await Pe(s,void 0))}if(!t&&r&&F(r))return{token:r.token};let a=!1;if(Ge())try{let l=await Ve();i.exchangeTokenPromise||(i.exchangeTokenPromise=He(Bt(s,l),e.heartbeatServiceProvider).finally(()=>{i.exchangeTokenPromise=void 0}),a=!0);let h=await i.exchangeTokenPromise;return await Pe(s,h),i.token=h,{token:h.token}}catch(l){return l.code==="appCheck/throttled"||l.code==="appCheck/initial-throttle"?P.warn(l.message):n&&P.error(l),Me(l)}try{i.exchangeTokenPromise||(i.exchangeTokenPromise=i.provider.getToken().finally(()=>{i.exchangeTokenPromise=void 0}),a=!0),r=await m(s).exchangeTokenPromise}catch(l){l.code==="appCheck/throttled"||l.code==="appCheck/initial-throttle"?P.warn(l.message):n&&P.error(l),o=l}let c;return r?o?F(r)?c={token:r.token,internalError:o}:c=Me(o):(c={token:r.token},i.token=r,await Pe(s,r)):c=Me(o),a&&Yt(s,c),c}async function ni(e){let t=e.app;Be(t);let{provider:n}=m(t);if(Ge()){let s=await Ve(),i=Bt(t,s);i.body.limited_use=!0;let{token:r}=await He(i,e.heartbeatServiceProvider);return{token:r}}else{let{token:s}=await n.getToken(!0);return{token:s}}}function zt(e,t,n,s){let{app:i}=e,r=m(i),o={next:n,error:s,type:t};if(r.tokenObservers=[...r.tokenObservers,o],r.token&&F(r.token)){let a=r.token;Promise.resolve().then(()=>{n({token:a.token}),Pt(e)}).catch(()=>{})}r.cachedTokenPromise.then(()=>Pt(e))}function Kt(e,t){let n=m(e),s=n.tokenObservers.filter(i=>i.next!==t);s.length===0&&n.tokenRefresher&&n.tokenRefresher.isRunning()&&n.tokenRefresher.stop(),n.tokenObservers=s}function Pt(e){let{app:t}=e,n=m(t),s=n.tokenRefresher;s||(s=si(e),n.tokenRefresher=s),!s.isRunning()&&n.isTokenAutoRefreshEnabled&&s.start()}function si(e){let{app:t}=e;return new Ue(async()=>{let n=m(t),s;if(n.token?s=await $e(e,!0):s=await $e(e),s.error)throw s.error;if(s.internalError)throw s.internalError},()=>!0,()=>{let n=m(t);if(n.token){let s=n.token.issuedAtTimeMillis+(n.token.expireTimeMillis-n.token.issuedAtTimeMillis)*.5+3e5,i=n.token.expireTimeMillis-300*1e3;return s=Math.min(s,i),Math.max(0,s-Date.now())}else return 0},Nt.RETRIAL_MIN_WAIT,Nt.RETRIAL_MAX_WAIT)}function Yt(e,t){let n=m(e).tokenObservers;for(let s of n)try{s.type==="EXTERNAL"&&t.error!=null?s.error(t.error):s.next(t)}catch{}}function F(e){return e.expireTimeMillis-Date.now()>0}function Me(e){return{token:ti(ei),error:e}}var Fe=class{constructor(t,n){this.app=t,this.heartbeatServiceProvider=n}_delete(){let{tokenObservers:t}=m(this.app);for(let n of t)Kt(this.app,n.next);return Promise.resolve()}};function ii(e,t){return new Fe(e,t)}function ri(e){return{getToken:t=>$e(e,t),getLimitedUseToken:()=>ni(e),addTokenListener:t=>zt(e,"INTERNAL",t),removeTokenListener:t=>Kt(e.app,t)}}var oi="@firebase/app-check",ai="0.13.2";var ci="https://www.google.com/recaptcha/enterprise.js";function li(e,t){let n=new S,s=m(e);s.reCAPTCHAState={initialized:n};let i=ui(e),r=Lt(!0);return r?Mt(e,t,r,i,n):fi(()=>{let o=Lt(!0);if(!o)throw new Error("no recaptcha");Mt(e,t,o,i,n)}),n.promise}function Mt(e,t,n,s,i){n.ready(()=>{hi(e,t,n,s),i.resolve(n)})}function ui(e){let t=`fire_app_check_${e.name}`,n=document.createElement("div");return n.id=t,n.style.display="none",document.body.appendChild(n),t}async function di(e){Be(e);let n=await m(e).reCAPTCHAState.initialized.promise;return new Promise((s,i)=>{let r=m(e).reCAPTCHAState;n.ready(()=>{s(n.execute(r.widgetId,{action:"fire_app_check"}))})})}function hi(e,t,n,s){let i=n.render(s,{sitekey:t,size:"invisible",callback:()=>{m(e).reCAPTCHAState.succeeded=!0},"error-callback":()=>{m(e).reCAPTCHAState.succeeded=!1}}),r=m(e);r.reCAPTCHAState={...r.reCAPTCHAState,widgetId:i}}function fi(e){let t=document.createElement("script");kt(t,ci+"?render=explicit"),t.onload=e,document.head.appendChild(t)}var oe=class e{constructor(t){this._siteKey=t,this._throttleData=null}async getToken(t=!1){gi(this._throttleData);let n=await di(this._app).catch(i=>{throw _.create("recaptcha-error")});if(!m(this._app).reCAPTCHAState?.succeeded)throw _.create("recaptcha-error");let s;try{let i=js(this._app,n);t&&(i.body.limited_use=!0),s=await He(i,this._heartbeatServiceProvider)}catch(i){throw i.code?.includes("fetch-status-error")?(this._throttleData=pi(Number(i.customData?.httpStatus),this._throttleData),_.create("initial-throttle",{time:Ft(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):i}return this._throttleData=null,s}initialize(t){this._app=t,this._heartbeatServiceProvider=W(t,"heartbeat"),li(t,this._siteKey).catch(()=>{})}isEqual(t){return t instanceof e?this._siteKey===t._siteKey:!1}};function pi(e,t){if(e===404||e===403)return{backoffCount:1,allowRequestsAfter:Date.now()+Hs,httpStatus:e};{let n=t?t.backoffCount:0,s=ft(n,1e3,2);return{backoffCount:n+1,allowRequestsAfter:Date.now()+s,httpStatus:e}}}function gi(e){if(e&&Date.now()-e.allowRequestsAfter<=0)throw _.create("throttled",{time:Ft(e.allowRequestsAfter-Date.now()),httpStatus:e.httpStatus})}function qt(e=se(),t){e=Q(e);let n=W(e,"app-check");if(ae().initialized||Zs(e),Ge()&&Ve().then(i=>{console.log(`Firebase App Check debug token: ${i}`)}),n.isInitialized()){let i=n.getImmediate(),r=n.getOptions();if(r&&!!r.isTokenAutoRefreshEnabled==!!t.isTokenAutoRefreshEnabled&&r.provider?.isEqual(t.provider))return i;throw _.create("already-initialized",{appName:e.name})}let s=n.initialize({options:t});return mi(e,t.provider,t.isTokenAutoRefreshEnabled),m(e).isTokenAutoRefreshEnabled&&zt(s,"INTERNAL",()=>{}),s}function mi(e,t,n=!1){let s=$s(e,{...Ut});s.activated=!0,s.provider=t,s.cachedTokenPromise=Xs(e).then(i=>(i&&F(i)&&(s.token=i,Yt(e,{token:i.token})),i)),s.isTokenAutoRefreshEnabled=n&&e.automaticDataCollectionEnabled,!e.automaticDataCollectionEnabled&&n&&P.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),s.provider.initialize(e)}var Ei="app-check",xt="app-check-internal";function bi(){L(new y(Ei,e=>{let t=e.getProvider("app").getImmediate(),n=e.getProvider("heartbeat");return ii(t,n)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider(xt).initialize()})),L(new y(xt,e=>{let t=e.getProvider("app-check").getImmediate();return ri(t)},"PUBLIC").setInstantiationMode("EXPLICIT")),A(oi,ai)}bi();var Jt="@firebase/ai",Ye="3.1.0";var B="AI",_i="global",yi="firebasevertexai.googleapis.com",le="v1beta",Xt=Ye,wi="gl-js",Si="hybrid",Ti=180*1e3,Ai="gemini-3.5-flash-lite";var d=class e extends O{constructor(t,n,s){let i=B,r=`${i}/${t}`,o=`${i}: ${n} (${r})`;super(t,o),this.code=t,this.customErrorData=s,Error.captureStackTrace&&Error.captureStackTrace(this,e),Object.setPrototypeOf(this,e.prototype),this.toString=()=>o}};var Qt=["user","model","function","system"];var rn={HARM_SEVERITY_NEGLIGIBLE:"HARM_SEVERITY_NEGLIGIBLE",HARM_SEVERITY_LOW:"HARM_SEVERITY_LOW",HARM_SEVERITY_MEDIUM:"HARM_SEVERITY_MEDIUM",HARM_SEVERITY_HIGH:"HARM_SEVERITY_HIGH",HARM_SEVERITY_UNSUPPORTED:"HARM_SEVERITY_UNSUPPORTED"};var b={STOP:"STOP",MAX_TOKENS:"MAX_TOKENS",SAFETY:"SAFETY",RECITATION:"RECITATION",OTHER:"OTHER",BLOCKLIST:"BLOCKLIST",PROHIBITED_CONTENT:"PROHIBITED_CONTENT",SPII:"SPII",MALFORMED_FUNCTION_CALL:"MALFORMED_FUNCTION_CALL",IMAGE_SAFETY:"IMAGE_SAFETY",IMAGE_PROHIBITED_CONTENT:"IMAGE_PROHIBITED_CONTENT",IMAGE_OTHER:"IMAGE_OTHER",NO_IMAGE:"NO_IMAGE",IMAGE_RECITATION:"IMAGE_RECITATION",LANGUAGE:"LANGUAGE",UNEXPECTED_TOOL_CALL:"UNEXPECTED_TOOL_CALL",TOO_MANY_TOOL_CALLS:"TOO_MANY_TOOL_CALLS",MISSING_THOUGHT_SIGNATURE:"MISSING_THOUGHT_SIGNATURE",MALFORMED_RESPONSE:"MALFORMED_RESPONSE"};var tt={TEXT:"TEXT",IMAGE:"IMAGE",AUDIO:"AUDIO"},w={PREFER_ON_DEVICE:"prefer_on_device",ONLY_ON_DEVICE:"only_on_device",ONLY_IN_CLOUD:"only_in_cloud",PREFER_IN_CLOUD:"prefer_in_cloud"},M={ON_DEVICE:"on_device",IN_CLOUD:"in_cloud"};var u={ERROR:"error",REQUEST_ERROR:"request-error",RESPONSE_ERROR:"response-error",FETCH_ERROR:"fetch-error",SESSION_CLOSED:"session-closed",INVALID_CONTENT:"invalid-content",API_NOT_ENABLED:"api-not-enabled",ALREADY_INITIALIZED:"already-initialized",INVALID_SCHEMA:"invalid-schema",NO_API_KEY:"no-api-key",NO_APP_ID:"no-app-id",NO_MODEL:"no-model",NO_PROJECT_ID:"no-project-id",PARSE_FAILED:"parse-failed",UNSUPPORTED:"unsupported"};var v={AGENT_PLATFORM:"AGENT_PLATFORM",GOOGLE_AI:"GOOGLE_AI"};var ue=class{constructor(t){this.backendType=t}},Y=class extends ue{constructor(){super(v.GOOGLE_AI)}_getModelPath(t,n){return`/${le}/projects/${t}/${n}`}_getTemplatePath(t,n){return`/${le}/projects/${t}/templates/${n}`}},H=class extends ue{constructor(t){super(v.AGENT_PLATFORM),this.location=_i,t&&(this.location=t)}_getModelPath(t,n){return`/${le}/projects/${t}/locations/${this.location}/${n}`}_getTemplatePath(t,n){return`/${le}/projects/${t}/locations/${this.location}/templates/${n}`}};function Ci(e){if(e instanceof Y)return`${B}/googleai`;if(e instanceof H)return`${B}/agentplatform/${e.location}`;throw new d(u.ERROR,`Invalid backend: ${JSON.stringify(e.backendType)}`)}function Ri(e){let t=e.split("/");if(t[0]!==B)throw new d(u.ERROR,`Invalid instance identifier, unknown prefix '${t[0]}'`);switch(t[1]){case"agentplatform":let s=t[2];if(!s)throw new d(u.ERROR,`Invalid instance identifier, unknown location '${e}'`);return new H(s);case"googleai":return new Y;default:throw new d(u.ERROR,`Invalid instance identifier string: '${e}'`)}}var E=new N("@firebase/ai"),D;(function(e){e.UNAVAILABLE="unavailable",e.DOWNLOADABLE="downloadable",e.DOWNLOADING="downloading",e.AVAILABLE="available"})(D||(D={}));var on={type:"text",languages:["en"]},je=[on,{type:"image"}],We=[on],de=class e{constructor(t,n,s){this.languageModelProvider=t,this.mode=n,this.downloadPromise=null,this.onDeviceParams={createOptions:{expectedInputs:je,expectedOutputs:We}},s&&(this.onDeviceParams=s,this.onDeviceParams.createOptions?(this.onDeviceParams.createOptions.expectedInputs||(this.onDeviceParams.createOptions.expectedInputs=je),this.onDeviceParams.createOptions.expectedOutputs||(this.onDeviceParams.createOptions.expectedOutputs=We)):this.onDeviceParams.createOptions={expectedInputs:je,expectedOutputs:We})}async isAvailable(t){if(!this.mode)return E.debug("On-device inference unavailable because mode is undefined."),!1;if(this.mode===w.ONLY_IN_CLOUD)return E.debug('On-device inference unavailable because mode is "only_in_cloud".'),!1;let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);if(this.mode===w.ONLY_ON_DEVICE){if(n===D.UNAVAILABLE)throw new d(u.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(n===D.DOWNLOADABLE||n===D.DOWNLOADING){E.debug("Waiting for download of LanguageModel to complete.");try{await this.downloadPromise}catch(s){throw new d(u.ERROR,s.message)}return!0}return!0}return n!==D.AVAILABLE?(E.debug(`On-device inference unavailable because availability is "${n}".`),!1):e.isOnDeviceRequest(t)?!0:(E.debug("On-device inference unavailable because request is incompatible."),!1)}async generateContent(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=await n.prompt(s,this.onDeviceParams.promptOptions);return e.toResponse(i)}async generateContentStream(t){let n=await this.createSession(),s=await Promise.all(t.contents.map(e.toLanguageModelMessage)),i=n.promptStreaming(s,this.onDeviceParams.promptOptions);return e.toStreamResponse(i)}async countTokens(t){throw new d(u.REQUEST_ERROR,"Count Tokens is not yet available for on-device model.")}static isOnDeviceRequest(t){if(t.contents.length===0)return E.debug("Empty prompt rejected for on-device inference."),!1;for(let n of t.contents){if(n.parts.some(s=>"functionResponse"in s))return E.debug("Content with a function response part rejected for on-device inference."),!1;for(let s of n.parts)if("inlineData"in s&&s.inlineData&&e.SUPPORTED_MIME_TYPES.indexOf(s.inlineData.mimeType)===-1)return E.debug(`Unsupported mime type "${s.inlineData.mimeType}" rejected for on-device inference.`),!1}return!0}async downloadIfAvailable(t){let n=await this.languageModelProvider?.availability(this.onDeviceParams.createOptions);return(n===D.DOWNLOADABLE||n===D.DOWNLOADING)&&this.download(t),n}download(t){if(this.downloadPromise)return;let n={...this.onDeviceParams.createOptions};n&&!n.monitor&&t&&(n.monitor=s=>{s.addEventListener("downloadprogress",i=>{t(i.loaded)})}),this.downloadPromise=this.languageModelProvider?.create(n).finally(()=>{this.downloadPromise=null})}static async toLanguageModelMessage(t){let n=await Promise.all(t.parts.map(e.toLanguageModelMessageContent));return{role:e.toLanguageModelMessageRole(t.role),content:n}}static async toLanguageModelMessageContent(t){if("text"in t&&typeof t.text=="string")return{type:"text",value:t.text};if("inlineData"in t&&t.inlineData){let s=await(await fetch(`data:${t.inlineData.mimeType};base64,${t.inlineData.data}`)).blob();return{type:"image",value:await createImageBitmap(s)}}throw new d(u.REQUEST_ERROR,"Processing of this Part type is not currently supported.")}static toLanguageModelMessageRole(t){return t==="model"?"assistant":"user"}async createSession(){if(!this.languageModelProvider)throw new d(u.UNSUPPORTED,"Chrome AI requested for unsupported browser version.");let t=await this.languageModelProvider.create(this.onDeviceParams.createOptions);return this.oldSession&&this.oldSession.destroy(),this.oldSession=t,t}static toResponse(t){return{json:async()=>({candidates:[{content:{parts:[{text:t}]}}]})}}static toStreamResponse(t){let n=new TextEncoder;return{body:t.pipeThrough(new TransformStream({transform(s,i){let r=JSON.stringify({candidates:[{content:{role:"model",parts:[{text:s}]}}]});i.enqueue(n.encode(`data: ${r}

`))}}))}}};de.SUPPORTED_MIME_TYPES=["image/jpeg","image/png"];function Oi(e,t,n){let i=(t||G()).LanguageModel;if(i&&e)return new de(i,e,n)}var qe=class{constructor(t,n,s,i,r){this.app=t,this.backend=n,this.chromeAdapterFactory=r;let o=i?.getImmediate({optional:!0}),a=s?.getImmediate({optional:!0});this.auth=a||null,this.appCheck=o||null}_delete(){return Promise.resolve()}set options(t){this._options=t}get options(){return this._options}};function Ii(e,{instanceIdentifier:t}){if(!t)throw new d(u.ERROR,"AIService instance identifier is undefined.");let n=Ri(t),s=e.getProvider("app").getImmediate(),i=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new qe(s,n,i,r,Oi)}function Di(e){if(e.app?.options?.apiKey)if(e.app?.options?.projectId){if(!e.app?.options?.appId)throw new d(u.NO_APP_ID,'The "appId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid app ID.')}else throw new d(u.NO_PROJECT_ID,'The "projectId" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid project ID.');else throw new d(u.NO_API_KEY,'The "apiKey" field is empty in the local Firebase config. Firebase AI requires this field to contain a valid API key.');let t={apiKey:e.app.options.apiKey,project:e.app.options.projectId,appId:e.app.options.appId,automaticDataCollectionEnabled:e.app.automaticDataCollectionEnabled,backend:e.backend};if(Rt(e.app)&&e.app.settings.appCheckToken){let n=e.app.settings.appCheckToken;t.getAppCheckToken=()=>Promise.resolve({token:n})}else e.appCheck&&(e.options?.useLimitedUseAppCheckTokens?t.getAppCheckToken=()=>e.appCheck.getLimitedUseToken():t.getAppCheckToken=()=>e.appCheck.getToken());return e.auth&&(t.getAuthToken=()=>e.auth.getToken()),t}var Je=class e{constructor(t,n){this._apiSettings=Di(t),this.model=e.normalizeModelName(n,this._apiSettings.backend.backendType)}static normalizeModelName(t,n){return n===v.GOOGLE_AI?e.normalizeGoogleAIModelName(t):e.normalizeVertexAIModelName(t)}static normalizeGoogleAIModelName(t){return`models/${t}`}static normalizeVertexAIModelName(t){let n;return t.includes("/")?t.startsWith("models/")?n=`publishers/google/${t}`:n=t:n=`publishers/google/models/${t}`,n}};var vi="Timeout has expired.",ze="AbortError",Xe=class{constructor(t){this.params=t}toString(){let t=new URL(this.baseUrl);return t.pathname=this.pathname,t.search=this.queryParams.toString(),t.toString()}get pathname(){return this.params.templateId?`${this.params.apiSettings.backend._getTemplatePath(this.params.apiSettings.project,this.params.templateId)}:${this.params.task}`:`${this.params.apiSettings.backend._getModelPath(this.params.apiSettings.project,this.params.model)}:${this.params.task}`}get baseUrl(){return this.params.singleRequestOptions?.baseUrl??`https://${yi}`}get queryParams(){let t=new URLSearchParams;return this.params.stream&&t.set("alt","sse"),t}};function ki(e){let t=[];return t.push(`${wi}/${Xt}`),t.push(`fire/${Xt}`),(e.params.apiSettings.inferenceMode===w.PREFER_ON_DEVICE||e.params.apiSettings.inferenceMode===w.PREFER_IN_CLOUD)&&t.push(Si),t.join(" ")}async function Ni(e){let t=new Headers;if(t.append("Content-Type","application/json"),t.append("x-goog-api-client",ki(e)),t.append("x-goog-api-key",e.params.apiSettings.apiKey),e.params.apiSettings.automaticDataCollectionEnabled&&t.append("X-Firebase-Appid",e.params.apiSettings.appId),e.params.apiSettings.getAppCheckToken){let n=await e.params.apiSettings.getAppCheckToken();n&&(t.append("X-Firebase-AppCheck",n.token),n.error&&E.warn(`Unable to obtain a valid App Check token: ${n.error.message}`))}if(e.params.apiSettings.getAuthToken){let n=await e.params.apiSettings.getAuthToken();n&&t.append("Authorization",`Firebase ${n.accessToken}`)}return t}async function nt(e,t){let n=new Xe(e),s,i=e.singleRequestOptions?.signal,r=e.singleRequestOptions?.timeout!=null&&e.singleRequestOptions.timeout>=0?e.singleRequestOptions.timeout:Ti,o=new AbortController,a=setTimeout(()=>{o.abort(new DOMException(vi,ze)),E.debug(`Aborting request to ${n} due to timeout (${r}ms)`)},r),c=AbortSignal.any(i?[i,o.signal]:[o.signal]);if(i&&i.aborted)throw clearTimeout(a),new DOMException(i.reason??"Aborted externally before fetch",ze);try{let l={method:"POST",headers:await Ni(n),signal:c,body:t};if(s=await fetch(n.toString(),l),!s.ok){let h="",f;try{let g=await s.json();h=g.error.message,g.error.details&&(h+=` ${JSON.stringify(g.error.details)}`,f=g.error.details)}catch{}throw s.status===403&&f&&f.some(g=>g.reason==="SERVICE_DISABLED")&&f.some(g=>g.links?.[0]?.description.includes("Google developers console API activation"))?new d(u.API_NOT_ENABLED,`The Firebase AI SDK requires the Firebase AI API ('firebasevertexai.googleapis.com') to be enabled in your Firebase project. Enable this API by visiting the Firebase Console at https://console.firebase.google.com/project/${n.params.apiSettings.project}/ailogic/ and clicking "Get started". If you enabled this API recently, wait a few minutes for the action to propagate to our systems and then retry.`,{status:s.status,statusText:s.statusText,errorDetails:f}):new d(u.FETCH_ERROR,`Error fetching from ${n}: [${s.status} ${s.statusText}] ${h}`,{status:s.status,statusText:s.statusText,errorDetails:f})}}catch(l){let h=l;throw l.code!==u.FETCH_ERROR&&l.code!==u.API_NOT_ENABLED&&l instanceof Error&&l.name!==ze&&(h=new d(u.ERROR,`Error fetching from ${n.toString()}: ${l.message}`),h.stack=l.stack),h}finally{clearTimeout(a)}return s}function ce(e){if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&E.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),cn(e.candidates[0]))throw new d(u.RESPONSE_ERROR,`Response error: ${$(e)}. Response body stored in error.response`,{response:e});return!0}else return!1}function R(e){return"type"in e&&e.type?e:e.text!==void 0?{...e,type:"text"}:e.inlineData!==void 0?{...e,type:"inlineData"}:e.functionCall!==void 0?{...e,type:"functionCall"}:e.functionResponse!==void 0?{...e,type:"functionResponse"}:e.fileData!==void 0?{...e,type:"fileData"}:e.executableCode!==void 0?{...e,type:"executableCode"}:e.codeExecutionResult!==void 0?{...e,type:"codeExecutionResult"}:e}function he(e,t=M.IN_CLOUD){if(e.candidates?.[0]&&!e.candidates[0].hasOwnProperty("index")&&(e.candidates[0].index=0),e.candidates)for(let s of e.candidates)s.content?.parts&&(s.content.parts=s.content.parts.map(R));let n=Li(e);return n.inferenceSource=t,n}function Li(e){return e.text=()=>{if(ce(e))return Zt(e,t=>!("thought"in t&&t.thought));if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Text not available. ${$(e)}`,{response:e});return""},e.thoughtSummary=()=>{if(ce(e)){let t=Zt(e,n=>!!("thought"in n&&n.thought));return t===""?void 0:t}else if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Thought summary not available. ${$(e)}`,{response:e})},e.inlineDataParts=()=>{if(ce(e))return Pi(e);if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Data not available. ${$(e)}`,{response:e})},e.functionCalls=()=>{if(ce(e))return an(e);if(e.promptFeedback)throw new d(u.RESPONSE_ERROR,`Function call not available. ${$(e)}`,{response:e})},e}function Zt(e,t){let n=[];if(e.candidates?.[0].content?.parts)for(let s of e.candidates?.[0].content?.parts){let i=R(s);i.type==="text"&&t(i)&&n.push(i.text)}return n.length>0?n.join(""):""}function an(e){if(!e)return;let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=R(n);s.type==="functionCall"&&t.push(s.functionCall)}if(t.length>0)return t}function Pi(e){let t=[];if(e.candidates?.[0].content?.parts)for(let n of e.candidates?.[0].content?.parts){let s=R(n);s.type==="inlineData"&&t.push(s)}if(t.length>0)return t}var Mi=[b.RECITATION,b.SAFETY,b.BLOCKLIST,b.PROHIBITED_CONTENT,b.SPII,b.MALFORMED_FUNCTION_CALL,b.IMAGE_SAFETY,b.IMAGE_PROHIBITED_CONTENT,b.IMAGE_OTHER,b.NO_IMAGE,b.IMAGE_RECITATION,b.LANGUAGE,b.UNEXPECTED_TOOL_CALL,b.TOO_MANY_TOOL_CALLS,b.MISSING_THOUGHT_SIGNATURE,b.MALFORMED_RESPONSE];function cn(e){return!!e.finishReason&&Mi.some(t=>t===e.finishReason)}function $(e){let t="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)t+="Response was blocked",e.promptFeedback?.blockReason&&(t+=` due to ${e.promptFeedback.blockReason}`),e.promptFeedback?.blockReasonMessage&&(t+=`: ${e.promptFeedback.blockReasonMessage}`);else if(e.candidates?.[0]){let n=e.candidates[0];cn(n)&&(t+=`Candidate was blocked due to ${n.finishReason}`,n.finishMessage&&(t+=`: ${n.finishMessage}`))}return t}function st(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{type:"text",text:e}]};if(e.type==="text"||"text"in e&&typeof e.text=="string")return{role:"system",parts:[k(R(e))]};if(e.parts){let t=e.parts.map(n=>k(R(n)));return e.role?{...e,parts:t}:{role:"system",parts:t}}}}function K(e){let t=[];if(typeof e=="string")t=[{type:"text",text:e}];else for(let n of e)typeof n=="string"?t.push({type:"text",text:n}):t.push(k(R(n)));return xi(t)}function xi(e){let t={role:"user",parts:[]},n=!1,s=!1;for(let i of e)i.type==="functionResponse"||"functionResponse"in i?s=!0:n=!0,t.parts.push(i);if(n&&s)throw new d(u.INVALID_CONTENT,"Within a single message, FunctionResponse cannot be mixed with other type of Part in the request for sending chat message.");if(!n&&!s)throw new d(u.INVALID_CONTENT,"No Content is provided for sending chat message.");return t}function Ke(e){let t;if(e.contents){let n=e;t={...n,contents:n.contents.map(s=>({...s,parts:s.parts?s.parts.map(R):[]}))}}else t={contents:[K(e)]};return e.systemInstruction&&(t.systemInstruction=st(e.systemInstruction)),t}function Ui(e){return e.parts&&Array.isArray(e.parts)?{...e,parts:e.parts.map(it)}:e}function it(e){let t;if("type"in e){let{type:n,...s}=e;t=s}else t=e;return t.functionResponse&&(t={...t,functionResponse:Ui(t.functionResponse)}),t}function rt(e){return e.parts?{...e,parts:e.parts.map(it)}:e}function ln(e){return e==null||typeof e=="string"?e:"parts"in e&&Array.isArray(e.parts)?rt(e):it(e)}function un(e){let t={...e};return t.contents&&(t.contents=t.contents.map(rt)),t.systemInstruction&&(t.systemInstruction=ln(t.systemInstruction)),t}function $i(e){let t={...e};return t.contents&&(t.contents=t.contents.map(rt)),t.systemInstruction&&(t.systemInstruction=ln(t.systemInstruction)),t}function dn(e){if(e.safetySettings?.forEach(t=>{if(t.method)throw new d(u.UNSUPPORTED,"SafetySetting.method is not supported in the the Gemini Developer API. Please remove this property.")}),e.generationConfig?.topK){let t=Math.round(e.generationConfig.topK);t!==e.generationConfig.topK&&(E.warn("topK in GenerationConfig has been rounded to the nearest integer to match the format for requests to the Gemini Developer API."),e.generationConfig.topK=t)}return e}function ot(e){return{candidates:e.candidates?Bi(e.candidates):void 0,promptFeedback:e.promptFeedback?Hi(e.promptFeedback):void 0,usageMetadata:e.usageMetadata}}function Fi(e,t){return{generateContentRequest:{model:t,...e}}}function Bi(e){let t=[],n;return t&&e.forEach(s=>{let i;if(s.citationMetadata&&(i={citations:s.citationMetadata.citationSources}),s.safetyRatings&&(n=s.safetyRatings.map(o=>({...o,severity:o.severity??rn.HARM_SEVERITY_UNSUPPORTED,probabilityScore:o.probabilityScore??0,severityScore:o.severityScore??0}))),s.content?.parts?.some(o=>"videoMetadata"in o&&o.videoMetadata))throw new d(u.UNSUPPORTED,"Part.videoMetadata is not supported in the Gemini Developer API. Please remove this property.");let r={index:s.index,content:s.content,finishReason:s.finishReason,finishMessage:s.finishMessage,safetyRatings:n,citationMetadata:i,groundingMetadata:s.groundingMetadata,urlContextMetadata:s.urlContextMetadata};t.push(r)}),t}function Hi(e){let t=[];return(e.safetyRatings??[]).forEach(s=>{t.push({category:s.category,probability:s.probability,severity:s.severity??rn.HARM_SEVERITY_UNSUPPORTED,probabilityScore:s.probabilityScore??0,severityScore:s.severityScore??0,blocked:s.blocked})}),{blockReason:e.blockReason,safetyRatings:t,blockReasonMessage:e.blockReasonMessage}}var en=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;async function Gi(e,t,n){let s=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),i=zi(s),[r,o]=i.tee(),{response:a,firstValue:c}=await Vi(o,t,n);return{stream:Wi(r,t,n),response:a,firstValue:c}}async function Vi(e,t,n){let[s,i]=e.tee(),r=s.getReader(),{value:o}=await r.read();return{firstValue:o,response:ji(i,t,n)}}async function ji(e,t,n){let s=[],i=e.getReader();for(;;){let{done:r,value:o}=await i.read();if(r){let a=Ki(s);return t.backend.backendType===v.GOOGLE_AI&&(a=ot(a)),he(a,n)}s.push(o)}}async function*Wi(e,t,n){let s=e.getReader();for(;;){let{value:i,done:r}=await s.read();if(r)break;let o;t.backend.backendType===v.GOOGLE_AI?o=he(ot(i),n):o=he(i,n);let a=o.candidates?.[0];!a?.content?.parts&&!a?.finishReason&&!a?.citationMetadata&&!a?.urlContextMetadata||(yield o)}}function zi(e){let t=e.getReader();return new ReadableStream({start(s){let i="";return r();function r(){return t.read().then(({value:o,done:a})=>{if(a){if(i.trim()){s.error(new d(u.PARSE_FAILED,"Failed to parse stream"));return}s.close();return}i+=o;let c=i.match(en),l;for(;c;){try{l=JSON.parse(c[1])}catch{s.error(new d(u.PARSE_FAILED,`Error parsing JSON response: "${c[1]}`));return}s.enqueue(l),i=i.substring(c[0].length),c=i.match(en)}return r()})}}})}function Ki(e){let n={promptFeedback:e[e.length-1]?.promptFeedback};for(let s of e)if(s.candidates)for(let i of s.candidates){let r=i.index||0;n.candidates||(n.candidates=[]),n.candidates[r]||(n.candidates[r]={index:i.index}),n.candidates[r].citationMetadata=i.citationMetadata,n.candidates[r].finishReason=i.finishReason,n.candidates[r].finishMessage=i.finishMessage,n.candidates[r].safetyRatings=i.safetyRatings,n.candidates[r].groundingMetadata=i.groundingMetadata;let o=i.urlContextMetadata;if(typeof o=="object"&&o!==null&&Object.keys(o).length>0&&(n.candidates[r].urlContextMetadata=o),i.content){if(!i.content.parts)continue;n.candidates[r].content||(n.candidates[r].content={role:i.content.role||"user",parts:[]});for(let a of i.content.parts){if("text"in a&&a.text==="")continue;if(Object.keys(a).length===0)throw new d(u.INVALID_CONTENT,"Part should have at least one property, but there are none. This is likely caused by a malformed response from the backend.");let c=R({...a});Object.keys(c).length>0&&n.candidates[r].content.parts.push(c)}}}return n}var Yi=[u.FETCH_ERROR,u.ERROR,u.API_NOT_ENABLED];async function hn(e,t,n,s){if(!t)return{response:await s(),inferenceSource:M.IN_CLOUD};switch(t.mode){case w.ONLY_ON_DEVICE:if(await t.isAvailable(e))return{response:await n(),inferenceSource:M.ON_DEVICE};throw new d(u.UNSUPPORTED,"Inference mode is ONLY_ON_DEVICE, but an on-device model is not available.");case w.ONLY_IN_CLOUD:return{response:await s(),inferenceSource:M.IN_CLOUD};case w.PREFER_IN_CLOUD:try{return{response:await s(),inferenceSource:M.IN_CLOUD}}catch(i){if(i instanceof d&&Yi.includes(i.code)&&await t.isAvailable(e))return{response:await n(),inferenceSource:M.ON_DEVICE};throw i}case w.PREFER_ON_DEVICE:return await t.isAvailable(e)?{response:await n(),inferenceSource:M.ON_DEVICE}:{response:await s(),inferenceSource:M.IN_CLOUD};default:throw new d(u.ERROR,`Unexpected infererence mode: ${t.mode}`)}}async function qi(e,t,n,s){return n=un(n),e.backend.backendType===v.GOOGLE_AI&&(n=dn(n)),nt({task:"streamGenerateContent",model:t,apiSettings:e,stream:!0,singleRequestOptions:s},JSON.stringify(n))}async function fn(e,t,n,s,i){let r=await hn(n,s,()=>s.generateContentStream(n),()=>qi(e,t,n,i));return Gi(r.response,e,r.inferenceSource)}async function Ji(e,t,n,s){return n=un(n),e.backend.backendType===v.GOOGLE_AI&&(n=dn(n)),nt({model:t,task:"generateContent",apiSettings:e,stream:!1,singleRequestOptions:s},JSON.stringify(n))}async function pn(e,t,n,s,i){let r=await hn(n,s,()=>s.generateContent(n),()=>Ji(e,t,n,i)),o=await Xi(r.response,e);return{response:he(o,r.inferenceSource)}}async function Xi(e,t){let n=await e.json();return t.backend.backendType===v.GOOGLE_AI?ot(n):n}var tn="SILENT_ERROR",nn=10,Qe=class{constructor(t,n,s){this.params=n,this.requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiSettings=t}async getHistory(){return await this._sendPromise,k(this._history).map(t=>({...t,parts:t.parts?t.parts.map(R):[]}))}async _sendMessage(t,n){let s={};await this._sendPromise;let i=[];return this._sendPromise=this._sendPromise.then(async()=>{let r,o=0,a=this.requestOptions?.maxSequentialFunctionCalls??nn;do{let c;if(r){o++;let f=await this._callFunctionsAsNeeded(r);c=K(f)}else c=K(t);let l=this._formatRequest(c,[...i]);i.push(c);let h=await this._callGenerateContent(l,n);if(h)if(s=h,r=this._getCallableFunctionCalls(h.response),h.response.candidates&&h.response.candidates.length>0){let f={parts:h.response.candidates?.[0].content.parts||[],role:h.response.candidates?.[0].content.role||"model"};i.push(k(f))}else{let f=$(h.response);f&&E.warn(`sendMessage() was unsuccessful. ${f}. Inspect response object for details.`)}else r=void 0}while(r&&o<a);r&&o>=a&&E.warn(`Automatic function calling exceeded the limit of ${a} function calls. Returning last model response.`)}),await this._sendPromise,this._history=this._history.concat(i),s}async _sendMessageStream(t,n){await this._sendPromise;let s=[],r=(async()=>{let o,a=0,c=this.requestOptions?.maxSequentialFunctionCalls??nn,l;do{let h;if(o){a++;let g=await this._callFunctionsAsNeeded(o);h=K(g)}else h=K(t);let f=this._formatRequest(h,[...s]);if(s.push(h),l=await this._callGenerateContentStream(f,n),o=this._getCallableFunctionCalls(l.firstValue),o&&l.firstValue&&l.firstValue.candidates&&l.firstValue.candidates.length>0){let g={...l.firstValue.candidates[0].content};g.role||(g.role="model"),s.push(g)}}while(o&&a<c);return o&&a>=c&&E.warn(`Automatic function calling exceeded the limit of ${c} function calls. Returning last model response.`),{stream:l.stream,response:l.response}})();return this._sendPromise=this._sendPromise.then(async()=>r).catch(o=>{throw new Error(tn)}).then(o=>o.response).then(o=>{if(o.candidates&&o.candidates.length>0){this._history=this._history.concat(s);let a={...o.candidates[0].content};a.role||(a.role="model"),this._history.push(k(a))}else{let a=$(o);a&&E.warn(`sendMessageStream() was unsuccessful. ${a}. Inspect response object for details.`)}}).catch(o=>{o.message!==tn&&o.name!=="AbortError"&&E.error(o)}),r}_getCallableFunctionCalls(t){let n=this.params?.tools?.find(i=>i.functionDeclarations);if(!n?.functionDeclarations)return;let s=an(t);if(s){for(let i of s)if(!n.functionDeclarations?.some(o=>o.name===i.name&&typeof o.functionReference=="function"))return;return s}}async _callFunctionsAsNeeded(t){let n=[],s=[],i=this.params?.tools?.find(r=>r.functionDeclarations);if(i&&i.functionDeclarations){for(let o of t){let a=i.functionDeclarations.find(c=>c.name===o.name);if(a?.functionReference){let c=Promise.resolve(a.functionReference(o.args)).catch(l=>{let h=new d(u.ERROR,`Error in user-defined function "${a.name}": ${l.message}`);throw h.stack=l.stack,h});n.push({name:o.name,id:o.id,results:c}),s.push(c)}}await Promise.all(s);let r=[];for(let{name:o,id:a,results:c}of n){let l={name:o,response:await c};a&&(l.id=a),r.push({type:"functionResponse",functionResponse:l})}return r}else throw new d(u.REQUEST_ERROR,'No function declarations were provided in "tools".')}};var Qi=["text","inlineData","functionCall","functionResponse","thought","thoughtSignature"],Zi={user:["text","inlineData","functionResponse"],function:["functionResponse"],model:["text","functionCall","thought","thoughtSignature"],system:["text"]},sn={user:["model"],function:["model"],model:["user","function"],system:[]};function er(e){let t=null;for(let n of e){let{role:s,parts:i}=n;if(!t&&s!=="user")throw new d(u.INVALID_CONTENT,`First Content should be with role 'user', got ${s}`);if(!Qt.includes(s))throw new d(u.INVALID_CONTENT,`Each item should include role field. Got ${s} but valid roles are: ${JSON.stringify(Qt)}`);if(!Array.isArray(i))throw new d(u.INVALID_CONTENT,"Content should have 'parts' property with an array of Parts");if(i.length===0)throw new d(u.INVALID_CONTENT,"Each Content should have at least one part");let r={text:0,inlineData:0,functionCall:0,functionResponse:0,thought:0,thoughtSignature:0,fileData:0,executableCode:0,codeExecutionResult:0};for(let a of i){if(a.type)r[a.type]+=1;else for(let c of["text","inlineData","functionCall","functionResponse","fileData","executableCode","codeExecutionResult"])c in a&&(r[c]+=1);"thought"in a&&a.thought&&(r.thought+=1),"thoughtSignature"in a&&a.thoughtSignature&&(r.thoughtSignature+=1)}let o=Zi[s];for(let a of Qi)if(!o.includes(a)&&r[a]>0)throw new d(u.INVALID_CONTENT,`Content with role '${s}' can't contain '${a}' part`);if(t&&!sn[s].includes(t.role))throw new d(u.INVALID_CONTENT,`Content with role '${s}' can't follow '${t.role}'. Valid previous roles: ${JSON.stringify(sn)}`);t=n}}var Ze=class extends Qe{constructor(t,n,s,i,r){super(t,i,r),this.model=n,this.chromeAdapter=s,this.params=i,this.requestOptions=r,i?.history&&(er(i.history),this._history=k(i.history)),this.params?.systemInstruction!=null&&(this.params={...this.params,systemInstruction:st(this.params.systemInstruction)})}_formatRequest(t,n){return{safetySettings:this.params?.safetySettings,generationConfig:this.params?.generationConfig,tools:this.params?.tools,toolConfig:this.params?.toolConfig,systemInstruction:this.params?.systemInstruction,contents:[...this._history,...n,t]}}_callGenerateContent(t,n){return pn(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}_callGenerateContentStream(t,n){return fn(this._apiSettings,this.model,t,this.chromeAdapter,{...this.requestOptions,...n})}async sendMessage(t,n){return this._sendMessage(t,n)}async sendMessageStream(t,n){return this._sendMessageStream(t,n)}};async function tr(e,t,n,s){n=$i(n);let i="";if(e.backend.backendType===v.GOOGLE_AI){let o=Fi(n,t);i=JSON.stringify(o)}else i=JSON.stringify(n);return(await nt({model:t,task:"countTokens",apiSettings:e,stream:!1,singleRequestOptions:s},i)).json()}async function nr(e,t,n,s,i){if(s?.mode===w.ONLY_ON_DEVICE)throw new d(u.UNSUPPORTED,"countTokens() is not supported for on-device models.");return tr(e,t,n,i)}var et=class extends Je{constructor(t,n,s,i){super(t,n.model),this.chromeAdapter=i,this.generationConfig=n.generationConfig||{},sr(this.generationConfig),this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=st(n.systemInstruction),this.requestOptions=s||{}}async initializeDeviceModel(t){if(!this.chromeAdapter||this.chromeAdapter.mode===w.ONLY_IN_CLOUD)return;if(await this.chromeAdapter.downloadIfAvailable(t)===D.UNAVAILABLE){let s=new d(u.API_NOT_ENABLED,"Local LanguageModel API not available in this environment.");if(this.chromeAdapter.mode===w.ONLY_ON_DEVICE)throw s;E.debug(s.message)}await this.chromeAdapter.downloadPromise}async generateContent(t,n){let s=Ke(t);return pn(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n})}async generateContentStream(t,n){let s=Ke(t),{stream:i,response:r}=await fn(this._apiSettings,this.model,{generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,...s},this.chromeAdapter,{...this.requestOptions,...n});return{stream:i,response:r}}startChat(t){return new Ze(this._apiSettings,this.model,this.chromeAdapter,{tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,generationConfig:this.generationConfig,safetySettings:this.safetySettings,...t},this.requestOptions)}async countTokens(t,n){let s=Ke(t);return nr(this._apiSettings,this.model,s,this.chromeAdapter,{...this.requestOptions,...n})}};function sr(e){if(e.thinkingConfig?.thinkingBudget!=null&&e.thinkingConfig?.thinkingLevel)throw new d(u.UNSUPPORTED,"Cannot set both thinkingBudget and thinkingLevel in a config.");if(e.responseSchema!=null&&e.responseJsonSchema!=null)throw new d(u.UNSUPPORTED,"Cannot set both responseSchema and responseJsonSchema in a config.");if((e.responseSchema!=null||e.responseJsonSchema!=null)&&e.responseMimeType!=="application/json"&&e.responseMimeType!=="text/x.enum")throw new d(u.UNSUPPORTED,'responseMimeType must be set to "application/json" or "text/x.enum" if responseSchema or responseJsonSchema are set.')}var ir="audio-processor",zr=`
  class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super();
      this.targetSampleRate = options.processorOptions.targetSampleRate;
      // 'sampleRate' is a global variable available inside the AudioWorkletGlobalScope,
      // representing the native sample rate of the AudioContext.
      this.inputSampleRate = sampleRate;
    }

    /**
     * This method is called by the browser's audio engine for each block of audio data.
     * Input is a single input, with a single channel (input[0][0]).
     */
    process(inputs) {
      const input = inputs[0];
      if (input && input.length > 0 && input[0].length > 0) {
        const pcmData = input[0]; // Float32Array of raw audio samples.
        
        // Simple linear interpolation for resampling.
        const resampled = new Float32Array(Math.round(pcmData.length * this.targetSampleRate / this.inputSampleRate));
        const ratio = pcmData.length / resampled.length;
        for (let i = 0; i < resampled.length; i++) {
          resampled[i] = pcmData[Math.floor(i * ratio)];
        }

        // Convert Float32 (-1, 1) samples to Int16 (-32768, 32767)
        const resampledInt16 = new Int16Array(resampled.length);
        for (let i = 0; i < resampled.length; i++) {
          const sample = Math.max(-1, Math.min(1, resampled[i]));
          if (sample < 0) {
            resampledInt16[i] = sample * 32768;
          } else {
            resampledInt16[i] = sample * 32767;
          }
        }
        
        this.port.postMessage(resampledInt16);
      }
      // Return true to keep the processor alive and processing the next audio block.
      return true;
    }
  }

  // Register the processor with a name that can be used to instantiate it from the main thread.
  registerProcessor('${ir}', AudioProcessor);
`;function gn(e=se(),t){e=Q(e);let n=W(e,B),s=t?.backend??new Y,i=Ci(s),r=n.getImmediate({identifier:i}),o=r.options;if(o){let a=t?.useLimitedUseAppCheckTokens,c=!!o.useLimitedUseAppCheckTokens;if(a!=null&&!!a!==c)throw new d(u.ALREADY_INITIALIZED,`getAI() has already been called for app "${e.name}" and this backend with useLimitedUseAppCheckTokens: ${c}. This option cannot be changed after the AI instance has been initialized. Pass the desired options to the first getAI() call for this app and backend, or omit useLimitedUseAppCheckTokens to reuse the existing instance.`);return r}return r.options={useLimitedUseAppCheckTokens:t?.useLimitedUseAppCheckTokens??!1},r}var rr=["mode","onDeviceParams","inCloudParams"];function mn(e,t,n){let s=t,i;if(s.mode){for(let a of Object.keys(t))rr.includes(a)||E.warn(`When a hybrid inference mode is specified (mode is currently set to ${s.mode}), "${a}" cannot be configured at the top level. Configuration for in-cloud and on-device must be done separately in inCloudParams and onDeviceParams. Configuration values set outside of inCloudParams and onDeviceParams will be ignored.`);i=s.inCloudParams||{model:Ai}}else i=t;if(!i.model)throw new d(u.NO_MODEL,"Must provide a model name. Example: getGenerativeModel({ model: 'my-model-name' })");let r=e.chromeAdapterFactory?.(s.mode,typeof window>"u"?void 0:window,s.onDeviceParams),o=new et(e,i,n,r);return o._apiSettings.inferenceMode=s.mode,o}function or(){L(new y(B,Ii,"PUBLIC").setMultipleInstances(!0)),A(Jt,Ye),A(Jt,Ye,"esm2020")}or();import{firebaseConfig as pe,RECAPTCHA_SITE_KEY as En,MODEL as ar,LOCATION as cr}from"./firebase-config.js";var lr=()=>!!(pe&&pe.apiKey&&pe.projectId&&En),fe=null;function ur(){if(fe)return fe;if(!lr())throw Object.assign(new Error("Try Me On is not set up yet."),{code:"not-ready"});let e=Le(pe);qt(e,{provider:new oe(En),isTokenAutoRefreshEnabled:!0});let t=gn(e,{backend:new H(cr||"global")});return fe=mn(t,{model:ar||"gemini-3.1-flash-image",generationConfig:{responseModalities:[tt.TEXT,tt.IMAGE]}}),fe}async function eo(e,t=1024){let n=typeof e=="string"?await fetch(e).then(o=>{if(!o.ok)throw new Error("Could not load the product photo.");return o.blob()}):e,s=await createImageBitmap(n),i=Math.min(1,t/Math.max(s.width,s.height)),r=document.createElement("canvas");return r.width=Math.round(s.width*i),r.height=Math.round(s.height*i),r.getContext("2d").drawImage(s,0,0,r.width,r.height),r.toDataURL("image/jpeg",.85).split(",")[1]}async function to({personB64:e,garmentB64:t,productType:n}){let s=ur(),i=`Show the person in the first photo wearing the ${n} from the second photo. Keep the person's face, body shape, skin tone, pose and background exactly the same. Make the fit, folds and lighting look natural. Return one photo.`,r;try{r=await s.generateContent([{inlineData:{mimeType:"image/jpeg",data:e}},{inlineData:{mimeType:"image/jpeg",data:t}},{text:i}])}catch(c){let l=String(c&&(c.message||c));throw c?.customErrorData?.status===429||/429|RESOURCE_EXHAUSTED|quota|rate/i.test(l)?Object.assign(new Error("busy"),{code:"busy"}):/app[- ]?check|appcheck|recaptcha|401|403|PERMISSION_DENIED|UNAUTHENTICATED/i.test(l)?Object.assign(new Error("appcheck"),{code:"appcheck"}):/SAFETY|blocked|PROHIBITED/i.test(l)?Object.assign(new Error("blocked"),{code:"blocked"}):c}let a=(r?.response?.candidates?.[0]?.content?.parts||[]).find(c=>c.inlineData&&/^image\//.test(c.inlineData.mimeType));if(!a)throw Object.assign(new Error("no-image"),{code:r?.response?.promptFeedback?.blockReason?"blocked":"no-image"});return`data:${a.inlineData.mimeType};base64,${a.inlineData.data}`}export{lr as ready,eo as toJpegBase64,to as tryOn};
/*! Bundled license information:

@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/util/dist/index.esm.js:
@firebase/logger/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2026 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/app/dist/esm/index.esm.js:
@firebase/app-check/dist/esm/index.esm.js:
@firebase/app-check/dist/esm/index.esm.js:
@firebase/app-check/dist/esm/index.esm.js:
@firebase/app-check/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app-check/dist/esm/index.esm.js:
@firebase/app-check/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2026 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/ai/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2026 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
