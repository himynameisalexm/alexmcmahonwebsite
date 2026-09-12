# Send Drawing — server-free email submission

Notes to come back to. The goal: when someone clicks Send Drawing, the image is
delivered to hello@alexmcmahon.com.au directly from the browser, with an optional
sender email address. No visitor mail client involved.

## Why the current version isn't enough

- `mailto:` opens the visitor's default mail app (Apple Mail if not set up on Mac)
  and cannot attach files — a browser security restriction, not a Gmail limitation.
- Gmail / Outlook web compose URLs also cannot receive attachments via query string.
- To actually deliver the image, the page needs to POST it somewhere that will
  relay to your inbox. On GitHub Pages there is no backend, so the "somewhere"
  is a third-party service.

## Recommended stack — imgbb + EmailJS

Two free accounts, no server code, no move off GitHub Pages.

### 1. imgbb — image hosting

- Sign up at https://api.imgbb.com/ (free)
- Get an API key
- POST the drawing as base64; response gives back a hosted image URL
- Free tier is generous, key is public/client-side by design (rate-limited by IP)

### 2. EmailJS — email delivery from the browser

- Sign up at https://www.emailjs.com/ (free: 200 emails / month)
- Connect a mail service (Gmail is easiest — OAuth once, done)
- Create an email template with variables: `{{from_email}}`, `{{drawing_url}}`
- Grab three IDs: `serviceId`, `templateId`, `publicKey`
- All three are safe to embed in the page (EmailJS rate-limits by domain)

### 3. Flow on the page

1. Visitor draws, clicks Send Drawing.
2. Modal opens with:
   - preview of the drawing
   - optional email input ("your email — optional")
   - Send button
3. On Send:
   - `canvas.toDataURL('image/jpeg', 0.85)` → base64 string
   - `fetch('https://api.imgbb.com/1/upload?key=YOUR_KEY', {method:'POST', body: formData})`
     → get the hosted URL
   - `emailjs.send(serviceId, templateId, {from_email, drawing_url}, publicKey)`
   - Show "Sent — thanks" state
4. Alex receives an HTML email with the drawing inline plus the sender's email
   if they provided one.

### Template body suggestion

```html
<p>Someone drew you something on alexmcmahon.com.au.</p>
<p>From: {{from_email}}</p>
<img src="{{drawing_url}}" style="max-width:600px;border-radius:8px;">
```

## Setup checklist

- [ ] Sign up at imgbb → API key
- [ ] Sign up at EmailJS → connect Gmail → create template → grab three IDs
- [ ] Paste four values into `index.html` (imgbb key, EmailJS serviceId, templateId, publicKey)
- [ ] Replace the current modal's Gmail/Outlook buttons with a single "Send" button
  plus an optional email input
- [ ] Handle loading / success / error states
- [ ] Test end-to-end from a phone and a desktop

## Alternatives considered

- **Formspree** — simplest form-to-email service, but a raw form submission would
  arrive as a giant base64 blob rather than a viewable image. Would still need
  imgbb alongside to host the image, at which point EmailJS gives a nicer inline
  presentation.
- **Web3Forms** — similar to Formspree, same trade-off.
- **Netlify Functions / Cloudflare Workers** — proper backend, real attachments
  via SendGrid or similar. More setup, more moving parts.
- **Netlify Forms** — would require moving the site off GitHub Pages.

## Size note

The canvas at full viewport × 2 DPR is large. Encode as JPEG (not PNG) at
quality 0.8–0.85 before uploading. Well under imgbb's 32 MB limit and keeps the
upload fast on mobile networks.
