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
   - 4.4 Network layer assessment
   - 4.5 Application layer assessment
   - 4.6 Supporting assessments
   - 4.7 Consolidated findings register
   - 4.8 Controls already operating effectively
5. Proposed Security Solutions and Literature Review
   - 5.1 Remediation strategy and prioritisation
   - 5.2 Identity and cryptographic controls
   - 5.3 Access control remediation
   - 5.4 Input validation and injection defence
   - 5.5 Platform hardening and observability
   - 5.6 Verification approach and expected outcomes
6. Critical Evaluation
7. Conclusion and Recommendations
8. References
- Appendix A — Nginx site configuration
- Appendix B — Assessment tool output
- Appendix C — OWASP ZAP alert summary
- Declaration of Software Tools and Generative Artificial Intelligence Use

<div style="page-break-after: always;"></div>

## List of Figures

| Fig. | Title | § |
|---|---|---|
| 1 | Default VPC subnet and route table | 3.3 |
| 2 | Security group inbound rules | 3.3 |
| 3 | EC2 instance details | 3.4 |
| 4 | Key pair generation | 3.4 |
| 5 | Running instance summary | 3.4 |
| 6 | Elastic IP association | 3.4 |
| 7 | First SSH session to the instance | 3.4 |
| 8 | Atlas M0 cluster provisioned | 3.5 |
| 9 | Atlas database user | 3.5 |
| 10 | Atlas network access allowlist | 3.5 |
| 11 | Application connected to Atlas | 3.5 |
| 12 | Node.js and npm versions on the instance | 3.6 |
| 13 | Repository deployed and dependencies installed | 3.6 |
| 14 | PM2 process list showing the API online | 3.6 |
| 15 | API health endpoint responding locally | 3.6 |
| 16 | Production client build completing | 3.7 |
| 17 | Nginx configuration test passing | 3.7 |
| 18 | HTTP requests redirected to HTTPS | 3.7 |
| 19 | DNS resolution to the Elastic IP | 3.8 |
| 20 | Installed Let's Encrypt certificate | 3.8 |
| 21 | Valid certificate shown in browser | 3.8 |
| 22 | Local access verified on the instance | 3.9 |
| 23 | Remote access and live order tracking on mobile | 3.9 |
| 24 | End-to-end transaction completed remotely | 3.9 |
| 25 | External Nmap service scan | 4.4 |
| 26 | Internal listener enumeration | 4.4 |
| 27 | TLS cipher enumeration | 4.4 |
| 28 | ZAP unauthenticated scan alerts | 4.5 |
| 29 | ZAP authenticated session configuration | 4.5 |
| 30 | ZAP authenticated scan alerts | 4.5 |
| 31 | npm audit dependency findings | 4.6 |
| 32 | HTTP Observatory baseline grade | 4.6 |
| 33 | Response headers before hardening | 4.6 |

## List of Tables

| Table | Title | § |
|---|---|---|
| 1 | Free tier comparison across AWS, Azure and GCP | 2.2 |
| 2 | Weighted provider decision matrix | 2.3 |
| 3 | Shared responsibility allocation for this deployment | 2.4 |
| 4 | Security group rule set and justification | 3.3 |
| 5 | Verification of local and remote accessibility | 3.9 |
| 6 | Attack surface enumeration | 4.3 |
| 7 | Consolidated findings register | 4.7 |
| 8 | Controls already operating effectively | 4.8 |
| 9 | Remediation priority matrix | 5.1 |
| 10 | Baseline measurements and remediation targets | 5.6 |

<div style="page-break-after: always;"></div>

# 1. Introduction and Scope

Cloud computing is defined by Mell and Grance (2011) as a model for enabling ubiquitous, on-demand network access to a shared pool of configurable computing resources that can be rapidly provisioned with minimal management effort. That definition frames this portfolio: the work reported here takes an application that existed only on a development workstation and places it onto shared, on-demand infrastructure, then examines what that migration does to its security posture.

The application deployed is **Foodora**, a custom-built online food ordering platform developed by the author. The assessment brief permits a custom-built application alongside off-the-shelf options such as WordPress or Odoo, and a bespoke application was chosen deliberately. An off-the-shelf content management system would demonstrate installation competence but would present a security posture largely determined by its vendor. A self-authored application exposes the author's own architectural decisions to scrutiny, which is a more demanding basis for the security assessment that Learning Outcome 3 requires.

Foodora is a three-sided marketplace of approximately 19,000 lines across 193 source files: a React 19 single-page client built with Vite and Redux Toolkit, and an Express 5 REST API using Mongoose 9 over MongoDB, with Socket.IO streaming real-time order and courier-location events. It supports three roles — customer, restaurant administrator and delivery rider — and integrates Stripe for card payments, Cloudinary for image storage, and OpenStreetMap services for geocoding and routing. The functional footprint is therefore non-trivial: it handles authentication, payment flows, personally identifiable delivery addresses and live geolocation, all carrying meaningful confidentiality obligations.

This portfolio addresses three objectives derived from the brief. First, to select a free cloud service provider through structured evaluation rather than familiarity, and to deploy the application so that it is functional and accessible both locally and remotely. Second, to conduct a systematic security assessment of the deployed system using recognised methodology and industry-standard tooling. Third, to propose security improvements justified against peer-reviewed literature and established control frameworks.

Section 2 evaluates the candidate providers. Section 3 documents the deployment. Section 4 presents the security assessment. Section 5 sets out the proposed remediations and their evidential basis. Section 6 evaluates the work critically. Section 7 concludes with recommendations.

<div style="page-break-after: always;"></div>

# 2. Cloud Service Provider Evaluation and Selection

## 2.1 Evaluation criteria

Provider selection was treated as a design decision requiring justification rather than a matter of preference. Five criteria were derived from the application's technical requirements and the constraints of the assessment.

**Duration of the free allocation** — the deployment must remain reachable through marking and viva, so a credit expiring mid-assessment is worse than a smaller indefinite allocation. **Compute suitability** — the API, Nginx and a Vite production build must coexist, and bundling React 19 is memory-intensive enough that a 1 GB instance exhausts memory during `vite build` without swap. **Managed database availability** — self-hosting MongoDB alongside the application couples the data tier to instance lifecycle, forfeits managed backup, and adds a listening service that must then be defended. **Network control granularity** — evidencing least-privilege exposure requires per-source-CIDR firewall rules rather than coarse toggles. **Documentation depth** — this governs how quickly faults can be diagnosed within an eleven-day window.

## 2.2 Comparative analysis of free tiers

**Table 1 — Free tier comparison across the three candidate providers**

| Criterion | AWS Free Tier | Microsoft Azure | Google Cloud |
|---|---|---|---|
| Allocation model | 12-month allocation on legacy accounts; newer accounts receive a credit-based plan | £150 credit for 30 days, plus 12 months of selected free services | $300 credit for 90 days, plus an indefinite "Always Free" allocation |
| Indefinite compute after credits | No | No (B1s free for 12 months only) | Yes — one `e2-micro` in designated US regions |
| Representative instance | `t3.micro` — 2 vCPU, 1 GB RAM | `B1s` — 1 vCPU, 1 GB RAM | `e2-micro` — 2 shared vCPU, 1 GB RAM |
| Static public address | Elastic IP — charged at $0.005/hr since February 2024 whether attached or not, against a 750 hr/month allowance | Static public IP, charged separately | Static external IP, free while attached |
| Firewall abstraction | Security groups — stateful, per-CIDR, per-port | Network security groups — priority-ordered rules | VPC firewall rules — tag-targeted |
| Managed MongoDB in free limits | No native option; Atlas M0 used instead | No native option; Atlas M0 used instead | No native option; Atlas M0 used instead |

Two observations follow. No provider offers managed MongoDB free of charge, so a third-party service is required regardless of choice; Atlas M0 supplies 512 MB indefinitely and is provider-agnostic. And all three allocations have been repeatedly restructured, so the entitlement attached to any given account must be confirmed against the account itself rather than assumed from marketing material.

That confirmation was carried out against the account rather than assumed, and it changed the plan:

```bash
aws freetier get-account-plan-state
# { "accountPlanType": "FREE", "accountPlanStatus": "ACTIVE",
#   "accountPlanRemainingCredits": { "amount": 135.71, "unit": "USD" },
#   "accountPlanExpirationDate": "2026-10-21T01:55:05Z" }
```

Two consequences follow, neither readable off a documentation page. The eligible instance family differs — `describe-instance-types --filters free-tier-eligible` returns `t3.micro` and `t4g.micro` but **not** `t2.micro`, the type most guidance names for this region. And the deployment carries a hard expiry rather than a twelve-month runway, which inverts the duration score AWS receives in Table 2 and is exactly the unilateral term-change Lynn (2020) warns against building a cost case upon.

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

The decision is not unqualified. Google Cloud scored higher on allocation durability, since its `e2-micro` allocation is indefinite rather than time-boxed. Had the deployment needed to persist beyond the assessment period, that criterion would have carried more weight and the outcome would likely have reversed.

## 2.4 The shared responsibility model as a scoping instrument

The division of duties between provider and customer is not contractual framing; it scopes the assessment in Section 4. Erl, Mahmood and Puttini (2013) note that the boundary shifts with the service model, and this deployment uses Infrastructure as a Service for compute and Software as a Service for data, so two boundaries operate simultaneously.

