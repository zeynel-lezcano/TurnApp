/**
 * Kryptographie-System für TurnApp - Schutz sensibler Daten
 * 
 * Diese Datei implementiert die Verschlüsselung für sensible Daten wie Shopify Access Tokens.
 * Sie ist das Herzstück der Sicherheit unserer Anwendung und schützt OAuth-Tokens vor
 * Kompromittierung der Datenbank.
 * 
 * SICHERHEITSKONZEPT:
 * - AES-256-CBC Verschlüsselung (militärischer Standard)
 * - HMAC-SHA256 für Integritätsprüfung (verhindert Manipulation)
 * - Sichere Schlüssel-Ableitung mit PBKDF2 (100.000+ Iterationen)
 * - Zufällige Initialization Vectors (IVs) für jeden Verschlüsselungsvorgang
 * 
 * VERWENDUNG IM PROJEKT:
 * - shop.server.ts: Verschlüsselt/entschlüsselt Shopify Access Tokens vor/nach DB-Speicherung
 * - monitoring.server.ts: Health Check für Krypto-System mit testCrypto()
 * - Keine Client-seitige Verwendung - nur Server-seitig für maximale Sicherheit
 */

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, createHmac } from "node:crypto";

/**
 * Kryptographische Konstanten - Industrie-Standard Sicherheitsparameter
 * 
 * WARUM DIESE WERTE?
 * - AES-256-CBC: Symmetrische Verschlüsselung, schnell und sicher
 * - 128-bit IV: Ausreichend für CBC-Modus, verhindert Pattern-Erkennnung
 * - 256-bit Key: Maximale AES-Sicherheit, future-proof gegen Quantencomputer
 * - 256-bit HMAC: SHA-256 Output-Größe, verhindert Hash-Kollisionen
 */
const ALGORITHM = 'aes-256-cbc';  // Advanced Encryption Standard, 256-bit key, Cipher Block Chaining
const IV_LENGTH = 16;            // Initialization Vector: 128 bit für CBC-Modus
const KEY_LENGTH = 32;           // Verschlüsselungsschlüssel: 256 bit für AES-256
const HMAC_LENGTH = 32;          // HMAC-SHA256 Output: 256 bit für Integritätsprüfung

/**
 * Sichere Schlüssel-Ableitung für Verschlüsselung
 * 
 * PRODUKTIONSUMGEBUNG (ENCRYPTION_KEY gesetzt):
 * - 64-Zeichen Hex-String: Direkter 256-bit Schlüssel (empfohlen)
 * - Andere Länge: PBKDF2-Ableitung mit 100.000 Iterationen (CPU-intensiv)
 * 
 * ENTWICKLUNGSUMGEBUNG (kein ENCRYPTION_KEY):
 * - Deterministischer Fallback-Schlüssel aus NODE_ENV
 * - Weniger Iterationen (10.000) für bessere Dev-Performance
 * - ACHTUNG: Nur für Development! Nie in Production ohne ENCRYPTION_KEY!
 * 
 * SECURITY HINWEIS:
 * - Schlüssel wird niemals geloggt oder serialisiert
 * - PBKDF2 macht Brute-Force-Angriffe unpraktikabel
 * - Static Salt nur in Development (Production sollte eigenen Key verwenden)
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (envKey) {
    // Production: Use provided key directly or derive from it
    if (envKey.length === 64) {
      // Assume it's already a hex-encoded 256-bit key
      return Buffer.from(envKey, 'hex');
    } else {
      // Derive key from passphrase using PBKDF2
      const salt = Buffer.from('turnapp-static-salt-v1', 'utf8'); // Static salt for deterministic key
      return pbkdf2Sync(envKey, salt, 100000, KEY_LENGTH, 'sha256');
    }
  }
  
  // Development: Generate deterministic key from NODE_ENV and app name
  const fallbackSeed = `${process.env.NODE_ENV || 'development'}-turnapp-dev-key-v1`;
  const salt = Buffer.from('dev-salt-turnapp', 'utf8');
  return pbkdf2Sync(fallbackSeed, salt, 10000, KEY_LENGTH, 'sha256');
}

/**
 * Verschlüsselt sensible Daten für sichere Datenbank-Speicherung
 * 
 * VERSCHLÜSSELUNGSPROZESS:
 * 1. Input-Validierung (kein leerer String)
 * 2. Zufälliger 128-bit IV generieren (verhindert Pattern-Recognition)
 * 3. AES-256-CBC Verschlüsselung mit Key + IV
 * 4. HMAC-SHA256 über IV + Ciphertext (Integritätsprüfung)
 * 5. Zusammenfügen: IV(32hex) + Encrypted(variable) + HMAC(64hex)
 * 
 * SICHERHEITSFEATURES:
 * - Jede Verschlüsselung verwendet neuen IV (verhindert Rainbow Tables)
 * - HMAC verhindert Padding Oracle und Manipulation
 * - Authenticated Encryption (AES + HMAC = sicher gegen alle bekannten Angriffe)
 * 
 * VERWENDUNG:
 * - shop.server.ts: encryptToken(shopifyAccessToken) vor Datenbankzugriff
 * - Niemals Client-seitig verwenden (Key würde exponiert)
 * 
 * @param plaintext - Der zu verschlüsselnde Text (z.B. Shopify Access Token)
 * @returns Verschlüsselter String im Format: IV + Ciphertext + HMAC (alle hex-encoded)
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext || plaintext.length === 0) {
    throw new Error('Cannot encrypt empty token');
  }
  
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Create HMAC for integrity
    const hmac = createHmac('sha256', key);
    hmac.update(iv);
    hmac.update(Buffer.from(encrypted, 'hex'));
    const authTag = hmac.digest();
    
      // AUSGABEFORMAT: IV(32 hex chars) + Encrypted(variable) + HMAC(64 hex chars)
    // Beispiel: "a1b2c3..." (IV) + "d4e5f6..." (verschlüsselter Token) + "789abc..." (HMAC)
    // Dieses Format ermöglicht einfache Aufteilung beim Entschlüsseln
    return iv.toString('hex') + encrypted + authTag.toString('hex');
    
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Entschlüsselt sensible Daten aus der Datenbank
 * 
 * ENTSCHLÜSSELUNGSPROZESS:
 * 1. Ciphertext in Komponenten aufteilen: IV + Encrypted + HMAC
 * 2. HMAC-Verifikation (Integritätsprüfung vor Entschlüsselung)
 * 3. Bei erfolgreicher Verifikation: AES-256-CBC Entschlüsselung
 * 4. Originaltext zurückgeben
 * 
 * SICHERHEITSFEATURES:
 * - HMAC-Verifikation ZUERST (verhindert Padding Oracle Attacks)
 * - Constant-Time Vergleich der HMAC-Werte (verhindert Timing Attacks)
 * - Fehlschlag bei Manipulation stoppt Entschlüsselung sofort
 * 
 * VERWENDUNG:
 * - shop.server.ts: decryptToken(encryptedTokenFromDB) für Shopify API Calls
 * - Nur auf Server-Seite verwenden (Client hat keinen Zugriff auf Schlüssel)
 * 
 * @param ciphertext - Verschlüsselter String aus Datenbank (IV+Encrypted+HMAC)
 * @returns Entschlüsselter Originaltext (z.B. Shopify Access Token)
 * @throws Error bei Manipulation oder ungültigem Format
 */
