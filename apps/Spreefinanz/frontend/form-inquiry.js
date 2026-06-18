(function () {
  var MAX_ATTACHMENTS = 5;
  var MAX_FILE_BYTES = 5 * 1024 * 1024;
  var MAX_TOTAL_BYTES = 15 * 1024 * 1024;

  var SUCCESS_HTML =
    "<h2>Anfrage erfolgreich</h2>" +
    "<p>Zur Bestätigung haben wir Ihnen eine E-Mail mit Ihren Angaben gesendet.</p>" +
    "<p>Wir werden uns in Kürze mit Ihnen in Verbindung setzen.</p>";

  function showFormAlert(html) {
    if (typeof alert === "function" && document.getElementById("cmhp_alert")) {
      alert(html);
      return;
    }
    var mask = document.querySelector(".alert_mask");
    var content = document.querySelector("#cmhp_alert .alert_content");
    if (mask && content) {
      content.innerHTML = html;
      mask.style.display = "";
      mask.style.opacity = "1";
      return;
    }
    if (typeof window.alert === "function") {
      var tmp = document.createElement("div");
      tmp.innerHTML = html;
      window.alert(tmp.textContent || tmp.innerText || html);
    }
  }

  function ensureAlertOverlay() {
    if (document.getElementById("cmhp_alert")) {
      return;
    }
    var mask = document.createElement("div");
    mask.className = "alert_mask";
    mask.style.display = "none";
    mask.innerHTML =
      '<div class="alert_container" id="cmhp_alert">' +
      '<div class="alert_content"></div>' +
      '<div class="alert_button"><a class="submitbutton" href="#" onclick="return hideAlert();">OK</a></div>' +
      "</div>";
    document.body.appendChild(mask);
  }

  function bytesToMb(bytes) {
    return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
  }

  var uploadStateByForm = new WeakMap();

  function renderFileList(state) {
    var fileInfo = state.fileInfo;
    var errorBox = state.errorBox;
    var files = state.files;
    fileInfo.innerHTML = "";
    errorBox.textContent = "";

    if (!files.length) {
      fileInfo.innerHTML =
        '<div class="inquiry-upload-empty">Noch keine Datei ausgewählt.</div>';
      return;
    }

    var list = document.createElement("ul");
    list.className = "inquiry-upload-list";
    for (var i = 0; i < files.length; i += 1) {
      (function (idx) {
        var li = document.createElement("li");
        li.className = "inquiry-upload-item";
        var label = document.createElement("span");
        label.className = "inquiry-upload-item-name";
        label.textContent = files[idx].name + " (" + bytesToMb(files[idx].size) + " MB)";
        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "inquiry-upload-item-remove";
        removeBtn.setAttribute("aria-label", "Datei entfernen");
        removeBtn.textContent = "x";
        removeBtn.addEventListener("click", function () {
          state.files.splice(idx, 1);
          renderFileList(state);
        });
        li.appendChild(label);
        li.appendChild(removeBtn);
        list.appendChild(li);
      })(i);
    }
    fileInfo.appendChild(list);
  }

  function addNewFiles(state, incomingFiles) {
    var totalSize = 0;
    for (var i = 0; i < state.files.length; i += 1) {
      totalSize += state.files[i].size;
    }

    var errors = [];
    for (var j = 0; j < incomingFiles.length; j += 1) {
      var file = incomingFiles[j];
      if (!file || !file.name) {
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(
          '"' +
            file.name +
            '" ist zu groß (max. ' +
            bytesToMb(MAX_FILE_BYTES) +
            " MB pro Datei)."
        );
        continue;
      }
      if (state.files.length >= MAX_ATTACHMENTS) {
        errors.push("Maximal " + MAX_ATTACHMENTS + " Dateien erlaubt.");
        break;
      }
      if (totalSize + file.size > MAX_TOTAL_BYTES) {
        errors.push(
          "Gesamtgröße der Anhänge überschreitet " +
            bytesToMb(MAX_TOTAL_BYTES) +
            " MB."
        );
        continue;
      }
      state.files.push(file);
      totalSize += file.size;
    }

    renderFileList(state);
    state.errorBox.textContent = errors.join(" ");
  }

  function ensureUploadField(form) {
    if (!form || form.querySelector('input[name="attachments"]')) {
      return;
    }

    form.setAttribute("enctype", "multipart/form-data");

    var submitRow = form.querySelector(".tablerow .submit");
    var targetRow = submitRow ? submitRow.closest(".tablerow") : null;
    if (!targetRow || !targetRow.parentNode) {
      return;
    }

    var row = document.createElement("div");
    row.className = "tablerow trcolor0 inquiry-upload-row";
    row.innerHTML =
      '<div class="tabledata full_cell">' +
      '<label class="inquiry-upload-label" for="' +
      form.id +
      '_attachments">Unterlagen anhängen (optional)</label>' +
      '<input class="inquiry-upload-input" id="' +
      form.id +
      '_attachments" name="attachments" type="file" multiple />' +
      '<label class="inquiry-upload-dropzone" for="' +
      form.id +
      '_attachments">' +
      '<span class="inquiry-upload-icon" aria-hidden="true">📎</span>' +
      '<span class="inquiry-upload-copy">Dateien auswählen oder hier klicken</span>' +
      '<span class="inquiry-upload-hint">Mehrere Dateien möglich</span>' +
      "</label>" +
      '<div class="inquiry-upload-actions">' +
      '<button class="inquiry-upload-remove" type="button">Alle entfernen</button>' +
      "</div>" +
      '<div class="inquiry-upload-error" aria-live="polite"></div>' +
      '<div class="inquiry-upload-files" aria-live="polite"></div>' +
      "</div>";

    targetRow.parentNode.insertBefore(row, targetRow);

    var input = row.querySelector(".inquiry-upload-input");
    var fileInfo = row.querySelector(".inquiry-upload-files");
    var errorBox = row.querySelector(".inquiry-upload-error");
    var clearButton = row.querySelector(".inquiry-upload-remove");
    var state = {
      input: input,
      fileInfo: fileInfo,
      errorBox: errorBox,
      files: [],
    };
    uploadStateByForm.set(form, state);

    renderFileList(state);

    input.addEventListener("change", function () {
      if (!input.files || input.files.length === 0) {
        return;
      }
      addNewFiles(state, input.files);
      input.value = "";
    });

    clearButton.addEventListener("click", function () {
      state.files = [];
      state.input.value = "";
      renderFileList(state);
      state.errorBox.textContent = "";
    });
  }

  function removeLegacyHeaderRows(form) {
    if (!form) {
      return;
    }
    var headers = form.querySelectorAll(".tabledata.input_header");
    for (var i = 0; i < headers.length; i += 1) {
      var row = headers[i].closest(".tablerow");
      if (row && row.parentNode) {
        row.parentNode.removeChild(row);
      }
    }
  }

  function removeLegacyHeaderRowsGlobal() {
    var headers = document.querySelectorAll(".tablerow .tabledata.input_header");
    for (var i = 0; i < headers.length; i += 1) {
      var row = headers[i].closest(".tablerow");
      if (row && row.parentNode) {
        row.parentNode.removeChild(row);
      }
    }
  }

  function ensureUploadStyles() {
    if (document.getElementById("inquiry-upload-styles")) {
      return;
    }
    var style = document.createElement("style");
    style.id = "inquiry-upload-styles";
    style.textContent =
      ".inquiry-upload-input{position:absolute;left:-9999px;}" +
      ".inquiry-upload-dropzone{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1px dashed #8aa7c6;border-radius:10px;padding:16px 14px;background:#f7fbff;cursor:pointer;transition:all .2s ease;}" +
      ".inquiry-upload-dropzone:hover,.inquiry-upload-dropzone:focus{border-color:#2f6ca3;background:#eef6ff;}" +
      ".inquiry-upload-icon{font-size:22px;line-height:1;}" +
      ".inquiry-upload-copy{font-weight:600;text-align:center;}" +
      ".inquiry-upload-hint{font-size:12px;color:#4d5f73;text-align:center;}" +
      ".tabledata.input_header{display:none !important;}" +
      ".tabledata.input_header img[alt='Placeholder']{display:none !important;}" +
      ".inquiry-upload-actions{margin-top:8px;text-align:center;}" +
      ".inquiry-upload-remove{border:0;background:transparent;color:#2f6ca3;text-decoration:underline;cursor:pointer;font-size:12px;padding:0;}" +
      ".inquiry-upload-error{margin-top:8px;font-size:12px;color:#a72a2a;}" +
      ".inquiry-upload-empty{margin-top:6px;font-size:13px;color:#5a6a7a;}" +
      ".inquiry-upload-list{margin:8px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;}" +
      ".inquiry-upload-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 8px;background:#fff;border:1px solid #d8e2ed;border-radius:8px;}" +
      ".inquiry-upload-item-name{font-size:13px;color:#2a3a4b;word-break:break-word;}" +
      ".inquiry-upload-item-remove{border:0;background:#e7eef7;color:#1f4f7b;width:22px;height:22px;border-radius:999px;cursor:pointer;font-weight:700;line-height:1;}" +
      ".inquiry-upload-files{margin-top:0;font-size:13px;color:#2a3a4b;word-break:break-word;}";
    document.head.appendChild(style);
  }

  function initForms() {
    ensureAlertOverlay();
    ensureUploadStyles();
    removeLegacyHeaderRowsGlobal();
    var forms = document.querySelectorAll("form.checkform");
    for (var i = 0; i < forms.length; i += 1) {
      removeLegacyHeaderRows(forms[i]);
      ensureUploadField(forms[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initForms);
  } else {
    initForms();
  }

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

      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        if (typeof form.reportValidity === "function") {
          form.reportValidity();
        }
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      var submitLabel = submitBtn ? submitBtn.textContent || submitBtn.value : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === "BUTTON") {
          submitBtn.textContent = "Wird gesendet…";
        }
      }

      var fd = new FormData(form);
      var uploadState = uploadStateByForm.get(form);
      if (uploadState) {
        fd.delete("attachments");
        for (var i = 0; i < uploadState.files.length; i += 1) {
          fd.append("attachments", uploadState.files[i]);
        }
      }
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
          showFormAlert(SUCCESS_HTML);
          try {
            form.reset();
            var fileInfo = form.querySelector(".inquiry-upload-files");
            if (fileInfo) {
              fileInfo.innerHTML =
                '<div class="inquiry-upload-empty">Noch keine Datei ausgewählt.</div>';
            }
            var input = form.querySelector('input[name="attachments"]');
            if (input) {
              input.value = "";
            }
            if (uploadState) {
              uploadState.files = [];
            }
            var errorBox = form.querySelector(".inquiry-upload-error");
            if (errorBox) {
              errorBox.textContent = "";
            }
          } catch (e) {}
        })
        .catch(function () {
          showFormAlert(
            "<h2>Senden fehlgeschlagen</h2>" +
              "<p>Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch unter " +
              '<a href="tel:+4915128937141">+49 151 28937141</a>.</p>'
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.tagName === "BUTTON") {
              submitBtn.textContent = submitLabel || "absenden";
            }
          }
        });
    },
    true
  );
})();
