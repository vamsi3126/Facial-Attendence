const API = "";

// --- Auth & Role Management ---
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
  window.location.href = "/static/login.html";
}

document.getElementById("user-role-display").textContent = role === "admin" ? "Director Mode" : "Teacher Mode";

document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/static/login.html";
});

// Role-based UI
if (role === "faculty") {
  // Teacher: Hide Registration, Show Mark Attendance
  document.getElementById("tab-register").style.display = "none";
  document.getElementById("panel-register").classList.remove("active");
  
  document.getElementById("tab-mark").classList.add("active");
  document.getElementById("panel-mark").classList.add("active");
} else {
  // Director: Show Registration by default
  // (Default HTML state is Register active, so no change needed)
}

// --- Tab Navigation ---
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
  });
});

// --- Common Utils ---
function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function showStatus(id, msg, isError) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = "status " + (isError ? "error" : "success");
}

async function authFetch(url, options = {}) {
  options.headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  };
  const res = await fetch(url, options);
  if (res.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("token");
    window.location.href = "/static/login.html";
  }
  return res;
}

// Initialize Dates
const attDate = document.getElementById("att-date");
const recordsDate = document.getElementById("records-date");
const exportDate = document.getElementById("export-date");
const exportFrom = document.getElementById("export-from");
const exportTo = document.getElementById("export-to");
[attDate, recordsDate, exportDate, exportFrom, exportTo].forEach((el) => {
  if (el) el.value = today();
});
if (exportFrom && exportTo) {
  exportTo.value = today();
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  exportFrom.value = d.toISOString().slice(0, 10);
}

// --- Camera Logic ---
let streamReg = null;
let streamAtt = null;

async function startCamera(videoEl, btnStart, btnStop, btnCapture) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoEl.srcObject = stream;
    videoEl.style.display = "block";
    btnStart.style.display = "none";
    btnStop.style.display = "inline-block";
    btnCapture.style.display = "inline-block";
    return stream;
  } catch (err) {
    alert("Could not access camera: " + err.message);
    return null;
  }
}

function stopCamera(stream, videoEl, btnStart, btnStop, btnCapture) {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }
  videoEl.style.display = "none";
  btnStart.style.display = "inline-block";
  btnStop.style.display = "none";
  btnCapture.style.display = "none";
  return null;
}

function captureFrame(videoEl, canvasEl) {
  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  const ctx = canvasEl.getContext("2d");
  ctx.drawImage(videoEl, 0, 0);
  return new Promise(resolve => {
    canvasEl.toBlob(resolve, "image/jpeg", 0.95);
  });
}

// Registration Camera
const vidReg = document.getElementById("video-reg");
const btnStartReg = document.getElementById("btn-start-cam-reg");
const btnStopReg = document.getElementById("btn-stop-cam-reg");
const btnCapReg = document.getElementById("btn-capture-reg");
const canvasReg = document.getElementById("canvas-reg");

