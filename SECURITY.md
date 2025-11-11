# Security Policy

## Supported Branches

We actively apply security fixes on the default branch (`master`). Feature branches should be short‑lived and rebased frequently so security patches propagate quickly.

| Branch    | Supported    | Notes                               |
|-----------|--------------|-------------------------------------|
| master    | Yes          | Primary development & releases      |
| feature/* | Best effort  | Rebase often; intended to be short  |

## Reporting a Vulnerability

If you discover a vulnerability, **do not create a public issue**.

1. Prepare details: affected endpoint / file, reproduction steps, impact, any PoC (sanitized).
2. Email: security-reports@example.com (replace with real mailbox) with subject: `[SECURITY][poc-task-manager] <short title>`.
3. Include (if known): potential CWE / CVSS, logs (redact secrets), remediation suggestion.
4. We acknowledge within **2 business days** (target) and give you a tracking reference.

If you receive no response in 5 business days, you may escalate via a private GitHub discussion (if enabled) or finally a minimal public issue titled `[SECURITY-DISCLOSURE]` without exploit specifics.

## Coordinated Disclosure Process (Targets)

| Phase                              | Target SLA                |
|------------------------------------|---------------------------|
| Acknowledge report                 | 2 business days           |
| Triage & severity classification   | 5 business days           |
| Fix implementation start           | 10 business days          |
| Fix merged (High / Critical)       | 30 calendar days          |
| Advisory / public disclosure       | After patch & agreement   |

Timelines may vary for complex or upstream dependency issues. We prioritize silent patching first, disclosure second.

## Severity Guidelines

| Severity  | Examples                                                     |
|-----------|--------------------------------------------------------------|
| Critical  | Remote code execution, full auth bypass, large data exfil    |
| High      | Privilege escalation, CSRF altering data, auth logic flaws   |
| Medium    | Limited info disclosure, partial DoS, insecure defaults     |
| Low       | Minor misconfig, best-practice deviation, low impact issues |

## Communication & Credit

We keep reporters informed at: triage completion, fix in progress, patch release. Credit is optional—state your preference. We never require assignment of copyrights or broad NDAs for reporting.

## Safe Harbor

We will not pursue legal action for good‑faith security research that:

- Avoids privacy violations, data destruction, or service degradation
- Does not pivot to third‑party systems or lateral movement
- Respects rate limits & authorization boundaries
- Provides a reasonable remediation window prior to disclosure

## Testing Guidelines

- Use test / dummy accounts whenever possible
- Do not run destructive fuzzing against production data
- Avoid high‑volume automated scanning that could trigger rate limiting
- Do not exfiltrate real personal or proprietary data

## Handling Exposed Secrets

If you find a credential (token, key, password):
1. Do not attempt to use it.
2. Report the file / location and approximate exposure window.
3. Redact it in any attachments.
We will rotate and invalidate the secret promptly.

## Supply Chain / Dependency Issues

If the flaw is in a third‑party dependency, please also report upstream. We will:
- Apply Dependabot / manual patch
- Add temporary mitigations (feature flag, input validation, WAF rules)
- Track advisory until resolved

## Roadmap / Planned Controls

- Continuous CodeQL scanning (SAST)
- Semgrep ruleset (OWASP + framework patterns) with SARIF upload
- GitHub secret scanning & push protection enforcement
- SBOM generation & license policy gates
- Coverage delta/trend based quality gates

## Questions

For non‑sensitive security questions, open a discussion or normal issue labeled `security-question`.

Thank you for helping keep this project secure.
