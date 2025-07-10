import React, { useState, createContext, useContext } from 'react';
import './index.css';

// Create Context to manage shared state between components
const AppContext = createContext();

// Mock data for exercises (replaces a database)
const initialExercises = [
  // You can add some initial exercises here if you want
  // Example:
  // {
  //   id: 'ex1',
  //   folder: 'Bài 1',
  //   audioContent: 'This is the audio content for exercise 1.',
  //   answerKey: 'This is the answer key for exercise 1.',
  //   audioFileUrl: null, // Replace with a real URL if you have one
  // },
];

// Main application component
const App = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'teacher', 'student'
  // Load exercises from localStorage if available
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('exercises');
    return saved ? JSON.parse(saved) : initialExercises;
  });
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Save exercises to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  // Function to switch between views
  const navigate = (view) => {
    setCurrentView(view);
    setSelectedExercise(null); // Reset selected exercise when switching views
  };

  return (
    <AppContext.Provider value={{ exercises, setExercises, setSelectedExercise }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-inter">
        <header className="bg-white shadow-lg rounded-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4 md:mb-0">
            Listen and write English
            <span className="block text-lg font-semibold text-purple-600">(NabiNguyen)</span>
          </h1>
          <nav className="space-x-2 sm:space-x-4 flex flex-wrap justify-center">
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 text-sm sm:text-base mb-2 sm:mb-0"
            >
              Trang Chủ
            </button>
            <button
              onClick={() => navigate('teacher')}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105 text-sm sm:text-base mb-2 sm:mb-0"
            >
              Giáo Viên
            </button>
            <button
              onClick={() => navigate('student')}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Học Sinh
            </button>
          </nav>
        </header>

        <main className="container mx-auto">
          {currentView === 'home' && <HomeView navigate={navigate} />}
          {currentView === 'teacher' && <TeacherDashboard />}
          {currentView === 'student' && (
            selectedExercise ? (
              <ExercisePlayer exercise={selectedExercise} onBack={() => setSelectedExercise(null)} />
            ) : (
              <StudentDashboard />
            )
          )}
        </main>
      </div>
    </AppContext.Provider>
  );
};

// Home page component
const HomeView = ({ navigate }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Chào mừng bạn!</h2>
      <p className="text-lg text-gray-600 mb-8">
        Chọn vai trò của bạn để bắt đầu.
      </p>
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
        <button
          onClick={() => navigate('teacher')}
          className="px-8 py-4 bg-green-500 text-white text-xl font-semibold rounded-lg shadow-xl hover:bg-green-600 transition duration-300 transform hover:scale-105"
        >
          Tôi là Giáo Viên
        </button>
        <button
          onClick={() => navigate('student')}
          className="px-8 py-4 bg-purple-500 text-white text-xl font-semibold rounded-lg shadow-xl hover:bg-purple-600 transition duration-300 transform hover:scale-105"
        >
          Tôi là Học Sinh
        </button>
      </div>
    </div>
  );
};

