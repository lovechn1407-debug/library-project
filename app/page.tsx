<?php
session_start();
if (!isset($_SESSION['admin_logged_in'])) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - ITS Library</title>
    <link rel="stylesheet" href="../public/style.css">
    <style>
        /* Embedding Admin-specific core styles over the public baseline */
        body { background: #f8fafc; margin: 0; font-family: 'Inter', sans-serif; padding-bottom: 40px; }
        .dashboard { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .header h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .tabs { display: flex; gap: 10px; margin-top: 10px; }
        .tab { padding: 8px 16px; border: none; background: #e2e8f0; border-radius: 20px; cursor: pointer; transition: 0.2s; font-weight: 500; font-size: 0.9rem; }
        .tab.active { background: #3b82f6; color: white; }
        .panel { display: none; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .panel.active { display: block; }
        .grid { display: grid; grid-template-columns: 1fr; gap: 30px; }
        @media (min-width: 1024px) { .grid { grid-template-columns: 1fr 2fr; } }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; color: #475569; font-size: 0.9rem; }
        input, select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
        .btn { padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: #3b82f6; color: white; transition: 0.2s; }
        .btn:hover { background: #2563eb; }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; }
        .table-wrapper { overflow-x: auto; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.9rem; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: #e0f2fe; color: #0284c7; }
        .file-drop { border: 2px dashed #cbd5e1; padding: 40px 20px; text-align: center; border-radius: 12px; cursor: pointer; background: #f8fafc; transition: 0.2s; margin-bottom: 20px; }
        .file-drop:hover { border-color: #3b82f6; background: #eff6ff; }
        .file-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .file-row input, .file-row select { margin: 0; }
        
        /* Skeleton Loader */
        .skeleton {
            background: #e2e8f0;
            background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
            border-radius: 5px;
            background-size: 200% 100%;
            animation: 1.5s shine linear infinite;
        }

        @keyframes shine {
            to {
                background-position-x: -200%;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <header class="header">
            <div>
                <h2>Admin Panel</h2>
                <div class="tabs">
                    <button class="tab active" onclick="switchTab('manage')">Manage Documents</button>
                    <button class="tab" onclick="switchTab('settings')">Settings (Subjects)</button>
                </div>
            </div>
            <div>
                <a href="../public/index.html" class="btn" style="background:#cbd5e1; color:#0f172a; text-decoration:none; margin-right:10px;">Public Library</a>
                <a href="../api/logout.php" class="btn btn-danger" style="text-decoration:none;">Logout</a>
            </div>
        </header>

        <!-- MANAGE DOCUMENTS TAB -->
        <div id="manage" class="panel active">
            <div class="grid">
                <!-- Upload Form -->
                <div>
                    <h3>Upload Documents</h3>
                    <form id="uploadForm">
                        <div class="form-group">
                            <label>Course</label>
                            <select id="courseSelect" required onchange="filterSubjects()">
                                <option value="B.Tech">B.Tech</option>
                                <option value="B.Pharm">B.Pharm</option>
                                <option value="BBA">BBA</option>
                                <option value="BCA">BCA</option>
                                <option value="MCA">MCA</option>
                            </select>
                        </div>
                        <div style="display: flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label>Semester</label>
                                <select id="semesterSelect" required>
                                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                                    <option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option>
                                </select>
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Year</label>
                                <input type="text" id="yearInput" value="2024-25" required>
                            </div>
                        </div>

                        <div class="file-drop" onclick="document.getElementById('fileInput').click()">
                            <input type="file" id="fileInput" multiple style="display:none;" onchange="handleFiles(this.files)">
                            <strong>Click to select PDFs</strong>
                        </div>
                        
                        <div id="fileList"></div>
                        
                        <button type="submit" class="btn" id="uploadBtn" style="width:100%; display:none;">Start Upload</button>
                    </form>
                </div>

                <!-- Existing Documents -->
                <div>
                    <h3>Existing Documents</h3>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Course</th>
                                    <th>Sem</th>
                                    <th>Subject Tag</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="documentsTableBody">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- SETTINGS TAB -->
        <div id="settings" class="panel">
            <div class="grid">
                <div>
                    <h3>Add New Subject</h3>
                    <form id="subjectForm" onsubmit="addSubject(event)">
                        <div class="form-group">
                            <label>Subject Name</label>
                            <input type="text" id="newSubjectName" required>
                        </div>
                        <div class="form-group">
                            <label>Course</label>
                            <select id="newSubjectCourse" required>
                                <option value="B.Tech">B.Tech</option>
                                <option value="B.Pharm">B.Pharm</option>
                                <option value="BBA">BBA</option>
                                <option value="BCA">BCA</option>
                                <option value="MCA">MCA</option>
                            </select>
                        </div>
                        <button type="submit" class="btn">Add Subject</button>
                    </form>
                </div>
                <div>
                    <h3>Existing Subjects</h3>
                    <div class="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Subject Name</th>
                                    <th>Course</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="subjectsTableBody">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- The Vanilla JS Port of the Admin Logic -->
    <script>
        let allSubjects = [];
        let selectedFilesData = [];

        function switchTab(tabId) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add('active');
            document.getElementById(tabId).classList.add('active');
        }

        // --- Data Fetching ---
        async function fetchSubjects() {
            try {
                const tbody = document.getElementById('subjectsTableBody');
                let skeletonRows = '';
                for(let i=0; i<3; i++) {
                    skeletonRows += `
                        <tr>
                            <td><div class="skeleton" style="height: 20px; width: 70%;"></div></td>
                            <td><div class="skeleton" style="height: 24px; width: 60px; border-radius: 12px;"></div></td>
                            <td><div class="skeleton" style="height: 30px; width: 60px; border-radius: 6px;"></div></td>
                        </tr>
                    `;
                }
                if(tbody) tbody.innerHTML = skeletonRows;

                const res = await fetch('../api/get_subjects.php');
                const data = await res.json();
                if (data.error) { alert("Database Error: " + data.error); return; }
                allSubjects = data;
                renderSubjectsTable();
                filterSubjects(); // Update dropdowns in file uploader
            } catch(e) { console.error(e); }
        }

        async function fetchDocuments() {
            try {
                const tbody = document.getElementById('documentsTableBody');
                let skeletonRows = '';
                for(let i=0; i<5; i++) {
                    skeletonRows += `
                        <tr>
                            <td><div class="skeleton" style="height: 20px; width: 80%;"></div></td>
                            <td><div class="skeleton" style="height: 24px; width: 60px; border-radius: 12px;"></div></td>
                            <td><div class="skeleton" style="height: 20px; width: 30px;"></div></td>
                            <td><div class="skeleton" style="height: 24px; width: 80px; border-radius: 12px;"></div></td>
                            <td><div class="skeleton" style="height: 30px; width: 60px; border-radius: 6px;"></div></td>
                        </tr>
                    `;
                }
                if(tbody) tbody.innerHTML = skeletonRows;

                const res = await fetch('../api/get_documents.php');
                const docs = await res.json();
                if (docs.error) { console.error("Database Error: " + docs.error); return; }
                
                tbody.innerHTML = '';
                
                docs.forEach(doc => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${doc.file_name}</strong></td>
                        <td><span class="badge">${doc.course}</span></td>
                        <td>${doc.semester}</td>
                        <td>${doc.subject_tag ? `<span class="badge" style="background:#dcfce7; color:#166534;">${doc.subject_tag}</span>` : '-'}</td>
                        <td><button onclick="deleteDocument(${doc.id})" class="btn btn-danger" style="padding:6px 12px; font-size:0.8rem;">Delete</button></td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch(e) { console.error("Network or parsing error in fetchDocuments:", e); }
        }

        // --- Subjects Logic ---
        function renderSubjectsTable() {
            const tbody = document.getElementById('subjectsTableBody');
            tbody.innerHTML = '';
            allSubjects.forEach(sub => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${sub.name}</strong></td>
                    <td><span class="badge">${sub.course}</span></td>
                    <td><button onclick="deleteSubject(${sub.id})" class="btn btn-danger" style="padding:6px 12px; font-size:0.8rem;">Remove</button></td>
                `;
                tbody.appendChild(tr);
            });
        }

        async function addSubject(e) {
            e.preventDefault();
            const name = document.getElementById('newSubjectName').value;
            const course = document.getElementById('newSubjectCourse').value;
            
            const res = await fetch('../api/add_subject.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, course })
            });
            
            if(res.ok) {
                document.getElementById('newSubjectName').value = '';
                fetchSubjects();
            }
        }

        async function deleteSubject(id) {
            if(!confirm("Delete this subject?")) return;
            const res = await fetch(`../api/delete_subject.php?id=${id}`);
            if(res.ok) fetchSubjects();
        }

        // --- File Upload Logic ---
        function handleFiles(files) {
            Array.from(files).forEach(file => {
                selectedFilesData.push({
                    file: file,
                    name: file.name,
                    tag: ''
                });
            });
            renderFileList();
            document.getElementById('uploadBtn').style.display = selectedFilesData.length > 0 ? 'block' : 'none';
        }

        function renderFileList() {
            const container = document.getElementById('fileList');
            const currentCourse = document.getElementById('courseSelect').value;
            const relevantSubjects = allSubjects.filter(s => s.course === currentCourse);
            
            container.innerHTML = '';
            selectedFilesData.forEach((f, index) => {
                const row = document.createElement('div');
                row.className = 'file-row';
                
                // Name Input
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = f.name;
                nameInput.onchange = (e) => { selectedFilesData[index].name = e.target.value; };
                nameInput.style.flex = "2";
                
                // Subject Dropdown
                const tagSelect = document.createElement('select');
                tagSelect.style.flex = "1";
                tagSelect.innerHTML = `<option value="">No Subject</option>`;
                relevantSubjects.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub.name;
                    opt.textContent = sub.name;
                    if (f.tag === sub.name) opt.selected = true;
                    tagSelect.appendChild(opt);
                });
                tagSelect.onchange = (e) => { selectedFilesData[index].tag = e.target.value; };

                // Remove Btn
                const rmBtn = document.createElement('button');
                rmBtn.textContent = 'X';
                rmBtn.className = 'btn btn-danger';
                rmBtn.type = 'button';
                rmBtn.style.padding = '8px';
                rmBtn.onclick = () => {
                    selectedFilesData.splice(index, 1);
                    renderFileList();
                    if(selectedFilesData.length === 0) document.getElementById('uploadBtn').style.display = 'none';
                };

                row.appendChild(nameInput);
                row.appendChild(tagSelect);
                row.appendChild(rmBtn);
                container.appendChild(row);
            });
        }

        function filterSubjects() {
            // Re-render file list to update subject dropdowns based on course change
            renderFileList();
        }

        document.getElementById('uploadForm').onsubmit = async (e) => {
            e.preventDefault();
            if (selectedFilesData.length === 0) return;

            const btn = document.getElementById('uploadBtn');
            btn.textContent = 'Uploading to Telegram...';
            btn.disabled = true;

            const formData = new FormData();
            formData.append('course', document.getElementById('courseSelect').value);
            formData.append('semester', document.getElementById('semesterSelect').value);
            formData.append('year', document.getElementById('yearInput').value);

            selectedFilesData.forEach(f => {
                formData.append('files[]', f.file);
                formData.append('file_names[]', f.name);
                formData.append('subject_tags[]', f.tag);
            });

            try {
                const res = await fetch('../api/upload.php', {
                    method: 'POST',
                    body: formData
                });
                
                if (res.ok) {
                    alert('Upload Success!');
                    selectedFilesData = [];
                    renderFileList();
                    fetchDocuments();
                    btn.style.display = 'none';
                } else {
                    const err = await res.json();
                    let errMsg = err.error || 'Unknown Error';
                    if (err.details) errMsg += '\\nDetails: ' + JSON.stringify(err.details, null, 2);
                    alert('Upload Failed:\\n' + errMsg);
                }
            } catch(err) {
                alert('Upload failed due to network error.');
            } finally {
                btn.textContent = 'Start Upload';
                btn.disabled = false;
            }
        };

        async function deleteDocument(id) {
            if(!confirm("Delete this document?")) return;
            const res = await fetch(`../api/delete_doc.php?id=${id}`);
            if(res.ok) fetchDocuments();
        }

        // Init
        fetchSubjects();
        fetchDocuments();
    </script>
</body>
</html>
