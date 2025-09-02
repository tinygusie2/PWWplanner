const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Data paths
const subjectsPath = path.join(__dirname, 'data', 'subjects.json');
const itemsPath = path.join(__dirname, 'data', 'items.json');
const filesPath = path.join(__dirname, 'data', 'files.json');
const preferencesPath = path.join(__dirname, 'data', 'preferences.json');
const plannerDataPath = path.join(__dirname, 'data', 'planner-data.json');


// Read JSON function
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
}

// Write JSON function
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Preferences endpoints
app.get('/api/preferences', async (req, res) => {
  try {
    const preferences = await readJSON(preferencesPath);
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: 'Error reading preferences' });
  }
});

app.put('/api/preferences', async (req, res) => {
  try {
    const preferences = await readJSON(preferencesPath);
    const updatedPreferences = { ...preferences, ...req.body };
    await writeJSON(preferencesPath, updatedPreferences);
    res.json(updatedPreferences);
  } catch (err) {
    res.status(500).json({ error: 'Error updating preferences' });
  }
});

// Planner data endpoints
app.get('/api/planner-data', async (req, res) => {
  try {
    const plannerData = await readJSON(plannerDataPath);
    res.json(plannerData);
  } catch (err) {
    res.status(500).json({ error: 'Error reading planner data' });
  }
});

app.post('/api/planner-data', async (req, res) => {
  try {
    await writeJSON(plannerDataPath, req.body);
    res.status(200).json({ message: 'Planner data saved' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving planner data' });
  }
});

// Subjects endpoints
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await readJSON(subjectsPath);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Error reading subjects' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const subjects = await readJSON(subjectsPath);
    const maxId = subjects.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const newSubject = { id: maxId + 1, ...req.body, stof: '' };
    subjects.push(newSubject);
    await writeJSON(subjectsPath, subjects);
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ error: 'Error adding subject' });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const subjects = await readJSON(subjectsPath);
    const index = subjects.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Subject not found' });
    subjects[index] = { ...subjects[index], ...req.body };
    await writeJSON(subjectsPath, subjects);
    res.json(subjects[index]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating subject' });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const subjects = await readJSON(subjectsPath);
    const index = subjects.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Subject not found' });
    const deleted = subjects.splice(index, 1);
    await writeJSON(subjectsPath, subjects);
    res.json(deleted[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error deleting subject' });
  }
});

// Items endpoints
app.get('/api/items', async (req, res) => {
  try {
    const items = await readJSON(itemsPath);
    // console.log('Serving items:', items);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Error reading items' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const items = await readJSON(itemsPath);
    const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const newItem = { id: maxId + 1, ...req.body };
    items.push(newItem);
    await writeJSON(itemsPath, items);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Error adding item' });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const items = await readJSON(itemsPath);
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Item not found' });
    items[index] = { ...items[index], ...req.body };
    await writeJSON(itemsPath, items);
    res.json(items[index]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const items = await readJSON(itemsPath);
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Item not found' });
    const deleted = items.splice(index, 1);
    await writeJSON(itemsPath, items);
    res.json(deleted[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error deleting item' });
  }
});

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Files endpoints
app.get('/api/files', async (req, res) => {
  try {
    const files = await readJSON(filesPath);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Error reading files' });
  }
});

app.post('/api/files', upload.single('file'), async (req, res) => {
  try {
    const files = await readJSON(filesPath);
    const maxId = files.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const newFile = {
      id: maxId + 1,
      name: req.file.originalname,
      path: req.file.filename,
      subject: req.body.subject || 'Algemeen',
      date: new Date().toISOString()
    };
    files.push(newFile);
    await writeJSON(filesPath, files);
    res.status(201).json(newFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const files = await readJSON(filesPath);
    const index = files.findIndex(f => f.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'File not found' });

    const fileToDelete = files[index];
    const fullPath = path.join(__dirname, 'uploads', fileToDelete.path.split(/[\\/]/).pop());

    // Delete the file from the filesystem
    try {
      await fs.unlink(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    } catch (unlinkErr) {
      console.error(`Error deleting physical file ${fullPath}:`, unlinkErr);
      // Continue to delete from JSON even if physical file deletion fails
    }

    const deleted = files.splice(index, 1);
    await writeJSON(filesPath, files);
    res.json(deleted[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error deleting file' });
  }
});

app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  try {
    const files = await readJSON(filesPath);
    const fileInfo = files.find(f => f.path.endsWith(filename));

    if (fileInfo) {
      res.download(filePath, fileInfo.name, (err) => {
        if (err) {
          if (!res.headersSent) {
            res.status(500).send('Error downloading file');
          }
        }
      });
    } else {
      if (!res.headersSent) {
        res.status(404).send('File not found');
      }
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).send('Error reading file data');
    }
  }
});

// Page routes
app.get('/vakken', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vakken.html'));
});

app.get('/planner', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'planner.html'));
});

app.get('/bestanden', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bestanden.html'));
});

app.get('/whiteboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'whiteboard.html'));
});

app.get('/nieuw-vak', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nieuw-vak.html'));
});

app.get('/nieuw-item', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nieuw-item.html'));
});

app.get('/study-planner', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dynamische-planner.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});