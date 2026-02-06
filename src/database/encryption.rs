//! Software-level database encryption using AES-256-GCM
//!
//! Provides encryption/decryption for database exports without requiring SQLCipher.
//! This works on all platforms and avoids Windows build issues.

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use sha2::{Digest, Sha256};
use std::error::Error;
use std::fs;
use std::path::Path;

/// Generate encryption key from machine ID
///
/// Same as before but now used for AES encryption
pub fn get_encryption_key() -> Result<[u8; 32], Box<dyn Error>> {
    // Try to get machine UID
    match machine_uid::get() {
        Ok(machine_id) => {
            tracing::debug!("Machine ID obtained for encryption");
            derive_key_from_machine_id(&machine_id)
        }
        Err(e) => {
            tracing::warn!("Could not get machine ID: {}, using fallback", e);
            let fallback = format!(
                "{}-{}",
                whoami::username(),
                whoami::fallible::hostname().unwrap_or_else(|_| "unknown".to_string())
            );
            derive_key_from_string(&fallback)
        }
    }
}

/// Derive 256-bit encryption key from machine ID
fn derive_key_from_machine_id(machine_id: &str) -> Result<[u8; 32], Box<dyn Error>> {
    let app_salt = "netmapper-2026-secure-aes256-gcm";
    let combined = format!("{}-{}", machine_id, app_salt);
    derive_key_from_string(&combined)
}

/// Derive 256-bit key from any string using SHA-256
fn derive_key_from_string(input: &str) -> Result<[u8; 32], Box<dyn Error>> {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();

    let mut key = [0u8; 32];
    key.copy_from_slice(&result);

    Ok(key)
}

/// Encrypt database file using AES-256-GCM
///
/// Creates an encrypted copy of the database with .encrypted extension
pub fn encrypt_database_file<P: AsRef<Path>>(db_path: P) -> Result<String, Box<dyn Error>> {
    let db_path = db_path.as_ref();
    let encrypted_path = db_path.with_extension("db.encrypted");

    tracing::info!("Encrypting database: {:?} -> {:?}", db_path, encrypted_path);

    // Read database file
    let plaintext = fs::read(db_path)?;

    // Generate encryption key
    let key_bytes = get_encryption_key()?;
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    // Generate random nonce (96 bits for GCM)
    let nonce_bytes = generate_nonce();
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Encrypt
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_ref())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Prepend nonce to ciphertext (needed for decryption)
    let mut output = Vec::new();
    output.extend_from_slice(&nonce_bytes);
    output.extend_from_slice(&ciphertext);

    // Write encrypted file
    fs::write(&encrypted_path, output)?;

    tracing::info!(
        "Database encrypted successfully: {} bytes",
        ciphertext.len()
    );

    Ok(encrypted_path.to_string_lossy().to_string())
}

/// Decrypt database file using AES-256-GCM
///
/// Decrypts a .encrypted file back to .db
pub fn decrypt_database_file<P: AsRef<Path>>(encrypted_path: P) -> Result<String, Box<dyn Error>> {
    let encrypted_path = encrypted_path.as_ref();
    let db_path = encrypted_path.with_extension("db");

    tracing::info!("Decrypting database: {:?} -> {:?}", encrypted_path, db_path);

    // Read encrypted file
    let data = fs::read(encrypted_path)?;

    if data.len() < 12 {
        return Err("Invalid encrypted file: too short".into());
    }

    // Extract nonce (first 12 bytes)
    let nonce_bytes = &data[..12];
    let nonce = Nonce::from_slice(nonce_bytes);

    // Extract ciphertext (rest of file)
    let ciphertext = &data[12..];

    // Generate decryption key
    let key_bytes = get_encryption_key()?;
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    // Decrypt
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}. Wrong machine?", e))?;

    // Write decrypted database
    fs::write(&db_path, plaintext)?;

    tracing::info!("Database decrypted successfully");

    Ok(db_path.to_string_lossy().to_string())
}

/// Generate a random 96-bit nonce for AES-GCM
fn generate_nonce() -> [u8; 12] {
    use aes_gcm::aead::rand_core::RngCore;
    let mut nonce = [0u8; 12];
    OsRng.fill_bytes(&mut nonce);
    nonce
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_get_encryption_key() {
        let key = get_encryption_key().expect("Should generate key");
        assert_eq!(key.len(), 32); // 256 bits

        // Same call should return same key
        let key2 = get_encryption_key().expect("Should generate key");
        assert_eq!(key, key2);
    }

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        // Create a test database file
        let test_db = "test_encryption.db";
        let test_data = b"This is a test database with some data";
        fs::write(test_db, test_data).unwrap();

        // Encrypt
        let encrypted_path = encrypt_database_file(test_db).unwrap();
        assert!(Path::new(&encrypted_path).exists());

        // Decrypt
        let decrypted_path = decrypt_database_file(&encrypted_path).unwrap();
        let decrypted_data = fs::read(&decrypted_path).unwrap();

        assert_eq!(test_data.as_ref(), decrypted_data.as_slice());

        // Cleanup
        let _ = fs::remove_file(test_db);
        let _ = fs::remove_file(&encrypted_path);
        let _ = fs::remove_file(&decrypted_path);
    }
}
