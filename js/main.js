(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     Mobile navigation
  ----------------------------------------------------------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');

  function closeNav() {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }

  function openNav() {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    nav.addEventListener('click', function (e) {
      if (e.target.matches('.nav__link')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        toggle.focus();
      }
    });

    var mq = window.matchMedia('(min-width: 768px)');
    mq.addEventListener('change', function () { closeNav(); });
  }

  /* -----------------------------------------------------------
     Header shadow on scroll
  ----------------------------------------------------------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -----------------------------------------------------------
     Quote section reveal-on-scroll (single deliberate motion moment)
  ----------------------------------------------------------- */
  var quoteSection = document.querySelector('.quote');
  var quoteContent = document.querySelector('.quote__content');
  if (quoteSection && quoteContent && !reduceMotion && 'IntersectionObserver' in window) {
    quoteSection.setAttribute('data-observe', '');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          quoteContent.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    io.observe(quoteContent);
  }

  /* -----------------------------------------------------------
     Contact form - Web3Forms (https://web3forms.com), mailto fallback
     if the request fails. The access key below is meant to be used
     client-side (Web3Forms has no server for a static site to hide it
     behind) - it is not a secret, just kept out of the HTML markup so
     it isn't the first thing a scraper's page-source regex finds.
     Web3Forms rate-limits/filters abuse on their end, not via key
     secrecy. The destination inbox (info@aceacademy.pt) is configured
     on the Web3Forms dashboard for this key, not in this code.
  ----------------------------------------------------------- */
  var WEB3FORMS_ACCESS_KEY = '12c7c12e-9da0-43e8-b7db-553fca89e2b6';
  var WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    if (state) status.setAttribute('data-state', state);
    else status.removeAttribute('data-state');
  }

  function mailtoFallback(form, data) {
    var to = form.dataset.mailtoFallback || '';
    var name = data.get('name') || '';
    var email = data.get('email') || '';
    var phone = data.get('phone') || '';
    var message = data.get('message') || '';

    var subject = encodeURIComponent('Contacto via site - ' + name);
    var bodyLines = [
      'Nome: ' + name,
      'Email: ' + email,
      'Telefone: ' + (phone || '-'),
      '',
      message
    ];
    var body = encodeURIComponent(bodyLines.join('\n'));

    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    setStatus('Não foi possível enviar automaticamente. A abrir o teu cliente de email com a mensagem preenchida…');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      data.append('access_key', WEB3FORMS_ACCESS_KEY);
      data.append('subject', 'Novo contacto via site - ' + (data.get('name') || ''));

      setStatus('A enviar…');
      fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      })
        .then(function (response) { return response.json(); })
        .then(function (json) {
          if (json.success) {
            setStatus('Mensagem enviada. Obrigado - entraremos em contacto em breve.', 'success');
            form.reset();
          } else {
            mailtoFallback(form, data);
          }
        })
        .catch(function () {
          mailtoFallback(form, data);
        });
    });
  }

  /* -----------------------------------------------------------
     Testimonials carousel
  ----------------------------------------------------------- */
  var testimonialsTrack = document.getElementById('testimonials-track');
  if (testimonialsTrack) {
    var slides = Array.prototype.slice.call(testimonialsTrack.children);
    var prevBtn = document.querySelector('.testimonials__arrow--prev');
    var nextBtn = document.querySelector('.testimonials__arrow--next');
    var dotsWrap = document.getElementById('testimonials-dots');
    var desktopMq = window.matchMedia('(min-width: 700px)');
    var tIndex = 0;

    var perView = function () { return desktopMq.matches ? 2 : 1; };
    var maxIndex = function () { return Math.max(0, slides.length - perView()); };

    var buildDots = function () {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var pages = maxIndex() + 1;
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'testimonials__dot';
        dot.setAttribute('aria-label', 'Ir para avalia\u00e7\u00e3o ' + (i + 1));
        dot.addEventListener('click', (function (page) {
          return function () { goTo(page); };
        })(i));
        dotsWrap.appendChild(dot);
      }
    };

    var update = function () {
      var target = slides[tIndex];
      var base = slides[0];
      var offset = (target && base)
        ? (target.getBoundingClientRect().left - base.getBoundingClientRect().left)
        : 0;
      testimonialsTrack.style.transform = 'translateX(-' + offset + 'px)';
      if (prevBtn) prevBtn.disabled = tIndex <= 0;
      if (nextBtn) nextBtn.disabled = tIndex >= maxIndex();
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
          dot.classList.toggle('is-active', i === tIndex);
        });
      }
    };

    var goTo = function (i) {
      tIndex = Math.min(Math.max(i, 0), maxIndex());
      update();
    };

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(tIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(tIndex + 1); });

    buildDots();
    update();

    desktopMq.addEventListener('change', function () {
      tIndex = Math.min(tIndex, maxIndex());
      buildDots();
      update();
    });

    window.addEventListener('resize', function () {
      tIndex = Math.min(tIndex, maxIndex());
      buildDots();
      update();
    });
  }

  /* -----------------------------------------------------------
     Footer year
  ----------------------------------------------------------- */
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
