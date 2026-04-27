const express = require('express');
const app = express();

// 새로운 백엔드 기능들 로드
const loadNewBackendFeatures = require('./new-backend-features');

// JSON 페이로드 파싱을 위한 기본 미들웨어 장착
app.use(express.json());

// 정적 파일 서빙을 위한 미들웨어 추가
app.use(express.static('public'));

// 메모리 기반 할 일 데이터 저장소
let todos = [];
let nextTodoId = { value: 1 };

// 새로운 백엔드 기능들 초기화
loadNewBackendFeatures(app, todos, nextTodoId);

// 테스트용 데이터 초기화 함수 (개발/테스트 환경에서만 사용)
if (process.env.NODE_ENV === 'test') {
    global.resetTodos = () => {
        todos = [];
        nextTodoId.value = 1;
    };
}

// 헬스 체크 엔드포인트: 파이프라인 자동화 도구 및 오케스트레이터(로드밸런서)에서
// 컨테이너 애플리케이션이 정상적으로 요청을 수신할 수 있는지 판단하기 위해 사용
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 모든 할 일 조회 엔드포인트
app.get('/api/todos', (req, res) => {
    const { status, priority } = req.query;

    let filteredTodos = todos;

    // 상태 필터링 (all, pending, completed)
    if (status && status !== 'all') {
        filteredTodos = filteredTodos.filter(todo =>
            status === 'completed' ? todo.completed : !todo.completed
        );
    }

    // 우선순위 필터링
    if (priority && priority !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.priority === priority);
    }

    // 생성일 기준 내림차순 정렬
    filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
        message: 'Todos retrieved successfully',
        count: filteredTodos.length,
        todos: filteredTodos,
        filters: { status, priority }
    });
});

// 특정 할 일 조회 엔드포인트
app.get('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Todo with id ${req.params.id} does not exist`
        });
    }

    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Todo with id ${req.params.id} does not exist`
        });
    }

    res.status(200).json({
        message: 'Todo retrieved successfully',
        todo: todo
    });
});

// 할 일 생성 엔드포인트
app.post('/api/todos', (req, res) => {
    const { title, description, priority = 'medium' } = req.body;

    // 입력값 유효성 검사
    if (!title || title.trim().length === 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Title is required and cannot be empty'
        });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Priority must be one of: low, medium, high'
        });
    }

    // 새로운 할 일 객체 생성
    const newTodo = {
        id: nextTodoId.value++,
        title: title.trim(),
        description: description ? description.trim() : '',
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // 메모리 저장소에 할 일 데이터 저장
    todos.push(newTodo);

    // 201 Created 상태 코드를 반환하여 리소스 생성 성공을 클라이언트에 통지
    res.status(201).json({
        message: 'Todo created successfully',
        todo: newTodo
    });
});

// 할 일 수정 엔드포인트
app.put('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Todo with id ${req.params.id} does not exist`
        });
    }

    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Todo with id ${req.params.id} does not exist`
        });
    }

    const { title, description, priority, completed } = req.body;

    // 입력값 유효성 검사
    if (title !== undefined && (title.trim().length === 0)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Title cannot be empty'
        });
    }

    if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Priority must be one of: low, medium, high'
        });
    }

    // 할 일 정보 업데이트
    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description ? description.trim() : '';
    if (priority !== undefined) todo.priority = priority;
    if (completed !== undefined) todo.completed = Boolean(completed);
    todo.updatedAt = new Date().toISOString();

    res.status(200).json({
        message: 'Todo updated successfully',
        todo: todo
    });
});

// 할 일 삭제 엔드포인트
app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Todo with id ${req.params.id} does not exist`
        });
    }

    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Todo with id ${req.params.id} does not exist`
        });
    }

    const deletedTodo = todos.splice(index, 1);

    res.status(200).json({
        message: 'Todo deleted successfully',
        todo: deletedTodo[0]
    });
});

// 통계 정보 조회 엔드포인트
app.get('/api/stats', (req, res) => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityStats = {
        high: todos.filter(t => t.priority === 'high').length,
        medium: todos.filter(t => t.priority === 'medium').length,
        low: todos.filter(t => t.priority === 'low').length
    };

    res.status(200).json({
        message: 'Statistics retrieved successfully',
        stats: {
            total,
            completed,
            pending,
            completionRate,
            priorityBreakdown: priorityStats
        }
    });
});

module.exports = app;