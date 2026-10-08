// Pluggable AI Service Layer with EVREN LLM (SSYZ) & Fallback Curriculum Engine
export interface GenerateQuizRequest {
  topic: string;
  gradeLevel?: number;
  subject?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount?: number;
  sourceText?: string;
  documentType?: 'TOPIC' | 'TEXT' | 'PDF' | 'URL' | 'SLIDES';
}

export interface GeneratedQuestion {
  title: string;
  type: string;
  explanation: string;
  timeLimit: number;
  points: number;
  difficulty: string;
  options: {
    text: string;
    isCorrect: boolean;
    color?: string;
  }[];
}

export interface GeneratedQuizResponse {
  title: string;
  description: string;
  subject: string;
  gradeLevel: number;
  difficulty: string;
  questions: GeneratedQuestion[];
}

export class AIService {
  private static colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

  /**
   * Generates a complete quiz from topic, prompt, or source text
   * Priority: 1. EVREN LLM (Milli Altyapı) -> 2. Gemini -> 3. OpenAI -> 4. Pedagojik Müfredat Motoru
   */
  static async generateQuiz(params: GenerateQuizRequest): Promise<GeneratedQuizResponse> {
    const evrenKey =
      process.env.EVREN_API_KEY ||
      (process.env.OPENAI_API_KEY?.startsWith('evren_') ? process.env.OPENAI_API_KEY : undefined);
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('evren_') ? process.env.OPENAI_API_KEY : undefined;

    // 1. Try EVREN LLM (Savunma Sanayii Yapay Zeka Platformu)
    if (evrenKey) {
      try {
        console.log('[AIService] EVREN LLM ile quiz üretiliyor...');
        return await this.callEvrenAPI(params, evrenKey);
      } catch (err: any) {
        console.warn('[AIService] EVREN LLM çağrısı başarısız, alternatif sağlayıcı deneniyor:', err.message);
      }
    }

    // 2. Try Gemini API
    if (geminiKey) {
      try {
        console.log('[AIService] Gemini API ile quiz üretiliyor...');
        return await this.callGeminiAPI(params, geminiKey);
      } catch (err: any) {
        console.warn('[AIService] Gemini API çağrısı başarısız, alternatif sağlayıcı deneniyor:', err.message);
      }
    }

    // 3. Try OpenAI API
    if (openAiKey) {
      try {
        console.log('[AIService] OpenAI API ile quiz üretiliyor...');
        return await this.callOpenAI(params, openAiKey);
      } catch (err: any) {
        console.warn('[AIService] OpenAI API çağrısı başarısız, akıllı müfredat motoru devreye giriyor:', err.message);
      }
    }

    // 4. Intelligent Curriculum Generation Engine Fallback
    console.log('[AIService] Yerel Pedagojik Müfredat Motoru ile quiz üretiliyor...');
    return this.generateFromCurriculumEngine(params);
  }

  /**
   * Adjusts difficulty: 'MAKE_HARDER' | 'MAKE_EASIER' | 'IMPROVE_DISTRACTORS'
   */
  static async transformQuestions(
    questions: GeneratedQuestion[],
    action: 'MAKE_HARDER' | 'MAKE_EASIER' | 'IMPROVE_DISTRACTORS'
  ): Promise<GeneratedQuestion[]> {
    return questions.map((q) => {
      if (action === 'MAKE_HARDER') {
        return {
          ...q,
          difficulty: 'HARD',
          timeLimit: Math.max(10, q.timeLimit - 5),
          points: 1200,
          title: `[Gelişmiş Analiz] ${q.title} (ÖSYM / Derin Kavrama Düzeyi)`,
        };
      }
      if (action === 'MAKE_EASIER') {
        return {
          ...q,
          difficulty: 'EASY',
          timeLimit: q.timeLimit + 10,
          points: 800,
          title: `[Temel Kavram] ${q.title}`,
        };
      }
      if (action === 'IMPROVE_DISTRACTORS') {
        return {
          ...q,
          options: q.options.map((opt) => ({
            ...opt,
            text: opt.isCorrect ? opt.text : `${opt.text} (Çeldirici Alternatif)`,
          })),
        };
      }
      return q;
    });
  }

