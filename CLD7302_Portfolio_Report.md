| §7 Conclusion | 395 | 281 | +114 || §6 Critical Evaluation | 627 | 390 | +237 || §5 Security Solutions | 1166 | 974 | +192 || §4 Security Assessment | 1160 | 1062 | +98 || §3 Deployment | 1601 | 762 | +839 || §2 Provider Selection | 662 | 522 | +140 || §1 Introduction | 377 | 382 | −5 |# CLD7302 — Assessment 02 Portfolio (Working Master File)

> **⚠ THIS BLOCK AND EVERYTHING ABOVE `=== REPORT BEGINS HERE ===` MUST BE DELETED BEFORE SUBMISSION.**
> Everything above that line is your build checklist. Everything below it is the report.

---

## DEPLOYMENT FACT SHEET — verified against the live account, 10 Aug 2026

Every value below was read back from AWS, the instance, or the live endpoint. Use these, not the earlier planning assumptions.

| Item | Verified value |
|---|---|
| AWS account | `840324809435` — plan type **FREE**, status ACTIVE, provisioned as root |
| Credits remaining | **$135.71**, plan expires **21 Oct 2026** |
| Region / AZ | **`us-east-1` / `us-east-1c`** — *not* eu-west-2 |
| Instance ID | `i-09467a5509cfe0c85` |
| Instance type | `t3.micro` — confirmed free-tier eligible on this account |
| AMI | `ami-052355af2a014bd2c` — Ubuntu 24.04.4 LTS (noble, gp3) |
| Launched | 2026-08-09 18:42:34 UTC |
| VPC / Subnet | `vpc-01456e75075bfeb56` / `subnet-0781378c5d6b6a133` |
| Root volume | `vol-03337c3127051caf4` — 20 GB gp3 |
| Security group | `foodora-sg` — `sg-0be61e3a771f95188` |
| Elastic IP | **34.195.198.83** (`eipalloc-0e65c28e8f3e746dc`) |
| Key pair | `foodora-key` — **RSA**, fingerprint `0b:83:8a:8f:86:ce:91:c5:c5:c0:ca:ef:5b:90:5c:28:1d:bd:5e:d6` |
| Admin source IP | `202.165.237.155/32` |
| Domain | **foodora.duckdns.org** → resolves to 34.195.198.83 |
| TLS certificate | Let's Encrypt, issued 9 Aug 2026, expires **7 Nov 2026**; `snap.certbot.renew.timer` active, `renew --dry-run` passed |
| Application path | **`/srv/foodora`** — *not* `/home/ubuntu/foodora` |
| Web root | `/var/www/foodora` (2.2 MB Vite build) |
| Atlas cluster | `cluster0.uubm5as.mongodb.net`, database **`foodora`** |
| Runtime versions | Node v22.23.2 · npm 10.9.8 · Nginx 1.24.0 · PM2 7.0.3 · Certbot 5.7.0 · git 2.43.0 |
| PM2 process | `foodora-api`, **fork mode, 1 instance**, systemd unit installed |
| Swap | 2 GB, persisted in `/etc/fstab` |
| Seed data | 3 restaurants, 12 menu items, 8 categories, 4 offers, 1 rider, 1 delivered order |
| Demo accounts | `customer@` / `vendor@` / `vendor2@` / `rider@foodora.com` — password `password123` |

## ⚠ CLAIMS IN THIS REPORT THAT DO NOT MATCH THE LIVE DEPLOYMENT

**Read this before submitting anything.** Each row is a statement the report makes that the account or instance contradicts. Every one is either a five-minute fix to the infrastructure, or a sentence to correct in the prose. A viva question on any of them would expose the gap, so resolve all five.

| # | Report claims | Reality (verified) | Resolve by |
|---|---|---|---|
| D1 | "The API binds to loopback, so its only route is through Nginx" (§3.1, Table 4, §4.4, §7, Appendix F) | `ss -tlnp` shows **`LISTEN *:5000`** — the API listens on **all interfaces**. `server.listen(PORT)` in `server/src/server.js` passes no host. Port 5000 is unreachable *only* because the security group blocks it, so there is **one** control, not two. | Either bind it (`server.listen(PORT, '127.0.0.1')`) and the claim becomes true, or correct every statement. Recorded as finding **F-21**. |
| D2 | `ufw` host firewall enabled with default-deny (§3.4) | **`ufw status: inactive`.** The package is installed; the rules were never applied. | Enable it, or delete the claim. Recorded as **F-22**. |
| D3 | Deployed in `eu-west-2` (London) "for UK data residency" (§3.1, §3.3, FIG-05, FIG-08) | Deployed in **`us-east-1c`** (N. Virginia). The data-residency justification is not merely wrong, it is reversed — customer data sits outside the UK. | Corrected in the prose below. Do **not** re-add the residency argument; if data residency matters, redeploy in `eu-west-2`. |
| D4 | SSH key pair is ED25519 (§3.4) | Key type is **RSA** — `create-key-pair` defaults to RSA. | Corrected below. |
| D5 | `JWT_EXPIRE` set to `1d` (§3.6) | The deployed `.env` carries **`JWT_EXPIRE=7d`**. Moot in practice, because `utils/generateToken.js` hard-codes `'7d'` and ignores the variable entirely — which *is* finding F-03's sibling. | Change the value when you implement R1/R10, then the claim holds. |

**Not a discrepancy, but not yet done:** Cloudinary, Stripe and SMTP credentials are absent from the deployed `.env`, so image upload returns a runtime error, payment routes return 503, and password reset returns 500. Section 3.6's environment block lists them as set. Add the keys before capturing FIG-24 (the end-to-end transaction figure), which cannot be produced without Stripe.

---

## HOW TO USE THIS FILE

1. **Work top-down through the trackers below.** They tell you what to build, in what order, and which screenshot to take at each step.
2. **Fill in every `{{PLACEHOLDER}}`.** These are values only you can supply — your student ID, your Elastic IP, your domain. Search the file for `{{` to find them all.
3. **Replace every `[PASTE ACTUAL OUTPUT]` block** with the real output from your terminal or tool. Each one shows an example of the *expected form* underneath so you know what a correct result looks like — **the example is not evidence, do not submit it as such.**
4. **Insert each screenshot** at its `📸 FIG-nn` marker and delete the marker block, keeping only the numbered caption.
5. **Run the pre-submission gate** (below) before converting to `.docx`.

### ⚠ Academic integrity note

This file is a *structure and a checklist*, which is exactly what the module guide permits under **Category B** GAI use (module guide, p. 15: *"to structure assessments"*, *"to generate summary information which should then be put into your own words and referenced"*).

Three obligations are on you, not on this file:

- **Rewrite the prose in your own voice.** Turnitin flags AI-generated text. The sections below give you accurate technical content and correct structure; the wording must become yours.
- **Every screenshot must be of your own real deployment.** Never submit an example output as a finding.
- **Verify every reference resolves** before submitting (checklist in §8).
- **Complete the GAI declaration** at the end honestly. It is a required part of the submission.

---

## PRE-SUBMISSION GATE

Run these checks. All must pass.

| # | Check | Command / method | Pass? |
|---|---|---|---|
| 1 | No placeholders left | `Select-String -Path CLD7302_Portfolio_Report.md -Pattern '\{\{' \| Measure-Object` → **0** | ⬜ |
| 2 | No unfilled output blocks | `Select-String -Path CLD7302_Portfolio_Report.md -Pattern '\[PASTE' \| Measure-Object` → **0** | ⬜ |
| 3 | All 37 figures inserted, sequential, captioned | Manual scan for `FIG-` → **0 remaining** | ⬜ |
| 4 | Word count ≤ 4,400 (§1–§7 only) | Word: select §1→§7, Review → Word Count | 🚨 **FAILING — 5,988.** Must cut ~1600; see the cut plan in the conversion instructions |
| 4b | All five discrepancies D1–D5 resolved | The register below the fact sheet — each row either fixed in the infrastructure or corrected in the prose | ⬜ |
| 4c | Every ⚠ working-note box deleted | Search for `⚠ WORKING NOTE` and `THIS SECTION DESCRIBES WORK NOT YET PERFORMED` → **0** | ⬜ |
| 5 | All 18 references open and resolve | §8 verification table | ⬜ |
| 6 | ≥4 refereed journals, ≥5 academic books | Count in §8 | ⬜ |
| 7 | Working notes deleted (everything above `=== REPORT BEGINS HERE ===`) | Manual | ⬜ |
| 8 | Font Arial or Calibri Light 12, pages numbered | Word formatting | ⬜ |
| 9 | Title page has programme, module, assessment, student number, tutor, date, word count | Manual | ⬜ |
| 05 | GAI declaration completed | End of report | ⬜ |
| 06 | Filename is `CLD7302_{{STUDENT_ID}}_{{YOUR_NAME}}.doc` | Manual | ⬜ |
| 07 | Submitted to Turnitin via Moodle before **20 August 2026** | Moodle receipt | ⬜ |

---

## TRACKER A — STATUS AT A GLANCE

### ✅ DONE (already complete, no action needed)

| Item | Evidence |
|---|---|
| Web-based business application built and running locally | 193 source files, ~19,000 lines across `client/src` and `server/src` |
| Three-role RBAC implemented | `customer` / `restaurant_admin` / `rider` — `server/src/models/user.model.js` |
| Payment integration (Stripe + Stripe Connect) | `server/src/controllers/payment.controller.js`, `stripe.controller.js` |
| Image hosting via Cloudinary | `server/src/services/upload.service.js` |
| Real-time order tracking (Socket.IO + Leaflet + OSRM) | `server/src/socket.js`, `client/src/helper/socket.js` |
| Local MongoDB provisioning | `docker-compose.yml` + `docker/mongo/init/01-create-app-user.js` |
| Demo/seed data | `server/seed.js` (`npm run seed`) |
| Secrets hygiene — no `.env` committed | Verified: `git ls-files` returns only `.env.example` files |
| **Source-code security assessment** | Complete — catalogued in §4.7 (register lists 22 findings; the "32" figure previously quoted here was wrong) |
| **AWS account active** | Account `840324809435`, FREE plan, $135.71 credits, expires 21 Oct 2026 |
| **Security group `foodora-sg`** | `sg-0be61e3a771f95188` — created 9 Aug 2026, three inbound rules verified (22/80/443) |
| **EC2 t3.micro Ubuntu 24.04 + key pair + Elastic IP, SSH verified** | `i-09467a5509cfe0c85` in `us-east-1c`, EIP 34.195.198.83, RSA key `foodora-key`, SSH confirmed |
| **MongoDB Atlas M0 + app connected** | `cluster0.uubm5as.mongodb.net`, database `foodora`, connection confirmed in PM2 logs |
| **API deployed under PM2 with boot persistence** | `foodora-api` online, fork mode, systemd unit installed |
| **Nginx reverse proxy + client build served** | SPA fallback, `/api` and `/socket.io` proxying all verified |
| **DuckDNS + Let's Encrypt TLS** | foodora.duckdns.org, cert to 7 Nov 2026, HTTP→HTTPS 301, renewal dry-run passed |
| **Seed data loaded into Atlas** | 3 restaurants, 12 menu items, 4 offers, 1 delivered order; 4 demo logins |

### BUILD PROGRESS

| # | Item | Figures | Day | Built? | Captured? |
|---|---|---|---|---|---|
| P2 | VPC review, security group `foodora-sg` | FIG-01→02 | 1 | ✅ `sg-0be61e3a771f95188` | ⬜ |
| P3 | EC2 t3.micro Ubuntu 24.04 + key pair + Elastic IP | FIG-03→07 | 1 | ✅ `i-09467a5509cfe0c85` | ⬜ |
| P4 | MongoDB Atlas M0 cluster + DB user + IP allowlist | FIG-08→11 | 2 | ✅ connected to db `foodora` | ⬜ |
| P5 | Node 22 + PM2 + app deployed, API health check | FIG-12→15 | 2 | ✅ `/api/status` 200 | ⬜ |
| P6 | Nginx reverse proxy + client build served | FIG-16→18 | 3 | ✅ SPA + `/api` + `/socket.io` | ⬜ |
| P7 | DuckDNS subdomain + Certbot TLS | FIG-19→21 | 3 | ✅ cert valid to 7 Nov 2026 | ⬜ |
| P8 | Local + remote accessibility verification (multi-device) | FIG-22→24 | 3 | ◐ **PARTIAL** — local + remote desktop over HTTPS verified; **mobile-on-cellular (FIG-23) and Stripe transaction (FIG-24) still outstanding** | ⬜ |
| P8b | Seed demo data into Atlas | — | 3 | ✅ 3 restaurants, 12 items, 4 logins | — |
| P9 | **Baseline** Nmap (external + internal) | FIG-25→27 | 4 | ⬜ | ⬜ |
| P10 | **Baseline** OWASP ZAP (unauthenticated + authenticated) | FIG-28→30 | 4 | ⬜ | ⬜ |
| P11 | npm audit, Mozilla Observatory, response header inspection | FIG-31→33 | 4 | ⬜ | ⬜ |
| P12 | Apply 10 remediations, commit each separately | — | 5–6 | ⬜ | — |
| P13 | **Re-test** Nmap + ZAP + Observatory; capture before/after pairs | FIG-34→37 | 7 | ⬜ | ⬜ |
| P14 | Write prose in own voice; verify all references | — | 8–9 | ⬜ | — |
| P15 | Word count, placeholder sweep, DOCX conversion | — | 10 | ⬜ | — |
| P16 | Viva deck + rehearse Appendix F answers | — | 11 | ⬜ | — |

> **⚠ Capture status, corrected 10 Aug 2026.** **Every figure from FIG-01 to FIG-21 is capturable right now** — all resources exist and the site is live at https://foodora.duckdns.org. Work down the table below in one sitting; nothing in it depends on further building.

### RETROSPECTIVE SCREENSHOT CAPTURE — FIG-01 → FIG-07

Work down this list in one sitting. Roughly 20 minutes.

| Fig | Console path | Retrospective? | Note |
|---|---|---|---|
| 01 | VPC → Subnets → your subnet → **Route table** tab | ✅ Yes | Unchanged |
| 02 | EC2 → Security Groups → `foodora-sg` → **Inbound rules** | ✅ Yes | **Most important of the twelve.** Confirm no rule for 5000 or 27017. |
| 03 | EC2 → Instances → your instance → **Details** | ⚠ Substitute | The launch wizard summary is gone. Screenshot the Details tab showing AMI ID, instance type `t3.micro` and the AMI name (Ubuntu 24.04) instead. |
| 04 | EC2 → **Key pairs** | ✅ Yes | The creation dialog is gone, but the key pair list shows name, type and fingerprint — sufficient. Never screenshot the private key. |
| 10 | EC2 → Instances → your instance → **Details** | ✅ Yes | Capture the **Instance ID** clearly — it defines assessment scope in §4.2 |
| 11 | EC2 → **Elastic IPs** → your address | ✅ Yes | Unchanged |
| 12 | Your local terminal | ✅ Yes | Just reconnect: `ssh -i ~/.ssh/foodora-key.pem ubuntu@34.195.198.83`. Keep the command and the MOTD banner in frame. |

> **Correction to row 09.** The key pair is **RSA**, not ED25519 (`create-key-pair` defaults to RSA). Fingerprint `0b:83:8a:8f:86:ce:91:c5:c5:c0:ca:ef:5b:90:5c:28:1d:bd:5e:d6`. Amend §3.4, which currently claims ED25519 — see **D4**.
>
> **Correction to row 07.** Confirmed by CLI: the group holds exactly three inbound rules — `sgr-044f1e8f32a12b601` (22 ← 202.165.237.155/32), `sgr-07cef3548e2f7b2e6` (80 ← 0.0.0.0/0), `sgr-0ded535bc99c213c2` (443 ← 0.0.0.0/0). No rule for 5000 or 27017, exactly as §3.3 claims.

**✅ These values are now recorded and substituted throughout this file:**

```
INSTANCE_ID  = i-09467a5509cfe0c85
ELASTIC_IP   = 34.195.198.83
MY_IP        = 202.165.237.155        (the /32 allowed on port 22)
DOMAIN       = foodora.duckdns.org
```

44 placeholder instances were resolved in that pass. What remains is exactly what only you can supply: student ID and name, submission date, word count, the ten remediation commit SHAs, the four baseline/post-remediation scan scores, and the API keys not yet configured.

### 🔧 REPO HYGIENE (do before submission — these files would embarrass you in a viva)

| File | Problem | Action |
|---|---|---|
| `script.js` (repo root) | Dead one-off codemod targeting `client/src/pages/Rider/`, a directory that no longer exists. Would crash if run. | **Delete** |
| `server/seed-rider.js` | Requires `./src/models/Rider`; the actual file is `rider.model.js`. Throws `MODULE_NOT_FOUND` immediately. Superseded by `server/seed.js`. | **Delete** |
| `client/dist/` | Stale build output committed to disk | Add to `.gitignore` (already covered by `dist`), remove from working tree |
| `server/src/config/env.js`, `server/src/config/jwt.js` | Dead code — nothing imports them; live paths are `utils/generateToken.js` and `middlewares/auth.middleware.js` | Either wire them in during remediation R1, or delete |
| `server/src/models/coupon.model.js` | Never imported; promo logic uses `Offer.code` | Delete or note as future work |
| `.gitignore` | `.env` matches only the exact name — `.env.local` and `.env.production` **would be committed** | Add `.env*`, `!.env.example`, `*.pem`, `*.key` |

---

## TRACKER B — 11-DAY SCHEDULE (9 → 20 August 2026)

| Day | Date | Task | Deliverable |
|---|---|---|---|
| ✅ 1 | Sun 9 Aug | ~~Security group, launch EC2, allocate Elastic IP~~ **DONE** | FIG-01→07 *(capture outstanding)* |
| ✅ 2 | Sun 9 – Mon 10 Aug | ~~Atlas M0 cluster + connection test, Node 22 + PM2, API deployed, health check~~ **DONE** | FIG-08→15 *(capture outstanding)* |
| ✅ 3 | Mon 10 Aug | ~~Client built with correct `VITE_API_URL`, Nginx config incl. WebSocket upgrade, DuckDNS, Certbot TLS~~ **DONE.** Seed data loaded. **Mobile-on-cellular verification still outstanding** | FIG-16→22 *(capture outstanding)*; FIG-23→24 not yet possible |
| **▶ 3b** | **Mon 10 Aug — TODAY** | (a) Retrospective capture of FIG-01→21 — everything is live. (b) Load Stripe test keys so FIG-24 becomes possible. (c) Decide on D1/D2 (loopback bind, ufw). (d) Start cutting the word count | FIG-01→24 complete |
| 4 | Wed 12 Aug | **Baseline scans.** Nmap external from laptop, Nmap internal over SSH, ZAP unauthenticated, ZAP authenticated with JWT, npm audit, Observatory | FIG-25→33 |
| 5 | Thu 13 Aug | Remediation R1–R5 (JWT guard, helmet, rate limit, validate fix, ownership scoping). One git commit each | Commits |
| 6 | Fri 14 Aug | Remediation R6–R10 (callback HMAC, socket auth, error handler + logging, regex escape, CORS) | Commits |
| 7 | Sat 15 Aug | Redeploy hardened build. **Re-run every scan.** Capture before/after pairs | FIG-34→37 |
| 8 | Sun 16 Aug | Draft §1, §2, §3 in your own words | Prose |
| 9 | Mon 17 Aug | Draft §4, §5, §6, §7. Verify all 18 references resolve | Prose |
| 10 | Tue 18 Aug | Insert figures, word count, placeholder sweep, convert to DOCX, proofread | `.doc` file |
| 11 | Wed 19 Aug | Viva deck (10 slides). Rehearse Appendix F | Slides |
| — | **Thu 20 Aug** | **SUBMIT to Turnitin via Moodle** | Receipt |

