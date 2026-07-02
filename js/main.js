/* =============================================
   复古桌面 GUI — 窗口管理与交互
   ============================================= */

(function () {
  'use strict';

  // Track window z-index counter
  var zCounter = 100;
  var activeWindow = null;

  // All windows
  var windows = document.querySelectorAll('.window');
  var menuItems = document.querySelectorAll('.menu-item');
  var desktopIcons = document.querySelectorAll('.desktop-icon');
  var closeButtons = document.querySelectorAll('.window-close');
  var zoomButtons = document.querySelectorAll('.window-zoom');

  /* ===== Rearrange titlebar buttons: close on right, zoom then close ===== */
  document.querySelectorAll('.window-titlebar').forEach(function (bar) {
    var closeBtn = bar.querySelector('.window-close');
    var zoomBtn = bar.querySelector('.window-zoom');
    // Wrap right-side buttons in a group
    var btnGroup = document.createElement('span');
    btnGroup.className = 'window-btns';
    if (zoomBtn) btnGroup.appendChild(zoomBtn);
    if (closeBtn) btnGroup.appendChild(closeBtn);
    bar.appendChild(btnGroup);
    // Update button symbols
    if (closeBtn) closeBtn.textContent = '×'; // ×
    if (zoomBtn) zoomBtn.innerHTML = '<span style="display:block;width:8px;height:2px;background:#000;"></span>';
  });

  /* ===== UTILITY: bring window to front ===== */
  function bringToFront(win) {
    zCounter += 1;
    win.style.zIndex = zCounter;
    if (activeWindow && activeWindow !== win) {
      // dim previous window titlebar slightly
    }
    activeWindow = win;
  }

  /* ===== Open a window ===== */
  function openWindow(winId) {
    var win = document.getElementById('win-' + winId);
    if (!win) return;
    win.classList.add('active');
    bringToFront(win);

    // Reset position if off screen on mobile
    if (window.innerWidth <= 768) {
      win.style.top = '';
      win.style.left = '';
    }

    // Ensure visible
    ensureOnScreen(win);
  }

  /* ===== Close a window ===== */
  function closeWindow(win) {
    win.classList.remove('active');
    if (activeWindow === win) {
      activeWindow = null;
    }
  }

  /* ===== Toggle window ===== */
  function toggleWindow(winId) {
    var win = document.getElementById('win-' + winId);
    if (!win) return;
    if (win.classList.contains('active')) {
      bringToFront(win);
    } else {
      openWindow(winId);
    }
  }

  /* ===== Ensure window is within viewport ===== */
  function ensureOnScreen(win) {
    var rect = win.getBoundingClientRect();
    var padding = 20;

    if (rect.right > window.innerWidth - padding) {
      var overflowX = rect.right - window.innerWidth + padding;
      win.style.left = Math.max(padding, (parseInt(win.style.left) || 0) - overflowX) + 'px';
    }
    if (rect.bottom > window.innerHeight - padding) {
      var overflowY = rect.bottom - window.innerHeight + padding;
      win.style.top = Math.max(padding, (parseInt(win.style.top) || 0) - overflowY) + 'px';
    }
  }

  /* ===== DRAG & DROP ===== */
  function makeDraggable(win) {
    var titlebar = win.querySelector('.window-titlebar');
    if (!titlebar) return;

    var offsetX = 0, offsetY = 0;
    var dragging = false;

    titlebar.addEventListener('mousedown', function (e) {
      if (e.target.classList.contains('window-close') ||
          e.target.classList.contains('window-zoom')) {
        return; // don't drag when clicking buttons
      }
      dragging = true;
      var rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      win.style.transition = 'none';
      document.body.style.cursor = 'move';
      bringToFront(win);
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      win.style.left = Math.max(0, e.clientX - offsetX) + 'px';
      win.style.top = Math.min(window.innerHeight - 28, Math.max(34, e.clientY - offsetY)) + 'px';
    });

    document.addEventListener('mouseup', function () {
      if (dragging) {
        dragging = false;
        document.body.style.cursor = 'default';
        win.style.transition = '';
      }
    });

    // Touch support
    titlebar.addEventListener('touchstart', function (e) {
      if (e.target.classList.contains('window-close') ||
          e.target.classList.contains('window-zoom')) {
        return;
      }
      dragging = true;
      var rect = win.getBoundingClientRect();
      offsetX = e.touches[0].clientX - rect.left;
      offsetY = e.touches[0].clientY - rect.top;
      win.style.transition = 'none';
      bringToFront(win);
    }, { passive: false });

    document.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      win.style.left = Math.max(0, e.touches[0].clientX - offsetX) + 'px';
      win.style.top = Math.min(window.innerHeight - 28, Math.max(34, e.touches[0].clientY - offsetY)) + 'px';
    }, { passive: false });

    document.addEventListener('touchend', function () {
      if (dragging) {
        dragging = false;
        win.style.transition = '';
      }
    });
  }

  /* ===== INITIALIZE DRAGGABLE ===== */
  windows.forEach(function (win) {
    makeDraggable(win);

    // Click window to bring to front
    win.addEventListener('mousedown', function () {
      bringToFront(win);
    });
  });

  /* ===== MENU BAR CLICKS ===== */
  menuItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var winId = item.getAttribute('data-window');
      toggleWindow(winId);
    });
  });

  /* ===== DESKTOP ICON CLICKS ===== */
  desktopIcons.forEach(function (icon) {
    icon.addEventListener('click', function () {
      var winId = icon.getAttribute('data-window');
      openWindow(winId);
    });
    icon.addEventListener('dblclick', function () {
      var winId = icon.getAttribute('data-window');
      openWindow(winId);
    });
  });

  /* ===== CLOSE & ZOOM BUTTONS ===== */
  closeButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var win = btn.closest('.window');
      closeWindow(win);
    });
  });

  zoomButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var win = btn.closest('.window');
      bringToFront(win);
      // Toggle max-width for a simple "zoom" effect
      if (win.style.maxWidth === '100%') {
        win.style.maxWidth = '660px';
        win.style.left = '';
        win.style.top = '';
      } else {
        win.style.maxWidth = '100%';
        win.style.left = '10px';
        win.style.top = '50px';
      }
    });
  });

  /* ===== CLOCK ===== */
  function updateClock() {
    var now = new Date();
    var h = now.getHours();
    var m = String(now.getMinutes()).padStart(2, '0');
    var timeStr = h + ':' + m;
    var clockEl = document.getElementById('menuTime');
    if (clockEl) {
      clockEl.textContent = timeStr;
    }
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ===== GAME SHELF — 游戏封面墙 ===== */
  var GAME_DATA = [
    { slug: "witcher3", name: "巫师3：狂猎", en: "The Witcher 3: Wild Hunt",
      category: "箱庭与开放世界", platform: "PC", appid: 292030,
      cover: "images/games/292030.jpg", playtime_min: 7578, pinned: true },
    { slug: "disco-elysium", name: "极乐迪斯科", en: "Disco Elysium",
      category: "RPG与重叙事", platform: "PC", appid: 632470,
      cover: "images/games/632470.jpg", playtime_min: 7476, pinned: true },
    { slug: "bioshock-infinite", name: "生化奇兵：无限", en: "BioShock Infinite",
      category: "箱庭与开放世界", platform: "PC", appid: 8870,
      cover: "images/games/8870.jpg", playtime_min: 2172, pinned: false },
    { slug: "detroit", name: "底特律：变人", en: "Detroit: Become Human",
      category: "RPG与重叙事", platform: "PC", appid: 1222140,
      cover: "images/games/1222140.jpg", playtime_min: 3252, pinned: false },
    { slug: "sultans-game", name: "苏丹的游戏", en: "Sultan's Game",
      category: "策略与模拟", platform: "PC", appid: 3117820,
      cover: "images/games/3117820.jpg", playtime_min: 2508, pinned: false },
    { slug: "minds-beneath-us", name: "沉没意志", en: "Minds Beneath Us",
      category: "RPG与重叙事", platform: "PC", appid: 1610440,
      cover: "images/games/1610440.jpg", playtime_min: 1968, pinned: false },
    { slug: "farmer-replaced", name: "编程农场", en: "The Farmer Was Replaced",
      category: "策略与模拟", platform: "PC", appid: 2060160,
      cover: "images/games/2060160.jpg", playtime_min: 1164, pinned: false },
    { slug: "red-strings", name: "红弦俱乐部", en: "The Red Strings Club",
      category: "RPG与重叙事", platform: "PC", appid: 589780,
      cover: "images/games/589780.jpg", playtime_min: 516, pinned: false },
    { slug: "cosmic-wheel", name: "宇宙之轮姐妹会", en: "The Cosmic Wheel Sisterhood",
      category: "独立与情感叙事", platform: "PC", appid: 1340480,
      cover: "images/games/1340480.jpg", playtime_min: 336, pinned: false },
    { slug: "pentiment", name: "隐迹渐现", en: "Pentiment",
      category: "RPG与重叙事", platform: "PC", appid: 1205520,
      cover: "images/games/1205520.jpg", playtime_min: 600, pinned: false },
    { slug: "edith-finch", name: "艾迪芬奇的记忆", en: "What Remains of Edith Finch",
      category: "独立与情感叙事", platform: "PC", appid: 501300,
      cover: "images/games/501300.jpg", playtime_min: 360, pinned: true },
    { slug: "paper-house", name: "纸房子", en: "Paper House",
      category: "独立与情感叙事", platform: "PC", appid: 3528450,
      cover: "images/games/3528450.jpg", playtime_min: 480, pinned: false },
    { slug: "the-big-con", name: "The Big Con", en: "The Big Con",
      category: "独立与情感叙事", platform: "PC", appid: 1152010,
      cover: "images/games/1152010.jpg", playtime_min: 324, pinned: false },
    { slug: "whos-lila", name: "Who's Lila?", en: "Who's Lila?",
      category: "独立与情感叙事", platform: "PC", appid: 1697700,
      cover: "images/games/1697700.jpg", playtime_min: 360, pinned: false },
    { slug: "man-home", name: "Man I Just Wanna Go Home", en: "Man I Just Wanna Go Home",
      category: "独立与情感叙事", platform: "PC", appid: 3010070,
      cover: "images/games/3010070.jpg", playtime_min: 60, pinned: false }
  ];

  var gameShelfActiveCat = 'all';
  var gameShelfRendered = false;

  function hoursStr(min) {
    if (!min || min <= 0) return '';
    return Math.round(min / 60) + 'h';
  }

  function renderGameShelf() {
    var grid = document.getElementById('gameshelf-grid');
    var filters = document.getElementById('gameshelf-filters');
    var statsEl = document.getElementById('gameshelf-stats');
    if (!grid || !filters) return;

    // Sort: pinned first, then playtime desc
    var sorted = GAME_DATA.slice().sort(function (a, b) {
      return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.playtime_min || 0) - (a.playtime_min || 0);
    });

    // Categories
    var cats = ['all'].concat(sorted.map(function (g) { return g.category; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; }));

    // Total playtime
    var totalMin = 0;
    sorted.forEach(function (g) { totalMin += g.playtime_min || 0; });
    if (statsEl) statsEl.innerHTML = '<div class="gameshelf-banner"><img src="images/icons/computer.png" alt="游戏经历" style="width:100px;height:100px;"></div>';

    // Filter buttons
    filters.innerHTML = '';
    var totalH = Math.round(totalMin / 60);
    cats.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'gs-filt-btn' + (c === 'all' ? ' active' : '');
      btn.setAttribute('data-gs-cat', c);
      var label = c === 'all' ? '全部' : c;
      btn.textContent = label + (c === 'all' ? ' · ' + totalH + 'h' : '');
      btn.addEventListener('click', function () {
        gameShelfActiveCat = c;
        filters.querySelectorAll('.gs-filt-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyGameShelfFilter();
      });
      filters.appendChild(btn);
    });

    // Grid
    grid.innerHTML = '';
    sorted.forEach(function (g) {
      var card = document.createElement('div');
      card.className = 'gameshelf-card';
      card.setAttribute('data-gs-cat', g.category);
      card.innerHTML =
        '<div class="gs-cover-wrap">' +
          (g.pinned ? '<span class="gs-pin-badge">&#9733; 置顶</span>' : '') +
          '<img src="' + g.cover + '" alt="' + g.name + '" loading="lazy">' +
        '</div>' +
        '<span class="gs-name">' + (g.pinned ? '&#9733; ' : '') + g.name + '</span>' +
        '<span class="gs-meta">' + g.category + (g.playtime_min ? ' · ' + hoursStr(g.playtime_min) : '') + '</span>';
      grid.appendChild(card);
    });

    gameShelfRendered = true;
  }

  function applyGameShelfFilter() {
    document.querySelectorAll('.gameshelf-card').forEach(function (card) {
      var ok = gameShelfActiveCat === 'all' || card.getAttribute('data-gs-cat') === gameShelfActiveCat;
      card.classList.toggle('hidden', !ok);
    });
  }

  // Render when games window is first opened
  var gamesWin = document.getElementById('win-games');
  if (gamesWin) {
    var observer = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.target === gamesWin && m.type === 'attributes' && m.attributeName === 'class') {
          if (gamesWin.classList.contains('active') && !gameShelfRendered) {
            renderGameShelf();
          }
        }
      });
    });
    observer.observe(gamesWin, { attributes: true, attributeFilter: ['class'] });

    // Also render if already active
    if (gamesWin.classList.contains('active') && !gameShelfRendered) {
      renderGameShelf();
    }
  }

  /* ===== KEYBOARD SHORTCUTS ===== */
  document.addEventListener('keydown', function (e) {
    // Escape closes active window
    if (e.key === 'Escape' && activeWindow) {
      closeWindow(activeWindow);
    }
  });

  /* ===== PDF 下载 — 桌面图标触发 ===== */
  document.querySelector('[data-window="pdf"]').addEventListener('click', function () {
    window.open('resume/27届关卡策划实习简历_梁好_0628.pdf', '_blank');
  });
  document.querySelector('[data-window="pdf"]').addEventListener('dblclick', function () {
    window.open('resume/27届关卡策划实习简历_梁好_0628.pdf', '_blank');
  });

  /* ===== 反馈表单提交 ===== */
  window.submitFeedback = function (e) {
    e.preventDefault();
    var contact = document.getElementById('feedback-contact').value.trim();
    var msg = document.getElementById('feedback-msg').value.trim();
    if (!msg) return false;
    var body = msg;
    if (contact) body = body + '\n\n---\n联系方式: ' + contact;
    var mailto = 'mailto:lianghao25724@qq.com?subject=网站反馈&body=' + encodeURIComponent(body);
    window.open(mailto, '_blank');
    document.getElementById('feedback-done').style.display = 'block';
    document.getElementById('feedback-form').style.display = 'none';
    return false;
  };

  /* ===== 成就系统 — 追踪浏览过的窗口 ===== */
  var viewedWindows = {};
  var achievementShown = false;
  var allWindowIds = ['about', 'edu', 'skills', 'intern', 'projects', 'games', 'contact'];

  function checkAchievement() {
    if (achievementShown) return;
    var allViewed = allWindowIds.every(function (id) { return viewedWindows[id]; });
    if (allViewed) {
      achievementShown = true;
      setTimeout(function () {
        var achWin = document.getElementById('win-achievement');
        if (achWin) {
          achWin.style.display = 'flex';
          achWin.style.position = 'fixed';
          achWin.style.top = '50%';
          achWin.style.left = '50%';
          achWin.style.transform = 'translate(-50%, -50%)';
          achWin.style.zIndex = '99999';
          achWin.classList.add('active');
          makeDraggable(achWin);
          achWin.querySelector('.window-close').addEventListener('click', function (e) {
            e.stopPropagation();
            achWin.style.display = 'none';
            achWin.classList.remove('active');
          });
        }
      }, 2000);
    }
  }

  // Hook into openWindow to track views
  var originalOpenWindow = openWindow;
  openWindow = function (winId) {
    viewedWindows[winId] = true;
    checkAchievement();
    originalOpenWindow(winId);
  };

  /* ===== OPEN DEFAULT WINDOWS ON LOAD ===== */
  openWindow('about');
  setTimeout(function () {
    openWindow('projects');
    // 确保关于我窗口在最上层
    var aboutWin = document.getElementById('win-about');
    if (aboutWin) { zCounter += 5; aboutWin.style.zIndex = zCounter; activeWindow = aboutWin; }
  }, 400);

})();