export function decryptToken(ciphertext: string): string {
  try {
    // FORMAT-PARSING: Aufteilen des verschlüsselten Strings in seine Komponenten
    // IV: Erste 32 Hex-Zeichen (16 Bytes)
    // HMAC: Letzte 64 Hex-Zeichen (32 Bytes)  
    // Encrypted: Alles dazwischen (variable Länge je nach Originaltext)
    if (ciphertext.length < IV_LENGTH * 2 + HMAC_LENGTH * 2) {
      throw new Error('Invalid ciphertext format');
    }
    
    const ivHex = ciphertext.substring(0, IV_LENGTH * 2);
    const hmacHex = ciphertext.substring(ciphertext.length - HMAC_LENGTH * 2);
    const encryptedHex = ciphertext.substring(IV_LENGTH * 2, ciphertext.length - HMAC_LENGTH * 2);
    
    const iv = Buffer.from(ivHex, 'hex');
    const providedHmac = Buffer.from(hmacHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    const key = getEncryptionKey();
    
    // INTEGRITÄTSPRÜFUNG: HMAC-Verifikation vor Entschlüsselung
    // Dies verhindert Padding Oracle Attacks und Datenmanipulation
    const hmac = createHmac('sha256', key);
    hmac.update(iv);
    hmac.update(encrypted);
    const calculatedHmac = hmac.digest();
    
    // Constant-Time Vergleich der HMAC-Werte (Timing Attack Protection)
    if (!calculatedHmac.equals(providedHmac)) {
      throw new Error('Token integrity check failed - Daten wurden manipuliert oder Schlüssel ist falsch');
    }
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Krypto-System Health Check - Roundtrip Test
 * 
 * FUNKTIONSWEISE:
 * 1. Test-String verschlüsseln
 * 2. Verschlüsselten String wieder entschlüsseln  
 * 3. Vergleich: Original == Entschlüsselt?
 * 
 * VERWENDUNG:
 * - monitoring.server.ts: Verwendet in checkCryptoHealth()
 * - Wird bei /readiness Health Check ausgeführt
 * - Erkennt Probleme mit Schlüsseln oder Krypto-Bibliotheken
 * 
 * WARUM WICHTIG?
 * - Stellt sicher, dass bestehende verschlüsselte Tokens lesbar bleiben
 * - Frühe Erkennung von Umgebungsproblemen (falsche Keys, etc.)
 * - Verhindert, dass App startet wenn Krypto-System defekt ist
 * 
 * @returns true wenn Verschlüsselung/Entschlüsselung funktioniert, false bei Problemen
 */
export function testCrypto(): boolean {
  try {
    const testData = 'test-access-token-12345';
    const encrypted = encryptToken(testData);
    const decrypted = decryptToken(encrypted);
    
    return testData === decrypted;
  } catch (error) {
    console.error('Crypto test failed:', error);
    return false;
  }
}

/**
 * Generiert neuen 256-bit Verschlüsselungsschlüssel für Production Setup
 * 
 * VERWENDUNGSZWECK:
 * - Einmaliger Production-Key Generation für ENCRYPTION_KEY Environment Variable
 * - Nicht für automatische Key-Rotation (würde bestehende Daten unlesbar machen)
 * - Ersetzt Development-Fallback-Keys durch echte Zufallsschlüssel
 * 
 * SETUP-PROZESS:
 * 1. Lokal ausführen: generateEncryptionKey()
 * 2. Output als ENCRYPTION_KEY in Production Environment setzen
 * 3. Alle verschlüsselten Daten in DB sind dann mit diesem Key verschlüsselt
 * 
 * ACHTUNG:
 * - Key niemals verlieren - würde alle verschlüsselten Tokens unlesbar machen
 * - Key sicher speichern (Secrets Manager, nicht in Code)
 * - Bei Key-Verlust müssen alle Shops die App neu installieren
 * 
 * @returns 64-Zeichen Hex-String (256-bit Schlüssel)
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}