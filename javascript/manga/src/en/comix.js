const mangayomiSources = [
  {
    "id": 5738565392,
    "name": "Comix",
    "lang": "en",
    "baseUrl": "https://comix.to",
    "apiUrl": "https://comix.to/api/v1/",
    "iconUrl": "https://www.google.com/s2/favicons?sz=128&domain=https://comix.to",
    "typeSource": "single",
    "itemType": 0,
    "isNsfw": false,
    "version": "0.2.4",
    "pkgPath": "manga/src/en/comix.js"
  }
];

// ---------------------------------------------------------------------------
// Constants and fallback data
// ---------------------------------------------------------------------------

const COMIX_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// Key assembled from apicore-tp5661-B_NTYwfs.js (build 35595e3de3c99889c1aa70,
// token prefix si7).  Used only when live extraction fails.
const COMIX_FALLBACK_KEY_HEX =
    "8e9bf39b5831e3f9e924d459d4f65699096cbc056ddc96abd83f99e59b5aa92a" +
    "137e52ee53c4c438c0bd2fe2a506279da9414abf82f99a9fd391c90c90879526" +
    "792f9d7c9905e01e01a814f8280fe5d1d1b97f431d37777850d1050b494053e8" +
    "af575a8bcd69095fe6ca903e328c3cf247e9f2c89048b4adee8df4206c907a2f" +
    "3447631adb863c0afb4e4ed66c5fb778d43ac0ce9c731653b8877feb068543b8" +
    "885fadc142ffc335008a11ba562f4b222ee32c640560c89c7df273eb60d3064a" +
    "2b9d14cbe84da8aa9f0eaf6bdd1e82e06611383515a7468858bf73ac3e94e9ac" +
    "4e1a5363ef145c8a6a6bb00d905eaffa2bf26da0de28ab51a175567da82b4699" +
    "654185cf4cad688b79ee56dbea04050f9d66ba1361f83a50fb190885e3868728" +
    "1cc5bbee444c74ea0766ab9457120f12cf31ee7f593dfc0e29ea9f591947d878" +
    "f8f1c37fdf0616982cb1e26e5b5c5ea8fdc2ae12bf96ac1b76e40738d9586e1c" +
    "281e757f97a385ed2c84b27b7db9cd5175cb268603b26b59b563cddccdd6bb55" +
    "c064c758841e49564644890696a4ff86b6aa40e9e8867b24c7a957ca0fba2855" +
    "c04e17657285a028c4f11ef5fedd331716bc422b71c61484da7d054d80597cec" +
    "7b90526fb977986b0ae514e11e520e440d38135d24f2a6308f4fc68a02c9f190" +
    "e16802c56e329c9ba8425d3c9d70dca2ad10ad1698f83ed11749c60dbda0cc2a" +
    "663515c70c572eb2d1553300172abcb93cea040466054630d971f2aea5a49a7d" +
    "925300c9bf2cfd6c8a678193ae9607acc216486bd40beca4ad1c511e0b1d1e8a" +
    "fb5eea7ee1d94c640cf1a0a6d0dfb16371f6fb5f865a19d813087baa736e9416" +
    "d706289dec51fa826ec1074ae2d884cb7febad09423d94a240c4f75bbf47aa81" +
    "678b5a084ae2adefd8aa104253dadcadb7445116cd7a51c48405f2b551efd93c" +
    "06ed2097a0874047d0eefa3d7a1786786ff11e71862b25e5320f60a658fd386b" +
    "0dc30a84096e92e7b4d660ed01bb7cd7166305a248d135263bf2b276120f4abc" +
    "512c7bad1712cba6e298dceb860427f64aeaff4ee2edfb73418d915dcf036885" +
    "b29ebb346f7f41a9c90a5dc1ff449232485980c16f698c4fe559aeedff7a20da" +
    "a4d0345f7f9c2d9c5c5a8f2cde11145e2b5e5de6ca0d23b7a864437007f302a2" +
    "20f402d7ae865017f4dc51e8ca5db06f10ef888214d35821188f735c26d07d91" +
    "f2ddcb571f27d52cb7bd345d1328e60737ff59fbd85d5536d261390a9bd53dad" +
    "91d144cdf6b496c101537b31900a2a230605204514763e0284ac991594ed2f38" +
    "3b8ec9befbc5459e61c91b77e4c38d14107749f19a12270efe9ad2bce178160b" +
    "1293736eb6101aaa58e86b9c7dcdd5e6c066e1a9af438882018a4d43da81a31b" +
    "5d48dbd896d77f00dc77ee86ae7219af620d3e082a4394954e91443b870366b5" +
    "b8e61150dff759b143b66e1613d314bf5b5d1752fae503e5d00214bed1058871" +
    "b9d89d32e18bb0f718a6d40b04daabc759435dd5cada6217177322f458c0efe9";

let COMIX_SESSION = null;

// ---------------------------------------------------------------------------
// Byte / encoding helpers (no TextEncoder, atob, btoa or crypto.subtle:
// Mangayomi's JS runtime does not guarantee them)
// ---------------------------------------------------------------------------

function comixUtf8Encode(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
            const c2 = str.charCodeAt(i + 1);
            if (c2 >= 0xdc00 && c2 <= 0xdfff) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                i++;
            }
        }
        if (c < 0x80) out.push(c);
        else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
        else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
        else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
}

function comixUtf8Decode(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length;) {
        const b = bytes[i++];
        if (b < 0x80) s += String.fromCharCode(b);
        else if (b < 0xe0) {
            const b2 = bytes[i++];
            s += String.fromCharCode(((b & 0x1f) << 6) | (b2 & 0x3f));
        } else if (b < 0xf0) {
            const b2 = bytes[i++], b3 = bytes[i++];
            s += String.fromCharCode(((b & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
        } else {
            const b2 = bytes[i++], b3 = bytes[i++], b4 = bytes[i++];
            let cp = ((b & 7) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
            cp -= 0x10000;
            s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
        }
    }
    return s;
}

function comixB64UrlEncode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const a = bytes[i];
        const b = i + 1 < bytes.length ? bytes[i + 1] : null;
        const c = i + 2 < bytes.length ? bytes[i + 2] : null;
        out += COMIX_B64[a >> 2] + COMIX_B64[((a & 3) << 4) | ((b || 0) >> 4)];
        if (b !== null) out += COMIX_B64[((b & 15) << 2) | ((c || 0) >> 6)];
        if (c !== null) out += COMIX_B64[c & 63];
    }
    return out;
}

function comixB64Decode(str) {
    const lookup = {};
    for (let i = 0; i < 64; i++) lookup[COMIX_B64[i]] = i;
    lookup["+"] = 62;
    lookup["/"] = 63;
    const out = [];
    let buf = 0, bits = 0;
    for (let i = 0; i < str.length; i++) {
        const v = lookup[str.charAt(i)];
        if (v === undefined) continue;
        buf = ((buf << 6) | v) & 0xffffff;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out.push((buf >> bits) & 255);
        }
    }
    return new Uint8Array(out);
}

function comixHexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
}

// ---------------------------------------------------------------------------
// apicore bundle: string decoder, key assembly, token, response decrypt
// ---------------------------------------------------------------------------

// Every site build re-runs the obfuscator, which renames all identifiers,
// reshuffles the string table and changes the index offset and rotation
// checksum.  Nothing below hardcodes those: they are read from the bundle.

function comixEscRe(s) {
    return s.replace(/[$]/g, "\\$");
}

// Evaluates the rotation checksum expression: numbers, + - * /, parentheses
// and parseInt(<decoder>(<n>)) terms.  term(n) returns the parseInt value.
function comixEvalExpr(expr, term) {
    const toks = [];
    const re = /\s*(parseInt\([\w$]+\((\d+)\)\)|\d+(?:\.\d+)?|[-+*\/()])/y;
    let pos = 0;
    while (pos < expr.length) {
        re.lastIndex = pos;
        const m = re.exec(expr);
        if (!m) throw new Error("checksum token at " + pos);
        if (m[2] !== undefined) toks.push({ t: "n", v: term(parseInt(m[2], 10)) });
        else if (/^\d/.test(m[1])) toks.push({ t: "n", v: parseFloat(m[1]) });
        else toks.push({ t: m[1] });
        pos = re.lastIndex;
    }
    let i = 0;
    function prim() {
        const k = toks[i++];
        if (!k) throw new Error("checksum eof");
        if (k.t === "n") return k.v;
        if (k.t === "-") return -prim();
        if (k.t === "+") return +prim();
        if (k.t === "(") {
            const v = add();
            i++;
            return v;
        }
        throw new Error("checksum token " + k.t);
    }
    function mul() {
        let v = prim();
        while (i < toks.length && (toks[i].t === "*" || toks[i].t === "/")) {
            const op = toks[i++].t;
            const r = prim();
            v = op === "*" ? v * r : v / r;
        }
        return v;
    }
    function add() {
        let v = mul();
        while (i < toks.length && (toks[i].t === "+" || toks[i].t === "-")) {
            const op = toks[i++].t;
            const r = mul();
            v = op === "+" ? v + r : v - r;
        }
        return v;
    }
    return add();
}