// Teacher dashboard component
const TeacherDashboard = () => {
  const { exercises, setExercises } = useContext(AppContext);
  const [audioContent, setAudioContent] = useState('');
  const [answerKey, setAnswerKey] = useState('');
  const [folder, setFolder] = useState('');
  const [audioFile, setAudioFile] = useState(null); // To store the selected audio file
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  // Get unique list of folders
  const folders = [...new Set(exercises.map(ex => ex.folder))];

  // Handle adding new exercise
  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!answerKey || !folder || !audioFile) {
      setMessage('Vui lòng điền đầy đủ các trường: Đáp án, Thư mục và chọn File Ghi Âm.');
      return;
    }
    const newExercise = {
      id: `ex${exercises.length + 1}`,
      folder,
      audioContent: '', // This can be populated if you extract text from audio in a real app
      answerKey,
      audioFileUrl: audioFile ? URL.createObjectURL(audioFile) : null, // Create a URL for local playback
    };
    setExercises([...exercises, newExercise]);
    setAudioContent('');
    setAnswerKey('');
    setFolder('');
    setAudioFile(null);
    setMessage('Bài tập đã được thêm thành công!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle delete exercise confirmation
  const confirmDelete = (exercise) => {
    setExerciseToDelete(exercise);
    setShowDeleteConfirm(true);
  };

  // Handle actual deletion
  const handleDeleteExercise = () => {
    if (exerciseToDelete) {
      const updatedExercises = exercises.filter(ex => ex.id !== exerciseToDelete.id);
      setExercises(updatedExercises);
      setMessage(`Bài tập ID: ${exerciseToDelete.id} đã được xóa thành công.`);
      setShowDeleteConfirm(false);
      setExerciseToDelete(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Bài Giảng (Giáo Viên)</h2>

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <form onSubmit={handleAddExercise} className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Tải Lên Bài Nghe Mới</h3>
        <div className="mb-4">
          <label htmlFor="folder" className="block text-gray-700 text-sm font-bold mb-2">
            Thư mục/Chủ đề:
          </label>
          <input
            type="text"
            id="folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Bài 1, Chủ đề Gia đình..."
          />
        </div>
        <div className="mb-4">
          <label htmlFor="audioFile" className="block text-gray-700 text-sm font-bold mb-2">
            Tải File Ghi Âm (.mp3, .wav, v.v.):
          </label>
          <input
            type="file"
            id="audioFile"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0])}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {audioFile && <p className="mt-2 text-sm text-gray-600">File đã chọn: {audioFile.name}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="answerKey" className="block text-gray-700 text-sm font-bold mb-2">
            Đáp án chính xác:
          </label>
          <textarea
            id="answerKey"
            value={answerKey}
            onChange={(e) => setAnswerKey(e.target.value)}
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus://focus:ring-blue-500 focus:border-transparent h-32"
            placeholder="Nhập đáp án chính xác của bài nghe tại đây..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
        >
          Thêm Bài Tập
        </button>
      </form>

      <h3 className="text-2xl font-semibold text-gray-700 mb-4">Các Bài Tập Đã Tải Lên</h3>
      {folders.length === 0 ? (
        <p className="text-gray-600">Chưa có bài tập nào được tải lên.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folderName) => {
            const exercisesInFolder = exercises.filter(ex => ex.folder === folderName);
            return (
              <div key={folderName} className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h4 className="text-xl font-semibold text-blue-800 mb-4">{folderName}</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {exercisesInFolder.map((ex) => (
                      <li key={ex.id} className="mb-2 flex justify-between items-center">
                        <span>
                          Bài tập ID: {ex.id}
                          {ex.audioFileUrl && (
                            <p className="text-sm text-gray-500 italic">
                              (Đã có file audio)
                            </p>
                          )}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => confirmDelete(ex)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition duration-300 text-sm"
                            title="Xóa bài tập"
                          >
                            Xóa
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa bài tập ID: {exerciseToDelete?.id} không?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteExercise}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Student dashboard component
const StudentDashboard = () => {
  const { exercises, setSelectedExercise } = useContext(AppContext);

  // Get unique list of folders
  const folders = [...new Set(exercises.map(ex => ex.folder))];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Chọn Bài Tập (Học Sinh)</h2>
      {folders.length === 0 ? (
        <p className="text-gray-600">Chưa có bài tập nào. Vui lòng đợi giáo viên tải lên.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folderName) => (
            <div key={folderName} className="bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">{folderName}</h3>
              <ul className="list-disc list-inside text-gray-700">
                {exercises
                  .filter(ex => ex.folder === folderName)
                  .map(ex => (
                    <li key={ex.id} className="mb-2">
                      <button
                        onClick={() => setSelectedExercise(ex)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition duration-200"
                      >
                        Bài tập ID: {ex.id}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Exercise player and grading component
const ExercisePlayer = ({ exercise, onBack }) => {
  const [studentInput, setStudentInput] = useState('');
  const [gradedResult, setGradedResult] = useState(null);
  const [showAudioContent, setShowAudioContent] = useState(false); // To display audio content text

  // Function to grade student's submission
  const gradeSubmission = () => {
    const studentWords = studentInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const answerWords = exercise.answerKey.toLowerCase().split(/\s+/).filter(word => word.length > 0);

    const result = [];
    let studentIndex = 0;
    let answerIndex = 0;
    let correctCount = 0;

    while (answerIndex < answerWords.length) {
      if (studentIndex < studentWords.length && studentWords[studentIndex] === answerWords[answerIndex]) {
        // Correct word
        result.push({ word: answerWords[answerIndex], status: 'correct' });
        correctCount++;
        studentIndex++;
        answerIndex++;
      } else {
        // Incorrect or missing word
        let foundMatch = false;
        // Check if student's word is incorrect (could be the next word in the answer)
        if (studentIndex < studentWords.length) {
          // Try to find the student's input word within the next 3 words of the answer key
          for (let i = 1; i <= 3 && (answerIndex + i) < answerWords.length; i++) {
            if (studentWords[studentIndex] === answerWords[answerIndex + i]) {
              // If found, the words in between are missing
              for (let j = 0; j < i; j++) {
                result.push({ word: answerWords[answerIndex + j], status: 'missing' });
              }
              answerIndex += i;
              foundMatch = true;
              break;
            }
          }
        }

        if (!foundMatch) {
          // If no match found or student entered a wrong word
          if (studentIndex < studentWords.length) {
            result.push({ word: studentWords[studentIndex], status: 'incorrect' });
            studentIndex++;
          } else {
            // Student is missing the last word
            result.push({ word: answerWords[answerIndex], status: 'missing' });
            answerIndex++;
          }
        }
      }
    }

    // Handle extra words from student (if any)
    while (studentIndex < studentWords.length) {
      result.push({ word: studentWords[studentIndex], status: 'incorrect' });
      studentIndex++;
    }

    const score = (correctCount / answerWords.length) * 100;
    setGradedResult({ result, score });
  };

  // Function to show audio content (replaces play audio button)
  const handleShowAudioContent = () => {
    setShowAudioContent(true);
    // In a real application, you would play the audio file here.
    // Example: if (exercise.audioFileUrl) { new Audio(exercise.audioFileUrl).play(); }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition duration-300"
      >
        &larr; Quay lại
      </button>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Bài Tập: {exercise.folder} - ID: {exercise.id}
      </h2>

      <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Nội dung bài nghe:</h3>
        {exercise.audioFileUrl ? (
          <div className="mb-4">
            <audio controls className="w-full rounded-md">
              <source src={exercise.audioFileUrl} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ phần tử audio.
            </audio>
            <p className="mt-2 text-sm text-gray-600">
              Đây là file ghi âm đã được giáo viên tải lên.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 italic mb-4">
            Chưa có file ghi âm được tải lên cho bài tập này.
          </p>
        )}

        {/* The button to view text content is now conditional based on whether audioContent exists */}
        {exercise.audioContent && (
          <button
            onClick={handleShowAudioContent}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 transform hover:scale-105 mb-4"
          >
            Xem Nội dung Bài Nghe (Văn bản)
          </button>
        )}
        
        {showAudioContent && exercise.audioContent && (
          <p className="text-gray-700 italic border-l-4 border-blue-400 pl-4 py-2 bg-blue-100 rounded-md">
            {exercise.audioContent}
          </p>
        )}
        {!exercise.audioContent && (
          <p className="text-gray-600 italic">
            Không có nội dung văn bản cho bài nghe này.
          </p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="studentInput" className="block text-gray-700 text-sm font-bold mb-2">
          Bài làm của bạn:
        </label>
        <textarea
          id="studentInput"
          value={studentInput}
          onChange={(e) => setStudentInput(e.target.value)}
          className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-40"
          placeholder="Gõ bài làm của bạn vào đây..."
        ></textarea>
      </div>

      <button
        onClick={gradeSubmission}
        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
      >
        Chấm Điểm
      </button>

      {gradedResult && (
        <div className="mt-8 p-6 border border-green-200 rounded-lg bg-green-50">
          <h3 className="text-2xl font-semibold text-green-800 mb-4">Kết Quả Chấm Điểm:</h3>
          <p className="text-xl font-bold text-gray-800 mb-4">
            Điểm số: <span className="text-green-600">{gradedResult.score.toFixed(2)}%</span>
          </p>
          <div className="text-lg leading-relaxed">
            {gradedResult.result.map((item, index) => (
              <span
                key={index}
                className={`
                  ${item.status === 'correct' ? 'text-gray-800' : ''}
                  ${item.status === 'incorrect' ? 'text-red-600 font-bold' : ''}
                  ${item.status === 'missing' ? 'text-yellow-600 font-bold underline' : ''}
                  mr-1
                `}
              >
                {item.word}{' '}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            <span className="text-red-600 font-bold">Màu đỏ:</span> Từ sai.
            <span className="text-yellow-600 font-bold ml-4">Màu vàng gạch chân:</span> Từ thiếu (hệ thống bổ sung).
            <span className="text-gray-800 ml-4">Màu đen:</span> Từ đúng.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
// ...existing code...
