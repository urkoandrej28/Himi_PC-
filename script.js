// Himi — сайт. Без внешних библиотек и счётчиков.
(() => {
  // --- мобильное меню
  const btn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }));
  }

  // --- плавное появление блоков при прокрутке
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add("in"));
  }

  // --- год в подвале
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // --- окно программы на первом экране: живой диалог, как в настоящем Himi PC.
  // Команда «произносится» (печатается в поле ввода), шар-статус переключается на «Распознаю…»,
  // затем реплика уходит в чат и Хими отвечает.
  const chat = document.getElementById("chat");
  const input = document.getElementById("awInput");
  const status = document.getElementById("awStatus");
  const statusText = document.getElementById("awStatusText");
  if (!chat || !input) return;

  const dialog = [
    ["Хими, запусти дедлок", "Запускаю Deadlock."],
    ["Хими, таймер на 5 минут", "Таймер на 5 мин. запущен."],
    ["Хими, глуши донаты в играх", "Буду глушить донаты, пока идёт игра."],
    ["Хими, сделай клип", "Клип готов, ссылка в буфере обмена."],
    ["Хими, что такое чёрная дыра?", "Область, где гравитация так сильна, что даже свет не может её покинуть."],
    ["Хими, сколько осталось?", "Осталось 3 мин. 12 сек."],
  ];
  const PLACEHOLDER = input.textContent;
  const MAX_MESSAGES = 6;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const add = (who, text) => {
    const el = document.createElement("div");
    el.className = `msg ${who}`;
    if (who === "himi") {
      const b = document.createElement("b");
      b.textContent = "Хими";
      el.appendChild(b);
    }
    el.appendChild(document.createTextNode(text));
    chat.appendChild(el);
    while (chat.children.length > MAX_MESSAGES) chat.firstElementChild.remove();
  };
  const setStatus = (busy) => {
    if (!status) return;
    status.classList.toggle("busy", busy);
    statusText.textContent = busy ? "Распознаю…" : "Слушаю · точный слух";
  };
  const resetInput = () => { input.className = "aw-placeholder"; input.textContent = PLACEHOLDER; };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dialog.slice(0, 3).forEach(([q, a]) => { add("user", q); add("himi", a); });
    return;
  }

  // Окно сразу открывается с началом разговора — пустой чат на первом экране выглядит незаконченно
  const PREFILLED = 2;
  dialog.slice(0, PREFILLED).forEach(([q, a]) => { add("user", q); add("himi", a); });

  let running = false;
  const play = async () => {
    for (let round = 0; ; round++) {
      for (const [q, a] of round === 0 ? dialog.slice(PREFILLED) : dialog) {
        input.className = "aw-typing";
        input.textContent = "";
        for (const ch of q) { input.textContent += ch; await wait(42); }
        setStatus(true);
        await wait(450);
        resetInput();
        add("user", q);
        await wait(650);
        setStatus(false);
        add("himi", a);
        await wait(2100);
      }
    }
  };
  new IntersectionObserver(e => {
    if (e[0].isIntersecting && !running) { running = true; play(); }
  }).observe(chat);
})();