function comixMakeDecoder(src) {
    // function V(c,K){c-=446;const C=A();...
    const dm = /function ([\w$]+)\(([\w$]+),[\w$]+\)\{\2-=(\d+);const [\w$]+=([\w$]+)\(\)/.exec(src);
    if (!dm) throw new Error("decoder function not found");
    const decName = dm[1];
    const base = parseInt(dm[3], 10);
    const arrFn = dm[4];

    const am = new RegExp("function " + comixEscRe(arrFn) + "\\(\\)\\{const [\\w$]+=\\[(.*?)\\];").exec(src);
    if (!am) throw new Error("decoder table not found");
    let JO = JSON.parse("[" + am[1] + "]");

    const alm = /"([A-Za-z0-9+\/=]{65})"\.indexOf/.exec(src);
    const ALPHA = alm ? alm[1] : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";

    // !function(){const V0=V,t=A();for(;;)try{if(187294===<expr>)break;...
    const rm = new RegExp("!function\\(\\)\\{const [\\w$]+=" + comixEscRe(decName) + ",[\\w$]+=" +
        comixEscRe(arrFn) + "\\(\\);for\\(;;\\)try\\{if\\((.*?)\\)break;").exec(src);
    if (!rm) throw new Error("decoder rotation not found");
    const cond = rm[1];
    let target, expr;
    const cm1 = /^(-?\d+)===(.*)$/.exec(cond);
    const cm2 = /^(.*)===(-?\d+)$/.exec(cond);
    if (cm1) { target = parseInt(cm1[1], 10); expr = cm1[2]; }
    else if (cm2) { target = parseInt(cm2[2], 10); expr = cm2[1]; }
    else throw new Error("decoder checksum not found");

    function qWith(arr, n) {
        const s = arr[n - base];
        if (s === undefined) throw new Error("decoder index " + n);
        const out = [];
        let J = 0, P = 0;
        for (let i = 0; i < s.length; i++) {
            const I = ALPHA.indexOf(s.charAt(i));
            if (I === -1) continue;
            J = (P % 4) ? 64 * J + I : I;
            if (P % 4) out.push((J >> ((-2 * (P + 1)) & 6)) & 255);
            P++;
        }
        return comixUtf8Decode(new Uint8Array(out));
    }

    function jsInt(s) {
        const m = /^\s*([+-]?\d+)/.exec(s);
        return m ? parseInt(m[1], 10) : NaN;
    }

    function checksum(arr) {
        try {
            return comixEvalExpr(expr, function (n) { return jsInt(qWith(arr, n)); });
        } catch (e) {
            return NaN;
        }
    }

    let rot = -1;
    for (let r = 0; r < JO.length; r++) {
        if (checksum(JO) === target) {
            rot = r;
            break;
        }
        JO.push(JO.shift());
    }
    if (rot === -1) throw new Error("decoder rotation not found");

    return {
        rot: rot,
        q: function (n) { return qWith(JO, n); }
    };
}

function comixSafeQ(q, n) {
    try { return q(n); } catch (e) { return null; }
}

function comixBuildKey(src, q) {
    let m;

    // Key pieces: const cH={};cH.id=Vp(608),cH[Vp(1270)]=0,cH[Vp(1163)]=248,cH[Vp(1169)]=1;
    const entries = {};
    let entryCount = 0;
    const entRe = /const ([\w$]+)=\{\};\1\.id=[\w$]+\((\d+)\)((?:,\1\[[\w$]+\(\d+\)\]=\d+)+);/g;
    while ((m = entRe.exec(src))) {
        const props = {};
        const pr = /\[[\w$]+\((\d+)\)\]=(\d+)/g;
        let pm;
        while ((pm = pr.exec(m[3]))) props[comixSafeQ(q, parseInt(pm[1], 10))] = parseInt(pm[2], 10);
        entries[m[1]] = { id: comixSafeQ(q, parseInt(m[2], 10)), props: props };
        entryCount++;
    }
    if (!entryCount) throw new Error("key entries not found");

    // Field roles come from the piece decoder call: Dj(C.id, C[<mode>], C[<xor>]).
    // The remaining numeric field is the offset into the key.
    const rm = /[\w$]+\(([\w$]+)\.id,\1\[[\w$]+\((\d+)\)\],\1\[[\w$]+\((\d+)\)\]\)/.exec(src);
    if (!rm) throw new Error("key piece decoder not found");
    const modeName = comixSafeQ(q, parseInt(rm[2], 10));
    const xorName = comixSafeQ(q, parseInt(rm[3], 10));

    const byName = {};
    for (const name in entries) {
        const ent = entries[name];
        let offName = null;
        for (const pn in ent.props) if (pn !== modeName && pn !== xorName) offName = pn;
        if (offName === null || ent.props[modeName] === undefined || ent.props[xorName] === undefined) continue;
        byName[name] = {
            id: ent.id,
            offset: ent.props[offName],
            xor: ent.props[xorName],
            mode: ent.props[modeName]
        };
    }

    // Piece data: Bj[Vp(1148)]=[77,176,...] or Bj[Vp(1184)]=Vp(1805).  Group by
    // object and keep the one that holds every piece id.
    const stores = {};
    const stRe = /([\w$]+)\[[\w$]+\((\d+)\)\]=(?:\[([0-9,]*)\]|[\w$]+\((\d+)\))/g;
    while ((m = stRe.exec(src))) {
        const k = comixSafeQ(q, parseInt(m[2], 10));
        if (k === null) continue;
        let val;
        if (m[3] !== undefined) {
            val = m[3].split(",").filter(function (x) { return x !== ""; }).map(Number);
        } else {
            val = comixSafeQ(q, parseInt(m[4], 10));
            if (val === null) continue;
        }
        if (!stores[m[1]]) stores[m[1]] = {};
        stores[m[1]][k] = val;
    }
    let wj = null;
    for (const sn in stores) {
        let ok = true;
        for (const en in byName) {
            if (stores[sn][byName[en].id] === undefined) { ok = false; break; }
        }
        if (ok) { wj = stores[sn]; break; }
    }
    if (!wj) throw new Error("key data not found");

    // Assembly order: var Cj=[cH,cY,...] listing only piece names.
    let order = null;
    const orRe = /(?:var|let|const) [\w$]+=\[([\w$]+(?:,[\w$]+)*)\]/g;
    while ((m = orRe.exec(src))) {
        const names = m[1].split(",");
        let all = names.length > 1;
        for (let i = 0; i < names.length && all; i++) if (!byName[names[i]]) all = false;
        if (all) { order = names; break; }
    }
    if (!order) throw new Error("key order not found");

    const key = new Uint8Array(1088);
    for (let oi = 0; oi < order.length; oi++) {
        const e = byName[order[oi]];
        if (!e) throw new Error("key entry " + order[oi]);
        const mv = wj[e.id];
        if (mv === undefined) throw new Error("key data " + e.id);
        let Y;
        if (e.mode === 1) {
            Y = [];
            for (let i = 0; i < mv.length; i++) Y.push(mv.charCodeAt(i) - 33);
        } else if (e.mode === 2) {
            Y = mv.slice(1);
        } else {
            Y = mv;
        }
        for (let i = 0; i < Y.length; i++) key[e.offset + i] = (Y[i] ^ e.xor) & 255;
    }
    return key;
}

// Token prefix ("kid"): cu[Vp(779)]=Vp(1809) where Vp(779) decodes to "kid".
function comixFindPrefix(src, q) {
    let m;
    const re = /[\w$]+\[[\w$]+\((\d+)\)\]=[\w$]+\((\d+)\)/g;
    while ((m = re.exec(src))) {
        if (comixSafeQ(q, parseInt(m[1], 10)) === "kid") {
            const v = comixSafeQ(q, parseInt(m[2], 10));
            if (v && /^[A-Za-z0-9_-]{1,16}$/.test(v)) return v;
        }
    }
    const lm = /["']?kid["']?\s*:\s*[\w$]+\((\d+)\)/.exec(src);
    if (lm) {
        const v = comixSafeQ(q, parseInt(lm[1], 10));
        if (v && /^[A-Za-z0-9_-]{1,16}$/.test(v)) return v;
    }
    throw new Error("token prefix not found");
}

const COMIX_SHA_K = [
    1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993,
    2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
    1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
    264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
    113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
    1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411,
    3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
    430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
    1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
    2428436474, 2756734187, 3204031479, 3329325298
];

function comixRotr(x, n) {
    return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function comixShaCompress(state, block) {
    const w = new Array(64);
    for (let i = 0; i < 16; i++) {
        w[i] = ((block[i * 4] << 24) | (block[i * 4 + 1] << 16) |
            (block[i * 4 + 2] << 8) | block[i * 4 + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
        const s0 = (comixRotr(w[i - 15], 7) ^ comixRotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
        const s1 = (comixRotr(w[i - 2], 17) ^ comixRotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = state[0], b = state[1], c = state[2], d = state[3];
    let e = state[4], f = state[5], g = state[6], h = state[7];
    for (let i = 0; i < 64; i++) {
        const S1 = (comixRotr(e, 6) ^ comixRotr(e, 11) ^ comixRotr(e, 25)) >>> 0;
        const ch = ((e & f) ^ ((~e) & g)) >>> 0;
        const t1 = (h + S1 + ch + COMIX_SHA_K[i] + w[i]) >>> 0;
        const S0 = (comixRotr(a, 2) ^ comixRotr(a, 13) ^ comixRotr(a, 22)) >>> 0;
        const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    return [
        (state[0] + a) >>> 0, (state[1] + b) >>> 0, (state[2] + c) >>> 0, (state[3] + d) >>> 0,
        (state[4] + e) >>> 0, (state[5] + f) >>> 0, (state[6] + g) >>> 0, (state[7] + h) >>> 0
    ];
}

// SHA-256 with a caller-supplied initial state and a length offset.  This is
// the site's Wj() variant, not standard SHA-256.
function comixSha256Custom(stateBytes, data, offset) {
    let state = [];
    for (let i = 0; i < 8; i++) {
        state.push(((stateBytes[i * 4] << 24) | (stateBytes[i * 4 + 1] << 16) |
            (stateBytes[i * 4 + 2] << 8) | stateBytes[i * 4 + 3]) >>> 0);
    }
    const total = offset + data.length;
    let W = data.length + 1;
    while (W % 64 !== 56) W++;
    const D = new Uint8Array(W + 8);
    D.set(data);
    D[data.length] = 0x80;
    const bits = 8 * total;
    const hi = Math.floor(bits / 4294967296);
    const lo = bits >>> 0;
    D[W] = (hi >>> 24) & 255;
    D[W + 1] = (hi >>> 16) & 255;
    D[W + 2] = (hi >>> 8) & 255;
    D[W + 3] = hi & 255;
    D[W + 4] = (lo >>> 24) & 255;
    D[W + 5] = (lo >>> 16) & 255;
    D[W + 6] = (lo >>> 8) & 255;
    D[W + 7] = lo & 255;
    for (let i = 0; i < D.length; i += 64) {
        state = comixShaCompress(state, D.subarray(i, i + 64));
    }
    const out = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
        out[i * 4] = (state[i] >>> 24) & 255;
        out[i * 4 + 1] = (state[i] >>> 16) & 255;
        out[i * 4 + 2] = (state[i] >>> 8) & 255;
        out[i * 4 + 3] = state[i] & 255;
    }
    return out;
}

function comixBuildToken(key, prefix, input) {
    const h1 = comixSha256Custom(key.subarray(0, 32), comixUtf8Encode(input), 64);
    const h2 = comixSha256Custom(key.subarray(32, 64), h1, 64);
    return prefix + "." + comixB64UrlEncode(h2).slice(0, 16);
}

function comixDecrypt(key, encoded) {
    if (!encoded || typeof encoded !== "string") return "";
    const raw = comixB64Decode(encoded);
    const rot = ((raw[0] << 8) | raw[1]) % 1024;
    const Y = key.slice(64, 1088);
    const l = new Uint8Array(1024);
    l.set(Y.subarray(rot));
    l.set(Y.subarray(0, rot), 1024 - rot);

    const w = new Uint8Array(raw.length + 2);
    w.set(raw, 2);
    const Hlen = w.length;
    const p = Hlen >> 2;
    const buf = new Uint8Array(Math.ceil(Hlen / 4) * 4);
    buf.set(w);
    const words = new Uint32Array(buf.buffer);
    const D = new Uint32Array(l.buffer);
    for (let J = 1; J < p; J++) words[J] ^= D[(J - 1) % 256];
    w.set(new Uint8Array(buf.buffer, 0, Hlen));
    for (let O = p * 4; O < Hlen; O++) w[O] ^= l[(O - 4) % 1024];
    return comixUtf8Decode(w.subarray(4, Hlen));
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function comixResolveUrl(base, rel) {
    if (!rel) return "";
    if (/^https?:\/\//i.test(rel)) return rel;
    if (rel.indexOf("//") === 0) return "https:" + rel;
    if (rel.charAt(0) === "/") {
        const m = /^(https?:\/\/[^\/]+)/.exec(base);
        return (m ? m[1] : "https://comix.to") + rel;
    }
    const dir = base.slice(0, base.lastIndexOf("/") + 1);
    return dir + rel;
}

function comixAbsUrl(base, p) {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    if (p.indexOf("//") === 0) return "https:" + p;
    if (p.charAt(0) === "/") return base + p;
    return base + "/" + p;
}

// Page image URL: item paths are relative to the chapter's CDN base
// (result.pages.baseUrl).  Absolute item URLs are kept; with no CDN base the
// path falls back to the site origin.
function comixPageUrl(cdnBase, siteBase, path) {
    if (/^https?:\/\//i.test(path)) return path;
    if (path.indexOf("//") === 0) return "https:" + path;
    if (!cdnBase) return comixAbsUrl(siteBase, path);
    if (cdnBase.indexOf("//") === 0) cdnBase = "https:" + cdnBase;
    const baseSlash = cdnBase.charAt(cdnBase.length - 1) === "/";
    const pathSlash = path.charAt(0) === "/";
    if (baseSlash && pathSlash) return cdnBase + path.slice(1);
    if (!baseSlash && !pathSlash) return cdnBase + "/" + path;
    return cdnBase + path;
}

function comixStripHtml(html) {
    if (!html) return "";
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function comixParseRelativeDate(s) {
    const now = Date.now();
    if (!s) return String(now);
    const m = /(\d+)\s*([a-z]+)\s*ago/i.exec(String(s));
    if (!m) {
        const d = new Date(String(s));
        return isNaN(d.getTime()) ? String(now) : String(d.getTime());
    }
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    let ms = 0;
    if (unit === "s" || unit === "sec" || unit === "secs" || unit === "second" || unit === "seconds") ms = n * 1000;
    else if (unit === "m" || unit === "min" || unit === "mins" || unit === "minute" || unit === "minutes") ms = n * 60000;
    else if (unit === "h" || unit === "hr" || unit === "hrs" || unit === "hour" || unit === "hours") ms = n * 3600000;
    else if (unit === "d" || unit === "day" || unit === "days") ms = n * 86400000;
    else if (unit === "w" || unit === "wk" || unit === "wks" || unit === "week" || unit === "weeks") ms = n * 604800000;
    else if (unit === "mo" || unit === "mos" || unit === "month" || unit === "months") ms = n * 2592000000;
    else if (unit === "y" || unit === "yr" || unit === "yrs" || unit === "year" || unit === "years") ms = n * 31536000000;
    return String(now - ms);
}

function comixStatus(s) {
    switch (s) {
        case "releasing": return 0;
        case "finished": return 1;
        case "on_hiatus": return 2;
        case "discontinued": return 3;
        case "not_yet_released": return 4;
        default: return 5;
    }
}

function comixSelectOption(name, value) {
    return { type_name: "SelectOption", name: name, value: value };
}

function comixCheckBox(name, value) {
    return { type_name: "CheckBox", name: name, value: value, state: false };
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

class DefaultExtension extends MProvider {
    constructor() {
        super();
        this.client = new Client();
    }

    get supportsLatest() {
        return true;
    }

    getBaseUrl() {
        try {
            const v = new SharedPreferences().get("domain_url");
            if (v && String(v).length) {
                let b = String(v).trim();
                while (b.length > 1 && b.charAt(b.length - 1) === "/") b = b.slice(0, -1);
                if (b.length) return b;
            }
        } catch (e) { }
        let b = (this.source && this.source.baseUrl) ? this.source.baseUrl : "https://comix.to";
        while (b.length > 1 && b.charAt(b.length - 1) === "/") b = b.slice(0, -1);
        return b;
    }

    // Source-wide headers.  Mangayomi calls this once with the base URL and
    // applies the result to EVERY image it loads for this source (covers and
    // chapter pages, reader and downloads), on top of any per-page headers.
    // comix.to's own reader loads page images with referrerPolicy
    // "no-referrer", so this set must not carry Referer/Origin or a JSON
    // Accept.  API calls use apiHeaders() instead.
    getHeaders(url) {
        const headers = this.identityHeaders();
        headers["Accept"] = "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5";
        return headers;
    }

    apiHeaders() {
        const headers = this.identityHeaders();
        headers["Accept"] = "application/json, text/plain, */*";
        headers["Referer"] = this.getBaseUrl() + "/";
        headers["Origin"] = this.getBaseUrl();
        return headers;
    }

    identityHeaders() {
        const headers = {};
        // Do not hardcode a User-Agent here.  comix.to's human check issues a
        // cookie bound to the browser that solved it, and Mangayomi applies the
        // WebView's own UA together with the stored cookie only when the source
        // leaves the header out.  A fixed desktop UA made that pair mismatch.
        // A preference remains for users who paste a cookie from an external
        // browser and need to match that browser's UA too.
        try {
            const ua = new SharedPreferences().get("user_agent");
            if (ua && String(ua).trim()) {
                headers["User-Agent"] = String(ua).replace(/[\r\n]+/g, " ").trim();
            }
        } catch (e) { }
        // Optional escape hatch for the site's Turnstile check.  The app's
        // normal cookie store is used automatically; this preference only
        // overrides it when the user pastes a Cookie header from a browser
        // that has already passed the check.
        try {
            const raw = new SharedPreferences().get("cookie");
            if (raw && String(raw).trim()) {
                headers["Cookie"] = String(raw).replace(/[\r\n]+/g, " ").trim();
            }
        } catch (e) { }
        return headers;
    }

    async ensureSession() {
        if (COMIX_SESSION) return COMIX_SESSION;

        const base = this.getBaseUrl();
        try {
            const homeRes = await this.client.get(base + "/", {
                "Accept": "text/html,application/xhtml+xml"
            });
            const home = homeRes.body || "";

            let mainPath = "";
            let m = /src="([^"]*main-[^"]+\.js)"/.exec(home);
            if (m) {
                mainPath = m[1];
            } else {
                const re = /src="([^"]+\.js)"/g;
                while ((m = re.exec(home))) {
                    if (/main[-.]/.test(m[1])) {
                        mainPath = m[1];
                        break;
                    }
                }
            }
            if (!mainPath) throw new Error("main bundle not found");

            const mainUrl = comixResolveUrl(base + "/", mainPath);
            const mainRes = await this.client.get(mainUrl, {
                "Accept": "*/*"
            });
            const mainSrc = mainRes.body || "";

            const am = /apicore-[A-Za-z0-9_-]+\.js/.exec(mainSrc);
            if (!am) throw new Error("apicore bundle not found");
            const apiUrl = comixResolveUrl(mainUrl, am[0]);

            const apiRes = await this.client.get(apiUrl, {
                "Accept": "*/*"
            });
            const apiSrc = apiRes.body || "";

            const dec = comixMakeDecoder(apiSrc);
            const key = comixBuildKey(apiSrc, dec.q);
            const prefix = comixFindPrefix(apiSrc, dec.q);

            COMIX_SESSION = {
                key: key,
                prefix: prefix,
                apiUrl: apiUrl,
                mainUrl: mainUrl,
                source: "live"
            };
        } catch (e) {
            COMIX_SESSION = {
                key: comixHexToBytes(COMIX_FALLBACK_KEY_HEX),
                prefix: "si7",
                apiUrl: "",
                mainUrl: "",
                source: "fallback",
                error: String(e)
            };
        }
        return COMIX_SESSION;
    }

    // Decode one API response.  The site answers with plain JSON normally and
    // with {"e":"..."} plus an `x-enc: 2` header when response encryption is
    // enabled.  Returns null when the body is not JSON.
    parseApiResponse(res, session) {
        let body = String(res.body || "").replace(/^\s+/, "");
        const headers = res.headers || {};
        let enc = "";
        for (const hk in headers) {
            if (String(hk).toLowerCase() === "x-enc") { enc = headers[hk]; break; }
        }

        if (/^\{\s*"e"\s*:/.test(body)) {
            try {
                body = comixDecrypt(session.key, JSON.parse(body).e);
            } catch (e) { }
        } else if (String(enc) === "2") {
            try {
                const obj = JSON.parse(body);
                if (obj && obj.e) body = comixDecrypt(session.key, obj.e);
            } catch (e) { }
        }

        try {
            return JSON.parse(body);
        } catch (e) {
            return null;
        }
    }

    apiError(json) {
        if (!json || typeof json !== "object") return "";
        if (json.error === "captcha_required" || json.challenge) {
            return "Comix wants a one-time human check. Tap the globe (webview) " +
                "button on the title, complete the check, then pull to refresh.";
        }
        if (this.isTokenError(json)) {
            let msg = "Comix rejected the request token (" + (json.code || json.error || "invalid") + ").";
            if (COMIX_SESSION && COMIX_SESSION.error) msg += " Key refresh failed: " + COMIX_SESSION.error;
            return msg;
        }
        if (json.error && typeof json.error === "object") {
            return "Comix API: " + (json.error.message || JSON.stringify(json.error));
        }
        if (json.error) return "Comix API: " + (json.message || json.error);
        if (json.code && json.code !== "ok") return "Comix API: " + (json.message || json.code);
        if (json.status && json.status !== "ok") return "Comix API: " + (json.message || json.status);
        return "";
    }

    // The API signals a stale signing key as invalid_token, key_retired,
    // key_expired and the like, always with a 401/403 and "token" in the text.
    isTokenError(json) {
        if (!json || typeof json !== "object") return false;
        const parts = [json.code, json.error, json.message];
        if (json.error && typeof json.error === "object") parts.push(json.error.code, json.error.message);
        for (let i = 0; i < parts.length; i++) {
            const s = typeof parts[i] === "string" ? parts[i].toLowerCase() : "";
            if (!s) continue;
            if (/token|key_|_key|kid|signature/.test(s)) return true;
        }
        return false;
    }

    async apiGet(path, params) {
        let session = await this.ensureSession();
        let res = await this.client.get(this.buildApiUrl(path, params, session), this.apiHeaders());
        let json = this.parseApiResponse(res, session);

        // A bundle rotation makes every request fail with a token error.  Drop
        // the cached key, rediscover it, and try the request exactly once more.
        if (json && this.isTokenError(json)) {
            COMIX_SESSION = null;
            session = await this.ensureSession();
            res = await this.client.get(this.buildApiUrl(path, params, session), this.apiHeaders());
            json = this.parseApiResponse(res, session);
        }

        if (!json) {
            throw new Error("Comix: unreadable response (HTTP " + res.statusCode + ")");
        }
        if (typeof json.e === "string" && json.result === undefined && json.status === undefined) {
            throw new Error("Comix: could not decrypt the API response. " +
                "The site may have rotated its signing key; reopen the source to refresh it.");
        }
        const message = this.apiError(json);
        if (message) throw new Error(message);
        if (res.statusCode >= 400 && !json.result) {
            throw new Error("Comix: HTTP " + res.statusCode + " from the API");
        }
        return json;
    }

    buildApiUrl(path, params, session) {
        const keys = [];
        for (const k in (params || {})) {
            if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
            const v = params[k];
            if (v === undefined || v === null || v === "") continue;
            keys.push(k);
        }
        keys.sort();

        const rawParts = [];
        const urlParts = [];
        for (let ki = 0; ki < keys.length; ki++) {
            const k = keys[ki];
            const v = params[k];
            if (Array.isArray(v)) {
                for (let i = 0; i < v.length; i++) {
                    rawParts.push(k + "[" + i + "]=" + v[i]);
                    urlParts.push(encodeURIComponent(k) + "%5B" + i + "%5D=" + encodeURIComponent(String(v[i])));
                }
            } else {
                rawParts.push(k + "=" + v);
                urlParts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
            }
        }

        const rawQs = rawParts.join("&");
        const token = comixBuildToken(
            session.key,
            session.prefix,
            path + (rawQs ? "?" + rawQs : "")
        );
        const urlQs = urlParts.join("&");
        return this.getBaseUrl() + "/api/v1" + path + "?" +
            (urlQs ? urlQs + "&" : "") + "_=" + token;
    }

    listFromResult(result, base) {
        const r = result || {};
        const items = r.items || [];
        const list = [];
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const poster = it.poster || {};
            const img = poster.large || poster.medium || "";
            list.push({
                name: it.title || "",
                imageUrl: img ? comixAbsUrl(base, img) : "",
                link: it.url || ("/title/" + it.hid)
            });
        }
        return {
            list: list,
            hasNextPage: !!(r.meta && r.meta.hasNext)
        };
    }

    async getPopular(page) {
        const base = this.getBaseUrl();
        const j = await this.apiGet("/manga", {
            limit: 100,
            page: page,
            "order[follows_total]": "desc"
        });
        return this.listFromResult(j.result, base);
    }

    async getLatestUpdates(page) {
        const base = this.getBaseUrl();
        const j = await this.apiGet("/manga", {
            limit: 100,
            page: page,
            scope: "hot",
            "order[chapter_updated_at]": "desc"
        });
        return this.listFromResult(j.result, base);
    }

    readFilters(filters) {
        const out = {
            sort: "",
            type: "",
            status: "",
            demographic: "",
            genres: [],
            contentRatings: [],
            yearFrom: "",
            yearTo: "",
            minChap: "",
            maxChap: ""
        };
        if (!filters || !filters.length) return out;
        for (let i = 0; i < filters.length; i++) {
            const f = filters[i];
            if (!f) continue;
            const name = String(f.name || "").toLowerCase();
            const values = f.values || [];
            const state = f.state;

            if (name === "sort") {
                if (values[state]) out.sort = values[state].value;
            } else if (name === "type") {
                if (values[state]) out.type = values[state].value;
            } else if (name === "status") {
                if (values[state]) out.status = values[state].value;
            } else if (name === "demographic") {
                if (values[state]) out.demographic = values[state].value;
            } else if (name === "genres" && Array.isArray(state)) {
                for (let g = 0; g < state.length; g++) {
                    if (state[g] && state[g].state) out.genres.push(state[g].value);
                }
            } else if (name === "content rating" && Array.isArray(state)) {
                for (let c = 0; c < state.length; c++) {
                    if (state[c] && state[c].state) out.contentRatings.push(state[c].value);
                }
            } else if (name === "year from") {
                out.yearFrom = state || "";
            } else if (name === "year to") {
                out.yearTo = state || "";
            } else if (name === "min chapters") {
                out.minChap = state || "";
            } else if (name === "max chapters") {
                out.maxChap = state || "";
            }
        }
        return out;
    }

    async search(query, page, filters) {
        const base = this.getBaseUrl();
        const f = this.readFilters(filters);
        const params = { limit: 100, page: page };

        const q = query ? String(query).trim() : "";
        if (q) params["keyword"] = q;

        let sort = f.sort;
        if (!sort || sort === "relevance:desc") {
            sort = q ? "relevance:desc" : "chapter_updated_at:desc";
        }
        const sp = sort.split(":");
        if (sp.length === 2) params["order[" + sp[0] + "]"] = sp[1];

        if (f.type) params["types[0]"] = f.type;
        if (f.status) params["statuses[0]"] = f.status;
        if (f.demographic) params["demographics[0]"] = f.demographic;
        if (f.genres.length) params["genres_in"] = f.genres;
        if (f.contentRatings.length) params["content_rating"] = f.contentRatings;
        if (f.yearFrom) params["year_from"] = f.yearFrom;
        if (f.yearTo) params["year_to"] = f.yearTo;
        if (f.minChap) params["min_chap"] = f.minChap;
        if (f.maxChap) params["max_chap"] = f.maxChap;

        const j = await this.apiGet("/manga", params);
        return this.listFromResult(j.result, base);
    }

    // comix.to protects its chapter/page API with a one-time Turnstile check
    // at /@waf/challenge.  When that check is pending the detail link is set to
    // the challenge page so the app's globe button can open it; unwrap the
    // `return` target before reading the manga id.
    normalizeTargetUrl(url) {
        let s = String(url || "").trim();
        const m = /[?&]return=([^&]+)/.exec(s);
        if (m) {
            try { s = decodeURIComponent(m[1]); } catch (e) { }
        }
        return s;
    }

    challengeLink(titlePath) {
        let p = String(titlePath || "").trim();
        if (!p) p = "/";
        if (p.charAt(0) !== "/") p = "/" + p;
        return "/@waf/challenge?return=" + encodeURIComponent(p);
    }

    isCaptchaError(e) {
        return !!e && /captcha_required|human check|challenge/i.test(String(e.message || e));
    }

    extractHid(url) {
        if (!url) return "";
        const s = this.normalizeTargetUrl(url);
        const m = /\/(?:title|manga)\/([^\/?#]+)/.exec(s);
        if (m) {
            const seg = m[1];
            const dash = seg.indexOf("-");
            return dash > 0 ? seg.slice(0, dash) : seg;
        }
        return s.replace(/^\/+/, "").replace(/\/+$/, "");
    }

    chapterFrom(ch) {
        const num = ch.number;
        let name = "Chapter " + num;
        if (ch.volume && Number(ch.volume) > 0) name = "Vol. " + ch.volume + " " + name;
        if (ch.name) name += " - " + ch.name;
        return {
            name: name,
            url: ch.url || String(ch.id),
            dateUpload: comixParseRelativeDate(ch.createdAtFormatted),
            scanlator: ch.group ? (ch.group.name || "") : "",
            isFiller: false
        };
    }

    async getDetail(url) {
        const base = this.getBaseUrl();
        const target = this.normalizeTargetUrl(url);
        const hid = this.extractHid(target);
        if (!hid) throw new Error("Comix: missing manga id");

        const j = await this.apiGet("/manga/" + encodeURIComponent(hid), {});
        const d = j.result || {};

        // A pending human check must not make the whole title fail to load.
        // Return the metadata and point the app's globe button at the challenge
        // page so the user has an obvious way to pass it.
        let chapters = [];
        let needsHumanCheck = false;
        try {
            chapters = await this.getChapters(hid, d.title || hid);
        } catch (e) {
            if (!this.isCaptchaError(e)) throw e;
            needsHumanCheck = true;
        }

        const poster = d.poster || {};
        const img = poster.large || poster.medium || "";
        const genres = [];
        const gs = d.genres || [];
        for (let i = 0; i < gs.length; i++) genres.push(gs[i].title);

        const titlePath = d.url || ("/title/" + hid);
        let description = d.synopsis || comixStripHtml(d.synopsisHtml || "");
        if (needsHumanCheck) {
            description = "Comix needs a one-time human check before it will list chapters. " +
                "Tap the globe (webview) button above, complete the check, then pull to refresh." +
                (description ? "\n\n" + description : "");
        }

        return {
            name: d.title || "",
            link: needsHumanCheck ? this.challengeLink(titlePath) : titlePath,
            imageUrl: img ? comixAbsUrl(base, img) : "",
            description: description,
            author: (d.authors || []).map(function (a) { return a.title; }).join(", "),
            artist: (d.artists || []).map(function (a) { return a.title; }).join(", "),
            status: comixStatus(d.status),
            genre: genres,
            chapters: chapters
        };
    }

    async getChapters(hid, title) {
        const chapters = [];
        let page = 1;
        let guard = 0;
        while (guard++ < 60) {
            let cj;
            try {
                cj = await this.apiGet("/manga/" + encodeURIComponent(hid) + "/chapters", {
                    limit: 100,
                    page: page,
                    "order[number]": "desc"
                });
            } catch (e) {
                if (this.isCaptchaError(e)) {
                    throw new Error("Comix: could not load the chapter list for \"" +
                        (title || hid) + "\". Comix wants a one-time human check. " +
                        "Tap the globe (webview) button on the title, complete the check, " +
                        "then pull to refresh.");
                }
                throw new Error("Comix: could not load the chapter list for \"" +
                    (title || hid) + "\". " + e.message);
            }
            const r = cj.result || {};
            const items = r.items || [];
            for (let i = 0; i < items.length; i++) chapters.push(this.chapterFrom(items[i]));
            if (!items.length || !r.meta || !r.meta.hasNext) break;
            page++;
        }
        return chapters;
    }

    async getPageList(url) {
        const s = String(url || "").trim();
        let id = "";
        // Chapter URLs end in /{chapterId}-chapter-{number}, so anchor the
        // match to the end of the path.  A slug that itself contains
        // "-chapter-" must not win.
        let m = /(\d+)-chapter-[^\/?#]*\/?(?:[?#]|$)/.exec(s);
        if (m) id = m[1];
        if (!id) {
            const parts = s.split("/");
            for (let i = parts.length - 1; i >= 0; i--) {
                if (/^\d+$/.test(parts[i])) {
                    id = parts[i];
                    break;
                }
            }
        }
        if (!id && /^\d+$/.test(s)) id = s;
        if (!id) throw new Error("Comix: cannot find chapter id in " + url);

        let j;
        try {
            j = await this.apiGet("/chapters/" + id, {});
        } catch (e) {
            if (this.isCaptchaError(e)) {
                throw new Error("Comix wants a human check before it shows this chapter's " +
                    "pages. In the reader, tap the globe (webview) button to open this " +
                    "chapter on comix.to, complete the check if it appears, then tap the " +
                    "next or previous chapter there so the app saves the pass. Close the " +
                    "webview and reopen the chapter. If the pages still do not load, comix.to " +
                    "only serves them to its own reader: read this chapter in the webview.");
            }
            throw e;
        }
        return this.pagesFromResult(j.result || {});
    }

    // result.pages is { baseUrl, items: [{ url, width, height }], alt, alt2,
    // node | alt_node } (or a bare items array).  Each item.url is a path
    // relative to pages.baseUrl, the image CDN: the site's reader builds
    // pages.baseUrl + item.url.  Resolving it against comix.to (as before)
    // produced URLs that do not exist.
    pagesFromResult(result) {
        const raw = result.pages;
        const p = Array.isArray(raw) ? { items: raw } : (raw || {});
        const items = p.items || [];
        const cdnBase = typeof p.baseUrl === "string" ? p.baseUrl.trim() : "";
        const siteBase = this.getBaseUrl();
        const headers = this.getHeaders();
        const pages = [];
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const path = it && (typeof it === "string" ? it : it.url);
            if (!path) continue;
            pages.push({ url: comixPageUrl(cdnBase, siteBase, String(path).trim()), headers: headers });
        }
        return pages;
    }

    getFilterList() {
        const sorts = [
            ["Best match", "relevance:desc"],
            ["Latest update", "chapter_updated_at:desc"],
            ["Recently added", "created_at:desc"],
            ["Title (A-Z)", "title:asc"],
            ["Title (Z-A)", "title:desc"],
            ["Year (newest)", "year:desc"],
            ["Year (oldest)", "year:asc"],
            ["Highest rated", "score:desc"],
            ["Most viewed - 7 days", "views_7d:desc"],
            ["Most viewed - 30 days", "views_30d:desc"],
            ["Most viewed - 90 days", "views_90d:desc"],
            ["Most viewed - all time", "views_total:desc"],
            ["Most followed", "follows_total:desc"]
        ];
        const sortValues = [];
        for (let i = 0; i < sorts.length; i++) sortValues.push(comixSelectOption(sorts[i][0], sorts[i][1]));

        const genreList = [
            ["Action", "6"], ["Adult", "87264"], ["Adventure", "7"],
            ["Boys Love", "8"], ["Comedy", "9"], ["Crime", "10"],
            ["Drama", "11"], ["Ecchi", "87265"], ["Fantasy", "12"],
            ["Girls Love", "13"], ["Harem", "40"], ["Hentai", "87266"],
            ["Historical", "14"], ["Horror", "15"], ["Isekai", "16"],
            ["Magical Girls", "17"], ["Mature", "87267"], ["Mecha", "18"],
            ["Medical", "19"], ["Mystery", "20"], ["Philosophical", "21"],
            ["Psychological", "22"], ["Romance", "23"], ["Sci-Fi", "24"],
            ["Slice of Life", "25"], ["Smut", "87268"], ["Sports", "26"],
            ["Superhero", "27"], ["Thriller", "28"], ["Tragedy", "29"],
            ["Wuxia", "30"]
        ];
        const genreChecks = [];
        for (let i = 0; i < genreList.length; i++) genreChecks.push(comixCheckBox(genreList[i][0], genreList[i][1]));

        return [
            {
                type: "header",
                type_name: "HeaderFilter",
                name: "Comix filters"
            },
            {
                type: "select",
                type_name: "SelectFilter",
                name: "Sort",
                state: 0,
                values: sortValues
            },
            {
                type: "select",
                type_name: "SelectFilter",
                name: "Type",
                state: 0,
                values: [
                    comixSelectOption("Any", ""),
                    comixSelectOption("Manga", "manga"),
                    comixSelectOption("Manhwa", "manhwa"),
                    comixSelectOption("Manhua", "manhua"),
                    comixSelectOption("Other", "other")
                ]
            },
            {
                type: "group",
                type_name: "GroupFilter",
                name: "Genres",
                state: genreChecks
            },
            {
                type: "select",
                type_name: "SelectFilter",
                name: "Demographic",
                state: 0,
                values: [
                    comixSelectOption("Any", ""),
                    comixSelectOption("Shounen", "2"),
                    comixSelectOption("Shoujo", "1"),
                    comixSelectOption("Seinen", "4"),
                    comixSelectOption("Josei", "3")
                ]
            },
            {
                type: "select",
                type_name: "SelectFilter",
                name: "Status",
                state: 0,
                values: [
                    comixSelectOption("Any", ""),
                    comixSelectOption("Releasing", "releasing"),
                    comixSelectOption("Finished", "finished"),
                    comixSelectOption("On hiatus", "on_hiatus"),
                    comixSelectOption("Discontinued", "discontinued"),
                    comixSelectOption("Not yet released", "not_yet_released")
                ]
            },
            {
                type: "group",
                type_name: "GroupFilter",
                name: "Content rating",
                state: [
                    comixCheckBox("Safe", "safe"),
                    comixCheckBox("Suggestive", "suggestive"),
                    comixCheckBox("Erotica", "erotica"),
                    comixCheckBox("Pornographic", "pornographic")
                ]
            },
            {
                type: "text",
                type_name: "TextFilter",
                name: "Year from",
                state: ""
            },
            {
                type: "text",
                type_name: "TextFilter",
                name: "Year to",
                state: ""
            },
            {
                type: "text",
                type_name: "TextFilter",
                name: "Min chapters",
                state: ""
            },
            {
                type: "text",
                type_name: "TextFilter",
                name: "Max chapters",
                state: ""
            }
        ];
    }

    getSourcePreferences() {
        return [{
            key: "domain_url",
            editTextPreference: {
                title: "Override base URL",
                summary: "https://comix.to",
                value: "https://comix.to",
                dialogTitle: "Base URL",
                dialogMessage: "Leave the default unless comix.to moves."
            }
        }, {
            key: "cookie",
            editTextPreference: {
                title: "Optional Cookie header",
                summary: "Only needed if the in-app webview cannot pass the human check",
                value: "",
                dialogTitle: "Cookie header",
                dialogMessage: "Normally leave this empty: tap the globe (webview) button " +
                    "on a title, complete the check there, and the app stores the cookie. " +
                    "If you instead passed the check in an external browser, paste that " +
                    "browser's Cookie header here and its User-Agent below."
            }
        }, {
            key: "user_agent",
            editTextPreference: {
                title: "Optional User-Agent",
                summary: "Only needed with a pasted Cookie header",
                value: "",
                dialogTitle: "User-Agent",
                dialogMessage: "Leave empty to let the app use its webview User-Agent " +
                    "together with the stored cookie. Set this only when you paste a " +
                    "cookie from an external browser, and use that same browser's " +
                    "User-Agent so the two match."
            }
        }];
    }
}