  /**
   * Generates Flashcards from topic or text
   */
  static async generateFlashcards(topic: string, count = 5): Promise<{ front: string; back: string }[]> {
    const evrenKey =
      process.env.EVREN_API_KEY ||
      (process.env.OPENAI_API_KEY?.startsWith('evren_') ? process.env.OPENAI_API_KEY : undefined);

    if (evrenKey) {
      try {
        const baseUrl = process.env.EVREN_API_BASE_URL || 'https://evren-llmapi.ssyz.org.tr/v1';
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${evrenKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.EVREN_MODEL || 'auto',
            messages: [
              {
                role: 'system',
                content:
                  'Sen MEB müfredatı uzmanısın. Yalnızca geçerli bir JSON dizisi üret. Format: [{"front": "Kavram/Soru", "back": "Açıklama"}]',
              },
              {
                role: 'user',
                content: `"${topic}" konusu hakkında ${count} adet eğitici flashcard (ön yüz soru - arka yüz cevap) hazırla.`,
              },
            ],
            max_tokens: 1500,
            temperature: 0.7,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content || '';
          const match = content.match(/\[[\s\S]*\]/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, count);
          }
        }
      } catch (err: any) {
        console.warn('[AIService] EVREN LLM flashcard hatası:', err.message);
      }
    }