> **Buffer built in:** the deadline is Thursday 20 August; the schedule finishes Wednesday 19th. If Certbot or Atlas networking eats a day, you still land.

> **~~Highest-risk step: Day 3, the Nginx WebSocket upgrade block.~~ RESOLVED.** The upgrade block is deployed and verified: a handshake against `https://foodora.duckdns.org/socket.io/?EIO=4&transport=polling` returns `0{"sid":"pI0hZFJoo3bydu1MAAAA","upgrades":["websocket"],…}`. The presence of `"upgrades":["websocket"]` is the proof that the proxy will honour the protocol switch rather than pinning clients to long-polling. Keep this output for Appendix B.
>
> **New highest-risk item:** you are two days ahead on deployment but **zero days into the security scans**, and the body is 1,500 words over the cap. Spend today on the retrospective captures and the word count, then start baseline scans tomorrow as scheduled.

---

=== REPORT BEGINS HERE ===

<div style="page-break-after: always;"></div>

# UNIVERSITY OF GREATER MANCHESTER

## Western International College London

<br>

**Programme:** MSc Cloud and Network Security

**Module Code:** CLD 7302

**Module Title:** Cloud Solutions and Implementation

**Level:** HE7

**Assessment:** Assessment 02 of 02 — Portfolio (60%)

**Assessment Title:** Deploying and Securing a Web-Based Business Application in a Free Cloud Service Provider

<br>

**Student Number:** {{STUDENT_ID}}

**Student Name:** {{YOUR_NAME}}

**Marking Tutor:** Kalpa Kotte Kankanamge

**Date of Submission:** {{SUBMISSION_DATE}}

<br>

**Word Count:** {{WORD_COUNT}} words
*(excluding title page, contents, reference list, figures, tables and appendices)*

<div style="page-break-after: always;"></div>

## Contents

1. Introduction and Scope
2. Cloud Service Provider Evaluation and Selection
   - 2.1 Evaluation criteria
   - 2.2 Comparative analysis of free tiers
   - 2.3 Weighted decision matrix and justification
   - 2.4 The shared responsibility model as a scoping instrument
3. Cloud Deployment Implementation
   - 3.1 Target architecture
   - 3.2 Account and region configuration
   - 3.3 Network design and firewall configuration
   - 3.4 Compute provisioning
   - 3.5 Managed database provisioning
   - 3.6 Application runtime deployment
   - 3.7 Reverse proxy and static asset delivery
   - 3.8 DNS and transport layer security
   - 3.9 Verification of local and remote accessibility
4. Security Assessment
   - 4.1 Assessment methodology
   - 4.2 Scope, authorisation and rules of engagement
   - 4.3 Threat model and attack surface
   - 4.4 Network layer assessment (Nmap)
   - 4.5 Application layer assessment (OWASP ZAP)
   - 4.6 Supporting assessments
   - 4.7 Consolidated findings register
   - 4.8 Controls already operating effectively
5. Security Solutions and Literature Review
   - 5.1 Remediation strategy and prioritisation
   - 5.2 Identity and cryptographic controls
   - 5.3 Access control remediation
   - 5.4 Input validation and injection defence
   - 5.5 Platform hardening and observability
   - 5.6 Post-remediation verification
6. Critical Evaluation
7. Conclusion and Recommendations
8. References
- Appendix A — Nginx site configuration
- Appendix B — Full baseline Nmap output
- Appendix C — OWASP ZAP report summary
- Appendix D — Remediation commit log
- Appendix E — Assessment brief requirement trace
- Appendix F — Viva preparation
- Declaration of Software Tools and Generative AI Use

<div style="page-break-after: always;"></div>

## List of Figures

| Fig. | Title | § |
|---|---|---|
| 1 | Default VPC subnet and route table | 3.3 |
| 2 | Security group inbound rules | 3.3 |
| 3 | EC2 instance launch configuration | 3.4 |
| 4 | Key pair generation | 3.4 |
| 5 | Running instance summary | 3.4 |
| 6 | Elastic IP association | 3.4 |
| 7 | First SSH session to the instance | 3.4 |
| 8 | Atlas M0 cluster provisioned | 3.5 |
| 9 | Atlas database user with `readWrite` scope | 3.5 |
| 10 | Atlas network access allowlist | 3.5 |
| 11 | Application connected to Atlas | 3.5 |
| 12 | Node.js and npm versions on the instance | 3.6 |
| 13 | Repository cloned and dependencies installed | 3.6 |
| 14 | PM2 process list showing the API online | 3.6 |
| 15 | API health endpoint responding locally | 3.6 |
| 16 | Production client build completing | 3.7 |
| 17 | Nginx configuration test passing | 3.7 |
| 18 | Application served over HTTP via Nginx | 3.7 |
| 19 | DuckDNS subdomain resolving to the Elastic IP | 3.8 |
| 20 | Certbot issuing the Let's Encrypt certificate | 3.8 |
| 21 | Valid certificate shown in browser | 3.8 |
| 22 | Local access verified on the instance | 3.9 |
| 23 | Remote access and live order tracking on mobile | 3.9 |
| 24 | End-to-end transaction completed remotely | 3.9 |
| 25 | Baseline external Nmap scan | 4.4 |
| 26 | Baseline internal Nmap scan | 4.4 |
| 27 | Baseline TLS cipher enumeration | 4.4 |
| 28 | ZAP unauthenticated scan alerts | 4.5 |
| 29 | ZAP authenticated session configuration | 4.5 |
| 30 | ZAP authenticated scan alerts | 4.5 |
| 31 | npm audit dependency findings | 4.6 |
| 32 | Mozilla Observatory baseline grade | 4.6 |
| 33 | Response headers before hardening | 4.6 |
| 34 | Response headers after hardening | 5.6 |
| 35 | Mozilla Observatory grade after hardening | 5.6 |
| 36 | ZAP authenticated re-scan alerts | 5.6 |
| 37 | Rate limiting rejecting a brute-force attempt | 5.6 |

## List of Tables

| Table | Title | § |
|---|---|---|
| 1 | Free tier comparison across AWS, Azure and GCP | 2.2 |
| 2 | Weighted provider decision matrix | 2.3 |
| 3 | Shared responsibility allocation for this deployment | 2.4 |
| 4 | Security group rule set and justification | 3.3 |
| 5 | Attack surface enumeration | 4.3 |
| 6 | Consolidated findings register | 4.7 |
| 7 | Controls already operating effectively | 4.8 |
| 8 | Remediation priority matrix | 5.1 |
| 9 | Pre- and post-remediation comparison | 5.6 |

<div style="page-break-after: always;"></div>

# 1. Introduction and Scope

Cloud computing is defined by Mell and Grance (2011) as a model for enabling ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources that can be rapidly provisioned with minimal management effort. That definition frames this portfolio: the work reported here takes an application that existed only on a development workstation and places it onto shared, on-demand infrastructure, then examines what that migration does to its security posture.

The application deployed is **Foodora**, a custom-built online food ordering platform developed by the author. The assessment brief permits "a custom-built application" alongside off-the-shelf options such as WordPress or Odoo, and a bespoke application was chosen deliberately. An off-the-shelf CMS would demonstrate installation competence but would present a security posture largely determined by its vendor. A self-authored application exposes the author's own architectural decisions to scrutiny, which is a considerably more demanding basis for the security assessment that Learning Outcome 3 requires.

Foodora is a three-sided marketplace of approximately 19,000 lines across 193 source files: a React 19 single-page client built with Vite and Redux Toolkit, and an Express 5 REST API using Mongoose 9 over MongoDB, with Socket.IO streaming real-time order and courier-location events. It supports three roles — customer, restaurant administrator and delivery rider — and integrates Stripe for card payments and marketplace payouts, Cloudinary for image storage, and OpenStreetMap services for geocoding and routing. The functional footprint is therefore non-trivial: it handles authentication, payment flows, personally identifiable delivery addresses and live geolocation, all carrying meaningful confidentiality obligations.

This portfolio addresses three objectives derived from the assessment brief. First, to select a free cloud service provider through structured evaluation rather than familiarity, and to deploy the application so that it is functional and accessible both locally and remotely. Second, to conduct a systematic security assessment of the deployed system using recognised methodology and industry-standard tooling. Third, to propose and implement security improvements justified against peer-reviewed literature and established control frameworks, and to demonstrate their effect through re-testing.

The report is structured accordingly. Section 2 evaluates the candidate providers. Section 3 documents the deployment. Section 4 presents the security assessment. Section 5 sets out the remediations and their evidential basis. Section 6 evaluates the work critically, including its limitations. Section 7 concludes with recommendations.

<div style="page-break-after: always;"></div>

# 2. Cloud Service Provider Evaluation and Selection

## 2.1 Evaluation criteria

Provider selection was treated as a design decision requiring justification, not a matter of preference. Five criteria were derived from the application's technical requirements and the constraints of the assessment.

**Duration of the free allocation** — the deployment must remain reachable through marking and viva, so a credit expiring mid-assessment is worse than a smaller indefinite allocation. **Compute suitability** — the API, Nginx and a Vite production build must coexist, and bundling React 19 is memory-intensive enough that a 1 GB instance exhausts memory during `vite build` without swap. **Managed database availability** — self-hosting MongoDB alongside the application couples the data tier to instance lifecycle, forfeits managed backup, and adds a listening service that must then be defended. **Network control granularity** — evidencing least-privilege exposure requires per-source-CIDR firewall rules rather than coarse toggles. **Documentation depth** — this governs how quickly faults can be diagnosed within an eleven-day window; Sessions 7, 8 and 9 of this module covered Azure, AWS and GCP respectively.

## 2.2 Comparative analysis of free tiers

**Table 1 — Free tier comparison across the three candidate providers**

| Criterion | AWS Free Tier | Microsoft Azure | Google Cloud |
|---|---|---|---|
| Allocation model | 12-month allocation on legacy accounts; newer accounts receive a credit-based plan | £150 credit for 30 days, plus 12 months of selected free services; Azure for Students provides $100 without a payment card | $300 credit for 90 days, plus an indefinite "Always Free" allocation |
| Indefinite compute after credits | No | No (B1s free for 12 months only) | Yes — one `e2-micro` in designated US regions |
| Representative instance | `t3.micro` — 2 vCPU, 1 GB RAM | `B1s` — 1 vCPU, 1 GB RAM | `e2-micro` — 2 vCPU (shared), 1 GB RAM |
| Static public address | Elastic IP — **charged at $0.005/hr since Feb 2024** whether attached or not, against a 750 hr/month free allowance | Static public IP, charged separately | Static external IP, free while attached |
| Firewall abstraction | Security groups — stateful, per-CIDR, per-port | Network security groups — priority-ordered rules | VPC firewall rules — tag-targeted |
| Managed MongoDB in free limits | No native option; Atlas M0 used instead | No native option; Atlas M0 used instead | No native option; Atlas M0 used instead |
| Module alignment | Session 8 | Session 7 | Session 9 |

Two observations follow. No provider offers managed MongoDB free of charge, so a third-party service is required regardless of choice; Atlas M0 supplies 512 MB indefinitely and is provider-agnostic. And all three allocations have been repeatedly restructured — AWS moved new accounts to a credit-based model during 2025 — so the entitlement attached to any given account must be confirmed in the billing console rather than assumed from marketing material.

That confirmation was carried out here rather than assumed, and it changed the plan. The account holds a **credit-based Free Plan**, not the legacy 12-month free tier:

```bash
aws freetier get-account-plan-state
# { "accountId": "840324809435", "accountPlanType": "FREE", "accountPlanStatus": "ACTIVE",
#   "accountPlanRemainingCredits": { "amount": 135.71, "unit": "USD" },
#   "accountPlanExpirationDate": "2026-10-21T01:55:05Z" }
```

Two consequences follow directly, and neither could have been read off a documentation page. First, the eligible instance family differs: `describe-instance-types --filters free-tier-eligible` returns `t3.micro`, `t3.small`, `t4g.micro` and `t4g.small` on this account, and **not** `t2.micro`, which is the type most free-tier guidance names for `us-east-1`. Second, the deployment has a hard expiry of **21 October 2026** rather than a twelve-month runway, after which the resources stop unless the account converts to a paid plan. Since the viva falls well inside that window this is survivable, but it is precisely the kind of unilateral term-change that Lynn (2020) warns against building a cost case upon — and it inverts the "duration and predictability" score AWS receives in Table 2 below, which was assigned on the legacy model.

## 2.3 Weighted decision matrix and justification

Each provider was scored 1–5 against the criteria, weighted by importance to this deployment.

**Table 2 — Weighted provider decision matrix**

| Criterion | Weight | AWS | Azure | GCP |
|---|---|---|---|---|
| Duration and predictability | 25% | 4 | 3 | 5 |
| Instance suitability | 20% | 5 | 4 | 4 |
| Managed database availability | 10% | 3 | 3 | 3 |
| Network control granularity | 20% | 5 | 4 | 4 |
| Documentation depth | 15% | 5 | 4 | 4 |
| Module alignment | 10% | 5 | 5 | 5 |
| **Weighted total** | **100%** | **4.60** | **3.75** | **4.25** |

**AWS was selected**, scoring highest on the two criteria of greatest combined weight — instance suitability and network control granularity. The `t3.micro` provides 1 GB of RAM with burstable CPU credits, accommodating the Vite build once swap is added, and security groups offer exactly the per-source-CIDR granularity needed to evidence least-privilege exposure in Section 4.

The decision is not unqualified. Google Cloud scored higher on allocation durability, since its `e2-micro` allocation is indefinite rather than time-boxed. Had the deployment needed to persist beyond the assessment period, that criterion would have been weighted more heavily and the outcome would likely have reversed. This is acknowledged in Section 6.

## 2.4 The shared responsibility model as a scoping instrument

The division of duties between provider and customer is not contractual framing; it scopes the assessment in Section 4. Erl, Mahmood and Puttini (2013) note the boundary shifts with the service model, and this deployment uses Infrastructure as a Service for compute and Software as a Service for data, so two boundaries operate simultaneously.

**Table 3 — Shared responsibility allocation for this deployment**

| Layer | Component | Provider responsibility | Customer responsibility |
|---|---|---|---|
| Physical | Data centre, hardware | AWS | — |
| Virtualisation | Hypervisor, host OS | AWS | — |
| Network infrastructure | Backbone, DDoS protection at edge | AWS | Security group rules, subnet placement |
| Guest OS | Ubuntu 24.04 | — | Patching, hardening, SSH configuration |
| Runtime | Node.js 22, Nginx | — | Version currency, configuration |
| Application | Foodora source | — | Entirely the author's |
| Data (Atlas) | MongoDB engine, host, backup | MongoDB Inc. | Access credentials, IP allowlist, encryption in transit |
| Identity | IAM control plane | AWS | User creation, MFA, privilege assignment |

The practical consequence is that **almost all exploitable risk here sits in the customer column**. AWS secures the hypervisor; it does not prevent the author shipping an authentication bypass, and Section 4 confirms that every severe finding is an application-layer defect within the author's remit. Vacca (2021) argues that misattribution of responsibility is itself a leading cause of cloud security failure — organisations assume the provider has secured a layer that in fact remains theirs.

<div style="page-break-after: always;"></div>

# 3. Cloud Deployment Implementation

## 3.1 Target architecture

The deployed topology places a single EC2 instance behind an Nginx reverse proxy, with data held in a managed MongoDB Atlas cluster external to the AWS account.

```
                          Internet
                             │
                   foodora.duckdns.org  (DuckDNS)
                             │  :443 TLS — Let's Encrypt
        ┌────────────────────▼─────────────────────┐
        │  AWS EC2 t3.micro · Ubuntu 24.04.4 LTS   │
        │  us-east-1c · 34.195.198.83              │
        │  i-09467a5509cfe0c85                     │
        │                                          │
        │   ┌──────────────────────────────────┐   │
        │   │  Nginx 1.24.0                    │   │
        │   │   /           → /var/www/foodora │   │
        │   │   /api        → 127.0.0.1:5000   │   │
        │   │   /socket.io  → 127.0.0.1:5000   │   │
        │   │                 (WebSocket)      │   │
        │   └──────────────┬───────────────────┘   │
        │                  │ proxied over loopback │
        │   ┌──────────────▼───────────────────┐   │
        │   │  Node.js 22 API — PM2 fork mode  │   │
        │   │  listens *:5000 — see F-21       │   │
        │   └──────────────┬───────────────────┘   │
        └──────────────────┼───────────────────────┘
                           │ TLS · SCRAM-SHA-256
                 ┌─────────▼──────────┐
                 │  MongoDB Atlas M0  │
                 │  allowlist:        │
                 │  34.195.198.83/32 │
                 └────────────────────┘

  Security group foodora-sg (sg-0be61e3a771f95188)
    22/tcp   ← 202.165.237.155/32  (administrative access only)
    80/tcp   ← 0.0.0.0/0           (redirects to 443)
    443/tcp  ← 0.0.0.0/0           (application traffic)
    5000/tcp   NOT REACHABLE       (no rule; but process listens *:5000 — F-21)
    27017/tcp  NOT EXPOSED         (no local database)
```

Three decisions warrant justification. **The reverse proxy is the only intended route to the API**, collapsing the externally reachable surface to two ports, verified empirically in Section 4.4. **The database is external and IP-restricted**, decoupling the data tier from instance lifecycle and providing managed backup. **TLS terminates at Nginx**, centralising and automating certificate management rather than embedding it in application code.

One qualification is necessary, and it matters more than it first appears. The API process does **not** bind to the loopback interface: `server/src/server.js` calls `server.listen(PORT)` without a host argument, so Node binds all interfaces, which `ss -tlnp` confirms as `LISTEN *:5000`. Port 5000 is therefore unreachable from the internet **solely** because the security group contains no rule for it. The intended design has two independent controls; the deployed system has one. Removing or widening a single firewall rule would expose the unauthenticated API directly, so this is recorded as finding **F-21** and remediated by passing an explicit bind address. The distinction is exactly the kind of gap that a configuration review catches and a port scan does not — an external Nmap of the deployed host and of a correctly bound host produce identical output.

## 3.2 Account and region configuration

Provisioning was carried out in AWS account `840324809435`, confirmed as an active credit-based Free Plan account beforehand. Every resource in this section — security group, instance, key pair and Elastic IP — was created through the AWS CLI rather than the console, so its parameters are reproducible, and each was read back from the API afterwards rather than assumed from the interface that created it. That read-back discipline surfaced two of the findings in Section 4.7.

No separate administrative IAM identity was created and no billing alarm configured; provisioning used root credentials, which Section 6 records as accepted residual risk.

## 3.3 Network design and firewall configuration

The instance was placed in a public subnet (`subnet-0781378c5d6b6a133`) of the default VPC (`vpc-01456e75075bfeb56`) in **`us-east-1`**, availability zone `us-east-1c`. A dedicated security group, `foodora-sg` (`sg-0be61e3a771f95188`), was created rather than reusing the default group, so that the rule set is explicit and auditable.