**Table 3 — Shared responsibility allocation for this deployment**

| Layer | Component | Provider responsibility | Customer responsibility |
|---|---|---|---|
| Physical | Data centre, hardware | AWS | — |
| Virtualisation | Hypervisor, host OS | AWS | — |
| Network infrastructure | Backbone, edge DDoS protection | AWS | Security group rules, subnet placement |
| Guest OS | Ubuntu 24.04 | — | Patching, hardening, SSH configuration |
| Runtime | Node.js 22, Nginx | — | Version currency, configuration |
| Application | Foodora source | — | Entirely the author's |
| Data (Atlas) | MongoDB engine, host, backup | MongoDB Inc. | Access credentials, IP allowlist, encryption in transit |
| Identity | IAM control plane | AWS | User creation, MFA, privilege assignment |

The practical consequence is that **almost all exploitable risk sits in the customer column**. AWS secures the hypervisor; it does not prevent the author shipping an authentication bypass, and Section 4 confirms that every severe finding is an application-layer defect within the author's remit. Vacca (2021) argues that misattribution of responsibility is itself a leading cause of cloud security failure, as organisations assume the provider has secured a layer that in fact remains theirs.

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
                 │  34.195.198.83/32  │
                 └────────────────────┘

  Security group foodora-sg (sg-0be61e3a771f95188)
    22/tcp   ← administrative /32 only
    80/tcp   ← 0.0.0.0/0   (redirects to 443)
    443/tcp  ← 0.0.0.0/0   (application traffic)
    5000/tcp   no rule — but process listens *:5000 (F-21)
    27017/tcp  no rule — no local database
```

Three decisions warrant justification. **The reverse proxy is the only intended route to the API**, collapsing the externally reachable surface to two ports, verified empirically in Section 4.4. **The database is external and IP-restricted**, decoupling the data tier from instance lifecycle and providing managed backup. **TLS terminates at Nginx**, centralising and automating certificate management rather than embedding it in application code.

One qualification matters more than it first appears. The API does **not** bind the loopback interface: `server.listen(PORT)` passes no host argument, so Node binds all interfaces, which `ss -tlnp` confirms as `LISTEN *:5000`. Port 5000 is unreachable **solely** because the security group contains no rule for it, so the intended design has two independent controls where the deployed system has one. This is finding F-21, and it is the kind of gap a configuration review catches and a port scan cannot: an external scan of this host and of a correctly bound host produce identical output.

## 3.2 Account and region configuration

Every resource in this section was created through the AWS CLI rather than the console, so its parameters are reproducible, and each was read back from the API afterwards rather than assumed from the interface that created it — a discipline that surfaced two of the findings in Section 4.7. No separate administrative identity was created and no billing alarm configured; provisioning used root credentials, which Section 6 records as accepted residual risk.

## 3.3 Network design and firewall configuration

The instance was placed in a public subnet (`subnet-0781378c5d6b6a133`) of the default VPC (`vpc-01456e75075bfeb56`) in `us-east-1`, availability zone `us-east-1c`. A dedicated security group, `foodora-sg`, was created rather than reusing the default group, so that the rule set is explicit and auditable. The region was inherited from the existing account configuration rather than chosen, and Section 6 treats the resulting data-residency position as a limitation.

**Table 4 — Security group rule set and justification**

| Direction | Port | Source | Justification |
|---|---|---|---|
| Inbound | 22 | administrative `/32` | SSH restricted to a single host address. Exposing 22 to `0.0.0.0/0` invites continuous automated credential attacks. |
| Inbound | 80 | `0.0.0.0/0` | Required for Let's Encrypt HTTP-01 challenge validation and for redirecting users to HTTPS. Serves no application content. |
| Inbound | 443 | `0.0.0.0/0` | All application traffic. Public by necessity — the brief requires remote accessibility. |
| Inbound | 5000 | *(absent)* | No rule exists, so the API is unreachable from the internet. This is the **only** control preventing that access: the process binds `*:5000`, not `127.0.0.1:5000` (F-21). |
| Inbound | 27017 | *(absent)* | No database runs on the instance. An open 27017 is among the most commonly exploited misconfigurations in internet-facing MongoDB deployments. |
| Outbound | All | `0.0.0.0/0` | Retained as default. Restricting egress is discussed as future work in Section 6. |

**[FIGURE 1 HERE]**

*Figure 1 — Default VPC subnet and route table showing the internet gateway association.*

**[FIGURE 2 HERE]**

*Figure 2 — Inbound security group rules implementing least-privilege port exposure, with no rule for 5000 or 27017.*

## 3.4 Compute provisioning

A `t3.micro` instance running Ubuntu Server 24.04.4 LTS (`ami-052355af2a014bd2c`) was launched into the configured subnet and security group with a 20 GB gp3 root volume. Ubuntu was selected over Amazon Linux for the currency of its Node.js packaging and the breadth of available documentation (Negus, 2020). Access uses an RSA key pair; password authentication over SSH was never enabled. An Elastic IP was allocated and associated, which matters beyond convenience: the Atlas allowlist and the DNS A record both reference this address, and an ephemeral public IP changes on instance stop, breaking both simultaneously.

```bash
aws ec2 run-instances --image-id ami-052355af2a014bd2c --instance-type t3.micro \
  --key-name foodora-key --security-group-ids sg-0be61e3a771f95188 \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --metadata-options 'HttpTokens=required,HttpEndpoint=enabled' \
  --user-data file://user-data.sh
```

`HttpTokens=required` enforces IMDSv2, defending the instance metadata service against the server-side request forgery pattern that made IMDSv1 credential theft straightforward.

Host configuration was applied through a `user-data` script on first boot. Swap is created before the package upgrade rather than after, because 1 GB of RAM is insufficient for `vite build`, which the kernel out-of-memory killer terminates without it.

```bash
#!/bin/bash
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

The `ufw` package was installed but its rules were never applied, so the host presents no firewall of its own beneath the cloud-layer security group. Fox (2021) treats host-level packet filtering as a distinct layer from perimeter control precisely because the two fail independently; that this layer is absent is recorded as finding F-22.

**[FIGURE 3 HERE]**

*Figure 3 — Instance details showing AMI, instance type and IMDSv2 requirement.*

**[FIGURE 4 HERE]**

*Figure 4 — RSA key pair generated for certificate-based SSH authentication.*

**[FIGURE 5 HERE]**

*Figure 5 — Instance running in us-east-1c with assigned public address.*

**[FIGURE 6 HERE]**

*Figure 6 — Elastic IP associated with the instance, providing a stable public address.*

**[FIGURE 7 HERE]**

*Figure 7 — Key-based SSH session established to the provisioned instance.*

## 3.5 Managed database provisioning

A MongoDB Atlas M0 cluster was provisioned to hold the `foodora` database, with a dedicated user granted `readWrite` on that database rather than cluster-wide `atlasAdmin` — the same least-privilege pattern already present in the project's local database initialisation script. Connections use TLS with SCRAM-SHA-256 by default, so credentials never traverse the network in the clear, and connectivity was confirmed from the instance rather than assumed.

The network allowlist holds two entries — the Elastic IP and the author's workstation — rather than the `0.0.0.0/0` entry Atlas offers as a setup convenience. The workstation entry is the weaker of the two and should be removed once development finishes, since a residential address is reassigned by the ISP and the allowlist would then authorise a stranger's connection attempt.

**[FIGURE 8 HERE]**

*Figure 8 — MongoDB Atlas M0 free-tier cluster provisioned for the application database.*

**[FIGURE 9 HERE]**

*Figure 9 — Atlas database user configuration.*

**[FIGURE 10 HERE]**

*Figure 10 — Atlas network access restricted to the instance and the development workstation.*

**[FIGURE 11 HERE]**

*Figure 11 — Application server establishing an authenticated TLS connection to the Atlas cluster, with the database name confirmed in the log line.*

## 3.6 Application runtime deployment

Node.js 22 LTS was installed from NodeSource. The API is supervised by PM2, which provides automatic restart on failure and, critically, resurrection on instance reboot — without it, a reboot silently takes the application offline.

