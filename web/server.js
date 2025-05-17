const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 1313;

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Multer setup for file uploads with 10MB limit, only accept jpg/jpeg
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG images are allowed'));
    }
  },
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Serve the simple upload form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inkday Upload</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 1em; }
        label, input, button { display: block; margin-top: 1em; }
        #status { margin-top: 1em; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Upload Image for a Date</h1>
      <form id="uploadForm" method="POST" enctype="multipart/form-data">
        <label for="date">Select Date:</label>
        <input type="date" id="date" name="date" required max="9999-12-31" />
        <label for="image">Choose JPG image (max 10MB):</label>
        <input type="file" id="image" name="image" accept="image/jpeg" required />
        <button type="submit">Upload</button>
      </form>
      <div id="status"></div>
      <h2>Next 10 available dates for upload</h2>
      <ul id="availableDates" style="list-style-type:none; padding-left:0;"></ul>
      <script>
        const dateInput = document.getElementById('date');
        const availableDatesUl = document.getElementById('availableDates');
        const form = document.getElementById('uploadForm');
        async function checkImageExists(date) {
          const statusDiv = document.getElementById('status');
          if (!date) {
            statusDiv.textContent = '';
            return;
          }
          const resp = await fetch('/image-exists?date=' + date);
          const data = await resp.json();
          if (data.exists) {
            statusDiv.textContent = 'An image already exists for ' + date + '. Uploading will replace it.';
          } else {
            statusDiv.textContent = '';
          }
        }
        async function fetchAvailableDates() {
          const resp = await fetch('/next-available-dates');
          const dates = await resp.json();
          availableDatesUl.innerHTML = '';
          for (const d of dates) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = d;
            btn.style.marginBottom = '0.5em';
            btn.addEventListener('click', () => {
              dateInput.value = d;
              checkImageExists(d);
            });
            li.appendChild(btn);
            availableDatesUl.appendChild(li);
          }
        }
        fetchAvailableDates();
        dateInput.addEventListener('change', () => {
          checkImageExists(dateInput.value);
        });
        form.addEventListener('submit', async e => {
          e.preventDefault();
          const formData = new FormData(form);
          const resp = await fetch('/', {
            method: 'POST',
            body: formData,
          });
          const result = await resp.text();
          alert(result);
          // Refresh check status and available dates
          checkImageExists(dateInput.value);
          fetchAvailableDates();
        });
      </script>
    </body>
    </html>
  `);
});
 
// Endpoint to check if image exists for date
app.get('/image-exists', (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.json({ exists: false });
  }
  const filepath = path.join(DATA_DIR, date + '.jpg');
  fs.access(filepath, fs.constants.F_OK, (err) => {
    res.json({ exists: !err });
  });
});
 
+// Endpoint to get next 10 dates without images starting from today
+app.get('/next-available-dates', (_req, res) => {
+  let date = new Date();
+  const availableDates = [];
+  while (availableDates.length < 10) {
+    const isoDate = date.toISOString().slice(0, 10);
+    const filepath = path.join(DATA_DIR, isoDate + '.jpg');
+    if (!fs.existsSync(filepath)) {
+      availableDates.push(isoDate);
+    }
+    date.setDate(date.getDate() + 1);
+  }
+  res.json(availableDates);
+});

// Handle image upload and conversion
app.post('/', upload.single('image'), async (req, res) => {
  const date = req.body.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).send('Invalid or missing date');
  }
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const outputPath = path.join(DATA_DIR, date + '.jpg');

  // Check if file already exists, reject if it does
  if (fs.existsSync(outputPath)) {
    return res.status(400).send('An image already exists for this date. Upload rejected.');
  }

  try {
    // Convert to jpg, resize to exactly 800x480
    await sharp(req.file.buffer)
      .resize(800, 480, { fit: 'fill' })
      .jpeg()
      .toFile(outputPath);

    res.send('Image uploaded and saved successfully.');
  } catch (err) {
    console.error('Image processing error:', err);
    res.status(500).send('Error processing image.');
  }
});

// Endpoint to serve today’s image
app.get('/today-image', (req, res) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const imgPath = path.join(DATA_DIR, today + '.jpg');
  fs.access(imgPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('No image for today found');
    }
    res.sendFile(imgPath);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Inkday server running on port ${PORT}`);
});