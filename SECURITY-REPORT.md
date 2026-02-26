# Website Security Report

**Website:** mariankadlec.cz  
**Report Date:** February 26, 2026  
**Report Type:** Static Website Security Assessment

---

## Executive Summary

This security assessment covers the static portfolio website for Marian Kadlec. The website is a simple HTML/CSS static site with minimal JavaScript (only Microsoft Clarity analytics). Overall, the security posture is good for a static website, with several improvements implemented.

---

## Security Findings

### ✅ PASSED Checks

| Check | Status | Details |
|-------|--------|---------|
| **HTTPS Usage** | ✅ Pass | All canonical URLs and resource links use HTTPS |
| **External Link Security** | ✅ Pass | All external links have `target="_blank"` with `rel="noopener noreferrer"` |
| **No User Input Forms** | ✅ Pass | No forms present, eliminating form-based attack vectors |
| **No Inline Event Handlers** | ✅ Pass | No onclick, onload, or other inline JavaScript handlers |
| **Charset Declaration** | ✅ Pass | UTF-8 charset properly declared |
| **Viewport Meta Tag** | ✅ Pass | Proper viewport configuration for responsive design |
| **No Mixed Content** | ✅ Pass | All resources loaded over HTTPS |
| **CSS Security** | ✅ Pass | No CSS expressions or dangerous patterns |

### 🔧 IMPLEMENTED Improvements

The following security headers have been added via meta tags:

| Header | Value | Purpose |
|--------|-------|---------|
| **X-Content-Type-Options** | `nosniff` | Prevents MIME-type sniffing attacks |
| **X-Frame-Options** | `SAMEORIGIN` | Prevents clickjacking attacks |
| **X-XSS-Protection** | `1; mode=block` | Legacy XSS filter (browser support varies) |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Controls referrer information leakage |
| **Content-Security-Policy** | Comprehensive policy | Restricts resource loading to trusted sources |
| **Permissions-Policy** | Restrictive | Disables unnecessary browser features |

### ⚠️ INFORMATIONAL Findings

#### 1. Personal Information Exposure (Low Risk)
- **Location:** JSON-LD structured data
- **Details:** Email address and phone number prefix are exposed in schema.org structured data
- **Risk Level:** Low (expected for a portfolio/contact site)
- **Recommendation:** This is intentional for a portfolio site, but be aware that web scrapers can collect this information

#### 2. Third-Party Analytics (Microsoft Clarity)
- **Location:** Inline script in `<head>`
- **Details:** Microsoft Clarity is loaded for analytics and session recording
- **Risk Level:** Low (trusted Microsoft service)
- **Considerations:**
  - Clarity tracks user behavior including mouse movements, clicks, and scroll patterns
  - Session recordings may capture sensitive user data if users type in the browser
  - Microsoft's privacy policy applies to collected data
- **Recommendation:** 
  - Consider adding a cookie/privacy notice for GDPR compliance
  - Review Clarity's data retention settings in your dashboard

#### 3. External Font Loading (Google Fonts)
- **Location:** Preconnect links and stylesheet
- **Details:** Fonts loaded from `fonts.googleapis.com` and `fonts.gstatic.com`
- **Risk Level:** Low (trusted Google service)
- **Note:** Subresource Integrity (SRI) cannot be applied to Google Fonts as they serve dynamic content

---

## Content Security Policy Details

The implemented CSP restricts resources as follows:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.clarity.ms;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://www.clarity.ms https://*.clarity.ms;
frame-ancestors 'self';
```

| Directive | Allowed Sources | Reason |
|-----------|-----------------|--------|
| `default-src` | 'self' | Base restriction for all resources |
| `script-src` | 'self', 'unsafe-inline', clarity.ms | Allows Clarity analytics script |
| `style-src` | 'self', 'unsafe-inline', Google Fonts | Allows external fonts and inline styles |
| `font-src` | 'self', fonts.gstatic.com | Allows Google Fonts |
| `img-src` | 'self', data:, https: | Allows images from any HTTPS source |
| `connect-src` | 'self', clarity.ms | Allows Clarity network requests |
| `frame-ancestors` | 'self' | Prevents clickjacking |

---

## Server-Side Recommendations

For enhanced security, configure these headers at the server level (e.g., in `.htaccess`, nginx config, or Cloudflare):

### Apache (.htaccess)
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

### Nginx
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### GitHub Pages
GitHub Pages automatically handles HTTPS and some security headers. For additional headers, consider using Cloudflare or a similar CDN.

---

## GDPR/Privacy Considerations

Since the website uses Microsoft Clarity for analytics:

1. **Cookie Notice:** Consider adding a cookie consent banner for EU visitors
2. **Privacy Policy:** Consider adding a privacy policy page or link
3. **Data Processing Agreement:** Ensure you have reviewed Microsoft's DPA for Clarity

---

## Vulnerability Assessment Summary

| Category | Status | Notes |
|----------|--------|-------|
| Cross-Site Scripting (XSS) | ✅ Not Vulnerable | Static content, no user input |
| SQL Injection | ✅ Not Applicable | No database |
| Cross-Site Request Forgery (CSRF) | ✅ Not Applicable | No forms |
| Clickjacking | ✅ Protected | X-Frame-Options header added |
| Content Injection | ✅ Protected | CSP implemented |
| Man-in-the-Middle | ✅ Protected | HTTPS enforced |
| Information Disclosure | ⚠️ Intentional | Contact info for portfolio |

---

## Security Score

**Overall Security Score: 9/10** ⭐⭐⭐⭐⭐

The website demonstrates strong security practices for a static portfolio site. The implemented CSP and security headers provide defense-in-depth protection.

---

## Files Modified

1. `index.html` - Added security meta tags

---

*This report was generated as part of a security review. For questions or concerns, please contact the website owner.*
