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
    "isNsfw": true,
    "version": "0.2.1",
    "pkgPath": "manga/src/en/comix.js"
  }
];

// ---------------------------------------------------------------------------
// Constants and fallback data
// ---------------------------------------------------------------------------

const COMIX_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const COMIX_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// Key assembled from the apicore bundle at build 35595e3de3c99889c1aa70
// (x-build-id to7q0v).  Used only when live extraction fails.
const COMIX_FALLBACK_KEY_HEX =
    "1c948595505e707ded4b4d46701af692a2aa7a40d911929daaec1111d6e0eea7" +
    "442fd064c6c87c601f28f5c9cde6c2d2be463aae8596f026b02dc2b28b1797c6" +
    "36d642fc0402ef6723fe9af164b86d5f804a7ffacff360f61af80bb8cb4d8618" +
    "38b53fc402f14f80361458bd3995b558152fd7b71531553d8fd79c00e6fa5a40" +
    "986a11dfa504e00024b1bf712d3df30fd6535c0c5c0c40e5e2287f2c7a70ccd1" +
    "c1976e84fc3bc6e7422f96b399a387ba1d48d5552d862d6eeeb62637dbefad28" +
    "98a893f049171612b5531801b424c8a7b656c01ba8e591c76ba8bacfbf9f9b33" +
    "39525c88a910db4584c18302347312ca87a1607ac4d0072329570908624052d6" +
    "1194aa29c2849ec248265569aec2f812fe45be1e3fac28f8f1f8e21b17d7f909" +
    "49a2ec3feb5b0560ba9ec801462519ad60e50678764cd700d09ac52dcc3a77b3" +
    "ce41f48a0f810272787c499bf3beae3ea7e6b5c9f82a9d3d69ca7fbbd82b17d5" +
    "968c989bd8f26fd50b40ac9a08273de521f03efa48c2edfc828e118ac752fb2b" +
    "a562df1fb6dd17836f6551df7567d5706444e0e822d66049106394359c77bfb1" +
    "1fee6affdcdf0026f3b733afd6df6a970789c3dc21d2b4dda888a3b02af8965b" +
    "07115c56ddadfa69719f77675d92c1b78e21f65f7ca3d56cbf615ef93fce7c80" +
    "faf3ec5c1f3d859eccc2b76d74bb0f3f36afd1830e44ddd14dd2aff8340f1f9b" +
    "987c3870788f95bfeea7e23817c3d709eab486feae68b0cbba438d27329ae161" +
    "cb23f328341fe358da8935c3200f104df1a2c1a6b4545f4e7897382acb9d4d59" +
    "dbf1b361746299b68029d6c00a4ca2e72821ad021a15781b148ed16ce4d76b08" +
    "50cba7f146e54a88389f7634dd8ec3181a2d9f900283ca3d66422148b4d3769e" +
    "df4b08f7699166939a21a0de893c2d8579bb26200f33b6fe894b22844d4202e1" +
    "ebad2a80a6d398045777e4b85e26d9ec48fb841fb5d33a6ac2c83b383f10cb6c" +
    "0b9b5094a1ec35872e4e8a67b36495f7fd0688b76de0425d829626e229eac6b1" +
    "f0ef7f8447d03c5137b13f40537e0b42c12a864da2f3c813dc2da159c0531fe9" +
    "d4d7d95138d3217b681dca78252fdab6325a8990912ca29cd82473c1acbd7961" +
    "c065ff42fde8c46f073016100999ef9524fa100b0456efcd6942efe127ed2130" +
    "96bc6e7db8a9e95a2021ab97810104c2ce12f3435663815d89a1eb77f1e3dcaf" +
    "505ec94970ce2f00c1de53eb45c66dcb0c12a8a069fafb54ed28073b4bbc2363" +
    "bb63b04ecfea3ae3c788e57fca2dd3166520114b614df11e23c2fa584c5cdf42" +
    "2294302d552cfa88e73ce81107155cecec21bedc83c113fe86d0227f3a77433d" +
    "2025fff79a5270685d9a1d9d55d354e131db2b2c5c2e28d620ef3234020e99c0" +
    "929ff63723c8d2c6fcec25397dc4ea04016f8c45a8395bdaa3bc977fa93faa02" +
    "505dbe4ca8e88187c031581f3d74b2d1b8835413c3f690d303e2f39f0ca686a1" +
    "de3d2f2d957819cb69e8b0cf048867109e62b312b87e9b1a51b5a39c70c9c523";

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

