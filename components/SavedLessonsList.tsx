
import React, { useState, useEffect } from 'react';
import { SavedLesson } from '../types';
import { Trash2, Play, Calendar, Presentation } from 'lucide-react';
// @ts-ignore
import PptxGenJS from 'pptxgenjs';

interface SavedLessonsListProps {
  onSelectLesson: (lesson: SavedLesson) => void;
  onBack: () => void;
}

export const SavedLessonsList: React.FC<SavedLessonsListProps> = ({ onSelectLesson, onBack }) => {
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadedLessons = localStorage.getItem('darsy_lessons');
    if (loadedLessons) {
      try {
        setLessons(JSON.parse(loadedLessons));
      } catch (e) {
        console.error("Failed to parse lessons", e);
      }
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
      const updatedLessons = lessons.filter(l => l.id !== id);
      setLessons(updatedLessons);
      localStorage.setItem('darsy_lessons', JSON.stringify(updatedLessons));
    }
  };

  const handleDownloadPPT = async (lesson: SavedLesson, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(lesson.id);
    const data = lesson.data;

    try {
      const pres = new PptxGenJS();
      pres.rtlMode = true;
      pres.layout = 'LAYOUT_16x9';

      const KID_BLUE = '4CC9F0';
      const KID_PURPLE = '7209B7';
      const TEXT_DARK = '333333';
      const KID_GREEN = '06D6A0';

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
      });

      // Fun Fact
      slide = pres.addSlide();
      slide.background = { color: 'FFFBEB' };
      slide.addText("هل تعلم؟", { x: '30%', y: '10%', w: '40%', fontSize: 36, bold: true, color: 'D97706', align: 'center', fontFace: 'Arial', rtl: true });
      slide.addText(data.funFact, { x: '15%', y: '30%', w: '70%', fontSize: 28, color: TEXT_DARK, align: 'center', fontFace: 'Arial', rtl: true });
      slide.addText("💡", { x: '45%', y: '70%', fontSize: 50 });

      // Student Worksheet Slide
      slide = pres.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addText("مساحة المبدع الصغير", { x: '5%', y: '10%', w: '90%', fontSize: 32, bold: true, color: KID_GREEN, align: 'right', fontFace: 'Arial', rtl: true });
      slide.addText("ماذا تعرف أيضاً عن هذا الموضوع؟ اكتب أو ارسم هنا:", { x: '5%', y: '20%', w: '90%', fontSize: 20, color: '666666', align: 'right', fontFace: 'Arial', rtl: true });
      
      for (let i = 0; i < 6; i++) {
         slide.addShape(pres.ShapeType.line, { x: '10%', y: 35 + (i * 10) + '%', w: '80%', h: 0, line: { color: 'CCCCCC', width: 2, dashType: 'dash' } });
      }

      await pres.writeFile({ fileName: `${data.title}.pptx` });
    } catch (e) {
      console.error("PPT Generation Error", e);
      alert("حدث خطأ أثناء إنشاء ملف البوربوينت");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
          <span>📚 مكتبة دروسي</span>
        </h2>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
        >
          عودة
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-4 border-dashed border-gray-200">
          <p className="text-2xl text-gray-400 font-bold">لا توجد دروس محفوظة بعد</p>
          <p className="text-gray-400 mt-2">قم بإنشاء درس جديد وحفظه ليظهر هنا!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:border-kid-blue transition-all group relative"
            >
              <div className={`h-32 ${lesson.imagePreview ? '' : 'bg-kid-blue'} relative overflow-hidden`}>
                {lesson.imagePreview ? (
                  <img src={lesson.imagePreview} alt="cover" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
                      {lesson.data.emoji}
                   </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
              </div>
              
              <div className="p-6">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-4xl -mt-10 mb-2 block bg-white rounded-full p-2 shadow-sm w-16 h-16 flex items-center justify-center relative z-10">
                        {lesson.data.emoji}
                    </span>
                    <div className="flex gap-1 z-20">
                        <button 
                            onClick={(e) => handleDownloadPPT(lesson, e)}
                            className="text-gray-400 hover:text-orange-500 p-2 hover:bg-orange-50 rounded-full transition-colors"
                            title="تحميل بوربوينت"
                            disabled={downloadingId === lesson.id}
                        >
                            {downloadingId === lesson.id ? (
                                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Presentation size={20} />
                            )}
                        </button>
                        <button 
                            onClick={(e) => handleDelete(lesson.id, e)}
                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                            title="حذف"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                 </div>
                 
                 <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{lesson.data.title}</h3>
                 
                 <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(lesson.date).toLocaleDateString('ar-EG')}
                    </span>
                    {lesson.data.className && (
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">
                            {lesson.data.className}
                        </span>
                    )}
                 </div>

                 <button className="w-full py-3 bg-kid-blue/10 text-kid-blue rounded-xl font-bold hover:bg-kid-blue hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Play size={18} />
                    <span>فتح الدرس</span>
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
