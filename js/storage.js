// Offline Storage Manager for Saving Lesson Plans
const LessonStorage = {
  STORAGE_KEY: 'baraah_saved_lessons',

  // Retrieve all lessons from localStorage
  getLessons() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading lessons from LocalStorage:', error);
      return [];
    }
  },

  // Save a new lesson plan
  saveLesson(grade, subject, topic, content) {
    try {
      const lessons = this.getLessons();
      
      // Check if a similar lesson topic/subject already exists, we can keep multiple or warn.
      // Let's create a unique ID based on timestamp
      const newLesson = {
        id: Date.now().toString(),
        grade,
        subject,
        topic,
        content, // Markdown text
        timestamp: new Date().toISOString()
      };

      lessons.unshift(newLesson); // Add to the top of the list (most recent)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lessons));
      return newLesson;
    } catch (error) {
      console.error('Error saving lesson to LocalStorage:', error);
      throw new Error('فشل حفظ الدرس محلياً. قد تكون مساحة التخزين ممتلئة.');
    }
  },

  // Get a specific lesson by ID
  getLessonById(id) {
    const lessons = this.getLessons();
    return lessons.find(lesson => lesson.id === id) || null;
  },

  // Delete a lesson by ID
  deleteLesson(id) {
    try {
      const lessons = this.getLessons();
      const filtered = lessons.filter(lesson => lesson.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting lesson from LocalStorage:', error);
      return false;
    }
  }
};

// Expose to window scope for easy script access
window.LessonStorage = LessonStorage;
