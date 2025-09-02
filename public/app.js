// app.js - Client-side script for PWW Planner


// Functie om een modal te maken
function createModal() {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = 'black';
  modal.style.padding = '20px';
  modal.style.border = '1px solid black';
  modal.style.zIndex = '1000';
  modal.style.borderRadius = '10px';
  return modal;
}

// Functie om data op te halen
async function fetchData(endpoint) {
  try {
    const response = await fetch(`/api/${endpoint}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// Functie om data te posten
async function postData(endpoint, data) {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error posting data:', error);
  }
}

// Voorbeeld voor dashboard
if (document.getElementById('upcoming-tests-container')) {
  async function loadDashboard() {
    const items = await fetchData('items');
    const upcoming = items.filter(item => item.type === 'toets' && new Date(item.date) > new Date());
    const container = document.getElementById('upcoming-tests-container');
    container.innerHTML = upcoming.map(item => `<div>${item.title} - ${item.date}</div>`).join('');
  }
  loadDashboard();
}

// Bijv. voor bestanden.html
if (document.getElementById('files-container')) {
  async function loadFiles() {
    const files = await fetchData('files');
    const container = document.getElementById('files-container');
    container.innerHTML = files.map(file => `
      <tr>
        <td>${file.name}</td>
        <td>${file.subject}</td>
        <td>${new Date(file.date).toLocaleDateString()}</td>
        <td>
          <button class="preview-btn" data-file-path="${file.path}" data-file-name="${file.name}">Preview</button>
          <button class="download-btn" data-file-path="${file.path}">Download</button>
          <button class="delete-btn" data-file-id="${file.id}">Delete</button>
        </td>
      </tr>`).join('');
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filePath = e.target.dataset.filePath;
        const fileName = e.target.dataset.fileName;
        openPreviewModal(filePath, fileName);
      });
    });
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        let filePath = e.target.dataset.filePath; // eslint-disable-line no-useless-escape
        filePath = filePath.split(/[\/]/).pop();
        window.location.href = `/download/${filePath}`;
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const fileId = e.target.dataset.fileId;
        if (confirm('Weet je zeker dat je dit bestand wilt verwijderen?')) {
          try {
            const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
            if (response.ok) {
              loadFiles();
            } else {
              console.error('Failed to delete file');
              alert('Verwijderen mislukt.');
            }
          } catch (error) {
            console.error('Error deleting file:', error);
            alert('Er is een fout opgetreden bij het verwijderen.');
          }
        }
      });
    });
  }
  loadFiles();

  const uploadBtn = document.getElementById('upload-file-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      openUploadModalForFilesPage();
    });
  }

  async function openUploadModalForFilesPage() {
    const subjects = await fetchData('subjects');
    const modal = createModal();

    let subjectOptions = '<option value="Algemeen">Algemeen</option>';
    if (subjects && subjects.length > 0) {
      subjectOptions = subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }

    modal.innerHTML = `
      <h3>Bestand Uploaden</h3>
      <input type="file" id="file-upload" required>
      <select id="subject-select" required>
        ${subjectOptions}
      </select>
      <button id="submit-file">Uploaden</button>
      <button id="cancel-file">Annuleren</button>
    `;

    document.body.appendChild(modal);

    document.getElementById('submit-file').addEventListener('click', async () => {
      const fileInput = document.getElementById('file-upload');
      const subjectSelect = document.getElementById('subject-select');
      
      if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('subject', subjectSelect.value);

        try {
          const response = await fetch('/api/files', { method: 'POST', body: formData });
          if (response.ok) {
            document.body.removeChild(modal);
            loadFiles(); // Refresh the file list
          } else {
            console.error('Upload failed');
            alert('Uploaden is mislukt.');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Er is een fout opgetreden bij het uploaden.');
        }
      }
    });

    document.getElementById('cancel-file').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
}

function openPreviewModal(filePath, fileName) {
    filePath = filePath.split(/[\\/]/).pop();
    const extension = fileName.split('.').pop().toLowerCase();
    const modal = createModal();

    modal.innerHTML = `
        <h3>Preview: ${fileName}</h3>
        <div id="preview-container" style="min-height: 100px; max-height: 600px; overflow-y: auto; font-family: 'Google Sans';">
            <p>Laden...</p>
        </div>
        <button id="close-preview">Sluiten</button>
    `;

    document.body.appendChild(modal);
    document.getElementById('close-preview').addEventListener('click', () => document.body.removeChild(modal));

    const previewContainer = modal.querySelector('#preview-container');

    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        previewContainer.innerHTML = `<img src="/uploads/${filePath}" style="max-width: 100%; display: block;" alt="${fileName}">`;
    } else if (extension === 'pdf') {
        previewContainer.innerHTML = `<iframe src="/uploads/${filePath}" style="width: 100%; height: 500px; border: none;"></iframe>`;
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        previewContainer.innerHTML = `<video controls style="width: 100%;"><source src="/uploads/${filePath}" type="video/${extension}"></video>`;
    } else if (extension === 'pptx') {
        previewContainer.innerHTML = `<div id="pptx-wrapper" style="width: 600px; height: 450px; position: relative;"></div><p>Loading PPTX preview...</p>`;
        import(/* webpackIgnore: true */ 'https://esm.sh/pptx-preview@1.0.5').then(({init}) => {
          const pptxPreviewer = init(document.getElementById('pptx-wrapper'), {width: 600, height: 450});
          fetch(`/uploads/${filePath}`)
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => {
              console.log('Starting PPTX preview');
              document.querySelector('#preview-container p').remove(); // Remove loading message
              pptxPreviewer.preview(arrayBuffer);
              console.log('PPTX preview called');
              // Add navigation for page-by-page viewing
              const wrapper = document.getElementById('pptx-wrapper');
              wrapper.style.overflow = 'hidden';
              const slides = wrapper.querySelectorAll('div'); // Assuming slides are div elements
              if (slides.length > 1) {
                let current = 0;
                const showSlide = () => {
                  Array.from(slides).forEach((slide, i) => {
                    slide.style.display = (i === current) ? 'block' : 'none';
                  });
                };
                showSlide();
                const prevBtn = document.createElement('button');
                prevBtn.textContent = 'Vorige';
                prevBtn.style.position = 'absolute';
                prevBtn.style.left = '10px';
                prevBtn.style.top = '50%';
                prevBtn.style.transform = 'translateY(-50%)';
                prevBtn.style.zIndex = '10';
                prevBtn.addEventListener('click', () => {
                  if (current > 0) {
                    current--;
                    showSlide();
                  }
                });
                wrapper.appendChild(prevBtn);
                const nextBtn = document.createElement('button');
                nextBtn.textContent = 'Volgende';
                nextBtn.style.position = 'absolute';
                nextBtn.style.right = '10px';
                nextBtn.style.top = '50%';
                nextBtn.style.transform = 'translateY(-50%)';
                nextBtn.style.zIndex = '10';
                nextBtn.addEventListener('click', () => {
                  if (current < slides.length - 1) {
                    current++;
                    showSlide();
                  }
                });
                wrapper.appendChild(nextBtn);
              } else {
                console.log('No multiple slides detected for navigation');
              }
            })
            .catch(err => {
               console.error('Error loading PPTX:', err);
               previewContainer.innerHTML += `<p>Error loading PPTX: ${err.message}</p>`;
             });
        }).catch(err => {
           console.error('Failed to load PPTX preview library:', err);
           previewContainer.innerHTML = `<p>Failed to load PPTX preview library: ${err.message}</p>`;
         });
    } else if (['txt', 'md'].includes(extension)) {
        fetch(`/uploads/${filePath}`)
            .then(response => response.ok ? response.text() : Promise.reject(`Network response was not ok (${response.status})`))
            .then(text => {
                const pre = document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.textContent = text;
                previewContainer.innerHTML = '';
                previewContainer.appendChild(pre);
            })
            .catch(err => {
                previewContainer.innerHTML = `<p>Fout bij laden van tekst: ${err}</p>`;
            });
    } else {
        previewContainer.innerHTML = `<p>Preview niet ondersteund voor dit bestandstype. Download om te bekijken.</p>`;
    }
}

// Logica voor vakdetails.html
if (document.getElementById('subject-details-container')) {
  async function loadSubjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('id');
    if (!subjectId) return console.error('Geen subject ID voorzien');

    const subject = (await fetchData('subjects')).find(s => s.id === parseInt(subjectId));
    if (!subject) return console.error('Subject niet gevonden');

    const items = await fetchData('items');
    const subjectItems = items.filter(item => item.vak === subject.name);
    const files = await fetchData('files');
    const subjectFiles = files.filter(file => file.subject === subject.name);

    const container = document.getElementById('subject-details-container');
    container.innerHTML = `
      <div class="header">
        <div class="icon-bg"><span class="material-symbols-outlined">book</span></div>
        <div>
          <h2>${subject.name}</h2>
          <p>${subject.description}</p>
        </div>
      </div>
      <div class="page-layout">
        <div class="main-column">
          <div class="m3-card">
            <div class="card-header">
              <h4><span class="material-symbols-outlined">calendar_today</span> Aankomende Items</h4>
              <button class="button add-item-btn"><span class="material-symbols-outlined">add</span> Nieuw Item</button>
            </div>
            ${subjectItems.map(item => `<div class="list-item"><p>${item.title}</p><div class="date">${item.date}</div></div>`).join('') || '<p>Geen items gevonden.</p>'}
          </div>
          <div class="m3-card">
            <div class="card-header">
              <h4><span class="material-symbols-outlined">description</span> Bestanden</h4>
              <button class="button upload-file-btn"><span class="material-symbols-outlined">upload_file</span> Upload Bestand</button>
            </div>
            ${subjectFiles.map(file => `
              <div class="file-item">
                <div class="file-icon icon-pptx"><span class="material-symbols-outlined">file_present</span></div>
                <div><p>${file.name}</p><small>${file.subject}</small></div>
              </div>`).join('') || '<p>Geen bestanden gevonden.</p>'}
          </div>
        </div>
        <div class="side-column">
          <div class="m3-card">
            <h4><span class="material-symbols-outlined">info</span> Vak Informatie</h4>
            <p>Naam: ${subject.name}</p>
            <p>Beschrijving: ${subject.description}</p>
            <button class="button delete-subject-btn" data-subject-id="${subject.id}">Verwijder Vak</button>
          </div>
        </div>
      </div>
    `;
    

    document.querySelector('.add-item-btn').addEventListener('click', () => addNewItem(subject));
    document.querySelector('.upload-file-btn').addEventListener('click', () => uploadFile(subject));

    document.querySelector('.delete-subject-btn').addEventListener('click', async (e) => {
      const subjectId = e.target.dataset.subjectId;
      if (confirm('Weet je zeker dat je dit vak wilt verwijderen? Alle gekoppelde items en bestanden worden niet verwijderd.')) {
        try {
          const response = await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
          if (response.ok) {
            window.location.href = '/vakken.html';
          } else {
            alert('Verwijderen mislukt.');
          }
        } catch (error) {
          console.error('Error deleting subject:', error);
          alert('Er is een fout opgetreden bij het verwijderen.');
        }
      }
    });
  }

  function addNewItem(subject) {
    const modal = createModal();
    modal.innerHTML = `
      <h3>Nieuw Item Toevoegen</h3>
      <input type="text" id="item-title" placeholder="Titel">
      <input type="date" id="item-date">
      <input type="text" id="item-type" placeholder="Type (bijv. toets, huiswerk)">
      <button id="submit-item">Toevoegen</button>
      <button id="cancel-item">Annuleren</button>
    `;
    document.body.appendChild(modal);
    document.getElementById('submit-item').addEventListener('click', () => {
      const newItem = {
        title: document.getElementById('item-title').value,
        date: document.getElementById('item-date').value,
        type: document.getElementById('item-type').value,
        vak: subject.name
      };
      if (newItem.title && newItem.date && newItem.type) {
        postData('items', newItem).then(() => {
          document.body.removeChild(modal);
          loadSubjectDetails();
        });
      }
    });
    document.getElementById('cancel-file').addEventListener('click', () => document.body.removeChild(modal));
  }

  function uploadFile(subject) {
    const modal = createModal();
    modal.innerHTML = `
      <h3>Bestand Uploaden</h3>
      <input type="file" id="file-upload">
      <button id="submit-file">Uploaden</button>
      <button id="cancel-file">Annuleren</button>
    `;
    document.body.appendChild(modal);
    document.getElementById('submit-file').addEventListener('click', async () => {
      const fileInput = document.getElementById('file-upload');
      if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('subject', subject.name);
        try {
          const response = await fetch('/api/files', { method: 'POST', body: formData });
          if (response.ok) {
            document.body.removeChild(modal);
            loadSubjectDetails();
          } else {
            console.error('Upload failed');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    });
    document.getElementById('cancel-item').addEventListener('click', () => document.body.removeChild(modal));
  }

  loadSubjectDetails();
}

// Logica voor nieuw-vak.html
if (document.getElementById('new-subject-form')) {
  document.getElementById('new-subject-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newSubject = {
      name: document.getElementById('name').value,
      description: document.getElementById('description').value
    };
    if (await postData('subjects', newSubject)) {
      alert('Vak succesvol toegevoegd!');
      window.location.href = '/vakken.html';
    }
  });
}

// Planner logic
if (document.getElementById('planner-page')) {
    console.log('Planner page detected'); // Debugging
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    let currentDate = new Date();

    async function renderPlanner() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearHeader.textContent = `${currentDate.toLocaleString('nl-NL', { month: 'long' })} ${year}`;

        calendarBody.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Maandag

        const items = await fetchData('items');
        console.log('Fetched items:', items); // Debugging

        for (let i = 0; i < startDayOfWeek; i++) {
            calendarBody.innerHTML += `<div class="calendar-day other-month"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const itemsForDay = items.filter(item => item.date === dayString);

            let eventsHtml = '';
            itemsForDay.forEach(item => {
                eventsHtml += `<div class="event-item event-${item.type.toLowerCase()}">${item.title}</div>`;
            });

            const todayClass = new Date().toISOString().split('T')[0] === dayString ? 'today' : '';

            calendarBody.innerHTML += `
                <div class="calendar-day ${todayClass}">
                    <div class="day-number">${day}</div>
                    <div class="events-container">${eventsHtml}</div>
                </div>
            `;
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderPlanner();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderPlanner();
    });

    renderPlanner();
}

