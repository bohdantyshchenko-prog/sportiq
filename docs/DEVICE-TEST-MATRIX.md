# NOVIQ device verification

## Automated browser matrix

Run the same core journeys in Playwright using:

- iPhone 13 / WebKit
- iPhone 15 Pro / WebKit
- Pixel 7 / Chromium
- Galaxy S23-sized Chromium viewport
- Desktop Safari-equivalent WebKit
- Desktop Chrome

Core journeys:

1. Cold start and cached start
2. Dark/light switching
3. Sign in and expired-token recovery
4. Match list remote load and provider failure fallback
5. AI Briefing success, timeout and invalid response
6. Thesis creation, lock and replay
7. Push permission accepted, rejected and unsupported
8. Offline navigation and reconnect
9. PWA update from the previous cache
10. 200% text zoom, keyboard focus and reduced motion

## Physical devices still required

Automation does not prove operating-system integration. Before production, verify on physical hardware:

- current iPhone on the current public iOS release
- one iPhone supported by the oldest target iOS release
- current Google Pixel
- current Samsung Galaxy device

Physical-only checks:

- Add to Home Screen
- safe areas and Dynamic Island
- keyboard viewport resizing
- push delivery after the app is closed
- notification deep links
- background/foreground recovery
- low-power mode
- weak mobile connection
- VoiceOver and TalkBack
- light/dark OS changes

Record device model, OS build, browser/PWA mode, result, screenshot and defect link for every run.
