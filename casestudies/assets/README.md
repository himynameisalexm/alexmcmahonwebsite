# Case study assets

Drop files in this folder, then **uncomment the matching `<figure>` block** in the case
study HTML. Each slot is marked with `<!-- MEDIA SLOT: ... -->` and already contains the
correct filename, alt text and caption — you only need to delete the comment markers.

The media treatments (`.cs-media`, `.cs-media-wide`, `.cs-media-pair`, `.cs-media-portrait`)
are already styled to match the site: 20px rounded frame, hairline border, soft hover
shadow, caption in grey underneath.

---

## Shot list — lmg.html

### Live ✅

| Slot | File | Layout | Source |
|---|---|---|---|
| My Note Writer | `my-note-writer.mp4` (320 KB) + poster | right-column aside | `MyNW-copybutton.gif`, 6–18s, 722×926, H.264 CRF 21. |
| Contextual disclosure | `contextual-disclosure.png` (81 KB) | prose column, 722px native | Frame 210 of `MyNW-copybutton.gif`, cropped to the acknowledgement + copy control. |
| My QA | `my-qa-review.mp4` (715 KB) + poster | right-column aside | `part 2 myqa.gif`, first 13s, **cropped to the assistant panel only** (516×616 at native resolution). |

**Why MP4 and not GIF.** The first attempt shipped `my-qa-review.gif` at 1.3 MB and it looked terrible —
GIF caps at 256 colours, and squeezing a 1080px screen recording into a 64-colour global palette
destroys anti-aliased UI text. H.264 has no palette limit: the MP4 is *half the size* and far sharper.
Cropping to the assistant panel rather than the whole browser window matters just as much — it removes
~60% of the pixels (all of it irrelevant chrome) so the part you actually want stays at 1:1.

### Still open

| Slot | File | Type | Notes |
|---|---|---|---|
| My Data Analyst | `my-data-analyst.mp4` + poster | video | Nothing in the Dropbox folder covers this one yet. |
| Broker events | `broker-event-stage.jpg`, `broker-event-room.jpg` | 2 images | You presenting; the room. |

Unused from the Dropbox folder: `policy-full.gif`, `policy-documents.gif`, `MyDocs future.gif`
(My Documents / policy — no matching section yet), `OpenBanking_Customer.gif`,
`First time login NZ user - OTP in QA.gif` (not AI-assistant work), `clickup_claude.gif`,
`claude-clickup-full.gif` (internal tooling, not the product).

Other pages (`expedia.html`, `alpaca.html`) have no slots yet — say the word and I'll add them.

---

## Export settings

**Screen recordings — use MP4, not GIF.** The markup uses `autoplay loop muted playsinline`,
so an MP4 behaves exactly like a GIF in the browser, at a fraction of the size and none of
the colour banding.

`ffmpeg` isn't installed system-wide here; it came in via `pip install --user imageio-ffmpeg`,
which bundles a static binary. Get the path with:

```bash
python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
```

The recipe used for both live clips — crop to the region that matters, then encode:

```bash
ffmpeg -i source.gif -t 13 -vf "crop=W:H:X:Y,fps=20" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 21 -preset slow \
  -movflags +faststart -an out.mp4
```

- Crop to the assistant panel, not the whole browser window. Fewer pixels, all of them useful.
- Width and height must both be even or `yuv420p` fails.
- CRF 21 is a good default; lower is higher quality and bigger.
- Keep clips 6–13 seconds so the loop doesn't feel long.
- Always export a `poster` frame so there's no empty box before the video loads.
- **Screenshots:** PNG for UI, 2× the display size (so ~1960px wide for a wide slot).
- **Photos:** JPG, ~1600px on the long edge, quality 80.
- Keep any single file under ~2 MB so the page stays fast.

## Before publishing

- **Get LMG's sign-off.** These are their product screens. Standard practice is to
  confirm with your marketing/comms contact, and blur or replace any real client names,
  loan amounts, contact details or broker identifiers in the captures.
- Check the captures for anything in a sidebar, notification or browser tab that
  shouldn't be public.
