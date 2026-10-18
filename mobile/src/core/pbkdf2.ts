/**
 * Pure JavaScript PBKDF2-HMAC-SHA256 Implementation
 * Matches RFC 2898 / RFC 8018 and WebCrypto subtle.deriveBits exactly.
 * Zero external dependencies. Works consistently across Node, Browser, React Native (Hermes & JSC).
 */

function rotr(n: number, x: number): number {
    return (x >>> n) | (x << (32 - n));
}

function ch(x: number, y: number, z: number): number {
    return (x & y) ^ (~x & z);
}

function maj(x: number, y: number, z: number): number {
    return (x & y) ^ (x & z) ^ (y & z);
}

function sigma0(x: number): number {
    return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
}

function sigma1(x: number): number {
    return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
}

function gamma0(x: number): number {
    return rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
}

function gamma1(x: number): number {
    return rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);
}

const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export class SHA256 {
    private h = new Uint32Array(8);
    private buffer = new Uint8Array(64);
    private bufferLength = 0;
    private bytesHashed = 0;
    private W = new Uint32Array(64);

    constructor() {
        this.reset();
    }

    reset(): this {
        this.h[0] = 0x6a09e667;
        this.h[1] = 0xbb67ae85;
        this.h[2] = 0x3c6ef372;
        this.h[3] = 0xa54ff53a;
        this.h[4] = 0x510e527f;
        this.h[5] = 0x9b05688c;
        this.h[6] = 0x1f83d9ab;
        this.h[7] = 0x5be0cd19;
        this.bufferLength = 0;
        this.bytesHashed = 0;
        return this;
    }

    update(data: Uint8Array): this {
        let offset = 0;
        let length = data.length;
        this.bytesHashed += length;

        if (this.bufferLength > 0) {
            const toCopy = Math.min(64 - this.bufferLength, length);
            this.buffer.set(data.subarray(0, toCopy), this.bufferLength);
            this.bufferLength += toCopy;
            offset += toCopy;
            length -= toCopy;

            if (this.bufferLength === 64) {
                this.processBlock(this.buffer, 0);
                this.bufferLength = 0;
            }
        }

        while (length >= 64) {
            this.processBlock(data, offset);
            offset += 64;
            length -= 64;
        }

        if (length > 0) {
            this.buffer.set(data.subarray(offset, offset + length), 0);
            this.bufferLength = length;
        }

        return this;
    }

    private processBlock(data: Uint8Array, offset: number): void {
        const W = this.W;
        for (let i = 0; i < 16; i++) {
            const j = offset + i * 4;
            W[i] = (data[j] << 24) | (data[j + 1] << 16) | (data[j + 2] << 8) | data[j + 3];
        }
        for (let i = 16; i < 64; i++) {
            W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0;
        }

        let a = this.h[0];
        let b = this.h[1];
        let c = this.h[2];
        let d = this.h[3];
        let e = this.h[4];
        let f = this.h[5];
        let g = this.h[6];
        let h = this.h[7];

        for (let i = 0; i < 64; i++) {
            const T1 = (h + sigma1(e) + ch(e, f, g) + K[i] + W[i]) | 0;
            const T2 = (sigma0(a) + maj(a, b, c)) | 0;
            h = g;
            g = f;
            f = e;
            e = (d + T1) | 0;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) | 0;
        }

        this.h[0] = (this.h[0] + a) | 0;
        this.h[1] = (this.h[1] + b) | 0;
        this.h[2] = (this.h[2] + c) | 0;
        this.h[3] = (this.h[3] + d) | 0;
        this.h[4] = (this.h[4] + e) | 0;
        this.h[5] = (this.h[5] + f) | 0;
        this.h[6] = (this.h[6] + g) | 0;
        this.h[7] = (this.h[7] + h) | 0;
    }

    digest(): Uint8Array {
        const totalBits = this.bytesHashed * 8;
        this.buffer[this.bufferLength++] = 0x80;

        if (this.bufferLength > 56) {
            this.buffer.fill(0, this.bufferLength, 64);
            this.processBlock(this.buffer, 0);
            this.bufferLength = 0;
        }

        this.buffer.fill(0, this.bufferLength, 56);
        const view = new DataView(this.buffer.buffer, this.buffer.byteOffset, 64);
        view.setUint32(56, Math.floor(totalBits / 0x100000000), false);
        view.setUint32(60, totalBits >>> 0, false);
        this.processBlock(this.buffer, 0);

        const out = new Uint8Array(32);
        const outView = new DataView(out.buffer);
        for (let i = 0; i < 8; i++) {
            outView.setUint32(i * 4, this.h[i], false);
        }
        return out;
    }
}

export class HMAC_SHA256 {
    private keyInner = new Uint8Array(64);
    private keyOuter = new Uint8Array(64);

    constructor(key: Uint8Array) {
        if (key.length > 64) {
            const h = new SHA256().update(key).digest();
            this.keyInner.set(h);
            this.keyOuter.set(h);
        } else {
            this.keyInner.set(key);
            this.keyOuter.set(key);
        }

        for (let i = 0; i < 64; i++) {
            this.keyInner[i] ^= 0x36;
            this.keyOuter[i] ^= 0x5c;
        }
    }

    digest(message: Uint8Array): Uint8Array {
        const innerHash = new SHA256().update(this.keyInner).update(message).digest();
        return new SHA256().update(this.keyOuter).update(innerHash).digest();
    }
}

/**
 * Standard PBKDF2 with HMAC-SHA256
 */
export function pbkdf2_sha256(
    passwordBytes: Uint8Array,
    saltBytes: Uint8Array,
    iterations: number,
    keyLength: number,
): Uint8Array {
    const hmac = new HMAC_SHA256(passwordBytes);
    const numBlocks = Math.ceil(keyLength / 32);
    const result = new Uint8Array(numBlocks * 32);

    const saltWithBlock = new Uint8Array(saltBytes.length + 4);
    saltWithBlock.set(saltBytes, 0);

    for (let block = 1; block <= numBlocks; block++) {
        saltWithBlock[saltBytes.length] = (block >>> 24) & 0xff;
        saltWithBlock[saltBytes.length + 1] = (block >>> 16) & 0xff;
        saltWithBlock[saltBytes.length + 2] = (block >>> 8) & 0xff;
        saltWithBlock[saltBytes.length + 3] = block & 0xff;

        let U = hmac.digest(saltWithBlock);
        const T = new Uint8Array(U);

        for (let iter = 1; iter < iterations; iter++) {
            U = hmac.digest(U);
            for (let b = 0; b < 32; b++) {
                T[b] ^= U[b];
            }
        }

        result.set(T, (block - 1) * 32);
    }

    return result.slice(0, keyLength);
}