```bash
sudo mkdir -p /srv && sudo chown ubuntu:ubuntu /srv
git clone https://github.com/gull25/Online_Food_Ordering_System.git /srv/foodora
cd /srv/foodora/server && npm ci --omit=dev

# Production environment, copied over SCP rather than typed into a shell history
cat > /srv/foodora/server/.env <<'EOF'
NODE_ENV=production
PORT=5000
MONGO_URI={{ATLAS_CONNECTION_STRING}}     # must include /foodora before the query string
JWT_SECRET={{JWT_SECRET_64_HEX}}          # 64 hex chars, generated on the instance
JWT_EXPIRE=7d
CLIENT_URL=https://foodora.duckdns.org
EOF
chmod 600 /srv/foodora/server/.env

pm2 start src/server.js --name foodora-api --time
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

`/srv` is the filesystem-hierarchy location for site-specific service data, which keeps the application out of a login user's home directory. Cloudinary, Stripe and SMTP credentials are absent from the deployed environment, which bounds three features: image upload fails at runtime, the payment routes return 503 because `config/stripe.js` guards on the key, and password reset returns 500. Ordering, authentication and real-time tracking are unaffected.

One misconfiguration during this step is worth recording for how it presented. The environment file had no trailing newline, so appending `NODE_ENV=production` concatenated it onto the previous line; `dotenv` parsed the result as one variable and the application started in development mode, which reflects **any** origin with `credentials: true` (F-17). A formatting error became a live security defect, and nothing in the startup output indicated it.

**[FIGURE 12 HERE]**

*Figure 12 — Node.js 22 LTS runtime, npm and PM2 installed on the instance.*

**[FIGURE 13 HERE]**

*Figure 13 — Application source deployed at a pinned commit and production dependencies installed.*

**[FIGURE 14 HERE]**

*Figure 14 — API process supervised by PM2 in fork mode.*

**[FIGURE 15 HERE]**

*Figure 15 — API health endpoint responding on the loopback interface.*

Three observations from Figure 15 are themselves evidence. `X-Powered-By: Express` discloses the framework (F-14). `Access-Control-Allow-Origin` echoes the configured `CLIENT_URL` rather than reflecting the caller, confirming production mode is in effect. And none of Content-Security-Policy, Strict-Transport-Security, X-Frame-Options or X-Content-Type-Options is present (F-09), the baseline for Section 5.6.

A deployment that is reachable but empty does not evidence a *functional* application, so `server/seed.js` was run against the cluster to produce three restaurants, twelve menu items, four offers, one completed order and an account for each role. The result was verified through the public API rather than in the database, which exercises the whole chain from DNS to Atlas in one request.

## 3.7 Reverse proxy and static asset delivery

The React client is compiled to static assets and served directly by Nginx, with only `/api` and `/socket.io` proxied to the Node process. This keeps static delivery off the event loop entirely.

One characteristic of Vite requires emphasis. Variables prefixed `VITE_` are substituted at **build** time, not read at runtime. If `VITE_API_URL` is unset when `vite build` runs, the fallback `http://localhost:5000/api` is compiled into the bundle and the deployed application attempts to call the visitor's own machine. The variable was therefore written to a file rather than exported into a single shell, so a later rebuild cannot silently pick up the fallback.

```bash
cd /srv/foodora/client && npm ci
cat > .env <<'EOF'
VITE_API_URL=https://foodora.duckdns.org/api
VITE_STRIPE_PUBLIC_KEY={{STRIPE_PUBLISHABLE_KEY}}
EOF
NODE_OPTIONS=--max-old-space-size=1536 npm run build
sudo rsync -a --delete dist/ /var/www/foodora/
sudo chown -R www-data:www-data /var/www/foodora
```

`rsync --delete` rather than `cp -r` is deliberate: Vite emits content-hashed filenames, so repeated copying leaves every superseded bundle publicly retrievable by anyone who kept an old filename, including versions predating a security fix.

Three elements of the Nginx server block are load-bearing; the full configuration is in Appendix A.

```nginx
# SPA fallback — React Router uses BrowserRouter, so any deep link
# must return index.html rather than a 404.
location / {
    root /var/www/foodora;
    try_files $uri $uri/ /index.html;
}

location /api {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# WebSocket upgrade — REQUIRED for Socket.IO live order tracking. Without this
# block the handshake cannot upgrade and courier location streaming fails
# silently while the rest of the application appears healthy.
location /socket.io/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host       $host;
    proxy_read_timeout 86400;
}
```

**[FIGURE 16 HERE]**

*Figure 16 — React client compiled to optimised production assets.*

**[FIGURE 17 HERE]**

*Figure 17 — Nginx configuration syntax validated prior to reload.*

**[FIGURE 18 HERE]**

*Figure 18 — HTTP requests permanently redirected to HTTPS, so plaintext access is not possible.*

## 3.8 DNS and transport layer security

A DuckDNS subdomain was mapped to the Elastic IP. A dynamic DNS provider was selected over a registered domain because it is free, satisfies the brief's DNS configuration requirement, and is accepted by Let's Encrypt for HTTP-01 challenge validation, which some free hostname services are not.

```bash
nslookup foodora.duckdns.org 8.8.8.8    # must return the Elastic IP

sudo snap install --classic certbot
sudo certbot --nginx -d foodora.duckdns.org --redirect --agree-tos -m <address>

systemctl list-timers snap.certbot.renew.timer
sudo certbot renew --dry-run
```

Certbot was installed from snap rather than apt because the snap channel carries a current release where the Ubuntu 24.04 archive package lags several major versions; note that the snap registers `snap.certbot.renew.timer` rather than the `certbot.timer` unit the archive package would create.

The dry run matters more than the issuance. A certificate that issues once but cannot renew produces a site that works through marking and fails silently ninety days later; the dry run exercises the full challenge path against the live configuration that Certbot itself rewrote, which is the only way to know renewal will succeed unattended. Both the issuance and the simulated renewal succeeded.

The `--redirect` flag installs a permanent redirect from port 80 to 443, so plaintext access is no longer possible. Clark and van Oorschot (2013) observe that opportunistic TLS without enforced redirection leaves users exposed to downgrade and stripping attacks; the redirect closes that gap, and HSTS — proposed in Section 5.5 — instructs browsers never to attempt plaintext in the first place.

**[FIGURE 19 HERE]**

*Figure 19 — DNS A record resolving the application hostname to the Elastic IP, queried against a public resolver.*

**[FIGURE 20 HERE]**

*Figure 20 — Installed Let's Encrypt certificate with issuance paths and expiry date.*

**[FIGURE 21 HERE]**

*Figure 21 — Valid TLS certificate presented to the browser for the application hostname.*

## 3.9 Verification of local and remote accessibility

The brief requires the application to be functional and accessible both locally and remotely, and verified from different devices and locations.

**Table 5 — Verification of local and remote accessibility**

| Test | Vantage point | Method | Result |
|---|---|---|---|
| Local — API | On the instance | `curl -sI http://127.0.0.1:5000/api/status` | HTTP 200, JSON body (Figure 15) |
| Local — full stack | On the instance | `curl -sI https://foodora.duckdns.org` | HTTP 200 through the proxy chain (Figure 22) |
| Remote — desktop | Workstation, across the internet | Browser and `curl` against the hostname | HTTP 200; TLS chain verified |
| Remote — redirect | Workstation | `curl -sI http://foodora.duckdns.org` | 301 to the HTTPS origin |
| Remote — deep link | Workstation | `GET /restaurants` | HTTP 200 — React Router fallback, not a 404 |
| Remote — WebSocket | Workstation | `GET /socket.io/?EIO=4&transport=polling` | Handshake returns a session id advertising `upgrades:["websocket"]` |
| Remote — real data | Workstation | `GET /api/restaurants`, `/api/public/trending`, `/api/offers/active` | 3 restaurants, 10 trending items, 4 offer codes |
| Remote — authentication | Workstation | `POST /api/auth/login` | HTTP 200 with a valid JWT |
| Remote — mobile | Phone, cellular data, Wi-Fi disabled | Browse, order, track | Figure 23 |
| Remote — transaction | Phone or browser | Test-mode payment | Figure 24 |

Disabling Wi-Fi on the mobile device is deliberate. On the same wireless network the phone shares the workstation's public address, so a successful load proves nothing about internet reachability; on cellular data the request traverses a different autonomous system, which is what remote accessibility means. The WebSocket check should also not be over-claimed: a handshake advertising `upgrades:["websocket"]` shows the server offers the protocol switch and that Nginx passed it through, but only Figure 23 demonstrates a courier position actually rendered on a remote device.

**[FIGURE 22 HERE]**

*Figure 22 — Application verified as locally accessible from the host instance, at both the proxy and the origin.*

**[FIGURE 23 HERE]**

*Figure 23 — Application accessed remotely over a cellular network, showing live order tracking.*

**[FIGURE 24 HERE]**

*Figure 24 — Complete customer transaction executed against the cloud deployment.*

<div style="page-break-after: always;"></div>

# 4. Security Assessment

## 4.1 Assessment methodology

The assessment follows the four-phase structure of NIST SP 800-115 (Scarfone *et al.*, 2008): planning, discovery, attack, and reporting. A recognised methodology was adopted rather than an ad-hoc tool run because, as Zissis and Lekkas (2012) argue, cloud security assessment must be systematic to be meaningful — an unstructured scan produces a list of alerts, not an understanding of risk.

Testing was layered across three tiers, because each tier is blind to the others.

| Tier | Technique | Tool | What it can and cannot see |
|---|---|---|---|
| Network | Port and service enumeration, TLS inspection | Nmap 7.991 | Sees exposed services and cipher configuration. Blind to application logic. |
| Application | Automated dynamic analysis, spidering, active scanning | OWASP ZAP 2.17.0 | Sees HTTP-observable defects. Weak on authorisation logic, which requires knowing what *should* be forbidden. |
| Source and configuration | Manual review against OWASP ASVS 4.0.3 | Manual, `npm audit`, `ss` | Sees authorisation flaws, cryptographic misuse and binding errors that no black-box tool can infer. |

The third tier proved decisive. Every finding rated Critical was located by source review, not by either automated tool, which is consistent with Fernandes *et al.* (2014): broken access control is systematically under-detected by automated scanners, because a scanner cannot know which resources a given identity is entitled to reach. Test case selection was guided by the OWASP Web Security Testing Guide (OWASP, 2020), and findings are classified against the OWASP Top 10:2021 (OWASP, 2021) and mapped to CIS Critical Security Controls v8 (CIS, 2021).

