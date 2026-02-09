const API = "";

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
  });
});

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

async function listStudents() {
  const res = await fetch(API + "/api/students");
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}

function showStatus(id, msg, isError) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = "status " + (isError ? "error" : "success");
}

document.getElementById("form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const studentId = document.getElementById("reg-student-id").value.trim();
  const name = document.getElementById("reg-name").value.trim();
  try {
    const res = await fetch(API + "/api/students", {
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
    const res = await fetch(API + "/api/students/" + encodeURIComponent(studentId) + "/photos", {
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
  const list = document.getElementById("student-list");
  const students = await listStudents();
  list.innerHTML = students.length
    ? students.map((s) => `<li><span>${s.student_id} – ${s.name}</span></li>`).join("")
    : "<li>No students registered.</li>";
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
    const res = await fetch(url, { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showStatus("mark-status", data.detail || "Failed", true);
      return;
    }
    showStatus("mark-status", "Attendance marked for " + date + ". Recognized: " + (data.recognized?.length || 0), false);
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
      fetch(API + "/api/attendance/records?day=" + date),
      fetch(API + "/api/attendance/summary?day=" + date),
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
  document.getElementById("link-daily-export").href = API + "/api/reports/daily?day=" + d;
  const from = document.getElementById("export-from").value;
  const to = document.getElementById("export-to").value;
  document.getElementById("link-range-export").href = API + "/api/reports/range?from_date=" + from + "&to_date=" + to;
}

document.getElementById("export-date").addEventListener("change", updateExportLinks);
document.getElementById("export-from").addEventListener("change", updateExportLinks);
document.getElementById("export-to").addEventListener("change", updateExportLinks);
updateExportLinks();

refreshStudentList();