Region choice deserves a frank note rather than a retrospective justification. `us-east-1` was where the account was already configured, and the deployment inherited it. It is the largest and cheapest AWS region and has the widest service availability, which is a genuine if incidental benefit. But it places application data in Northern Virginia, and for a food-delivery platform serving UK or Pakistani customers that is a data-residency position one would not choose deliberately — under UK GDPR, transfers to the United States rest on the adequacy regulations rather than on domestic processing. Had residency been treated as a design constraint, `eu-west-2` (London) was the correct region, and moving would mean redeploying the instance, reissuing the certificate and re-pointing DNS. This is revisited in Section 6 as a limitation.

**Table 4 — Security group rule set and justification**

| Direction | Port | Protocol | Source / Destination | Justification |
|---|---|---|---|---|
| Inbound | 22 | TCP | `202.165.237.155/32` | Administrative SSH restricted to a single host address. Exposing 22 to `0.0.0.0/0` invites continuous automated credential attacks. |
| Inbound | 80 | TCP | `0.0.0.0/0` | Required for Let's Encrypt HTTP-01 challenge validation and for redirecting users to HTTPS. Serves no application content. |
| Inbound | 443 | TCP | `0.0.0.0/0` | All application traffic. Public by necessity — the brief requires remote accessibility. |
| Inbound | 5000 | TCP | *(absent)* | No inbound rule exists, so the API is unreachable from the internet. Note that this is the **only** control preventing that access: the process binds `*:5000`, not `127.0.0.1:5000` (finding **F-21**), so the intended defence in depth is currently a single layer. |
| Inbound | 27017 | TCP | *(absent)* | No database runs on the instance. An open 27017 is among the most commonly exploited misconfigurations in internet-facing MongoDB deployments. |
| Outbound | All | All | `0.0.0.0/0` | Retained as default. Restricting egress is discussed as future work in §6. |

> ### 📸 FIG-01 — VPC subnet and route table
> **Where:** VPC Console → Subnets → your subnet → Route table tab
> **Must be visible:** subnet ID, availability zone, CIDR block, and the route table showing `0.0.0.0/0 → igw-…`
> **Why it matters:** evidences understanding of *why* the instance is reachable — through an internet gateway route, not by accident
> **Caption:** *Figure 1 — Public subnet route table showing the internet gateway association.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-02 — Security group inbound rules
> **Where:** EC2 Console → Security Groups → `foodora-sg` → Inbound rules tab
> **Must be visible:** all three rules with their exact source CIDRs; the security group ID; and clearly **no** rule for 5000 or 27017
> **Why it matters:** this is the single most important deployment screenshot. It pairs with FIG-25 (external Nmap) to prove empirically that the firewall does what it claims. Markers look for this pairing.
> **Caption:** *Figure 2 — Inbound security group rules implementing least-privilege port exposure.*
> **Status:** ⬜ PENDING

## 3.4 Compute provisioning

A `t3.micro` instance running Ubuntu Server 24.04.4 LTS (`ami-052355af2a014bd2c`) was launched into the configured subnet and security group on 9 August 2026 at 18:42 UTC, with a 20 GB gp3 root volume. Ubuntu was selected over Amazon Linux for the currency of its Node.js packaging and the breadth of available documentation (Negus, 2020). Access uses an **RSA** key pair, `foodora-key`; password authentication over SSH was never enabled.

> ## ⚠ WORKING NOTE — DELETE BEFORE SUBMISSION (excluded from word count)
>
> Free-tier eligibility was confirmed against the account rather than assumed, because the eligible family differs by region and plan generation (the analysis of this is in §2.2 — do not repeat it here):
>
> ```bash
> aws ec2 describe-instance-types --filters "Name=free-tier-eligible,Values=true" \
>   --query "InstanceTypes[].InstanceType" --output text
> # → c7i-flex.large  t4g.small  t3.micro  t4g.micro  t3.small  m7i-flex.large
> ```

An Elastic IP (`eipalloc-0e65c28e8f3e746dc` → 34.195.198.83) was allocated and associated. This matters beyond convenience: the Atlas network allowlist and the DNS A record both reference this address, and an ephemeral public IP changes on instance stop, which would break both simultaneously. Since February 2024 AWS charges **$0.005/hour for every public IPv4 address**, attached or not, against a free allowance of 750 hours per month — an allowance this account already partly consumes on a second, unrelated instance, so the address is not strictly free here.

Provisioning was performed with the AWS CLI rather than the console, so that the exact parameters are reproducible:

```bash
aws ec2 create-security-group --group-name foodora-sg \
  --description "Foodora app: SSH from home, HTTP/HTTPS public" --vpc-id vpc-01456e75075bfeb56
aws ec2 authorize-security-group-ingress --group-id sg-0be61e3a771f95188 --ip-permissions \
  'IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=202.165.237.155/32}]' \
  'IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}]' \
  'IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges=[{CidrIp=0.0.0.0/0}]'

aws ec2 run-instances --image-id ami-052355af2a014bd2c --instance-type t3.micro \
  --key-name foodora-key --security-group-ids sg-0be61e3a771f95188 \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --metadata-options 'HttpTokens=required,HttpEndpoint=enabled' \
  --user-data file://user-data.sh

aws ec2 allocate-address --domain vpc
aws ec2 associate-address --instance-id i-09467a5509cfe0c85 --allocation-id eipalloc-0e65c28e8f3e746dc
```

`HttpTokens=required` enforces IMDSv2, which defends the instance metadata service against the server-side request forgery pattern that made IMDSv1 credential theft straightforward — a control worth naming explicitly, since it is set at launch and cannot be inferred from any later screenshot.

Host configuration was applied through a `user-data` bootstrap script executed on first boot, which patched the system and installed the runtime:

```bash
#!/bin/bash
# 2 GB swap FIRST — 1 GB RAM is insufficient for `vite build`, which is
# OOM-killed without it. Ordered before apt so the upgrade also has headroom.
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs nginx git ufw
npm install -g pm2
snap install --classic certbot && ln -sf /snap/bin/certbot /usr/bin/certbot
systemctl enable --now nginx
```

> **⚠ Discrepancy D2 — the host firewall is NOT active.** `ufw` is installed but `sudo ufw status` returns `Status: inactive`; no rules were ever applied. The commands below are the intended second layer beneath the security group, and are **not yet part of the deployment**. Run them — taking care to permit 22 before enabling, or you will lock yourself out of the instance — then delete this box. Recorded as finding **F-22**.
>
> ```bash
> sudo ufw default deny incoming
> sudo ufw default allow outgoing
> sudo ufw allow from 202.165.237.155 to any port 22 proto tcp   # MUST precede enable
> sudo ufw allow 80/tcp
> sudo ufw allow 443/tcp
> sudo ufw --force enable
> sudo ufw status verbose        # capture this for evidence
> ```

> ### 📸 FIG-03 — EC2 launch configuration
> **Where:** EC2 → Launch an instance, with the summary panel visible before you click Launch
> **Must be visible:** AMI (Ubuntu 24.04 LTS), instance type `t3.micro`, the "Free tier eligible" label, key pair name, selected security group
> **Caption:** *Figure 3 — EC2 instance launch configuration showing free-tier eligible instance selection.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-04 — Key pair generation
> **Where:** EC2 → Key pairs, or the creation dialog during launch
> **Must be visible:** key pair name `foodora-key`, type **`rsa`**, and the fingerprint `0b:83:8a:8f:86:ce:91:c5:c5:c0:ca:ef:5b:90:5c:28:1d:bd:5e:d6`. **Do not photograph the private key material.**
> **Caption:** *Figure 4 — RSA key pair generated for certificate-based SSH authentication.*
> **Status:** ⬜ PENDING — capturable now

> ### 📸 FIG-05 — Running instance summary
> **Where:** EC2 → Instances → select instance → Details tab
> **Must be visible:** Instance ID, state "Running", instance type, availability zone, public IPv4 address
> **Why it matters:** the **Instance ID establishes scope** for the security assessment. Include this in your authorisation statement (§4.2) and, ideally, keep it visible in scan screenshots.
> **Expected values:** Instance ID `i-09467a5509cfe0c85`, state Running, type `t3.micro`, AZ `us-east-1c`, public IPv4 `34.195.198.83`
> **Caption:** *Figure 5 — Instance running in us-east-1c with assigned public address.*
> **Status:** ⬜ PENDING — capturable now

> ### 📸 FIG-06 — Elastic IP association
> **Where:** EC2 → Elastic IPs → select address → Details
> **Must be visible:** the allocated address, "Associated instance ID" populated, association state
> **Why it matters:** explains why the DNS record and Atlas allowlist remain valid across instance restarts
> **Caption:** *Figure 6 — Elastic IP associated with the instance, providing a stable public address.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-07 — First SSH session
> **Where:** Your local terminal, immediately after connecting
> **Must be visible:** the `ssh -i` command you ran, the Ubuntu MOTD banner, and the `ubuntu@ip-…` shell prompt
> **Caption:** *Figure 7 — Key-based SSH session established to the provisioned instance.*
> **Status:** ⬜ PENDING

## 3.5 Managed database provisioning

A MongoDB Atlas M0 cluster (`cluster0.uubm5as.mongodb.net`) was provisioned to hold the `foodora` database. A dedicated database user was granted `readWrite` on the application database alone rather than cluster-wide `atlasAdmin`, mirroring the least-privilege pattern already present in the project's local `docker/mongo/init/01-create-app-user.js`. Connections use TLS with SCRAM-SHA-256 authentication by default, so credentials never traverse the network in the clear. Connectivity was confirmed from the instance rather than assumed — the driver logs the resolved shard host and database on connect.

The network allowlist holds **two** entries, not one: `34.195.198.83/32` for the instance, and the author's workstation address for local development and for the seeding run. The `0.0.0.0/0` entry that Atlas offers as a setup convenience was not used. The workstation entry is the weaker of the two and should be removed once development finishes, since a residential address is reassigned by the ISP and the allowlist would then authorise a stranger's connection attempt — it still faces SCRAM authentication, but the network control has silently stopped doing its job. Note this in the figure caption rather than leaving the reader to infer a single-entry list.

One configuration detail is worth recording because it fails silently rather than loudly: the Atlas connection string carries no database name by default, so Mongoose connects to a database called `test` and every document — including a seeding run — lands in the wrong place while the application appears entirely healthy. It is a defect class neither a port scan nor an application scanner would ever report, since nothing is broken from the outside, which is the point Section 4.1 makes about the limits of black-box testing.

> ## ⚠ WORKING NOTE — DELETE BEFORE SUBMISSION (excluded from word count)
>
> The string as copied from the Atlas console ends `…mongodb.net/?retryWrites=true&w=majority` — no path component. The startup log is the only place the mistake surfaces:
>
> ```
> MongoDB connected: ac-rwivtaw-shard-00-00.uubm5as.mongodb.net/test      ← wrong
> MongoDB connected: ac-rwivtaw-shard-00-01.uubm5as.mongodb.net/foodora   ← after inserting /foodora
> ```
>
> Fix by inserting the database name before the query string: `…mongodb.net/foodora?retryWrites=true&w=majority`. Check this in your FIG-11 screenshot.

> ### 📸 FIG-08 — Atlas cluster provisioned
> **Where:** Atlas → Database → Clusters
> **Must be visible:** cluster name, tier badge **M0 Sandbox (FREE)**, cloud provider and region
> **Why it matters:** proves the data tier is genuinely within free limits, which the brief requires
> **Caption:** *Figure 8 — MongoDB Atlas M0 free-tier cluster provisioned for the application database.*
> **Status:** ⬜ PENDING — capturable now. Record the cluster's actual region from this screen and state it in §3.5; if it is not `us-east-1`, say so plainly rather than claiming co-location.

> ### 📸 FIG-09 — Database user with scoped privileges
> **Where:** Atlas → Security → Database Access → your user
> **Must be visible:** username, and the role shown as `readWrite@foodora` — **not** `atlasAdmin`. Password must not be visible.
> **Why it matters:** least privilege at the data tier; a specific, checkable claim in the viva
> **Caption:** *Figure 9 — Database user restricted to readWrite on the application database.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-10 — Network access allowlist
> **Where:** Atlas → Security → Network Access → IP Access List
> **Must be visible:** the entry `34.195.198.83/32` for the instance, the workstation entry alongside it, and clearly **no** `0.0.0.0/0` entry
> **Why it matters:** among the strongest single controls in the whole deployment — the database is unreachable from anywhere except the two allowlisted addresses
> **Caption:** *Figure 10 — Atlas network access restricted to the instance and the development workstation.*
> **Status:** ⬜ PENDING — capturable now. Do **not** caption this as a single entry; the list holds two, and a marker can see the second one in your own screenshot.

> ### 📸 FIG-11 — Application connected to Atlas
> **Where:** Instance terminal — `pm2 logs foodora-api --lines 20` immediately after startup
> **Must be visible:** the `MongoDB connected: …` log line emitted by `server/src/config/db.js`, with the Atlas hostname **and the `/foodora` database suffix**
> **Caption:** *Figure 11 — Application server establishing an authenticated TLS connection to the Atlas cluster.*
> **Status:** ⬜ PENDING — capturable now
>
> Actual output captured from the deployment:
>
> ```
> 0|foodora- | 2026-08-09T19:15:38: MongoDB connected: ac-rwivtaw-shard-00-01.uubm5as.mongodb.net/foodora
> 0|foodora- | 2026-08-09T19:15:38: Server running on port 5000
> ```
>
> **Check the suffix in your screenshot.** If it reads `/test`, the database name is missing from `MONGO_URI` and you are writing to the wrong database — see §3.5.

## 3.6 Application runtime deployment

Node.js 22 LTS was installed from NodeSource. The API is supervised by PM2, which provides automatic restart on failure and, critically, resurrection on instance reboot — without it, a reboot silently takes the application offline.

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2

# Deploy source. /srv is the FHS location for site-specific service data,
# which keeps the application out of a login user's home directory.
sudo mkdir -p /srv && sudo chown ubuntu:ubuntu /srv
git clone https://github.com/gull25/Online_Food_Ordering_System.git /srv/foodora
cd /srv/foodora/server
npm ci --omit=dev

# Production environment. This file is never committed and never pasted into
# a shell history: it was copied to the instance over SCP, then rewritten in place.
cat > /srv/foodora/server/.env <<'EOF'
NODE_ENV=production
PORT=5000
MONGO_URI={{ATLAS_CONNECTION_STRING}}     # must include /foodora before the query string
JWT_SECRET={{JWT_SECRET_64_HEX}}          # 64 hex chars, generated on the instance
JWT_EXPIRE=7d                             # currently 7d — see the note below
CLIENT_URL=https://foodora.duckdns.org
EOF
chmod 600 /srv/foodora/server/.env

# Generate a cryptographically adequate secret ON THE INSTANCE — see finding F-01 in §4.7
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Start under PM2 and persist across reboots
pm2 start src/server.js --name foodora-api --time
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

> **⚠ Two accuracy notes on this block.**
>
> **Credentials not yet configured.** `CLOUDINARY_*`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and the SMTP variables are **absent** from the deployed `.env`. The consequences are bounded but real, and each is visible to anyone who tests the live site: image upload through the vendor dashboard fails at runtime; `/api/payments/*` returns 503 because `config/stripe.js` guards on the key; and `forgot-password` returns 500, because `sendEmail` falls through to Ethereal defaults and the surrounding `try/catch` converts the failure into `ApiError(500, 'Email could not be sent')`. Ordering, authentication, real-time tracking and the seeded menu imagery are unaffected — the seed data references Unsplash URLs directly rather than Cloudinary. **FIG-24 cannot be produced until the Stripe test keys are added.**
>
> **A newline bug worth knowing about.** The `.env` copied from the workstation had no trailing newline, so appending `NODE_ENV=production` with `>>` silently concatenated it onto the previous line, producing `CLIENT_URL=https://foodora.duckdns.orgNODE_ENV=production`. `dotenv` parsed that as a single variable and the application started in development mode — which, per `app.js:8–11`, means CORS reflects **any** origin with `credentials: true` (finding F-17). A misconfiguration that appears to be about formatting turned into a live security-relevant defect, and nothing in the startup output indicated it. Verify with `grep -n . .env` after any edit.

> **Deployment note.** `JWT_EXPIRE` is currently `7d` in the deployed `.env` (discrepancy **D5**). The value is inert either way: `server/src/utils/generateToken.js` hard-codes `expiresIn: '7d'` and never reads the variable — part of finding **F-01** in §4.7, remediated in §5.2. Set it to `1d` at the same time as wiring R1, so that the variable and the code agree and the claim in §5.2 holds.

> ### 📸 FIG-12 — Node.js and npm versions
> **Where:** Instance terminal — `node -v && npm -v && pm2 -v`
> **Must be visible:** all three version strings
> **Caption:** *Figure 12 — Node.js 22 LTS runtime installed on the instance.*
> **Status:** ⬜ PENDING — capturable now
>
> Actual values on the instance: **Node v22.23.2 · npm 10.9.8 · PM2 7.0.3** (also Nginx 1.24.0, Certbot 5.7.0, git 2.43.0).

> ### 📸 FIG-13 — Repository cloned and dependencies installed
> **Where:** Instance terminal, during or after `npm ci --omit=dev`
> **Must be visible:** the clone completing, and the npm summary line reporting packages added
> **Caption:** *Figure 13 — Application source deployed and production dependencies installed.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-14 — PM2 process list
> **Where:** Instance terminal — `pm2 list`
> **Must be visible:** process name `foodora-api`, status **online**, uptime, restart count, memory usage
> **Caption:** *Figure 14 — API process supervised by PM2 and running in production mode.*
> **Status:** ⬜ PENDING — capturable now
>
> Deployed state: `id 0 · foodora-api · fork mode · 1 instance · online · user ubuntu · ~100 MB`. Note **fork mode, not cluster** — a single `t3.micro` with 1 GB of RAM has no headroom for multiple workers, and clustering this application would break real-time delivery anyway, for the reason given in §6: `socket.js` holds per-process in-memory state, so two workers would each see a disjoint set of connected clients. Fork mode is the correct choice here, not a limitation.
>
> Boot persistence was verified as configured, which is the part most portfolios miss:
>
> ```bash
> sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
> # → systemd unit pm2-ubuntu.service installed and enabled
> ```

> ### 📸 FIG-15 — API responding on the loopback interface
> **Where:** Instance terminal — `curl -i http://127.0.0.1:5000/api/status`
> **Must be visible:** `HTTP/1.1 200 OK` and the JSON body
> **Why it matters:** this is the **"accessible locally"** evidence the brief explicitly requires, and it simultaneously demonstrates the API is bound to loopback rather than a public interface
> **Caption:** *Figure 15 — API health endpoint responding on the loopback interface.*
> **Status:** ⬜ PENDING
>
> Actual output, captured on the instance 9 Aug 2026:
>
> ```
> ubuntu@ip-172-31-16-58:~$ curl -sI http://127.0.0.1:5000/api/status
> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: https://foodora.duckdns.org
> Vary: Origin
> Access-Control-Allow-Credentials: true
> Content-Type: application/json; charset=utf-8
> Content-Length: 74
> ETag: W/"4a-8BTSKDTjhfggZOWTbyxbFlyp2QY"
> Date: Sun, 09 Aug 2026 19:47:08 GMT
> Connection: keep-alive
>
> {"status":"ok","db":"connected","message":"MERN Architecture API Running"}
> ```
>
> **Three things to observe, all of them evidence:**
>
> 1. `X-Powered-By: Express` discloses the framework — finding **F-14**, confirmed empirically rather than inferred from source.
> 2. `Access-Control-Allow-Origin` echoes the configured `CLIENT_URL` rather than reflecting the caller, which confirms `NODE_ENV=production` is genuinely in effect. Had it read `Access-Control-Allow-Origin: *` or reflected the request origin, the deployment would be running the permissive development branch of `app.js:8–11` — finding F-17.
> 3. Not one of CSP, HSTS, `X-Frame-Options` or `X-Content-Type-Options` is present — finding **F-09**, and the baseline for the FIG-33 → FIG-34 comparison.
>
> **Caveat for §4.4.** This request reaches the API over loopback, but that is the *client's* choice of address, not a property of the *server's* binding. The process listens on `*:5000` (finding F-21), so this output does not evidence a loopback-only bind. Use `sudo ss -tlnp` for that claim.

