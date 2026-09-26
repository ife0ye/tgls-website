(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ── Prefetch internal pages on hover / touch so navigation feels instant ──
  (function () {
    var prefetched = new Set();
    function maybePrefetch(e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a || !a.href || a.hostname !== location.hostname) return;
      if (!/\.html$/.test(a.pathname) || a.pathname === location.pathname) return;
      if (prefetched.has(a.href)) return;
      prefetched.add(a.href);
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = a.href;
      document.head.appendChild(link);
    }
    document.addEventListener('mouseover', maybePrefetch, { passive: true });
    document.addEventListener('touchstart', maybePrefetch, { passive: true });
  })();

  onReady(function () {
    var navbar = document.getElementById('navbar');
    var hero = document.getElementById('hero');

    // Start intro animations on the next frame so the initial state paints first
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('is-loaded'); });
    });

    // ── Headline line indices (for staggered line reveals) ──
    document.querySelectorAll('.hero-headline, .page-hero-headline').forEach(function (h) {
      h.querySelectorAll('.line > span').forEach(function (span, i) {
        span.style.setProperty('--i', i);
      });
    });

    // ── Mobile menu ──
    (function () {
      var button = document.getElementById('nav-hamburger');
      var overlay = document.getElementById('mobile-nav-overlay');
      if (!button || !overlay) return;

      overlay.querySelectorAll('.mobile-nav-links li').forEach(function (li, i) {
        li.style.setProperty('--i', i);
      });

      function setOpen(open) {
        overlay.classList.toggle('open', open);
        button.classList.toggle('open', open);
        document.body.classList.toggle('menu-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        overlay.setAttribute('aria-hidden', String(!open));
        if (open) {
          var first = overlay.querySelector('a');
          if (first) first.focus({ preventScroll: true });
        }
      }

      button.addEventListener('click', function () {
        setOpen(!overlay.classList.contains('open'));
      });
      overlay.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setOpen(false); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
          setOpen(false);
          button.focus();
        }
      });
      window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) {
        if (mq.matches) setOpen(false);
      });
    })();

    // ── Desktop dropdown: close on Escape ──
    document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
      dd.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.activeElement) document.activeElement.blur();
      });
    });

    // ── Desktop dropdown on touch (tablets/hybrids ≥960px): first tap opens, second tap follows the link ──
    document.querySelectorAll('.nav-dropdown-toggle').forEach(function (toggle) {
      var dd = toggle.closest('.nav-dropdown');
      var opened = false;
      toggle.addEventListener('click', function (e) {
        if (finePointer.matches || opened) return;
        e.preventDefault();
        opened = true;
        dd.classList.add('touch-open');
      });
      document.addEventListener('click', function (e) {
        if (opened && !dd.contains(e.target)) {
          opened = false;
          dd.classList.remove('touch-open');
        }
      });
    });

    // ── Marquees: the track slides by exactly half its width, so each half must
    // be at least as wide as the viewport or the loop exposes a blank gap on
    // wide screens. Clone as many sets as needed; scale duration so speed is constant.
    (function () {
      var tracks = [];
      document.querySelectorAll('.ticker-track, .logo-track').forEach(function (track) {
        tracks.push({
          el: track,
          originals: Array.prototype.slice.call(track.children),
          pxPerSec: track.classList.contains('logo-track') ? 28 : 40
        });
      });

      function fill(t) {
        var track = t.el;
        track.querySelectorAll('[data-clone]').forEach(function (n) { n.remove(); });
        var setWidth = track.scrollWidth;
        var viewWidth = track.parentElement.clientWidth;
        if (!setWidth || !viewWidth) return;
        var setsPerHalf = Math.max(1, Math.ceil(viewWidth / setWidth));
        var clonesNeeded = setsPerHalf * 2 - 1;
        for (var c = 0; c < clonesNeeded; c++) {
          t.originals.forEach(function (item) {
            var clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('data-clone', '');
            clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
            track.appendChild(clone);
          });
        }
        track.style.animationDuration = (setWidth * setsPerHalf / t.pxPerSec).toFixed(1) + 's';
        track.classList.add('is-ready');
      }

      tracks.forEach(fill);

      var resizeTimer;
      var lastWidth = window.innerWidth;
      window.addEventListener('resize', function () {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { tracks.forEach(fill); }, 200);
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { tracks.forEach(fill); });
      }
    })();

    // ── Scroll reveal with per-batch stagger ──
    (function () {
      var els = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) {
        els.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        var batch = entries
          .filter(function (e) { return e.isIntersecting; })
          .map(function (e) { return e.target; });
        batch.sort(function (a, b) {
          return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
        batch.forEach(function (el, i) {
          el.style.setProperty('--reveal-delay', Math.min(i, 6) * 70 + 'ms');
          el.classList.add('is-visible');
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      els.forEach(function (el) { io.observe(el); });
    })();

    // ── Hero stat count-up ──
    if (hero) {
      var stats = hero.querySelectorAll('.hero-stat strong');
      stats.forEach(function (el) {
        var match = el.textContent.match(/^(\d+)(.*)$/);
        if (!match || reduceMotion.matches) return;
        var target = parseInt(match[1], 10);
        var suffix = match[2];
        el.textContent = '0' + suffix;
        setTimeout(function () {
          var start = null;
          var duration = 1400;
          function step(t) {
            if (start === null) start = t;
            var p = Math.min((t - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 4);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }, 750);
      });
    }

    // ── Hero slideshow ──
    (function () {
      if (!hero) return;
      var INTERVAL = 6000;
      var slides = hero.querySelectorAll('.hero-slide');
      var dots = hero.querySelectorAll('.hero-dot');
      var prev = document.getElementById('hero-prev');
      var next = document.getElementById('hero-next');
      if (slides.length < 2) return;

      hero.style.setProperty('--slide-ms', INTERVAL + 'ms');
      var current = 0;
      var timer = null;
      var remaining = INTERVAL;
      var startedAt = 0;
      var hovering = false;
      var inView = true;

      function render() {
        slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
        dots.forEach(function (d, i) {
          d.classList.remove('active');
          d.classList.toggle('done', i < current);
          d.setAttribute('aria-current', i === current ? 'true' : 'false');
        });
        var dot = dots[current];
        if (dot) {
          void dot.offsetWidth; // restart the progress animation
          dot.classList.add('active');
        }
      }

      function schedule(ms) {
        clearTimeout(timer);
        remaining = ms;
        startedAt = performance.now();
        timer = setTimeout(function () { goTo(current + 1); }, ms);
      }

      function goTo(n) {
        current = (n + slides.length) % slides.length;
        render();
        if (isPaused()) { remaining = INTERVAL; clearTimeout(timer); }
        else schedule(INTERVAL);
      }

      function isPaused() { return hovering || !inView || document.hidden; }

      function updatePause() {
        var paused = isPaused();
        var wasPaused = hero.classList.contains('is-paused');
        hero.classList.toggle('is-paused', paused);
        if (paused && !wasPaused) {
          clearTimeout(timer);
          remaining = Math.max(0, remaining - (performance.now() - startedAt));
        } else if (!paused && wasPaused) {
          schedule(remaining);
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { goTo(i); });
      });
      if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
      if (next) next.addEventListener('click', function () { goTo(current + 1); });

      if (finePointer.matches) {
        var content = hero.querySelector('.hero-inner');
        content.addEventListener('mouseenter', function () { hovering = true; updatePause(); });
        content.addEventListener('mouseleave', function () { hovering = false; updatePause(); });
      }

      document.addEventListener('visibilitychange', updatePause);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          inView = entries[0].isIntersecting;
          updatePause();
        }, { threshold: 0.25 }).observe(hero);
      }

      // Arrow keys only while the hero is on screen and focus isn't in a field
      document.addEventListener('keydown', function (e) {
        if (!inView || e.altKey || e.metaKey || e.ctrlKey) return;
        var tag = document.activeElement && document.activeElement.tagName;
        if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
      });

      // Swipe on touch
      var sx = 0, sy = 0, tracking = false;
      hero.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch') return;
        tracking = true; sx = e.clientX; sy = e.clientY;
      });
      hero.addEventListener('pointerup', function (e) {
        if (!tracking) return;
        tracking = false;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1));
      });
      hero.addEventListener('pointercancel', function () { tracking = false; });

      // Preload the remaining slides once the page has settled
      window.addEventListener('load', function () {
        slides.forEach(function (s) {
          var m = /url\(["']?(.*?)["']?\)/.exec(s.style.backgroundImage);
          if (m) { var img = new Image(); img.src = m[1]; }
        });
      });

      render();
      schedule(INTERVAL);
    })();

    // ── Scroll-linked: nav state, parallax, process timeline, sticky CTA ──
    (function () {
      var parallax = document.querySelectorAll('.hero-slideshow, .page-hero-media');
      var sticky = document.querySelector('.sticky-mobile-cta');
      var footer = document.querySelector('footer');
      var processes = [];

      if (!sticky) document.body.classList.add('no-sticky');

      document.querySelectorAll('.process-steps').forEach(function (list) {
        var bar = document.createElement('span');
        bar.className = 'process-progress';
        bar.setAttribute('aria-hidden', 'true');
        list.prepend(bar);
        processes.push({ list: list, bar: bar, steps: list.querySelectorAll('.process-step') });
      });

      var ticking = false;
      function update() {
        ticking = false;
        var y = window.scrollY;
        var vh = window.innerHeight;

        if (navbar) navbar.classList.toggle('scrolled', y > 8);

        if (!reduceMotion.matches) {
          parallax.forEach(function (el) {
            var host = el.parentElement;
            var rect = host.getBoundingClientRect();
            if (rect.bottom < 0) return;
            el.style.transform = 'translate3d(0,' + (Math.max(0, -rect.top) * 0.22).toFixed(1) + 'px,0)';
          });
        }

        processes.forEach(function (p) {
          var rect = p.list.getBoundingClientRect();
          var anchor = vh * 0.6;
          var progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
          p.bar.style.transform = 'scaleY(' + progress.toFixed(4) + ')';
          p.steps.forEach(function (step) {
            var num = step.querySelector('.process-step-num');
            var r = (num || step).getBoundingClientRect();
            step.classList.toggle('is-active', r.top + r.height / 2 < anchor);
          });
        });

        if (sticky) {
          var footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
          var target = sticky.querySelector('a');
          var hash = target && target.getAttribute('href');
          var targetEl = hash && hash.charAt(0) === '#' ? document.querySelector(hash) : null;
          var atTarget = false;
          if (targetEl) {
            var tr = targetEl.getBoundingClientRect();
            atTarget = tr.top < vh && tr.bottom > 0;
          }
          sticky.classList.toggle('is-visible', y > vh * 0.5 && footerTop > vh && !atTarget);
        }
      }
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      update();
    })();

    // ── File inputs: show the chosen file name ──
    var MAX_FILE_BYTES = 5 * 1024 * 1024;
    document.querySelectorAll('input[type="file"]').forEach(function (input) {
      input.addEventListener('change', function () {
        var nameEl = document.getElementById(input.id + '-name');
        var has = input.files && input.files.length;
        if (has && input.files[0].size > MAX_FILE_BYTES) {
          input.setCustomValidity('Please choose a file under 5MB.');
          if (nameEl) nameEl.textContent = input.files[0].name + ' (too large, max 5MB)';
        } else {
          input.setCustomValidity('');
          if (nameEl) nameEl.textContent = has ? input.files[0].name : 'No file chosen';
        }
        var wrap = input.closest('.file-upload-wrapper');
        if (wrap) wrap.classList.toggle('has-file', !!has);
      });
    });

    // ── Form submission: send via Web3Forms so file uploads actually arrive ──
    // (a plain mailto: form silently drops attachments and often opens nothing on mobile)
    document.querySelectorAll('form[data-form-endpoint]').forEach(function (form) {
      var status = form.querySelector('.form-status');
      var submitBtn = form.querySelector('.btn-form-submit');

      function setStatus(kind, message) {
        if (!status) return;
        status.textContent = message;
        status.className = 'form-status is-visible ' + (kind === 'success' ? 'is-success' : 'is-error');
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;

        // Honeypot: a bot fills every field, including this hidden one; a human never sees it
        var honeypot = form.querySelector('.form-honeypot');
        if (honeypot && honeypot.value) return;

        var accessKey = form.querySelector('input[name="access_key"]');
        if (!accessKey || !accessKey.value || accessKey.value === 'YOUR_WEB3FORMS_ACCESS_KEY') {
          setStatus('error', 'This form is not connected yet. Please email your details directly using the address above.');
          return;
        }

        submitBtn.disabled = true;
        if (status) status.className = 'form-status';

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form)
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            submitBtn.disabled = false;
            if (data.success) {
              setStatus('success', 'Thank you, your submission has been received. Our team will be in touch shortly.');
              form.reset();
              form.querySelectorAll('.file-upload-wrapper').forEach(function (wrap) {
                wrap.classList.remove('has-file');
                var name = wrap.querySelector('.file-upload-name');
                if (name) name.textContent = 'No file chosen';
              });
            } else {
              setStatus('error', 'Something went wrong sending your submission. Please try again or email us directly.');
            }
          })
          .catch(function () {
            submitBtn.disabled = false;
            setStatus('error', 'Network error. Please check your connection and try again.');
          });
      });
    });
  });
})();
