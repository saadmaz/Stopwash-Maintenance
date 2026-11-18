<a id="top"></a>

<div align="center">

<img src=".github/assets/changelog.svg" alt="STOPWASH: Changelog" width="100%">

<br/>

<p><strong>Every notable change to this project, newest first.</strong></p>

<a href="README.md"><img alt="README" src="https://img.shields.io/badge/README-374151?style=for-the-badge&labelColor=111827"></a>
<a href="CONTRIBUTING.md"><img alt="Contributing" src="https://img.shields.io/badge/Contributing-374151?style=for-the-badge&labelColor=111827"></a>
<a href="CODE_OF_CONDUCT.md"><img alt="Code of Conduct" src="https://img.shields.io/badge/Code%20of%20Conduct-374151?style=for-the-badge&labelColor=111827"></a>
<a href="SECURITY.md"><img alt="Security" src="https://img.shields.io/badge/Security-374151?style=for-the-badge&labelColor=111827"></a>
<a href="CHANGELOG.md"><img alt="Changelog" src="https://img.shields.io/badge/Changelog-b2e04c?style=for-the-badge&labelColor=111827"></a>
<a href="LICENSE.md"><img alt="License" src="https://img.shields.io/badge/License-374151?style=for-the-badge&labelColor=111827"></a>

</div>

---

<div align="center">

<a href="https://github.com/saadmaz/Stopwash-Maintenance/releases"><img alt="Latest release" src="https://img.shields.io/github/v/release/saadmaz/Stopwash-Maintenance?include_prereleases&style=flat-square&label=latest%20release&labelColor=111827&color=b2e04c"></a>
<a href="https://github.com/saadmaz/Stopwash-Maintenance/compare/main...develop"><img alt="Changes waiting for release" src="https://img.shields.io/github/commits-difference/saadmaz/Stopwash-Maintenance?base=main&head=develop&style=flat-square&label=unreleased%20commits&labelColor=111827&color=374151"></a>

</div>

> [!NOTE]
> The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Each version links to its full comparison at the bottom of this page, and to its [release notes](https://github.com/saadmaz/Stopwash-Maintenance/releases).

## [Unreleased]

## [1.0.0] - 2026-11-18

First versioned release of the stopwash.lk maintenance fallback.

### Added

- Cloudflare Worker `stopwash-maintenance` on the route `*.stopwash.lk/*`, serving a branded 503 maintenance page (JSON for API requests) to unknown subdomains and to apps whose server is down.
- Per-host handling for `stopwash.lk`, `www.stopwash.lk`, `pos`, `accounts`, `euro`, `hr` `.stopwash.lk`.
- The official STOPWASH logo and favicon on the maintenance page, inlined as SVG so nothing is fetched.
- Behaviour tests run with Node.js, with no dependencies.
- Continuous integration on every push and pull request: formatting, tests and a dry-run bundle.
- Deploy workflow that waits for the Cloudflare Workers build of `main` and smoke-tests the live Worker.
- Project governance: proprietary licence, security policy, contribution guidelines, code of conduct, issue forms, pull request template, CODEOWNERS and Dependabot.
- Standard documentation layout shared by every STTPS repository: architecture, configuration, deployment, content, decision records (ADRs) and release and rollback runbooks, indexed in `docs/README.md`.

[Unreleased]: https://github.com/saadmaz/Stopwash-Maintenance/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/saadmaz/Stopwash-Maintenance/releases/tag/v1.0.0