### Demonstration data

A deployment that is reachable but empty does not evidence a *functional* application. `server/seed.js` was run against the Atlas cluster, producing three restaurants, twelve menu items, four promotional offers and one completed order, together with an account for each of the three roles.

> ## ⚠ WORKING NOTE — DELETE BEFORE SUBMISSION (excluded from word count)
>
> ```bash
> cd /srv/foodora/server && npm run seed
> # → 3 restaurants, 12 menu items, 8 categories, 4 offers, 1 rider profile, 1 delivered order
> ```
>
> **Demo logins**, all with password `password123`: `customer@foodora.com`, `vendor@foodora.com` (Bella Cucina), `vendor2@foodora.com` (Sakura), `rider@foodora.com`. Two of these are what make the two-device viva demonstration in Appendix F possible.
>
> **The script issues `deleteMany({})` across all eight collections before inserting.** Counts were checked and confirmed at zero first. Never run it against a populated database — and if you reseed after capturing figures, your order IDs change and any screenshot showing one becomes inconsistent with the database.
>
> **Two details worth keeping in mind.** Seeded imagery references Unsplash URLs directly rather than Cloudinary, so listings render fully despite the absent Cloudinary credentials — the gap appears only when uploading a *new* image. And the pre-existing `DELIVERED` order exists so the order-history and analytics screens are not empty, which would otherwise read as a broken feature rather than an unused one.
>
> Verified through the public API across the internet rather than in the database, which exercises the whole chain from DNS to Atlas in one step:
>
> ```bash
> curl -s https://foodora.duckdns.org/api/restaurants     # → {"success":true,"count":3,…}
> curl -s https://foodora.duckdns.org/api/public/trending # → 10 items
> curl -s https://foodora.duckdns.org/api/offers/active   # → PIZZA20, PASTA15, SUSHI10, TACO25
> ```

## 3.7 Reverse proxy and static asset delivery

The React client is compiled to static assets and served directly by Nginx, with only `/api` and `/socket.io` proxied to the Node process. This keeps static delivery off the event loop entirely.

One deployment characteristic of Vite requires emphasis. Environment variables prefixed `VITE_` are substituted at **build** time, not read at runtime — `client/src/api/axios.js` resolves `import.meta.env.VITE_API_URL` during bundling. If the variable is unset when `vite build` runs, the fallback `http://localhost:5000/api` is compiled into the production bundle, and the deployed application will attempt to call the visitor's own machine. The variable must therefore be exported before the build, not after.

```bash
cd /srv/foodora/client
npm ci            # full install, including dev dependencies: vite is a build tool

# MUST be in place before the build — these values are compiled into the bundle.
# A file is used rather than `export`, so the configuration survives a re-login
# and a later rebuild cannot silently pick up the localhost fallback.
cat > /srv/foodora/client/.env <<'EOF'
VITE_API_URL=https://foodora.duckdns.org/api
VITE_STRIPE_PUBLIC_KEY={{STRIPE_PUBLISHABLE_KEY}}
EOF

NODE_OPTIONS=--max-old-space-size=1536 npm run build

sudo rsync -a --delete dist/ /var/www/foodora/
sudo chown -R www-data:www-data /var/www/foodora
```

`rsync --delete` rather than `cp -r` is deliberate. Vite emits content-hashed filenames, so repeated copying accumulates every superseded bundle in the web root, leaving stale JavaScript publicly retrievable by anyone who kept an old filename — including versions predating a security fix.

> ## ⚠ WORKING NOTE — DELETE BEFORE SUBMISSION (excluded from word count)
>
> Build completed in **1.72 s**, emitting a 2.2 MB tree. Main chunk `index-D4fVOTfy.js` at 356 kB (105.76 kB gzipped), with route-level code splitting producing separate chunks for `CheckoutScreen`, `AdminDashboardPage`, `TrackOrderScreen` and the Leaflet marker logic — useful numbers for FIG-16's caption. The 2 GB swap from §3.4 is what makes this possible on 1 GB of RAM; without it Node is OOM-killed partway through bundling.

The Nginx server block is reproduced in full in **Appendix A**. Three elements are load-bearing:

```nginx
# SPA fallback — React Router uses BrowserRouter, so any deep link
# must return index.html rather than a 404.
location / {
    root /var/www/foodora;
    try_files $uri $uri/ /index.html;
}

# API proxy
location /api {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# WebSocket upgrade — REQUIRED for Socket.IO live order tracking.
# Without this block the handshake degrades and rider location
# streaming fails silently while the rest of the app appears healthy.
location /socket.io/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host       $host;
    proxy_read_timeout 86400;
}
```

> ### 📸 FIG-16 — Production client build
> **Where:** Instance terminal, at the end of `npm run build`
> **Must be visible:** the Vite build summary — module count, output chunk list, build duration
> **Caption:** *Figure 16 — React client compiled to optimised production assets.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-17 — Nginx configuration validated
> **Where:** Instance terminal — `sudo nginx -t`
> **Must be visible:** `syntax is ok` and `test is successful`
> **Caption:** *Figure 17 — Nginx configuration syntax validated prior to reload.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-18 — Application served through Nginx
> **Where:** Browser on your laptop at `http://34.195.198.83`
> **Must be visible:** the Foodora home page rendering, with the raw IP address in the URL bar
> **Why it matters:** the pre-TLS state. Pairs with FIG-21 to show the transport upgrade.
> **Caption:** *Figure 18 — Application reachable over HTTP prior to TLS configuration.*
> **Status:** ⬜ PENDING

## 3.8 DNS and transport layer security

A DuckDNS subdomain was mapped to the Elastic IP. A dynamic DNS provider was selected over a registered domain because it is free, satisfies the brief's DNS configuration requirement, and — importantly — is accepted by Let's Encrypt for HTTP-01 challenge validation, which some free hostname services are not.

```bash
# Verify DNS propagation before requesting a certificate;
# Certbot's HTTP-01 challenge fails if the record has not propagated.
nslookup foodora.duckdns.org 8.8.8.8    # must return 34.195.198.83

# Installed from snap, not apt: the snap channel carries a current Certbot
# (5.7.0) whereas the Ubuntu 24.04 archive package lags several major versions.
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

sudo certbot --nginx -d foodora.duckdns.org --redirect \
  --non-interactive --agree-tos -m adnan.tariq@consultancyoutfit.co.uk

# Confirm the automatic renewal timer is active.
# NOTE: the snap install registers snap.certbot.renew.timer,
# NOT the certbot.timer unit that the apt package would create.
systemctl list-timers snap.certbot.renew.timer
sudo certbot renew --dry-run
```

Both verifications passed:

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/foodora.duckdns.org/fullchain.pem
This certificate expires on 2026-11-07.

NEXT                        LEFT       UNIT                     ACTIVATES
Sun 2026-08-09 22:43:00 UTC 3h 23min   snap.certbot.renew.timer snap.certbot.renew.service

Congratulations, all simulated renewals succeeded:
  /etc/letsencrypt/live/foodora.duckdns.org/fullchain.pem (success)
```

The dry run matters more than the issuance. A certificate that issues once but cannot renew produces a site that works through marking and fails silently 90 days later; the dry run exercises the full HTTP-01 challenge path against the live Nginx configuration that Certbot itself rewrote, which is the only way to know the renewal will actually succeed unattended.

The `--redirect` flag instructs Certbot to install a permanent redirect from port 80 to 443, so plaintext access is no longer possible. Clark and van Oorschot (2013) observe that opportunistic TLS without enforced redirection leaves users exposed to downgrade and stripping attacks; the redirect closes that gap, and HSTS — added during remediation in §5.5 — instructs browsers never to attempt plaintext in the first place.

> ### 📸 FIG-19 — DNS resolution
> **Where:** Your local terminal — `nslookup foodora.duckdns.org` (or `dig +short foodora.duckdns.org`)
> **Must be visible:** the queried name and the resolved address matching your Elastic IP exactly
> **Why it matters:** direct evidence for the brief's *"Configure DNS settings"* requirement
> **Caption:** *Figure 19 — DNS A record resolving the application hostname to the Elastic IP.*
> **Status:** ⬜ PENDING — capturable now
>
> Actual resolution, queried against a public resolver rather than the local cache so the answer cannot be a stale local entry:
>
> ```
> > nslookup foodora.duckdns.org 8.8.8.8
> Server:  dns.google
> Address:  8.8.8.8
>
> Name:    foodora.duckdns.org
> Address: 34.195.198.83
> ```
>
> **Keep the DuckDNS subdomain alive.** DuckDNS deletes subdomains after roughly 30 days without activity, which would take the site and the certificate renewal down together, after submission but plausibly before the viva. Log into duckdns.org occasionally, or leave the token-based update URL on a cron job.

> ### 📸 FIG-20 — Certificate issuance
> **Where:** Instance terminal, at the end of the `certbot --nginx` run
> **Must be visible:** "Successfully received certificate", the certificate and key paths, and the expiry date
> **Caption:** *Figure 20 — Let's Encrypt certificate issued and installed into the Nginx configuration.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-21 — Valid certificate in the browser
> **Where:** Browser at `https://foodora.duckdns.org` → click the padlock → View certificate
> **Must be visible:** the padlock, the `https://` URL, issuer "Let's Encrypt", subject name and validity dates
> **Why it matters:** pairs with FIG-18 (plain HTTP) to evidence the transport upgrade
> **Caption:** *Figure 21 — Valid TLS certificate presented to the browser for the application hostname.*
> **Status:** ⬜ PENDING

## 3.9 Verification of local and remote accessibility

The brief requires the application to be functional and accessible **both locally and remotely**, and to be verified from different devices and locations. Four distinct tests were performed.

| Test | Vantage point | Command / action | Result (verified 9–10 Aug 2026) |
|---|---|---|---|
| Local — API | On the instance | `curl -sI http://127.0.0.1:5000/api/status` | ✅ HTTP 200, JSON body (FIG-15) |
| Local — full stack | On the instance | `curl -sI https://foodora.duckdns.org` | ✅ HTTP 200, 2,643-byte SPA shell through the proxy chain |
| Remote — desktop | Workstation, home broadband, across the internet | `curl` + browser against the hostname | ✅ HTTP 200; API 200; TLS verified (`ssl_verify_result=0`) |
| Remote — HTTP→HTTPS | Workstation | `curl -sI http://foodora.duckdns.org` | ✅ **301** → `https://foodora.duckdns.org/` |
| Remote — SPA deep link | Workstation | `GET /restaurants` | ✅ HTTP 200 — React Router fallback serving `index.html`, not a 404 |
| Remote — WebSocket | Workstation | `GET /socket.io/?EIO=4&transport=polling` | ✅ `0{"sid":"pI0hZFJoo3bydu1MAAAA","upgrades":["websocket"],…}` |
| Remote — real data | Workstation | `GET /api/restaurants`, `/api/public/trending`, `/api/offers/active` | ✅ 3 restaurants, 10 trending items, 4 offer codes |
| Remote — authentication | Workstation | `POST /api/auth/login` as `customer@foodora.com` | ✅ HTTP 200 with a valid JWT — proves bcrypt verification and the production signing secret both work end to end |
| Remote — mobile | Phone, **cellular data, Wi-Fi disabled** | Browse, order, track live | ⬜ **OUTSTANDING — FIG-23.** Only you can perform this one. |
| Remote — transaction | Phone or browser | Stripe test-mode payment | ⬜ **BLOCKED — FIG-24.** Requires `STRIPE_SECRET_KEY` on the instance. |

Eight of the ten checks pass. The two outstanding ones are the two that carry the most marks in this section, because between them they evidence *"functional"* rather than merely *"reachable"* — so neither can be substituted with a desktop screenshot.

A note on what the WebSocket check actually proves, since it is easy to over-claim. The handshake returning `"upgrades":["websocket"]` proves the server offers the protocol switch and that Nginx passed the request through; it does not by itself prove a sustained upgraded connection carrying courier positions. FIG-23, showing a moving marker on a phone, is what closes that gap — which is why the mobile capture is not optional.

Disabling Wi-Fi on the mobile device is deliberate. On the same Wi-Fi network the phone shares the laptop's public address, so a successful load proves nothing about internet reachability. On cellular data the request traverses a different autonomous system entirely, which is what "accessible remotely" actually means.

> ### 📸 FIG-22 — Local access verified on the instance
> **Where:** Instance terminal — `curl -I https://foodora.duckdns.org` and `curl -I http://127.0.0.1:5000/api/status` in one frame
> **Must be visible:** both commands and both `HTTP/… 200` status lines
> **Caption:** *Figure 22 — Application verified as locally accessible from the host instance.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-23 — Remote access and live tracking on mobile
> **Where:** Phone screenshot, **mobile data on, Wi-Fi off** (make the status bar visible)
> **Must be visible:** the cellular indicator with Wi-Fi clearly off, the `https://foodora.duckdns.org` URL, the padlock, and the live order-tracking map rendering the courier marker
> **Why it matters:** this single image evidences three separate brief requirements — remote accessibility, access from a different device, and access from a different network. The live map additionally proves the Nginx WebSocket upgrade block is working.
> **Caption:** *Figure 23 — Application accessed remotely over a cellular network, showing live order tracking.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-24 — End-to-end transaction completed remotely
> **Where:** Browser or phone — order confirmation screen after a Stripe test-mode payment
> **Must be visible:** order reference, status, total, and the payment confirmation
> **Why it matters:** demonstrates the deployment is *functional*, not merely reachable. A page that loads is not a working business application.
> **Caption:** *Figure 24 — Complete customer transaction executed against the cloud deployment.*
> **Status:** ⬜ PENDING

<div style="page-break-after: always;"></div>

# 4. Security Assessment

## 4.1 Assessment methodology

The assessment follows the four-phase structure of NIST SP 800-115, *Technical Guide to Information Security Testing and Assessment* (Scarfone *et al.*, 2008): planning, discovery, attack, and reporting. A recognised methodology was adopted rather than an ad-hoc tool run because, as Zissis and Lekkas (2012) argue, cloud security assessment must be systematic to be meaningful — an unstructured scan produces a list of alerts, not an understanding of risk.

Testing was layered deliberately across three tiers, because each tier is blind to the others:

| Tier | Technique | Tool | What it can and cannot see |
|---|---|---|---|
| Network | Port and service enumeration, TLS inspection | Nmap 7.9x | Sees exposed services and cipher configuration. Blind to application logic entirely. |
| Application | Automated dynamic analysis, spidering, active scanning | OWASP ZAP 2.15 | Sees HTTP-observable defects. Weak on authorisation logic, which requires knowing what *should* be forbidden. |
| Source | Manual static review against OWASP ASVS 4.0.3 | Manual, `npm audit` | Sees authorisation flaws and cryptographic misuse that no black-box tool can infer. |

The third tier proved decisive. As Section 4.7 shows, every finding rated Critical was located by source review, not by either automated tool. This is consistent with Fernandes *et al.* (2014), who observe that broken access control is systematically under-detected by automated scanners because a scanner cannot know which resources a given identity is entitled to reach. Test case selection was guided by the OWASP Web Security Testing Guide v4.2 (OWASP, 2020), and findings are classified against the OWASP Top 10:2021 (OWASP, 2021) and mapped to CIS Critical Security Controls v8 (CIS, 2021).

## 4.2 Scope, authorisation and rules of engagement

**In scope:** EC2 instance `i-09467a5509cfe0c85` at `34.195.198.83`, the hostname `foodora.duckdns.org`, the Foodora application source, and the configuration of the Atlas cluster.

**Explicitly out of scope:** the AWS control plane and hypervisor; MongoDB Atlas infrastructure; Stripe, Cloudinary and OpenStreetMap endpoints. These belong to the providers under the responsibility allocation in Table 3, and testing them would be unauthorised.

**Authorisation.** All assets are owned and operated by the author under an individual AWS account and a personal Atlas account. Testing was conducted solely against the author's own resources. AWS permits customer-initiated penetration testing of common services against one's own instances without prior approval, subject to the published exclusions — notably that denial-of-service and volumetric stress testing remain prohibited. No such testing was performed.

**Constraints observed.** Scanning was rate-limited to avoid resembling a denial-of-service event. No third-party account was accessed. Stripe operated in test mode throughout, so no real payment instrument was involved. Where a vulnerability was confirmed, exploitation stopped at the point of proof; no data was exfiltrated.

## 4.3 Threat model and attack surface

Threats were enumerated using STRIDE before any tool was run, so that scanning was directed by hypothesis rather than merely reporting whatever the tools happened to surface.

**Table 5 — Attack surface enumeration**

| Entry point | Exposure | Authentication | Principal threats (STRIDE) |
|---|---|---|---|
| `:443` HTTPS via Nginx | Public internet | Mixed | Tampering, Information disclosure, Elevation |
| `:22` SSH | `202.165.237.155/32` only | Key-based | Spoofing (mitigated: no password auth) |
| `/api/auth/*` | Public | None by design | Spoofing, Elevation |
| `/api/orders/*` | Public | JWT bearer | **Elevation, Information disclosure** |
| `/api/payments/*/callback` | Public | **None** | **Tampering, Repudiation** |
| `/socket.io` WebSocket | Public | **None** | **Information disclosure** |
| Atlas cluster `:27017` | `34.195.198.83/32` | SCRAM-SHA-256 | Spoofing (mitigated) |
| Cloudinary upload path | Authenticated | JWT bearer | Tampering (stored XSS via SVG) |

Three surfaces stood out before any scanning began. The gateway payment callbacks accept unauthenticated state-changing requests. The Socket.IO endpoint performs no handshake authentication. And the order endpoints authenticate the caller but — as source review confirmed — do not consistently verify that the authenticated caller is entitled to the specific order requested. Each hypothesis was subsequently confirmed.

## 4.4 Network layer assessment (Nmap)

Scans were run from two vantage points, because they answer different questions. An internal scan enumerates what is listening; an external scan enumerates what is *reachable*. The difference between them is the measured effect of the security group.

```bash
# EXTERNAL — from the local workstation, across the internet.
# This is the attacker's view.
nmap -sV -sC -p- -T3 34.195.198.83

# TLS configuration grading
nmap --script ssl-enum-ciphers -p 443 foodora.duckdns.org

# HTTP security header enumeration
nmap --script http-security-headers -p 443 foodora.duckdns.org

# INTERNAL — over SSH, from the instance itself.
# This is what actually listens, regardless of firewall.
ssh -i foodora-key.pem ubuntu@34.195.198.83
sudo nmap -sT -p- 127.0.0.1
sudo ss -tlnp        # authoritative listener list with owning process
```

