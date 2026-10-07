# Changelog

## [1.0.1](https://github.com/usesvelte/inline-svg/compare/v1.0.0...v1.0.1) (2026-10-07)

### 🐛 Bug Fixes

* **core:** handle comments, prologs and quoted > characters when parsing svg markup ([f02b6d8](https://github.com/usesvelte/inline-svg/commit/f02b6d8d7b078fee5d49ef367629b41226386327))
* **core:** parse the svgs at build time so the server and the client render the same markup ([943e142](https://github.com/usesvelte/inline-svg/commit/943e1427f9d113f6395e0fc12f8d442dbda9b0f0))
* **core:** return a fresh empty icon and warn only once per name ([70b0782](https://github.com/usesvelte/inline-svg/commit/70b078277fa0feee071374d39c4026f34dd5bedb))
* **pkg:** add a default condition to the InlineSvg.svelte export ([68b8566](https://github.com/usesvelte/inline-svg/commit/68b856602b7b23bce3d76ffde168b86916b720fa))
* **vite:** match svg files case-insensitively and follow symlinked icons ([95f66ce](https://github.com/usesvelte/inline-svg/commit/95f66ce4aa27bdd79090aad582fad725a83c2592))
* **vite:** pick up added and removed svgs while vite build --watch is running ([36e7212](https://github.com/usesvelte/inline-svg/commit/36e7212e68fba36b23b1c6c35308bb92da0c7b1e))
* **vite:** refresh the icons module on windows by normalizing the file path ([2ec9263](https://github.com/usesvelte/inline-svg/commit/2ec926357fea102d4f786e1e513220999df3f96e))
* **vite:** warn instead of throwing when the dir option points to a file ([c46e116](https://github.com/usesvelte/inline-svg/commit/c46e116e8f476fdd190b6412b9174bc52e0b3d5b))

### 📚 Documentation

* document the missing icon behaviour, the icon naming rules and the plugin options ([1a0d529](https://github.com/usesvelte/inline-svg/commit/1a0d52911e5cecaae3f9bda18c5b8c15958f8dff))

### 📝 Tests

* cover the InlineSvg rendering, its forwarded props and its hydration ([45b1afb](https://github.com/usesvelte/inline-svg/commit/45b1afb0e2fc0a52e4f504ef5cbfb08f59f42b23))
* initialize the mock factory imports before the component modules ([0a6c8e6](https://github.com/usesvelte/inline-svg/commit/0a6c8e6cee04b2cdf8775891c71adce1e66f35eb))

### 🚜 Code Refactoring

* config the EOF to `lf` ([b2dae6b](https://github.com/usesvelte/inline-svg/commit/b2dae6bd79709ab88a5cd06f8afbbe8165f2ba03))

### ⚙️ Continuous Integration

* pin actions to commit SHAs ([620772b](https://github.com/usesvelte/inline-svg/commit/620772bbbba65a9dce48cb54fb78900f1278ec3f))
* run the checks before staging a release and restrict workflow permissions ([7c74b81](https://github.com/usesvelte/inline-svg/commit/7c74b81326fb56b7abcbd8c6d1b3415eb30e590e))

## [1.0.0](https://github.com/usesvelte/inline-svg/compare/v0.5.0...v1.0.0) (2026-09-29)

### ⚠ BREAKING CHANGES

* **core:** uses TypeScript directly and support SSR

### ✨ Features

* add a vite plugin that inlines the svgs ([7576e46](https://github.com/usesvelte/inline-svg/commit/7576e462efdc49f777ef0d74e25a7168932b943d))
* **core:** uses TypeScript directly and support SSR ([4b5d9f7](https://github.com/usesvelte/inline-svg/commit/4b5d9f7be91f6df0131af4159f0c9c35d7f71a74))

### 📚 Documentation

* document plugin setup & update LICENSE ([9d8d95b](https://github.com/usesvelte/inline-svg/commit/9d8d95b4694d5a4483665bd5c3e2fdf5f59a8ee3))

### 📝 Tests

* cover the svg parser and the vite plugin ([37406ee](https://github.com/usesvelte/inline-svg/commit/37406eeb5f7406f4110230de413f6ccea48edcd2))

### 🚜 Code Refactoring

* add release & changelog command updater ([d969d5d](https://github.com/usesvelte/inline-svg/commit/d969d5db2f6a81442d442fb85a93b5c1d5d0ac46))

### ⚙️ Continuous Integration

* **deps:** update action dependencies ([f9974e0](https://github.com/usesvelte/inline-svg/commit/f9974e01025cedbfe6c4957a18752237bf423268))
* run the checks and validate the types of the tarball ([bd885b6](https://github.com/usesvelte/inline-svg/commit/bd885b6e4c1f33a1d840d415386df28a0c9e7786))

### Miscellaneous Tasks

* **deps:** update dependencies ([e9e1206](https://github.com/usesvelte/inline-svg/commit/e9e12069197261ed82cb5914573934789ab16ce1))
* update eslint & prettier config ([ad1a444](https://github.com/usesvelte/inline-svg/commit/ad1a44462afd89296a4533dc2e9adbbd3b8b43c6))