btnStartReg.addEventListener("click", async () => {
  streamReg = await startCamera(vidReg, btnStartReg, btnStopReg, btnCapReg);
});
btnStopReg.addEventListener("click", () => {
  streamReg = stopCamera(streamReg, vidReg, btnStartReg, btnStopReg, btnCapReg);
});
btnCapReg.addEventListener("click", async () => {
  const blob = await captureFrame(vidReg, canvasReg);
  streamReg = stopCamera(streamReg, vidReg, btnStartReg, btnStopReg, btnCapReg);
  
  // Upload immediately
  const studentId = document.getElementById("photo-student-id").value.trim();
  if (!studentId) {
    showStatus("upload-status", "Please enter Student ID before capturing.", true);
    return;
  }
  
  const form = new FormData();
  form.append("files", blob, "capture.jpg");
  
  showStatus("upload-status", "Uploading capture...", false);
  try {
    const res = await authFetch(API + "/api/students/" + encodeURIComponent(studentId) + "/photos", {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showStatus("upload-status", data.detail || "Upload failed", true);
    } else {
      showStatus("upload-status", "Photo captured and saved.", false);
      refreshStudentList();
    }
  } catch (err) {
    showStatus("upload-status", err.message || "Error", true);
  }
});

// Attendance Camera
const vidAtt = document.getElementById("video-att");
const btnStartAtt = document.getElementById("btn-start-cam-att");
const btnStopAtt = document.getElementById("btn-stop-cam-att");
const btnCapAtt = document.getElementById("btn-capture-att");
const canvasAtt = document.getElementById("canvas-att");

btnStartAtt.addEventListener("click", async () => {
  streamAtt = await startCamera(vidAtt, btnStartAtt, btnStopAtt, btnCapAtt);
});
btnStopAtt.addEventListener("click", () => {
  streamAtt = stopCamera(streamAtt, vidAtt, btnStartAtt, btnStopAtt, btnCapAtt);
});
btnCapAtt.addEventListener("click", async () => {
  const blob = await captureFrame(vidAtt, canvasAtt);
  streamAtt = stopCamera(streamAtt, vidAtt, btnStartAtt, btnStopAtt, btnCapAtt);
  
  // Mark attendance immediately
  const date = document.getElementById("att-date").value;
  const form = new FormData();
  form.append("file", blob, "classroom_capture.jpg");
  
  showStatus("mark-status", "Processing capture...", false);
  document.getElementById("mark-result").innerHTML = "";
  
  try {
    const url = API + "/api/attendance/mark-from-image" + (date ? "?attendance_date=" + date : "");
    const res = await authFetch(url, { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showStatus("mark-status", data.detail || "Failed", true);
      return;
    }
    showStatus("mark-status", "Attendance marked. Recognized: " + (data.recognized?.length || 0), false);
    const resultEl = document.getElementById("mark-result");
    if (data.recognized && data.recognized.length) {
      resultEl.innerHTML = "<strong>Recognized:</strong><ul>" + data.recognized.map((r) => `<li>${r.student_id} – ${r.name} (${(r.confidence * 100).toFixed(1)}%)</li>`).join("") + "</ul>";
    }
  } catch (err) {
    showStatus("mark-status", err.message || "Error", true);
  }
});


// --- Existing Logic (Updated with authFetch) ---

async function listStudents() {
  const res = await authFetch(API + "/api/students");
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}

document.getElementById("form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const studentId = document.getElementById("reg-student-id").value.trim();
  const name = document.getElementById("reg-name").value.trim();
  try {
    const res = await authFetch(API + "/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showStatus("upload-status", data.detail || "Failed", true);
      return;
    }
    showStatus("upload-status", "Student created: " + studentId, false);
    document.getElementById("photo-student-id").value = studentId;
    refreshStudentList();
  } catch (err) {
    showStatus("upload-status", err.message || "Error", true);
  }
});

document.getElementById("btn-upload-photos").addEventListener("click", async () => {
  const studentId = document.getElementById("photo-student-id").value.trim();
  const files = document.getElementById("photo-files").files;
  if (!studentId || !files || !files.length) {
    showStatus("upload-status", "Enter student ID and select photos.", true);
    return;
  }
  const form = new FormData();
  for (let i = 0; i < files.length; i++) form.append("files", files[i]);
  showStatus("upload-status", "Uploading...", false);
  try {
    const res = await authFetch(API + "/api/students/" + encodeURIComponent(studentId) + "/photos", {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showStatus("upload-status", data.detail || "Upload failed", true);
      return;
    }
    showStatus("upload-status", data.message || "Photos uploaded and face data saved.", false);
    refreshStudentList();
  } catch (err) {
    showStatus("upload-status", err.message || "Error", true);
  }
});

async function refreshStudentList() {
  // Only try to list students if we are allowed (e.g. director)
  // But API might allow reading students for all authenticated users?
  // Let's try.
  try {
    const students = await listStudents();
    const list = document.getElementById("student-list");
    list.innerHTML = students.length
      ? students.map((s) => `<li><span>${s.student_id} – ${s.name}</span></li>`).join("")
      : "<li>No students registered.</li>";
  } catch (e) {
    // maybe 403
  }
}

document.getElementById("btn-mark-attendance").addEventListener("click", async () => {
  const date = document.getElementById("att-date").value;
  const fileInput = document.getElementById("att-image");
  if (!fileInput.files || !fileInput.files[0]) {
    showStatus("mark-status", "Select an image first.", true);
    return;
  }
  const form = new FormData();
  form.append("file", fileInput.files[0]);
  showStatus("mark-status", "Processing...", false);
  document.getElementById("mark-result").innerHTML = "";
  try {
    const url = API + "/api/attendance/mark-from-image" + (date ? "?attendance_date=" + date : "");
    const res = await authFetch(url, { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showStatus("mark-status", data.detail || "Failed", true);
      return;
    }
    showStatus("mark-status", "Attendance marked. Recognized: " + (data.recognized?.length || 0), false);
    const resultEl = document.getElementById("mark-result");
    if (data.recognized && data.recognized.length) {
      resultEl.innerHTML = "<strong>Recognized:</strong><ul>" + data.recognized.map((r) => `<li>${r.student_id} – ${r.name} (${(r.confidence * 100).toFixed(1)}%)</li>`).join("") + "</ul>";
    }
  } catch (err) {
    showStatus("mark-status", err.message || "Error", true);
  }
});

document.getElementById("btn-load-records").addEventListener("click", async () => {
  const date = document.getElementById("records-date").value;
  try {
    const [recRes, sumRes] = await Promise.all([
      authFetch(API + "/api/attendance/records?day=" + date),
      authFetch(API + "/api/attendance/summary?day=" + date),
    ]);
    const records = await recRes.json().catch(() => []);
    const summary = await sumRes.json().catch(() => ({}));
    const tbody = document.querySelector("#records-table tbody");
    tbody.innerHTML = (records || []).map((r) => `<tr><td>${r.student_id}</td><td>${r.student_name}</td><td>${r.status}</td></tr>`).join("") || "<tr><td colspan='3'>No records.</td></tr>";
    document.getElementById("summary-text").textContent = summary.total_students != null
      ? `Present: ${summary.present_count} / ${summary.total_students} (${summary.present_percent}%)`
      : "—";
  } catch (err) {
    document.getElementById("summary-text").textContent = "Error loading data.";
  }
});

function updateExportLinks() {
  const d = document.getElementById("export-date").value;
  // Note: Download links are GET requests, so they won't have the Bearer token header if clicked normally.
  // We might need to change this to a fetch + blob download if auth is strict.
  // For now, let's assume cookie auth or query param auth isn't available, so we'll use fetch for download.
  
  // Actually, let's replace the href with a click handler
  document.getElementById("link-daily-export").onclick = async (e) => {
    e.preventDefault();
    downloadFile(API + "/api/reports/daily?day=" + d, "daily_report.xlsx");
  };
  
  const from = document.getElementById("export-from").value;
  const to = document.getElementById("export-to").value;
  document.getElementById("link-range-export").onclick = async (e) => {
    e.preventDefault();
    downloadFile(API + "/api/reports/range?from_date=" + from + "&to_date=" + to, "range_report.xlsx");
  };
}

async function downloadFile(url, filename) {
  try {
    const res = await authFetch(url);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (err) {
    alert("Error downloading report: " + err.message);
  }
}

document.getElementById("export-date").addEventListener("change", updateExportLinks);
document.getElementById("export-from").addEventListener("change", updateExportLinks);
document.getElementById("export-to").addEventListener("change", updateExportLinks);
updateExportLinks();

if (role === "admin") {
  refreshStudentList();
}