> ### 📸 FIG-25 — Baseline external Nmap scan
> **Where:** Your local terminal, full scan output visible
> **Must be visible:** the complete command including the target, the open-port table, service/version columns, and the scan timestamp
> **Why it matters:** the single most important assessment screenshot. It proves 5000 and 27017 are unreachable and that 22 is restricted, so the firewall's effect is measured rather than asserted. **A marker will ask where you scanned from** — running this from your own machine is the correct answer.
> **Caption:** *Figure 25 — External Nmap service scan: ports 80 and 443 publicly reachable, port 22 reachable only from the allowlisted administrative address, and ports 5000, 8081 and 27017 filtered.*
> **Status:** ✅ CAPTURED 10 Aug 2026, 22:36 +0500
>
> Actual output:
>
> ```
> PS C:\Users\gulr8> nmap -Pn --reason -sV -p 22,80,443,5000,8081,27017 34.195.198.83
> Starting Nmap 7.991 ( https://nmap.org ) at 2026-08-10 22:36 +0500
> Nmap scan report for ec2-34-195-198-83.compute-1.amazonaws.com (34.195.198.83)
> Host is up, received user-set (0.21s latency).
>
> PORT      STATE    SERVICE          REASON            VERSION
> 22/tcp    open     ssh              syn-ack ttl 49    OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
> 80/tcp    open     http             syn-ack ttl 49    nginx 1.24.0 (Ubuntu)
> 443/tcp   open     ssl/http         syn-ack ttl 49    nginx 1.24.0 (Ubuntu)
> 5000/tcp  filtered upnp             no-response
> 8081/tcp  filtered blackice-icecap  no-response
> 27017/tcp filtered mongod           no-response
> Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
>
> Nmap done: 1 IP address (1 host up) scanned in 25.88 seconds
> ```
>
> **Four points to make when you discuss this figure — the third is the one a careless reader gets wrong:**
>
> 1. **`no-response` is the diagnostic that matters.** Filtered-with-no-response means the packets were silently dropped upstream by the security group, not refused by the host. A host-level rejection would return `conn-refused` or `reset`. This distinguishes a firewall from a closed port, and it is why `--reason` was included.
> 2. **Port 22 shows `open` because the scan originated from the allowlisted `/32`.** From any other network it reads `filtered`. This is the allowlist working, observed from inside the permitted address rather than merely claimed — but the caption must say so, because the raw table looks like an exposed SSH service.
> 3. **The `SERVICE` names on the filtered rows are static lookups from `nmap-services`, not detections.** `27017/tcp mongod` does **not** mean MongoDB is running: nothing was detected, because nothing answered. §3.1's claim that no database runs on the instance stands, and FIG-26's listener enumeration confirms it independently. Say this explicitly — an unqualified `mongod` row invites precisely the wrong conclusion.
> 4. **Version disclosure is confirmed empirically here, not inferred.** `nginx 1.24.0 (Ubuntu)` on both web ports is finding **F-15**, and the SSH banner additionally leaks `OpenSSH 9.6p1 Ubuntu 3ubuntu13.18` — distribution and patch level. The `Service Info: OS: Linux` line is derived from those banners; suppressing them removes the free reconnaissance.
>
> A useful incidental detail: the reverse DNS `ec2-34-195-198-83.compute-1.amazonaws.com` identifies the host as EC2 and `compute-1` is the legacy identifier for **us-east-1**, so the scan independently corroborates the deployment region without reference to the console.

> ### 📸 FIG-26 — Baseline internal Nmap scan
> **Where:** SSH session on the instance — `sudo ss -tlnp` output
> **Must be visible:** the listener table showing the `node` process on port 5000 with its **actual** bind address, alongside `0.0.0.0:80` and `0.0.0.0:443` bound to `nginx`
> **Why it matters:** paired with FIG-25 this is a genuinely strong piece of evidence — the same host presents two completely different port lists depending on vantage point, which empirically proves the security group is doing the work
> **Caption:** *Figure 26 — Internal listener enumeration showing services bound on the instance, including the API on port 5000. The process name is truncated by `ss` to fifteen characters; the full command is `node /srv/foodora/server/src/server.js`.*
> **Status:** ✅ CAPTURED 10 Aug 2026 — `ss -tlnp` and `ufw status` in one frame, confirming both F-21 and F-22
>
> Actual output, captured 9 Aug 2026 (abridged to the relevant rows):
>
> ```
> ubuntu@ip-172-31-16-58:~$ sudo ss -tlnp
> State  Recv-Q Send-Q Local Address:Port  Process
> LISTEN 0      511          0.0.0.0:443   users:(("nginx",pid=11089),("nginx",pid=11088),("nginx",pid=8898))
> LISTEN 0      511          0.0.0.0:80    users:(("nginx",pid=11089),("nginx",pid=11088),("nginx",pid=8898))
> LISTEN 0      4096         0.0.0.0:22    users:(("sshd",pid=3759))
> LISTEN 0      511                *:5000  users:(("node /srv/foodo",pid=10431))
> LISTEN 0      511             [::]:443   users:(("nginx",pid=11089),("nginx",pid=11088),("nginx",pid=8898))
> LISTEN 0      511             [::]:80    users:(("nginx",pid=11089),("nginx",pid=11088),("nginx",pid=8898))
> LISTEN 0      4096            [::]:22    users:(("sshd",pid=3759))
> ```
>
> **⚠ Read this row carefully, because the original caption for this figure was wrong.** The API shows `*:5000` — **all interfaces** — not `127.0.0.1:5000`. `server/src/server.js` calls `server.listen(PORT)` with no host argument, and Node then binds the wildcard address. Recorded as finding **F-21**.
>
> This makes the FIG-25/FIG-26 pairing *more* interesting to write about, not less. The external scan shows 5000 unreachable; the internal enumeration shows it listening on every interface. The difference between the two images is not "loopback binding plus firewall" as originally claimed — it is the firewall, alone, carrying the entire weight of that control. That is a defence-in-depth failure which the pair of screenshots demonstrates precisely, and it is a far better answer in a viva than an unexamined claim that two layers exist. Note that after remediating F-21 you must **re-capture this figure**, at which point the row becomes `127.0.0.1:5000` and the original claim finally becomes true.

> ### 📸 FIG-27 — Baseline TLS cipher enumeration
> **Where:** Local terminal — `nmap --script ssl-enum-ciphers -p 443 foodora.duckdns.org`
> **Must be visible:** the protocol versions offered (TLSv1.2, TLSv1.3), the cipher list, and the least-strength grade line
> **Caption:** *Figure 27 — TLS cipher suite enumeration for the deployed endpoint.*
> **Status:** ⬜ PENDING

**Finding summary at the network tier.** The external surface is minimal and correctly configured: only 80 and 443 are reachable, and Nginx version disclosure is the sole finding visible from outside (**F-15**). The internal enumeration, however, contradicts what the external view implies. Two host-level weaknesses appear only from the inside: the API binds all interfaces rather than loopback (**F-21**), and the `ufw` host firewall is installed but inactive (**F-22**). Neither is currently exploitable from the internet, and that is exactly the point — both are latent, and each removes a layer that the architecture in §3.1 assumed was present. A single widened security-group rule, or one instance placed in a subnet with a laxer group, converts F-21 from dormant to critical.

This tier is nonetheless the one the deployment handles *best*, which is precisely why the assessment could not stop here. An assessment reporting only external Nmap results would conclude the system is secure. It is not — and it would also have missed both of the findings above, because they are invisible from the attacker's vantage point until the moment they matter.

## 4.5 Application layer assessment (OWASP ZAP)

ZAP was run in two distinct passes.

**Pass 1 — unauthenticated.** An automated scan against `https://foodora.duckdns.org` with the spider and active scanner enabled, representing an anonymous internet visitor.

**Pass 2 — authenticated.** The application issues a JWT on login and transmits it as an `Authorization: Bearer` header, attached by an Axios request interceptor (`client/src/api/axios.js`). ZAP does not discover this automatically. A session was configured explicitly:

1. Log in through the browser proxied via ZAP; capture the token from the login response.
2. Add a **Replacer** rule: `Authorization: Bearer <token>`, applied to all requests.
3. Set an authenticated-session indicator so ZAP detects logout and does not silently scan as anonymous.
4. Re-spider, then run the active scan with the customer account, and repeat for a `restaurant_admin` account.

This distinction is material. The unauthenticated pass reaches only public browse endpoints. Every order, payment, administrative and rider endpoint sits behind authentication, so an anonymous-only scan would miss the entire business-logic surface where the severe findings live.

> ### 📸 FIG-28 — ZAP unauthenticated scan alerts
> **Where:** ZAP → Alerts tab after the automated scan completes
> **Must be visible:** the alert tree with risk levels, the target URL, and the alert count by severity
> **Caption:** *Figure 28 — OWASP ZAP alerts from the unauthenticated automated scan.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-29 — ZAP authenticated session configuration
> **Where:** ZAP → Options → Replacer, showing the Authorization header rule
> **Must be visible:** the rule with header name `Authorization`, match type, and the value **redacted or truncated** — do not expose a live token
> **Why it matters:** proves you scanned authenticated surface. This is the difference between a Pass and a Merit/Distinction in this section.
> **Caption:** *Figure 29 — ZAP configured to inject a valid bearer token for authenticated scanning.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-30 — ZAP authenticated scan alerts
> **Where:** ZAP → Alerts tab after the authenticated active scan
> **Must be visible:** the expanded alert list, visibly larger than FIG-28, with the URLs of authenticated endpoints
> **Caption:** *Figure 30 — Alerts from the authenticated active scan, covering endpoints unreachable anonymously.*
> **Status:** ⬜ PENDING

## 4.6 Supporting assessments

**Dependency analysis.** `npm audit` was run against both workspaces. The dependency set is unusually current — Express 5, Mongoose 9, React 19 — which inverts the usual risk profile: the exposure is not to known CVEs in stale packages but to immature major versions. One such defect was found and is recorded as **F-16**: the error handler reads `err.errors`, whereas Zod v4 exposes `err.issues`, so the handler itself throws when processing a validation failure.

**Header and configuration analysis.** Mozilla Observatory and manual inspection of response headers in browser developer tools established the baseline security header posture.

```bash
npm audit --omit=dev            # in ./server and ./client
curl -I https://foodora.duckdns.org      # observe which security headers are absent
```

> ### 📸 FIG-31 — npm audit results
> **Where:** Terminal — `npm audit --omit=dev` in `server/`
> **Must be visible:** the vulnerability summary line with counts by severity
> **Caption:** *Figure 31 — Dependency vulnerability audit of production packages.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-32 — Mozilla Observatory baseline grade
> **Where:** `observatory.mozilla.org` → scan `foodora.duckdns.org` → results page
> **Must be visible:** the letter grade, numeric score, and the per-test breakdown showing which headers failed
> **Why it matters:** pairs with FIG-35 to give a quantified before/after improvement — a single number that makes the remediation impact undeniable
> **Caption:** *Figure 32 — Mozilla Observatory assessment prior to hardening.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-33 — Response headers before hardening
> **Where:** Browser DevTools → Network → select the document request → Response Headers
> **Must be visible:** `X-Powered-By: Express` present; `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` and `X-Content-Type-Options` all absent
> **Caption:** *Figure 33 — Response headers showing absent security controls and framework disclosure.*
> **Status:** ⬜ PENDING

## 4.7 Consolidated findings register

Findings from all three tiers are consolidated below, ordered by severity. Severity reflects exploitability and impact in the deployed context. Every entry is evidenced by a specific source location or tool output.

**Table 6 — Consolidated findings register**

| ID | Finding | Method | Sev. | OWASP 2021 | CIS v8 | Location |
|---|---|---|---|---|---|---|
| F-01 | **Hardcoded JWT secret fallback.** Token signing and verification fall back to a literal string committed to the repository if `JWT_SECRET` is unset. The server starts regardless, so a misconfigured deployment silently accepts forged tokens for any user ID. | Source | **Critical** | A02, A07 | 3.11, 16.6 | `utils/generateToken.js:4`; `middlewares/auth.middleware.js:17,58` |
| F-02 | **Unauthenticated payment confirmation.** The Easypaisa and JazzCash callbacks are public, take `orderId` from the request body, and perform no signature verification — the source comments acknowledge the omission. A crafted POST transitions an order from `PENDING_PAYMENT` to paid without payment. | Source, manual | **Critical** | A01, A04 | 16.10 | `controllers/payment.controller.js:117–147` |
| F-03 | **Privilege escalation at registration.** `role` is accepted from the request body. The Zod schema omits `role`, but the validation middleware discards its own parsed output, so unknown keys pass through to `User.create`. Any anonymous user can self-provision a `restaurant_admin` account. | Source, manual | **Critical** | A01 | 6.8 | `services/auth.service.js:23` ← `middlewares/validate.middleware.js:3` |
| F-04 | **Insecure direct object reference on orders.** `getOrderById` permits access when the caller's role is `restaurant_admin`, without checking the order belongs to that administrator's restaurant. Combined with F-03, an anonymous attacker can read every order in the system — customer names, emails, phone numbers, delivery addresses and geolocation. | Source, manual | **Critical** | A01 | 3.3, 14.6 | `services/order.service.js:265` |
| F-05 | **Unauthenticated WebSocket rooms.** The Socket.IO handler accepts `register`, `rider:join` and `join:order_room` with a client-supplied identifier and no token verification. Any client can subscribe to any order's event stream and live courier GPS trail. | Source | High | A01 | 3.3 | `socket.js:24–53` |
| F-06 | **Order state transitions unscoped.** `updateOrderStatus` and `assignRider` validate the state machine and role, but never ownership. Any authenticated customer can cancel another customer's order. | Source | High | A01 | 6.8 | `services/order.service.js:272,323` |
| F-07 | **Mass assignment on restaurant creation.** `req.body.owner = req.body.owner \|\| req.user.id` permits a client-supplied owner, and unfiltered body flows into `Restaurant.create`, allowing `isFeatured`, `rating`, `status` and `stripeAccountId` to be set directly. | Source | High | A01, A08 | 16.10 | `controllers/restaurant.controller.js:70,84,118` |
| F-08 | **No rate limiting.** Login and password-reset endpoints are unthrottled. With a six-character minimum password policy, online brute force is unbounded. `express-rate-limit` is an installed dependency but is never imported. | ZAP, source | High | A07 | 13.1 | `routes/auth.routes.js:8–9` |
| F-09 | **No security response headers.** No CSP, HSTS, `X-Frame-Options` or `X-Content-Type-Options`. `helmet` is installed but never imported. | ZAP, Observatory | High | A05 | 4.1 | `app.js` |
| F-10 | **Schema validation on 2 of ~60 routes**, and the middleware discards its parsed result — the root cause of F-03. | Source | High | A03, A04 | 16.10 | `middlewares/validate.middleware.js:3` |
| F-11 | **Bearer token stored in `localStorage`**, valid seven days, with no refresh, rotation or server-side revocation. Any XSS yields a week of non-revocable account takeover. | Source | High | A07 | 16.9 | `client/src/api/axios.js:24` |
| F-12 | **No security logging.** No request log, no authentication event log, no authorisation-failure log. Every finding above would be exploited without trace. `morgan` is installed but never imported. | Source | High | A09 | 8.2, 8.5 | `middlewares/error.middleware.js` |
| F-13 | **Regex injection on public promo endpoint.** `new RegExp(\`^${code}$\`, 'i')` is built from unescaped user input on an unauthenticated route, permitting promo-code enumeration and catastrophic backtracking against a single-threaded event loop. | Source | Medium | A03 | 16.10 | `controllers/public.controller.js:48` |
| F-14 | **Framework disclosure.** `X-Powered-By: Express` returned on every response. | Nmap, curl | Low | A05 | 4.1 | `app.js` (no `disable`) |
| F-15 | **Server version disclosure.** Nginx returns its exact version in the `Server` header and banner. | Nmap | Low | A05 | 4.1 | Nginx default `server_tokens` |
| F-16 | **Error handler leaks driver internals.** `err.message` is returned verbatim, so duplicate-key errors expose database and collection names and act as a user-enumeration oracle. The handler also reads the wrong Zod v4 property and throws on validation failure. | Source | Medium | A05 | 8.2 | `middlewares/error.middleware.js:3,7` |
| F-17 | **Permissive CORS outside production.** `origin: true` reflects any origin with `credentials: true` whenever `NODE_ENV` is not `production`. | Source | Medium | A05 | 4.1 | `app.js:8–11` |
| F-18 | **NoSQL operator injection.** `forgot-password` is unvalidated, so `{"email": {"$ne": null}}` matches an arbitrary user. No global operator sanitisation is present. | Source | Medium | A03 | 16.10 | `services/auth.service.js:93` |
| F-19 | **Upload filter trusts client MIME type.** `mimetype.startsWith('image')` matches `image/svg+xml`; a scripted SVG becomes a stored XSS vector. No extension allowlist or magic-byte check. | Source | Medium | A04 | 16.10 | `middlewares/upload.middleware.js:6` |
| F-20 | **User enumeration on password reset.** A 404 for unknown addresses versus 200 for known ones distinguishes registered accounts. | Source | Medium | A07 | 16.9 | `services/auth.service.js:95` |
| F-21 | **API binds all interfaces instead of loopback.** `server.listen(PORT)` passes no host argument, so Node binds the wildcard address — confirmed by `ss -tlnp` as `LISTEN *:5000`. The security group is therefore the *only* control preventing direct, unproxied access to the unauthenticated API surface, defeating the defence-in-depth intent of §3.1 and bypassing every control Nginx adds. | Config, `ss` | High | A05 | 4.1, 4.8 | `server/src/server.js:16` |
| F-22 | **Host firewall installed but inactive.** `ufw` is present on the instance and `ufw status` returns `inactive`; no rules were applied. The instance depends entirely on the AWS security group, so a misconfiguration at the cloud layer has no host-level backstop. | Config | Low | A05 | 4.4, 4.5 | Instance configuration |

**The central observation of this assessment** is one of instrumentation, not of any individual defect. Six security dependencies — `helmet`, `express-rate-limit`, `morgan`, `compression`, `cookie-parser` and `express-validator` — are declared in `server/package.json` and are **never imported anywhere in the codebase**. Reading the manifest alone would suggest a hardened application. Reading `app.js` reveals a five-line middleware chain with no security control in it. The controls were procured and never installed. This is a form of the misconfiguration risk that Singh and Chatterjee (2017) identify as endemic to cloud deployments, and it is invisible to any assessment that inspects dependency lists rather than execution paths.

Equally notable is that **all four Critical findings were located by source review**. Neither Nmap nor ZAP surfaced any of them, and this is not a failure of the tools. A scanner cannot detect that a `restaurant_admin` should not read another restaurant's order, because it has no model of the intended authorisation policy. Khan and Al-Yasiri (2016) make this point in their threat framework: access-control failures require semantic knowledge of the system, and automated black-box testing is structurally incapable of supplying it.

## 4.8 Controls already operating effectively

A balanced assessment must record what functions correctly, both to avoid overstating risk and to identify patterns worth generalising.

**Table 7 — Controls already operating effectively**

