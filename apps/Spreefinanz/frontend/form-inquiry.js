(function () {
  document.addEventListener(
    "submit",
    function (ev) {
      var form = ev.target;
      if (
        !form ||
        form.tagName !== "FORM" ||
        !form.classList ||
        !form.classList.contains("checkform")
      ) {
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();

      var fd = new FormData(form);
      fetch("/api/inquiry", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) {
            return res.text().then(function (t) {
              throw new Error(t || "HTTP " + res.status);
            });
          }
          return res.json();
        })
        .then(function () {
          if (typeof alert === "function") {
            alert(
              "Ihre Nachricht wurde übermittelt. Wir melden uns bei Ihnen."
            );
          }
          try {
            form.reset();
          } catch (e) {}
        })
        .catch(function () {
          if (typeof alert === "function") {
            alert(
              "Senden fehlgeschlagen. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch."
            );
          }
        });
    },
    true
  );
})();