## 4.2 Scope, authorisation and rules of engagement

**In scope:** EC2 instance `i-09467a5509cfe0c85` at `34.195.198.83`, the hostname `foodora.duckdns.org`, the Foodora application source, and the configuration of the Atlas cluster.

**Explicitly out of scope:** the AWS control plane and hypervisor; MongoDB Atlas infrastructure; Stripe, Cloudinary and OpenStreetMap endpoints. These belong to the providers under the allocation in Table 3, and testing them would be unauthorised.

**Authorisation.** All assets are owned and operated by the author under an individual AWS account and a personal Atlas account. AWS permits customer-initiated penetration testing of common services against one's own instances without prior approval, subject to published exclusions — notably that denial-of-service and volumetric stress testing remain prohibited. No such testing was performed.

**Constraints observed.** Scanning was rate-limited to avoid resembling a denial-of-service event. No third-party account was accessed. Where a weakness was confirmed, examination stopped at the point of proof and no data was exfiltrated.

## 4.3 Threat model and attack surface

Threats were enumerated using STRIDE before any tool was run, so that scanning was directed by hypothesis rather than reporting whatever the tools happened to surface.

**Table 6 — Attack surface enumeration**

| Entry point | Exposure | Authentication | Principal threats |
|---|---|---|---|
| `:443` HTTPS via Nginx | Public internet | Mixed | Tampering, information disclosure, elevation |
| `:22` SSH | Administrative `/32` only | Key-based | Spoofing (mitigated: no password auth) |
| `/api/auth/*` | Public | None by design | Spoofing, elevation |
| `/api/orders/*` | Public | JWT bearer | **Elevation, information disclosure** |
| `/api/payments/*/callback` | Public | **None** | **Tampering, repudiation** |
| `/socket.io` WebSocket | Public | **None** | **Information disclosure** |
| Atlas cluster `:27017` | Allowlisted addresses | SCRAM-SHA-256 | Spoofing (mitigated) |
| Image upload path | Authenticated | JWT bearer | Tampering (stored XSS via SVG) |

Three surfaces stood out before scanning began. The gateway payment callbacks accept unauthenticated state-changing requests. The Socket.IO endpoint performs no handshake authentication. And the order endpoints authenticate the caller but do not consistently verify that the caller is entitled to the specific order requested. Each hypothesis was subsequently confirmed.

## 4.4 Network layer assessment

Scans were run from two vantage points, because they answer different questions. An internal enumeration establishes what is listening; an external scan establishes what is *reachable*. The difference between them is the measured effect of the security group.

```bash
# External — from the workstation, across the internet. The attacker's view.
nmap -Pn --reason -sV -p 22,80,443,5000,8081,27017 34.195.198.83
nmap --script ssl-enum-ciphers -p 443 foodora.duckdns.org

# Internal — over SSH, from the instance itself.
sudo ss -tlnp        # authoritative listener list with owning process
sudo ufw status
```

Ports 5000, 8081 and 27017 were named explicitly rather than relying on a full sweep, because Nmap omits filtered ports from `-p-` output and an absent row cannot distinguish "unreachable" from "not scanned". The scan returned 22, 80 and 443 open and all three named ports `filtered` with reason `no-response`, indicating packets dropped upstream by the security group rather than refused by the host, which would have returned `conn-refused`. Port 22 reports open because the scan originated from the allowlisted address. Two clarifications belong with Figure 25: the service names on filtered rows are static port-table lookups rather than detections, so `27017/tcp mongod` does **not** indicate a running database, and the version banners on the open ports are F-15 confirmed empirically rather than inferred.

**Finding summary at the network tier.** The external surface is minimal and correctly configured, but the internal enumeration contradicts what the external view implies: the API binds all interfaces rather than loopback (F-21), and the host firewall is installed but inactive (F-22). Neither is currently exploitable, and that is the point — both are latent, and each removes a layer the architecture in Section 3.1 assumed was present, so a single widened security-group rule converts F-21 from dormant to critical. This tier is nonetheless the one the deployment handles best, which is why the assessment could not stop here: an external scan alone would conclude the system is secure and would miss both host findings entirely.

**[FIGURE 25 HERE]**

*Figure 25 — External Nmap service scan: 80 and 443 publicly reachable, 22 reachable only from the allowlisted administrative address, and 5000, 8081 and 27017 filtered.*

**[FIGURE 26 HERE]**

*Figure 26 — Internal listener enumeration showing the API bound to all interfaces on port 5000, with the host firewall inactive. The process name is truncated by `ss` to fifteen characters.*

**[FIGURE 27 HERE]**

*Figure 27 — TLS cipher enumeration for the deployed endpoint, showing TLS 1.2 and 1.3 only, with a least strength of A.*

## 4.5 Application layer assessment

ZAP was run in two passes. The unauthenticated pass represents an anonymous visitor. The authenticated pass required explicit configuration, because the application issues a JWT on login and transmits it as an `Authorization: Bearer` header attached by an Axios interceptor, which ZAP does not discover automatically: a token was obtained from the login endpoint and injected into every request through a Replacer rule. The distinction is material, since the unauthenticated pass reaches only public browse endpoints, leaving every order, payment and administrative endpoint — the business-logic surface where the severe findings live — outside its reach.

The unauthenticated pass returned **thirteen alerts: none High, four Medium, six Low and three Informational.** All concern response headers, framework disclosure or informational observations, and the header alerts independently corroborate F-09, F-14 and F-15.

Two limitations should be stated rather than glossed. The AJAX spider could not be used, because the bundled WebDriver was incompatible with the installed browser, and the traditional spider under-covers a client-rendered application since it fetches the shell and finds no anchor targets to follow. The scan policy was also the lighter of the two available. Both bound the coverage claimed here, and neither weakens the central point: a scanner returning zero High alerts against an application containing four Critical authorisation defects reflects a limitation of the method, not a verdict on the application.

**[FIGURE 28 HERE]**

*Figure 28 — OWASP ZAP alerts from the unauthenticated automated scan.*

**[FIGURE 29 HERE]**

*Figure 29 — ZAP configured to inject a valid bearer token for authenticated scanning, with the token redacted.*

**[FIGURE 30 HERE]**

*Figure 30 — Alerts from the authenticated scan, covering endpoints unreachable anonymously.*

## 4.6 Supporting assessments

**Dependency analysis.** `npm audit` was run against both workspaces. The dependency set is unusually current — Express 5, Mongoose 9, React 19 — but that does not, as might be expected, eliminate known-vulnerability exposure. One high-severity advisory affects the server's production tree and four affect the client, one of them in a direct dependency:

| Package | Severity | Advisory |
|---|---|---|
| `ip-address` (server, production) | High | Address parsing permits SSRF and trust-boundary bypass |
| `react-router-dom` / `react-router` (direct) | High | CSRF bypass permitting action execution before rejection |
| `nanoid` | High | Generator can loop indefinitely at size zero |
| `postcss` | Moderate | Attacker-controlled source map reads arbitrary files |

Two observations follow, the first more interesting. The server's only production vulnerability arrives transitively through **`express-rate-limit`** — one of the six security dependencies that Section 4.7 identifies as declared but never imported. An unused security library is therefore not merely inert but a net liability, contributing attack surface while contributing no control. The second is that the vulnerable router version is one patch release behind its fix, which reframes the risk of a very current dependency set: the exposure is not stale CVEs but advisories landing against versions already in production. A further defect was found by inspection rather than audit and recorded as F-16: the error handler reads `err.errors`, whereas Zod v4 exposes `err.issues`, so the handler itself throws while processing a validation failure.

**Header and configuration analysis.** The HTTP Observatory returned a baseline grade of **D, scoring 30 of 100 with six of ten tests passed**, losing 25 points for the absent Content-Security-Policy, 20 each for HSTS and X-Frame-Options, and 5 for X-Content-Type-Options; redirection and cross-origin resource sharing passed. One architectural detail governs how this must be remediated: the document a browser loads is served by Nginx from disk and only `/api` responses pass through Express, so header middleware in the application cannot affect the grade this test measures — a point taken up in Section 5.5.

**[FIGURE 31 HERE]**

*Figure 31 — Dependency vulnerability audit of both workspaces.*

**[FIGURE 32 HERE]**

*Figure 32 — HTTP Observatory assessment prior to hardening.*

**[FIGURE 33 HERE]**

*Figure 33 — Response headers showing absent security controls and framework disclosure.*

## 4.7 Consolidated findings register

Findings from all three tiers are consolidated below, ordered by severity. Severity reflects exploitability and impact in the deployed context, and every entry is evidenced by a specific source location or tool output.

**Table 7 — Consolidated findings register**

