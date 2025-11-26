import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, RefreshCw, Trophy, User, Send, Play } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
  onReset: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ questions, onReset }) => {
  const [studentName, setStudentName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      setHasStarted(true);
    }
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  // Student Name Entry Screen
  if (!hasStarted) {
    return (
      <div className="max-w-lg mx-auto p-4 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-kid-purple text-center p-8">
           <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <User className="w-10 h-10 text-kid-purple" />
           </div>
           <h2 className="text-3xl font-black text-gray-800 mb-2">أهلاً بك يا بطل!</h2>
           <p className="text-gray-500 mb-8 text-lg">أدخل اسمك لنبدأ المسابقة</p>
           
           <form onSubmit={handleStart} className="space-y-6">
             <input 
               type="text" 
               value={studentName}
               onChange={(e) => setStudentName(e.target.value)}
               placeholder="اكتب اسمك هنا..."
               className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:border-kid-purple outline-none"
               required
             />
             <button 
               type="submit"
               disabled={!studentName.trim()}
               className="w-full py-4 bg-kid-purple text-white rounded-xl font-bold text-xl hover:bg-purple-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:scale-100"
             >
               <span>بدء الاختبار</span>
               <Play className="w-6 h-6" />
             </button>
           </form>
        </div>
      </div>
    );
  }

  // Result Screen
  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in p-8">
        <div className="bg-white rounded-3xl shadow-xl p-12 border-4 border-kid-yellow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-kid-pink via-kid-purple to-kid-blue"></div>
          
          <div className="mb-6 flex justify-center">
             <Trophy className="w-24 h-24 text-kid-yellow animate-bounce" />
          </div>
          
          <h2 className="text-4xl font-black text-gray-800 mb-4">أحسنت يا {studentName}!</h2>
          <p className="text-2xl text-gray-600 mb-2">
            حصلت على <span className="font-bold text-kid-green text-3xl">{score}</span> من <span className="font-bold text-gray-800 text-3xl">{questions.length}</span>
          </p>
          
          <div className="my-8 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-center gap-3">
             <Send className="w-6 h-6 text-green-600" />
             <p className="text-green-800 font-bold">تم إرسال نتيجتك للمعلم بنجاح!</p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={onReset}
              className="px-8 py-3 bg-kid-blue text-white rounded-xl font-bold text-xl hover:bg-blue-600 hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-6 h-6" />
              <span>درس جديد</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
           <User className="w-5 h-5 text-gray-400" />
           <span className="font-bold text-gray-700">{studentName}</span>
        </div>
        <div className="text-gray-500 font-bold">
           السؤال {currentQuestionIndex + 1} من {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-kid-green transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-100 min-h-[400px] flex flex-col">
        <div className="p-8 bg-blue-50 border-b border-blue-100">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 leading-normal text-center">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center space-y-4">
          {currentQuestion.options.map((option, idx) => {
            let buttonStyle = "border-gray-200 hover:border-kid-blue hover:bg-blue-50";
            let icon = null;

            if (isAnswered) {
              if (idx === currentQuestion.correctAnswerIndex) {
                buttonStyle = "border-kid-green bg-green-50 text-green-700 ring-2 ring-green-200";
                icon = <CheckCircle className="w-6 h-6 text-kid-green" />;
              } else if (idx === selectedOption) {
                buttonStyle = "border-kid-pink bg-pink-50 text-pink-700";
                icon = <XCircle className="w-6 h-6 text-kid-pink" />;
              } else {
                buttonStyle = "border-gray-100 text-gray-400 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={`
                  w-full p-4 rounded-xl border-2 text-lg font-bold text-right transition-all duration-200
                  flex items-center justify-between group
                  ${buttonStyle}
                `}
              >
                <span className="flex-1">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 animate-slide-up">
             <div className="mb-4">
                <p className="text-gray-700 font-medium">
                   <span className="font-bold ml-2">السبب:</span>
                   {currentQuestion.explanation}
                </p>
             </div>
             <button
               onClick={handleNext}
               className="w-full py-3 bg-kid-purple text-white rounded-xl font-bold text-xl hover:bg-purple-700 transition-colors shadow-md"
             >
               {currentQuestionIndex < questions.length - 1 ? "السؤال التالي" : "النتائج"}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};