// Sidebar collapse functionality
document.addEventListener('DOMContentLoaded', () => {
    // Existing collapse functionality
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.getElementById('collapse-btn');
    if (sidebar && collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Theme functionality
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');

    const setTheme = (theme) => {
        localStorage.setItem('theme', theme);
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        root.classList.toggle('dark', isDark);
        if (themeToggle) {
            themeToggle.querySelector('span').textContent = isDark ? 'light_mode' : 'dark_mode';
        }
    };

    // Initialize theme
    let savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);

    // System preference listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (savedTheme === 'system') {
            setTheme('system');
        }
    });

    // Toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            savedTheme = root.classList.contains('dark') ? 'light' : 'dark';
            setTheme(savedTheme);
        });
    }

    async function saveStofForSubject(subjectId, stofText) {
        if (!subjectId) return;
        const subject = (await fetchData('subjects')).find(s => s.id === parseInt(subjectId));
        if (subject) {
            subject.stof = stofText;
            await postData(`subjects/${subjectId}`, subject);
            console.log(`Stof opgeslagen voor vak ${subjectId}`);
        }
    }

    async function getStofForSubject(subjectId) {
        if (!subjectId) return '';
        const subject = (await fetchData('subjects')).find(s => s.id === parseInt(subjectId));
        return subject ? subject.stof : '';
    }


});
