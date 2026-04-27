// // 다크 모드 토글 기능 (새로운 기능)
// let isDarkMode = false;

// function toggleDarkMode() {
//     isDarkMode = !isDarkMode;
//     document.body.classList.toggle('dark-mode', isDarkMode);
//     localStorage.setItem('darkMode', isDarkMode);

//     const toggleBtn = document.getElementById('darkModeToggle');
//     if (toggleBtn) {
//         toggleBtn.innerHTML = isDarkMode ?
//             '<i class="fas fa-sun"></i> 라이트 모드' :
//             '<i class="fas fa-moon"></i> 다크 모드';
//     }
// }

// // 다크 모드 초기화 (새로운 기능)
// function initDarkMode() {
//     const saved = localStorage.getItem('darkMode');
//     if (saved === 'true') {
//         isDarkMode = true;
//         document.body.classList.add('dark-mode');
//     }
// }

// // 할 일 검색 기능 (새로운 기능)
// let searchTimeout;

// function searchTodos(query) {
//     clearTimeout(searchTimeout);
//     searchTimeout = setTimeout(async () => {
//         if (!query.trim()) {
//             loadTodos();
//             return;
//         }

//         try {
//             const response = await fetch(`${API_BASE}/todos/search?q=${encodeURIComponent(query)}`);
//             const data = await response.json();

//             if (response.ok) {
//                 displayTodos(data.todos);
//             } else {
//                 showMessage(document.getElementById('searchMessage'), `검색 오류: ${data.message}`, 'error');
//             }
//         } catch (error) {
//             showMessage(document.getElementById('searchMessage'), `검색 실패: ${error.message}`, 'error');
//         }
//     }, 300);
// }

// // 키보드 단축키 지원 (새로운 기능)
// document.addEventListener('keydown', (e) => {
//     // Ctrl/Cmd + N: 새 할 일 추가
//     if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
//         e.preventDefault();
//         document.getElementById('title').focus();
//     }

//     // Ctrl/Cmd + K: 검색창 포커스
//     if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
//         e.preventDefault();
//         const searchInput = document.getElementById('searchInput');
//         if (searchInput) searchInput.focus();
//     }

//     // Ctrl/Cmd + D: 다크 모드 토글
//     if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
//         e.preventDefault();
//         toggleDarkMode();
//     }

//     // ESC: 모든 모달/편집 모드 닫기
//     if (e.key === 'Escape') {
//         document.querySelectorAll('.edit-form.show').forEach(form => {
//             form.classList.remove('show');
//         });
//     }
// });

// // 할 일 내보내기 기능 (새로운 기능)
// async function exportTodos(format = 'json') {
//     try {
//         const response = await fetch(`${API_BASE}/todos/export?format=${format}`);
//         if (response.ok) {
//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `todos.${format}`;
//             document.body.appendChild(a);
//             a.click();
//             window.URL.revokeObjectURL(url);
//             document.body.removeChild(a);

//             showMessage(document.getElementById('exportMessage'), '할 일 목록이 성공적으로 내보내졌습니다!', 'success');
//         } else {
//             const error = await response.json();
//             showMessage(document.getElementById('exportMessage'), `내보내기 실패: ${error.message}`, 'error');
//         }
//     } catch (error) {
//         showMessage(document.getElementById('exportMessage'), `내보내기 오류: ${error.message}`, 'error');
//     }
// }

// // 할 일 가져오기 기능 (새로운 기능)
// function importTodos(file) {
//     const reader = new FileReader();
//     reader.onload = async (e) => {
//         try {
//             let importedData;

//             if (file.name.endsWith('.json')) {
//                 importedData = JSON.parse(e.target.result);
//                 if (importedData.todos) {
//                     importedData = importedData.todos;
//                 }
//             } else if (file.name.endsWith('.csv')) {
//                 // CSV 파싱 로직 (간단한 버전)
//                 const csvText = e.target.result;
//                 const lines = csvText.split('\n').slice(1); // 헤더 제외
//                 importedData = lines.map(line => {
//                     const [id, title, description, priority, completed] = line.split(',');
//                     return {
//                         title: title.replace(/"/g, ''),
//                         description: description ? description.replace(/"/g, '') : '',
//                         priority: priority || 'medium',
//                         completed: completed === 'true'
//                     };
//                 }).filter(todo => todo.title);
//             } else {
//                 throw new Error('지원되지 않는 파일 형식입니다. JSON 또는 CSV 파일만 지원됩니다.');
//             }

//             const response = await fetch(`${API_BASE}/todos/import`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ todos: importedData })
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 showMessage(document.getElementById('importMessage'),
//                     `${result.importedCount}개의 할 일이 성공적으로 가져와졌습니다!`, 'success');
//                 loadTodos();
//                 loadStats();
//             } else {
//                 const error = await response.json();
//                 showMessage(document.getElementById('importMessage'), `가져오기 실패: ${error.message}`, 'error');
//             }
//         } catch (error) {
//             showMessage(document.getElementById('importMessage'), `가져오기 오류: ${error.message}`, 'error');
//         }
//     };
//     reader.readAsText(file);
// }

// // 태그 추가 기능 (새로운 기능)
// async function addTag(todoId, tag) {
//     try {
//         const response = await fetch(`${API_BASE}/todos/${todoId}/tags`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ tag })
//         });

//         if (response.ok) {
//             loadTodos();
//         } else {
//             const error = await response.json();
//             alert(`태그 추가 실패: ${error.message}`);
//         }
//     } catch (error) {
//         alert(`태그 추가 오류: ${error.message}`);
//     }
// }

// // 태그 삭제 기능 (새로운 기능)
// async function removeTag(todoId, tag) {
//     try {
//         const response = await fetch(`${API_BASE}/todos/${todoId}/tags/${encodeURIComponent(tag)}`, {
//             method: 'DELETE'
//         });

//         if (response.ok) {
//             loadTodos();
//         } else {
//             const error = await response.json();
//             alert(`태그 삭제 실패: ${error.message}`);
//         }
//     } catch (error) {
//         alert(`태그 삭제 오류: ${error.message}`);
//     }
// }

// // 할 일 카테고리별 조회 (새로운 기능)
// async function loadTodoCategories() {
//     try {
//         const response = await fetch(`${API_BASE}/todos/categories`);
//         const data = await response.json();

//         if (response.ok) {
//             const categoriesDiv = document.getElementById('categoriesList');
//             if (categoriesDiv) {
//                 categoriesDiv.innerHTML = `
//                     <div class="category-item">
//                         <h4>업무 (${data.summary.work})</h4>
//                         <p>work 태그가 있는 할 일들</p>
//                     </div>
//                     <div class="category-item">
//                         <h4>개인 (${data.summary.personal})</h4>
//                         <p>personal 태그가 있는 할 일들</p>
//                     </div>
//                     <div class="category-item">
//                         <h4>긴급 (${data.summary.urgent})</h4>
//                         <p>높은 우선순위의 미완료 할 일들</p>
//                     </div>
//                     <div class="category-item">
//                         <h4>완료됨 (${data.summary.completed})</h4>
//                         <p>완료된 모든 할 일들</p>
//                     </div>
//                     <div class="category-item">
//                         <h4>대기중 (${data.summary.pending})</h4>
//                         <p>아직 완료되지 않은 할 일들</p>
//                     </div>
//                 `;
//             }
//         }
//     } catch (error) {
//         console.error('카테고리 로드 실패:', error);
//     }
// }