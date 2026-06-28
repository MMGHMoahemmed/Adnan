// Main Application Controller for Baraah Prep

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  // Application State
  state: {
    isOnline: navigator.onLine,
    activeLesson: null, // Current active lesson object { id, grade, subject, topic, content }
    isSaved: false // Whether the current active lesson is saved
  },

  // DOM Elements
  el: {
    sendButton: document.getElementById('sendButton'),
    downloadPdfButton: document.getElementById('downloadPdfButton'),
    lessonDetailsForm: document.getElementById('lessonDetailsForm'),
    chatMessages: document.getElementById('chatMessages'),
    savedLessonsList: document.getElementById('savedLessonsList'),
    savedCountBadge: document.getElementById('saved-count'),
    onlineStatusBadge: document.getElementById('online-status-badge'),
    
    // Tabs
    tabNew: document.getElementById('tab-new'),
    tabSaved: document.getElementById('tab-saved'),
    paneNew: document.getElementById('pane-new'),
    paneSaved: document.getElementById('pane-saved'),

    // Inputs
    classGrade: document.getElementById('classGrade'),
    subject: document.getElementById('subject'),
    lessonName: document.getElementById('lessonName')
  },

  // Initialize App
  init() {
    this.registerServiceWorker();
    this.setupEventListeners();
    this.updateOnlineStatus();
    this.loadSavedLessons();
  },

  // Register PWA Service Worker
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch((error) => {
            console.error('ServiceWorker registration failed: ', error);
          });
      });
    }
  },

  // Setup UI Event Listeners
  setupEventListeners() {
    // Online/Offline Events
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());

    // Sidebar Form Submission
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Tabs Event Listeners
    if (this.el.tabNew && this.el.tabSaved) {
      this.el.tabNew.addEventListener('click', () => this.switchTab('new'));
      this.el.tabSaved.addEventListener('click', () => this.switchTab('saved'));
    }
  },

  // Switch between "New Lesson" and "Saved Lessons" sidebar tabs
  switchTab(tab) {
    if (tab === 'new') {
      this.el.tabNew.classList.add('active');
      this.el.tabSaved.classList.remove('active');
      this.el.paneNew.classList.add('active');
      this.el.paneSaved.classList.remove('active');
    } else {
      this.el.tabNew.classList.remove('active');
      this.el.tabSaved.classList.add('active');
      this.el.paneNew.classList.remove('active');
      this.el.paneSaved.classList.add('active');
    }
  },

  // Sync Internet connection status
  updateOnlineStatus() {
    this.state.isOnline = navigator.onLine;
    
    if (this.el.onlineStatusBadge) {
      if (this.state.isOnline) {
        this.el.onlineStatusBadge.className = 'badge badge-online';
        this.el.onlineStatusBadge.textContent = 'متصل بالإنترنت';
        if (this.el.sendButton) {
          this.el.sendButton.disabled = false;
          this.el.sendButton.textContent = 'إرسال';
        }
      } else {
        this.el.onlineStatusBadge.className = 'badge badge-offline';
        this.el.onlineStatusBadge.textContent = 'أنت غير متصل (تصفح فقط)';
        if (this.el.sendButton) {
          this.el.sendButton.disabled = true;
          this.el.sendButton.textContent = 'غير متصل';
        }
        // If offline and there are saved lessons, switch automatically to saved tab
        const savedLessonsCount = window.LessonStorage.getLessons().length;
        if (savedLessonsCount > 0) {
          this.switchTab('saved');
        }
      }
    }
  },

  // Refresh saved lessons in sidebar
  loadSavedLessons() {
    if (!this.el.savedLessonsList) return;
    
    const lessons = window.LessonStorage.getLessons();
    
    // Update badge numbers
    if (this.el.savedCountBadge) {
      this.el.savedCountBadge.textContent = lessons.length;
    }

    if (lessons.length === 0) {
      this.el.savedLessonsList.innerHTML = `
        <div class="no-saved-lessons">
          <p>لا يوجد دروس محفوظة حالياً.</p>
        </div>
      `;
      return;
    }

    this.el.savedLessonsList.innerHTML = '';
    
    lessons.forEach(lesson => {
      const item = document.createElement('div');
      item.className = 'saved-lesson-item';
      if (this.state.activeLesson && this.state.activeLesson.id === lesson.id) {
        item.classList.add('active');
      }

      // Format date
      const dateStr = new Date(lesson.timestamp).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric'
      });

      item.innerHTML = `
        <div class="saved-lesson-info">
          <span class="saved-lesson-title">${lesson.topic}</span>
          <div class="saved-lesson-meta">
            <span>${lesson.subject}</span> • <span>${lesson.grade}</span> • <span>${dateStr}</span>
          </div>
        </div>
        <button class="delete-lesson-btn" title="حذف" data-id="${lesson.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;

      // Click to view saved lesson
      item.addEventListener('click', (e) => {
        // If clicking delete button, ignore showing
        if (e.target.closest('.delete-lesson-btn')) return;
        this.selectSavedLesson(lesson);
      });

      // Click to delete
      const deleteBtn = item.querySelector('.delete-lesson-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteLesson(lesson.id);
      });

      this.el.savedLessonsList.appendChild(item);
    });
  },

  // View a saved lesson plan
  selectSavedLesson(lesson) {
    this.state.activeLesson = lesson;
    this.state.isSaved = true;
    
    // Highlight list selection
    const items = this.el.savedLessonsList.querySelectorAll('.saved-lesson-item');
    items.forEach(el => {
      el.classList.remove('active');
      if (el.querySelector('.delete-lesson-btn').getAttribute('data-id') === lesson.id) {
        el.classList.add('active');
      }
    });

    this.renderLessonOutput(lesson);
  },

  // Delete a saved lesson plan
  deleteLesson(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف خطة الدرس هذه؟')) {
      window.LessonStorage.deleteLesson(id);
      
      // If the currently viewed lesson is deleted, reset layout
      if (this.state.activeLesson && this.state.activeLesson.id === id) {
        this.state.activeLesson = null;
        this.state.isSaved = false;
        this.el.chatMessages.innerHTML = `
          <div class="initial-placeholder">
            <div class="placeholder-icon"></div>
            <p>تم حذف خطة الدرس. اختر درساً آخر من القائمة أو قم بإنشاء تحضير جديد.</p>
          </div>
        `;
      }
      this.loadSavedLessons();
    }
  },

  // Form submission handler to generate lesson plan
  async handleFormSubmit(event) {
    event.preventDefault();

    if (!this.state.isOnline) {
      alert('لا يمكنك إرسال طلب جديد وأنت غير متصل بالإنترنت. يرجى الاتصال بالشبكة.');
      return;
    }

    const grade = this.el.classGrade.value.trim();
    const subject = this.el.subject.value.trim();
    const topic = this.el.lessonName.value.trim();

    if (!grade || !subject || !topic) {
      alert('الرجاء ملء حقول الصف الدراسي، المادة، وعنوان الدرس.');
      return;
    }

    // Disable Send button & display loading dots
    this.el.sendButton.disabled = true;
    this.el.sendButton.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

    // Set layout placeholder to loading
    this.el.chatMessages.innerHTML = `
      <div class="initial-placeholder">
        <p>جارٍ إنشاء خطة الدرس باستخدام الذكاء الاصطناعي...</p>
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
    `;

    try {
      // Call Gemini API engine
      const markdownResult = await window.GeminiAPI.tryApiKeys("", grade, subject, topic);
      
      // Set active lesson state (not saved in Storage database yet)
      this.state.activeLesson = {
        id: null,
        grade,
        subject,
        topic,
        content: markdownResult,
        timestamp: new Date().toISOString()
      };
      this.state.isSaved = false;

      // Render output with dynamic save buttons
      this.renderLessonOutput(this.state.activeLesson);

    } catch (error) {
      console.error('Failed to generate lesson:', error);
      this.el.chatMessages.innerHTML = `
        <div class="initial-placeholder" style="color: var(--danger);">
          <p>تعذر إنشاء خطة الدرس حالياً.</p>
          <p style="font-size: 0.9em; margin-top: 10px;">${error.message}</p>
        </div>
      `;
    } finally {
      this.el.sendButton.disabled = false;
      this.el.sendButton.innerHTML = 'إرسال';
    }
  },

  // Save the currently generated lesson plan
  saveActiveLesson(btn) {
    if (!this.state.activeLesson || this.state.isSaved) return;

    try {
      const saved = window.LessonStorage.saveLesson(
        this.state.activeLesson.grade,
        this.state.activeLesson.subject,
        this.state.activeLesson.topic,
        this.state.activeLesson.content
      );

      this.state.activeLesson.id = saved.id;
      this.state.isSaved = true;
      
      // Transition save button
      btn.className = 'action-btn';
      btn.disabled = true;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        تم الحفظ
      `;

      // Reload list and switch tab to Saved
      this.loadSavedLessons();
      this.switchTab('saved');
    } catch (error) {
      alert(error.message);
    }
  },

  // Export current lesson plan to PDF
  async downloadActiveLessonPdf(btn) {
    if (!this.state.activeLesson) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'جارٍ تصدير PDF...';

    const lessonPrintArea = document.getElementById('lesson-print-area');

    try {
      const filename = `تحضير_براعة_${this.state.activeLesson.subject}_${this.state.activeLesson.topic}.pdf`;
      await window.PDFExporter.exportToPdf(lessonPrintArea, filename);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('فشل إنشاء وتنزيل ملف PDF. يرجى المحاولة لاحقاً.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  // Render lesson plan and operations menu (Save, PDF) inside Document viewer
  renderLessonOutput(lesson) {
    this.el.chatMessages.innerHTML = '';

    // Create Action bar header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'lesson-card-header';
    
    // Info tag
    const infoSpan = document.createElement('div');
    infoSpan.style.fontWeight = '600';
    infoSpan.style.color = 'var(--text-regular)';
    infoSpan.textContent = `${lesson.subject} - ${lesson.grade}`;
    headerDiv.appendChild(infoSpan);

    // Buttons actions wrapper
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'lesson-actions';

    // Save Button
    const saveBtn = document.createElement('button');
    if (this.state.isSaved) {
      saveBtn.className = 'action-btn';
      saveBtn.disabled = true;
      saveBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        محفوظ محلياً
      `;
    } else {
      saveBtn.className = 'action-btn action-btn-success';
      saveBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        حفظ خطة الدرس
      `;
      saveBtn.addEventListener('click', () => this.saveActiveLesson(saveBtn));
    }
    actionsDiv.appendChild(saveBtn);

    // PDF Download Button
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'action-btn action-btn-primary';
    pdfBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      تحميل PDF
    `;
    pdfBtn.addEventListener('click', () => this.downloadActiveLessonPdf(pdfBtn));
    actionsDiv.appendChild(pdfBtn);

    headerDiv.appendChild(actionsDiv);
    this.el.chatMessages.appendChild(headerDiv);

    // Create Lesson Content Print Box
    const documentWrapper = document.createElement('div');
    documentWrapper.id = 'lesson-print-area';
    documentWrapper.className = 'message';
    documentWrapper.style.padding = '24px';
    documentWrapper.style.flexGrow = '1';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';
    contentDiv.setAttribute('dir', 'rtl');

    // Parse Markdown text to structured DOM elements inside contentDiv
    window.GeminiAPI.renderMarkdownToHTML(lesson.content, contentDiv);
    
    documentWrapper.appendChild(contentDiv);
    this.el.chatMessages.appendChild(documentWrapper);
    
    // Auto-scroll to top of lesson details
    this.el.chatMessages.scrollTop = 0;
  }
};