| ID | Finding | Method | Sev. | OWASP | CIS v8 | Location |
|---|---|---|---|---|---|---|
| F-01 | **Hardcoded JWT secret fallback.** Token signing and verification fall back to a literal string committed to the repository if `JWT_SECRET` is unset. The server starts regardless, so a misconfigured deployment silently accepts forged tokens for any user ID. | Source | **Critical** | A02, A07 | 3.11, 16.6 | `utils/generateToken.js:4`; `middlewares/auth.middleware.js:17,58` |
| F-02 | **Unauthenticated payment confirmation.** The Easypaisa and JazzCash callbacks are public, take `orderId` from the request body, and perform no signature verification. A crafted POST transitions an order to paid without payment. | Source | **Critical** | A01, A04 | 16.10 | `controllers/payment.controller.js:117–147` |
| F-03 | **Privilege escalation at registration.** `role` is accepted from the request body. The schema omits it, but the validation middleware discards its own parsed output, so unknown keys reach `User.create`. Any anonymous user can self-provision an administrator account. | Source | **Critical** | A01 | 6.8 | `services/auth.service.js:23` ← `middlewares/validate.middleware.js:3` |
| F-04 | **Insecure direct object reference on orders.** `getOrderById` permits access on the basis of role alone, without checking the order belongs to that administrator's restaurant. Combined with F-03, an anonymous attacker can read every order in the system, including names, emails, phone numbers, delivery addresses and geolocation. | Source | **Critical** | A01 | 3.3, 14.6 | `services/order.service.js:265` |
| F-05 | **Unauthenticated WebSocket rooms.** The handler accepts room-join events with a client-supplied identifier and no token verification, so any client can subscribe to any order's event stream and courier GPS trail. | Source | High | A01 | 3.3 | `socket.js:24–53` |
| F-06 | **Order state transitions unscoped.** `updateOrderStatus` and `assignRider` validate the state machine and role but never ownership, so any authenticated customer can cancel another customer's order. | Source | High | A01 | 6.8 | `services/order.service.js:272,323` |
| F-07 | **Mass assignment on restaurant creation.** A client-supplied `owner` is accepted and unfiltered body flows into `Restaurant.create`, allowing `isFeatured`, `rating`, `status` and `stripeAccountId` to be set directly. | Source | High | A01, A08 | 16.10 | `controllers/restaurant.controller.js:70,84,118` |
| F-08 | **No rate limiting.** Login and password-reset endpoints are unthrottled. With a six-character minimum password policy, online brute force is unbounded. `express-rate-limit` is installed but never imported. | ZAP, source | High | A07 | 13.1 | `routes/auth.routes.js:8–9` |
| F-09 | **No security response headers.** No CSP, HSTS, `X-Frame-Options` or `X-Content-Type-Options`. `helmet` is installed but never imported. | ZAP, Observatory | High | A05 | 4.1 | `app.js` |
| F-10 | **Schema validation on 2 of ~60 routes**, and the middleware discards its parsed result — the root cause of F-03. | Source | High | A03, A04 | 16.10 | `middlewares/validate.middleware.js:3` |
| F-11 | **Bearer token stored in `localStorage`**, valid seven days, with no refresh, rotation or server-side revocation. Any XSS yields a week of non-revocable account takeover. | Source | High | A07 | 16.9 | `client/src/api/axios.js:24` |
| F-12 | **No security logging.** No request log, no authentication event log, no authorisation-failure log; every finding above would be exploited without trace. `morgan` is installed but never imported. | Source | High | A09 | 8.2, 8.5 | `middlewares/error.middleware.js` |
| F-21 | **API binds all interfaces instead of loopback.** `server.listen(PORT)` passes no host argument, so Node binds the wildcard address, confirmed by `ss -tlnp` as `LISTEN *:5000`. The security group is therefore the only control preventing direct, unproxied access to the API, defeating the defence-in-depth intent of Section 3.1. | Config, `ss` | High | A05 | 4.1, 4.8 | `server/src/server.js:20` |
| F-13 | **Regex injection on public promo endpoint.** A regular expression is built from unescaped user input on an unauthenticated route, permitting promo-code enumeration and catastrophic backtracking against a single-threaded event loop. | Source | Medium | A03 | 16.10 | `controllers/public.controller.js:48` |
| F-16 | **Error handler leaks driver internals.** `err.message` is returned verbatim, so duplicate-key errors expose database and collection names and act as a user-enumeration oracle. The handler also reads the wrong validation property and throws on failure. | Source | Medium | A05 | 8.2 | `middlewares/error.middleware.js:3,7` |
| F-17 | **Permissive CORS outside production.** `origin: true` reflects any origin with `credentials: true` whenever `NODE_ENV` is not `production`. | Source | Medium | A05 | 4.1 | `app.js:8–11` |
| F-18 | **NoSQL operator injection.** `forgot-password` is unvalidated, so an operator object matches an arbitrary user. No global operator sanitisation is present. | Source | Medium | A03 | 16.10 | `services/auth.service.js:93` |
| F-19 | **Upload filter trusts client MIME type.** The prefix test matches `image/svg+xml`, so a scripted SVG becomes a stored XSS vector. No extension allowlist or magic-byte check. | Source | Medium | A04 | 16.10 | `middlewares/upload.middleware.js:6` |
| F-20 | **User enumeration on password reset.** Differing status codes for known and unknown addresses distinguish registered accounts. | Source | Medium | A07 | 16.9 | `services/auth.service.js:95` |
| F-23 | **Vulnerable dependencies.** One high-severity advisory in the server's production tree and four in the client, one in a direct dependency. The server's exposure is inherited from a security library that is never imported. | `npm audit` | Medium | A06 | 7.1, 16.1 | `server/package.json`, `client/package.json` |
| F-14 | **Framework disclosure.** `X-Powered-By: Express` returned on every API response. | Nmap, curl | Low | A05 | 4.1 | `app.js` |
| F-15 | **Server version disclosure.** Nginx returns its exact version in the `Server` header, and OpenSSH discloses its build string on port 22. | Nmap | Low | A05 | 4.1 | Nginx `server_tokens` |
| F-22 | **Host firewall installed but inactive.** `ufw` is present and reports `inactive`; no rules were applied. The instance depends entirely on the security group, so a cloud-layer misconfiguration has no host-level backstop. | Config | Low | A05 | 4.4, 4.5 | Instance configuration |

**The central observation of this assessment is one of instrumentation, not of any individual defect.** Six security dependencies — `helmet`, `express-rate-limit`, `morgan`, `compression`, `cookie-parser` and `express-validator` — are declared in `server/package.json` and are **never imported anywhere in the codebase**. Reading the manifest alone would suggest a hardened application; reading `app.js` reveals a five-line middleware chain containing no security control. This is a form of the misconfiguration risk that Singh and Chatterjee (2017) identify as endemic to cloud deployments, and it is invisible to any assessment inspecting dependency lists rather than execution paths. F-23 sharpens the point, since one of those unused libraries is the sole source of the server's only production vulnerability.

Equally notable is that **all four Critical findings were located by source review**, and this is not a failure of the tools. A scanner cannot determine that a restaurant administrator should not read another restaurant's order, because it holds no model of the intended authorisation policy. Khan and Al-Yasiri (2016) make this point in their threat framework: access-control failures require semantic knowledge of the system, which automated black-box testing is structurally incapable of supplying.

## 4.8 Controls already operating effectively

A balanced assessment must record what functions correctly, both to avoid overstating risk and to identify patterns worth generalising.

**Table 8 — Controls already operating effectively**

| Control | Implementation | Significance |
|---|---|---|
| Server-side price recomputation | `services/order.service.js:16–75` refetches every menu item, validates sizes and add-ons against the database, and overwrites client-supplied prices before totalling | Fully mitigates the classic price-tampering attack — a textbook A04 control, and the strongest single piece of engineering in the codebase |
| Stripe webhook signature verification | `payment.controller.js:96` uses `constructEvent` with the raw body correctly ordered before `express.json()` | Demonstrates that the author knows how to verify a callback, which makes the omission at F-02 a lapse rather than a knowledge gap |
| Password reset token design | `models/user.model.js:70–81` — 160-bit CSPRNG token, SHA-256 hashed at rest, ten-minute expiry | Meets OWASP ASVS 4.0.3 requirements without modification |
| Password storage | bcrypt via a Mongoose pre-save hook, with `select: false` on the field | Correct by construction; the field cannot be returned accidentally |
| Least-privilege database account | A `readWrite`-scoped user rather than an administrative one | The same pattern was carried into the Atlas configuration (Figure 9) |
| Absence of dangerous sinks | No `dangerouslySetInnerHTML`, `eval`, `new Function` or `$where` anywhere in 19,000 lines | Eliminates entire vulnerability classes structurally rather than by filtering |
| Order state machine | `utils/orderStatusMachine.js` — explicit transition matrix with per-role permissions | Sound design; F-06 is a missing ownership check *around* it, not a flaw *in* it |
| Secrets hygiene | No environment file committed; verified via `git ls-files` | Avoids the most common cause of credential compromise in public repositories |

<div style="page-break-after: always;"></div>

# 5. Proposed Security Solutions and Literature Review

## 5.1 Remediation strategy and prioritisation

Remediation is sequenced by exploitability against implementation cost rather than by severity alone, following the defence-in-depth principle that Vacca (2021) describes as layering independent controls so that no single failure is sufficient for compromise. Each remediation below is scoped to a discrete change so that it can be committed separately and the change history itself forms an audit trail.

**Table 9 — Remediation priority matrix**

