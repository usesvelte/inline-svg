# Changelog

## [1.2.1](https://github.com/usesvelte/inline-svg/compare/v1.2.0...v1.2.1) (2026-11-24)

### 🐛 Bug Fixes

* **core:** ignore inherited icon names and warning keys ([f77412a](https://github.com/usesvelte/inline-svg/commit/f77412adfc50c19e14374808adba00330d9bba55))
* **core:** reject markup after a self-closing svg root ([dfbed3d](https://github.com/usesvelte/inline-svg/commit/dfbed3d82e5c4d98230b96d867a9ac6a3e49a6b2))
* **pkg:** align the declared typescript range with the emitted declarations ([9e024dd](https://github.com/usesvelte/inline-svg/commit/9e024ddf739690681537dc9ee3c51da2674b2cd4))
* **vite:** guard the watch change hook on vite 5 ([e4615da](https://github.com/usesvelte/inline-svg/commit/e4615da0e0b9909ac9512219a1aed960fddd25e3))

### 📝 Tests

* **astro:** stop mutating the fixture config in the e2e check ([a71a56b](https://github.com/usesvelte/inline-svg/commit/a71a56b6050e952ea274fce970eecce579cb1bc2))
* skip the case-collision check on case-insensitive filesystems ([f955e33](https://github.com/usesvelte/inline-svg/commit/f955e3390b16b5efb90495ade12a6c0b17d9d046))

### Miscellaneous Tasks

* **deps:** bump `release-it` version to 21.1.3 ([ede4cbb](https://github.com/usesvelte/inline-svg/commit/ede4cbb628a95e90f06d759fbb96fc82a1d75a7c))

## [1.2.0](https://github.com/usesvelte/inline-svg/compare/v1.1.0...v1.2.0) (2026-11-21)

### ✨ Features

* **astro:** add the integration and its public export ([b58ee88](https://github.com/usesvelte/inline-svg/commit/b58ee888f6922bc6ecb50204ff3bb0bba9a5c6f1))

### 📚 Documentation

* document the Astro integration and fix the virtual module id ([6ddb3f3](https://github.com/usesvelte/inline-svg/commit/6ddb3f315f5397bdef46a7a1106f767dd4476975))

### 📝 Tests

* **astro:** automate the fixture end-to-end check in CI ([cc69ff0](https://github.com/usesvelte/inline-svg/commit/cc69ff081c548d54caaaee7cce477cee85c598ec))

### ⚙️ Continuous Integration

* **deps:** update workflows dependencies ([0758bc9](https://github.com/usesvelte/inline-svg/commit/0758bc9155eb7ede516af481b03ca1195676ff41))

### Miscellaneous Tasks

* **deps:** update dependencies ([c4404ec](https://github.com/usesvelte/inline-svg/commit/c4404ec3c7153cb01c0000f0dcd6d49b75ddb919))

## [1.1.0](https://github.com/usesvelte/inline-svg/compare/v1.0.1...v1.1.0) (2026-10-17)

### ✨ Features

* **vite:** generate the icon names declaration file from the icons directory ([9f9615d](https://github.com/usesvelte/inline-svg/commit/9f9615d8dc96e8aeeb517ec8b9fe8350b00d9fab))

### 📚 Documentation

* document the typed icon names ([0651f7a](https://github.com/usesvelte/inline-svg/commit/0651f7a3a5d4aa43191aa4b058ce7d782c979e8d))

### 🚜 Code Refactoring

* **core:** rename the icons virtual module to `virtual:usesvelte/inline-svg` ([6ac4450](https://github.com/usesvelte/inline-svg/commit/6ac44509c11e72621c9389df5bd564ec105dbd99))

### Miscellaneous Tasks

* **deps:** update dependencies ([e553852](https://github.com/usesvelte/inline-svg/commit/e553852f66e047f9acd3225736a0287916786fc2))

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
