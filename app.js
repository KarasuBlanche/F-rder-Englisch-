(function () {
  "use strict";

  const app = document.getElementById("app");

  const HOUR_WORDS = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "eleven",
    12: "twelve"
  };

  const MINUTE_WORDS = {
    5: "five",
    10: "ten",
    20: "twenty",
    25: "twenty-five"
  };

  const ALL_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const EASY_MINUTES = [0, 15, 30, 45];
  const PAST_MINUTES = [5, 10, 20, 25];
  const TO_MINUTES = [35, 40, 50, 55];
  const HINTS = [
    "Look at the long hand.",
    "The long hand shows the minutes.",
    "Past means after.",
    "To means before the next hour.",
    "At 45 minutes, we say quarter to the next hour.",
    "At 30 minutes, we say half past."
  ];

  const LEVELS = [
    { id: 1, name: "Level 1", label: "o'clock", detail: "Full hours", minutes: [0] },
    { id: 2, name: "Level 2", label: "half past", detail: "30 minutes after", minutes: [30] },
    { id: 3, name: "Level 3", label: "quarters", detail: "quarter past and quarter to", minutes: [15, 45] },
    { id: 4, name: "Level 4", label: "past", detail: "five-minute intervals after", minutes: PAST_MINUTES },
    { id: 5, name: "Level 5", label: "to", detail: "five-minute intervals before", minutes: TO_MINUTES },
    { id: 6, name: "Level 6", label: "mixed challenge", detail: "all selected time forms", minutes: ALL_MINUTES }
  ];

  const SOLO_TASKS = [
    {
      type: "choice",
      title: "Choose the correct time",
      description: "Look at the clock and choose the best sentence."
    },
    {
      type: "match",
      title: "Match the time",
      description: "Drag or tap each sentence to the matching clock."
    },
    {
      type: "sentence",
      title: "Build the sentence",
      description: "Put the words in the correct order."
    },
    {
      type: "set",
      title: "Set the clock",
      description: "Move the hands, then check your clock."
    },
    {
      type: "mistake",
      title: "Find the mistake",
      description: "Decide if the sentence matches the clock."
    },
    {
      type: "final",
      title: "Final Challenge",
      description: "Answer 10 mixed questions and see your stars."
    }
  ];

  const PARTNER_TASKS = [
    {
      type: "say",
      title: "Say the time",
      description: "One partner says the time. The other checks."
    },
    {
      type: "set",
      title: "Set the clock",
      description: "One partner reads. The other sets the hands."
    },
    {
      type: "guess",
      title: "Guess my time",
      description: "Secretly set a clock and ask: What time is it?"
    },
    {
      type: "correctWrong",
      title: "Correct or wrong?",
      description: "Check a sentence and correct it together."
    },
    {
      type: "speed",
      title: "Speed Round",
      description: "Take turns quickly for 60 seconds."
    },
    {
      type: "dialogue",
      title: "Mini Dialogue",
      description: "Use a situation card and speak together."
    }
  ];

  const SITUATIONS = [
    {
      title: "School starts",
      minute: 55,
      hour: 7,
      support: "A: What time is it?\nB: It's five to eight.\nA: Oh no! School starts at eight o'clock!"
    },
    {
      title: "Lunch break",
      minute: 30,
      hour: 12,
      support: "A: What time is it?\nB: It's half past twelve.\nA: Great. It is lunch break."
    },
    {
      title: "Football practice",
      minute: 15,
      hour: 4,
      support: "A: What time is it?\nB: It's quarter past four.\nA: Time for football practice."
    },
    {
      title: "The bus arrives",
      minute: 50,
      hour: 2,
      support: "A: What time is it?\nB: It's ten to three.\nA: The bus arrives soon."
    },
    {
      title: "Cinema starts",
      minute: 45,
      hour: 5,
      support: "A: What time is it?\nB: It's quarter to six.\nA: The film starts at six."
    },
    {
      title: "Homework time",
      minute: 20,
      hour: 3,
      support: "A: What time is it?\nB: It's twenty past three.\nA: It is homework time."
    },
    {
      title: "Bedtime",
      minute: 0,
      hour: 9,
      support: "A: What time is it?\nB: It's nine o'clock.\nA: It is bedtime."
    },
    {
      title: "Birthday party",
      minute: 25,
      hour: 6,
      support: "A: What time is it?\nB: It's twenty-five past six.\nA: The birthday party starts soon."
    }
  ];

  const state = {
    settings: {
      levels: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
      timeTypes: { oclock: true, half: true, quarter: true, five: true },
      audio: true,
      timer: true,
      difficulty: "mixed",
      theme: "light"
    },
    muted: false,
    soloScore: 0,
    partnerNames: ["Partner A", "Partner B"],
    partnerScores: [0, 0],
    partnerTurn: 0,
    soloLevel: 1,
    partnerLevel: 1,
    recentTimes: [],
    current: null,
    speedTimerId: null,
    audioContext: null
  };

  function h(tag, props, children) {
    const node = document.createElement(tag);
    const attributes = props || {};
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "class") {
        node.className = value;
      } else if (key === "text") {
        node.textContent = value;
      } else if (key === "html") {
        node.innerHTML = value;
      } else if (key === "checked") {
        node.checked = Boolean(value);
      } else if (key === "value") {
        node.value = value;
      } else if (key === "disabled") {
        node.disabled = Boolean(value);
      } else if (key === "draggable") {
        node.draggable = Boolean(value);
      } else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        node.setAttribute(key, String(value));
      }
    });

    (children || []).flat().forEach((child) => {
      if (child === null || child === undefined) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });

    return node;
  }

  function renderScreen(children, options) {
    const opts = options || {};
    applyTheme();
    if (!opts.keepTimer) stopSpeedTimer();
    const className = opts.className || "screen";
    app.replaceChildren(h("section", { class: `${className} screen-enter` }, children));
    app.focus({ preventScroll: true });
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.settings.theme;
  }

  function toggleTheme() {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    applyTheme();
  }

  function themeLabel() {
    return state.settings.theme === "dark" ? "Light mode" : "Dark mode";
  }

  function normaliseHour(hour) {
    return ((Number(hour) - 1 + 12) % 12) + 1;
  }

  function normaliseMinute(minute) {
    const value = Number(minute);
    return ((value % 60) + 60) % 60;
  }

  function nextHour(hour) {
    return normaliseHour(Number(hour) + 1);
  }

  function hourWord(hour) {
    return HOUR_WORDS[normaliseHour(hour)];
  }

  function minuteWord(minute) {
    return MINUTE_WORDS[minute];
  }

  function phraseFor(hour, minute) {
    const hNum = normaliseHour(hour);
    const min = normaliseMinute(minute);

    if (min === 0) return `It's ${hourWord(hNum)} o'clock.`;
    if (min === 15) return `It's quarter past ${hourWord(hNum)}.`;
    if (min === 30) return `It's half past ${hourWord(hNum)}.`;
    if (min === 45) return `It's quarter to ${hourWord(nextHour(hNum))}.`;
    if (min < 30) return `It's ${minuteWord(min)} past ${hourWord(hNum)}.`;
    return `It's ${minuteWord(60 - min)} to ${hourWord(nextHour(hNum))}.`;
  }

  function sentenceTokens(phrase) {
    return phrase.replace(".", "").split(" ");
  }

  function timeId(time) {
    return `${normaliseHour(time.hour)}:${normaliseMinute(time.minute)}`;
  }

  function typeForMinute(minute) {
    const min = normaliseMinute(minute);
    if (min === 0) return "oclock";
    if (min === 30) return "half";
    if (min === 15 || min === 45) return "quarter";
    return "five";
  }

  function levelForMinute(minute) {
    const min = normaliseMinute(minute);
    if (min === 0) return 1;
    if (min === 30) return 2;
    if (min === 15 || min === 45) return 3;
    if (PAST_MINUTES.includes(min)) return 4;
    if (TO_MINUTES.includes(min)) return 5;
    return 6;
  }

  function levelLabel(levelId) {
    const level = LEVELS.find((item) => item.id === Number(levelId));
    return level ? `${level.name}: ${level.label}` : "Mixed";
  }

  function allowedMinutesForLevel(levelId) {
    const id = Number(levelId);
    if (!state.settings.levels[id]) return [];

    let minutes = [];
    if (id === 6) {
      minutes = ALL_MINUTES.filter((minute) => {
        const sourceLevel = levelForMinute(minute);
        return state.settings.levels[sourceLevel];
      });
    } else {
      const level = LEVELS.find((item) => item.id === id);
      minutes = level ? level.minutes.slice() : ALL_MINUTES.slice();
    }

    if (state.settings.difficulty === "easy") {
      minutes = minutes.filter((minute) => EASY_MINUTES.includes(minute));
    }

    return minutes.filter((minute) => state.settings.timeTypes[typeForMinute(minute)]);
  }

  function allowedTimes(levelId) {
    const minutes = allowedMinutesForLevel(levelId);
    const times = [];
    minutes.forEach((minute) => {
      for (let hour = 1; hour <= 12; hour += 1) {
        times.push({ hour, minute });
      }
    });
    return times;
  }

  function hasAllowedTimes(levelId) {
    return allowedTimes(levelId).length > 0;
  }

  function firstAvailableLevel() {
    const found = LEVELS.find((level) => hasAllowedTimes(level.id));
    return found ? found.id : 1;
  }

  function ensureSelectedLevels() {
    if (!hasAllowedTimes(state.soloLevel)) state.soloLevel = firstAvailableLevel();
    if (!hasAllowedTimes(state.partnerLevel)) state.partnerLevel = firstAvailableLevel();
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function sample(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function pickTime(levelId) {
    const pool = allowedTimes(levelId);
    const fallback = { hour: 3, minute: 0 };
    if (!pool.length) return fallback;

    const recent = new Set(state.recentTimes);
    const fresh = pool.filter((time) => !recent.has(timeId(time)));
    const choice = sample(fresh.length ? fresh : pool);
    state.recentTimes.push(timeId(choice));
    if (state.recentTimes.length > 8) state.recentTimes.shift();
    return { hour: choice.hour, minute: choice.minute };
  }

  function pickUniqueTimes(levelId, count) {
    const picked = [];
    const used = new Set();
    const pool = shuffle(allowedTimes(levelId));
    pool.forEach((time) => {
      if (picked.length >= count) return;
      if (used.has(timeId(time))) return;
      picked.push({ hour: time.hour, minute: time.minute });
      used.add(timeId(time));
    });

    while (picked.length < count) {
      const time = pickTime(levelId);
      if (!used.has(timeId(time))) {
        picked.push(time);
        used.add(timeId(time));
      } else {
        break;
      }
    }

    return picked;
  }

  function makeOptions(time, levelId, count) {
    const correct = phraseFor(time.hour, time.minute);
    const phrases = new Set([correct]);
    const scopedMinutes = allowedMinutesForLevel(levelId);
    const commonMinutes = scopedMinutes.length ? scopedMinutes : (state.settings.difficulty === "easy" ? EASY_MINUTES : ALL_MINUTES);

    commonMinutes.forEach((minute) => {
      phrases.add(phraseFor(time.hour, minute));
      phrases.add(phraseFor(nextHour(time.hour), minute));
    });

    shuffle(allowedTimes(levelId)).forEach((item) => {
      if (phrases.size < count + 8) phrases.add(phraseFor(item.hour, item.minute));
    });

    const options = shuffle(Array.from(phrases).filter((phrase) => phrase !== correct)).slice(0, count - 1);
    options.push(correct);
    return shuffle(options);
  }

  function taskMaxAttempts() {
    return state.current && state.current.type === "final" ? 1 : 2;
  }

  function playTone(kind) {
    if (!state.settings.audio || state.muted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    try {
      if (!state.audioContext) state.audioContext = new AudioContext();
      const ctx = state.audioContext;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(kind === "correct" ? 720 : 220, now);
      oscillator.frequency.exponentialRampToValueAtTime(kind === "correct" ? 920 : 160, now + 0.14);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
    } catch (error) {
      state.settings.audio = false;
    }
  }

  function speak(text) {
    if (!state.settings.audio || state.muted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(".", ""));
    utterance.lang = "en-GB";
    utterance.rate = 0.86;
    window.speechSynthesis.speak(utterance);
  }

  function celebrate(amount) {
    const total = amount || 22;
    const colours = ["#2f6fed", "#16a085", "#ff7a68", "#ffca55", "#7d5fff"];
    for (let i = 0; i < total; i += 1) {
      const piece = h("span", {
        class: "confetti-piece",
        style: `left:${Math.random() * 100}vw;background:${sample(colours)};animation-delay:${Math.random() * 170}ms;`
      });
      document.body.append(piece);
      window.setTimeout(() => piece.remove(), 1200);
    }
  }

  class Clock {
    constructor(container, options) {
      this.container = container;
      this.hour = normaliseHour(options.hour || 12);
      this.minute = normaliseMinute(options.minute || 0);
      this.interactive = Boolean(options.interactive);
      this.onChange = options.onChange || function () {};
      this.highlight = options.highlight || "";
      this.dragging = null;
      this.draw();
      this.setTime(this.hour, this.minute, false);
    }

    draw() {
      const svgNS = "http://www.w3.org/2000/svg";
      const wrapper = h("div", {
        class: `clock-widget${this.highlight ? ` highlight-${this.highlight}` : ""}${this.interactive ? " is-interactive" : ""}`
      });
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 200 200");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Analog clock");

      const face = document.createElementNS(svgNS, "circle");
      face.setAttribute("class", "clock-face");
      face.setAttribute("cx", "100");
      face.setAttribute("cy", "100");
      face.setAttribute("r", "92");
      svg.append(face);

      for (let i = 0; i < 60; i += 1) {
        const angle = i * 6;
        const rad = (Math.PI / 180) * angle;
        const outer = 88;
        const inner = i % 5 === 0 ? 78 : 83;
        const mark = document.createElementNS(svgNS, "line");
        mark.setAttribute("class", i % 5 === 0 ? "clock-hour-mark" : "clock-minute-mark");
        mark.setAttribute("x1", String(100 + inner * Math.sin(rad)));
        mark.setAttribute("y1", String(100 - inner * Math.cos(rad)));
        mark.setAttribute("x2", String(100 + outer * Math.sin(rad)));
        mark.setAttribute("y2", String(100 - outer * Math.cos(rad)));
        svg.append(mark);
      }

      for (let number = 1; number <= 12; number += 1) {
        const angle = number * 30;
        const rad = (Math.PI / 180) * angle;
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("class", "clock-number");
        text.setAttribute("x", String(100 + 66 * Math.sin(rad)));
        text.setAttribute("y", String(100 - 66 * Math.cos(rad)));
        text.textContent = String(number);
        svg.append(text);
      }

      this.hourGroup = document.createElementNS(svgNS, "g");
      this.hourGroup.setAttribute("class", "hand hour-hand");
      this.hourGroup.setAttribute("data-hand", "hour");
      const hourLine = document.createElementNS(svgNS, "line");
      hourLine.setAttribute("class", "hour-hand-line");
      hourLine.setAttribute("x1", "100");
      hourLine.setAttribute("y1", "104");
      hourLine.setAttribute("x2", "100");
      hourLine.setAttribute("y2", "59");
      hourLine.setAttribute("data-hand", "hour");
      this.hourGroup.append(hourLine);
      svg.append(this.hourGroup);

      this.minuteGroup = document.createElementNS(svgNS, "g");
      this.minuteGroup.setAttribute("class", "hand minute-hand");
      this.minuteGroup.setAttribute("data-hand", "minute");
      const minuteLine = document.createElementNS(svgNS, "line");
      minuteLine.setAttribute("class", "minute-hand-line");
      minuteLine.setAttribute("x1", "100");
      minuteLine.setAttribute("y1", "108");
      minuteLine.setAttribute("x2", "100");
      minuteLine.setAttribute("y2", "36");
      minuteLine.setAttribute("data-hand", "minute");
      const minuteGrip = document.createElementNS(svgNS, "circle");
      minuteGrip.setAttribute("class", "hand-grip");
      minuteGrip.setAttribute("cx", "100");
      minuteGrip.setAttribute("cy", "36");
      minuteGrip.setAttribute("r", "5");
      minuteGrip.setAttribute("data-hand", "minute");
      this.minuteGroup.append(minuteLine, minuteGrip);
      svg.append(this.minuteGroup);

      const center = document.createElementNS(svgNS, "circle");
      center.setAttribute("class", "clock-center");
      center.setAttribute("cx", "100");
      center.setAttribute("cy", "100");
      center.setAttribute("r", "6");
      svg.append(center);

      if (this.interactive) {
        svg.addEventListener("pointerdown", (event) => this.startDrag(event));
        svg.addEventListener("pointermove", (event) => this.moveDrag(event));
        svg.addEventListener("pointerup", (event) => this.endDrag(event));
        svg.addEventListener("pointercancel", (event) => this.endDrag(event));
      }

      wrapper.append(svg);
      this.container.replaceChildren(wrapper);
      this.wrapper = wrapper;
      this.svg = svg;
    }

    setTime(hour, minute, animate) {
      this.hour = normaliseHour(hour);
      this.minute = normaliseMinute(minute);
      const hourAngle = (this.hour % 12) * 30 + this.minute * 0.5;
      const minuteAngle = this.minute * 6;

      if (!animate) {
        this.hourGroup.style.transition = "none";
        this.minuteGroup.style.transition = "none";
      }

      this.hourGroup.style.transform = `rotate(${hourAngle}deg)`;
      this.minuteGroup.style.transform = `rotate(${minuteAngle}deg)`;

      if (!animate) {
        window.requestAnimationFrame(() => {
          this.hourGroup.style.transition = "";
          this.minuteGroup.style.transition = "";
        });
      }
    }

    startDrag(event) {
      if (!this.interactive) return;
      const target = event.target.closest("[data-hand]");
      this.dragging = target ? target.getAttribute("data-hand") : this.handFromPointer(event);
      this.svg.setPointerCapture(event.pointerId);
      this.updateFromPointer(event);
    }

    moveDrag(event) {
      if (!this.dragging) return;
      this.updateFromPointer(event);
    }

    endDrag(event) {
      if (!this.dragging) return;
      this.svg.releasePointerCapture(event.pointerId);
      this.dragging = null;
    }

    handFromPointer(event) {
      const point = this.pointerPoint(event);
      const distance = Math.hypot(point.x - 100, point.y - 100);
      return distance < 51 ? "hour" : "minute";
    }

    pointerPoint(event) {
      const rect = this.svg.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 200,
        y: ((event.clientY - rect.top) / rect.height) * 200
      };
    }

    pointerAngle(event) {
      const point = this.pointerPoint(event);
      let angle = Math.atan2(point.x - 100, 100 - point.y) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return angle;
    }

    updateFromPointer(event) {
      const angle = this.pointerAngle(event);
      if (this.dragging === "hour") {
        let next = Math.round(angle / 30);
        if (next === 0 || next === 12) next = 12;
        this.setTime(next, this.minute, true);
      } else {
        let nextMinute = Math.round(angle / 30) * 5;
        if (nextMinute >= 60) nextMinute = 0;
        this.setTime(this.hour, nextMinute, true);
      }
      this.onChange({ hour: this.hour, minute: this.minute });
    }
  }

  function makeHeader(config) {
    const progressValue = config.total ? Math.min(100, Math.round((config.progress / config.total) * 100)) : 0;
    return h("header", { class: "task-header" }, [
      h("button", { class: "ghost-button", type: "button", onclick: goHome }, ["Back to menu"]),
      h("div", { class: "header-middle" }, [
        h("div", { class: "header-title-row" }, [
          h("strong", { text: config.mode }),
          config.level ? h("span", { class: "chip", text: config.level }) : null
        ]),
        h("div", { class: "chip-row" }, [
          config.score ? h("span", { class: "chip", text: config.score }) : null,
          config.extra ? h("span", { class: "chip", text: config.extra }) : null
        ]),
        config.total
          ? h("div", { class: "progress-wrap", "aria-label": `Progress ${config.progress} of ${config.total}` }, [
              h("div", { class: "progress-bar", style: `width:${progressValue}%` })
            ])
          : null
      ]),
      h("div", { class: "header-actions" }, [
        h("button", {
          class: "ghost-button theme-button",
          type: "button",
          onclick: (event) => {
            toggleTheme();
            event.currentTarget.textContent = themeLabel();
          }
        }, [themeLabel()]),
        h("button", {
          class: "ghost-button",
          type: "button",
          onclick: (event) => {
            state.muted = !state.muted;
            if (state.muted && "speechSynthesis" in window) window.speechSynthesis.cancel();
            event.currentTarget.textContent = state.muted || !state.settings.audio ? "Muted" : "Sound on";
          }
        }, [state.muted || !state.settings.audio ? "Muted" : "Sound on"])
      ])
    ]);
  }

  function feedbackNode(feedback, emptyText) {
    if (!feedback) {
      return h("div", { class: "feedback empty", role: "status" }, [
        h("strong", { text: "Ready?" }),
        h("p", { text: emptyText || "Choose an answer when you are ready." })
      ]);
    }
    return h("div", { class: `feedback ${feedback.type}`, role: "status" }, [
      h("strong", { text: feedback.title }),
      h("p", { text: feedback.message })
    ]);
  }

  function hintControls() {
    const current = state.current;
    return [
      h("div", { class: `hint-box${current && current.showHint ? " show" : ""}` }, [
        current && current.hintText ? current.hintText : sample(HINTS)
      ]),
      h("button", {
        class: "text-button",
        type: "button",
        onclick: () => {
          state.current.showHint = !state.current.showHint;
          if (!state.current.hintText) state.current.hintText = sample(HINTS);
          rerenderCurrentScreen();
        }
      }, [current && current.showHint ? "Hide hint" : "Hint"])
    ];
  }

  function taskActions() {
    const current = state.current;
    const buttons = [];
    const correctPhrase = current && current.data && current.data.correctPhrase;
    if (correctPhrase) {
      buttons.push(h("button", { class: "text-button", type: "button", onclick: () => speak(correctPhrase) }, ["Hear answer"]));
    }
    if (current && current.answered) {
      buttons.push(h("button", { class: "big-button", type: "button", onclick: nextSoloRound }, [
        current.round >= current.total ? "Finish" : "Next task"
      ]));
    }
    return h("div", { class: "action-row" }, [
      h("div", { class: "button-row" }, hintControls()),
      h("div", { class: "button-row" }, buttons)
    ]);
  }

  function partnerActions(nextHandler) {
    const current = state.current;
    const buttons = [];
    if (current && current.data && current.data.correctPhrase) {
      buttons.push(h("button", { class: "text-button", type: "button", onclick: () => speak(current.data.correctPhrase) }, ["Hear answer"]));
    }
    if (current && current.answered) {
      buttons.push(h("button", { class: "big-button", type: "button", onclick: nextHandler }, [
        current.round >= current.total ? "Finish" : "Next task"
      ]));
    }
    return h("div", { class: "action-row" }, [
      h("div", { class: "button-row" }, hintControls()),
      h("div", { class: "button-row" }, buttons)
    ]);
  }

  function modeButton(tag, title, detail, onClick) {
    return h("button", { class: "mode-button", type: "button", onclick: onClick }, [
      h("span", { class: "mode-tag", text: tag }),
      h("strong", { text: title }),
      h("span", { text: detail })
    ]);
  }

  function renderStart() {
    ensureSelectedLevels();
    const clockSpot = h("div", { class: "hero-clock" });
    window.requestAnimationFrame(() => {
      new Clock(clockSpot, { hour: 10, minute: 10, highlight: "both" });
    });

    renderScreen([
      h("div", { class: "hero" }, [
        h("div", { class: "hero-copy" }, [
          h("span", { class: "eyebrow", text: "English time practice" }),
          h("div", {}, [
            h("h1", { text: "What time is it?" }),
            h("p", { class: "subtitle", text: "Practise telling the time in English" })
          ]),
          h("div", { class: "mode-grid" }, [
            modeButton("Solo mode", "Practise by yourself", "Instant feedback, hints, levels, and a final challenge.", renderSoloMenu),
            modeButton("Partner mode", "Practise with a partner", "Take turns, speak English, check answers, and score points.", renderPartnerSetup)
          ]),
          h("div", { class: "button-row" }, [
            h("button", { class: "big-button secondary", type: "button", onclick: renderTeacherSettings }, ["Teacher Settings"]),
            h("button", { class: "text-button", type: "button", onclick: renderRemember }, ["Remember"]),
            h("button", {
              class: "ghost-button theme-button",
              type: "button",
              onclick: () => {
                toggleTheme();
                renderStart();
              }
            }, [themeLabel()]),
            h("button", {
              class: "ghost-button",
              type: "button",
              onclick: () => {
                state.muted = !state.muted;
                if (state.muted && "speechSynthesis" in window) window.speechSynthesis.cancel();
                renderStart();
              }
            }, [state.muted || !state.settings.audio ? "Muted" : "Sound on"])
          ])
        ]),
        clockSpot
      ]),
      h("div", { class: "support-grid" }, [
        h("section", { class: "support-panel" }, [
          h("h2", { text: "Remember" }),
          h("ul", { class: "remember-list" }, [
            h("li", { text: "o'clock = full hour" }),
            h("li", { text: "half past = 30 minutes after" }),
            h("li", { text: "quarter past = 15 minutes after" }),
            h("li", { text: "quarter to = 15 minutes before the next hour" }),
            h("li", { text: "past = after the hour" }),
            h("li", { text: "to = before the next hour" })
          ])
        ]),
        h("section", { class: "support-panel" }, [
          h("h2", { text: "Teacher guide" }),
          h("ol", { class: "teacher-list" }, [
            h("li", { text: "Choose Solo Mode or Partner Mode." }),
            h("li", { text: "Start with easy levels." }),
            h("li", { text: "Use Partner Mode for speaking practice." }),
            h("li", { text: "Use Final Challenge for checking progress." })
          ])
        ])
      ])
    ]);
  }

  function renderRemember() {
    renderScreen([
      makeHeader({ mode: "Remember", score: "No personal data is stored" }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-copy" }, [
          h("h1", { text: "Remember" }),
          h("p", { class: "instruction", text: "Use these small rules when you practise." })
        ]),
        h("ul", { class: "remember-list" }, [
          h("li", { text: "o'clock = full hour" }),
          h("li", { text: "half past = 30 minutes after" }),
          h("li", { text: "quarter past = 15 minutes after" }),
          h("li", { text: "quarter to = 15 minutes before the next hour" }),
          h("li", { text: "past = after the hour" }),
          h("li", { text: "to = before the next hour" })
        ]),
        h("button", { class: "big-button", type: "button", onclick: renderStart }, ["Back to menu"])
      ])
    ]);
  }

  function renderSoloMenu() {
    ensureSelectedLevels();
    const canUseSelectedLevel = hasAllowedTimes(state.soloLevel);

    renderScreen([
      makeHeader({
        mode: "Solo Mode",
        level: levelLabel(state.soloLevel),
        score: `Score ${state.soloScore}`
      }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-intro" }, [
          h("div", { class: "task-copy" }, [
            h("h1", { text: "Practise by yourself" }),
            h("p", { class: "instruction", text: "Choose a level, then choose one task." })
          ]),
          h("button", { class: "text-button", type: "button", onclick: renderTeacherSettings }, ["Teacher Settings"])
        ]),
        h("div", { class: "button-row" }, LEVELS.map((level) => {
          const disabled = !hasAllowedTimes(level.id);
          return h("button", {
            class: `pill-button${state.soloLevel === level.id ? " active" : ""}`,
            type: "button",
            disabled,
            onclick: () => {
              state.soloLevel = level.id;
              renderSoloMenu();
            }
          }, [`${level.name}: ${level.label}`]);
        })),
        !canUseSelectedLevel
          ? h("div", { class: "feedback almost" }, [
              h("strong", { text: "No times here yet." }),
              h("p", { text: "Turn on this level or time type in Teacher Settings." })
            ])
          : null,
        h("div", { class: "level-grid" }, SOLO_TASKS.map((task) => {
          const isFinal = task.type === "final";
          const disabled = isFinal ? !hasAllowedTimes(6) : !canUseSelectedLevel;
          return h("button", {
            class: "task-button",
            type: "button",
            disabled,
            onclick: () => startSoloTask(task.type)
          }, [
            h("span", { class: "mode-tag", text: isFinal ? "Level 6" : "Practice" }),
            h("strong", { text: task.title }),
            h("span", { text: task.description })
          ]);
        }))
      ])
    ]);
  }

  function startSoloTask(type) {
    const level = type === "final" ? 6 : state.soloLevel;
    state.current = {
      owner: "solo",
      type,
      level,
      total: type === "final" ? 10 : 5,
      round: 1,
      points: 0,
      attempts: 0,
      answered: false,
      feedback: null,
      showHint: false,
      hintText: "",
      data: null,
      questionType: type
    };
    prepareSoloRound();
    renderSoloTask();
  }

  function prepareSoloRound() {
    const current = state.current;
    current.attempts = 0;
    current.answered = false;
    current.feedback = null;
    current.showHint = false;
    current.hintText = "";

    current.questionType = current.type === "final" ? pickFinalQuestionType() : current.type;
    if (current.questionType === "choice") current.data = generateChoiceData(current.level);
    if (current.questionType === "match") current.data = generateMatchData(current.level);
    if (current.questionType === "sentence") current.data = generateSentenceData(current.level);
    if (current.questionType === "set") current.data = generateSetData(current.level);
    if (current.questionType === "mistake") current.data = generateMistakeData(current.level);
  }

  function pickFinalQuestionType() {
    const easy = ["choice", "choice", "choice", "sentence", "set"];
    const mixed = ["choice", "sentence", "set", "choice", "sentence", "set"];
    return sample(state.settings.difficulty === "easy" ? easy : mixed);
  }

  function generateChoiceData(levelId) {
    const time = pickTime(levelId);
    return {
      time,
      correctPhrase: phraseFor(time.hour, time.minute),
      options: makeOptions(time, levelId, 4),
      selected: ""
    };
  }

  function generateMatchData(levelId) {
    const times = pickUniqueTimes(levelId, 4);
    const phrases = shuffle(times.map((time, index) => ({
      id: `phrase-${index}`,
      text: phraseFor(time.hour, time.minute),
      timeId: timeId(time)
    })));

    return {
      times,
      correctPhrase: "Match all four clocks.",
      phrases,
      assignments: Array(times.length).fill(null),
      selectedPhraseId: null,
      wrongSlots: []
    };
  }

  function generateSentenceData(levelId) {
    const time = pickTime(levelId);
    const correctPhrase = phraseFor(time.hour, time.minute);
    const tokens = sentenceTokens(correctPhrase);
    return {
      time,
      correctPhrase,
      tokens,
      tiles: shuffle(tokens.map((word, index) => ({ id: `tile-${index}`, word }))),
      answerIds: []
    };
  }

  function generateSetData(levelId) {
    const target = pickTime(levelId);
    let startHour = Math.floor(Math.random() * 12) + 1;
    if (startHour === target.hour) startHour = nextHour(startHour);
    return {
      target,
      user: { hour: startHour, minute: 0 },
      correctPhrase: phraseFor(target.hour, target.minute)
    };
  }

  function generateMistakeData(levelId) {
    const time = pickTime(levelId);
    const correctPhrase = phraseFor(time.hour, time.minute);
    const isCorrect = Math.random() > 0.5;
    const wrongOptions = makeOptions(time, levelId, 4).filter((phrase) => phrase !== correctPhrase);
    const shownPhrase = isCorrect ? correctPhrase : sample(wrongOptions);
    return {
      time,
      correctPhrase,
      shownPhrase,
      isCorrect,
      stage: "judge",
      correctionOptions: makeOptions(time, levelId, 4),
      selected: ""
    };
  }

  function renderSoloTask() {
    const current = state.current;
    const task = SOLO_TASKS.find((item) => item.type === current.type);
    const title = current.type === "final" ? "Final Challenge" : task.title;
    const instruction = current.type === "final"
      ? `Question ${current.round} of ${current.total}: ${labelForQuestionType(current.questionType)}`
      : `${levelLabel(current.level)}. ${task.description}`;

    renderScreen([
      makeHeader({
        mode: "Solo Mode",
        level: current.type === "final" ? "Level 6: mixed challenge" : levelLabel(current.level),
        score: `Score ${state.soloScore}`,
        extra: `${current.points} in this task`,
        progress: current.round,
        total: current.total
      }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-intro" }, [
          h("div", { class: "task-copy" }, [
            h("h2", { text: title }),
            h("p", { class: "instruction", text: instruction })
          ])
        ]),
        renderSoloBody(),
        feedbackNode(current.feedback),
        taskActions()
      ])
    ]);
  }

  function labelForQuestionType(type) {
    if (type === "choice") return "choose the correct time";
    if (type === "sentence") return "build the sentence";
    if (type === "set") return "set the clock";
    if (type === "match") return "match the time";
    return "find the mistake";
  }

  function renderSoloBody() {
    const type = state.current.questionType;
    if (type === "choice") return renderChoiceTask();
    if (type === "match") return renderMatchTask();
    if (type === "sentence") return renderSentenceTask();
    if (type === "set") return renderSetClockTask();
    return renderMistakeTask();
  }

  function renderClockNode(time, options) {
    const holder = h("div", {});
    window.requestAnimationFrame(() => {
      new Clock(holder, {
        hour: time.hour,
        minute: time.minute,
        interactive: options && options.interactive,
        highlight: options && options.highlight,
        onChange: options && options.onChange
      });
    });
    return holder;
  }

  function renderChoiceTask() {
    const data = state.current.data;
    return h("div", { class: "clock-area" }, [
      renderClockNode(data.time, { highlight: "both" }),
      h("div", { class: "option-grid" }, data.options.map((option) => {
        const isSelected = data.selected === option;
        const className = [
          "option-button",
          state.current.answered && option === data.correctPhrase ? "correct" : "",
          isSelected && option !== data.correctPhrase ? "wrong" : ""
        ].filter(Boolean).join(" ");

        return h("button", {
          class: className,
          type: "button",
          disabled: state.current.answered,
          onclick: () => checkChoice(option)
        }, [option]);
      }))
    ]);
  }

  function checkChoice(option) {
    const current = state.current;
    const data = current.data;
    if (current.answered) return;
    data.selected = option;
    if (option === data.correctPhrase) {
      soloCorrect("Great!", `That's right: ${data.correctPhrase}`);
    } else {
      soloWrong("Try again!", `Check the hour hand and the minute hand.`, data.correctPhrase);
    }
  }

  function renderMatchTask() {
    const data = state.current.data;
    const clocks = h("div", { class: "clock-match-grid" }, data.times.map((time, index) => {
      const assignedId = data.assignments[index];
      const phrase = data.phrases.find((item) => item.id === assignedId);
      const correct = phrase && phrase.timeId === timeId(time);
      const wrong = data.wrongSlots.includes(index);

      const slot = h("button", {
        class: [
          "drop-slot",
          phrase ? "filled" : "",
          state.current.answered && correct ? "correct" : "",
          wrong ? "wrong shake" : ""
        ].filter(Boolean).join(" "),
        type: "button",
        ondragover: (event) => event.preventDefault(),
        ondrop: (event) => {
          event.preventDefault();
          assignPhraseToSlot(event.dataTransfer.getData("text/plain"), index);
        },
        onclick: () => handleSlotTap(index)
      }, [phrase ? phrase.text : "Drop phrase here"]);

      return h("div", { class: "match-clock" }, [
        renderClockNode(time, { highlight: "both" }),
        slot
      ]);
    }));

    const assigned = new Set(data.assignments.filter(Boolean));
    const phraseButtons = data.phrases.map((phrase) => {
      const selected = data.selectedPhraseId === phrase.id;
      return h("button", {
        class: `tile${selected ? " selected" : ""}${assigned.has(phrase.id) ? " used" : ""}`,
        type: "button",
        draggable: true,
        ondragstart: (event) => event.dataTransfer.setData("text/plain", phrase.id),
        onclick: () => {
          data.selectedPhraseId = selected ? null : phrase.id;
          rerenderCurrentScreen();
        }
      }, [phrase.text]);
    });

    return h("div", { class: "match-layout" }, [
      clocks,
      h("div", { class: "control-panel" }, [
        h("h3", { text: "Time phrases" }),
        h("div", { class: "phrase-bank" }, phraseButtons),
        h("button", { class: "big-button", type: "button", disabled: state.current.answered, onclick: checkMatchTask }, ["Check"])
      ])
    ]);
  }

  function assignPhraseToSlot(phraseId, slotIndex) {
    const data = state.current.data;
    if (!phraseId || state.current.answered) return;
    const phrase = data.phrases.find((item) => item.id === phraseId);
    if (!phrase) return;
    data.assignments = data.assignments.map((assigned) => (assigned === phraseId ? null : assigned));
    data.assignments[slotIndex] = phraseId;
    data.selectedPhraseId = null;
    data.wrongSlots = [];
    rerenderCurrentScreen();
  }

  function handleSlotTap(slotIndex) {
    const data = state.current.data;
    if (state.current.answered) return;
    if (data.selectedPhraseId) {
      assignPhraseToSlot(data.selectedPhraseId, slotIndex);
    } else if (data.assignments[slotIndex]) {
      data.assignments[slotIndex] = null;
      data.wrongSlots = [];
      rerenderCurrentScreen();
    }
  }

  function checkMatchTask() {
    const current = state.current;
    const data = current.data;
    const wrongSlots = [];
    data.times.forEach((time, index) => {
      const phrase = data.phrases.find((item) => item.id === data.assignments[index]);
      if (!phrase || phrase.timeId !== timeId(time)) wrongSlots.push(index);
    });

    if (!wrongSlots.length) {
      soloCorrect("Great!", "All four matches are correct.");
      return;
    }

    current.attempts += 1;
    if (current.attempts >= taskMaxAttempts()) {
      data.assignments = data.times.map((time) => {
        const phrase = data.phrases.find((item) => item.timeId === timeId(time));
        return phrase ? phrase.id : null;
      });
      data.wrongSlots = [];
      current.answered = true;
      current.feedback = {
        type: "wrong",
        title: "Check this one.",
        message: "Here are the correct matches."
      };
      playTone("wrong");
    } else {
      data.wrongSlots = wrongSlots;
      wrongSlots.forEach((index) => {
        data.assignments[index] = null;
      });
      current.feedback = {
        type: "almost",
        title: "Almost!",
        message: "Correct matches glow green. Try the others again."
      };
      playTone("wrong");
    }
    renderSoloTask();
  }

  function renderSentenceTask() {
    const data = state.current.data;
    const placed = new Set(data.answerIds);
    const answerTiles = data.answerIds.map((id) => data.tiles.find((tile) => tile.id === id)).filter(Boolean);

    const sentenceZone = h("div", {
      class: "sentence-zone",
      ondragover: (event) => event.preventDefault(),
      ondrop: (event) => {
        event.preventDefault();
        placeSentenceTile(event.dataTransfer.getData("text/plain"));
      }
    }, answerTiles.length
      ? answerTiles.map((tile) => h("button", {
          class: "tile",
          type: "button",
          onclick: () => removeSentenceTile(tile.id)
        }, [tile.word]))
      : [h("span", { class: "empty-zone", text: "Build the sentence here" })]);

    return h("div", { class: "clock-area" }, [
      renderClockNode(data.time, { highlight: "both" }),
      h("div", { class: "control-panel" }, [
        sentenceZone,
        h("div", { class: "tile-bank" }, data.tiles.map((tile) => {
          const used = placed.has(tile.id);
          return h("button", {
            class: `tile${used ? " used" : ""}`,
            type: "button",
            draggable: !used,
            ondragstart: (event) => event.dataTransfer.setData("text/plain", tile.id),
            onclick: () => placeSentenceTile(tile.id)
          }, [tile.word]);
        })),
        h("button", { class: "big-button", type: "button", disabled: state.current.answered, onclick: checkSentenceTask }, ["Check"])
      ])
    ]);
  }

  function placeSentenceTile(tileId) {
    const data = state.current.data;
    if (state.current.answered || !tileId || data.answerIds.includes(tileId)) return;
    data.answerIds.push(tileId);
    rerenderCurrentScreen();
  }

  function removeSentenceTile(tileId) {
    const data = state.current.data;
    if (state.current.answered) return;
    data.answerIds = data.answerIds.filter((id) => id !== tileId);
    rerenderCurrentScreen();
  }

  function checkSentenceTask() {
    const current = state.current;
    const data = current.data;
    const answer = data.answerIds.map((id) => data.tiles.find((tile) => tile.id === id).word).join(" ");
    const correct = data.tokens.join(" ");

    if (answer === correct) {
      soloCorrect("Great!", `The sentence is correct: ${data.correctPhrase}`);
    } else {
      soloWrong("Try again!", "Read the words from left to right.", data.correctPhrase);
    }
  }

  function renderSetClockTask() {
    const data = state.current.data;
    return h("div", { class: "clock-area" }, [
      h("div", {}, [
        renderClockNode(data.user, {
          interactive: !state.current.answered,
          highlight: "both",
          onChange: (time) => {
            data.user = { hour: time.hour, minute: time.minute };
          }
        }),
        h("p", { class: "interactive-note", text: "Drag a hand or use the buttons. Minutes snap to 5." })
      ]),
      h("div", { class: "control-panel" }, [
        h("div", { class: "large-phrase", text: data.correctPhrase }),
        h("div", { class: "control-grid" }, [
          h("button", { class: "control-button", type: "button", disabled: state.current.answered, onclick: () => changeUserClock(0, 5) }, ["+5 minutes"]),
          h("button", { class: "control-button", type: "button", disabled: state.current.answered, onclick: () => changeUserClock(0, -5) }, ["-5 minutes"]),
          h("button", { class: "control-button", type: "button", disabled: state.current.answered, onclick: () => changeUserClock(1, 0) }, ["+1 hour"]),
          h("button", { class: "control-button", type: "button", disabled: state.current.answered, onclick: () => changeUserClock(-1, 0) }, ["-1 hour"])
        ]),
        h("button", { class: "big-button", type: "button", disabled: state.current.answered, onclick: checkSetClockTask }, ["Check"])
      ])
    ]);
  }

  function changeUserClock(hourDelta, minuteDelta) {
    const data = state.current.data;
    const totalMinutes = (normaliseHour(data.user.hour) % 12) * 60 + data.user.minute + hourDelta * 60 + minuteDelta;
    const wrapped = ((totalMinutes % 720) + 720) % 720;
    const hour = Math.floor(wrapped / 60);
    const minute = wrapped % 60;
    data.user = { hour: hour === 0 ? 12 : hour, minute };
    rerenderCurrentScreen();
  }

  function checkSetClockTask() {
    const current = state.current;
    const data = current.data;
    const target = data.target;
    const user = data.user;
    const hourOk = normaliseHour(target.hour) === normaliseHour(user.hour);
    const minuteOk = normaliseMinute(target.minute) === normaliseMinute(user.minute);

    if (hourOk && minuteOk) {
      soloCorrect("Great!", `Your clock shows ${data.correctPhrase}`);
      return;
    }

    let message = "Check the hour hand and the minute hand.";
    if (minuteOk && !hourOk) message = "The minutes are right, but check the hour.";
    if (hourOk && !minuteOk) message = "The hour is right, but check the minute hand.";
    if (target.minute >= 35 && minuteOk && !hourOk) message = "The minutes are right, but check the hour. It is before the next hour.";

    current.attempts += 1;
    if (current.attempts >= taskMaxAttempts()) {
      data.user = { hour: target.hour, minute: target.minute };
      current.answered = true;
      current.feedback = {
        type: "wrong",
        title: "Check this one.",
        message: `${message} Correct answer: ${data.correctPhrase}`
      };
      playTone("wrong");
      renderSoloTask();
    } else {
      current.feedback = {
        type: "almost",
        title: "Almost!",
        message
      };
      playTone("wrong");
      renderSoloTask();
    }
  }

  function renderMistakeTask() {
    const data = state.current.data;
    const prompt = data.stage === "judge"
      ? h("div", { class: "option-grid" }, [
          h("button", { class: "option-button", type: "button", disabled: state.current.answered, onclick: () => checkMistakeJudgement(true) }, ["Correct"]),
          h("button", { class: "option-button", type: "button", disabled: state.current.answered, onclick: () => checkMistakeJudgement(false) }, ["Wrong"])
        ])
      : h("div", { class: "option-grid" }, data.correctionOptions.map((option) => h("button", {
          class: "option-button",
          type: "button",
          disabled: state.current.answered,
          onclick: () => checkMistakeCorrection(option)
        }, [option])));

    return h("div", { class: "clock-area" }, [
      renderClockNode(data.time, { highlight: "both" }),
      h("div", { class: "control-panel" }, [
        h("p", { class: "instruction", text: data.stage === "judge" ? "Does this sentence match the clock?" : "Choose the correct sentence." }),
        h("div", { class: "large-phrase", text: data.shownPhrase }),
        prompt
      ])
    ]);
  }

  function checkMistakeJudgement(saysCorrect) {
    const current = state.current;
    const data = current.data;
    if (saysCorrect === data.isCorrect && data.isCorrect) {
      soloCorrect("Great!", `Correct. ${data.correctPhrase}`);
      return;
    }

    if (saysCorrect === data.isCorrect && !data.isCorrect) {
      data.stage = "correct";
      current.feedback = {
        type: "almost",
        title: "Good check.",
        message: "Now choose the correct sentence."
      };
      playTone("correct");
      renderSoloTask();
      return;
    }

    const reveal = data.isCorrect ? data.correctPhrase : `Wrong. ${data.correctPhrase}`;
    soloWrong("Try again!", "Look at the minute hand carefully.", reveal);
  }

  function checkMistakeCorrection(option) {
    const data = state.current.data;
    if (option === data.correctPhrase) {
      soloCorrect("Great!", `Wrong. ${data.correctPhrase}`);
    } else {
      soloWrong("Try again!", "Choose the sentence that matches the clock.", data.correctPhrase);
    }
  }

  function soloCorrect(title, message) {
    const current = state.current;
    current.answered = true;
    current.points += 1;
    state.soloScore += 1;
    current.feedback = { type: "correct", title, message };
    playTone("correct");
    if (current.type === "final" && current.round === current.total && current.points >= 8) celebrate(26);
    renderSoloTask();
  }

  function soloWrong(title, message, correctPhrase) {
    const current = state.current;
    current.attempts += 1;
    const maxAttempts = taskMaxAttempts();
    if (current.attempts >= maxAttempts) {
      current.answered = true;
      current.feedback = {
        type: "wrong",
        title: "Check this one.",
        message: `${message} Correct answer: ${correctPhrase}`
      };
    } else {
      current.feedback = {
        type: "almost",
        title,
        message
      };
    }
    playTone("wrong");
    renderSoloTask();
  }

  function nextSoloRound() {
    const current = state.current;
    if (current.round >= current.total) {
      renderSoloSummary();
      return;
    }
    current.round += 1;
    prepareSoloRound();
    renderSoloTask();
  }

  function renderSoloSummary() {
    const current = state.current;
    const isFinal = current.type === "final";
    const message = isFinal ? finalMessage(current.points) : practiceMessage(current.points, current.total);
    const stars = isFinal ? finalStars(current.points) : Math.max(1, Math.ceil((current.points / current.total) * 3));
    if (current.points >= Math.ceil(current.total * 0.8)) celebrate(22);

    renderScreen([
      makeHeader({
        mode: "Solo Mode",
        level: isFinal ? "Level 6: mixed challenge" : levelLabel(current.level),
        score: `Score ${state.soloScore}`,
        progress: current.total,
        total: current.total
      }),
      h("section", { class: "summary-panel" }, [
        h("h1", { text: isFinal ? "Final Challenge" : "Task complete" }),
        h("p", { class: "subtitle", text: isFinal ? `You got ${current.points} out of ${current.total}.` : `You got ${current.points} out of ${current.total}.` }),
        h("div", { class: "stars", "aria-label": `${stars} stars` }, [1, 2, 3].map((star) => h("span", { class: `star${star <= stars ? " on" : ""}` }))),
        h("h2", { text: message }),
        h("div", { class: "button-row" }, [
          h("button", { class: "big-button", type: "button", onclick: () => startSoloTask(current.type) }, ["Try again"]),
          h("button", { class: "text-button", type: "button", onclick: renderSoloMenu }, ["Solo task menu"])
        ])
      ])
    ]);
  }

  function finalStars(points) {
    if (points >= 8) return 3;
    if (points >= 5) return 2;
    if (points > 0) return 1;
    return 0;
  }

  function finalMessage(points) {
    if (points >= 8) return "Excellent.";
    if (points >= 5) return "Good work.";
    return "Keep practising.";
  }

  function practiceMessage(points, total) {
    if (points === total) return "Excellent.";
    if (points >= Math.ceil(total * 0.6)) return "Good work.";
    return "Keep practising.";
  }

  function renderPartnerSetup() {
    renderScreen([
      makeHeader({ mode: "Partner Mode", score: "Speaking practice" }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-copy" }, [
          h("h1", { text: "Practise with a partner" }),
          h("p", { class: "instruction", text: "Enter names or keep the default names." })
        ]),
        h("div", { class: "partner-setup" }, [
          h("label", { class: "input-row" }, [
            "Partner A",
            h("input", { id: "partnerA", type: "text", maxlength: "18", value: state.partnerNames[0], autocomplete: "off" })
          ]),
          h("label", { class: "input-row" }, [
            "Partner B",
            h("input", { id: "partnerB", type: "text", maxlength: "18", value: state.partnerNames[1], autocomplete: "off" })
          ])
        ]),
        h("div", { class: "button-row" }, [
          h("button", {
            class: "big-button",
            type: "button",
            onclick: () => {
              const partnerA = document.getElementById("partnerA").value.trim();
              const partnerB = document.getElementById("partnerB").value.trim();
              state.partnerNames = [partnerA || "Partner A", partnerB || "Partner B"];
              renderPartnerMenu();
            }
          }, ["Start Partner Mode"]),
          h("button", { class: "text-button", type: "button", onclick: renderStart }, ["Back to menu"])
        ])
      ])
    ]);
  }

  function renderPartnerMenu() {
    ensureSelectedLevels();
    const canUseSelectedLevel = hasAllowedTimes(state.partnerLevel);
    renderScreen([
      makeHeader({
        mode: "Partner Mode",
        level: levelLabel(state.partnerLevel),
        score: `${state.partnerNames[0]} ${state.partnerScores[0]} | ${state.partnerNames[1]} ${state.partnerScores[1]}`
      }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-intro" }, [
          h("div", { class: "task-copy" }, [
            h("h1", { text: "Practise with a partner" }),
            h("p", { class: "instruction", text: "Choose a level and speak English together." })
          ]),
          h("button", { class: "text-button", type: "button", onclick: renderTeacherSettings }, ["Teacher Settings"])
        ]),
        renderScoreStrip(),
        h("div", { class: "button-row" }, LEVELS.map((level) => {
          const disabled = !hasAllowedTimes(level.id);
          return h("button", {
            class: `pill-button${state.partnerLevel === level.id ? " active" : ""}`,
            type: "button",
            disabled,
            onclick: () => {
              state.partnerLevel = level.id;
              renderPartnerMenu();
            }
          }, [`${level.name}: ${level.label}`]);
        })),
        !canUseSelectedLevel
          ? h("div", { class: "feedback almost" }, [
              h("strong", { text: "No times here yet." }),
              h("p", { text: "Turn on this level or time type in Teacher Settings." })
            ])
          : null,
        h("div", { class: "partner-grid" }, PARTNER_TASKS.map((task) => {
          const disabled = task.type === "speed" ? !hasAllowedTimes(state.partnerLevel) : !canUseSelectedLevel;
          return h("button", {
            class: "task-button",
            type: "button",
            disabled,
            onclick: () => startPartnerTask(task.type)
          }, [
            h("span", { class: "mode-tag", text: task.type === "speed" ? "Timer" : "Speaking" }),
            h("strong", { text: task.title }),
            h("span", { text: task.description })
          ]);
        }))
      ])
    ]);
  }

  function renderScoreStrip() {
    return h("div", { class: "score-strip" }, [0, 1].map((index) => h("div", {
      class: `score-card${state.partnerTurn === index ? " active" : ""}`
    }, [
      h("span", { class: "mode-tag", text: state.partnerTurn === index ? "Turn" : "Score" }),
      h("strong", { text: state.partnerNames[index] }),
      h("p", { class: "instruction", text: `${state.partnerScores[index]} points` })
    ])));
  }

  function startPartnerTask(type) {
    const totalMap = { say: 8, set: 8, guess: 6, correctWrong: 8, speed: 0, dialogue: 6 };
    state.current = {
      owner: "partner",
      type,
      level: state.partnerLevel,
      total: totalMap[type],
      round: 1,
      attempts: 0,
      answered: false,
      feedback: null,
      showHint: false,
      hintText: "",
      data: null
    };
    if (type === "speed") {
      prepareSpeedRound();
      renderPartnerSpeed();
      return;
    }
    preparePartnerRound();
    renderPartnerTask();
  }

  function preparePartnerRound() {
    const current = state.current;
    current.answered = false;
    current.feedback = null;
    current.showHint = false;
    current.hintText = "";
    if (current.type === "say") current.data = generatePartnerSayData();
    if (current.type === "set") current.data = generatePartnerSetData();
    if (current.type === "guess") current.data = generatePartnerGuessData();
    if (current.type === "correctWrong") current.data = generatePartnerCorrectWrongData();
    if (current.type === "dialogue") current.data = generateDialogueData();
  }

  function generatePartnerSayData() {
    const time = pickTime(state.current.level);
    return {
      time,
      correctPhrase: phraseFor(time.hour, time.minute),
      answerShown: false
    };
  }

  function generatePartnerSetData() {
    const target = pickTime(state.current.level);
    return {
      target,
      user: { hour: 12, minute: 0 },
      correctPhrase: phraseFor(target.hour, target.minute)
    };
  }

  function generatePartnerGuessData() {
    return {
      user: { hour: 12, minute: 0 },
      stage: "privacy",
      correctPhrase: phraseFor(12, 0)
    };
  }

  function generatePartnerCorrectWrongData() {
    const base = generateMistakeData(state.current.level);
    base.stage = "judge";
    base.partnerChoice = null;
    return base;
  }

  function generateDialogueData() {
    const card = sample(SITUATIONS);
    return {
      card,
      time: { hour: card.hour, minute: card.minute },
      correctPhrase: phraseFor(card.hour, card.minute)
    };
  }

  function renderPartnerTask() {
    const current = state.current;
    const task = PARTNER_TASKS.find((item) => item.type === current.type);
    renderScreen([
      makeHeader({
        mode: "Partner Mode",
        level: levelLabel(current.level),
        score: `${state.partnerNames[0]} ${state.partnerScores[0]} | ${state.partnerNames[1]} ${state.partnerScores[1]}`,
        progress: current.round,
        total: current.total
      }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-intro" }, [
          h("div", { class: "task-copy" }, [
            h("h2", { text: task.title }),
            h("p", { class: "instruction", text: task.description })
          ])
        ]),
        renderScoreStrip(),
        renderPartnerBody(),
        feedbackNode(current.feedback, "Speak first, then check together."),
        partnerActions(nextPartnerRound)
      ])
    ]);
  }

  function renderPartnerBody() {
    const type = state.current.type;
    if (type === "say") return renderPartnerSay();
    if (type === "set") return renderPartnerSet();
    if (type === "guess") return renderPartnerGuess();
    if (type === "correctWrong") return renderPartnerCorrectWrong();
    if (type === "dialogue") return renderPartnerDialogue();
    return h("div", {});
  }

  function renderPartnerSay() {
    const current = state.current;
    const data = current.data;
    const active = state.partnerTurn;
    const checker = 1 - active;
    return h("div", { class: "clock-area" }, [
      renderClockNode(data.time, { highlight: "both" }),
      h("div", { class: "control-panel" }, [
        h("div", { class: "turn-banner" }, [
          h("h2", { text: `${state.partnerNames[active]}: Say the time.` }),
          h("p", { text: `${state.partnerNames[checker]}: Check the answer.` })
        ]),
        data.answerShown
          ? h("div", { class: "large-phrase", text: data.correctPhrase })
          : h("button", {
              class: "big-button",
              type: "button",
              onclick: () => {
                data.answerShown = true;
                speak(data.correctPhrase);
                rerenderCurrentScreen();
              }
            }, ["Show answer"]),
        data.answerShown && !current.answered
          ? h("div", { class: "button-row" }, [
              h("button", { class: "big-button", type: "button", onclick: () => partnerCorrect(active, "Great!", `${state.partnerNames[active]} gets a point.`) }, ["Correct"]),
              h("button", { class: "text-button", type: "button", onclick: () => partnerNoPoint("Try again!", `Answer: ${data.correctPhrase}`) }, ["Try again"])
            ])
          : null
      ])
    ]);
  }

  function renderPartnerSet() {
    const current = state.current;
    const data = current.data;
    const reader = state.partnerTurn;
    const setter = 1 - reader;
    return h("div", { class: "clock-area" }, [
      h("div", {}, [
        renderClockNode(data.user, {
          interactive: !current.answered,
          highlight: "both",
          onChange: (time) => {
            data.user = { hour: time.hour, minute: time.minute };
          }
        }),
        h("p", { class: "interactive-note", text: "Set the clock. Minutes snap to 5." })
      ]),
      h("div", { class: "control-panel" }, [
        h("div", { class: "turn-banner" }, [
          h("h2", { text: `${state.partnerNames[reader]} reads.` }),
          h("p", { text: `${state.partnerNames[setter]} sets the clock.` })
        ]),
        h("div", { class: "large-phrase", text: data.correctPhrase }),
        h("div", { class: "control-grid" }, [
          h("button", { class: "control-button", type: "button", disabled: current.answered, onclick: () => changePartnerClock(0, 5) }, ["+5 minutes"]),
          h("button", { class: "control-button", type: "button", disabled: current.answered, onclick: () => changePartnerClock(0, -5) }, ["-5 minutes"]),
          h("button", { class: "control-button", type: "button", disabled: current.answered, onclick: () => changePartnerClock(1, 0) }, ["+1 hour"]),
          h("button", { class: "control-button", type: "button", disabled: current.answered, onclick: () => changePartnerClock(-1, 0) }, ["-1 hour"])
        ]),
        h("button", { class: "big-button", type: "button", disabled: current.answered, onclick: () => checkPartnerSet(setter) }, ["Check"])
      ])
    ]);
  }

  function changePartnerClock(hourDelta, minuteDelta) {
    const data = state.current.data;
    const totalMinutes = (normaliseHour(data.user.hour) % 12) * 60 + data.user.minute + hourDelta * 60 + minuteDelta;
    const wrapped = ((totalMinutes % 720) + 720) % 720;
    const hour = Math.floor(wrapped / 60);
    const minute = wrapped % 60;
    data.user = { hour: hour === 0 ? 12 : hour, minute };
    rerenderCurrentScreen();
  }

  function checkPartnerSet(setterIndex) {
    const current = state.current;
    const data = current.data;
    const hourOk = normaliseHour(data.user.hour) === normaliseHour(data.target.hour);
    const minuteOk = normaliseMinute(data.user.minute) === normaliseMinute(data.target.minute);
    if (hourOk && minuteOk) {
      partnerCorrect(setterIndex, "Great!", `${state.partnerNames[setterIndex]} gets a point.`);
    } else {
      data.user = { hour: data.target.hour, minute: data.target.minute };
      partnerNoPoint("Almost!", `Correct answer: ${data.correctPhrase}`);
    }
  }

  function renderPartnerGuess() {
    const current = state.current;
    const data = current.data;
    const setter = state.partnerTurn;
    const guesser = 1 - setter;

    if (data.stage === "privacy") {
      return h("div", { class: "clock-area" }, [
        h("div", {}, [
          renderClockNode(data.user, {
            interactive: true,
            highlight: "both",
            onChange: (time) => {
              data.user = { hour: time.hour, minute: time.minute };
              data.correctPhrase = phraseFor(time.hour, time.minute);
            }
          }),
          h("p", { class: "interactive-note", text: "Set a secret time. Minutes snap to 5." })
        ]),
        h("div", { class: "control-panel" }, [
          h("div", { class: "turn-banner" }, [
            h("h2", { text: `${state.partnerNames[guesser]}, look away!` }),
            h("p", { text: `${state.partnerNames[setter]} secretly sets the clock.` })
          ]),
          h("button", {
            class: "big-button",
            type: "button",
            onclick: () => {
              data.stage = "ask";
              rerenderCurrentScreen();
            }
          }, ["Ready"])
        ])
      ]);
    }

    return h("div", { class: "clock-area" }, [
      renderClockNode(data.user, { highlight: "both" }),
      h("div", { class: "control-panel" }, [
        h("div", { class: "turn-banner" }, [
          h("h2", { text: `${state.partnerNames[guesser]}: What time is it?` }),
          h("p", { text: `${state.partnerNames[setter]} answers: It's ...` })
        ]),
        data.stage === "reveal" ? h("div", { class: "large-phrase", text: data.correctPhrase }) : null,
        data.stage === "ask"
          ? h("button", {
              class: "big-button",
              type: "button",
              onclick: () => {
                data.stage = "reveal";
                speak(data.correctPhrase);
                rerenderCurrentScreen();
              }
            }, ["Reveal time"])
          : null,
        data.stage === "reveal" && !current.answered
          ? h("div", { class: "button-row" }, [
              h("button", { class: "big-button", type: "button", onclick: () => partnerCorrect(setter, "Nice speaking!", `${state.partnerNames[setter]} gets a point.`) }, [`Point for ${state.partnerNames[setter]}`]),
              h("button", { class: "text-button", type: "button", onclick: () => partnerCorrect(guesser, "Good question!", `${state.partnerNames[guesser]} gets a point.`) }, [`Point for ${state.partnerNames[guesser]}`]),
              h("button", { class: "ghost-button", type: "button", onclick: () => partnerNoPoint("Good practice.", `Answer: ${data.correctPhrase}`) }, ["No point"])
            ])
          : null
      ])
    ]);
  }

  function renderPartnerCorrectWrong() {
    const current = state.current;
    const data = current.data;
    const active = state.partnerTurn;
    const checker = 1 - active;

    const choiceButtons = data.stage === "judge"
      ? h("div", { class: "option-grid" }, [
          h("button", { class: "option-button", type: "button", disabled: current.answered, onclick: () => partnerJudgeCorrectWrong(true) }, ["Correct"]),
          h("button", { class: "option-button", type: "button", disabled: current.answered, onclick: () => partnerJudgeCorrectWrong(false) }, ["Wrong"])
        ])
      : h("div", { class: "control-panel" }, [
          h("p", { class: "instruction", text: `${state.partnerNames[checker]}: Say the correct sentence.` }),
          data.stage === "reveal" ? h("div", { class: "large-phrase", text: data.correctPhrase }) : null,
          data.stage === "correction"
            ? h("button", {
                class: "big-button",
                type: "button",
                onclick: () => {
                  data.stage = "reveal";
                  speak(data.correctPhrase);
                  rerenderCurrentScreen();
                }
              }, ["Reveal answer"])
            : null,
          data.stage === "reveal" && !current.answered
            ? h("div", { class: "button-row" }, [
                h("button", { class: "big-button", type: "button", onclick: () => partnerCorrect(checker, "Great correction!", `${state.partnerNames[checker]} gets a point.`) }, ["Correction was correct"]),
                h("button", { class: "text-button", type: "button", onclick: () => partnerNoPoint("Good practice.", `Answer: ${data.correctPhrase}`) }, ["Try again"])
              ])
            : null
        ]);

    return h("div", { class: "clock-area" }, [
      renderClockNode(data.time, { highlight: "both" }),
      h("div", { class: "control-panel" }, [
        h("div", { class: "turn-banner" }, [
          h("h2", { text: `${state.partnerNames[active]}: Correct or wrong?` }),
          h("p", { text: `${state.partnerNames[checker]} corrects it if it is wrong.` })
        ]),
        h("div", { class: "large-phrase", text: data.shownPhrase }),
        choiceButtons
      ])
    ]);
  }

  function partnerJudgeCorrectWrong(saysCorrect) {
    const current = state.current;
    const data = current.data;
    const active = state.partnerTurn;

    if (saysCorrect === data.isCorrect && data.isCorrect) {
      partnerCorrect(active, "Great!", `Correct. ${state.partnerNames[active]} gets a point.`);
      return;
    }

    if (saysCorrect === data.isCorrect && !data.isCorrect) {
      state.partnerScores[active] += 1;
      data.stage = "correction";
      current.feedback = {
        type: "correct",
        title: "Good check.",
        message: `${state.partnerNames[active]} gets a point. Now correct the sentence together.`
      };
      playTone("correct");
      renderPartnerTask();
      return;
    }

    partnerNoPoint("Try again!", `Answer: ${data.isCorrect ? "Correct." : `Wrong. ${data.correctPhrase}`}`);
  }

  function renderPartnerDialogue() {
    const current = state.current;
    const data = current.data;
    const active = state.partnerTurn;
    const other = 1 - active;
    return h("div", { class: "clock-area" }, [
      renderClockNode(data.time, { highlight: "both" }),
      h("div", { class: "control-panel" }, [
        h("div", { class: "turn-banner" }, [
          h("h2", { text: data.card.title }),
          h("p", { text: `${state.partnerNames[active]} and ${state.partnerNames[other]} read or create a short dialogue.` })
        ]),
        h("div", { class: "large-phrase", text: data.correctPhrase }),
        h("pre", { class: "dialogue", text: data.card.support }),
        !current.answered
          ? h("div", { class: "button-row" }, [
              h("button", { class: "big-button", type: "button", onclick: () => partnerCorrect(active, "Nice dialogue!", `${state.partnerNames[active]} gets a speaking point.`) }, ["Good speaking"]),
              h("button", {
                class: "text-button",
                type: "button",
                onclick: () => {
                  current.data = generateDialogueData();
                  rerenderCurrentScreen();
                }
              }, ["New card"])
            ])
          : null
      ])
    ]);
  }

  function prepareSpeedRound() {
    const current = state.current;
    const time = pickTime(current.level);
    current.data = {
      time,
      correctPhrase: phraseFor(time.hour, time.minute),
      remaining: state.settings.timer ? 60 : null,
      started: false,
      paused: false,
      rounds: 0,
      maxRounds: 10
    };
    current.feedback = null;
  }

  function renderPartnerSpeed() {
    const current = state.current;
    const data = current.data;
    renderScreen([
      makeHeader({
        mode: "Partner Mode",
        level: levelLabel(current.level),
        score: `${state.partnerNames[0]} ${state.partnerScores[0]} | ${state.partnerNames[1]} ${state.partnerScores[1]}`,
        progress: state.settings.timer ? 1 : data.rounds + 1,
        total: state.settings.timer ? 1 : data.maxRounds
      }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-intro" }, [
          h("div", { class: "task-copy" }, [
            h("h2", { text: "Speed Round" }),
            h("p", { class: "instruction", text: state.settings.timer ? "60 seconds. Take turns saying the time." : "Timer is off. Play 10 fast turns." })
          ]),
          state.settings.timer ? h("div", { id: "speedTimer", class: "timer", text: String(data.remaining) }) : null
        ]),
        renderScoreStrip(),
        data.started ? renderSpeedPlayArea() : h("div", { class: "summary-panel" }, [
          h("h2", { text: "Ready?" }),
          h("p", { class: "instruction", text: "Keep the pace quick, but speak clearly." }),
          h("button", {
            class: "big-button",
            type: "button",
            onclick: () => {
              data.started = true;
              if (state.settings.timer) startSpeedTimer();
              renderPartnerSpeed();
            }
          }, ["Start"])
        ]),
        feedbackNode(current.feedback, "Say the time, then tap Correct or Try again.")
      ])
    ], { keepTimer: data.started && state.settings.timer });
  }

  function renderSpeedPlayArea() {
    const current = state.current;
    const data = current.data;
    const active = state.partnerTurn;
    return h("div", { class: "clock-area" }, [
      renderClockNode(data.time, { highlight: "both" }),
      h("div", { class: "control-panel" }, [
        h("div", { class: "turn-banner" }, [
          h("h2", { text: `Now: ${state.partnerNames[active]}` }),
          h("p", { text: "Say the time. Your partner checks." })
        ]),
        h("div", { class: "button-row" }, [
          h("button", { class: "big-button", type: "button", onclick: () => speedAnswer(true) }, ["Correct"]),
          h("button", { class: "text-button", type: "button", onclick: () => speedAnswer(false) }, ["Try again"]),
          state.settings.timer ? h("button", {
            id: "pauseSpeed",
            class: "ghost-button",
            type: "button",
            onclick: () => {
              data.paused = !data.paused;
              const button = document.getElementById("pauseSpeed");
              if (button) button.textContent = data.paused ? "Resume" : "Pause";
            }
          }, [data.paused ? "Resume" : "Pause"]) : null
        ])
      ])
    ]);
  }

  function startSpeedTimer() {
    stopSpeedTimer();
    state.speedTimerId = window.setInterval(() => {
      const current = state.current;
      if (!current || current.type !== "speed") return;
      const data = current.data;
      if (!data.started || data.paused) return;
      data.remaining -= 1;
      const timer = document.getElementById("speedTimer");
      if (timer) timer.textContent = String(Math.max(0, data.remaining));
      if (data.remaining <= 0) {
        stopSpeedTimer();
        renderPartnerSpeedSummary();
      }
    }, 1000);
  }

  function stopSpeedTimer() {
    if (state.speedTimerId) {
      window.clearInterval(state.speedTimerId);
      state.speedTimerId = null;
    }
  }

  function speedAnswer(correct) {
    const current = state.current;
    const data = current.data;
    const active = state.partnerTurn;
    if (correct) {
      state.partnerScores[active] += 1;
      current.feedback = {
        type: "correct",
        title: "Great!",
        message: `${state.partnerNames[active]} gets a point.`
      };
      playTone("correct");
    } else {
      current.feedback = {
        type: "almost",
        title: "Try again!",
        message: `Answer: ${data.correctPhrase}`
      };
      playTone("wrong");
    }

    state.partnerTurn = 1 - state.partnerTurn;
    const nextTime = pickTime(current.level);
    data.time = nextTime;
    data.correctPhrase = phraseFor(nextTime.hour, nextTime.minute);
    data.rounds += 1;

    if (!state.settings.timer && data.rounds >= data.maxRounds) {
      renderPartnerSpeedSummary();
      return;
    }
    renderPartnerSpeed();
  }

  function renderPartnerSpeedSummary() {
    stopSpeedTimer();
    const leader = state.partnerScores[0] === state.partnerScores[1]
      ? "Team draw."
      : `${state.partnerNames[state.partnerScores[0] > state.partnerScores[1] ? 0 : 1]} is leading.`;
    celebrate(18);
    renderScreen([
      makeHeader({
        mode: "Partner Mode",
        level: levelLabel(state.current.level),
        score: `${state.partnerNames[0]} ${state.partnerScores[0]} | ${state.partnerNames[1]} ${state.partnerScores[1]}`
      }),
      h("section", { class: "summary-panel" }, [
        h("h1", { text: "Speed Round finished" }),
        h("h2", { text: leader }),
        renderScoreStrip(),
        h("div", { class: "button-row" }, [
          h("button", { class: "big-button", type: "button", onclick: () => startPartnerTask("speed") }, ["Play again"]),
          h("button", { class: "text-button", type: "button", onclick: renderPartnerMenu }, ["Partner task menu"])
        ])
      ])
    ]);
  }

  function partnerCorrect(scoreIndex, title, message) {
    state.partnerScores[scoreIndex] += 1;
    state.current.answered = true;
    state.current.feedback = { type: "correct", title, message };
    playTone("correct");
    renderPartnerTask();
  }

  function partnerNoPoint(title, message) {
    state.current.answered = true;
    state.current.feedback = { type: "almost", title, message };
    playTone("wrong");
    renderPartnerTask();
  }

  function nextPartnerRound() {
    const current = state.current;
    if (current.round >= current.total) {
      renderPartnerSummary();
      return;
    }
    state.partnerTurn = 1 - state.partnerTurn;
    current.round += 1;
    preparePartnerRound();
    renderPartnerTask();
  }

  function renderPartnerSummary() {
    celebrate(18);
    const current = state.current;
    renderScreen([
      makeHeader({
        mode: "Partner Mode",
        level: levelLabel(current.level),
        score: `${state.partnerNames[0]} ${state.partnerScores[0]} | ${state.partnerNames[1]} ${state.partnerScores[1]}`
      }),
      h("section", { class: "summary-panel" }, [
        h("h1", { text: "Partner task complete" }),
        h("p", { class: "subtitle", text: "Good speaking practice." }),
        renderScoreStrip(),
        h("div", { class: "button-row" }, [
          h("button", { class: "big-button", type: "button", onclick: () => startPartnerTask(current.type) }, ["Try again"]),
          h("button", { class: "text-button", type: "button", onclick: renderPartnerMenu }, ["Partner task menu"])
        ])
      ])
    ]);
  }

  function renderTeacherSettings() {
    renderScreen([
      makeHeader({ mode: "Teacher Settings", score: "Local settings only" }),
      h("section", { class: "task-card" }, [
        h("div", { class: "task-copy" }, [
          h("h1", { text: "Teacher Settings" }),
          h("p", { class: "instruction", text: "Choose levels, time forms, scaffolding, audio, and timer options. Nothing is saved online." })
        ]),
        h("div", { class: "settings-grid" }, [
          h("section", { class: "settings-panel" }, [
            h("h2", { text: "Levels" }),
            h("div", { class: "check-list" }, LEVELS.map((level) => settingCheckbox(
              `level-${level.id}`,
              `${level.name}: ${level.label}`,
              state.settings.levels[level.id],
              (checked) => {
                state.settings.levels[level.id] = checked;
                ensureSelectedLevels();
                renderTeacherSettings();
              }
            )))
          ]),
          h("section", { class: "settings-panel" }, [
            h("h2", { text: "Time types" }),
            h("div", { class: "check-list" }, [
              settingCheckbox("type-oclock", "o'clock", state.settings.timeTypes.oclock, (checked) => {
                state.settings.timeTypes.oclock = checked;
                renderTeacherSettings();
              }),
              settingCheckbox("type-half", "half past", state.settings.timeTypes.half, (checked) => {
                state.settings.timeTypes.half = checked;
                renderTeacherSettings();
              }),
              settingCheckbox("type-quarter", "quarter past / quarter to", state.settings.timeTypes.quarter, (checked) => {
                state.settings.timeTypes.quarter = checked;
                renderTeacherSettings();
              }),
              settingCheckbox("type-five", "five-minute intervals", state.settings.timeTypes.five, (checked) => {
                state.settings.timeTypes.five = checked;
                renderTeacherSettings();
              })
            ])
          ]),
          h("section", { class: "settings-panel" }, [
            h("h2", { text: "Mode" }),
            h("div", { class: "button-row" }, [
              h("button", {
                class: `pill-button${state.settings.difficulty === "easy" ? " active" : ""}`,
                type: "button",
                onclick: () => {
                  state.settings.difficulty = "easy";
                  state.settings.timeTypes = { oclock: true, half: true, quarter: true, five: false };
                  ensureSelectedLevels();
                  renderTeacherSettings();
                }
              }, ["Easy mode"]),
              h("button", {
                class: `pill-button${state.settings.difficulty === "mixed" ? " active" : ""}`,
                type: "button",
                onclick: () => {
                  state.settings.difficulty = "mixed";
                  state.settings.timeTypes.five = true;
                  ensureSelectedLevels();
                  renderTeacherSettings();
                }
              }, ["Mixed mode"])
            ]),
            h("p", { class: "instruction", text: state.settings.difficulty === "easy" ? "Easy mode uses o'clock, half past, quarter past, and quarter to with more scaffolding." : "Mixed mode includes all selected time forms with less scaffolding." })
          ]),
          h("section", { class: "settings-panel" }, [
            h("h2", { text: "Look" }),
            h("div", { class: "button-row" }, [
              h("button", {
                class: `pill-button${state.settings.theme === "light" ? " active" : ""}`,
                type: "button",
                onclick: () => {
                  state.settings.theme = "light";
                  renderTeacherSettings();
                }
              }, ["Light mode"]),
              h("button", {
                class: `pill-button${state.settings.theme === "dark" ? " active" : ""}`,
                type: "button",
                onclick: () => {
                  state.settings.theme = "dark";
                  renderTeacherSettings();
                }
              }, ["Dark mode"])
            ]),
            h("p", { class: "instruction", text: "Dark mode keeps the classroom glow, but reduces screen brightness." })
          ]),
          h("section", { class: "settings-panel" }, [
            h("h2", { text: "Classroom tools" }),
            h("div", { class: "check-list" }, [
              settingCheckbox("audio", "Enable audio", state.settings.audio, (checked) => {
                state.settings.audio = checked;
                if (!checked && "speechSynthesis" in window) window.speechSynthesis.cancel();
                renderTeacherSettings();
              }),
              settingCheckbox("timer", "Enable timer", state.settings.timer, (checked) => {
                state.settings.timer = checked;
                renderTeacherSettings();
              })
            ]),
            h("button", {
              class: "danger-button",
              type: "button",
              onclick: () => {
                state.soloScore = 0;
                state.partnerScores = [0, 0];
                renderTeacherSettings();
              }
            }, ["Reset scores"])
          ])
        ]),
        h("div", { class: "feedback empty" }, [
          h("strong", { text: "Teacher instructions" }),
          h("p", { text: "Choose Solo Mode or Partner Mode. Start with easy levels. Use Partner Mode for speaking practice. Use Final Challenge for checking progress." })
        ]),
        h("div", { class: "button-row" }, [
          h("button", { class: "big-button", type: "button", onclick: renderStart }, ["Back to menu"])
        ])
      ])
    ]);
  }

  function settingCheckbox(id, label, checked, onChange) {
    return h("label", { class: "check-row", for: id }, [
      h("input", {
        id,
        type: "checkbox",
        checked,
        onchange: (event) => onChange(event.target.checked)
      }),
      h("span", { text: label })
    ]);
  }

  function rerenderCurrentScreen() {
    if (!state.current) {
      renderStart();
      return;
    }
    if (state.current.owner === "solo") {
      renderSoloTask();
      return;
    }
    if (state.current.type === "speed") {
      renderPartnerSpeed();
      return;
    }
    renderPartnerTask();
  }

  function goHome() {
    stopSpeedTimer();
    state.current = null;
    renderStart();
  }

  renderStart();
}());
