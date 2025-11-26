
import React, { useState } from 'react';
import { LessonData, SavedLesson } from '../types';
import { PlayCircle, Lightbulb, Printer, Presentation, FileText, Edit3, Save, X, Bookmark, PenTool, Check } from 'lucide-react';
// @ts-ignore
import PptxGenJS from 'pptxgenjs';

interface LessonViewProps {
  data: LessonData;
  image?: string;
  onStartQuiz: () => void;
  isGeneratingQuiz: boolean;
  onUpdateLesson: (newData: LessonData) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ data, image, onStartQuiz, isGeneratingQuiz, onUpdateLesson }) => {
  const [isDownloadingPPT, setIsDownloadingPPT] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Editing State
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null); // null = intro, 0-n = sections, -1 = funfact (using logic instead)
  const [editingField, setEditingField] = useState<'intro' | 'funFact' | number | null>(null);
  const [editContent, setEditContent] = useState('');

  const COPYRIGHT_TEXT = "حقوق البرنامج محفوظة --- ديم سعد البقمي -- مدارس الاندلس الاهلية بالحمدانية";

  const handleStartEdit = (field: 'intro' | 'funFact' | number, currentContent: string) => {
    setEditingField(field);
    setEditContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditContent('');
  };

  const handleSaveEdit = () => {
    const newData = { ...data };
    
    if (editingField === 'intro') {
      newData.introduction = editContent;
    } else if (editingField === 'funFact') {
      newData.funFact = editContent;
    } else if (typeof editingField === 'number') {
      newData.sections[editingField].content = editContent;
    }

    onUpdateLesson(newData);
    setEditingField(null);
    setEditContent('');
  };

  // --- Save to Local Storage ---
  const handleSaveToLibrary = () => {
    if (isSaved) return;
    setIsSaving(true);
    try {
        const existingStr = localStorage.getItem('darsy_lessons');
        const existingLessons: SavedLesson[] = existingStr ? JSON.parse(existingStr) : [];
        
        const newLesson: SavedLesson = {
            id: Date.now().toString(),
            date: Date.now(),
            data: data,
            imagePreview: image
        };

        const updatedLessons = [newLesson, ...existingLessons];
        localStorage.setItem('darsy_lessons', JSON.stringify(updatedLessons));
        setIsSaved(true);
        // Alert handled by UI change to Check icon
    } catch (e) {
        console.error(e);
        alert('حدث خطأ أثناء حفظ الدرس');
    } finally {
        setIsSaving(false);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    const element = document.getElementById('lesson-content-to-print');
    
    // Improved PDF options for better page breaks and margins
    const opt = {
      margin: [10, 10, 15, 10], // Increased bottom margin for footer
      filename: `${data.title.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      if (window.html2pdf) {
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
      } else {
        alert("خاصية تحميل PDF غير متوفرة حالياً. يرجى استخدام الطباعة كبديل.");
        window.print();
      }
    } catch (e) {
      console.error("PDF Error", e);
      alert("حدث خطأ أثناء تحميل ملف PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadPPT = async () => {
    setIsDownloadingPPT(true);
    try {
      const pres = new PptxGenJS();
      pres.rtlMode = true;
      pres.layout = 'LAYOUT_16x9';

      const KID_BLUE = '4CC9F0';
      const KID_PURPLE = '7209B7';
      const TEXT_DARK = '333333';
      const KID_GREEN = '06D6A0';

      const addCopyright = (slide: any) => {
        slide.addText(COPYRIGHT_TEXT, { x: 0, y: '95%', w: '100%', fontSize: 10, align: 'center', color: '999999', fontFace: 'Arial', rtl: true });
      };

      // Slide 1: Title
      let slide = pres.addSlide();
      slide.background = { color: 'F0F9FF' };
      slide.addText(data.emoji, { x: '45%', y: '15%', fontSize: 60, align: 'center' });
      slide.addText(data.title, { x: '10%', y: '35%', w: '80%', fontSize: 44, align: 'center', color: KID_PURPLE, bold: true, fontFace: 'Arial', rtl: true });
      slide.addText(data.introduction, { x: '10%', y: '55%', w: '80%', fontSize: 18, align: 'center', color: TEXT_DARK, fontFace: 'Arial', rtl: true });

      if (data.teacherName || data.className) {
        const infoText = [
            data.teacherName ? `المعلم/ة: ${data.teacherName}` : '',
            data.className ? `الصف: ${data.className}` : ''
        ].filter(Boolean).join('   |   ');

        slide.addText(infoText, { x: '10%', y: '80%', w: '80%', fontSize: 20, align: 'center', color: '666666', fontFace: 'Arial', rtl: true });
      }
      addCopyright(slide);

      // Sections
      data.sections.forEach((section, index) => {
        slide = pres.addSlide();
        slide.background = { color: 'FFFFFF' };
        slide.addText(`${index + 1}. ${section.heading}`, { x: '5%', y: '5%', w: '90%', fontSize: 32, bold: true, color: KID_BLUE, align: 'right', fontFace: 'Arial', rtl: true });

        if (section.imageUrl) {
          slide.addImage({ path: section.imageUrl, x: '5%', y: '20%', w: '40%', h: '60%', sizing: { type: 'contain' } });
          slide.addText(section.content, { x: '50%', y: '20%', w: '45%', h: '70%', fontSize: 20, color: TEXT_DARK, align: 'right', valign: 'top', fontFace: 'Arial', rtl: true });
        } else {
          slide.addText(section.content, { x: '10%', y: '20%', w: '80%', h: '70%', fontSize: 24, color: TEXT_DARK, align: 'right', valign: 'top', fontFace: 'Arial', rtl: true });
        }
        addCopyright(slide);
      });

      // Fun Fact
      slide = pres.addSlide();
      slide.background = { color: 'FFFBEB' };
      slide.addText("هل تعلم؟", { x: '30%', y: '10%', w: '40%', fontSize: 36, bold: true, color: 'D97706', align: 'center', fontFace: 'Arial', rtl: true });
      slide.addText(data.funFact, { x: '15%', y: '30%', w: '70%', fontSize: 28, color: TEXT_DARK, align: 'center', fontFace: 'Arial', rtl: true });
      slide.addText("💡", { x: '45%', y: '70%', fontSize: 50 });
      addCopyright(slide);

      // Student Worksheet Slide
      slide = pres.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addText("مساحة المبدع الصغير", { x: '5%', y: '10%', w: '90%', fontSize: 32, bold: true, color: KID_GREEN, align: 'right', fontFace: 'Arial', rtl: true });
      slide.addText("ماذا تعرف أيضاً عن هذا الموضوع؟ اكتب أو ارسم هنا:", { x: '5%', y: '20%', w: '90%', fontSize: 20, color: '666666', align: 'right', fontFace: 'Arial', rtl: true });
      
      // Add dotted lines
      for (let i = 0; i < 6; i++) {
         slide.addShape(pres.ShapeType.line, { x: '10%', y: 35 + (i * 10) + '%', w: '80%', h: 0, line: { color: 'CCCCCC', width: 2, dashType: 'dash' } });
      }
      addCopyright(slide);

      await pres.writeFile({ fileName: `${data.title}.pptx` });
    } catch (e) {
      console.error("PPT Generation Error", e);
      alert("حدث خطأ أثناء إنشاء ملف البوربوينت");
    } finally {
      setIsDownloadingPPT(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Toolbar - Sticky on Desktop, Static on Mobile */}
      <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-100 flex flex-wrap justify-between items-center gap-4 no-print">
         <div className="text-gray-500 font-bold hidden md:block">
            أدوات الدرس
         </div>
         <div className="flex gap-2 flex-wrap justify-center w-full md:w-auto" dir="ltr">
            <button 
              onClick={handleSaveToLibrary} 
              disabled={isSaving || isSaved} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                isSaved 
                ? 'bg-green-100 text-green-700 cursor-default' 
                : 'bg-kid-purple/10 text-kid-purple hover:bg-kid-purple hover:text-white'
              }`}
            >
              {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
              <span>{isSaved ? 'تم الحفظ' : 'حفظ الدرس'}</span>
            </button>

            <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all">
              <Printer size={18} />
              <span>طباعة</span>
            </button>
            <button 
              onClick={handleDownloadPDF} 
              disabled={isDownloadingPDF} 
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isDownloadingPDF ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <FileText size={18} />}
              <span>PDF</span>
            </button>
            <button 
              onClick={handleDownloadPPT} 
              disabled={isDownloadingPPT} 
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isDownloadingPPT ? <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div> : <Presentation size={18} />}
              <span>PowerPoint</span>
            </button>
         </div>
      </div>

      {/* Lesson Content Card */}
      <div id="lesson-content-to-print" className="bg-white rounded-3xl shadow-xl overflow-hidden border-b-8 border-kid-yellow print-content relative">
        
        {/* Title Page / Header - Centered with more padding */}
        <div className="bg-kid-yellow py-20 px-6 text-center relative overflow-hidden break-after-page print:break-after-page">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="relative z-10">
             <span className="text-8xl mb-6 block animate-bounce print:hidden">{data.emoji}</span>
             <h1 className="text-5xl md:text-6xl font-black text-yellow-900 mb-6 leading-tight">{data.title}</h1>
             {(data.teacherName || data.className) && (
                <div className="flex flex-wrap justify-center gap-4 mt-8 text-yellow-900 font-bold text-2xl bg-white/40 inline-block px-10 py-4 rounded-full backdrop-blur-sm print:bg-transparent print:text-black border-4 border-white/50">
                    {data.teacherName && <span>المعلم/ة: {data.teacherName}</span>}
                    {data.teacherName && data.className && <span className="opacity-50 mx-2">|</span>}
                    {data.className && <span>الصف: {data.className}</span>}
                </div>
             )}
           </div>
        </div>
        
        <div className="p-8 md:p-12">
            {image && (
                <div className="mb-12 rounded-3xl overflow-hidden shadow-lg border-8 border-gray-100 no-print mx-auto max-w-2xl">
                    <img src={image} alt="Lesson Context" className="w-full h-auto object-cover" />
                </div>
            )}

            <div className="prose prose-lg max-w-none text-center">
                {/* Introduction Section - Centered */}
                <div className="bg-blue-50 p-8 rounded-3xl border-4 border-kid-blue mb-12 print:border-none print:bg-transparent print:p-0 relative group break-inside-avoid shadow-sm">
                    {editingField === 'intro' ? (
                      <div className="space-y-2 no-print">
                        <textarea 
                          className="w-full p-3 border-2 border-kid-blue rounded-xl focus:outline-none h-32 text-center text-xl"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex gap-2 justify-center">
                          <button onClick={handleSaveEdit} className="bg-green-500 text-white p-2 rounded-lg flex items-center gap-1 hover:bg-green-600"><Save size={16}/> حفظ</button>
                          <button onClick={handleCancelEdit} className="bg-gray-400 text-white p-2 rounded-lg flex items-center gap-1 hover:bg-gray-500"><X size={16}/> إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStartEdit('intro', data.introduction)}
                          className="absolute top-2 left-2 text-gray-400 hover:text-kid-blue opacity-0 group-hover:opacity-100 transition-opacity no-print"
                          title="تعديل المقدمة"
                        >
                          <Edit3 size={18} />
                        </button>
                        <h3 className="text-xl font-bold text-kid-blue mb-4">مقدمة</h3>
                        <p className="text-2xl text-blue-900 leading-relaxed font-medium print:text-black whitespace-pre-line">
                            {data.introduction}
                        </p>
                      </>
                    )}
                </div>

                <div className="space-y-12">
                    {data.sections.map((section, idx) => (
                        <div key={idx} className="section-card bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100 hover:shadow-md transition-shadow print:shadow-none print:border-none print:p-0 print:mb-8 relative group break-inside-avoid page-break-inside-avoid text-center">
                            <h3 className="text-3xl font-bold text-kid-purple mb-6 flex justify-center items-center gap-3 print:text-black">
                                <span className="w-10 h-10 rounded-full bg-purple-100 text-kid-purple flex items-center justify-center text-lg print:border print:border-black print:bg-white print:text-black">
                                    {idx + 1}
                                </span>
                                {section.heading}
                            </h3>
                            
                            {section.imageUrl && (
                              <div className="mb-8 rounded-2xl overflow-hidden shadow-sm border-4 border-gray-50 transform hover:scale-[1.01] transition-transform print:shadow-none print:border-none print:transform-none mx-auto max-w-xl">
                                <img 
                                  src={section.imageUrl} 
                                  alt={section.heading} 
                                  className="w-full h-auto object-cover" 
                                />
                              </div>
                            )}
                            
                            {editingField === idx ? (
                              <div className="space-y-2 no-print">
                                <textarea 
                                  className="w-full p-3 border-2 border-kid-purple rounded-xl focus:outline-none h-40 text-center text-lg"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                />
                                <div className="flex gap-2 justify-center">
                                  <button onClick={handleSaveEdit} className="bg-green-500 text-white p-2 rounded-lg flex items-center gap-1 hover:bg-green-600"><Save size={16}/> حفظ</button>
                                  <button onClick={handleCancelEdit} className="bg-gray-400 text-white p-2 rounded-lg flex items-center gap-1 hover:bg-gray-500"><X size={16}/> إلغاء</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleStartEdit(idx, section.content)}
                                  className="absolute top-4 left-4 text-gray-400 hover:text-kid-purple opacity-0 group-hover:opacity-100 transition-opacity no-print bg-white p-1 rounded-full shadow-sm"
                                  title="تعديل النص"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <p className="text-gray-700 text-xl leading-loose print:text-black whitespace-pre-line px-4">
                                    {section.content}
                                </p>
                              </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Fun Fact Section */}
                <div className="mt-12 bg-yellow-50 p-8 rounded-3xl border-4 border-dashed border-kid-yellow flex flex-col items-center gap-4 print:border-black print:bg-transparent relative group break-inside-avoid text-center">
                    {editingField === 'funFact' ? (
                      <div className="w-full space-y-2 no-print">
                        <textarea 
                          className="w-full p-3 border-2 border-kid-yellow rounded-xl focus:outline-none h-24 text-center text-lg"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                         <div className="flex gap-2 justify-center">
                          <button onClick={handleSaveEdit} className="bg-green-500 text-white p-2 rounded-lg flex items-center gap-1 hover:bg-green-600"><Save size={16}/> حفظ</button>
                          <button onClick={handleCancelEdit} className="bg-gray-400 text-white p-2 rounded-lg flex items-center gap-1 hover:bg-gray-500"><X size={16}/> إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStartEdit('funFact', data.funFact)}
                          className="absolute top-2 left-2 text-gray-400 hover:text-kid-yellow opacity-0 group-hover:opacity-100 transition-opacity no-print"
                          title="تعديل المعلومة"
                        >
                          <Edit3 size={18} />
                        </button>
                        <Lightbulb className="w-12 h-12 text-kid-yellow print:text-black" />
                        <div className="w-full">
                            <h4 className="text-2xl font-bold text-yellow-800 mb-2 print:text-black">هل تعلم؟</h4>
                            <p className="text-xl text-yellow-900 print:text-black">{data.funFact}</p>
                        </div>
                      </>
                    )}
                </div>

                {/* Student Worksheet - Handwriting Section */}
                <div className="mt-12 pt-12 border-t-4 border-gray-100 print:mt-12 break-inside-avoid text-center">
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="bg-kid-green/10 p-4 rounded-full text-kid-green print:border print:border-black print:text-black print:bg-transparent">
                           <PenTool size={32} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-700 print:text-black">مساحة المبدع الصغير</h3>
                    </div>

                    <div className="bg-white border-2 border-gray-300 border-dashed rounded-3xl p-8 print:border-black print:shadow-none">
                        <p className="text-gray-500 font-bold mb-8 text-xl print:text-black">
                             ماذا تعرف أيضاً عن هذا الموضوع؟ اكتب أو ارسم هنا:
                        </p>
                        
                        {/* Handwriting Lines */}
                        <div className="space-y-12">
                            {[1, 2, 3, 4, 5].map((line) => (
                                <div key={line} className="border-b-2 border-gray-300 border-dashed h-2 w-full print:border-gray-500"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright Footer (Appears at bottom of content block for HTML/PDF, and fixed for Print) */}
                <div className="copyright-footer text-center text-gray-400 text-xs md:text-sm mt-8 pb-4 font-bold print:fixed print:bottom-0 print:w-full print:bg-white">
                  {COPYRIGHT_TEXT}
                </div>

            </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-center pb-12 no-print">
        <button
            onClick={onStartQuiz}
            disabled={isGeneratingQuiz}
            className={`
                group relative px-8 py-4 rounded-full text-2xl font-bold text-white shadow-xl
                flex items-center gap-3 transition-all transform hover:scale-110 active:scale-95
                ${isGeneratingQuiz ? 'bg-gray-400 cursor-wait' : 'bg-kid-green hover:bg-green-500'}
            `}
        >
            {isGeneratingQuiz ? (
                <span>جاري إعداد الأسئلة...</span>
            ) : (
                <>
                    <span>هيا نلعب ونتعلم!</span>
                    <PlayCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                </>
            )}
            
            {/* Button Glow */}
            {!isGeneratingQuiz && (
                <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse"></div>
            )}
        </button>
      </div>
    </div>
  );
};