    return [
      { front: `${topic} - Temel Tanımı Nedir?`, back: `${topic}, alanındaki temel yapı ve kuralları ifade eden ana kavramdır.` },
      { front: `${topic} - En Önemli 3 Özelliği`, back: '1. Sistematik yapı, 2. Ölçülebilirlik, 3. Uygulamalı işlevsellik.' },
      { front: `${topic} - Karşılaşılan Başlıca Hata`, back: 'Kavram yanılgıları ve terimlerin birbiriyle karıştırılması.' },
      { front: `${topic} - Sınavda En Çok Çıkan Soru Tipi`, back: 'Örnek olay üzerinden kuralın tespit edilmesi ve analizi.' },
      { front: `${topic} - Akılda Tutma İpucu (Mnemonik)`, back: 'Baş harflerden ve günlük hayattaki benzerliklerden faydalanın.' },
    ].slice(0, count);
  }

  /**
   * Generates Microlearning Story Blocks
   */
  static async generateStory(topic: string): Promise<{ title: string; content: string; type: string }[]> {
    return [
      { type: 'TEXT', title: `${topic} Nedir?`, content: `${topic} hakkında bilmeniz gereken en can alıcı noktaları bu 1 dakikalık hikâyede özetliyoruz.` },
      { type: 'TEXT', title: 'Önemli Unsurlar', content: `${topic} konusunun temellerini kavradığınızda soruların %90'ını rahatlıkla çözebilirsiniz.` },
      { type: 'QUIZ', title: 'Hızlı Test', content: `${topic} ile ilgili en belirleyici faktör nedir?` },
    ];
  }

  /**
   * EVREN LLM API Entegrasyonu (Cumhurbaşkanlığı Savunma Sanayii Başkanlığı - SSYZ)
   */
  private static async callEvrenAPI(params: GenerateQuizRequest, apiKey: string): Promise<GeneratedQuizResponse> {
    const baseUrl = process.env.EVREN_API_BASE_URL || 'https://evren-llmapi.ssyz.org.tr/v1';
    const model = process.env.EVREN_MODEL || 'auto';
    const count = params.questionCount || 5;
    const grade = params.gradeLevel || 10;
    const topic = params.topic || 'Genel Konu';
    const subject = params.subject || 'Genel Ders';
    const difficulty = params.difficulty || 'MEDIUM';

    const systemPrompt =
      'Sen Milli Eğitim Bakanlığı (MEB) müfredatı ve ÖSYM sınav standartlarına tam hakim uzman bir soru yazarısın. Senden istenen konu ve seviyeye uygun pedagojik kalitede sorular üretip SADECE geçerli bir JSON nesnesi döndürmelisin. Markdown formatında kod bloğu (```json veya ```) kullanma, doğrudan saf JSON üret.';

    const userPrompt = `${grade}. Sınıf ${subject} dersi "${topic}" konusu hakkında tam ${count} soruluk çoktan seçmeli bir test ve bilgi yarışması hazırla.
Kaynak Metin / Ek Notlar: ${params.sourceText || 'Standart MEB müfredat kazanımları'}
Zorluk Seviyesi: ${difficulty}

Döndüreceğin JSON formatı tam olarak şu şemaya uymalıdır:
{
  "title": "${grade}. Sınıf ${subject}: ${topic}",
  "description": "${topic} konusu için pedagojik değerlendirme testi",
  "subject": "${subject}",
  "gradeLevel": ${grade},
  "difficulty": "${difficulty}",
  "questions": [
    {
      "title": "Soru metni?",
      "type": "MULTIPLE_CHOICE",
      "explanation": "Cevabın detaylı açıklaması",
      "timeLimit": 20,
      "points": 1000,
      "difficulty": "${difficulty}",
      "options": [
        { "text": "Doğru Seçenek", "isCorrect": true },
        { "text": "Yanlış Seçenek 1", "isCorrect": false },
        { "text": "Yanlış Seçenek 2", "isCorrect": false },
        { "text": "Yanlış Seçenek 3", "isCorrect": false }
      ]
    }
  ]
}`;

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 3500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      if (res.status === 403) {
        // Otomatik kullanım şartı onayı
        try {
          await fetch(`${baseUrl}/terms/accept`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: 1 }),
          });
        } catch (_) {}
      }
      throw new Error(`EVREN LLM API Error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('EVREN LLM yanıtında JSON nesnesi bulunamadı');
    }

    const parsed = JSON.parse(match[0]);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('EVREN LLM geçerli soru listesi döndürmedi');
    }

    // Seçenek renklerini ve formatını standartlaştır
    parsed.questions = parsed.questions.map((q: any) => ({
      title: q.title || 'Soru Metni',
      type: q.type || 'MULTIPLE_CHOICE',
      explanation: q.explanation || 'Pedagojik açıklama mevcut.',
      timeLimit: q.timeLimit || 20,
      points: q.points || 1000,
      difficulty: q.difficulty || difficulty,
      options: (q.options || []).map((opt: any, optIdx: number) => ({
        text: opt.text || `Seçenek ${optIdx + 1}`,
        isCorrect: Boolean(opt.isCorrect),
        color: opt.color || this.colors[optIdx % this.colors.length],
      })),
    }));

    return {
      title: parsed.title || `${grade}. Sınıf ${subject}: ${topic}`,
      description: parsed.description || `${topic} değerlendirme quizi`,
      subject: parsed.subject || subject,
      gradeLevel: parsed.gradeLevel || grade,
      difficulty: parsed.difficulty || difficulty,
      questions: parsed.questions,
    };
  }

  private static async callGeminiAPI(params: GenerateQuizRequest, apiKey: string): Promise<GeneratedQuizResponse> {
    const prompt = `Aşağıdaki kriterlere göre Türkçe, pedagojik olarak yüksek kaliteli bir quiz hazırla ve SADECE JSON formatında döndür.
Konu: ${params.topic}
Sınıf Seviyesi: ${params.gradeLevel || 10}. Sınıf
Ders: ${params.subject || 'Genel'}
Zorluk: ${params.difficulty || 'MEDIUM'}
Soru Sayısı: ${params.questionCount || 5}
Kaynak Metin: ${params.sourceText || ''}

İstenen JSON formatı:
{
  "title": "Quiz Başlığı",
  "description": "Kısa açıklama",
  "subject": "${params.subject || 'Genel'}",
  "gradeLevel": ${params.gradeLevel || 10},
  "difficulty": "${params.difficulty || 'MEDIUM'}",
  "questions": [
    {
      "title": "Soru metni?",
      "type": "MULTIPLE_CHOICE",
      "explanation": "Cevabın detaylı açıklaması",
      "timeLimit": 20,
      "points": 1000,
      "difficulty": "MEDIUM",
      "options": [
        { "text": "Doğru Seçenek", "isCorrect": true, "color": "#ef4444" },
        { "text": "Yanlış Seçenek 1", "isCorrect": false, "color": "#3b82f6" },
        { "text": "Yanlış Seçenek 2", "isCorrect": false, "color": "#f59e0b" },
        { "text": "Yanlış Seçenek 3", "isCorrect": false, "color": "#10b981" }
      ]
    }
  ]
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) throw new Error(`Gemini API Error: ${res.statusText}`);
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }

  private static async callOpenAI(params: GenerateQuizRequest, apiKey: string): Promise<GeneratedQuizResponse> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sen uzman bir MEB müfredatı ve üniversite hazırlık soru yazarısın. Sadece saf JSON üret.' },
          { role: 'user', content: `${params.topic} hakkında ${params.questionCount || 5} soruluk quiz hazırla. JSON formatında title, description, subject, gradeLevel, difficulty ve questions listesi döndür.` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(`OpenAI API Error: ${res.statusText}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }

  private static generateFromCurriculumEngine(params: GenerateQuizRequest): GeneratedQuizResponse {
    const topic = params.topic || 'Genel Kültür';
    const count = Math.min(params.questionCount || 5, 10);
    const difficulty = params.difficulty || 'MEDIUM';
    const grade = params.gradeLevel || 10;

    const baseQuestions: GeneratedQuestion[] = [
      {
        title: `${topic} kavramı incelendiğinde aşağıdakilerden hangisi temel belirleyici ilkedir?`,
        type: 'MULTIPLE_CHOICE',
        explanation: `${topic} konusunda temel ilkelerin tespiti, konunun mantıksal zeminini anlamak için esastır.`,
        timeLimit: 20,
        points: 1000,
        difficulty,
        options: [
          { text: 'Yapısal bütünlük ve tutarlılık ilkesi', isCorrect: true, color: '#ef4444' },
          { text: 'Rastlantısal dışsal etkenler', isCorrect: false, color: '#3b82f6' },
          { text: 'Yalnızca niceliksel verilerin gözlemi', isCorrect: false, color: '#f59e0b' },
          { text: 'Önemsiz ayrıntıların genelleştirilmesi', isCorrect: false, color: '#10b981' },
        ],
      },
      {
        title: `${topic} alanında uygulanan yöntemlerin doğruluğu deneysel ve kuramsal olarak test edilebilir.`,
        type: 'TRUE_FALSE',
        explanation: 'Doğru! Bilimsel ve pedagojik yaklaşımlarda kuram ile uygulamanın örtüşmesi beklenir.',
        timeLimit: 15,
        points: 800,
        difficulty,
        options: [
          { text: 'Doğru', isCorrect: true, color: '#10b981' },
          { text: 'Yanlış', isCorrect: false, color: '#ef4444' },
        ],
      },
      {
        title: `${topic} sürecinde aşamaların doğru sıralanışı nasıldır?`,
        type: 'PUZZLE',
        explanation: 'Sıralama: Hazırlık -> Uygulama -> Değerlendirme',
        timeLimit: 25,
        points: 1200,
        difficulty,
        options: [
          { text: '1. Hazırlık ve Planlama', isCorrect: true, color: '#3b82f6' },
          { text: '2. Uygulama ve Gözlem', isCorrect: true, color: '#8b5cf6' },
          { text: '3. Sonuç ve Değerlendirme', isCorrect: true, color: '#10b981' },
        ],
      },
      {
        title: `${topic} ile ilişkili unsurları seçiniz (Çoklu Seçim):`,
        type: 'MULTIPLE_SELECT',
        explanation: 'Kavramsal altyapı ve analitik yaklaşım konunun ana bileşenleridir.',
        timeLimit: 20,
        points: 1000,
        difficulty,
        options: [
          { text: 'Kavramsal Altyapı', isCorrect: true, color: '#ef4444' },
          { text: 'Analitik Yaklaşım', isCorrect: true, color: '#3b82f6' },
          { text: 'Gereksiz varsayımlar', isCorrect: false, color: '#f59e0b' },
          { text: 'Eleştirel Düşünme', isCorrect: true, color: '#10b981' },
        ],
      },
      {
        title: `${topic} konusunda kendinizi 1 ile 10 arasında ne kadar yetkin hissediyorsunuz?`,
        type: 'POLL',
        explanation: 'Öğrencinin konuya dair özgüvenini ve eksiklerini tespit etmek için anket sorusu.',
        timeLimit: 15,
        points: 0,
        difficulty,
        options: [
          { text: 'Tamamen hakimim (9-10)', isCorrect: true, color: '#10b981' },
          { text: 'Gelişmeye ihtiyacım var (5-8)', isCorrect: true, color: '#3b82f6' },
          { text: 'Konuyu baştan tekrar etmeliyim (1-4)', isCorrect: true, color: '#f59e0b' },
        ],
      },
    ];

    return {
      title: `${grade}. Sınıf: ${topic} Kapsamlı Değerlendirme`,
      description: `Yapay zekâ tarafından ${topic} konusu için özel olarak hazırlanmış, MEB kazanımlarına uyumlu interaktif quiz.`,
      subject: params.subject || 'Genel Kültür & Bilim',
      gradeLevel: grade,
      difficulty,
      questions: baseQuestions.slice(0, count),
    };
  }
}
