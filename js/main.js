(function () {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Pestaña activa según la sección visible
  const tabs = $$('.tabs a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tabs.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    tabs.forEach((a) => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
  }

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const dot = $('#dot');
  const pills = $$('.pill');
  const loop = { a: -90 };
  const placeDot = () => {
    const r = loop.a * Math.PI / 180;
    dot.setAttribute('cx', (300 + 190 * Math.cos(r)).toFixed(2));
    dot.setAttribute('cy', (300 + 190 * Math.sin(r)).toFixed(2));
    const idx = ((Math.round((loop.a + 90) / 90) % 4) + 4) % 4;
    pills.forEach((p, i) => p.classList.toggle('on', i === idx));
  };

  const SMOOTH = 1.2; // segundos que tarda el scrub en alcanzar al scroll

  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 761px)' }, (ctx) => {
    const { motion, wide } = ctx.conditions;
    if (!motion) return;
    root.classList.add('motion');
    gsap.defaults({ ease: 'power3.out' });

    // Hero: la hoja cae, las cintas se pegan, las polaroids se acomodan
    gsap.from('.hero-card', { y: 36, rotate: -4, autoAlpha: 0, duration: 1.3, ease: 'expo.out' });
    gsap.from('.hero-card .tape', { scaleX: 0, autoAlpha: 0, duration: .8, delay: .55, stagger: .15, ease: 'power4.out' });
    gsap.from('.polas .pola-card', { y: 90, rotate: (i) => [-18, 14, -10][i], autoAlpha: 0, duration: 1.5, delay: .25, stagger: .16, ease: 'expo.out' });
    gsap.from('.edition', { y: 12, autoAlpha: 0, duration: 1, delay: .8 });
    gsap.to('.polas .pola', {
      yPercent: (i) => [-16, -30, -8][i], rotate: (i) => [-4, 4, -2][i], ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: SMOOTH }
    });

    // Aparición suave del resto de los bloques, solo los que todavía no están en pantalla
    const reveal = $$('.sec-head, .postit, .no-need, .kit > div, .miga-steps li, .miga-pola, .part, .cover, .buy-card')
      .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    gsap.set(reveal, { autoAlpha: 0, y: 34 });
    ScrollTrigger.batch(reveal, {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: .09, ease: 'power3.out', overwrite: true, clearProps: 'transform' })
    });

    // El mapa: los anillos se arman de adentro hacia afuera
    const rings = [0, 1, 2, 3, 4].map((i) => $(`.ring[data-i="${i}"]`));
    const caps = $$('.mapa-cap');
    const words = $$('.mapa-word');
    const bars = $$('.mapa-progress i');
    gsap.set(rings.slice(1), { autoAlpha: 0, scale: .8, svgOrigin: '300 300' });
    gsap.set(caps.slice(1), { autoAlpha: 0, y: 18 });
    gsap.set(words.slice(1), { autoAlpha: 0, scale: .94 });
    const mapTl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.mapa-stage', start: 'top top', end: '+=380%', scrub: SMOOTH, pin: true, anticipatePin: 1,
        onUpdate: (st) => {
          const k = Math.min(4, Math.floor(st.progress * 5 + .1));
          bars.forEach((b, i) => b.classList.toggle('on', i <= k));
        }
      }
    });
    mapTl.to({}, { duration: .6 });
    for (let i = 1; i < 5; i++) {
      const at = 's' + i;
      mapTl.addLabel(at)
        .to(caps[i - 1], { autoAlpha: 0, y: -18, duration: .7 }, at)
        .to(words[i - 1], { autoAlpha: 0, scale: 1.06, duration: .9 }, at)
        .to(rings[i], { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power3.out' }, at)
        .to(caps[i], { autoAlpha: 1, y: 0, duration: .9 }, at + '+=.45')
        .to(words[i], { autoAlpha: 1, scale: 1, duration: 1.1 }, at + '+=.3')
        .to({}, { duration: .7 });
    }

    // La Miga: la línea del recorrido se dibuja al bajar
    gsap.fromTo('.miga-line span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.miga-track', start: 'top 70%', end: 'bottom 60%', scrub: SMOOTH }
    });

    if (wide) {
      // El bucle: el punto da dos vueltas y el agente va anotando cada paso
      root.classList.add('motion-bucle');
      const items = $$('.log-item');
      const answer = $('.answer');
      gsap.set(items, { autoAlpha: 0, y: 10 });
      gsap.set(answer, { autoAlpha: 0, y: 14, scale: .97 });
      loop.a = -90; placeDot();
      const loopTl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: '.bucle-stage', start: 'top top', end: '+=360%', scrub: SMOOTH, pin: true, anticipatePin: 1 }
      });
      loopTl.to(items[0], { autoAlpha: 1, y: 0, duration: .6 });
      [0, 90, 180, 360, 450, 540].forEach((a, k) => {
        loopTl.to(loop, { a, duration: 1.2, ease: 'sine.inOut', onUpdate: placeDot })
          .to(items[k + 1], { autoAlpha: 1, y: 0, duration: .6 }, '-=.25');
      });
      loopTl.to(answer, { autoAlpha: 1, y: 0, scale: 1, duration: .8 }).to({}, { duration: .6 });

      // Las páginas se abren en abanico
      gsap.from('.sheet', {
        xPercent: (i) => [104, 0, -104][i], y: (i) => [40, 0, 40][i], ease: 'power1.out',
        scrollTrigger: { trigger: '.sheets', start: 'top 85%', end: 'top 30%', scrub: SMOOTH }
      });
    }

    return () => {
      root.classList.remove('motion', 'motion-bucle');
      loop.a = -90; placeDot();
      pills.forEach((p) => p.classList.remove('on'));
    };
  });

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
})();
