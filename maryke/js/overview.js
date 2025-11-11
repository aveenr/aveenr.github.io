document.addEventListener("DOMContentLoaded", () => {
  //randomnewnamethatwontwork
//  const BASE_URL = "https://script.google.com/macros/s/AKfycbwCLXXyWMNvop8VgrylPoqbRBA-zcejs0bhqw1ynvInn6QBob5AhORCoBRapB3MvdLj/exec?token=just_to_stop_bots";
  //ar for demo - delete soon
  const BASE_URL = "https://script.google.com/macros/s/AKfycbypNODL3FbQ2HTYcgj4BZL3-GaKFRiWmkZl-e6NAfe3mzDl7j191vKT9_RMjUGOZ3dq/exec?token=just_to_stop_bots";
  let allData = [];

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  const volunteersTodayCountEl = document.getElementById('volunteersTodayCount');
  const volunteersTodayBody = document.getElementById('volunteersTodayBody');
  const pendingApprovalsCountEl = document.getElementById('pendingApprovalsCount');
  const totalBookingsCountEl = document.getElementById('totalBookingsCount');
  const totalBookingsBody = document.getElementById('totalBookingsBody');
  const upcomingWeekCountEl = document.getElementById('upcomingWeekCount');
  const recentBookingsBody = document.getElementById('recentBookingsBody');

  function badgeClass(type) {
    switch (type) {
      case "Guiding": return "bg-success";
      case "Course": return "bg-primary";
      case "GRG": return "bg-warning text-dark";
      default: return "bg-secondary";
    }
  }

  function showLoading() { document.getElementById('loadingMessage').style.display = 'block'; }
  function hideLoading() { document.getElementById('loadingMessage').style.display = 'none'; }
  function safeGet(obj, key) { return obj && obj[key] != null ? obj[key] : ""; }

  function formatDateMMDD(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
  }

  function displayHour(hour) {
    if (hour == null) return "";
    const h = Math.floor(hour);
    const min = hour % 1 === 0.5 ? "30" : "00";
    return h.toString().padStart(2, '0') + ":" + min;
  }

//  function bookedDateToLocalISO(utcStr) {
//    if (!utcStr) return null;
//    const d = new Date(utcStr);
//    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
//    return d.toISOString().split("T")[0];
//  }

  function bookedDateToLocalISO(utcStr) {
    if (!utcStr) return null;
    const d = new Date(utcStr);
    // Return YYYY-MM-DD using local time, not UTC
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }


  function fetchAllRows() {
    showLoading();
    fetch(BASE_URL).then(r => r.json()).then(data => {
      allData = data.map(row => {
        const isoDate = bookedDateToLocalISO(row["Booked Date"]);
        return {
          Timestamp: safeGet(row, "Timestamp"),
          DateISO: isoDate,
          DisplayDate: formatDateMMDD(isoDate),
          Name: safeGet(row, "Name"),
          Type: safeGet(row, "Type"),
          Approved: safeGet(row, "Approved"),
          StartTime: displayHour(safeGet(row, "Start Time")),
          EndTime: displayHour(safeGet(row, "End Time"))
        };
      });
      setCurrentWeekRange();
      updateDashboard();
    }).catch(err => console.error(err)).finally(() => hideLoading());
  }

  function setCurrentWeekRange() {
    const today = new Date();
    const day = today.getDay();
    const sunday = new Date(today); sunday.setDate(today.getDate() - day);
    const saturday = new Date(sunday); saturday.setDate(sunday.getDate() + 6);
    startDateInput.value = sunday.toISOString().split('T')[0];
    endDateInput.value = saturday.toISOString().split('T')[0];
  }

  function filterByDateRange(data) {
    const startISO = startDateInput.value;
    const endISO = endDateInput.value;
    return data.filter(r => {
      if (startISO && r.DateISO < startISO) return false;
      if (endISO && r.DateISO > endISO) return false;
      return true;
    });
  }

  function updateDashboard() {
    const filtered = filterByDateRange(allData).sort((a, b) => b.DateISO.localeCompare(a.DateISO));

//    const todayISO = new Date().toISOString().split("T")[0];
    const d = new Date();
    const todayISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const todayVols = allData.filter(r => r.DateISO === todayISO);
    volunteersTodayCountEl.textContent = todayVols.length;
    volunteersTodayBody.innerHTML = todayVols.length ?
      todayVols.map(r => `<tr class="highlight-today">
        <td>${r.Name}</td><td>${r.StartTime}</td><td>${r.EndTime}</td>
        <td><span class="badge ${badgeClass(r.Type)}">${r.Type}</span></td>
      </tr>`).join('') :
      `<tr><td colspan="4" class="text-center">No one is coming in today 😔</td></tr>`;

    const pendingCount = allData.filter(r => r.Approved != 1).length;
    pendingApprovalsCountEl.textContent = pendingCount;

    totalBookingsCountEl.textContent = filtered.length;
    totalBookingsBody.innerHTML = filtered.length ?
      filtered.map(r => `<tr>
        <td>${r.DisplayDate}</td><td>${r.Name}</td><td>${r.StartTime}</td><td>${r.EndTime}</td>
        <td><span class="badge ${badgeClass(r.Type)}">${r.Type}</span></td>
      </tr>`).join('') :
      `<tr><td colspan="5" class="text-center">No bookings in this period</td></tr>`;

//    const today = new Date();
//    const day = today.getDay();
//    const sundayISO = bookedDateToLocalISO(new Date(today.setDate(today.getDate() - day)));
//    const saturdayISO = bookedDateToLocalISO(new Date(today.setDate(today.getDate() + 6)));
//    const upcomingCount = allData.filter(r => r.DateISO >= sundayISO && r.DateISO <= saturdayISO).length;
//    upcomingWeekCountEl.textContent = upcomingCount;

      const now = new Date();
      const sunday = new Date(now);
      sunday.setDate(now.getDate() - now.getDay());
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);

      const sundayISO = bookedDateToLocalISO(sunday);
      const saturdayISO = bookedDateToLocalISO(saturday);

      const upcomingCount = allData.filter(r => r.DateISO >= sundayISO && r.DateISO <= saturdayISO).length;
      upcomingWeekCountEl.textContent = upcomingCount;


//    const recent = [...allData].sort((a, b) => b.DateISO.localeCompare(a.DateISO)).slice(0, 5);

    // recent bookings fix
    const recent = [...allData]
      .filter(r => r.Timestamp)
      .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
      .slice(0, 5);

    recentBookingsBody.innerHTML = recent.map(r => {
      const badgeApproved = r.Approved == 1 ? "bg-success text-white" : "bg-pending";
      return `<tr>
        <td>${r.DisplayDate}</td><td>${r.Name}</td>
        <td><span class="badge ${badgeClass(r.Type)}">${r.Type}</span></td>
        <td><span class="badge ${badgeApproved}">${r.Approved == 1 ? "Yes" : "Pending"}</span></td>
      </tr>`;
    }).join('');
  }

  [startDateInput, endDateInput].forEach(el => el.addEventListener('change', updateDashboard));

  document.getElementById('exportSnapshotBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    const start = startDateInput.value;
    const end = endDateInput.value;
    const generatedDate = new Date().toISOString().split('T')[0];

    const totalBookings = totalBookingsCountEl.textContent;
    const pending = pendingApprovalsCountEl.textContent;
    const todayVols = volunteersTodayCountEl.textContent;
    const thisWeek = upcomingWeekCountEl.textContent;

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text("EVG Bookings Snapshot", 40, 50);
    doc.setFontSize(10);
    doc.text(`Date Generated: ${generatedDate}`, 40, 70);
    doc.text(`Prepared by: Aveen`, 40, 85);
    doc.text(`Period: ${start} to ${end}`, 40, 100);

    const pageWidth = doc.internal.pageSize.getWidth();
    const xStart = 40;  // left margin
    const xEnd = pageWidth - 40; // right margin

    doc.setDrawColor(0);   // black line
    doc.setLineWidth(0.5); // line thickness
    doc.line(xStart, 110, xEnd, 110);


    const storyLines = [
      ``,
      `Between ${start} and ${end}:`,
      ``,
      `There were ${totalBookings} total bookings,`,
      `${pending} pending approval(s),`,
      `${todayVols} volunteer(s) today,`,
      `and ${thisWeek} bookings for the current week (Sunday to Saturday).`,
      ``,
      `This snapshot highlights volunteer activity and booking trends for the selected period.`
    ];
    doc.setFontSize(12);
    doc.setTextColor(50);
    let y = 125;
    storyLines.forEach(line => { doc.text(line, 40, y); y += 15; });

    doc.setDrawColor(78, 115, 223);
    doc.setFillColor(232, 245, 255);
    doc.rect(40, y + 5, 520, 80, 'FD');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);

    let metricY2 = 70;
    doc.text('Volunteers Today: ', 50, y + 25);
    doc.setFont(undefined, 'bold'); doc.text(todayVols.toString(), 180, y + 25); doc.setFont(undefined, 'normal');
    doc.text('Pending Approvals:', 300, y + 25);
    doc.setFont(undefined, 'bold'); doc.text(pending.toString(), 430, y + 25); doc.setFont(undefined, 'normal');
    doc.text('Total Bookings:   ', 50, y + metricY2);
    doc.setFont(undefined, 'bold'); doc.text(totalBookings.toString(), 180, y + metricY2); doc.setFont(undefined, 'normal');
    doc.text('This Week:        ', 300, y + metricY2);
    doc.setFont(undefined, 'bold'); doc.text(thisWeek.toString(), 430, y + metricY2); doc.setFont(undefined, 'normal');

    const bookingsData = filterByDateRange(allData)
      .sort((a, b) => b.DateISO.localeCompare(a.DateISO))
      .map(r => [r.DisplayDate, r.Name, r.StartTime, r.EndTime, r.Type]);

    // Recent bookings table
    // Bookings table
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bookings in Selected Period', 40, y + 130); // heading above table
    doc.setFont(undefined, 'normal');
    doc.autoTable({
      startY: y + 150,
      head: [['Date', 'Name', 'Start', 'End', 'Type']],
      body: bookingsData,
      theme: 'grid',
      headStyles: { fillColor: [78, 115, 223], textColor: 255 },
      styles: { fontSize: 10 }
    });

//    const recentData = [...allData].sort((a, b) => b.DateISO.localeCompare(a.DateISO)).slice(0, 5)
//      .map(r => [r.DisplayDate, r.Name, r.Type, r.Approved == 1 ? "Yes" : "Pending"]);

    const recentData = [...allData]
      .filter(r => r.Timestamp)
      .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
      .slice(0, 5)
      .map(r => [r.DisplayDate, r.Name, r.Type, r.Approved == 1 ? "Yes" : "Pending"]);

//    // Recent bookings table
//    doc.setFontSize(12);
//    doc.setFont(undefined, 'bold');
//    doc.text('5 Most Recent Bookings', 40, doc.lastAutoTable.finalY + 10);
//    doc.setFont(undefined, 'normal');
//
//    doc.autoTable({
//      startY: doc.lastAutoTable.finalY + 20,
//      head: [['Date', 'Name', 'Type', 'Approved']],
//      body: recentData,
//      theme: 'grid',
//      headStyles: { fillColor: [30, 144, 255], textColor: 255 },
//      styles: { fontSize: 10 }
//    });

    doc.save(`EVG_Snapshot_${start}_${end}.pdf`);
  });

  fetchAllRows();
});