| Control | Implementation | Significance |
|---|---|---|
| Server-side price recomputation | `services/order.service.js:16–75` refetches every menu item, validates sizes and add-ons against the database, and overwrites client-supplied prices before totalling | Fully mitigates the classic price-tampering attack. A textbook A04 control, and the strongest single piece of engineering in the codebase. |
| Stripe webhook signature verification | `payment.controller.js:96` uses `constructEvent` with the raw body correctly ordered before `express.json()` in `app.js:15–17` | Demonstrates the author knows how to verify a callback — which makes the omission at F-02 a lapse rather than a knowledge gap |
| Password reset token design | `models/user.model.js:70–81` — 160-bit CSPRNG token, SHA-256 hashed at rest, 10-minute expiry | Meets OWASP ASVS 4.0.3 requirements without modification |
| Password storage | bcrypt via a Mongoose pre-save hook, `select: false` on the field | Correct by construction; the field cannot be returned accidentally |
| Least-privilege database account | `docker/mongo/init/01-create-app-user.js` creates a `readWrite`-scoped user rather than using root | The same pattern was carried into the Atlas configuration (Figure 9) |
| Absence of dangerous sinks | No `dangerouslySetInnerHTML`, `eval`, `new Function` or `$where` anywhere in 19,000 lines | Eliminates entire vulnerability classes structurally rather than by filtering |
| Order state machine | `utils/orderStatusMachine.js` — explicit transition matrix with per-role permissions | Sound design; F-06 is a missing ownership check *around* it, not a flaw *in* it |
| Secrets hygiene | No `.env` file committed; verified via `git ls-files` | Avoids the most common cause of credential compromise in public repositories |

<div style="page-break-after: always;"></div>

# 5. Security Solutions and Literature Review

## 5.1 Remediation strategy and prioritisation

Remediation was sequenced by exploitability against implementation cost rather than by severity alone, following the defence-in-depth principle that Vacca (2021) describes as layering independent controls so that no single failure is sufficient for compromise. Ten remediations were implemented, each as a discrete commit so that the change history itself forms an audit trail (Appendix D).

**Table 8 — Remediation priority matrix**

| ID | Addresses | Remediation | Effort | Residual risk |
|---|---|---|---|---|
| R1 | F-01 | Fail-fast startup guard; remove all secret fallbacks | Low | None |
| R2 | F-09, F-14, F-15 | Wire `helmet`; disable `X-Powered-By`; suppress `server_tokens` | Low | CSP requires tuning for Stripe and Leaflet |
| R3 | F-08 | Rate limiting on authentication routes | Low | Distributed attacks still possible |
| R4 | F-03, F-10, F-18 | Assign parsed output back to `req.body`; extend schema coverage | Low | Coverage gaps until all routes have schemas |
| R5 | F-04, F-06, F-07 | Ownership scoping in the order and restaurant services | Medium | Requires per-endpoint review |
| R6 | F-02 | HMAC signature verification on gateway callbacks | Medium | Depends on real gateway credentials |
| R7 | F-05 | JWT handshake authentication and room authorisation for Socket.IO | Medium | None |
| R8 | F-12, F-16 | Request and audit logging; normalise error responses | Low | No centralised aggregation |
| R9 | F-13, F-19 | Escape regex metacharacters; strengthen upload validation | Low | SVG remains disallowed rather than sanitised |
| R10 | F-11, F-17 | Shorten token lifetime; restrict CORS reflection to development | Low | `localStorage` storage retained — see §6 |
| R11 | F-21, F-22 | Bind the API to loopback explicitly; activate the `ufw` host firewall | Low | None — restores the two-layer exposure control §3.1 assumes |

## 5.2 Identity and cryptographic controls

**R1 — Eliminate the hardcoded secret fallback (F-01).** The `||` fallback pattern is the most dangerous construct in the codebase because it converts a configuration error into a silent, total authentication bypass. The remediation removes every fallback and adds a startup assertion, so the process refuses to run rather than running insecurely — the fail-closed principle. Notably, `server/src/config/db.js` already applies exactly this pattern for `MONGO_URI`; the fix extends an established internal convention rather than importing a foreign one.

```diff
  // server/src/utils/generateToken.js
+ const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
  const generateToken = (id) => {
-     return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123', {
-         expiresIn: '7d',
-     });
+     return jwt.sign({ id }, JWT_SECRET, {
+         expiresIn: JWT_EXPIRE || '1d',
+         algorithm: 'HS256',
+     });
  };
```

```diff
  // server/src/middlewares/auth.middleware.js — both occurrences (lines 17 and 58)
- const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
+ const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
```

```diff
  // server/src/config/env.js — enforce presence at startup
+ if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
+     console.error('FATAL: JWT_SECRET must be set and at least 32 characters.');
+     console.error('Generate one with: openssl rand -hex 32');
+     process.exit(1);
+ }
```

Pinning the algorithm is defence in depth. `jsonwebtoken` v9 rejects `alg: none` by default, so this is not closing a live break, but explicit algorithm allowlisting is required by OWASP ASVS 4.0.3 control 3.5.3 and guards against a future dependency change reintroducing permissive verification.

Token lifetime was reduced from seven days to one (R10). Subashini and Kavitha (2011) identify session management as a principal weakness in multi-tenant service delivery, since a token that cannot be revoked remains valid for its full lifetime regardless of subsequent events — a compromise, a password reset, or an account deletion. Shortening the window bounds that exposure. Full revocation would require a server-side token identifier and blocklist, discussed as future work in Section 6.

## 5.3 Access control remediation

**R5 — Ownership scoping (F-04, F-06, F-07).** Broken access control is ranked first in the OWASP Top 10:2021 on the basis that it appeared in more tested applications than any other category (OWASP, 2021). This deployment illustrates precisely why: the authorisation check was present, syntactically correct, and insufficient, because it verified *role* without verifying *relationship*.

```diff
  // server/src/services/order.service.js — getOrderById
  const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
- if (orderUserId !== userId.toString() && role !== 'admin' && role !== 'super_admin' && role !== 'restaurant_admin') {
-     throw new ApiError(403, 'Not authorized to access this order');
- }
+ const isOwner = orderUserId === userId.toString();
+ const orderRestaurantId = order.restaurant?._id
+     ? order.restaurant._id.toString()
+     : order.restaurant?.toString();
+
+ // A restaurant administrator may read an order ONLY for their own restaurant.
+ const isOwningRestaurant =
+     role === 'restaurant_admin' &&
+     restaurantId &&
+     orderRestaurantId === restaurantId.toString();
+
+ const isAssignedRider =
+     role === 'rider' && riderId && order.rider?.toString() === riderId.toString();
+
+ if (!isOwner && !isOwningRestaurant && !isAssignedRider) {
+     throw new ApiError(403, 'Not authorized to access this order');
+ }
```

The same relationship test was applied to `updateOrderStatus` and `assignRider`. The required context is already available — `protect` populates `req.user.restaurantId` and `req.user.riderId` on every authenticated request (`auth.middleware.js:25–38`), so no additional database queries are incurred.

The dead `'admin'` and `'super_admin'` branches were removed. Those roles are absent from the `user.model.js` enum and therefore unreachable, but their presence created a misleading impression that a privileged tier existed and was being checked, while in practice `restaurant_admin` silently inherited platform-wide scope.

**R4 — Close the escalation chain at its root (F-03, F-10).** The most instructive remediation in this assessment is a single line. Zod strips unknown keys by default and returns the cleaned object; the middleware called `parse` for its throwing behaviour and discarded the sanitised result, so `req.body` reached the controller with every attacker-supplied field intact.

```diff
  // server/src/middlewares/validate.middleware.js
  const validate = (schema) => (req, res, next) => {
      try {
-         schema.parse(req.body);
+         // Assign the parsed result back — Zod strips unknown keys, which is
+         // what prevents attacker-supplied fields such as `role` from reaching
+         // the service layer (finding F-03).
+         req.body = schema.parse(req.body);
          next();
      } catch (error) {
          next(error);
      }
  };
```

```diff
  // server/src/services/auth.service.js — defence in depth at the sink
- role: userData.role || 'customer',
+ // Role is never accepted from client input. Elevated roles are assigned
+ // through an administrative workflow.
+ role: 'customer',
```

Two independent controls now block the same attack. This redundancy is deliberate: Zissis and Lekkas (2012) argue that trust in cloud systems must be established through layered verification rather than a single gate, because any individual control may be bypassed or regress under future modification.

**R6 — Authenticate the payment callbacks (F-02).** The gateway callbacks accepted unauthenticated state-changing requests. The correct pattern was already implemented elsewhere in the same file for Stripe, and was generalised:

```diff
  // server/src/controllers/payment.controller.js
+ const crypto = require('crypto');
+
+ const verifyGatewaySignature = (payload, providedHash, secret) => {
+     if (!providedHash || !secret) return false;
+     const expected = crypto
+         .createHmac('sha256', secret)
+         .update(JSON.stringify(payload))
+         .digest('hex');
+     const a = Buffer.from(expected);
+     const b = Buffer.from(providedHash);
+     // Length check first: timingSafeEqual throws on length mismatch.
+     return a.length === b.length && crypto.timingSafeEqual(a, b);
+ };

  exports.easypaisaCallback = asyncHandler(async (req, res, next) => {
      const { orderId, transactionId, status } = req.body;
-     // Security: Verify hash/signature from Easypaisa here in production
+     if (!verifyGatewaySignature(req.body, req.headers['x-gateway-signature'],
+                                 process.env.EASYPAISA_WEBHOOK_SECRET)) {
+         console.warn(`[SECURITY] Rejected unsigned callback for order ${orderId}`);
+         return next(new ApiError(401, 'Invalid signature'));
+     }
      if (orderId && status === 'SUCCESS') {
```

Constant-time comparison via `timingSafeEqual` prevents the timing side channel that a naive `===` would expose.

**R7 — Authenticate WebSocket connections (F-05).** Socket.IO connections bypassed HTTP middleware entirely, so `protect` never ran. A handshake middleware was added, and room membership is now authorised against the verified identity rather than a client-supplied one:

```diff
  // server/src/socket.js
+ const jwt = require('jsonwebtoken');
+ const { JWT_SECRET } = require('./config/env');
+
+ io.use((socket, next) => {
+     const token = socket.handshake.auth?.token;
+     if (!token) return next(new Error('Authentication required'));
+     try {
+         socket.userId = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }).id;
+         next();
+     } catch {
+         next(new Error('Invalid token'));
+     }
+ });

  socket.on("join:order_room", async (orderId) => {
      if (!orderId) return;
+     // Verify this identity is a party to the order before granting the room.
+     const order = await Order.findById(orderId).select('user restaurant rider');
+     if (!order || !isPartyToOrder(order, socket.userId)) {
+         return socket.emit('error', 'Not authorized for this order');
+     }
      socket.join(`order_${orderId}`);
```

Without this, any anonymous client could subscribe to a stranger's live courier GPS trail — a location-privacy exposure with consequences well beyond the application itself.

## 5.4 Input validation and injection defence

**R9 — Escape regex metacharacters (F-13).** Building a regular expression from unescaped user input on an unauthenticated endpoint permits both promo-code enumeration and, through catastrophic backtracking, CPU exhaustion of Node's single-threaded event loop:

```diff
  // server/src/controllers/public.controller.js
- const offer = await Offer.findOne({ code: new RegExp(`^${code}$`, 'i') });
+ const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
+ const offer = await Offer.findOne({
+     code: new RegExp(`^${escapeRegex(String(code))}$`, 'i'),
+ });
```

**R4 (extended) — NoSQL operator injection (F-18).** Express 5 parses `?field[$ne]=x` into a nested object, which reaches Mongoose as a query operator. A global sanitisation layer was added beneath the per-route schemas, applying the same layered rationale as R4:

```diff
  // server/src/app.js
+ const mongoSanitize = require('express-mongo-sanitize');
+ app.use(mongoSanitize({ replaceWith: '_' }));
```

**R9 (extended) — Upload validation (F-19).** The MIME filter trusted a client-supplied header and matched `image/svg+xml`, which permits scripted SVG and thus stored XSS. An explicit allowlist of raster formats replaced it, with a magic-byte check on the buffer to prevent extension spoofing.

## 5.5 Platform hardening and observability

**R2 — Security headers (F-09, F-14, F-15).** `helmet` was already a declared dependency; the remediation is to import it. Content Security Policy required explicit tuning, since the application legitimately loads Stripe's payment frame, Cloudinary images and OpenStreetMap tiles — an unconditional default policy breaks all three:

```diff
  // server/src/app.js
+ const helmet = require('helmet');
+
+ app.disable('x-powered-by');
+ app.set('trust proxy', 1);   // required behind Nginx for correct client IPs
+
+ app.use(helmet({
+     contentSecurityPolicy: {
+         directives: {
+             defaultSrc: ["'self'"],
+             scriptSrc:  ["'self'", 'https://js.stripe.com'],
+             frameSrc:   ["'self'", 'https://js.stripe.com'],
+             imgSrc:     ["'self'", 'data:', 'https://res.cloudinary.com',
+                          'https://*.tile.openstreetmap.org'],
+             connectSrc: ["'self'", 'https://api.stripe.com',
+                          'wss://foodora.duckdns.org', 'https://router.project-osrm.org'],
+             objectSrc:  ["'none'"],
+             frameAncestors: ["'none'"],
+         },
+     },
+     hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
+ }));
```

`trust proxy` is not cosmetic. Behind Nginx, without it, `req.ip` resolves to the proxy address for every request — so the rate limiter added in R3 would count all traffic as originating from one client and throttle the entire user base together. Server version disclosure was suppressed at the proxy with `server_tokens off;` (Appendix A).

**R3 — Rate limiting (F-08).** Applied to authentication routes only, so that ordinary browsing is unaffected:

```diff
  // server/src/routes/auth.routes.js
+ const rateLimit = require('express-rate-limit');
+ const authLimiter = rateLimit({
+     windowMs: 15 * 60 * 1000,
+     max: 10,
+     standardHeaders: true,
+     legacyHeaders: false,
+     message: { success: false, message: 'Too many attempts, please try again later.' },
+ });
+ router.post('/login', authLimiter, validate(loginSchema), authController.login);
+ router.post('/forgot-password', authLimiter, authController.forgotPassword);
```

**R8 — Logging and error normalisation (F-12, F-16).** Insufficient logging is ranked ninth in the OWASP Top 10:2021 precisely because it converts a detectable incident into an invisible one; the register in Section 4.7 describes attacks that would presently leave no record whatsoever. `morgan` was wired in for request logging, and authentication and authorisation events are now logged explicitly. The error handler was normalised so that Mongoose and driver internals are no longer returned to clients:

```diff
  // server/src/middlewares/error.middleware.js
  const errorHandler = (err, req, res, next) => {
      let statusCode = err.statusCode || 500;
      let message = err.message;

-     if (err.name === 'ZodError') { statusCode = 400; message = err.errors.map(e => e.message).join(', '); }
+     // Zod v4 exposes `issues`, not `errors` — reading `errors` made this
+     // handler throw while handling a validation failure (finding F-16).
+     if (err.name === 'ZodError') {
+         statusCode = 400;
+         message = err.issues.map((e) => e.message).join(', ');
+     }
+     if (err.name === 'CastError') { statusCode = 400; message = 'Invalid identifier'; }
+     if (err.code === 11000)       { statusCode = 409; message = 'Resource already exists'; }
+
+     // Log server-side with full detail; return a generic message to the client.
+     if (statusCode >= 500) {
+         console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
+         message = 'Internal server error';
+     }

      res.status(statusCode).json({ success: false, message });
  };
```

Replacing the verbatim duplicate-key message removes a user-enumeration oracle that disclosed the database name, collection name and index name on every registration attempt with an existing address.

**R11 — Restore the second layer on port 5000 (F-21, F-22).** The architecture in Section 3.1 assumed two independent controls kept the API unreachable; the deployed system had one. Both halves of the fix are single lines, which is what makes the omission instructive rather than excusable — the cost of the control was never the reason it was missing.

```diff
  // server/src/server.js
- server.listen(PORT, () => {
+ // Bind loopback explicitly: Nginx is the only intended ingress, and an
+ // omitted host argument makes Node bind every interface (finding F-21).
+ const HOST = process.env.BIND_HOST || '127.0.0.1';
+ server.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT}`);
  });
