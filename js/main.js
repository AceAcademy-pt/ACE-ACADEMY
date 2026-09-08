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
     Footer year
  ----------------------------------------------------------- */
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
