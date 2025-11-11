<!--const BASE_URL = "https://script.google.com/macros/s/AKfycbwCLXXyWMNvop8VgrylPoqbRBA-zcejs0bhqw1ynvInn6QBob5AhORCoBRapB3MvdLj/exec?token=just_to_stop_bots";-->
const BASE_URL = "https://script.google.com/macros/s/AKfycbypNODL3FbQ2HTYcgj4BZL3-GaKFRiWmkZl-e6NAfe3mzDl7j191vKT9_RMjUGOZ3dq/exec?token=just_to_stop_bots";

let allData = [];
const loadingEl = document.getElementById('loadingMessage');
const tableBody = document.getElementById('tableBody');
const filters = document.getElementById('filters');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const monthQuick = document.getElementById('monthQuick');
const nameFilter = document.getElementById('nameFilter');
const dutyFilter = document.getElementById('dutyFilter');
const approvedFilter = document.getElementById('approvedFilter');

loadNavbar();

// --- Utilities ---
function showLoading(){ loadingEl.style.display='block'; }
function hideLoading(){ loadingEl.style.display='none'; }
function safeGet(obj,key){ return obj && obj[key] ? obj[key] : ""; }

function badgeClass(type){
  switch(type){
    case "Guiding": return "bg-success";
    case "Course": return "bg-primary";
    case "GRG": return "bg-warning text-dark";
    default: return "bg-secondary";
  }
}

function formatTime(decimal){
  if(decimal === "" || isNaN(decimal)) return "";
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function typeHours(type){
  switch(type){
    case "Guiding": return 2;
    case "Course": return 5;
    case "GRG": return 5;
    default: return 0;
  }
}

// --- Fetch Data ---
function fetchAllRows(){
  showLoading();
  fetch(BASE_URL)
    .then(r => r.json())
    .then(data => {
      allData = data.map(row => {
        const bookedDate = new Date(safeGet(row,"Booked Date"));
        const iso = !isNaN(bookedDate) ? bookedDate.toISOString().split("T")[0] : null;
        const displayDate = !isNaN(bookedDate) ? bookedDate.toLocaleDateString(undefined,{ month:'short', day:'numeric' }) : "";

        const type = safeGet(row,"Type");
        const approved = Number(safeGet(row,"Approved")) || 0;

        const hours = (() => {
          switch(type){
            case "GRG": return 5;
            case "Course": return 5;
            case "Guiding": return 2;
            default: return 0;
          }
        })();

        const formatTime = n => {
          const h = Math.floor(n);
          const m = Math.round((n - h) * 60);
          return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        }

        return {
          DateISO: iso,
          DisplayDate: displayDate,
          Day: safeGet(row,"Day"),
          Start: formatTime(Number(safeGet(row,"Start Time"))),
          End: formatTime(Number(safeGet(row,"End Time"))),
          Hours: hours,
          Name: safeGet(row,"Name"),
          Comment: safeGet(row,"UserDetail"),
          Type: type,
          Approved: approved
        };
      });


      populateMonthDropdown();
      populateNameDropdown();
      filters.style.display='flex';
      renderTable();
    })
    .catch(err=>{
      console.error(err);
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error loading data</td></tr>`;
    })
    .finally(()=>hideLoading());
}

// --- Filters ---
function populateMonthDropdown(){
  const today = new Date();
  for(let i=0;i<12;i++){
    const d = new Date(today.getFullYear(), i, 1);
    const option = document.createElement('option');
    option.value = i;
    option.textContent = d.toLocaleString(undefined,{month:'long'});
    monthQuick.appendChild(option);
  }
}

<!--function populateNameDropdown(){-->
<!--  const names = [...new Set(allData.map(i => i.Name))].sort((a,b) => a.localeCompare(b));-->
<!--  names.forEach(n=>{-->
<!--    const option = document.createElement('option');-->
<!--    option.value = n;-->
<!--    option.textContent = n;-->
<!--    nameFilter.appendChild(option);-->
<!--  });-->
<!--}-->


function populateNameDropdown(){
  const names = [...new Set(allData.map(i=>i.Name))];
  names.forEach(n=>{
    const option = document.createElement('option');
    option.value = n;
    option.textContent = n;
    nameFilter.appendChild(option);
  });
}

function filterData(){
  const startISO = startDateInput.value;
  const endISO = endDateInput.value;
  const selName = nameFilter.value;
  const selDuty = dutyFilter.value;
  const selApproved = approvedFilter.value;

  return allData.filter(r=>{
    if(startISO && r.DateISO < startISO) return false;
    if(endISO && r.DateISO > endISO) return false;
    if(selName && r.Name!==selName) return false;
    if(selDuty && r.Type!==selDuty) return false;
    if(selApproved!=="" && String(r.Approved)!==selApproved) return false;
    return true;
  }).sort((a,b)=>a.DateISO.localeCompare(b.DateISO));
}

// --- Render Table ---
function renderTable(){
  const rows = filterData();
  if(!rows.length){
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No data in this range</td></tr>`;
    return;
  }

  let totalHours = 0;
  const html = rows.map(r=>{
    totalHours += r.Hours;
    return `
      <tr>
        <td>${r.DisplayDate}</td>
        <td>${r.Name}</td>
        <td class="d-none d-sm-table-cell">${r.Day}</td>
        <td>${r.Start}</td>
        <td class="d-none d-sm-table-cell">${r.End}</td>
        <td>${r.Hours}</td>
        <td class="d-none d-md-table-cell">${r.Comment}</td>
        <td><span class="badge ${badgeClass(r.Type)}">${r.Type}</span></td>
        <td>${r.Approved==1 ? "Yes" : "No"}</td>
      </tr>`;
  }).join('');

  const totalRow = `
    <tr class="table-light fw-bold">
      <td colspan="5" class="text-end">Total Hours:</td>
      <td>${totalHours}</td>
      <td colspan="3"></td>
    </tr>
  `;

  tableBody.innerHTML = html + totalRow;
}

// --- Quick Month ---
monthQuick.addEventListener('change',()=>{
  const m = parseInt(monthQuick.value);
  if(isNaN(m)) return;
  const year = new Date().getFullYear();
  startDateInput.value = `${year}-${String(m+1).padStart(2,'0')}-01`;
  const endDay = new Date(year,m+1,0).getDate();
  endDateInput.value = `${year}-${String(m+1).padStart(2,'0')}-${endDay}`;
  renderTable();
});

// --- Event listeners ---
[startDateInput,endDateInput,nameFilter,dutyFilter,approvedFilter].forEach(el=>el.addEventListener('change',renderTable));

// --- Load ---
fetchAllRows();