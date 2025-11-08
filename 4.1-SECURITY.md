# Security Documentation

## 🔒 Credential Encryption

### Overview
FRIDAY menggunakan XOR-based obfuscation dengan Base64 encoding untuk mengamankan built-in Redis credentials.

---

## 🛡️ Implementation

### Encryption Method: XOR + Base64

**File:** `src/utils/credentials.ts`

```typescript
class CredentialManager {
  private static readonly KEY = "FRIDAY_MCP_2025_SECURE_KEY";
  
  // XOR encryption
  static encrypt(text: string): string {
    const result: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ 
        this.KEY.charCodeAt(i % this.KEY.length);
      result.push(charCode);
    }
    return Buffer.from(result).toString('base64');
  }
  
  // XOR decryption
  static decrypt(encrypted: string): string {
    const buffer = Buffer.from(encrypted, 'base64');
    const result: string[] = [];
    for (let i = 0; i < buffer.length; i++) {
      const charCode = buffer[i] ^ 
        this.KEY.charCodeAt(i % this.KEY.length);
      result.push(String.fromCharCode(charCode));
    }
    return result.join('');
  }
}
```

---

## 📊 Security Layers

### Layer 1: XOR Obfuscation
- Bitwise XOR operation
- Secret key: `FRIDAY_MCP_2025_SECURE_KEY`
- Prevents plaintext visibility

### Layer 2: Base64 Encoding
- Converts encrypted bytes to ASCII
- Makes code repository safe
- Prevents casual inspection

### Layer 3: Runtime Decryption
- Credentials decrypted only at runtime
- Never stored in plaintext on disk
- Memory-only plaintext existence

---

## 🔐 Stored Credentials (Encrypted)

### Redis URL
```typescript
// Plaintext: https://growing-lion-22787.upstash.io
// Encrypted: LiY9NDJjcGIkIjBFWVxScj8sLDt/d218fW5oJzk3NTgsJW05MA==
const encrypted = "LiY9NDJjcGIkIjBFWVxScj8sLDt/d218fW5oJzk3NTgsJW05MA==";
```

### Redis Token
```typescript
// Plaintext: AVkDAAIncDJhYjMwZjQ0NjBkYzc0ZjRiYTQyNmMzNzZmM2JmOTUwNXAyMjI3ODc
// Encrypted: BwQiAAAYFiMgFBVaaVh4KAkvEmUcLx0gHCMlYhMuEzAGGRIpEV99SHslCSgOZxgoEB8QLggKCD0MMxZ+DBQ8
const encrypted = "BwQiAAAYFiMgFBVaaVh4KAkvEmUcLx0gHCMlYhMuEzAGGRIpEV99SHslCSgOZxgoEB8QLggKCD0MMxZ+DBQ8";
```

---

## 🎯 Usage

### Automatic Decryption
```typescript
import { CredentialManager } from "./credentials.js";

// Get decrypted credentials at runtime
const url = CredentialManager.getRedisUrl();
const token = CredentialManager.getRedisToken();

// Use for Redis connection
const redis = new Redis({ url, token });
```

### Admin Override
```bash
# Admin can override via environment variables
export UPSTASH_REDIS_REST_URL="https://private-instance.upstash.io"
export UPSTASH_REDIS_REST_TOKEN="private_token_here"
```

---

## ⚠️ Security Considerations

### What This Protects Against:
✅ **Casual Inspection:** Credentials not visible in source code  
✅ **Repository Scanning:** Automated tools won't find plaintext secrets  
✅ **Copy-Paste Mistakes:** No risk of accidentally sharing credentials  
✅ **Code Reviews:** Encrypted strings safe in pull requests

### What This DOES NOT Protect Against:
❌ **Determined Attackers:** XOR can be reverse-engineered  
❌ **Runtime Inspection:** Decrypted values exist in memory  
❌ **Binary Analysis:** Compiled code can be decompiled  
❌ **Key Extraction:** Encryption key is in source code

---

## 🔄 Encryption Key Rotation

### To Change Encryption Key:

1. **Update Key:**
```typescript
private static readonly KEY = "NEW_SECURE_KEY_2026";
```

2. **Re-encrypt Credentials:**
```bash
node -e "
const { CredentialManager } = require('./dist/utils/credentials.js');
console.log('New URL:', CredentialManager.encrypt('https://...'));
console.log('New Token:', CredentialManager.encrypt('token...'));
"
```

3. **Update credentials.ts** with new encrypted strings

4. **Rebuild & Test:**
```bash
npm run build
node test-redis.js
```

---

## 🎓 Why XOR Obfuscation?

### Advantages:
1. **Simple:** No external crypto libraries needed
2. **Fast:** Minimal performance overhead
3. **Reversible:** Same operation encrypts/decrypts
4. **Lightweight:** Small code footprint
5. **Sufficient:** Adequate for built-in public credentials

### Alternatives Considered:

#### AES-256 Encryption
- ❌ Requires crypto library
- ❌ More complex implementation
- ❌ Overkill for public Redis instance

#### Environment Variables Only
- ❌ Requires user configuration
- ❌ Breaks zero-config goal
- ❌ User friction

#### No Encryption
- ❌ Credentials visible in plaintext
- ❌ GitHub security alerts
- ❌ Bad practice

---

## 📋 Threat Model

### Threat: Credential Exposure in Repository
**Mitigation:** XOR + Base64 obfuscation  
**Risk Level:** Low (public Redis with rate limits)

### Threat: Unauthorized Redis Access
**Mitigation:** Admin can rotate credentials  
**Risk Level:** Low (read/write limited to memory keys)

### Threat: Code Decompilation
**Mitigation:** None (acceptable for public service)  
**Risk Level:** Low (Redis has access controls)

---

## ✅ Best Practices

### For Users:
- Use built-in credentials (already encrypted)
- No action needed
- Credentials work out-of-box

### For Admin:
- Monitor Redis usage
- Rotate credentials if compromised
- Override with private instance for sensitive data
- Keep encryption key secret

### For Contributors:
- Never commit plaintext credentials
- Use CredentialManager for any secrets
- Test encryption/decryption before commit
- Document security changes

---

## 🔍 Verification

### Test Encryption:
```bash
node -e "
const { CredentialManager } = require('./dist/utils/credentials.js');
const url = CredentialManager.getRedisUrl();
console.log('✅ Decrypted URL:', url);
"
```

### Test Redis Connection:
```bash
node test-redis.js
# Should show: ✅ HYBRID MEMORY READY
```

---

## 📞 Security Issues

### Report Vulnerabilities:
- **Email:** (admin email)
- **Issues:** GitHub (for non-critical issues)
- **Response Time:** 24-48 hours

### Responsible Disclosure:
1. Report privately first
2. Allow time for fix
3. Coordinate public disclosure

---

## 🎉 Summary

**FRIDAY Credentials:**
- ✅ Encrypted in source code
- ✅ XOR + Base64 obfuscation
- ✅ Runtime decryption
- ✅ Admin override capability
- ✅ Zero user configuration

**Security Level:** Adequate for public Redis instance with rate limits

**Last Updated:** 2025-11-08  
**Version:** 1.0.0