| ID | Addresses | Remediation | Effort | Residual risk |
|---|---|---|---|---|
| R1 | F-01 | Fail-fast startup guard; remove all secret fallbacks | Low | None |
| R2 | F-09, F-14, F-15 | Security headers at the proxy; disable `X-Powered-By`; suppress `server_tokens` | Low | CSP requires tuning for Stripe, Leaflet and image hosts |
| R3 | F-08 | Rate limiting on authentication routes | Low | Distributed attacks still possible |
| R4 | F-03, F-10, F-18 | Assign parsed output back to `req.body`; extend schema coverage | Low | Coverage gaps until all routes have schemas |
| R5 | F-04, F-06, F-07 | Ownership scoping in the order and restaurant services | Medium | Requires per-endpoint review |
| R6 | F-02 | HMAC signature verification on gateway callbacks | Medium | Depends on real gateway credentials |
| R7 | F-05 | JWT handshake authentication and room authorisation for Socket.IO | Medium | None |
| R8 | F-12, F-16 | Request and audit logging; normalise error responses | Low | No centralised aggregation |
| R9 | F-13, F-19 | Escape regex metacharacters; strengthen upload validation | Low | SVG remains disallowed rather than sanitised |
| R10 | F-11, F-17 | Shorten token lifetime; restrict CORS reflection to development | Low | `localStorage` retained — see Section 6 |
| R11 | F-21, F-22 | Bind the API to loopback explicitly; activate the host firewall | Low | None — restores the two-layer control Section 3.1 assumes |
| R12 | F-23 | Upgrade the affected dependencies; remove unused libraries | Low | Recurs with each new advisory |

## 5.2 Identity and cryptographic controls

**R1 — Eliminate the hardcoded secret fallback (F-01).** The `||` fallback is the most dangerous construct in the codebase, because it converts a configuration error into a silent, total authentication bypass. The remediation removes every fallback and adds a startup assertion, so the process refuses to run rather than running insecurely — the fail-closed principle. `server/src/config/db.js` already applies exactly this pattern for the database URI, so the fix extends an established internal convention rather than importing a foreign one.

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

  // server/src/config/env.js — enforce presence at startup
+ if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
+     console.error('FATAL: JWT_SECRET must be set and at least 32 characters.');
+     process.exit(1);
+ }
```

Pinning the algorithm is defence in depth rather than a live fix: `jsonwebtoken` v9 already rejects `alg: none`, but explicit allowlisting is required by ASVS control 3.5.3 and guards against a dependency change reintroducing permissive verification. Token lifetime should also fall from seven days to one. Subashini and Kavitha (2011) identify session management as a principal weakness in multi-tenant service delivery, since a token that cannot be revoked remains valid for its full lifetime regardless of subsequent events — a compromise, a password reset, or an account deletion. Shortening the window bounds that exposure; full revocation would require a server-side token identifier and blocklist.

## 5.3 Access control remediation

**R5 — Ownership scoping (F-04, F-06, F-07).** Broken access control ranks first in the OWASP Top 10:2021 because it appeared in more tested applications than any other category (OWASP, 2021). This deployment illustrates why: the authorisation check is present, syntactically correct, and insufficient, because it verifies *role* without verifying *relationship*.

```diff
  // server/src/services/order.service.js — getOrderById
- if (orderUserId !== userId.toString() && role !== 'admin' && role !== 'restaurant_admin') {
-     throw new ApiError(403, 'Not authorized to access this order');
- }
+ const isOwner = orderUserId === userId.toString();
+ // A restaurant administrator may read an order ONLY for their own restaurant.
+ const isOwningRestaurant =
+     role === 'restaurant_admin' && restaurantId &&
+     orderRestaurantId === restaurantId.toString();
+ const isAssignedRider =
+     role === 'rider' && riderId && order.rider?.toString() === riderId.toString();
+
+ if (!isOwner && !isOwningRestaurant && !isAssignedRider) {
+     throw new ApiError(403, 'Not authorized to access this order');
+ }
```

The same relationship test applies to `updateOrderStatus` and `assignRider`, and the required context is already available since `protect` populates the restaurant and rider identifiers on every authenticated request, so no additional queries are incurred. The dead `'admin'` and `'super_admin'` branches should be removed: those roles are absent from the schema enum and therefore unreachable, but their presence creates a misleading impression that a privileged tier exists and is being checked, while in practice `restaurant_admin` silently inherits platform-wide scope.

**R4 — Close the escalation chain at its root (F-03, F-10).** The most instructive remediation is a single line. The schema strips unknown keys and returns the cleaned object; the middleware calls `parse` for its throwing behaviour and discards the sanitised result, so `req.body` reaches the controller with every attacker-supplied field intact.

```diff
  // server/src/middlewares/validate.middleware.js
-         schema.parse(req.body);
+         // Assign the parsed result back — unknown keys are stripped, which is
+         // what prevents fields such as `role` reaching the service layer.
+         req.body = schema.parse(req.body);

  // server/src/services/auth.service.js — defence in depth at the sink
- role: userData.role || 'customer',
+ role: 'customer',
```

Two independent controls then block the same attack. The redundancy is deliberate: Zissis and Lekkas (2012) argue that trust in cloud systems must be established through layered verification rather than a single gate, because any individual control may be bypassed or regress under future modification.

**R7 — Authenticate WebSocket connections (F-05).** Socket.IO connections bypass HTTP middleware entirely, so `protect` never runs. A handshake middleware verifies the token before the connection is established, and room membership is authorised against the verified identity rather than a client-supplied one. Without this, any anonymous client can subscribe to a stranger's live courier GPS trail — a location-privacy exposure with consequences beyond the application itself.

## 5.4 Input validation and injection defence

**R9 — Escape regex metacharacters (F-13).** Building a regular expression from unescaped input on an unauthenticated endpoint permits both promo-code enumeration and, through catastrophic backtracking, CPU exhaustion of a single-threaded event loop.

```diff
- const offer = await Offer.findOne({ code: new RegExp(`^${code}$`, 'i') });
+ const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
+ const offer = await Offer.findOne({
+     code: new RegExp(`^${escapeRegex(String(code))}$`, 'i'),
+ });
```

**R6 — Authenticate the payment callbacks (F-02).** The gateway callbacks accept unauthenticated state-changing requests. The correct pattern is already implemented in the same file for Stripe and should be generalised: compute an HMAC over the payload with a shared secret and compare it against the supplied header using a constant-time comparison, which prevents the timing side channel a naive equality test would expose.

**R4 (extended) — NoSQL operator injection (F-18).** Express 5 parses bracketed query parameters into nested objects, which reach Mongoose as query operators. A global sanitisation layer beneath the per-route schemas applies the same layered rationale as R4. **R9 (extended) — upload validation (F-19)** replaces the MIME prefix test with an explicit allowlist of raster formats plus a magic-byte check on the buffer, preventing both scripted SVG and extension spoofing.

## 5.5 Platform hardening and observability

**R2 — Security headers (F-09, F-14, F-15).** `helmet` is already a declared dependency, so part of this remediation is simply to import it. The architectural detail from Section 4.6 governs the rest: the document a browser loads is served by Nginx from disk, so application middleware cannot set headers on it. Setting them at the proxy covers both the static shell and the proxied API in one place.

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; frame-src 'self' https://js.stripe.com; img-src 'self' data: https://res.cloudinary.com https://*.tile.openstreetmap.org https://images.unsplash.com; connect-src 'self' https://api.stripe.com wss://foodora.duckdns.org https://router.project-osrm.org; object-src 'none'; frame-ancestors 'none'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
server_tokens off;
```

The policy is deliberately not a default one, because a default breaks the application: Stripe's payment frame requires its own origin in `script-src` and `frame-src`, map tiles and menu imagery come from third-party hosts, and the Socket.IO connection needs a `wss:` origin in `connect-src`. Setting it in only one place also matters, since two `Content-Security-Policy` headers are enforced as the intersection of both and produce failures that neither policy explains alone; the application layer should therefore disable helmet's CSP and HSTS modules and retain the remainder. `app.set('trust proxy', 1)` is required alongside this: behind Nginx every request originates from the loopback address, so without it the rate limiter proposed in R3 would count all traffic as a single client and throttle the entire user base together.

**R3 — Rate limiting (F-08)** applies a fifteen-minute window with a ten-request ceiling to the login and password-reset routes only, so ordinary browsing is unaffected. **R8 — logging and error normalisation (F-12, F-16)** wires in request logging, logs authentication and authorisation events explicitly, and normalises error responses so driver internals are no longer returned. Insufficient logging ranks ninth in the OWASP Top 10:2021 precisely because it converts a detectable incident into an invisible one, and the register in Section 4.7 describes attacks that would presently leave no record at all.

**R11 — Restore the second layer on port 5000 (F-21, F-22).** Both halves are single lines, which is what makes the omission instructive rather than excusable: the cost of the control was never the reason it was missing.

```diff
  // server/src/server.js
- server.listen(PORT, () => {
+ const HOST = process.env.BIND_HOST || '127.0.0.1';
+ server.listen(PORT, HOST, () => {
```

The host is read from the environment rather than hard-coded, because binding loopback unconditionally would break a containerised deployment, where the proxy occupies a separate network namespace and a loopback-bound process is unreachable from it. Activating the host firewall then gives the instance two enforcement points administered through different interfaces, so a single misconfiguration at the cloud layer no longer exposes an unauthenticated API.

## 5.6 Verification approach and expected outcomes

