// Gemini API integration and Markdown Parsing Engine

const GeminiAPI = {


  Numbers: [
    ["AQ.Ab8RN6Ikqeirz", "sUZBoapi2WeH9BWntEuBH", "X9kSID7WNoJVOIag"],
    ["AQ.Ab8RN6JA", "J_qo1hzy7UKbDtjWaBF", "NFe6fje3gJjuP7sKH_hhaSQ"],
    ["AQ.Ab8RN6Ktlx", "RSge20RORXIEelSjNaF7", "xpHOq5EkWjG9_Iig-j_w"]
  ].map(parts => parts.join('')),

  // System Instructions for curriculum generation
  AI_INSTRUCTIONS: `
        You are an expert curriculum designer AI specializing in creating detailed lesson plans for teachers, particularly in Arabic.
        Your task is to generate a comprehensive and practical lesson plan based on the user's request (class grade, subject, lesson topic, and specific requirements).

        **Output Format:**
*   Provide ONLY the lesson plan content, formatted in Arabic.
*   Do NOT include any conversational introductory or concluding phrases like "Here is your lesson plan:", "Certainly!", or "I hope this helps!".
*   Format your response using Markdown-like syntax. Use headings (#, ##, ###), bullet points (* or -), bold (**text**), and italics (*text*). Tables should be formatted using Markdown table syntax (as shown in the example).

        **Lesson Plan Structure (Barā‘ah Model - نموذج براعة):**
        The lesson plan should generally include the following sections, adapted as needed for the specific request. Pay close attention to the structure in the example:
        1.  **عنوان الدرس:** (Derived from user input)
        2.  **الصف:** (Derived from user input)
        3.  **المادة:** (Derived from user input)
        4.  **الزمن الكلي المقترح:** (If specified by user, otherwise suggest a common duration like 45-60 minutes and break it down per activity)
        5.  **الأهداف التعليمية/السلوكية:** (What students will know or be able to do. Use action verbs, e.g., "أن يُميز الطالب...", "أن يَصف الطالب...")
        6.  **المواد والأدوات والوسائل التعليمية:** (List all necessary items, including technology, handouts, fixed resources like whiteboards, and variable resources like videos or specific objects.)
        7.  **إجراءات سير الدرس (مع تحديد الزمن لكل نشاط):**
            *   **التمهيد (Warm-up/Engagement):** How to start the lesson and capture student interest. Include introductory questions.
            *   **الجدول التحضيري (Preparatory Table / Main Activities Table):** This is a key part. Present this as a Markdown table.
            *   **إغلاق (Wrap-up/Closure):** Summary, check for understanding, review activities, and possibly preview next lesson.
        8.  **التقويم:** (How learning will be checked - formative and/or summative activities or questions).
        9.  **مراعاة الفروق الفردية (Differentiation):** (Strategies for diverse learners, if applicable).
        10. **أوراق عمل وأنشطة إثرائية/داعمة (Worksheets and Supporting/Enrichment Activities - Optional but good):** Suggest relevant worksheets or activities, possibly in a table format.
        11. **ملاحظات أو الصعوبات المتوقعة (Notes or Anticipated Difficulties - Optional):** Any additional important notes for the teacher.

        **VERY IMPORTANT EXAMPLE TO FOLLOW FOR STRUCTURE, DETAIL, AND STYLE (نموذج براعة للتعلم النشط):**

        Below is an exemplary lesson plan for a lesson on "حرف الألف" (The letter Alif). Use this as a strong guide for how to structure the output, the level of detail expected in each section, and the Markdown formatting. The user will provide a different topic, grade, and subject. You need to adapt this example's structure to their new request.

        --- EXAMPLE LESSON PLAN ---

        ### 🟢 تحضير درس: حرف الألف

        **المادة:** اللغة العربية
        **الصف:** الأول
        **نموذج التحضير:** براعة للتعلم النشط

        ### 1. التمهيد

        **سؤال تحفيزي:**
        "من يعرف كلمة تبدأ بصوت (أ)؟ هل سمعتم صوت (أ) في كلمة أسد؟"

        **وسائل:**
        عرض صورة كبيرة لحرف الألف (أ) وصورة أسد أو أرنب.

        **تفاعل:**
        تشجيع الطلاب على ذكر كلمات يعرفونها تبدأ بحرف الألف.

        **توضيح:**
        تمييز شكل الحرف وصوته، والفرق بين "أ" و"ا"، والحديث عن أهمية تعلم الحروف في القراءة والكتابة.


        ### 2. جدول التحضير

        | **دور المتعلم** | **دور المعلم** | **الزمن** | **مصادر التعلم** | **صياغة الهدف (فعل مضارع)** | **المستوى** | **المجال** | **المحتوى** |
        |---|---|---|---|---|---|---|---|
        | يستمع ويشارك في المناقشة – يذكر كلمات فيها حرف الألف | الطريقة: العصف الذهني 🔹 طرح سؤال 🔹 تدوين كلمات تبدأ بـ(أ) 🔹 تأكيد الصحيحة 🔹 سؤال تقويمي: سَمِّ ثلاث كلمات تبدأ بحرف الألف | 7 دقائق | 🔹 ثابتة: السبورة، كتاب الحروف، الأقلام 🔹 متغيرة: صور (أسد، أرنب، أناناس) | يسمّي ثلاث كلمات تبدأ بحرف الألف | تذكر | معرفي | التمييز السمعي لحرف الألف |
        | يلاحظ شكل الحرف – يرسمه في الهواء – يكتبه على الطاولة بإصبعه | الطريقة: الاستقراء 🔹 عرض الحرف على السبورة 🔹 تتبع الشكل بالأصبع 🔹 مناقشة موقعه في الكلمة 🔹 سؤال تقويمي: كيف نرسم حرف الألف؟ | 10 دقائق | 🔹 ثابتة: السبورة، قلم السبورة 🔹 متغيرة: بطاقات الحروف، فيديو قصير | يرسم شكل حرف الألف | فهم | معرفي | شكل حرف الألف |
        | يفكر بكلمات – يتعاون مع زميل – يكوّن جملة قصيرة | الطريقة: فكر – زاوج – شارك 🔹 تفكير فردي 🔹 تبادل مع زميل 🔹 عرض على الصف 🔹 سؤال تقويمي: كوّن جملة تبدأ بحرف الألف | 6 دقائق | 🔹 ثابتة: السبورة 🔹 متغيرة: بطاقات كلمات | يكوّن جملة من ثلاث كلمات تبدأ بحرف الألف | تطبيق | معرفي | استخدام الحرف في جملة |
        | يعمل في مجموعة – يلون الحرف – يزينه – يلصق صور كلمات عليه | الطريقة: خلية النحل التقويمية 🔹 توزيع أوراق عمل 🔹 نشاط تزيين الحرف 🔹 عرض الأعمال 🔹 سؤال تقويمي: ماذا وضعت داخل حرف الألف؟ | 8 دقائق | 🔹 ثابتة: أوراق عمل 🔹 متغيرة: ألوان، مجلات، مقص، غراء | يزيّن حرف الألف بصور من بيئته | ممارسة | مهاري | نشاط تلوين الحرف |
        | يلوّن النموذج – يربط بين الحرف والكلمة – يتعرف عليه في كلمات جديدة | الطريقة: الخريطة الذهنية 🔹 عرض خريطة كلمات تبدأ بحرف الألف 🔹 تلوين الحرف في كل كلمة 🔹 سؤال تقويمي: لوّن حرف الألف في كل كلمة | 5 دقائق | 🔹 ثابتة: أوراق تلوين 🔹 متغيرة: خريطة كلمات، صور | يحدّد موضع حرف الألف في الكلمة | إتقان | مهاري | التمييز البصري للحرف |
        | يعمل ضمن مجموعة – يجهز للإجابة – يشرح عند اختياره | الطريقة: الرؤوس المرقمة 🔹 تقسيم الطلاب 🔹 طرح سؤال 🔹 اختيار رقم للإجابة 🔹 سؤال تقويمي: أين سمعت حرف الألف في هذه الكلمة؟ | 6 دقائق | 🔹 ثابتة: السبورة 🔹 متغيرة: تسجيل صوتي، صور | يستمع ويحدّد موقع حرف الألف | تحليل | معرفي | التمييز السمعي والبصري |


        ### 3. الإغلاق

        **مراجعة شفهية:** شكل الحرف، صوته، كلمات تحتويه.

        **سؤال ختامي:** "اذكر لي كلمة فيها (أ) سمعتها اليوم!"

        عرض فيديو قصير فيه أغنية عن حرف الألف.

        توجيه الطلاب لنشاط منزلي بسيط.

        ### 4. الأنشطة الإثرائية

        🔹 **نشاط استكشافي:**
        البحث عن أشياء في البيت تبدأ بحرف الألف وتصويرها.

        🔹 **لعبة تفاعلية:**
        لعبة "أنا أقول وأنت تشير": يُقال "أرنب" والطفل يشير إلى الحرف (أ).

        🔹 **مشروع منزلي:**
        إنشاء "بطاقة الحرف" باستخدام مجلات وقص صور تبدأ بحرف الألف.

        🔹 **نشاط فني:**
        صنع مجسم حرف الألف باستخدام ورق ملون أو صلصال.

        ### 5. الصعوبات المتوقعة

        الخلط بين (أ، ا) أو نطق الحرف بشكل خاطئ.

        صعوبة في رسم الحرف بخط اليد.

        تشتت الانتباه بسبب ضعف التركيز.

        قلة المفردات لدى بعض الطلاب.

        --- END OF EXAMPLE LESSON PLAN ---

        Now, based on the user's specific inputs for grade, subject, topic, and their detailed request, generate a new lesson plan in Arabic, following this structure and style.
  `,

  // Iterate over available keys and try fetching content
  async tryApiKeys(userPrompt, grade, subject, topic) {
    let lastError = null;
    for (const apiKey of this.Numbers) {
      try {
        const response = await this.getAIResponse(userPrompt, grade, subject, topic, apiKey);
        return response; // Return on successful generation
      } catch (error) {
        console.warn(`API Key verification failed for key: ...${apiKey.substring(0, 8)}. Error:`, error);
        lastError = error;
      }
    }
    throw new Error(lastError ? lastError.message : "تعذر الاتصال بجميع مفاتيح واجهة برمجة تطبيقات Gemini.");
  },

  // Perform API call
  async getAIResponse(userPrompt, grade, subject, topic, apiKey) {
    const model = 'gemini-3.1-flash-lite';
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const fullPrompt = `
${this.AI_INSTRUCTIONS}

CONTEXT FOR LESSON PLAN (provided by user via form fields):
Class Grade: ${grade}
Subject: ${subject}
Lesson Topic/Title: ${topic}

USER'S SPECIFIC REQUEST FOR THE LESSON PLAN (from chat input, if any):
${userPrompt} 

Generate the lesson plan in Arabic now based on all the above information and the detailed example provided in the instructions.
Ensure the output is ONLY the lesson plan content, in Markdown, ready for rendering.
`;

    const requestBody = {
      "contents": [{ "parts": [{ "text": fullPrompt }] }],
      "generationConfig": {
        "temperature": 0.6,
        // Removed hardcoded maxOutputTokens (65535) to prevent Bad Request (400) errors.
        // Modern models like gemini-3.1-flash-lite, gemma-4-31b-it, and gemini-3.5-flash
        // have different token limits. Omitting it lets the model default to its max capability.
        "candidateCount": 1
      }
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `خطأ في الاتصال بالخادم: ${response.status}`;
      if (errorData?.error?.message) {
        errorMessage += ` - ${errorData.error.message}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else if (data.promptFeedback?.blockReason) {
      throw new Error(`تم حظر المحتوى بواسطة مرشحات الأمان: ${data.promptFeedback.blockReason}`);
    } else {
      throw new Error("تلقى التطبيق استجابة فارغة أو غير متوقعة من خوادم الذكاء الاصطناعي.");
    }
  },

  // Renders Markdown string to structured HTML inside a message element
  renderMarkdownToHTML(markdownText, contentDiv) {
    contentDiv.innerHTML = '';

    let htmlContent = '';
    let inList = null;
    let inTable = false;
    let tableHeaderParsed = false;

    const lines = markdownText.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Table parsing
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        if (!inTable) {
          htmlContent += '<table class="lesson-table" dir="rtl">';
          inTable = true;
          tableHeaderParsed = false;
        }
        const cells = trimmedLine.slice(1, -1).split('|').map(cell => cell.trim());

        if (!tableHeaderParsed && cells.every(cell => cell.replace(/-/g, '').trim() === '')) {
          tableHeaderParsed = true;
          return;
        }

        htmlContent += '<tr>';
        cells.forEach((cell) => {
          const cellContent = this.applyInlineFormatting(cell);
          if (!tableHeaderParsed) {
            htmlContent += `<th>${cellContent}</th>`;
          } else {
            htmlContent += `<td>${cellContent}</td>`;
          }
        });
        htmlContent += '</tr>';
        return;
      } else if (inTable) {
        htmlContent += '</table>';
        inTable = false;
        tableHeaderParsed = false;
      }

      // Headings
      if (trimmedLine.startsWith('###### ')) {
        htmlContent += `<h6>${this.applyInlineFormatting(trimmedLine.substring(7))}</h6>`;
      } else if (trimmedLine.startsWith('##### ')) {
        htmlContent += `<h5>${this.applyInlineFormatting(trimmedLine.substring(6))}</h5>`;
      } else if (trimmedLine.startsWith('#### ')) {
        htmlContent += `<h4>${this.applyInlineFormatting(trimmedLine.substring(5))}</h4>`;
      } else if (trimmedLine.startsWith('### ')) {
        htmlContent += `<h3>${this.applyInlineFormatting(trimmedLine.substring(4))}</h3>`;
      } else if (trimmedLine.startsWith('## ')) {
        htmlContent += `<h2>${this.applyInlineFormatting(trimmedLine.substring(3))}</h2>`;
      } else if (trimmedLine.startsWith('# ')) {
        htmlContent += `<h1>${this.applyInlineFormatting(trimmedLine.substring(2))}</h1>`;
      }
      // Horizontal lines
      else if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
        htmlContent += '<hr>';
      }
      // Unordered lists
      else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        if (inList !== 'ul') {
          if (inList) htmlContent += `</${inList}>`;
          htmlContent += '<ul>';
          inList = 'ul';
        }
        htmlContent += `<li>${this.applyInlineFormatting(trimmedLine.substring(2))}</li>`;
      }
      // Ordered lists
      else if (trimmedLine.match(/^\d+\.\s/)) {
        if (inList !== 'ol') {
          if (inList) htmlContent += `</${inList}>`;
          htmlContent += '<ol>';
          inList = 'ol';
        }
        htmlContent += `<li>${this.applyInlineFormatting(trimmedLine.replace(/^\d+\.\s/, ''))}</li>`;
      }
      // Paragraphs
      else {
        if (inList) {
          htmlContent += `</${inList}>`;
          inList = null;
        }
        if (trimmedLine !== '') {
          htmlContent += `<p>${this.applyInlineFormatting(trimmedLine)}</p>`;
        }
      }
    });

    if (inList) htmlContent += `</${inList}>`;
    if (inTable) htmlContent += '</table>';

    contentDiv.innerHTML = htmlContent;
  },

  // Parse bold, italic, strikethrough, and code segments
  applyInlineFormatting(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    text = text.replace(/(?<!\*)\*(?!\s|\*)(.*?)(?<!\s|\*)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/(?<!_)\_(?!\s|_)(.*?)(?<!\s|_)\_(?!_)/g, '<em>$1</em>');
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    return text;
  }
};

window.GeminiAPI = GeminiAPI;
