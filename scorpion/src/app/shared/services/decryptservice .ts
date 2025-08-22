import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class DecryptService {
encrypt(strPlain: string, strKey: string): string {
    try {
      // Hash key using MD5 (same as C# MD5CryptoServiceProvider)
      const md5Key = CryptoJS.MD5(CryptoJS.enc.Utf8.parse(strKey));

      // Encrypt using TripleDES in ECB mode
      const encrypted = CryptoJS.TripleDES.encrypt(
        CryptoJS.enc.Utf8.parse(strPlain),
        md5Key,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      return encrypted.toString(); // Base64 string (same as C# Convert.ToBase64String)
    } catch (e: any) {
      return 'Encryption failed: ' + e.message;
    }
  }

  // 🔓 Decrypt (same as your C# Decrypt function)
decrypt(strEncrypted: string, strKey: string): string {
  try {
    // Hash key using MD5 (same as C#)
    const md5Key = CryptoJS.MD5(CryptoJS.enc.Utf8.parse(strKey));

    // Create CipherParams from Base64 string
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(strEncrypted)
    });

    // Decrypt using TripleDES
    const decrypted = CryptoJS.TripleDES.decrypt(
      cipherParams,
      md5Key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return CryptoJS.enc.Utf8.stringify(decrypted);
  } catch (e: any) {
    return 'Wrong Input. ' + e.message;
  }
}

}
