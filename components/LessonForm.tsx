import React, { useState, useRef } from 'react';
import { Upload, BookOpen, Smile, Zap, Sparkles, User, School } from 'lucide-react';
import { LessonRequest } from '../types';

interface LessonFormProps {
  onSubmit: (data: LessonRequest) => void;
  isLoading: boolean;
}

export const LessonForm: React.FC<LessonFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [ageGroup, setAgeGroup] = useState('6-8');
  const [tone, setTone] = useState('fun');
  const [teacherName, setTeacherName] = useState('');
  const [className, setClassName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    onSubmit({
      topic,
      ageGroup,
      tone,
      image: imagePreview || undefined,
      teacherName,
      className
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-kid-blue">
      <div className="bg-kid-blue p-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8" />
          <span>اصنع درسك الجديد</span>
        </h2>
        <p className="text-blue-100">أدخل تفاصيل الدرس وسيقوم الذكاء الاصطناعي بالباقي!</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Teacher & Class Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-gray-700 font-bold text-lg">اسم المعلم/ة</label>
            <div className="relative">
              <User className="absolute right-3 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="أ. محمد / أ. سارة"
                className="w-full p-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-kid-purple outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-gray-700 font-bold text-lg">الصف الدراسي</label>
            <div className="relative">
              <School className="absolute right-3 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="الأول الابتدائي..."
                className="w-full p-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-kid-purple outline-none"
              />
            </div>
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-lg">عنوان الدرس أو الموضوع</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: المجموعة الشمسية، حياة النحل، الألوان..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-kid-purple focus:ring-4 focus:ring-purple-100 transition-all text-lg outline-none"
            required
          />
        </div>

        {/* Age Group Selection */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-lg">الفئة العمرية</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAgeGroup('6-8')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                ageGroup === '6-8' 
                  ? 'border-kid-green bg-green-50 text-kid-green font-bold shadow-md transform scale-105' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Smile className="w-8 h-8" />
              <span>6 - 8 سنوات</span>
            </button>
            <button
              type="button"
              onClick={() => setAgeGroup('9-11')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                ageGroup === '9-11' 
                  ? 'border-kid-yellow bg-yellow-50 text-yellow-600 font-bold shadow-md transform scale-105' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Zap className="w-8 h-8" />
              <span>9 - 11 سنة</span>
            </button>
          </div>
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-lg">أسلوب الشرح</label>
          <select 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-kid-pink outline-none"
          >
            <option value="fun">مرح ومضحك</option>
            <option value="story">قصصي وحكائي</option>
            <option value="scientific">علمي ومبسط</option>
            <option value="adventure">مغامرة وتشويق</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-lg">صورة توضيحية (اختياري)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-3 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-kid-blue transition-colors min-h-[150px]"
          >
            {imagePreview ? (
              <div className="relative w-full h-48">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  X
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">اضغط لرفع صورة تساعد في الشرح</p>
              </>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-xl shadow-lg transition-all transform duration-200 flex items-center justify-center gap-2 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-kid-pink hover:bg-pink-600 hover:scale-105 hover:shadow-xl active:scale-95 active:shadow-inner'
          }`}
        >
          {isLoading ? (
            'جاري تحضير الدرس...'
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>ابدأ الدرس السحري</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};