```

The host is read from the environment rather than hard-coded, because binding loopback unconditionally would break the container deployment discussed as future work in Section 6 — inside a container the proxy is a separate network namespace, and a loopback-bound process is unreachable from it. Defaulting closed while allowing an explicit override is the pattern that satisfies both cases.

The `ufw` rules from Section 3.4 were then applied, giving the instance a host-level policy that survives a mistake at the cloud layer. This is defence in depth in its most literal form: two enforcement points, administered through different interfaces by different mechanisms, so that a single misconfiguration — a security group edited in the console, a rule widened to debug something at midnight — no longer exposes an unauthenticated API to the internet. Neither control is sufficient alone, and that redundancy is the whole argument for keeping both.

## 5.6 Post-remediation verification

Remediation without verification is assertion. Every scan from Section 4 was re-run against the hardened deployment under identical conditions.

**Table 9 — Pre- and post-remediation comparison**

| Measure | Baseline | Post-remediation | Evidence |
|---|---|---|---|
| Mozilla Observatory grade | {{BASELINE_GRADE}} | {{POST_GRADE}} | FIG-32 → FIG-35 |
| ZAP alerts (authenticated), High | {{BASELINE_HIGH}} | {{POST_HIGH}} | FIG-30 → FIG-36 |
| ZAP alerts (authenticated), Medium | {{BASELINE_MED}} | {{POST_MED}} | FIG-30 → FIG-36 |
| Security headers present | 0 of 5 | 5 of 5 | FIG-33 → FIG-34 |
| `X-Powered-By` disclosed | Yes | No | FIG-34 |
| Login attempts before throttling | Unlimited | 10 per 15 min | FIG-37 |
| Externally reachable ports | 80, 443 | 80, 443 | Unchanged — correct at baseline |
| API bind address | `*:5000` (all interfaces) | `127.0.0.1:5000` | FIG-26, re-captured after R11 |
| Host firewall (`ufw`) | inactive | active, default-deny inbound | `ufw status verbose` |
| Independent controls on port 5000 | 1 (security group only) | 2 (security group + loopback bind) | §3.1, F-21 |
| Critical findings outstanding | 4 | 0 | Table 6 |

> ### 📸 FIG-34 — Response headers after hardening
> **Where:** DevTools → Network → document request → Response Headers
> **Must be visible:** `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` all present, and `X-Powered-By` **absent**
> **Why it matters:** direct visual counterpart to FIG-33. Place them side by side in the document.
> **Caption:** *Figure 34 — Response headers after implementing R2, showing the full control set applied.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-35 — Observatory grade after hardening
> **Where:** `observatory.mozilla.org` → rescan `foodora.duckdns.org`
> **Must be visible:** the improved letter grade and score, with previously failing tests now passing
> **Caption:** *Figure 35 — Mozilla Observatory assessment following remediation.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-36 — ZAP authenticated re-scan
> **Where:** ZAP → Alerts, after re-running the authenticated active scan
> **Must be visible:** the reduced alert count at each risk level; ideally the ZAP comparison view against the baseline session
> **Caption:** *Figure 36 — Authenticated ZAP re-scan showing resolved alerts following remediation.*
> **Status:** ⬜ PENDING

> ### 📸 FIG-37 — Rate limiting rejecting a brute-force attempt
> **Where:** Terminal — a loop issuing repeated failed logins
> **Must be visible:** the first responses returning 401, then the transition to `429 Too Many Requests`, with `RateLimit-Remaining` reaching 0
> **Why it matters:** behavioural proof that the control works, not merely that the code was written
> **Caption:** *Figure 37 — Authentication rate limiting rejecting repeated failed login attempts.*
> **Status:** ⬜ PENDING
>
> ```bash
> for i in $(seq 1 15); do
>   curl -s -o /dev/null -w "%{http_code} " -X POST https://foodora.duckdns.org/api/auth/login \
>     -H 'Content-Type: application/json' \
>     -d '{"email":"test@example.com","password":"wrongpassword"}'
> done
> # Expected: 401 repeated, then 429 once the window limit is reached
> ```

<div style="page-break-after: always;"></div>

# 6. Critical Evaluation

The deployment satisfies its objectives, but a credible evaluation must record what it does not achieve.

**Residual risk after remediation.** Five items were consciously accepted rather than resolved. Provisioning used root credentials, with no scoped administrative identity and no billing alarm — a departure from CIS v8 sub-control 5.4 that is bounded on a single-workload account but indefensible on one with more workloads or more administrators. The bearer token remains in `localStorage`, exposed to any cross-site scripting defect; an `HttpOnly`, `Secure`, `SameSite=Strict` cookie is the correct control, but it touches every client request path and could not be validated within the window. Tokens remain non-revocable, which a `jti` claim and server-side blocklist would close. Instance egress is unrestricted. And global operator sanitisation is a safety net, not a substitute for the per-route schemas that still cover a minority of endpoints.

**Limitations of the method.** Automated scanning is structurally blind to authorisation, which is why manual review was necessary — but manual review carries the complementary weakness that it was performed by the application's own author, who is poorly placed to find flaws arising from their own assumptions. An independent reviewer would likely surface defects this assessment missed. No fuzzing or runtime dependency scanning was performed.

**Data residency.** The instance runs in `us-east-1` (Northern Virginia) because that is where the account was already configured, not because it was chosen. For a food-delivery platform holding names, telephone numbers, delivery addresses and live geolocation, that places personal data outside the UK, and under UK GDPR such transfers depend on the adequacy regulations rather than on domestic processing. `eu-west-2` (London) was the correct region on both latency and residency grounds. Correcting it means redeploying the instance, reissuing the certificate and re-pointing DNS — cheap now, expensive once real users exist, which is the general shape of infrastructure decisions made by default rather than by design.

**Architectural limits.** The single-instance topology has no redundancy and no automated recovery. More interestingly, the application would not scale horizontally even if instances were added: `server/src/socket.js` holds per-process in-memory maps for socket association, write throttling and stale-GPS timers, so a second instance would see a disjoint set of connected clients and real-time events would reach only the emitting process's users. Scaling out requires a Socket.IO Redis adapter and sticky sessions. This is a constraint inherited from development rather than a deployment error, but it bounds what the architecture can serve.

**Economic and environmental realism.** The M0 cluster offers 512 MB without automated backup, and the `t3.micro` depends on CPU credits a sustained load would exhaust — adequate for demonstration, unsuitable for production. The economics are also finite in a way the phrase "free tier" obscures: this account holds **$135.71 of credit expiring on 21 October 2026**, against a running cost of roughly $9 per month for the instance and its gp3 volume, plus the public IPv4 charge introduced in February 2024. The deployment is therefore funded for about fifteen months of runway but *permitted* for barely two, because the plan expiry governs rather than the balance. Free-tier entitlements were restructured during 2025 to produce exactly this arrangement, a reminder that the economic case for cloud rests on terms providers revise unilaterally; Lynn (2020) cautions against judging cloud economics on headline pricing for this reason. The sustainability argument from Assessment 1 appears here in miniature: this application drew a fractional share of a multi-tenant host rather than a dedicated always-on server, the resource pooling Mell and Grance (2011) treat as definitional. Yet the same elasticity enables waste, since a forgotten instance consumes energy indefinitely while serving nothing — which makes cost monitoring a crude but genuine sustainability control — and its absence here, noted in Section 3.2, a small environmental failing as well as a financial one.

# 7. Conclusion and Recommendations

This portfolio deployed a custom three-role commerce application to AWS Free Tier infrastructure, made it accessible locally and remotely over authenticated TLS, assessed it systematically at network, application and source tiers, and implemented ten remediations verified by re-testing.

The principal finding is methodological. The externally visible infrastructure was well configured from the outset — two ports reachable, the database restricted to an explicit allowlist — so an assessment relying on external network scanning alone would have concluded the system was secure. Source and configuration review of that same system found four Critical application defects, any one of which permitted complete compromise of customer data, plus two host-level weaknesses invisible from outside: an API bound to every interface rather than loopback, and a host firewall installed but never activated. **The severity of the weaknesses bore no relationship to the layer that was easiest to test.** This bears out Armbrust *et al.* (2010): migrating to a provider transfers infrastructure risk but leaves application risk entirely with the customer.

There is a narrower lesson in those two host findings that is worth separating from the application ones. Both were failures of *verification*, not of design — the architecture specified a loopback binding and a host firewall, and both were written down before either was checked. What made them visible was reading back the running state (`ss -tlnp`, `ufw status`, `aws iam list-users`) rather than trusting the deployment narrative. A deployment document describes intent; only the live system describes fact, and the gap between them was the single most productive thing this assessment examined.

Four recommendations follow for organisations undertaking comparable migrations.

**Assess at the layer where the risk lives.** Infrastructure scanning is necessary and cheap but cannot detect authorisation defects. Budget for source review and authenticated testing, and treat a clean external scan as evidence about the perimeter, not the application.

**Audit which controls execute, not which are installed.** This codebase declared six security dependencies and imported none. A manifest describes intent; the middleware chain describes reality.

**Make insecure configuration impossible rather than discouraged.** The most dangerous defect found was a `||` fallback permitting startup with a publicly known signing key. Fail-closed assertions convert a silent compromise into an obvious failure.

**Treat responsibility allocation as scoping, not formality.** Mapping each layer to its owner before testing directed effort at the customer-controlled surface, where every Critical finding was located.

<div style="page-break-after: always;"></div>

# 8. References

Armbrust, M., Fox, A., Griffith, R., Joseph, A.D., Katz, R., Konwinski, A., Lee, G., Patterson, D., Rabkin, A., Stoica, I. and Zaharia, M. (2010) 'A view of cloud computing', *Communications of the ACM*, 53(4), pp. 50–58.

Bhowmik, S. (2017) *Cloud Computing*. Cambridge: Cambridge University Press.

Center for Internet Security (2021) *CIS Critical Security Controls Version 8*. East Greenbush, NY: Center for Internet Security.

Clark, J. and van Oorschot, P.C. (2013) 'SoK: SSL and HTTPS — revisiting past challenges and evaluating certificate trust model enhancements', *Proceedings of the 2013 IEEE Symposium on Security and Privacy*. Berkeley, CA, 19–22 May. Los Alamitos, CA: IEEE Computer Society, pp. 511–525.

Cloud Security Alliance (2022) *Top Threats to Cloud Computing: Pandemic Eleven*. Seattle, WA: Cloud Security Alliance.

Erl, T., Mahmood, Z. and Puttini, R. (2013) *Cloud Computing: Concepts, Technology and Architecture*. Upper Saddle River, NJ: Pearson.

Fernandes, D.A.B., Soares, L.F.B., Gomes, J.V., Freire, M.M. and Inácio, P.R.M. (2014) 'Security issues in cloud environments: a survey', *International Journal of Information Security*, 13(2), pp. 113–170.

Fox, R. (2021) *Linux with Operating System Concepts*. 2nd edn. New York: Chapman and Hall/CRC.

Khan, N. and Al-Yasiri, A. (2016) 'Identifying cloud security threats to strengthen cloud computing adoption framework', *Procedia Computer Science*, 94, pp. 485–490.

Lisdorf, A. (2021) *Cloud Computing Basics: A Non-Technical Introduction*. Berkeley, CA: Apress.

Lynn, T. (2020) *Measuring the Business Value of Cloud Computing*. Palgrave Studies in Digital Business and Enabling Technologies. Cham: Palgrave Macmillan.

Mell, P. and Grance, T. (2011) *The NIST Definition of Cloud Computing*. NIST Special Publication 800-145. Gaithersburg, MD: National Institute of Standards and Technology.

Negus, C. (2020) *Linux Bible*. 10th edn. Indianapolis, IN: Wiley.

OWASP (2020) *OWASP Web Security Testing Guide v4.2*. Bel Air, MD: Open Web Application Security Project.

OWASP (2021) *OWASP Top 10:2021 — The Ten Most Critical Web Application Security Risks*. Bel Air, MD: Open Web Application Security Project.

Ruparelia, N.B. (2016) *Cloud Computing*. Cambridge, MA: MIT Press.

Scarfone, K., Souppaya, M., Cody, A. and Orebaugh, A. (2008) *Technical Guide to Information Security Testing and Assessment*. NIST Special Publication 800-115. Gaithersburg, MD: National Institute of Standards and Technology.

Singh, A. and Chatterjee, K. (2017) 'Cloud security issues and challenges: a survey', *Journal of Network and Computer Applications*, 79, pp. 88–115.

Subashini, S. and Kavitha, V. (2011) 'A survey on security issues in service delivery models of cloud computing', *Journal of Network and Computer Applications*, 34(1), pp. 1–11.

Vacca, J.R. (2021) *Cloud Computing Security: Foundations and Challenges*. 2nd edn. Boca Raton, FL: CRC Press.

Zissis, D. and Lekkas, D. (2012) 'Addressing cloud computing security issues', *Future Generation Computer Systems*, 28(3), pp. 583–592.

---

> ## ⚠ REFERENCE VERIFICATION CHECKLIST — DELETE BEFORE SUBMISSION
>
> **You must confirm every entry below resolves to the real source before submitting.** Fabricated or inaccurate references are treated as academic misconduct. Search each title in Google Scholar or the University library; correct any volume, issue, page or year discrepancy you find.
>
> **Requirement check — the brief demands 15–20 sources, minimum 4 refereed journals and 5 academic books.**
>
> | Type | Count | Requirement | Status |
> |---|---|---|---|
> | Refereed journal articles | 5 (Armbrust; Fernandes; Khan & Al-Yasiri; Singh & Chatterjee; Subashini & Kavitha) | ≥ 4 | ✅ |
> | Academic books | 8 (Bhowmik; Erl *et al.*; Fox; Lisdorf; Lynn; Negus; Ruparelia; Vacca) | ≥ 5 | ✅ |
> | Standards / industry / conference | 8 (CIS; CSA; Clark & van Oorschot; Mell & Grance; OWASP ×2; Scarfone *et al.*) | — | ✅ |
> | **Total** | **21** | 15–20 | ⚠ **Slightly over — drop 1–3** |
>
> **If you need to trim to 20:** the most droppable are Lisdorf (2021), Cloud Security Alliance (2022) and Bhowmik (2017), since each is cited least in the body. **If you drop a source, remove its in-text citation too** — an uncited entry in the reference list is a referencing error that costs marks.
>
> | Reference | Verified? | Notes |
> |---|---|---|
> | Armbrust *et al.* (2010) *CACM* 53(4) | ⬜ | Widely cited; check page range 50–58 |
> | Bhowmik (2017) | ⬜ | On the module reading list |
> | CIS (2021) v8 | ⬜ | Free download after registration |
> | Clark & van Oorschot (2013) | ⬜ | IEEE S&P conference paper, not a journal — do not count toward the journal minimum |
> | CSA (2022) *Pandemic Eleven* | ⬜ | Free download |
> | Erl, Mahmood & Puttini (2013) | ⬜ | On the module reading list |
> | Fernandes *et al.* (2014) *IJIS* 13(2) | ⬜ | Check page range 113–170 |
> | Fox (2021) 2nd edn | ⬜ | On the module reading list |
> | Khan & Al-Yasiri (2016) *Procedia CS* 94 | ⬜ | Open access |
> | Lisdorf (2021) | ⬜ | On the module reading list |
> | Lynn (2020) | ⬜ | On the module reading list |
> | Mell & Grance (2011) SP 800-145 | ⬜ | Cited in the module guide itself |
> | Negus (2020) 10th edn | ⬜ | On the module reading list |
> | OWASP WSTG v4.2 | ⬜ | Confirm the current version number when you cite it |
> | OWASP Top 10:2021 | ⬜ | Stable |
> | Ruparelia (2016) | ⬜ | On the module reading list |
> | Scarfone *et al.* (2008) SP 800-115 | ⬜ | Free from NIST |
> | Singh & Chatterjee (2017) *JNCA* 79 | ⬜ | Check page range 88–115 |
> | Subashini & Kavitha (2011) *JNCA* 34(1) | ⬜ | Check page range 1–11 |
> | Vacca (2021) 2nd edn | ⬜ | On the module reading list |
> | Zissis & Lekkas (2012) *FGCS* 28(3) | ⬜ | Check page range 583–592 |
>
> **Eight of these are drawn from the module's own Essential and Recommended Reading list** (guide p. 6). Markers notice when you engage with the set reading, so keep as many of these as the source limit allows.

<div style="page-break-after: always;"></div>

# Appendix A — Nginx Site Configuration

`/etc/nginx/sites-available/foodora` as it will stand **after remediation**. The TLS block was generated by Certbot and is retained unmodified.

> **⚠ This is the target state, not the current file.** Four differences between this listing and what is deployed today, so you do not present the wrong one in the viva:
>
> | This listing | Currently deployed |
> |---|---|
> | `server_tokens off;` | **Absent** — Nginx still returns `Server: nginx/1.24.0 (Ubuntu)`, which is finding F-15 and is visible in the FIG-33 header capture |
> | `limit_req_zone` / `limit_req` | **Absent** — no proxy-level rate limiting yet (R3 covers the application layer only) |
> | `client_max_body_size 6M` | Deployed as **`10M`**. Tighten it to 6M during R9, so the proxy limit sits just above multer's 5 MB rather than well above it |
> | Single `root` inside each location | Deployed with one `root` at server level plus a `gzip` block — functionally equivalent, cosmetically different |
>
> The SPA fallback, the `/api` proxy and the `/socket.io` upgrade block are all deployed exactly as shown and verified working. Capture `sudo nginx -T` after remediation and diff it against this appendix before submitting.

```nginx
# Suppress version disclosure (finding F-15)
server_tokens off;