Remediation without verification is assertion, so each measurement taken in Section 4 defines the test that will confirm the corresponding fix. Table 10 records the baseline against the target, with the method by which each will be re-measured under conditions identical to the baseline — the same scan policy, scope and role token — so that any change is attributable to the remediation rather than to methodology.

**Table 10 — Baseline measurements and remediation targets**

| Measure | Baseline | Target | Re-measurement method |
|---|---|---|---|
| HTTP Observatory grade | D (30/100), 6 of 10 tests passed | A or better | Rescan the hostname after R2 |
| Security headers present on the document | 0 of 5 | 5 of 5 | Developer tools, document request |
| `X-Powered-By` on API responses | Present | Absent | `curl -I` against `/api/status` |
| `Server` version disclosed | `nginx/1.24.0 (Ubuntu)` | Suppressed to `nginx` | External Nmap service scan |
| ZAP alerts, unauthenticated | 0 High, 4 Medium, 6 Low | Header alerts resolved; informational alerts remain | Re-run with the identical policy and scope |
| Login attempts before throttling | Unlimited | 10 per 15 minutes | Scripted repeated failed logins returning 429 |
| API bind address | `*:5000` | `127.0.0.1:5000` | `ss -tlnp` on the instance |
| Host firewall | `inactive` | Active, default-deny inbound | `ufw status verbose` |
| Independent controls on port 5000 | 1 (security group only) | 2 (security group and loopback bind) | Sections 3.1 and 4.4 |
| Production dependency advisories | 1 high (server), 4 (client) | 0 | `npm audit --omit=dev` |
| Critical findings outstanding | 4 | 0 | Table 7 re-review |

Two of these will not move, and saying so in advance is part of the method. The externally reachable port list is already correct, so an unchanged result there is a pass rather than a failure; and the informational ZAP alerts are not addressed by any remediation above, so the alert count will fall rather than reach zero.

<div style="page-break-after: always;"></div>

# 6. Critical Evaluation

The deployment satisfies its objectives, but a credible evaluation must record what it does not achieve.

**Accepted residual risk.** Provisioning used root credentials, with no scoped administrative identity and no billing alarm — a departure from CIS v8 sub-control 5.4 that is bounded on a single-workload account but would be indefensible on one with more workloads or more administrators. The bearer token remains in `localStorage`, exposed to any cross-site scripting defect; an `HttpOnly`, `Secure`, `SameSite=Strict` cookie is the correct control, but it touches every client request path. Tokens remain non-revocable, which a token identifier and server-side blocklist would close. Instance egress is unrestricted. And global operator sanitisation is a safety net, not a substitute for the per-route schemas that still cover a minority of endpoints.

**Limitations of the method.** Automated scanning is structurally blind to authorisation, which is why manual review was necessary — but manual review carries the complementary weakness that it was performed by the application's own author, who is poorly placed to find flaws arising from their own assumptions. An independent reviewer would likely surface defects this assessment missed. The application-layer scan was further bounded by the spidering limitation recorded in Section 4.5, and no fuzzing or runtime dependency scanning was performed.

**Data residency.** The instance runs in `us-east-1` because that is where the account was already configured, not because it was chosen. For a platform holding names, telephone numbers, delivery addresses and live geolocation, that places personal data outside the United Kingdom, where transfers rest on the adequacy regulations rather than on domestic processing. `eu-west-2` was the correct region on both latency and residency grounds, and correcting it now means redeploying the instance, reissuing the certificate and re-pointing DNS — cheap at this stage, expensive once real users exist, which is the general shape of infrastructure decisions made by default rather than by design.

**Architectural limits.** The single-instance topology has no redundancy and no automated recovery. More interestingly, the application would not scale horizontally even if instances were added: `server/src/socket.js` holds per-process in-memory maps for socket association, write throttling and stale-position timers, so a second instance would see a disjoint set of connected clients and real-time events would reach only the emitting process's users. Scaling out requires a Redis adapter and sticky sessions. This is a constraint inherited from development rather than a deployment error, but it bounds what the architecture can serve.

**Economic and environmental realism.** The M0 cluster offers 512 MB without automated backup, and the `t3.micro` depends on CPU credits a sustained load would exhaust — adequate for demonstration, unsuitable for production. The economics are also finite in a way the phrase "free tier" obscures: the account holds $135.71 of credit against a plan expiring on 21 October 2026, so the deployment is funded for roughly fifteen months of running cost but *permitted* for barely two, because the plan expiry governs rather than the balance. That the entitlements were restructured to produce this arrangement is a reminder that the economic case for cloud rests on terms providers revise unilaterally (Lynn, 2020). The sustainability argument appears in miniature: the application drew a fractional share of a multi-tenant host rather than a dedicated always-on server, which is the resource pooling Mell and Grance (2011) treat as definitional — yet the same elasticity enables waste, since a forgotten instance consumes energy indefinitely while serving nothing, making cost monitoring a crude but genuine sustainability control.

<div style="page-break-after: always;"></div>

# 7. Conclusion and Recommendations

This portfolio deployed a custom three-role commerce application to AWS free-tier infrastructure, made it accessible locally and remotely over authenticated TLS, assessed it systematically at network, application and configuration tiers, and proposed twelve remediations justified against recognised control frameworks and peer-reviewed literature.

The principal finding is methodological. The externally visible infrastructure was well configured from the outset — two reachable ports, a database restricted to an explicit allowlist — so an assessment relying on external network scanning alone would have concluded the system was secure. Source and configuration review of that same system found four Critical application defects, any one of which permitted complete compromise of customer data, plus two host-level weaknesses invisible from outside: an API bound to every interface rather than loopback, and a host firewall installed but never activated. **The severity of the weaknesses bore no relationship to the layer that was easiest to test.** This bears out Armbrust *et al.* (2010): migrating to a provider transfers infrastructure risk but leaves application risk entirely with the customer.

Both host findings were failures of *verification* rather than of design: the architecture specified a loopback binding and a host firewall, and both were documented before either was checked. A deployment document describes intent; only the live system describes fact. Four recommendations follow for organisations undertaking comparable migrations.

**Assess at the layer where the risk lives.** Infrastructure scanning is necessary and cheap but cannot detect authorisation defects. Budget for source review and authenticated testing, and treat a clean external scan as evidence about the perimeter, not the application.

**Audit which controls execute, not which are installed.** This codebase declared six security dependencies and imported none, and one of those unused libraries was the sole source of its only production vulnerability. A manifest describes intent; the middleware chain describes reality.

**Make insecure configuration impossible rather than discouraged.** The most dangerous defect found was a fallback permitting startup with a publicly known signing key. Fail-closed assertions convert a silent compromise into an obvious failure.

**Treat responsibility allocation as scoping, not formality.** Mapping each layer to its owner before testing directed effort at the customer-controlled surface, where every Critical finding was located.

<div style="page-break-after: always;"></div>

# 8. References

Armbrust, M., Fox, A., Griffith, R., Joseph, A.D., Katz, R., Konwinski, A., Lee, G., Patterson, D., Rabkin, A., Stoica, I. and Zaharia, M. (2010) 'A view of cloud computing', *Communications of the ACM*, 53(4), pp. 50–58.

Center for Internet Security (2021) *CIS Critical Security Controls Version 8*. East Greenbush, NY: Center for Internet Security.

Clark, J. and van Oorschot, P.C. (2013) 'SoK: SSL and HTTPS — revisiting past challenges and evaluating certificate trust model enhancements', *Proceedings of the 2013 IEEE Symposium on Security and Privacy*. Berkeley, CA, 19–22 May. Los Alamitos, CA: IEEE Computer Society, pp. 511–525.

Erl, T., Mahmood, Z. and Puttini, R. (2013) *Cloud Computing: Concepts, Technology and Architecture*. Upper Saddle River, NJ: Pearson.

Fernandes, D.A.B., Soares, L.F.B., Gomes, J.V., Freire, M.M. and Inácio, P.R.M. (2014) 'Security issues in cloud environments: a survey', *International Journal of Information Security*, 13(2), pp. 113–170.

Fox, R. (2021) *Linux with Operating System Concepts*. 2nd edn. New York: Chapman and Hall/CRC.

Khan, N. and Al-Yasiri, A. (2016) 'Identifying cloud security threats to strengthen cloud computing adoption framework', *Procedia Computer Science*, 94, pp. 485–490.

Lynn, T. (2020) *Measuring the Business Value of Cloud Computing*. Palgrave Studies in Digital Business and Enabling Technologies. Cham: Palgrave Macmillan.

Mell, P. and Grance, T. (2011) *The NIST Definition of Cloud Computing*. NIST Special Publication 800-145. Gaithersburg, MD: National Institute of Standards and Technology.

Negus, C. (2020) *Linux Bible*. 10th edn. Indianapolis, IN: Wiley.

OWASP (2020) *OWASP Web Security Testing Guide v4.2*. Bel Air, MD: Open Web Application Security Project.

OWASP (2021) *OWASP Top 10:2021 — The Ten Most Critical Web Application Security Risks*. Bel Air, MD: Open Web Application Security Project.

Scarfone, K., Souppaya, M., Cody, A. and Orebaugh, A. (2008) *Technical Guide to Information Security Testing and Assessment*. NIST Special Publication 800-115. Gaithersburg, MD: National Institute of Standards and Technology.

