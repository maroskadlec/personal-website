# Security Report for mariankadlec.com

**Report Date:** February 26, 2026  
**Project Type:** Static Portfolio Website  
**Hosting:** GitHub Pages (based on CNAME file)

---

## Executive Summary

This security audit analyzes the static portfolio website for potential security vulnerabilities and best practice compliance. The website is a simple static HTML/CSS site without server-side processing, which inherently reduces the attack surface.

**Overall Risk Level:** LOW

---

## Security Findings

### 1. Third-Party Script Security

#### Finding: Microsoft Clarity Analytics (MEDIUM)

**Location:** `index.html`, lines 158-164

```html
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "rucbrqyu1e");
</script>
```

**Risk:** Third-party scripts can potentially be compromised (supply chain attack). Microsoft Clarity collects user behavior data.

**Recommendations:**
- Consider adding Subresource Integrity (SRI) if possible
- Ensure GDPR/privacy compliance with cookie consent banner
- Review Clarity's data retention policies

---

### 2. External Resource Loading

#### Finding: Google Fonts Dependencies (LOW)

**Location:** `index.html`, lines 55-57

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500;600;700;800;900&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

**Risk:** External dependency on Google services. Privacy concerns for EU visitors (GDPR).

**Recommendations:**
- Consider self-hosting fonts for better privacy compliance
- Add `crossorigin` attribute for better security

---

### 3. Content Security Policy (CSP) - Missing

#### Finding: No CSP Headers (MEDIUM)

**Risk:** Without CSP, the site is more vulnerable to XSS attacks if any user-input vectors are added in the future.

**Recommendation:** For GitHub Pages, add a `<meta>` CSP tag:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.clarity.ms;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://www.clarity.ms;
">
```

---

### 4. External Links Security

#### Finding: Proper rel Attributes (PASS)

**Location:** `index.html`, lines 216-224

All external links correctly use `rel="noopener noreferrer"`:

```html
<a href="https://www.linkedin.com/in/marian-kadlec/" class="btn-social" target="_blank" rel="noopener noreferrer">
```

**Status:** SECURE - Prevents tabnabbing attacks

---

### 5. Personal Information Exposure

#### Finding: Email Address in Schema.org Data (LOW)

**Location:** `index.html`, line 70

```json
"email": "marian.kadlec@icloud.com"
```

**Risk:** Email address is exposed to web scrapers and bots.

**Recommendations:**
- Consider using a contact form instead
- Use JavaScript obfuscation for email display
- Accept this as intentional for professional contact purposes

---

### 6. HTTPS Configuration

#### Finding: All Resources Use HTTPS (PASS)

All external resources properly use HTTPS:
- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com`
- `https://www.clarity.ms`
- All social media links

**Status:** SECURE - No mixed content issues

---

### 7. Form Security

#### Finding: No Forms Present (PASS)

The website contains no forms, eliminating risks related to:
- CSRF attacks
- Form injection
- Input validation vulnerabilities

**Status:** NOT APPLICABLE

---

### 8. Cookie/Privacy Compliance

#### Finding: No Cookie Consent Banner (MEDIUM)

**Risk:** Microsoft Clarity sets tracking cookies. EU visitors should be informed under GDPR/ePrivacy regulations.

**Recommendations:**
- Add a cookie consent banner
- Provide privacy policy page
- Allow users to opt-out of analytics

---

### 9. PWA Security (site.webmanifest)

#### Finding: Web App Manifest Configuration (PASS)

**Location:** `site.webmanifest`

```json
{
    "start_url": "/",
    "scope": "/",
    "display": "standalone"
}
```

**Status:** SECURE - Properly scoped to the domain

---

### 10. Image Security

#### Finding: No Alt Text Security Concerns (PASS)

All images use descriptive `alt` attributes without sensitive information.

**Status:** SECURE

---

### 11. DOM-Based XSS

#### Finding: No JavaScript DOM Manipulation (PASS)

The website has no custom JavaScript that manipulates the DOM based on URL parameters or user input.

**Status:** SECURE - No XSS vectors found

---

### 12. Clickjacking Protection

#### Finding: No X-Frame-Options (LOW)

**Risk:** Without X-Frame-Options or frame-ancestors CSP directive, the page could potentially be embedded in an iframe on malicious sites.

**Recommendation:** Add to CSP:

```html
frame-ancestors 'self';
```

---

## Security Headers Recommendations

Since GitHub Pages doesn't support custom HTTP headers, use `<meta>` tags where possible:

```html
<!-- Add to <head> section -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.clarity.ms;">
```

---

## Summary Table

| Finding | Severity | Status |
|---------|----------|--------|
| Third-party analytics (Clarity) | Medium | Review Required |
| Google Fonts external loading | Low | Consider Self-hosting |
| Missing CSP headers | Medium | Action Recommended |
| External link security | N/A | PASS |
| Email exposure | Low | Acceptable Risk |
| HTTPS usage | N/A | PASS |
| Form security | N/A | Not Applicable |
| Cookie consent | Medium | Action Recommended |
| PWA configuration | N/A | PASS |
| Image security | N/A | PASS |
| XSS vulnerabilities | N/A | PASS |
| Clickjacking protection | Low | Action Recommended |

---

## Recommended Actions (Priority Order)

### High Priority
1. **Add Content Security Policy** - Implement CSP meta tag to prevent XSS

### Medium Priority
2. **Add cookie consent banner** - GDPR compliance for EU visitors
3. **Review analytics privacy** - Ensure Clarity configuration meets privacy requirements

### Low Priority
4. **Consider self-hosting fonts** - Better privacy and performance
5. **Add privacy policy page** - Transparency for visitors

---

## Conclusion

The website has a strong security posture for a static site. The main areas for improvement are:
1. Adding Content Security Policy headers
2. GDPR compliance for analytics tracking
3. Minor privacy enhancements

The site does not process user data, has no forms, and uses HTTPS throughout, which significantly reduces the attack surface.

---

*Report generated by security audit on February 26, 2026*
