/**
 * Das blaue Element — app.js
 *
 * Fully static. No external dependencies. No data transmission.
 * Fragment codes are stored in localStorage only.
 *
 * ─── GitHub Pages Deployment ─────────────────────────────────────────
 *  1. Create a new GitHub repository (public or private with Pages enabled).
 *  2. Upload index.html, styles.css, and app.js to the root of the main branch.
 *  3. Go to Settings → Pages → Source: Branch: main / Folder: / (root) → Save.
 *  4. Your site will be live at: https://<username>.github.io/<repo>/
 * ─────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Configuration
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  /** Default event date (ISO 8601 with UTC offset). */
  var DEFAULT_ISO = '2026-02-27T19:00:00+01:00';

  /** localStorage key for the registered fragment code. */
  var LS_KEY = 'dbe_fragmentCode';

  /**
   * Known fragment codes → unique cryptic confirmation messages.
   * Unrecognised valid codes receive the generic fallback message.
   */
  var CODE_MAP = {
    'XZ7B4N': 'Das erste Zeichen ist gesetzt.',
    'KV3T9L': 'Die Tiefe hat dich erkannt.',
    'NW8Z2R': 'Du trägst das richtige Licht.',
    '4JT7VK': 'Das Muster schließt sich.',
  };

  /**
   * Shared detail line shown to all recognised codes after the personal confirmation.
   * ← Replace this string with the real venue / address / instruction before sending.
   */
  var SHARED_DETAIL = 'Trag ein blaues Detail — Hemd, Schmuck, Accessoire.';

  /** Valid code: 6–8 uppercase alphanumeric characters. */
  var FRAGMENT_RE = /^[A-Z0-9]{6,8}$/;


  var target = new Date(DEFAULT_ISO);


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Arrival Section — formatted date & time
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  (function renderArrival() {
    var dateEl = document.getElementById('arrival-date');
    var timeEl = document.getElementById('arrival-time');
    if (!dateEl && !timeEl) return;

    try {
      var TZ = 'Europe/Berlin';

      var dateFmt = new Intl.DateTimeFormat('de-DE', {
        weekday:  'long',
        day:      'numeric',
        month:    'long',
        year:     'numeric',
        timeZone: TZ,
      });

      var timeFmt = new Intl.DateTimeFormat('de-DE', {
        hour:     '2-digit',
        minute:   '2-digit',
        timeZone: TZ,
      });

      if (dateEl) dateEl.textContent = dateFmt.format(target);
      // \u202F = narrow no-break space before "Uhr"
      if (timeEl) timeEl.textContent = timeFmt.format(target) + '\u202FUhr';
    } catch (_) {
      if (dateEl) dateEl.textContent = '—';
      if (timeEl) timeEl.textContent = '—';
    }
  }());


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Countdown Timer
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  var elDays    = document.getElementById('cd-days');
  var elHours   = document.getElementById('cd-hours');
  var elMinutes = document.getElementById('cd-minutes');
  var elSeconds = document.getElementById('cd-seconds');
  var cdDisplay = document.getElementById('countdown-display');
  var cdSR      = document.getElementById('countdown-sr');

  /** Zero-pad a non-negative integer to at least 2 digits. */
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  /**
   * Replace the countdown UI with the event-started message and
   * trigger the intensified blue glow.
   */
  function triggerEventStart() {
    if (cdDisplay) {
      cdDisplay.innerHTML =
        '<p class="started-text" role="status" aria-live="assertive">' +
        'Es beginnt.' +
        '</p>';
    }
    document.body.classList.add('event-started');
  }

  // Throttle the screen-reader live announcement to once every ~30 s.
  var srCounter = 0;

  function tick() {
    var diffMs = target.getTime() - Date.now();

    if (diffMs <= 0) {
      clearInterval(tickInterval);
      triggerEventStart();
      return;
    }

    var totalSec = Math.floor(diffMs / 1000);
    var days     = Math.floor(totalSec / 86400);
    var hours    = Math.floor((totalSec % 86400) / 3600);
    var minutes  = Math.floor((totalSec % 3600) / 60);
    var seconds  = totalSec % 60;

    if (elDays)    elDays.textContent    = pad(days);
    if (elHours)   elHours.textContent   = pad(hours);
    if (elMinutes) elMinutes.textContent = pad(minutes);
    if (elSeconds) elSeconds.textContent = pad(seconds);

    // Update the polite screen-reader announcement roughly every 30 seconds
    srCounter++;
    if (cdSR && srCounter % 30 === 1) {
      cdSR.textContent =
        days + ' Tage, ' + hours + ' Stunden, ' +
        minutes + ' Minuten, ' + seconds + ' Sekunden verbleibend.';
    }
  }

  // First render immediately, then every second
  tick();
  var tickInterval = setInterval(tick, 1000);


  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Fragment Registration Modal
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  var modal      = document.getElementById('fragment-modal');
  var btnOpen    = document.getElementById('btn-register');
  var btnClose   = document.getElementById('btn-modal-close');
  var inputEl    = document.getElementById('fragment-input');
  var submitBtn  = document.getElementById('btn-fragment-submit');
  var feedbackEl = document.getElementById('modal-feedback');

  function openModal() {
    if (!modal || typeof modal.showModal !== 'function') return;

    // Pre-fill from localStorage if the visitor has already registered
    var saved = localStorage.getItem(LS_KEY);
    if (saved && inputEl) {
      inputEl.value = saved;
      setFeedback('Dieses Fragment wurde bereits hinterlegt.', false);
    } else {
      if (inputEl) inputEl.value = '';
      clearFeedback();
    }

    modal.showModal();

    // Defer focus to after the showModal paint
    if (inputEl) {
      requestAnimationFrame(function () { inputEl.focus(); });
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.close();
    // Return focus to the button that opened the modal
    if (btnOpen) btnOpen.focus();
  }

  function setFeedback(msg, isError, detail) {
    if (!feedbackEl) return;
    var html = '\u201E' + msg + '\u201C'; // „msg"
    if (detail) {
      html += '<span class="modal-detail">' + detail + '</span>';
    }
    feedbackEl.innerHTML = html;
    feedbackEl.className = 'modal-feedback' + (isError ? ' is-error' : '');
  }

  function clearFeedback() {
    if (!feedbackEl) return;
    feedbackEl.textContent = '';
    feedbackEl.className = 'modal-feedback';
  }

  function validateAndRegister() {
    if (!inputEl) return;

    var code = inputEl.value.trim().toUpperCase().replace(/\s/g, '');

    if (!FRAGMENT_RE.test(code)) {
      setFeedback('Unbekannte Kennung. Prüf das Fragment noch einmal.', true);
      inputEl.focus();
      return;
    }

    // Persist in localStorage (client-side only, no transmission)
    localStorage.setItem(LS_KEY, code);

    if (CODE_MAP.hasOwnProperty(code)) {
      setFeedback(CODE_MAP[code], false, SHARED_DETAIL);
    } else {
      setFeedback('Das Fragment ist unbekannt.', false);
    }
  }

  // Wire up events
  if (btnOpen)   btnOpen.addEventListener('click', openModal);
  if (btnClose)  btnClose.addEventListener('click', closeModal);
  if (submitBtn) submitBtn.addEventListener('click', validateAndRegister);

  if (inputEl) {
    // Auto-uppercase as the visitor types, preserving cursor position
    inputEl.addEventListener('input', function () {
      var pos = this.selectionStart;
      this.value = this.value.toUpperCase();
      this.setSelectionRange(pos, pos);
    });

    // Allow submitting with Enter
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        validateAndRegister();
      }
    });
  }

  // Close when clicking the translucent backdrop (the <dialog> element itself)
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  // ESC is handled natively by <dialog>; restore focus via the 'close' event
  if (modal) {
    modal.addEventListener('close', function () {
      if (btnOpen) btnOpen.focus();
    });
  }

}());