Singh, A. and Chatterjee, K. (2017) 'Cloud security issues and challenges: a survey', *Journal of Network and Computer Applications*, 79, pp. 88–115.

Subashini, S. and Kavitha, V. (2011) 'A survey on security issues in service delivery models of cloud computing', *Journal of Network and Computer Applications*, 34(1), pp. 1–11.

Vacca, J.R. (2021) *Cloud Computing Security: Foundations and Challenges*. 2nd edn. Boca Raton, FL: CRC Press.

Zissis, D. and Lekkas, D. (2012) 'Addressing cloud computing security issues', *Future Generation Computer Systems*, 28(3), pp. 583–592.

<div style="page-break-after: always;"></div>

# Appendix A — Nginx Site Configuration

`/etc/nginx/sites-available/foodora` as deployed. The TLS directives were generated by Certbot and are retained unmodified; the `add_header` and `server_tokens` directives proposed in Section 5.5 are not yet present.

```nginx
server {
    if ($host = foodora.duckdns.org) {
        return 301 https://$host$request_uri;
    }   # managed by Certbot
    listen 80;
    listen [::]:80;
    server_name foodora.duckdns.org;
    return 404;   # managed by Certbot
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name foodora.duckdns.org;

    ssl_certificate     /etc/letsencrypt/live/foodora.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/foodora.duckdns.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/foodora;
    index index.html;

    client_max_body_size 10M;

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # Content-hashed build assets are safe to cache indefinitely.
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React Router owns the client-side routes: unknown paths return the shell.
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Socket.IO requires the Upgrade/Connection pair or clients silently
    # fall back to long-polling.
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       $host;
        proxy_set_header X-Real-IP  $remote_addr;
        proxy_read_timeout 86400s;
    }
}
```

# Appendix B — Assessment Tool Output

**External Nmap service scan**, run from the author's workstation across the internet. Ports 5000, 8081 and 27017 were named explicitly because Nmap omits filtered ports from a full sweep, and an absent row cannot distinguish "unreachable" from "not scanned".

```
> nmap -Pn --reason -sV -p 22,80,443,5000,8081,27017 34.195.198.83
Starting Nmap 7.991 ( https://nmap.org )
Nmap scan report for ec2-34-195-198-83.compute-1.amazonaws.com (34.195.198.83)
Host is up, received user-set (0.21s latency).

PORT      STATE    SERVICE          REASON            VERSION
22/tcp    open     ssh              syn-ack ttl 49    OpenSSH 9.6p1 Ubuntu 3ubuntu13.18
80/tcp    open     http             syn-ack ttl 49    nginx 1.24.0 (Ubuntu)
443/tcp   open     ssl/http         syn-ack ttl 49    nginx 1.24.0 (Ubuntu)
5000/tcp  filtered upnp             no-response
8081/tcp  filtered blackice-icecap  no-response
27017/tcp filtered mongod           no-response
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 25.88 seconds
```

The `SERVICE` labels on filtered rows are static lookups from Nmap's port table keyed on port number, not detections: nothing responded, and no database process runs on the instance, as the listener enumeration below confirms independently.

**Internal listener enumeration**, captured on the instance:

```
ubuntu@ip-172-31-16-58:~$ sudo ss -tlnp
State  Recv-Q Send-Q Local Address:Port  Process
LISTEN 0      511          0.0.0.0:443   users:(("nginx",pid=11089),("nginx",pid=11088),("nginx",pid=8898))
LISTEN 0      511          0.0.0.0:80    users:(("nginx",pid=11089),("nginx",pid=11088),("nginx",pid=8898))
LISTEN 0      4096         0.0.0.0:22    users:(("sshd",pid=3759))
LISTEN 0      511                *:5000  users:(("node /srv/foodo",pid=10431))
LISTEN 0      4096   127.0.0.53%lo:53    users:(("systemd-resolve",pid=7804))
LISTEN 0      4096      127.0.0.54:53    users:(("systemd-resolve",pid=7804))

ubuntu@ip-172-31-16-58:~$ sudo ufw status
Status: inactive
```

`nginx` holds 80 and 443 as intended and `sshd` holds 22, reachable only from the allowlisted address by security-group rule. `node` holds **`*:5000` — all interfaces, not loopback** (F-21). The `systemd-resolve` listeners are bound to link-local addresses and are not reachable off-box. `ufw status: inactive` on the same capture is F-22. Together these two lines evidence that the instance relies on a single enforcement point for its entire network posture.

**Baseline HTTPS response headers**, captured from the workstation:

```
> curl -sI https://foodora.duckdns.org/api/status
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Content-Type: application/json; charset=utf-8
X-Powered-By: Express
Access-Control-Allow-Origin: https://foodora.duckdns.org
Vary: Origin
Access-Control-Allow-Credentials: true
```

Absent: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` — nought of five. Present and unwanted: `Server` with an exact version (F-15) and `X-Powered-By` (F-14).

**Socket.IO handshake over TLS**, confirming the proxy upgrade block:

```
> curl -s "https://foodora.duckdns.org/socket.io/?EIO=4&transport=polling"
0{"sid":"...","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}
```

The server offers the protocol switch through the proxy. Note also that the handshake succeeded **without any credential**, which is F-05: the connection is established before any token is examined.

**TLS cipher enumeration:**

```
> nmap --script ssl-enum-ciphers -p 443 foodora.duckdns.org
| ssl-enum-ciphers:
|   TLSv1.2:
|     ciphers:
|       TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 (secp256r1) - A
|       TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 (secp256r1) - A
|       TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256 (secp256r1) - A
|   TLSv1.3:
|     ciphers:
|       TLS_AKE_WITH_AES_128_GCM_SHA256 (ecdh_x25519) - A
|       TLS_AKE_WITH_AES_256_GCM_SHA384 (ecdh_x25519) - A
|       TLS_AKE_WITH_CHACHA20_POLY1305_SHA256 (ecdh_x25519) - A
|_  least strength: A
```

No TLS 1.0 or 1.1 is offered, every cipher grades A, and all suites provide forward secrecy and authenticated encryption. The transport layer is the one part of the deployment requiring no remediation.

# Appendix C — OWASP ZAP Alert Summary

Unauthenticated automated scan against `https://foodora.duckdns.org`.

| Risk level | Count |
|---|---|
| High | 0 |
| Medium | 4 |
| Low | 6 |
| Informational | 3 |
| **Total** | **13** |

| Alert | Instances | Related finding |
|---|---|---|
| Content Security Policy header not set | 5 | F-09 |
| CSP: failure to define directive with no fallback | 1 | F-09 |
| Missing anti-clickjacking header | 5 | F-09 |
| Strict-Transport-Security header not set | — | F-09 |
| X-Content-Type-Options header missing | — | F-09 |
| Server leaks information via `X-Powered-By` | — | F-14 |
| Server leaks version information via `Server` | — | F-15 |
| Subresource integrity attribute missing | 5 | Not remediated — accepted |
| Timestamp disclosure | — | Informational |
| Information disclosure — suspicious comments | 11 | Informational |
| Modern web application | 5 | Informational |
| In-page banner information leak | — | Informational |
| Re-examine cache-control directives | — | Informational |

Zero High alerts against an application containing four Critical authorisation defects is the single most important result in this appendix, and Section 4.7 draws the methodological conclusion from it.

<div style="page-break-after: always;"></div>

# Declaration of Software Tools and Generative Artificial Intelligence Use

**Software tools used in this assessment:**

| Tool | Version | Purpose |
|---|---|---|
| Amazon Web Services (EC2, VPC, Elastic IP) | — | Cloud infrastructure hosting |
| AWS CLI | 2.34.33 | Resource provisioning and verification |
| MongoDB Atlas | M0 | Managed database service |
| Ubuntu Server | 24.04.4 LTS | Guest operating system |
| Nginx | 1.24.0 | Reverse proxy and static file server |
| Node.js / npm / PM2 | 22.23.2 / 10.9.8 / 7.0.3 | Application runtime and process supervision |
| Certbot / Let's Encrypt | 5.7.0 | TLS certificate issuance and renewal |
| Nmap | 7.991 | Network and TLS assessment |
| OWASP ZAP | 2.17.0 | Application security assessment |
| MDN HTTP Observatory | — | Security header assessment |
| npm audit | — | Dependency vulnerability analysis |
| Git | 2.43.0 | Version control |
| Microsoft Word | — | Document preparation |

**Generative AI declaration:**

In accordance with the Category B permissions for this assessment, I declare the following use of Generative AI:

- **Tool used:** {{AI_TOOL_AND_VERSION}}
- **Purpose:** {{Describe accurately what you used it for — e.g. structuring the report sections, summarising the OWASP Top 10 and CIS control categories, and reviewing the deployment for configuration errors}}
- **Extent:** {{Describe accurately — e.g. structure and summary content were generated and then rewritten in my own words; all deployment work, all commands executed, all screenshots and all scan outputs are my own}}

All deployment work, security testing, screenshots and scan outputs presented in this portfolio are my own. All sources are cited in Section 8. Any AI-assisted content has been fact-checked against authoritative sources and rewritten in my own words.

**Signed:** {{YOUR_NAME}}

**Student Number:** {{STUDENT_ID}}

**Date:** {{SUBMISSION_DATE}}