function comixMakeDecoder(src) {
    const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
    const jm = /const JO=\[(.*?)\];return\(e=function/.exec(src);
    if (!jm) throw new Error("decoder table not found");
    let JO = JSON.parse("[" + jm[1] + "]");

    function qWith(arr, n) {
        const s = arr[n - 236];
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
        const idx = [1066, 1659, 396, 436, 1722, 1631, 250, 1569, 638, 794, 1678];
        const v = [];
        for (let i = 0; i < idx.length; i++) v.push(jsInt(qWith(arr, idx[i])));
        for (let i = 0; i < v.length; i++) if (isNaN(v[i])) return NaN;
        return -v[0] / 1 * (v[1] / 2) + v[2] / 3 + -v[3] / 4 * (-v[4] / 5) +
            -v[5] / 6 * (-v[6] / 7) + v[7] / 8 + -v[8] / 9 +
            v[9] / 10 * (-v[10] / 11);
    }

    let rot = -1;
    for (let r = 0; r < JO.length; r++) {
        if (checksum(JO) === 391725) {
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

function comixBuildKey(src, q) {
    const wj = {};
    let m;

    const arrRe = /wj\[wr\((\d+)\)\]=\[([0-9,]*)\]/g;
    while ((m = arrRe.exec(src))) {
        wj[parseInt(m[1], 10)] = m[2].split(",").filter(function (x) { return x !== ""; }).map(Number);
    }

    const strRe = /wj\[wr\((\d+)\)\]=wr\((\d+)\)/g;
    while ((m = strRe.exec(src))) {
        wj[parseInt(m[1], 10)] = q(parseInt(m[2], 10));
    }

    const byName = {};
    const entRe = /const (e\w+)=\{\};\1\.id=wr\((\d+)\),\1\[wr\(1083\)\]=(\d+),\1\[wr\(1634\)\]=(\d+),\1\[wr\(633\)\]=(\d+);/g;
    while ((m = entRe.exec(src))) {
        byName[m[1]] = {
            id: parseInt(m[2], 10),
            offset: parseInt(m[3], 10),
            xor: parseInt(m[4], 10),
            mode: parseInt(m[5], 10)
        };
    }

    const om = /var xj=\[([^\]]+)\];/.exec(src);
    if (!om) throw new Error("key order not found");
    const order = om[1].split(",").map(function (s) { return s.trim(); });

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

    getHeaders(url) {
        const headers = {
            "Accept": "application/json, text/plain, */*",
            "Referer": this.getBaseUrl() + "/",
            "Origin": this.getBaseUrl()
        };
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
                "User-Agent": COMIX_UA,
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
                "User-Agent": COMIX_UA,
                "Accept": "*/*"
            });
            const mainSrc = mainRes.body || "";

            const am = /apicore-[A-Za-z0-9_-]+\.js/.exec(mainSrc);
            if (!am) throw new Error("apicore bundle not found");
            const apiUrl = comixResolveUrl(mainUrl, am[0]);

            const apiRes = await this.client.get(apiUrl, {
                "User-Agent": COMIX_UA,
                "Accept": "*/*"
            });
            const apiSrc = apiRes.body || "";

            const dec = comixMakeDecoder(apiSrc);
            const key = comixBuildKey(apiSrc, dec.q);

            COMIX_SESSION = {
                key: key,
                prefix: dec.q(554),
                apiUrl: apiUrl,
                mainUrl: mainUrl,
                source: "live"
            };
        } catch (e) {
            COMIX_SESSION = {
                key: comixHexToBytes(COMIX_FALLBACK_KEY_HEX),
                prefix: "57y",
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
        if (json.code === "invalid_token" || json.error === "invalid_token") {
            return "Comix rejected the request token. Reopen the source to refresh it.";
        }
        if (json.error && typeof json.error === "object") {
            return "Comix API: " + (json.error.message || JSON.stringify(json.error));
        }
        if (json.error) return "Comix API: " + (json.message || json.error);
        if (json.code && json.code !== "ok") return "Comix API: " + (json.message || json.code);
        if (json.status && json.status !== "ok") return "Comix API: " + (json.message || json.status);
        return "";
    }

    async apiGet(path, params) {
        let session = await this.ensureSession();
        let res = await this.client.get(this.buildApiUrl(path, params, session), this.getHeaders());
        let json = this.parseApiResponse(res, session);

        // A bundle rotation makes every request fail with invalid_token.  Drop
        // the cached key, rediscover it, and try the request exactly once more.
        if (json && (json.code === "invalid_token" || json.error === "invalid_token")) {
            COMIX_SESSION = null;
            session = await this.ensureSession();
            res = await this.client.get(this.buildApiUrl(path, params, session), this.getHeaders());
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

        const j = await this.apiGet("/chapters/" + id, {});
        const items = (j.result && j.result.pages && j.result.pages.items) || [];
        const base = this.getBaseUrl();
        const pages = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i] && items[i].url) pages.push(comixAbsUrl(base, items[i].url));
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
