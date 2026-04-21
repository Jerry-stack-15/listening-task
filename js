// English Listening Practice App
class ListeningApp {
    constructor() {
        this.currentTask = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.isTaskCompleted = false;
        this.currentVideo = null;
        this.currentDifficulty = 'elementary'; // Default to elementary level
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.loadUserPreference();
        this.loadTodayTask();
        this.loadUserProgress();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Handle difficulty level selection
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentDifficulty = e.target.value;
                this.saveUserPreference();
                this.loadTodayTask(); // Reload task with new difficulty
            });
        });

        // Handle video player events
        this.setupVideoPlayer();
    }

    loadUserPreference() {
        const saved = localStorage.getItem('userDifficulty');
        if (saved) {
            this.currentDifficulty = saved;
            document.querySelector(`input[name="difficulty"][value="${saved}"]`).checked = true;
        }
        this.updateDurationDisplay();
    }

    saveUserPreference() {
        localStorage.setItem('userDifficulty', this.currentDifficulty);
        this.updateDurationDisplay();
    }

    updateDurationDisplay() {
        const duration = this.getVideoDurationByDifficulty(this.currentDifficulty);
        const durationElement = document.getElementById('current-duration');
        if (durationElement) {
            durationElement.textContent = duration.replace(':00', '');
        }
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('zh-HK', options);
    }

    async loadTodayTask() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const difficulty = this.currentDifficulty;
            
            // Load today's task from database or create new one
            let task = await this.getTaskForDate(today, difficulty);
            
            if (!task) {
                task = await this.createNewTask(today, difficulty);
            }
            
            this.currentTask = task;
            this.renderTask();
            
        } catch (error) {
            console.error('Error loading today task:', error);
            this.showError('無法加載今日任務，請稍後再試。');
        }
    }

    async getTaskForDate(date, difficulty) {
        try {
            const response = await fetch(`tasks?date=${date}&difficulty_level=${difficulty}`);
            if (response.ok) {
                const data = await response.json();
                return data.data.length > 0 ? data.data[0] : null;
            }
            return null;
        } catch (error) {
            console.error('Error fetching task:', error);
            return null;
        }
    }

    async createNewTask(date, difficulty) {
        // Get video duration based on difficulty level
        const videoDuration = this.getVideoDurationByDifficulty(difficulty);
        
        // Get random video from sample data
        const video = this.getRandomVideo(difficulty, videoDuration);
        const questions = this.generateQuestions(video, difficulty);
        
        const task = {
            id: this.generateId(),
            date: date,
            difficulty_level: difficulty,
            video: video,
            questions: questions,
            completed: false,
            score: null,
            created_at: Date.now()
        };

        // Save to database
        try {
            await fetch('tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
        } catch (error) {
            console.error('Error saving task:', error);
        }

        return task;
    }

    getVideoDurationByDifficulty(difficulty) {
        switch (difficulty) {
            case 'elementary':
                return '5:00'; // 小學生5分鐘
            case 'middle_school':
            case 'advanced':
            case 'ielts':
            case 'toefl':
            default:
                return '15:00'; // 其他15分鐘
        }
    }

    getRandomVideo(difficulty, duration) {
        // 根據難度級別提供不同的影片庫
        const videoLibraries = {
            elementary: [
                {
                    id: 'elem_001',
                    title: 'The Magic of Reading',
                    speaker: 'Kid Speaker',
                    duration: '5:00',
                    category: '教育',
                    description: '探索閱讀的魔法，適合小學生的有趣故事',
                    thumbnail: 'https://via.placeholder.com/400x225?text=Kids+Learning',
                    videoUrl: 'https://www.youtube.com/embed/3yqFtUrxuQM',
                    transcript: '這是小學生影片的文字稿...'
                },
                {
                    id: 'elem_002',
                    title: 'Animals Around the World',
                    speaker: 'Young Explorer',
                    duration: '5:30',
                    category: '自然',
                    description: '認識世界各地的動物朋友',
                    thumbnail: 'https://via.placeholder.com/400x225?text=Animals',
                    videoUrl: 'https://www.youtube.com/embed/xfHJOvX1N8A',
                    transcript: '動物世界探索...'
                }
            ],
            middle_school: [
                {
                    id: 'mid_001',
                    title: 'The Science of Friendship',
                    speaker: 'Teen Scientist',
                    duration: '15:00',
                    category: '科學',
                    description: '了解友誼的科學原理，適合中學生的科普內容',
                    thumbnail: 'https://via.placeholder.com/400x225?text=Science+Talk',
                    videoUrl: 'https://www.youtube.com/embed/qp0HIF3SfI4',
                    transcript: '中學生科學演講...'
                }
            ],
            advanced: [
                {
                    id: 'adv_001',
                    title: 'The Future of Artificial Intelligence',
                    speaker: 'Tech Expert',
                    duration: '15:30',
                    category: '科技',
                    description: '人工智能的未來發展趨勢',
                    thumbnail: 'https://via.placeholder.com/400x225?text=AI+Future',
                    videoUrl: 'https://www.youtube.com/embed/iCvmsMzlF7o',
                    transcript: 'AI技術發展...'
                }
            ],
            ielts: [
                {
                    id: 'ielts_001',
                    title: 'IELTS Listening Strategies',
                    speaker: 'IELTS Expert',
                    duration: '15:00',
                    category: '考試準備',
                    description: '雅思考試聽力策略和技巧',
                    thumbnail: 'https://via.placeholder.com/400x225?text=IELTS+Prep',
                    videoUrl: 'https://www.youtube.com/embed/qp0HIF3SfI4',
                    transcript: 'IELTS聽力技巧...'
                }
            ],
            toefl: [
                {
                    id: 'toefl_001',
                    title: 'TOEFL Listening Practice',
                    speaker: 'TOEFL Instructor',
                    duration: '15:00',
                    category: '考試準備',
                    description: '托福考試聽力練習和技巧',
                    thumbnail: 'https://via.placeholder.com/400x225?text=TOEFL+Practice',
                    videoUrl: 'https://www.youtube.com/embed/LTO_dZWKpUQ',
                    transcript: 'TOEFL聽力練習...'
                }
            ]
        };

        const library = videoLibraries[difficulty] || videoLibraries.middle_school;
        return library[Math.floor(Math.random() * library.length)];
    }

    generateQuestions(video, difficulty) {
        const questionTemplates = {
            elementary: [
                {
                    question: `這個影片主要講述什麼？`,
                    options: [
                        '一個故事',
                        '科學知識',
                        '歷史事件',
                        '數學問題'
                    ],
                    correctAnswer: 0
                },
                {
                    question: `影片中的主角是誰？`,
                    options: [
                        '老師',
                        '小朋友',
                        '動物',
                        '以上都有可能'
                    ],
                    correctAnswer: 3
                },
                {
                    question: `這個影片適合哪個年齡層？`,
                    options: [
                        '幼兒園',
                        '小學生',
                        '中學生',
                        '大人'
                    ],
                    correctAnswer: 1
                }
            ],
            middle_school: [
                {
                    question: `這個演講的主要主題是什麼？`,
                    options: [
                        '科技創新與未來',
                        '個人成長與心理學',
                        '商業策略與領導力',
                        '環境保護與可持續發展'
                    ],
                    correctAnswer: 1
                },
                {
                    question: `演講者${video.speaker}的專業背景是什麼？`,
                    options: [
                        '企業家',
                        '研究學者',
                        '作家與演說家',
                        '以上皆是'
                    ],
                    correctAnswer: 3
                }
            ],
            advanced: [
                {
                    question: '這個演講中提到的核心概念是什麼？',
                    options: [
                        '創新思維',
                        '系統思考',
                        '批判思維',
                        '設計思維'
                    ],
                    correctAnswer: 1
                },
                {
                    question: '演講者如何論證他們的觀點？', 
                    options: [
                        '通過個人經驗',
                        '通過科學研究',
                        '通過案例分析',
                        '通過以上所有方法'
                    ],
                    correctAnswer: 3
                }
            ],
            ielts: [
                {
                    question: 'What is the main purpose of this IELTS listening practice?',
                    options: [
                        'To test vocabulary knowledge',
                        'To improve listening comprehension skills',
                        'To practice speaking fluency',
                        'To enhance writing abilities'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'Which listening strategy is mentioned in the video?',
                    options: [
                        'Note-taking',
                        'Skimming',
                        'Scanning',
                        'Predicting'
                    ],
                    correctAnswer: 3
                }
            ],
            toefl: [
                {
                    question: 'What type of academic content is typically found in TOEFL listening sections?',
                    options: [
                        'Casual conversations only',
                        'Lectures and classroom discussions',
                        'Business meetings',
                        'Personal interviews'
                    ],
                    correctAnswer: 1
                },
                {
                    question: 'Which skill is most important for TOEFL listening success?',
                    options: [
                        'Memorizing vocabulary',
                        'Understanding context and main ideas',
                        'Speaking quickly',
                        'Writing notes fast'
                    ],
                    correctAnswer: 1
                }
            ]
        };

        const templates = questionTemplates[difficulty] || questionTemplates.middle_school;
        
        // 根據難度調整題目數量
        let questionCount;
        switch (difficulty) {
            case 'elementary':
                questionCount = 3; // 小學生3題
                break;
            case 'ielts':
            case 'toefl':
                questionCount = 5; // 考試類5題
                break;
            default:
                questionCount = 5; // 其他5題
        }

        const questions = [];
        for (let i = 0; i < questionCount && i < templates.length; i++) {
            questions.push({
                id: this.generateId(),
                ...templates[i],
                explanation: `這是第${i+1}題的詳細解釋。`
            });
        }

        return questions;
    }

    renderTask() {
        if (!this.currentTask) return;

        const video = this.currentTask.video;
        const difficulty = this.currentTask.difficulty_level;
        
        // Update video information
        document.getElementById('video-title').textContent = video.title;
        document.getElementById('video-description').textContent = video.description;
        document.getElementById('video-duration').textContent = video.duration;
        document.getElementById('video-category').textContent = video.category;

        // Show difficulty level
        const difficultyLabels = {
            elementary: '小學生',
            middle_school: '中學生', 
            advanced: '進階',
            ielts: 'IELTS',
            toefl: 'TOEFL'
        };

        // Show video info
        document.getElementById('video-info').classList.remove('d-none');
        
        // Load video player
        this.loadVideoPlayer(video);
        
        // Update task status
        if (this.currentTask.completed) {
            document.getElementById('task-status').textContent = '已完成';
            document.getElementById('task-status').classList.remove('bg-warning');
            document.getElementById('task-status').classList.add('bg-success');
        }
    }

    loadVideoPlayer(video) {
        const playerContainer = document.getElementById('video-player');
        
        // Create embedded YouTube player
        const videoId = this.extractVideoId(video.videoUrl);
        const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
        
        playerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="400" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                id="youtube-player"
            ></iframe>
            <div class="video-controls mt-3">
                <button class="btn btn-outline-primary me-2" onclick="app.toggleTranscript()">
                    <i class="fas fa-closed-captioning me-2"></i>顯示/隱藏字幕
                </button>
                <button class="btn btn-outline-secondary" onclick="app.markVideoWatched()">
                    <i class="fas fa-check me-2"></i>標記為已觀看
                </button>
            </div>
        `;
        
        this.currentVideo = video;
    }

    extractVideoId(url) {
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? match[1] : '';
    }

    markVideoWatched() {
        if (!this.currentTask) return;
        
        this.currentTask.videoWatched = true;
        this.showQuizSection();
        this.showSuccess('影片觀看完成！現在開始測試。');
    }

    showQuizSection() {
        document.getElementById('video-section').classList.add('d-none');
        document.getElementById('quiz-section').classList.remove('d-none');
        this.renderQuestion();
    }

    renderQuestion() {
        if (!this.currentTask || !this.currentTask.questions) return;
        
        const question = this.currentTask.questions[this.currentQuestionIndex];
        const container = document.getElementById('question-container');
        
        container.innerHTML = `
            <div class="question-item">
                <div class="question-text mb-4">
                    <h5>${question.question}</h5>
                </div>
                <ul class="answer-options">
                    ${question.options.map((option, index) => `
                        <li class="answer-option" onclick="app.selectAnswer(${index})">
                            <input type="radio" name="answer" value="${index}" id="option-${index}">
                            <label for="option-${index}" class="mb-0 ms-2">
                                ${option}
                            </label>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        this.updateQuizProgress();
        this.updateNavigationButtons();
    }

    selectAnswer(answerIndex) {
        const options = document.querySelectorAll('.answer-option');
        options.forEach((option, index) => {
            option.classList.remove('selected');
            if (index === answerIndex) {
                option.classList.add('selected');
                option.querySelector('input').checked = true;
            }
        });
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = answerIndex;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentTask.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
        } else {
            this.finishQuiz();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
            // Restore previous answer if exists
            if (this.userAnswers[this.currentQuestionIndex] !== undefined) {
                this.selectAnswer(this.userAnswers[this.currentQuestionIndex]);
            }
        }
    }

    updateQuizProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.currentTask.questions.length) * 100;
        document.getElementById('quiz-progress').style.width = `${progress}%`;
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.currentTask.questions.length;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === this.currentTask.questions.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-flag-checkered me-2"></i>完成測試';
        } else {
            nextBtn.innerHTML = '下一題<i class="fas fa-chevron-right ms-2"></i>';
        }
    }

    finishQuiz() {
        const correctAnswers = this.calculateScore();
        const totalQuestions = this.currentTask.questions.length;
        const accuracy = (correctAnswers / totalQuestions) * 100;
        
        // Update task
        this.currentTask.completed = true;
        this.currentTask.score = correctAnswers;
        this.currentTask.completed_at = Date.now();
        
        // Save to database
        this.saveTaskResult();
        
        // Show results
        this.showResults(correctAnswers, totalQuestions, accuracy);
    }

    calculateScore() {
        let correct = 0;
        this.currentTask.questions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correctAnswer) {
                correct++;
            }
        });
        return correct;
    }

    showResults(correct, total, accuracy) {
        document.getElementById('quiz-section').classList.add('d-none');
        document.getElementById('results-section').classList.remove('d-none');
        
        document.getElementById('score-correct').textContent = correct;
        document.getElementById('score-total').textContent = total;
        
        // Set feedback based on accuracy
        let feedback = '';
        let iconClass = '';
        
        if (accuracy >= 80) {
            feedback = '太棒了！你的理解能力非常優秀！';
            iconClass = 'fas fa-trophy text-warning';
        } else if (accuracy >= 60) {
            feedback = '不錯！繼續努力，你會越來越好！';
            iconClass = 'fas fa-medal text-primary';
        } else if (accuracy >= 40) {
            feedback = '加油！多練習會讓你進步更快！';
            iconClass = 'fas fa-heart text-danger';
        } else {
            feedback = '不要灰心，每個人都是從基礎開始的！';
            iconClass = 'fas fa-star text-info';
        }
        
        // 根據難度級別調整反饋
        const difficulty = this.currentTask.difficulty_level;
        if (difficulty === 'elementary') {
            feedback += ' 小學生能做到這樣已經很棒了！';
        } else if (difficulty === 'ielts' || difficulty === 'toefl') {
            feedback += ' 考試準備就是這樣一步一步來的！';
        }
        
        document.getElementById('feedback-text').textContent = feedback;
        document.querySelector('#results-icon i').className = iconClass;
        
        // Update task status
        document.getElementById('task-status').textContent = '已完成';
        document.getElementById('task-status').classList.remove('bg-warning');
        document.getElementById('task-status').classList.add('bg-success');
        
        // Reload progress
        this.loadUserProgress();
    }

    async saveTaskResult() {
        try {
            await fetch(`tasks/${this.currentTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.currentTask)
            });
        } catch (error) {
            console.error('Error saving task result:', error);
        }
    }

    async loadUserProgress() {
        try {
            const response = await fetch('tasks?completed=true');
            if (response.ok) {
                const data = await response.json();
                const completedTasks = data.data;
                
                this.updateProgressDisplay(completedTasks);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    updateProgressDisplay(completedTasks) {
        const totalDays = completedTasks.length;
        const currentWeekStart = this.getWeekStart(new Date());
        const thisWeekTasks = completedTasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= currentWeekStart;
        });
        
        const weekProgress = (thisWeekTasks.length / 7) * 100;
        
        // 分級統計
        const levelStats = {};
        const levels = ['elementary', 'middle_school', 'advanced', 'ielts', 'toefl'];
        const levelNames = {
            elementary: '小學生',
            middle_school: '中學生',
            advanced: '進階',
            ielts: 'IELTS',
            toefl: 'TOEFL'
        };
        
        levels.forEach(level => {
            levelStats[level] = completedTasks.filter(task => task.difficulty_level === level).length;
        });
        
        // Update UI
        document.getElementById('total-days').textContent = totalDays;
        document.getElementById('completed-tasks').textContent = totalDays;
        document.getElementById('progress-percentage').textContent = Math.round(weekProgress);
        
        // Update progress circle
        const circle = document.getElementById('progress-circle');
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (weekProgress / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        // Calculate average accuracy
        if (completedTasks.length > 0) {
            const totalScore = completedTasks.reduce((sum, task) => sum + (task.score || 0), 0);
            const totalQuestions = completedTasks.reduce((sum, task) => sum + (task.questions ? task.questions.length : 5), 0);
            const avgAccuracy = Math.round((totalScore / totalQuestions) * 100);
            document.getElementById('avg-accuracy').textContent = `${avgAccuracy}%`;
        }
        
        // Calculate streak
        const streak = this.calculateStreak(completedTasks);
        document.getElementById('streak-days').textContent = `${streak}天`;
        
        // Render level statistics (if element exists)
        this.renderLevelStats(levelStats, levelNames);
        
        // Render calendar
        this.renderCalendar(completedTasks);
    }

    renderLevelStats(levelStats, levelNames) {
        // 創建分級統計HTML
        let statsHtml = '<div class="level-stats mt-3"><h6 class="mb-2">各級別完成情況：</h6>';
        
        Object.keys(levelStats).forEach(level => {
            const count = levelStats[level];
            const name = levelNames[level];
            statsHtml += `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-muted">${name}</span>
                    <span class="badge bg-primary">${count}</span>
                </div>
            `;
        });
        
        statsHtml += '</div>';
        
        // 添加到統計卡片
        const statsCard = document.querySelector('.stats-card .card-body');
        if (statsCard) {
            const existingStats = statsCard.querySelector('.level-stats');
            if (existingStats) {
                existingStats.remove();
            }
            statsCard.insertAdjacentHTML('beforeend', statsHtml);
        }
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    calculateStreak(completedTasks) {
        if (completedTasks.length === 0) return 0;
        
        const dates = completedTasks.map(task => new Date(task.date));
        dates.sort((a, b) => b - a);
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < dates.length; i++) {
            const taskDate = new Date(dates[i]);
            taskDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === i) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    renderCalendar(completedTasks) {
        const calendar = document.getElementById('mini-calendar');
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Create calendar header
        let html = '<div class="calendar-header">日</div>';
        html += '<div class="calendar-header">一</div>';
        html += '<div class="calendar-header">二</div>';
        html += '<div class="calendar-header">三</div>';
        html += '<div class="calendar-header">四</div>';
        html += '<div class="calendar-header">五</div>';
        html += '<div class="calendar-header">六</div>';
        
        // Get first day of month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startDay = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startDay; i++) {
            html += '<div class="calendar-day other-month"></div>';
        }
        
        // Get number of days in month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = this.isToday(date);
            const isCompleted = completedTasks.some(task => task.date === dateStr);
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isCompleted) classes += ' completed';
            
            html += `<div class="${classes}">${day}</div>`;
        }
        
        calendar.innerHTML = html;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    // Utility functions
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function startDailyTask() {
    document.getElementById('daily-task').scrollIntoView({ behavior: 'smooth' });
}

function selectAnswer(answerIndex) {
    app.selectAnswer(answerIndex);
}

function nextQuestion() {
    app.nextQuestion();
}

function previousQuestion() {
    app.previousQuestion();
}

function viewProgress() {
    document.getElementById('progress').scrollIntoView({ behavior: 'smooth' });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new ListeningApp();
});
