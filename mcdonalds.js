(() => {
  const M = window.McD || {};

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  const lock = (v) => {
    document.body.classList.toggle('is-locked', v);
  };

  const escapeHTML = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m])
    );

  const money = (cents) => {
    const value = Number(cents || 0) / 100;

    try {
      return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: M.currencyCode || 'PKR',
        maximumFractionDigits: 2
      }).format(value);
    } catch {
      return `Rs. ${value.toFixed(2)}`;
    }
  };

  const json = async (url, options = {}) => {
    const r = await fetch(url, options);

    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }

    return r.json();
  };


  /* ============================================================
     HEADER
     ============================================================ */

  function initHeader() {
    const header = qs('[data-header]');

    if (!header) return;

    const onScroll = () => {
      const y = window.scrollY;

      header.classList.toggle(
        'is-scrolled',
        y > 12
      );

      /* Header stays visible while scrolling */
      header.classList.remove('is-hidden');
    };

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );

    onScroll();


    /* ----------------------------------------------------------
       DESKTOP NAV / COMPACT MEGA MENU
       ---------------------------------------------------------- */

    const mega = qs('[data-nav-mega]');
    const triggers = qsa('[data-nav-trigger]');
    const panels = qsa('[data-nav-panel]');

    let hoverTimer;


    const activate = (button) => {
      const key = button.dataset.navTrigger;

      const panel = mega
        ? qs(`[data-nav-panel="${key}"]`, mega)
        : null;

      if (!panel) return;

      panels.forEach((p) => {
        p.classList.toggle(
          'is-active',
          p === panel
        );
      });

      triggers.forEach((x) => {
        x.setAttribute(
          'aria-expanded',
          String(x === button)
        );
      });

      mega?.setAttribute(
        'aria-hidden',
        'false'
      );
    };


    const closeMega = () => {
      clearTimeout(hoverTimer);

      mega?.setAttribute(
        'aria-hidden',
        'true'
      );

      triggers.forEach((b) => {
        b.setAttribute(
          'aria-expanded',
          'false'
        );
      });

      panels.forEach((p) => {
        p.classList.remove('is-active');
      });
    };


    triggers.forEach((b) => {

      /* Click */
      b.addEventListener('click', () => {
        const isOpen =
          mega?.getAttribute('aria-hidden') === 'false' &&
          b.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
          closeMega();
        } else {
          activate(b);
        }
      });


      /* Hover */
      b.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);

        hoverTimer = setTimeout(() => {
          activate(b);
        }, 50);
      });


      /* Keyboard focus */
      b.addEventListener('focus', () => {
        activate(b);
      });

    });


    mega?.addEventListener(
      'mouseenter',
      () => clearTimeout(hoverTimer)
    );


    mega?.addEventListener(
      'mouseleave',
      () => {
        clearTimeout(hoverTimer);

        hoverTimer = setTimeout(
          closeMega,
          160
        );
      }
    );


    document.addEventListener(
      'click',
      (e) => {

        if (
          mega?.getAttribute('aria-hidden') === 'false' &&
          !e.target.closest('[data-nav-mega]') &&
          !e.target.closest('[data-nav-trigger]')
        ) {
          closeMega();
        }

      }
    );


    /* ----------------------------------------------------------
       MOBILE DRAWER
       ---------------------------------------------------------- */

    const drawer = qs('[data-nav-drawer]');
    const menuOpen = qs('[data-menu-open]');

    const setDrawer = (v) => {
      drawer?.setAttribute(
        'aria-hidden',
        String(!v)
      );

      lock(v);
    };


    menuOpen?.addEventListener(
      'click',
      () => setDrawer(true)
    );


    qsa('[data-menu-close]').forEach(
      (b) =>
        b.addEventListener(
          'click',
          () => setDrawer(false)
        )
    );


    /* ----------------------------------------------------------
       SEARCH DRAWER
       ---------------------------------------------------------- */

    const search = qs('[data-search-drawer]');
    const sopen = qs('[data-search-open]');

    const closeSearch = () => {
      search?.setAttribute(
        'aria-hidden',
        'true'
      );

      lock(false);
    };


    sopen?.addEventListener(
      'click',
      () => {
        search?.setAttribute(
          'aria-hidden',
          'false'
        );

        lock(true);

        qs('[data-search-input]')?.focus();

        closeMega();
      }
    );


    qsa('[data-search-close]').forEach(
      (b) =>
        b.addEventListener(
          'click',
          closeSearch
        )
    );


    /* ----------------------------------------------------------
       ESCAPE KEY
       ---------------------------------------------------------- */

    document.addEventListener(
      'keydown',
      (e) => {

        if (e.key === 'Escape') {
          closeMega();
          setDrawer(false);
          closeCart();
          closeSearch();
        }

      }
    );
  }


  /* ============================================================
     YELLOW TOP SCROLL PROGRESS
     ============================================================ */

  function initScrollProgress() {
    const progress = qs(
      '[data-site-progress]'
    );

    if (!progress) return;


    const update = () => {
      const documentHeight =
        document.documentElement.scrollHeight;

      const viewportHeight =
        window.innerHeight;

      const maxScroll =
        documentHeight - viewportHeight;

      const progressValue =
        maxScroll > 0
          ? Math.min(
              1,
              Math.max(
                0,
                window.scrollY / maxScroll
              )
            )
          : 0;


      progress.style.transform =
        `scaleX(${progressValue})`;
    };


    window.addEventListener(
      'scroll',
      update,
      { passive: true }
    );


    window.addEventListener(
      'resize',
      update,
      { passive: true }
    );


    update();
  }


  /* ============================================================
     REVEAL + PARALLAX
     ============================================================ */

  function initReveal() {

    const els = qsa(
      [
        '[data-reveal]',
        '.product-card',
        '.restaurant-card',
        '.deal-card',
        '.community-card',
        '.menu-product'
      ].join(',')
    );


    const obs =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {

                if (entry.isIntersecting) {
                  entry.target.classList.add(
                    'is-visible'
                  );
                }

              });
            },
            {
              threshold: 0.04,
              rootMargin: '0px 0px -6% 0px'
            }
          )
        : null;


    els.forEach((el, i) => {

      el.setAttribute(
        'data-reveal',
        ''
      );

      el.classList.add(
        'reveal-ready'
      );

      el.style.setProperty(
        '--i',
        i % 12
      );


      if (obs) {
        obs.observe(el);
      } else {
        el.classList.add(
          'is-visible'
        );
      }

    });


    /* ----------------------------------------------------------
       PARALLAX
       ---------------------------------------------------------- */

    qsa('[data-parallax]').forEach(
      (el) => {

        const depth =
          Number(
            el.dataset.parallax || 0.1
          );


        const tick = () => {
          const r =
            el.getBoundingClientRect();


          if (
            r.bottom > 0 &&
            r.top < window.innerHeight
          ) {

            const offset =
              (r.top -
                window.innerHeight / 2) *
              depth *
              -1;


            el.style.transform =
              `translate3d(0,${offset}px,0)`;
          }
        };


        window.addEventListener(
          'scroll',
          tick,
          { passive: true }
        );


        window.addEventListener(
          'resize',
          tick,
          { passive: true }
        );


        tick();
      }
    );
  }


  /* ============================================================
     MENU TABS
     ============================================================ */

  function initMenuTabs() {

    const buttons =
      qsa('[data-menu-tab]');

    const productGrid =
      qs('[data-menu-products]');

    const emptyState =
      qs('[data-menu-empty]');


    const getKey = () => {

      const query =
        new URLSearchParams(
          location.search
        ).get('menu');


      if (query) {
        return query;
      }


      if (
        location.hash.startsWith(
          '#menu-'
        )
      ) {
        return location.hash.slice(6);
      }


      return 'all';
    };


    if (
      productGrid &&
      buttons.length
    ) {

      const aliases = {

        'chicken-fish': [
          'chicken-fish'
        ],

        'crispy-chicken': [
          'crispy-chicken'
        ],

        'happy-meals': [
          'happy-meals',
          'happy-meal'
        ],

        'extra-value-meals': [
          'extra-value-meals',
          'extra-value-meal'
        ],

        'value-meals': [
          'value-meals',
          'value-meal'
        ],

        'fries-sides': [
          'fries-sides',
          'fries',
          'sides'
        ],

        'mccafe': [
          'mccafe',
          'mc-cafe'
        ],

        'condiments': [
          'condiments'
        ]

      };


      const cards =
        qsa(
          '[data-menu-product]',
          productGrid
        );


      const matches = (
        card,
        key
      ) => {

        if (key === 'all') {
          return true;
        }


        const tags =
          (
            card.dataset.menuTags ||
            ''
          )
            .split('|')
            .map(
              (v) => v.trim().toLowerCase()
            )
            .filter(Boolean);


        const type =
          (
            card.dataset.menuType ||
            ''
          )
            .trim()
            .toLowerCase();


        const hay =
          new Set([
            ...tags,
            type
          ]);


        const terms =
          aliases[key] || [
            key
          ];


        return terms.some(
          (t) =>
            hay.has(
              String(t).toLowerCase()
            )
        );
      };


      const apply = (key) => {

        let visible = 0;


        cards.forEach(
          (card) => {

            const show =
              matches(
                card,
                key
              );


            card.classList.toggle(
              'is-hidden',
              !show
            );


            card.classList.toggle(
              'is-visible',
              show
            );


            if (show) {

              card.style.setProperty(
                '--i',
                visible % 12
              );

              visible += 1;

            }

          }
        );


        buttons.forEach(
          (b) => {
            b.classList.toggle(
              'is-active',
              b.dataset.menuTab === key
            );
          }
        );


        const active =
          buttons.find(
            (b) =>
              b.dataset.menuTab === key
          );


        const note =
          qs(
            '[data-menu-filter-note]'
          );


        if (note) {
          note.textContent =
            `${visible} ITEMS · ${
              (
                active?.textContent ||
                'ALL MENU'
              ).toUpperCase()
            }`;
        }


        if (emptyState) {
          emptyState.hidden =
            visible !== 0;
        }


        return visible;
      };


      const jump = (key) => {

        const visible =
          apply(key);


        const menu =
          qs('#menu');


        /*
          If the selected category doesn't exist
          in the current rendered products, fall
          back to Shopify's native filtered route.
        */

        if (
          key !== 'all' &&
          visible === 0
        ) {

          const targetButton =
            buttons.find(
              (b) =>
                b.dataset.menuTab === key
            );


          const target =
            targetButton?.dataset
              .menuCategoryUrl;


          if (target) {
            location.href = target;
            return;
          }
        }


        if (menu) {
          menu.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      };


      /* ----------------------------------------------------------
         TAB BUTTONS
         ---------------------------------------------------------- */

      buttons.forEach(
        (b) => {

          b.addEventListener(
            'click',
            () => {

              const key =
                b.dataset.menuTab;


              const url =
                new URL(
                  location.href
                );


              url.searchParams.set(
                'menu',
                key
              );


              if (
                history.replaceState
              ) {
                history.replaceState(
                  null,
                  '',
                  url.pathname +
                    url.search +
                    '#menu'
                );
              }


              jump(key);
            }
          );
        }
      );


      /* ----------------------------------------------------------
         HEADER MENU CATEGORY LINKS
         ---------------------------------------------------------- */

      qsa(
        '[data-menu-jump]'
      ).forEach(
        (a) => {

          a.addEventListener(
            'click',
            (e) => {

              const key =
                a.dataset.menuJump;


              if (!key) return;


              const url =
                new URL(
                  a.href,
                  location.href
                );


              const sameHome =
                url.pathname ===
                location.pathname;


              if (sameHome) {

                e.preventDefault();


                if (
                  history.pushState
                ) {

                  history.pushState(
                    null,
                    '',
                    url.pathname +
                      url.search +
                      '#menu'
                  );
                }


                jump(key);


                qs(
                  '[data-nav-mega]'
                )?.setAttribute(
                  'aria-hidden',
                  'true'
                );


                qs(
                  '[data-nav-drawer]'
                )?.setAttribute(
                  'aria-hidden',
                  'true'
                );


                lock(false);
              }

            }
          );
        }
      );


      /* ----------------------------------------------------------
         SHOW ALL
         ---------------------------------------------------------- */

      qs(
        '[data-menu-show-all]'
      )?.addEventListener(
        'click',
        () => {

          const url =
            new URL(
              location.href
            );


          url.searchParams.set(
            'menu',
            'all'
          );


          if (
            history.replaceState
          ) {

            history.replaceState(
              null,
              '',
              url.pathname +
                url.search +
                '#menu'
            );
          }


          jump('all');
        }
      );


      apply(
        getKey()
      );


      return;
    }


    /* ----------------------------------------------------------
       FALLBACK MENU LINKS
       ---------------------------------------------------------- */

    qsa(
      '[data-menu-jump]'
    ).forEach(
      (a) => {

        a.addEventListener(
          'click',
          () => {

            qs(
              '[data-nav-mega]'
            )?.setAttribute(
              'aria-hidden',
              'true'
            );


            qs(
              '[data-nav-drawer]'
            )?.setAttribute(
              'aria-hidden',
              'true'
            );


            lock(false);
          }
        );
      }
    );
  }


  /* ============================================================
     COUNTERS
     ============================================================ */

  function initCounters() {

    const counters =
      qsa('[data-counter]');


    if (!counters.length) {
      return;
    }


    const animate = (el) => {

      if (
        el.dataset.counted === 'true'
      ) {
        return;
      }


      el.dataset.counted =
        'true';


      const target =
        Number(
          el.dataset.target ||
          el.closest(
            '[data-count]'
          )?.dataset.count ||
          0
        );


      const start =
        performance.now();


      const duration =
        950;


      const step = (t) => {

        const p =
          Math.min(
            1,
            (t - start) /
              duration
          );


        const eased =
          1 -
          Math.pow(
            1 - p,
            3
          );


        el.textContent =
          Math.round(
            target * eased
          );


        if (p < 1) {
          requestAnimationFrame(
            step
          );
        } else {
          el.textContent =
            String(
              target
            ).padStart(
              target > 9
                ? 2
                : 1,
              '0'
            );
        }
      };


      requestAnimationFrame(
        step
      );
    };


    if (
      'IntersectionObserver' in window
    ) {

      const obs =
        new IntersectionObserver(
          (entries) => {

            entries.forEach(
              (entry) => {

                if (
                  entry.isIntersecting
                ) {

                  animate(
                    entry.target
                  );


                  obs.unobserve(
                    entry.target
                  );
                }

              }
            );

          },
          {
            threshold: 0.55
          }
        );


      counters.forEach(
        (c) => obs.observe(c)
      );

    } else {

      counters.forEach(
        animate
      );
    }
  }


  /* ============================================================
     RESTAURANTS
     ============================================================ */

  function initRestaurants() {

    const cards =
      qsa(
        '[data-restaurant-grid] .restaurant-card'
      );


    const filterButtons =
      qsa(
        '.restaurant-filters [data-city]'
      );


    const input =
      qs(
        '[data-location-search]'
      );


    const apply = (
      city = 'all',
      query = ''
    ) => {

      const q =
        query
          .trim()
          .toLowerCase();


      cards.forEach(
        (c) => {

          const cityMatch =
            city === 'all' ||
            c.dataset.city === city;


          const textMatch =
            !q ||
            `${c.dataset.name || ''} ${
              c.textContent
            }`
              .toLowerCase()
              .includes(q);


          c.style.display =
            cityMatch &&
            textMatch
              ? 'flex'
              : 'none';
        }
      );
    };


    filterButtons.forEach(
      (b) => {

        b.addEventListener(
          'click',
          () => {

            filterButtons.forEach(
              (x) =>
                x.classList.toggle(
                  'is-active',
                  x === b
                )
            );


            apply(
              b.dataset.city,
              input?.value || ''
            );
          }
        );
      }
    );


    input?.addEventListener(
      'input',
      () => {

        const active =
          filterButtons.find(
            (b) =>
              b.classList.contains(
                'is-active'
              )
          )?.dataset.city ||
          'all';


        apply(
          active,
          input.value
        );
      }
    );


    qs(
      '[data-location-open]'
    )?.addEventListener(
      'click',
      () => {

        if (
          !navigator.geolocation
        ) {

          alert(
            'Location is unavailable in this browser.'
          );

          return;
        }


        navigator.geolocation.getCurrentPosition(

          () => {

            alert(
              'Location access received. Connect this action to your preferred maps provider for live routing.'
            );
          },

          () => {

            alert(
              'Location access was not available. Search by city instead.'
            );
          }

        );
      }
    );
  }


  /* ============================================================
     CART
     ============================================================ */

  let cartBusy = false;


  async function refreshCart() {

    try {

      const cart =
        await json(
          `${M.routes.cart}.js`
        );


      qsa(
        '[data-cart-count]'
      ).forEach(
        (el) =>
          el.textContent =
            cart.item_count
      );


      const subtotal =
        qs(
          '[data-cart-subtotal]'
        );


      if (subtotal) {
        subtotal.textContent =
          money(
            cart.total_price
          );
      }


      const lines =
        qs(
          '[data-cart-lines]'
        );


      if (!lines) {
        return;
      }


      if (!cart.items.length) {

        lines.innerHTML =
          `
          <div class="empty-state">
            <span class="kicker">
              YOUR ORDER
            </span>

            <h3>
              NOTHING HERE YET.
            </h3>

            <a
              href="${M.routes.root}#menu"
              class="text-arrow"
            >
              BROWSE MENU ↗
            </a>
          </div>
          `;


        return;
      }


      lines.innerHTML =
        cart.items
          .map(
            (item, i) => {

              return `
                <div class="cart-line">

                  <a href="${item.url}">
                    <img
                      src="${item.image || ''}"
                      alt="${escapeHTML(
                        item.product_title
                      )}"
                      loading="lazy"
                    >
                  </a>

                  <div>

                    <a
                      class="cart-line__title"
                      href="${item.url}"
                    >
                      ${escapeHTML(
                        item.product_title
                      )}
                    </a>

                    <div class="cart-line__variant">
                      ${escapeHTML(
                        item.variant_title || ''
                      )}
                    </div>

                    <div class="cart-line__controls">

                      <button
                        class="qty-btn"
                        data-cart-qty
                        data-line="${i + 1}"
                        data-quantity="${
                          item.quantity - 1
                        }"
                      >
                        −
                      </button>

                      <span>
                        ${item.quantity}
                      </span>

                      <button
                        class="qty-btn"
                        data-cart-qty
                        data-line="${i + 1}"
                        data-quantity="${
                          item.quantity + 1
                        }"
                      >
                        +
                      </button>

                      <button
                        class="text-arrow"
                        data-cart-remove
                        data-line="${i + 1}"
                      >
                        REMOVE
                      </button>

                    </div>

                  </div>

                  <strong class="cart-line__price">
                    ${money(
                      item.final_line_price
                    )}
                  </strong>

                </div>
              `;
            }
          )
          .join('');


      const progress =
        qs(
          '[data-shipping-bar]'
        );


      if (progress) {

        progress.style.width =
          `${Math.min(
            100,
            (
              cart.total_price /
              500000
            ) * 100
          )}%`;
      }


      const copy =
        qs(
          '[data-shipping-copy]'
        );


      if (copy) {

        copy.textContent =
          cart.total_price >=
          500000

            ? 'ORDER READY TO GO'

            : 'KEEP EXPLORING THE MENU';
      }


    } catch (e) {

      console.error(
        'Cart refresh error:',
        e
      );
    }
  }


  function openCart() {

    qs(
      '[data-cart-drawer]'
    )?.setAttribute(
      'aria-hidden',
      'false'
    );


    lock(true);


    refreshCart();
  }


  function closeCart() {

    qs(
      '[data-cart-drawer]'
    )?.setAttribute(
      'aria-hidden',
      'true'
    );


    lock(false);
  }


  async function addToCart(
    id,
    quantity = 1
  ) {

    if (
      !id ||
      cartBusy
    ) {
      return;
    }


    cartBusy = true;


    try {

      await json(
        `${M.routes.cartAdd}.js`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            'Accept':
              'application/json'
          },

          body:
            JSON.stringify({
              items: [
                {
                  id: Number(id),
                  quantity:
                    Number(quantity)
                }
              ]
            })
        }
      );


      openCart();


    } catch (e) {

      console.error(
        e
      );


      alert(
        'This item could not be added to the cart.'
      );


    } finally {

      cartBusy = false;
    }
  }


  async function changeLine(
    line,
    quantity
  ) {

    try {

      await json(
        `${M.routes.cartChange}.js`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            'Accept':
              'application/json'
          },

          body:
            JSON.stringify({
              line:
                Number(line),

              quantity:
                Math.max(
                  0,
                  Number(quantity)
                )
            })
        }
      );


      if (
        document.body.classList.contains(
          'template-cart'
        )
      ) {

        location.reload();

      } else {

        refreshCart();
      }


    } catch (e) {

      console.error(
        e
      );
    }
  }


  function initCart() {

    qsa(
      '[data-cart-open]'
    ).forEach(
      (b) =>
        b.addEventListener(
          'click',
          openCart
        )
    );


    qsa(
      '[data-cart-close]'
    ).forEach(
      (b) =>
        b.addEventListener(
          'click',
          closeCart
        )
    );


    document.addEventListener(
      'click',
      (e) => {

        const add =
          e.target.closest(
            '[data-quick-add]'
          );


        if (add) {

          e.preventDefault();

          addToCart(
            add.dataset.quickAdd
          );

          return;
        }


        const q =
          e.target.closest(
            '[data-cart-qty]'
          );


        if (q) {

          e.preventDefault();

          changeLine(
            q.dataset.line,
            q.dataset.quantity
          );

          return;
        }


        const r =
          e.target.closest(
            '[data-cart-remove]'
          );


        if (r) {

          e.preventDefault();

          changeLine(
            r.dataset.line,
            0
          );
        }
      }
    );
  }


  /* ============================================================
     PRODUCT PAGE
     ============================================================ */

  function initProduct() {

    const form =
      qs('#product-form');


    if (!form) {
      return;
    }


    let variants = [];


    try {

      const raw =
        form.querySelector(
          '[data-variants-json]'
        );


      variants =
        raw
          ? JSON.parse(
              raw.textContent || '[]'
            )
          : [];


    } catch (e) {

      console.error(
        'Variant JSON error',
        e
      );
    }


    const idInput =
      qs(
        '[data-product-variant]',
        form
      );


    const price =
      qs(
        '[data-product-price]',
        form.parentElement
      );


    const qty =
      qs(
        '[data-product-quantity]'
      );


    qsa(
      '[data-product-qty]',
      form
    ).forEach(
      (b) => {

        b.addEventListener(
          'click',
          () => {

            qty.value =
              Math.max(
                1,
                Number(
                  qty.value || 1
                ) +
                  Number(
                    b.dataset.productQty ||
                    0
                  )
              );
          }
        );
      }
    );


    const sync = () => {

      const selected = [];


      qsa(
        '.variant-fieldset'
      ).forEach(
        (fs, i) => {

          selected[i] =
            qs(
              'input[type=radio]:checked',
              fs
            )?.value;
        }
      );


      const match =
        variants.find(
          (v) =>
            v.options.every(
              (x, i) =>
                x === selected[i]
            )
        );


      if (!match) {
        return;
      }


      idInput.value =
        match.id;


      if (price) {
        price.textContent =
          money(
            match.price
          );
      }


      const btn =
        qs(
          '[name="add"]',
          form
        );


      if (btn) {

        btn.disabled =
          !match.available;


        btn.textContent =
          match.available
            ? 'ADD TO ORDER'
            : 'SOLD OUT';
      }
    };


    qsa(
      '.variant-fieldset input'
    ).forEach(
      (r) =>
        r.addEventListener(
          'change',
          sync
        )
    );


    form.addEventListener(
      'submit',
      (e) => {

        e.preventDefault();


        addToCart(
          idInput.value,
          Math.max(
            1,
            Number(
              qty.value || 1
            )
          )
        );
      }
    );


    qsa(
      '[data-gallery-thumb]'
    ).forEach(
      (b) => {

        b.addEventListener(
          'click',
          () => {

            qsa(
              '[data-gallery-image]'
            ).forEach(
              (x) =>
                x.classList.remove(
                  'is-active'
                )
            );


            qs(
              `[data-gallery-image="${b.dataset.galleryThumb}"]`
            )?.classList.add(
              'is-active'
            );


            qsa(
              '[data-gallery-thumb]'
            ).forEach(
              (x) =>
                x.classList.remove(
                  'is-active'
                )
            );


            b.classList.add(
              'is-active'
            );
          }
        );
      }
    );


    sync();
  }


  /* ============================================================
     COLLECTION
     ============================================================ */

  function initCollection() {

    const drawer =
      qs(
        '[data-filter-drawer]'
      );


    const open =
      qs(
        '[data-filter-open]'
      );


    const closeFilters = () => {

      drawer?.setAttribute(
        'aria-hidden',
        'true'
      );


      lock(false);
    };


    open?.addEventListener(
      'click',
      () => {

        drawer?.setAttribute(
          'aria-hidden',
          'false'
        );


        lock(true);
      }
    );


    qsa(
      '[data-filter-close]'
    ).forEach(
      (b) =>
        b.addEventListener(
          'click',
          closeFilters
        )
    );


    qsa(
      '[data-sort-select]'
    ).forEach(
      (s) =>
        s.addEventListener(
          'change',
          () => s.form?.submit()
        )
    );
  }


  /* ============================================================
     SEARCH
     ============================================================ */

  function initSearch() {

    const input =
      qs(
        '[data-search-input]'
      );


    const results =
      qs(
        '[data-search-results]'
      );


    let timer;


    input?.addEventListener(
      'input',
      () => {

        clearTimeout(timer);


        const q =
          input.value.trim();


        if (q.length < 2) {

          if (results) {
            results.innerHTML = '';
          }

          return;
        }


        timer =
          setTimeout(
            async () => {

              try {

                const data =
                  await json(
                    `/search/suggest.json?q=${
                      encodeURIComponent(q)
                    }&resources[type]=product&resources[limit]=6`
                  );


                const items =
                  data.resources
                    ?.results
                    ?.products ||
                  [];


                if (!results) {
                  return;
                }


                results.innerHTML =
                  items
                    .map(
                      (p) => `

                        <a
                          class="search-result"
                          href="${p.url}"
                        >

                          <img
                            src="${p.image || ''}"
                            alt=""
                            loading="lazy"
                          >

                          <div>

                            <b>
                              ${escapeHTML(
                                p.title
                              )}
                            </b>

                            <span>
                              ${money(
                                p.price
                              )}
                            </span>

                          </div>

                        </a>

                      `
                    )
                    .join('') ||

                  '<p class="filter-empty">No direct matches.</p>';


              } catch (e) {

                console.error(
                  'Search error:',
                  e
                );
              }

            },
            220
          );
      }
    );


    qsa(
      '[data-search-term]'
    ).forEach(
      (b) => {

        b.addEventListener(
          'click',
          () => {

            if (input) {

              input.value =
                b.dataset.searchTerm;


              input.dispatchEvent(
                new Event(
                  'input'
                )
              );


              input.focus();
            }
          }
        );
      }
    );
  }


  /* ============================================================
     BACK TO TOP
     ============================================================ */

  function initBackToTop() {

    const btns =
      qsa(
        '[data-back-to-top]'
      );


    if (!btns.length) {
      return;
    }


    const update = () => {

      btns.forEach(
        (b) => {

          b.classList.toggle(
            'is-visible',
            window.scrollY > 520
          );
        }
      );
    };


    window.addEventListener(
      'scroll',
      update,
      { passive: true }
    );


    update();


    btns.forEach(
      (b) => {

        b.addEventListener(
          'click',
          () => {

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        );
      }
    );
  }


  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */

  function initCursor() {

    const c =
      qs(
        '[data-cursor]'
      );


    if (
      !c ||
      matchMedia(
        '(pointer: coarse)'
      ).matches
    ) {
      return;
    }


    document.body.classList.add(
      'has-custom-cursor'
    );


    c.style.opacity =
      '1';


    let x =
      window.innerWidth / 2;


    let y =
      window.innerHeight / 2;


    let tx = x;
    let ty = y;

    let raf = 0;


    /*
      Faster tracking than the old version.
      0.72 = faster response,
      while still keeping slight smoothness.
    */

    const render = () => {

      x +=
        (tx - x) *
        0.72;


      y +=
        (ty - y) *
        0.72;


      let scale = '1';


      if (
        c.classList.contains(
          'is-hover'
        )
      ) {

        scale = '1.34';

      } else if (
        c.classList.contains(
          'is-down'
        )
      ) {

        scale = '.88';
      }


      c.style.transform =
        `translate3d(${x}px,${y}px,0) ` +
        `translate(-50%,-50%) ` +
        `scale(${scale})`;


      if (
        Math.abs(tx - x) > 0.1 ||
        Math.abs(ty - y) > 0.1
      ) {

        raf =
          requestAnimationFrame(
            render
          );

      } else {

        raf = 0;
      }
    };


    const move = (e) => {

      tx =
        e.clientX;


      ty =
        e.clientY;


      if (!raf) {

        raf =
          requestAnimationFrame(
            render
          );
      }
    };


    document.addEventListener(
      'mousemove',
      move,
      { passive: true }
    );


    document.addEventListener(
      'mousedown',
      () =>
        c.classList.add(
          'is-down'
        )
    );


    document.addEventListener(
      'mouseup',
      () =>
        c.classList.remove(
          'is-down'
        )
    );


    qsa(
      [
        'a',
        'button',
        '.product-card',
        '.restaurant-card',
        '.deal-card',
        '.community-card',
        'select',
        'input',
        '[data-menu-tab]'
      ].join(',')
    ).forEach(
      (el) => {

        el.addEventListener(
          'mouseenter',
          () =>
            c.classList.add(
              'is-hover'
            )
        );


        el.addEventListener(
          'mouseleave',
          () =>
            c.classList.remove(
              'is-hover'
            )
        );
      }
    );


    window.addEventListener(
      'blur',
      () =>
        c.style.opacity =
          '0'
    );


    window.addEventListener(
      'focus',
      () =>
        c.style.opacity =
          '1'
    );
  }


  /* ============================================================
     GLOBAL INITIALIZATION
     ============================================================ */

  document.addEventListener(
    'DOMContentLoaded',
    () => {

      /*
        Yellow top scroll progress
        is initialized first so it is
        available immediately.
      */

      initScrollProgress();

      initHeader();

      initReveal();

      initMenuTabs();

      initCounters();

      initRestaurants();

      initCart();

      initProduct();

      initCollection();

      initSearch();

      initBackToTop();

      initCursor();

      refreshCart();
    }
  );

})();