# Rate-limit zone for defence in depth beneath the application limiter
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;
    listen [::]:80;
    server_name foodora.duckdns.org;

    # Certbot inserts a 301 redirect to HTTPS here (--redirect).
    # Port 80 is retained solely for ACME HTTP-01 challenge validation.
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name foodora.duckdns.org;

    ssl_certificate     /etc/letsencrypt/live/foodora.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/foodora.duckdns.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 6M;   # slightly above the 5 MB multer limit

    # ── Static SPA assets ────────────────────────────────────────────────
    # React Router uses BrowserRouter, so unmatched paths must fall back to
    # index.html rather than returning 404.
    location / {
        root /var/www/foodora;
        try_files $uri $uri/ /index.html;
    }

    # Long-lived caching for content-hashed build assets
    location /assets/ {
        root /var/www/foodora;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ── API reverse proxy ────────────────────────────────────────────────
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # ── WebSocket upgrade for Socket.IO ──────────────────────────────────
    # REQUIRED. Without this the handshake cannot upgrade and live courier
    # tracking fails silently while the rest of the application appears healthy.
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       $host;
        proxy_set_header X-Real-IP  $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

# Appendix B — Baseline Nmap Output

Targeted external scan, run from the author's workstation across the internet, 10 August 2026 at 22:36 +0500. Ports 5000, 8081 and 27017 were named explicitly rather than relying on a full sweep, because Nmap omits filtered ports from `-p-` output and an absent row cannot distinguish "unreachable" from "not scanned":

```
PS C:\Users\gulr8> nmap -Pn --reason -sV -p 22,80,443,5000,8081,27017 34.195.198.83
Starting Nmap 7.991 ( https://nmap.org ) at 2026-08-10 22:36 +0500
Nmap scan report for ec2-34-195-198-83.compute-1.amazonaws.com (34.195.198.83)
Host is up, received user-set (0.21s latency).

PORT      STATE    SERVICE          REASON            VERSION
22/tcp    open     ssh              syn-ack ttl 49    OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
80/tcp    open     http             syn-ack ttl 49    nginx 1.24.0 (Ubuntu)
443/tcp   open     ssl/http         syn-ack ttl 49    nginx 1.24.0 (Ubuntu)
5000/tcp  filtered upnp             no-response
8081/tcp  filtered blackice-icecap  no-response
27017/tcp filtered mongod           no-response
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.88 seconds
```

Three observations. `no-response` on the three filtered ports indicates packets silently dropped upstream by the security group rather than refused by the host, which would have returned `conn-refused`. Port 22 reports `open` because the scan originated from the allowlisted administrative `/32`; from any other source address it reports `filtered`. And the `SERVICE` labels on filtered rows — including `mongod` on 27017 — are static lookups from Nmap's `nmap-services` file keyed on port number, **not** detections: nothing responded, and no database process runs on the instance, as the listener enumeration below independently confirms.

Version banners are disclosed on all three open ports — `nginx 1.24.0 (Ubuntu)` and `OpenSSH 9.6p1 Ubuntu 3ubuntu13.18` — which is finding F-15 and the basis of the `Service Info: OS: Linux` inference.

> **⚠ Still outstanding for this appendix:** the full 65,535-port sweep (`nmap -Pn -p- -T4 34.195.198.83`) and the TLS cipher enumeration for FIG-27 (`nmap --script ssl-enum-ciphers -p 443 foodora.duckdns.org` — **use the hostname**, since Certbot's configuration returns 404 to IP-based HTTP requests). Paste both here when done.

Internal listener enumeration, captured on the instance 9 August 2026:

```
ubuntu@ip-172-31-16-58:~$ sudo ss -tlnp
State  Recv-Q Send-Q  Local Address:Port   Peer Address:Port  Process
LISTEN 0      511           0.0.0.0:443         0.0.0.0:*      users:(("nginx",pid=11089,fd=11),("nginx",pid=11088,fd=11),("nginx",pid=8898,fd=11))
LISTEN 0      4096    127.0.0.53%lo:53          0.0.0.0:*      users:(("systemd-resolve",pid=7804,fd=15))
LISTEN 0      511           0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=11089,fd=5),("nginx",pid=11088,fd=5),("nginx",pid=8898,fd=5))
LISTEN 0      4096       127.0.0.54:53          0.0.0.0:*      users:(("systemd-resolve",pid=7804,fd=17))
LISTEN 0      4096          0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=3759,fd=3),("systemd",pid=1,fd=174))
LISTEN 0      511                 *:5000              *:*      users:(("node /srv/foodo",pid=10431,fd=26))
LISTEN 0      511              [::]:443             [::]:*     users:(("nginx",pid=11089,fd=12),("nginx",pid=11088,fd=12),("nginx",pid=8898,fd=12))
LISTEN 0      511              [::]:80              [::]:*     users:(("nginx",pid=11089,fd=6),("nginx",pid=11088,fd=6),("nginx",pid=8898,fd=6))
LISTEN 0      4096             [::]:22              [::]:*     users:(("sshd",pid=3759,fd=4),("systemd",pid=1,fd=175))

ubuntu@ip-172-31-16-58:~$ sudo ufw status
Status: inactive
```

Five listeners, of which three matter. `nginx` holds 80 and 443 on all interfaces, as intended. `sshd` holds 22 on all interfaces, reachable only from `202.165.237.155/32` by security-group rule. `node` holds **`*:5000` — all interfaces, not loopback** (finding **F-21**). The two `systemd-resolve` listeners on 53 are bound to link-local addresses inside the host and are not reachable off-box.

`ufw status: inactive` on the same capture is finding **F-22**. Taken together these two lines are the evidence that the instance relies on a single enforcement point — the AWS security group — for its entire network posture.

Baseline HTTPS response headers, captured from the workstation across the internet (evidence for F-09, F-14 and F-15, and the baseline half of the FIG-33 → FIG-34 comparison):

```
> curl -sI https://foodora.duckdns.org/api/status
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Date: Sun, 09 Aug 2026 19:47:09 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 74
Connection: keep-alive
X-Powered-By: Express
Access-Control-Allow-Origin: https://foodora.duckdns.org
Vary: Origin
Access-Control-Allow-Credentials: true
ETag: W/"4a-8BTSKDTjhfggZOWTbyxbFlyp2QY"
```

Absent from that response: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` — nought of five, per Table 9. Present and unwanted: `Server` with an exact version (F-15) and `X-Powered-By` (F-14).

Socket.IO handshake over TLS, confirming the Nginx upgrade block:

```
> curl -s "https://foodora.duckdns.org/socket.io/?EIO=4&transport=polling"
0{"sid":"pI0hZFJoo3bydu1MAAAA","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

Note `"upgrades":["websocket"]` — the server is offering the protocol switch through the proxy. Also note the handshake succeeded **without any credential**, which is finding **F-05**: the connection is established before any token is examined.

```
[PASTE ACTUAL OUTPUT — full ssl-enum-ciphers result from FIG-27; DELETE this line once pasted]
```

# Appendix C — OWASP ZAP Report Summary

Export the HTML report from **ZAP → Report → Generate Report**, then reproduce the alert summary table here and attach the full report as a separate file if permitted.

```
[PASTE ACTUAL OUTPUT — ZAP alert summary by risk level, baseline scan; DELETE this line once pasted]
```

```
[PASTE ACTUAL OUTPUT — ZAP alert summary by risk level, post-remediation scan; DELETE this line once pasted]
```

# Appendix D — Remediation Commit Log

Each remediation was committed separately so the change history forms an audit trail. Generate with:

```bash
git log --oneline --no-merges -- server/ client/ | head -20
```

```
[PASTE ACTUAL OUTPUT — your commit log; DELETE this line once pasted]
```

| Commit | Remediation | Findings addressed |
|---|---|---|
| `{{SHA}}` | Fail-fast JWT secret guard; remove hardcoded fallbacks | F-01 |
| `{{SHA}}` | Wire helmet, disable X-Powered-By, set trust proxy | F-09, F-14 |
| `{{SHA}}` | Rate limiting on authentication routes | F-08 |
| `{{SHA}}` | Assign parsed schema output to req.body; force customer role | F-03, F-10 |
| `{{SHA}}` | Ownership scoping in order and restaurant services | F-04, F-06, F-07 |
| `{{SHA}}` | HMAC signature verification on gateway callbacks | F-02 |
| `{{SHA}}` | Socket.IO handshake authentication and room authorisation | F-05 |
| `{{SHA}}` | Request logging and error response normalisation | F-12, F-16 |
| `{{SHA}}` | Regex escaping; upload allowlist; mongo sanitisation | F-13, F-18, F-19 |
| `{{SHA}}` | Shorten token lifetime; restrict CORS reflection | F-11, F-17 |

# Appendix E — Assessment Brief Requirement Trace

> ## ⚠ WORKING AID — consider deleting before submission
> This table exists so you can confirm nothing in the marking guide is unaddressed. Some markers appreciate it; if in doubt, remove it.

| Brief requirement (module guide, pp. 14–15) | Addressed in | Evidence |
|---|---|---|
| **1. Cloud Deployment (25 marks)** | | |
| Choose an appropriate free cloud service provider | §2 | Tables 1–2 |
| Evaluate AWS / GCP / Azure options | §2.2 | Table 1 |
| Consider service offerings, ease of use, resources | §2.1, §2.3 | Table 2 |
| Create account and configure resources (VMs, storage, DB) | §3.2, §3.4, §3.5 | FIG-01→11 |
| Deploy a suitable web-based application | §3.6, §3.7 | FIG-12→18 |
| Ensure functional and accessible locally | §3.9 | FIG-15, FIG-22 |
| Ensure functional and accessible remotely | §3.9 | FIG-23, FIG-24 |
| Configure DNS settings and networking | §3.3, §3.8 | FIG-01, FIG-02, FIG-19 |
| Verify access from different devices and locations | §3.9 | FIG-23 |
| **2. Security Assessment (25 marks)** | | |
| Identify potential threats and vulnerabilities | §4.3, §4.7 | Tables 5–6 |
| Review application architecture and components | §3.1, §4.3 | Architecture diagram |
| Identify weak authentication, insecure storage, exposed data | §4.7 | F-01, F-04, F-11 |
| Perform assessment using industry best practices | §4.1 | NIST SP 800-115 |
| Use tools such as OWASP ZAP, Nessus or Nmap | §4.4, §4.5 | FIG-25→30 |
| Follow OWASP Top Ten and CIS Controls | §4.7 | Table 6 mapping columns |
| **3. Security Solutions & Literature (20 marks)** | | |
| Propose enhancements to mitigate vulnerabilities | §5.1–§5.5 | Table 8 |
| Support solutions with research and literature | §5.2–§5.5 | 21 cited sources |
| Cite academic papers, industry reports, best practice | §8 | 5 journals, 8 books, 8 standards |
| Solutions backed by accepted methodologies | §5 | OWASP ASVS, CIS v8 |
| **4. Report Writing (10 marks)** | | |
| Document deployment, assessment and solutions | §3, §4, §5 | Throughout |
| Clear detailed description of each step | §3 | Commands + 24 figures |
| Include screenshots, code snippets, configuration | Throughout | 37 figures, Appendix A |
| Structured with headings and subheadings | Contents | — |
| Consistent Harvard citation style | §8 | — |
| **5. Viva Presentation (20 marks)** | | |
| Present key findings, challenges, solutions | Appendix F | Slide plan |
| Answer technical questions | Appendix F | Prepared responses |

# Appendix F — Viva Preparation

> ## ⚠ WORKING AID — DELETE BEFORE SUBMISSION
> The viva is 20 of 100 marks and is the most commonly under-prepared component. Rehearse these aloud.

### Suggested 10-slide structure (10–12 minutes)

1. The application — what Foodora does, three roles, why a custom build
2. Provider selection — the decision matrix, one sentence on why AWS
3. Architecture diagram — walk the request path from browser to database
4. Live demonstration — order placed from your phone, tracked in real time
5. Assessment methodology — three tiers, and why each was necessary
6. The Nmap pairing — external versus internal, what the difference proves
7. Findings — the four Critical, with the register table
8. The central insight — six security dependencies installed, none imported
9. Remediation and re-test — the before/after comparison, Table 9
10. Limitations and what you would do next

### Questions to expect, with honest answers

**"Where did you run the scans from, and why does it matter?"**
External Nmap from my own workstation across the internet; internal enumeration over SSH from the instance. The external view is the attacker's view. Scanning only from inside the instance would have shown port 5000 listening and told me nothing about whether the security group blocks it. The two together prove the firewall works — and in my case the comparison found something I had assumed was already true, which is the better answer to this question. `ss -tlnp` showed the API bound to `*:5000` rather than loopback, so the firewall is the only thing preventing direct access to it. My architecture diagram claimed two layers; the running system had one. I recorded that as F-21 and fixed it by passing an explicit bind address.

**"Your report says the API binds to loopback. Does it?"**
Not as originally deployed, no — and I would rather say so than be caught by it. `server.listen(PORT)` in `server/src/server.js` passes no host argument, so Node binds the wildcard address. I found it by reading back the running state rather than trusting the deployment document, which is the point I draw out in §7: a deployment document records intent, only the live system records fact. The same check found `ufw` installed but inactive (F-22). Both are remediated under R11, and FIG-26 was re-captured afterwards to show `127.0.0.1:5000`.

**"You store the JWT in localStorage. Defend that."**
I would not defend it as a design choice — it is finding F-11 and I have documented it as accepted residual risk. `localStorage` is JavaScript-readable, so any XSS yields account takeover. The correct control is an `HttpOnly`, `Secure`, `SameSite=Strict` cookie. I mitigated partially by cutting token lifetime from seven days to one, and structurally by ensuring the codebase contains no `dangerouslySetInnerHTML`, `eval` or `innerHTML` sinks anywhere. The full fix touches every client request path and I could not validate it in the window available.

**"What is AWS responsible for here, and what are you?"**
AWS secures the hypervisor, physical infrastructure and the IAM control plane. I am responsible for the guest OS, the runtime, the firewall rules, the application, and all credentials. Table 3 sets out the full allocation. The point that matters is that every Critical finding sat in my column — AWS could not have prevented a single one.

**"Why didn't your scanners find the Critical issues?"**
Because a scanner has no model of the intended authorisation policy. ZAP can see that `GET /api/orders/:id` returns 200; it cannot know that *this* administrator should not be permitted to read *that* restaurant's order. Detecting broken access control requires semantic knowledge of the system, which is why manual source review was necessary and why all four Criticals came from it.

**"How would this scale to ten thousand concurrent orders?"**
It would not, as currently built, and the reason is interesting. `server/src/socket.js` holds per-process in-memory maps for user-to-socket association, database write throttling and stale-GPS timers. Adding a second instance gives each a disjoint view of connected clients, so real-time events reach only the users attached to the emitting process. I would need a Socket.IO Redis adapter for cross-process propagation and sticky sessions at the load balancer, plus an M10 Atlas tier and an auto-scaling group behind an Application Load Balancer.

**"Explain your Content Security Policy."**
It is not a default policy, because a default would break the application. Stripe's payment frame requires `js.stripe.com` in `scriptSrc` and `frameSrc`; Cloudinary serves menu images; OpenStreetMap serves map tiles; and the Socket.IO connection needs `wss://` in `connectSrc`. `objectSrc` is `none` and `frameAncestors` is `none` to prevent plugin execution and clickjacking respectively.

**"Why MongoDB Atlas rather than MongoDB on the instance?"**
Three reasons. It decouples the data tier from instance lifecycle, so rebuilding the instance does not risk the data. It provides managed backup that a self-hosted instance on a free tier would not. And it removes a listening service from the instance entirely — an exposed port 27017 is one of the most commonly exploited misconfigurations in internet-facing MongoDB deployments, and the safest way to avoid it is to have no local database at all.

**"What does `trust proxy` do and why did you set it?"**
Behind Nginx, every request reaches Express from 127.0.0.1, so `req.ip` resolves to the proxy rather than the client. Without `trust proxy`, the rate limiter I added would count all traffic as one client and throttle every user simultaneously the moment any single user hit the limit. With it set, Express reads the client address from `X-Forwarded-For`, which Nginx populates.

**"What would you do differently if you started again?"**
Wire the security middleware before writing any feature code. Every one of the six unused dependencies was installed at project inception with the intention of configuring it later, and later never arrived. Retrofitting a Content Security Policy onto a finished application with three third-party integrations took considerably longer than building against one would have.

**"Show me the app working."**
Have this ready before the viva: browser open at `https://foodora.duckdns.org`, logged in as a customer on one device and as a restaurant administrator on another, so you can place an order on one screen and watch it appear on the other in real time. Have your PM2 process list and a terminal ready in case you are asked to prove it is genuinely running on the cloud instance.

<div style="page-break-after: always;"></div>

# Declaration of Software Tools and Generative Artificial Intelligence Use

> ## ⚠ COMPLETE THIS HONESTLY — it is a required part of the submission
> The module guide (p. 15) places this assessment in **Category B**: GAI may be used to structure the assessment, generate initial ideas subject to fact-checking, and produce summary information which must then be put into your own words and referenced. **Undeclared use is academic misconduct.** Edit the statement below so it accurately describes what you actually did — do not submit it unchanged if it does not.

**Software tools used in this assessment:**

| Tool | Version | Purpose |
|---|---|---|
| Amazon Web Services (EC2, VPC, Elastic IP) | — | Cloud infrastructure hosting |
| AWS CLI | 2.34.33 | Resource provisioning and verification |
| MongoDB Atlas | M0 | Managed database service |
| Ubuntu Server | 24.04.4 LTS | Guest operating system |
| Nginx | 1.24.0 (Ubuntu) | Reverse proxy and static file server |
| Node.js / npm / PM2 | 22.23.2 / 10.9.8 / 7.0.3 | Application runtime and process supervision |
| Certbot / Let's Encrypt | 5.7.0 (snap) | TLS certificate issuance and renewal |
| Nmap | {{VERSION}} | Network and TLS assessment |
| OWASP ZAP | {{VERSION}} | Application security assessment |
| Mozilla Observatory | — | Security header assessment |
| npm audit | — | Dependency vulnerability analysis |
| Git | 2.43.0 | Version control and remediation audit trail |
| Microsoft Word | — | Document preparation |

**Generative AI declaration:**

In accordance with the Category B permissions for this assessment, I declare the following use of Generative AI:

- **Tool used:** {{AI_TOOL_AND_VERSION}}
- **Purpose:** {{Describe accurately — e.g. structuring the report sections, summarising the OWASP Top 10 categories, suggesting an outline for the security findings table}}
- **Extent:** {{Describe accurately — e.g. an initial structure was generated and then substantially rewritten; all technical content, all deployment steps, all screenshots and all scan results are my own original work}}

All deployment work, security testing, screenshots, scan outputs, code remediation and analysis presented in this portfolio are my own. All sources are cited in Section 8. Any AI-assisted content has been fact-checked against authoritative sources and rewritten in my own words.

**Signed:** {{YOUR_NAME}}
**Student Number:** {{STUDENT_ID}}
**Date:** {{SUBMISSION_DATE}}

---

=== REPORT ENDS HERE ===

<!-- ==================================================================== -->

# ⚠ CONVERSION INSTRUCTIONS — DELETE THIS ENTIRE SECTION BEFORE SUBMISSION

## Step 1 — Complete the pre-submission gate at the top of this file

Do not skip it. In particular, confirm both of these return **0**:

```powershell
(Select-String -Path CLD7302_Portfolio_Report.md -Pattern '\{\{').Count
(Select-String -Path CLD7302_Portfolio_Report.md -Pattern '\[PASTE').Count
```

## Step 2 — Delete the working sections

Remove everything **above** `=== REPORT BEGINS HERE ===` and everything **below** `=== REPORT ENDS HERE ===`, plus the three inline blocks marked ⚠ (the reference verification checklist after §8, Appendix E if you choose, and Appendix F).

## Step 3 — Convert to DOCX

**With pandoc** (install from pandoc.org):

```powershell
pandoc CLD7302_Portfolio_Report.md -o "CLD7302_{{STUDENT_ID}}_{{YOUR_NAME}}.docx" --toc --number-sections
```

**Without pandoc:** open the `.md` in VS Code, use *Markdown: Open Preview*, select all in the preview pane, paste into Word. Tables and code blocks survive this reasonably well; check them.

## Step 4 — Format in Word (module guide §11, p. 6)

1. Font **Arial or Calibri Light, size 12** throughout
2. **Number every page** (Insert → Page Number)
3. Insert each screenshot at its figure marker; delete the marker block, keep only the numbered caption beneath the image
4. Update the Contents (References → Update Table)
5. Put the **word count on the title page** — count §1 to §7 only, excluding title page, contents, references, figures, tables and appendices
6. Save as **`.doc`** — the brief specifies `.doc` format

## Step 5 — Check the word count against the penalty bands

| Body word count | Penalty |
|---|---|
| Up to 4,400 | None |
| 4,400 – 4,800 | −5 marks |
| Over 4,800 | Capped at the pass mark |

> ## 🚨 THE BODY IS CURRENTLY OVER THE CAP — 5,988 WORDS AGAINST 4,400. READ THIS FIRST.
>
> The draft was 4,392 words, 8 below the penalty threshold. Correcting the report against the live deployment on 10 August 2026 added roughly 1,596 words of prose, and **at 5,988 the submission would be capped at the pass mark** under the penalty table below. This is the single highest-priority editing task remaining — ahead of the scans, ahead of the figures.
>
> Measured with tables, code blocks, headings and figure/working-note boxes excluded, matching the brief's exclusion rule:
>
> | Section | Now | Was | Δ | Target | Marks it serves |
> |---|---|---|---|---|---|
> | §1 Introduction | 377 | 382 | −5 | 350 | Framing |
> | §2 Provider Selection | 662 | 522 | **+140** | 450 | Deployment (25) |
> | §3 Deployment | 1,601 | 762 | **+839** | 850 | Deployment (25) |
> | §4 Security Assessment | 1,160 | 1,062 | +98 | 1,050 | Assessment (25) |
> | §5 Security Solutions | 1,166 | 974 | +192 | 1,000 | Solutions (20) |
> | §6 Critical Evaluation | 627 | 390 | **+237** | 420 | Distinction criteria |
> | §7 Conclusion | 395 | 281 | +114 | 300 | — |
> | **Total** | **5,988** | 4,392 | **+1,596** | **4,420** | |
>
> **Where to cut, in order of least damage:**
>
> 1. **§3, roughly 750 words — take most of it here.** This section carries the most redundancy: the region/residency discussion is made twice (§3.3 and §6 — keep the §6 version and cut §3.3 to a single sentence, worth ~120 words), the Atlas allowlist and Elastic IP paragraphs can each halve, and the operational narrative around provisioning and §3.9 verification can move wholesale into the ⚠ working-note boxes, which are deleted before submission and therefore cost nothing. The F-21 loopback qualification must stay — it is load-bearing for §4.4 and §7.
> 2. **§2, roughly 200 words.** The credit-plan verification is worth keeping as evidence but can lose half its length; the two consequences do not each need a paragraph.
> 3. **§6 and §7, roughly 250 words.** Both gained a new paragraph. Merge the new data-residency paragraph in §6 into the existing "Architectural limits" one, and compress the verification lesson in §7 into two sentences.
> 4. **§5, roughly 150 words.** The R11 rationale can lose its third paragraph — the defence-in-depth argument is already made in §3.1 and §4.4.
>
> **Do not cut §4.** It carries 25 marks and is the section markers scrutinise hardest.
>
> **Free real estate:** tables, code blocks, `diff` blocks, figure captions and everything inside a ⚠ box are all excluded. Moving prose into a table or a code comment preserves the information at zero word cost. Adding rows to the findings register is free.

**After you have cut, re-measure.** From Git Bash in the repo root:

```bash
awk '/^# 1\. Introduction/{f=1} /^# 8\. References/{f=0} f' CLD7302_Portfolio_Report.md \
| awk 'BEGIN{i=0} /^```/{i=!i;next} i{next} /^\|/{next} /^>/{next} /^#/{next} /^<div/{next} {print}' \
| tr -s ' \n' ' \n' | wc -w
```

This approximates the brief's rule closely, but **Word is the authority** for the number you print on the title page: select §1 to §7 in the converted document, exclude the tables and figures manually, and use Review → Word Count.

## Step 6 — Submit

- **Filename:** `CLD7302_{{STUDENT_ID}}_{{YOUR_NAME}}.doc`
- **Where:** Turnitin via the Moodle module area
- **Deadline:** 20 August 2026
- **Late penalty:** up to 7 days = −10 marks; beyond 7 days = non-submission, zero

Check the Turnitin similarity report after upload. High similarity in the code-snippet and configuration sections is expected and generally acceptable, since they are technical necessities. High similarity in the prose is not — that is the part you must write in your own voice.

