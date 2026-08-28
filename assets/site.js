/* deepti.xyz: scroll-aware video, nav brand, interactive previews,
   scroll lane-line, and one rickshaw. */

(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* A refresh should start the ride at the top of the road rather than wherever
     the browser remembers being. Back and forward are left alone — losing your
     place on the way back from a paper link would be worse than the tidy start
     is good — and so is any visit carrying an #anchor. */
  var navType = "navigate";
  try {
    var entry = performance.getEntriesByType("navigation")[0];
    if (entry && entry.type) {
      navType = entry.type;
    } else if (performance.navigation) {
      navType = performance.navigation.type === 1 ? "reload"
              : performance.navigation.type === 2 ? "back_forward" : "navigate";
    }
  } catch (e) { /* no navigation timing: treat as an ordinary visit */ }

  if (navType !== "back_forward" && !window.location.hash) {
    if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }
    /* instant, or the page would glide down from wherever it was restored */
    try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }
    catch (e2) { window.scrollTo(0, 0); }
  }

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

  /* ---- the car rides the road, paints it behind, smokes, and lights the
         roadside sign for whichever section it is currently inside ---- */
  var rider = document.getElementById("lane-rider");
  var trail = document.getElementById("lane-trail");

  /* Who is on the road this visit. It alternates rather than picking at random,
     so a refresh always changes the vehicle instead of sometimes repeating; the
     very first visit picks a side by coin toss so newcomers do not all meet the
     same one. Storage is wrapped because private windows can throw on access. */
  if (rider) {
    var ride;
    try {
      var last = window.localStorage.getItem("dxyz-ride");
      ride = last === "car" ? "scooter" : (last === "scooter" ? "car"
             : (Math.random() < 0.5 ? "scooter" : "car"));
      window.localStorage.setItem("dxyz-ride", ride);
    } catch (e) {
      ride = Math.random() < 0.5 ? "scooter" : "car";
    }
    rider.classList.toggle("ride-car", ride === "car");
  }

  /* the stretch of road the car uses, held clear of both viewport edges so the
     first and last signs are never flush against them */
  var TRACK_TOP = 56;
  var TRACK_TAIL = 74;
  var trackY = function (fraction) {
    return TRACK_TOP + fraction * (window.innerHeight - TRACK_TOP - TRACK_TAIL);
  };
  var clamp01 = function (n) { return Math.min(1, Math.max(0, n)); };

  /* each sign is posted where its section sits along the road */
  var signs = Array.prototype.slice.call(document.querySelectorAll(".nav .signs li"))
    .map(function (li) {
      var href = li.querySelector("a").getAttribute("href");
      return { li: li, section: document.querySelector(href), km: li.querySelector(".km") };
    })
    .filter(function (s) { return s.section; });

  /* One pixel of scroll is one metre of road, so the page is its own route:
     about 4km of it today, and longer every time a paper is added. Signs read
     in metres up close and kilometres beyond that, as road signs do. */
  var roadDistance = function (px) {
    var m = Math.abs(px);
    /* cut over at 975 so nothing ever rounds up to a silly "1000 m" */
    if (m < 975) { return Math.max(50, Math.round(m / 50) * 50) + " m"; }
    return (m / 1000).toFixed(1) + " km";
  };

  var placeSigns = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    signs.forEach(function (s) {
      var box = s.section.getBoundingClientRect();
      /* the scroll position that centres this section, expressed the same way
         the car reads its own position, so a sign and the car meet exactly
         when you arrive at that section */
      var mid = box.top + window.scrollY + box.height / 2;
      var at = max > 0 ? clamp01((mid - window.innerHeight / 2) / max) : 0;
      s.li.style.top = trackY(at) + "px";
    });
  };

  if (rider) {
    var carTop = TRACK_TOP;
    var goingUp = false;
    var lastScroll = 0;
    var lastScrollY = window.scrollY;

    /* the gaze cone follows the smoke's rule: gone while you scroll back up,
       back 500ms after you settle */
    var gazeTimer = null;
    var setGaze = function () {
      var reversing = goingUp && Date.now() - lastScroll < 500;
      rider.classList.toggle("reversing", reversing);
      clearTimeout(gazeTimer);
      if (reversing) { gazeTimer = setTimeout(setGaze, 520); }
    };

    var markHere = function () {
      var nose = carTop;          /* carTop is the rider's centre */
      var here = null;
      /* sections are in document order, so the last one the car has driven
         into is the one it is in; this also keeps News lit over the footer */
      signs.forEach(function (s) {
        s.ahead = s.section.getBoundingClientRect().top - nose;
        if (s.ahead <= 0) { here = s; }
      });
      signs.forEach(function (s) {
        var on = s === here;
        s.li.classList.toggle("here", on);
        /* distance is measured from the car to where that section starts, the
           same line that decides which sign is lit, so it reads zero exactly
           as the board turns amber */
        if (s.km) { s.km.textContent = on ? "here" : roadDistance(s.ahead); }
      });
    };

    var travel = function () {
      goingUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;
      lastScroll = Date.now();
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? clamp01(window.scrollY / max) : 0;
      carTop = trackY(pct);
      rider.style.top = carTop + "px";
      /* the painted road runs up to just past the rider, who covers the join */
      if (trail) { trail.style.height = (carTop + 4) + "px"; }
      markHere();
      setGaze();
    };
    window.addEventListener("scroll", travel, { passive: true });
    window.addEventListener("resize", function () { placeSigns(); travel(); });
    window.addEventListener("load", function () { placeSigns(); travel(); });
    placeSigns();
    travel();

    /* smoke: a cloud puff from the tailpipe, drifting up and evaporating.
       The tailpipe is the car's upper edge, since it is nosed downhill. */
    if (!reducedMotion) {
      var smoke = function () {
        if (window.innerWidth <= 1040 || document.hidden) return;
        if (goingUp && Date.now() - lastScroll < 500) return;
        var puff = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        puff.setAttribute("viewBox", "0 0 30 30");
        puff.setAttribute("width", "32");
        puff.setAttribute("height", "32");
        puff.setAttribute("fill", "none");
        puff.setAttribute("aria-hidden", "true");
        puff.classList.add("puff");
        /* an exhaust plume, not a cloud: it leaves the pipe as a thin tapered
           tail and blooms into lobes at the far end */
        puff.innerHTML =
          '<path stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" ' +
          'stroke-linecap="round" d="M13.5 28C15.5 26 16.5 24.4 17.2 22.1' +
          'A5 5 0 0 0 23.5 15A5.4 5.4 0 0 0 20.5 5.1A5 5 0 0 0 11.5 3.7' +
          'A5.8 5.8 0 0 0 7 14A3.6 3.6 0 0 0 10.4 20.3C11 23 12.6 26.2 13.5 28Z"/>';
        /* a scooter's pipe is off to the right, not on the centreline */
        puff.style.left = "41px";
        /* carTop is the rider's centre, so the rear wheel's top edge sits at
           carTop-25.6; drop the plume's tail exactly there */
        puff.style.top = (carTop - 55) + "px";
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

    var relabel = null;

    var reset = function () {
      clearTimeout(resetTip);
      mailBtn.classList.remove("copied", "said");
      if (status) { status.textContent = ""; }
      /* let the confirmation finish fading before the label swaps back */
      clearTimeout(relabel);
      relabel = setTimeout(function () { tip.textContent = "Email"; }, 360);
    };

    var settle = function (copied, email) {
      clearTimeout(relabel);
      tip.textContent = copied ? "Copied to clipboard" : email;
      mailBtn.classList.remove("said");
      mailBtn.classList.add("copied");
      if (status) { status.textContent = copied ? "Email address copied to clipboard" : email; }
      clearTimeout(resetTip);
      /* fade the confirmation away on its own, then hold quiet: only leaving
         and hovering again brings the "Email" label back */
      resetTip = setTimeout(function () {
        mailBtn.classList.remove("copied");
        mailBtn.classList.add("said");
      }, 1700);
    };

    /* pointer or focus leaves: stand down, ready to label again on the next hover */
    mailBtn.addEventListener("mouseleave", reset);
    mailBtn.addEventListener("blur", reset);
    mailBtn.addEventListener("mouseenter", function () {
      if (!mailBtn.classList.contains("copied")) {
        clearTimeout(relabel);
        tip.textContent = "Email";
      }
    });

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
