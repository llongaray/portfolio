(function () {
  'use strict';

  var THEME_KEY = 'portfolio-theme';
  var html = document.documentElement;
  var reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Utilitário throttle =====
  function throttle(fn, delay) {
    var ultimo = 0;
    return function () {
      var agora = Date.now();
      if (agora - ultimo >= delay) {
        ultimo = agora;
        fn.apply(null, arguments);
      }
    };
  }

  // ===== Tema claro/escuro =====
  function aplicarTema(tema) {
    html.setAttribute('data-theme', tema);
    localStorage.setItem(THEME_KEY, tema);
  }

  function alternarTema() {
    var temaAtual = html.getAttribute('data-theme');
    aplicarTema(temaAtual === 'dark' ? 'light' : 'dark');
  }

  var temaSalvo = localStorage.getItem(THEME_KEY);
  if (temaSalvo) {
    aplicarTema(temaSalvo);
  }

  document.getElementById('theme-toggle').addEventListener('click', alternarTema);

  // ===== Ícones sociais (DRY) =====
  if (window.PortfolioSocial) {
    PortfolioSocial.renderHero(document.getElementById('hero-social'));
    PortfolioSocial.renderContato(document.getElementById('contact-social'));
  }

  // ===== Menu mobile + acessibilidade =====
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  function fecharMenu() {
    navToggle.classList.remove('active');
    navMenu.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function abrirMenu() {
    navMenu.classList.add('show');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  navToggle.addEventListener('click', function () {
    var aberto = navMenu.classList.toggle('show');
    navToggle.classList.toggle('active', aberto);
    navToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });

  navMenu.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', fecharMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('show')) {
      fecharMenu();
      navToggle.focus();
    }
  });

  // ===== Scroll-spy + header scrolled =====
  var secoes = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link');
  var header = document.getElementById('header');
  var backToTop = document.getElementById('back-to-top');

  function aoRolar() {
    var scrollY = window.scrollY;
    var offset = 120;

    header.classList.toggle('header--scrolled', scrollY > 50);

    if (backToTop) {
      backToTop.classList.toggle('back-to-top--visible', scrollY > 400);
    }

    var secaoAtiva = null;

    secoes.forEach(function (secao) {
      var topo = secao.offsetTop - offset;
      var fim = topo + secao.offsetHeight;
      if (scrollY >= topo && scrollY < fim) {
        secaoAtiva = secao.getAttribute('id');
      }
    });

    // Marca contato quando no final da página
    if (!secaoAtiva && scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80) {
      secaoAtiva = 'contato';
    }

    navLinks.forEach(function (link) {
      var ativo = link.getAttribute('href') === '#' + secaoAtiva;
      link.classList.toggle('active', ativo);
    });
  }

  window.addEventListener('scroll', throttle(aoRolar, 80));
  aoRolar();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduzirMovimento ? 'auto' : 'smooth' });
    });
  }

  // ===== Animação de entrada com classe CSS =====
  if (!reduzirMovimento) {
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('is-visible');
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
      observador.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ===== Parallax nos orbes (respeita reduced-motion) =====
  var hero = document.getElementById('inicio');
  var orbs = document.querySelectorAll('.hero__orb');

  if (hero && orbs.length && !reduzirMovimento) {
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      orbs.forEach(function (orb, i) {
        var fator = (i + 1) * 12;
        orb.style.transform = 'translate(' + (x * fator) + 'px, ' + (y * fator) + 'px)';
      });
    });

    hero.addEventListener('mouseleave', function () {
      orbs.forEach(function (orb) {
        orb.style.transform = '';
      });
    });
  }
})();
