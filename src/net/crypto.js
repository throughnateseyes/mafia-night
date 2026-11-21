/*
 * End-to-end encryption for the relay. The relay (a free public MQTT broker)
 * only ever sees ciphertext.
 *
 * - Room key (rk): in the join QR's URL fragment (never sent to any server).
 *   Seals public game state and join requests.
 * - Narrator key (nk): only in the narrator QR. Seals commands and the secret state,
 *   so a player can't forge narrator actions or read the role list.
 * - Each player's role is sealed with an ECDH key shared between that player's phone
 *   and the host, so players can't read each other's roles even with the room key.
 */
const te = new TextEncoder();
const td = new TextDecoder();

export const b64u = {
  enc(bytes) {
    let s = '';
    for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  dec(str) {
    const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  },
};

export function randomId(len = 10) {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  const buf = crypto.getRandomValues(new Uint8Array(len));
  return [...buf].map((b) => alphabet[b % alphabet.length]).join('');
}

export const randomKey = (bytes = 16) => b64u.enc(crypto.getRandomValues(new Uint8Array(bytes)));

const keyCache = new Map();
export async function aesKey(b64) {
  if (!keyCache.has(b64)) {
    keyCache.set(b64, crypto.subtle.importKey('raw', b64u.dec(b64), 'AES-GCM', false, ['encrypt', 'decrypt']));
  }
  return keyCache.get(b64);
}

/** Encrypt any JSON value. `key` is a CryptoKey or a base64url raw key. */
export async function seal(key, value) {
  const k = typeof key === 'string' ? await aesKey(key) : key;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, te.encode(JSON.stringify(value)));
  const out = new Uint8Array(12 + ct.byteLength);
  out.set(iv);
  out.set(new Uint8Array(ct), 12);
  return b64u.enc(out);
}

/** Decrypt; returns null for anything that isn't ours (wrong key, junk, empty). */
export async function open(key, text) {
  if (!text) return null;
  try {
    const k = typeof key === 'string' ? await aesKey(key) : key;
    const bytes = b64u.dec(text);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, k, bytes.slice(12));
    return JSON.parse(td.decode(pt));
  } catch {
    return null;
  }
}

const ECDH = { name: 'ECDH', namedCurve: 'P-256' };

export async function ecdhPair() {
  const pair = await crypto.subtle.generateKey(ECDH, true, ['deriveKey']);
  return {
    pub: b64u.enc(await crypto.subtle.exportKey('raw', pair.publicKey)),
    priv: await crypto.subtle.exportKey('jwk', pair.privateKey),
  };
}

const sharedCache = new Map();
/** AES key shared between my private key (JWK) and their public key (base64url raw). */
export async function sharedKey(privJwk, theirPub) {
  const id = `${privJwk.d}|${theirPub}`;
  if (!sharedCache.has(id)) {
    sharedCache.set(
      id,
      (async () => {
        const priv = await crypto.subtle.importKey('jwk', privJwk, ECDH, false, ['deriveKey']);
        const pub = await crypto.subtle.importKey('raw', b64u.dec(theirPub), ECDH, false, []);
        return crypto.subtle.deriveKey({ name: 'ECDH', public: pub }, priv, { name: 'AES-GCM', length: 128 }, false, ['encrypt', 'decrypt']);
      })(),
    );
  }
  return sharedCache.get(id);
}
