/* deepti.xyz: scroll-aware video, nav brand, interactive previews,
   scroll lane-line, and one rickshaw. */

(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- videos: play in view, pause out of view ---- */
  var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-scrollplay]"));
  if (reducedMotion) {
    videos.forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
      v.setAttribute("controls", "");
    });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.play().catch(function () {}); }
        else { e.target.pause(); }
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { io.observe(v); });
  }

  /* ---- nav + scroll cue: the first screen stays just the intro ---- */
  var nav = document.querySelector(".nav");
  var h1 = document.getElementById("about-title");
  if (nav && h1 && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var gone = !entries[0].isIntersecting;
      nav.classList.toggle("scrolled", gone);
      document.body.classList.toggle("scrolled-away", gone);
    }, { rootMargin: "-56px 0px 0px 0px" }).observe(h1);
  }

  /* ---- the car rides the lane, paints the road behind it, and smokes ---- */
  var rider = document.getElementById("lane-rider");
  var trail = document.getElementById("lane-trail");
  if (rider) {
    var carTop = 24;
    var goingUp = false;
    var lastScroll = 0;
    var lastScrollY = window.scrollY;

    var travel = function () {
      goingUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;
      lastScroll = Date.now();
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      carTop = 24 + pct * (window.innerHeight - 100);
      rider.style.top = carTop + "px";
      if (trail) { trail.style.height = (carTop + 18) + "px"; }
    };
    window.addEventListener("scroll", travel, { passive: true });
    window.addEventListener("resize", travel);
    travel();

    /* smoke: a cloud puff from the tailpipe, drifting up and evaporating.
       The tailpipe is the car's upper edge, since it is nosed downhill. */
    if (!reducedMotion) {
      var smoke = function () {
        if (window.innerWidth <= 1040 || document.hidden) return;
        if (goingUp && Date.now() - lastScroll < 500) return;
        var puff = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        puff.setAttribute("viewBox", "0 0 30 22");
        puff.setAttribute("width", "36");
        puff.setAttribute("height", "26");
        puff.setAttribute("fill", "none");
        puff.setAttribute("aria-hidden", "true");
        puff.classList.add("puff");
        puff.innerHTML =
          '<g stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" ' +
          'stroke-linecap="round">' +
          '<path d="M8.5 15.5c-3.4 0-5.2-1.9-4.6-4.4.5-2.2 2.6-3 4.4-2.6.2-2.8 2.4-4.6 ' +
          '5.2-4.3 2 .2 3.5 1.4 4.2 3.1 2.6-.9 5.2.4 5.8 2.7.7 2.7-1.3 5.5-4.6 5.5z"/>' +
          '<path d="M21.5 19.2c-1.9 0-2.6-1.1-2.2-2.3.3-1 1.3-1.5 2.3-1.2"/>' +
          '</g>';
        puff.style.left = "23px";
        /* the car spans carTop-13 to carTop+48 once rotated; sit the puff's
           bottom edge on that rear edge so it trails the car, never covers it */
        puff.style.top = (carTop - 39) + "px";
        document.body.appendChild(puff);
        puff.addEventListener("animationend", function () { puff.remove(); });
      };
      setInterval(smoke, 900);
      smoke();
    }
  }

  /* ---- DashCop: violation toggle + e-ticket readout ---- */
  var demoVideo = document.getElementById("demo-video");
  var ticketType = document.getElementById("ticket-type");
  var ticketDetail = document.getElementById("ticket-detail");
  var demoChips = Array.prototype.slice.call(document.querySelectorAll(".demo-controls .chip"));
  demoChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (chip.getAttribute("aria-pressed") === "true") return;
      demoChips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      chip.setAttribute("aria-pressed", "true");
      ticketType.textContent = chip.getAttribute("data-ticket");
      ticketDetail.textContent = chip.getAttribute("data-detail");
      if (demoVideo) {
        demoVideo.setAttribute("poster", chip.getAttribute("data-poster"));
        demoVideo.src = chip.getAttribute("data-src");
        if (!reducedMotion) { demoVideo.play().catch(function () {}); }
      }
    });
  });

  /* ---- RoadSocial: benchmark question chips ---- */
  var qaAnswer = document.getElementById("qa-answer-text");
  var qaChips = Array.prototype.slice.call(document.querySelectorAll(".qa-chips .chip"));
  qaChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      qaChips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
      chip.setAttribute("aria-pressed", "true");
      qaAnswer.textContent = chip.getAttribute("data-answer");
    });
  });

  /* ---- Email button: copy the address instead of opening a mail client ---- */
  var mailBtn = document.getElementById("copy-mail");
  if (mailBtn) {
    var tip = mailBtn.querySelector(".tip");
    var status = document.getElementById("copy-status");
    var resetTip = null;

    var fallbackCopy = function (text) {
      var box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      box.remove();
      return ok;
    };

    var reset = function () {
      clearTimeout(resetTip);
      tip.textContent = "Email";
      mailBtn.classList.remove("copied");
      if (status) { status.textContent = ""; }
    };

    var settle = function (copied, email) {
      tip.textContent = copied ? "Copied to clipboard" : email;
      mailBtn.classList.add("copied");
      if (status) { status.textContent = copied ? "Email address copied to clipboard" : email; }
      clearTimeout(resetTip);
      resetTip = setTimeout(reset, 2200);
    };

    /* pointer or focus leaves: drop the confirmation straight away */
    mailBtn.addEventListener("mouseleave", reset);
    mailBtn.addEventListener("blur", reset);

    mailBtn.addEventListener("click", function () {
      var email = mailBtn.getAttribute("data-email");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          settle(true, email);
        }).catch(function () {
          settle(fallbackCopy(email), email);
        });
      } else {
        settle(fallbackCopy(email), email);
      }
    });
  }

  /* ---- myEye2Wheeler: guess where the rider looked ---- */
  var quiz = document.getElementById("gaze-quiz");
  if (quiz) {
    var truth = { x: 40.5, y: 58.2 };           // gaze point, % of frame
    var truthMark = document.getElementById("gaze-truth");
    var guessMark = document.getElementById("gaze-guess");
    var quizText = document.getElementById("gaze-readout-text");
    var quizLabel = document.getElementById("gaze-readout-label");

    var reveal = function (gx, gy) {
      guessMark.style.left = gx + "%";
      guessMark.style.top = gy + "%";
      truthMark.style.left = truth.x + "%";
      truthMark.style.top = truth.y + "%";
      guessMark.classList.add("show");
      truthMark.classList.add("show");
      var d = Math.hypot(gx - truth.x, gy - truth.y);
      quizLabel.textContent = d < 12 ? "Close" : "Not quite";
      quizText.textContent = d < 12
        ? "That's about where they looked: at the scooter rider ahead, not the road surface or the signage."
        : "The rider was watching the scooter ahead (red). Riders in dense mixed traffic track other two-wheelers far more than saliency models predict.";
    };

    quiz.addEventListener("click", function (e) {
      var r = quiz.getBoundingClientRect();
      reveal(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    });
    quiz.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(50, 50); }
    });
  }
})();
