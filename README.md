<div align="center">
    <a href="https://github.com/Bilgamesh/KeePassage">
        <img src="./res/img/logo.ico" alt="KeePassage Logo" width="80" height="80">
    </a>
    <h1 align="center">KeePassage</h1>
</div>

KeePassage is a free and open-source password manager that uses [age](https://age-encryption.org) and a YubiKey as its cryptographic backend, with a user interface inspired by KeePassXC.

All entries are stored in an encrypted database file protected with XChaCha20-Poly1305 (AEAD). The database encryption key itself is encrypted using age (via [typage](https://github.com/FiloSottile/typage)).

Like [passage](https://github.com/FiloSottile/passage) with [age-plugin-yubikey](https://github.com/str4d/age-plugin-yubikey), KeePassage uses public-key encryption with hardware-backed decryption provided by a YubiKey. Age encryption works by encrypting data with a public key and decrypting it with the corresponding private key - in this case, stored on a YubiKey and requiring both a PIN and physical touch to authorize decryption.

After unlocking the database, all entry metadata (URLs, usernames, notes) becomes available, while the secret password for each entry remains individually encrypted with age.

# Screenshots

<div align="center">
    <img src="./screenshots/screenshot_1.jpg" width=400>
    <img src="./screenshots/screenshot_2.jpg" width=400>
</div>

# Development

#### Prerequisites
- Node.js 22

```powershell
# install dependencies
npm install
```

```powershell
# run in dev mode
npm run dev
```

```powershell
# build binary
npm run release
```

# License

This project is licensed under the terms of [GPL v3.0 license](./LICENSE), except for UI [renderer](./src/renderer/) and [pcsc-daemon](./src/pcsc-daemon/) which are licensed under the terms of [MIT license](./src/renderer/LICENSE).
