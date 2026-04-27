const request = require('supertest');
const app = require('../app');

// 테스트 스위트의 논리적 그룹화
describe('할 일 관리 시스템 API 테스트', () => {

    // 각 테스트 스위트 시작 전에 데이터 초기화
    beforeEach(() => {
        if (global.resetTodos) {
            global.resetTodos();
        }
    });

    // 서버 상태 확인 엔드포인트 검증
    describe('GET /api/health', () => {
        it('should consistently return a 200 HTTP status and healthy payload', async () => {
            const response = await request(app).get('/api/health');

            // Jest 어서션을 통한 응답 객체의 엄격한 검증
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('environment');
        });
    });

    // 할 일 생성 엔드포인트 검증 (정상 및 예외 케이스 모두 포괄)
    describe('POST /api/todos', () => {
        it('should actively create a new todo entity when completely valid data is strictly provided', async () => {
            const payload = { title: 'Test Todo', description: 'Test Description', priority: 'high' };
            const response = await request(app).post('/api/todos').send(payload);

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Todo created successfully');
            expect(response.body.todo.title).toBe(payload.title);
            expect(response.body.todo.description).toBe(payload.description);
            expect(response.body.todo.priority).toBe(payload.priority);
            expect(response.body.todo).toHaveProperty('id');
            expect(response.body.todo).toHaveProperty('completed', false);
            expect(response.body.todo).toHaveProperty('createdAt');
        });

        it('should create todo with default priority when priority is not provided', async () => {
            const payload = { title: 'Default Priority Todo' };
            const response = await request(app).post('/api/todos').send(payload);

            expect(response.statusCode).toBe(201);
            expect(response.body.todo.priority).toBe('medium');
        });

        it('should correctly reject the request with a 400 status when mandatory title is missing', async () => {
            const payload = { description: 'No title provided' };
            const response = await request(app).post('/api/todos').send(payload);

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toBe('Title is required and cannot be empty');
        });

        it('should correctly reject the request with a 400 status when title is empty', async () => {
            const payload = { title: '   ', description: 'Empty title' };
            const response = await request(app).post('/api/todos').send(payload);

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toBe('Title is required and cannot be empty');
        });

        it('should correctly reject the request with a 400 status when invalid priority is provided', async () => {
            const payload = { title: 'Invalid Priority', priority: 'urgent' };
            const response = await request(app).post('/api/todos').send(payload);

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toBe('Priority must be one of: low, medium, high');
        });
    });

    // 모든 할 일 조회 엔드포인트 검증
    describe('GET /api/todos', () => {
        beforeEach(async () => {
            // 테스트용 할 일들 생성
            await request(app).post('/api/todos').send({
                title: 'High Priority Task',
                description: 'Important task',
                priority: 'high'
            });
            await request(app).post('/api/todos').send({
                title: 'Medium Priority Task',
                description: 'Normal task',
                priority: 'medium'
            });
            await request(app).post('/api/todos').send({
                title: 'Low Priority Task',
                description: 'Less important task',
                priority: 'low'
            });
            await request(app).post('/api/todos').send({
                title: 'Completed Task',
                description: 'Already done',
                priority: 'medium'
            });
        });

        it('should retrieve all todos successfully', async () => {
            const response = await request(app).get('/api/todos');

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('todos');
            expect(response.body).toHaveProperty('count');
            expect(response.body).toHaveProperty('filters');
            expect(Array.isArray(response.body.todos)).toBe(true);
            expect(response.body.count).toBeGreaterThanOrEqual(4);
        });

        it('should filter todos by status (pending)', async () => {
            const response = await request(app).get('/api/todos?status=pending');

            expect(response.statusCode).toBe(200);
            expect(response.body.todos.every(todo => !todo.completed)).toBe(true);
        });

        it('should filter todos by status (completed)', async () => {
            // 먼저 하나의 할 일을 완료 상태로 변경
            const todosResponse = await request(app).get('/api/todos');
            const todoId = todosResponse.body.todos[0].id;
            await request(app).put(`/api/todos/${todoId}`).send({ completed: true });

            const response = await request(app).get('/api/todos?status=completed');

            expect(response.statusCode).toBe(200);
            expect(response.body.todos.every(todo => todo.completed)).toBe(true);
        });

        it('should filter todos by priority', async () => {
            const response = await request(app).get('/api/todos?priority=high');

            expect(response.statusCode).toBe(200);
            expect(response.body.todos.every(todo => todo.priority === 'high')).toBe(true);
        });

        it('should sort todos by creation date (newest first)', async () => {
            const response = await request(app).get('/api/todos');

            expect(response.statusCode).toBe(200);
            const todos = response.body.todos;
            for (let i = 0; i < todos.length - 1; i++) {
                expect(new Date(todos[i].createdAt).getTime()).toBeGreaterThanOrEqual(
                    new Date(todos[i + 1].createdAt).getTime()
                );
            }
        });
    });

    // 특정 할 일 조회 엔드포인트 검증
    describe('GET /api/todos/:id', () => {
        it('should retrieve a specific todo by id when the todo exists', async () => {
            // 할 일 생성
            const createResponse = await request(app).post('/api/todos').send({
                title: 'Specific Todo',
                description: 'For specific retrieval test',
                priority: 'low'
            });
            const todoId = createResponse.body.todo.id;

            // 생성된 할 일 조회
            const response = await request(app).get(`/api/todos/${todoId}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.todo.id).toBe(todoId);
            expect(response.body.todo.title).toBe('Specific Todo');
            expect(response.body.todo.description).toBe('For specific retrieval test');
            expect(response.body.todo.priority).toBe('low');
        });

        it('should return 404 when todo does not exist', async () => {
            const response = await request(app).get('/api/todos/99999');

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Not Found');
            expect(response.body.message).toBe('Todo with id 99999 does not exist');
        });
    });

    // 할 일 수정 엔드포인트 검증
    describe('PUT /api/todos/:id', () => {
        it('should update todo information when valid data is provided', async () => {
            // 할 일 생성
            const createResponse = await request(app).post('/api/todos').send({
                title: 'Original Todo',
                description: 'Original description',
                priority: 'medium'
            });
            const todoId = createResponse.body.todo.id;

            // 할 일 정보 수정
            const updatePayload = {
                title: 'Updated Todo',
                description: 'Updated description',
                priority: 'high',
                completed: true
            };
            const response = await request(app).put(`/api/todos/${todoId}`).send(updatePayload);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Todo updated successfully');
            expect(response.body.todo.title).toBe('Updated Todo');
            expect(response.body.todo.description).toBe('Updated description');
            expect(response.body.todo.priority).toBe('high');
            expect(response.body.todo.completed).toBe(true);
            expect(response.body.todo).toHaveProperty('updatedAt');
        });

        it('should partially update todo (only title)', async () => {
            // 할 일 생성
            const createResponse = await request(app).post('/api/todos').send({
                title: 'Partial Update Test',
                description: 'Original description',
                priority: 'low'
            });
            const todoId = createResponse.body.todo.id;

            // 제목만 수정
            const response = await request(app).put(`/api/todos/${todoId}`).send({
                title: 'Partially Updated'
            });

            expect(response.statusCode).toBe(200);
            expect(response.body.todo.title).toBe('Partially Updated');
            expect(response.body.todo.description).toBe('Original description'); // 변경되지 않아야 함
            expect(response.body.todo.priority).toBe('low'); // 변경되지 않아야 함
        });

        it('should return 404 when trying to update a non-existent todo', async () => {
            const response = await request(app).put('/api/todos/99999').send({
                title: 'Non-existent Todo',
                completed: true
            });

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Not Found');
            expect(response.body.message).toBe('Todo with id 99999 does not exist');
        });

        it('should reject invalid priority during update', async () => {
            // 할 일 생성
            const createResponse = await request(app).post('/api/todos').send({
                title: 'Priority Test',
                priority: 'medium'
            });
            const todoId = createResponse.body.todo.id;

            // 잘못된 우선순위로 수정 시도
            const response = await request(app).put(`/api/todos/${todoId}`).send({
                priority: 'invalid'
            });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toBe('Priority must be one of: low, medium, high');
        });
    });

    // 할 일 삭제 엔드포인트 검증
    describe('DELETE /api/todos/:id', () => {
        it('should delete a todo successfully', async () => {
            // 할 일 생성
            const createResponse = await request(app).post('/api/todos').send({
                title: 'Delete Test Todo',
                description: 'To be deleted',
                priority: 'high'
            });
            const todoId = createResponse.body.todo.id;

            // 할 일 삭제
            const response = await request(app).delete(`/api/todos/${todoId}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Todo deleted successfully');
            expect(response.body.todo.title).toBe('Delete Test Todo');

            // 삭제된 할 일 조회 시 404 반환 확인
            const getResponse = await request(app).get(`/api/todos/${todoId}`);
            expect(getResponse.statusCode).toBe(404);
        });

        it('should return 404 when trying to delete a non-existent todo', async () => {
            const response = await request(app).delete('/api/todos/99999');

            expect(response.statusCode).toBe(404);
            expect(response.body.error).toBe('Not Found');
            expect(response.body.message).toBe('Todo with id 99999 does not exist');
        });
    });

    // 통계 엔드포인트 검증
    describe('GET /api/stats', () => {
        beforeEach(async () => {
            // 테스트용 할 일들 생성
            await request(app).post('/api/todos').send({ title: 'Task 1', priority: 'high' });
            await request(app).post('/api/todos').send({ title: 'Task 2', priority: 'medium' });
            await request(app).post('/api/todos').send({ title: 'Task 3', priority: 'low' });
            await request(app).post('/api/todos').send({ title: 'Task 4', priority: 'high' });

            // 하나를 완료 상태로 변경
            const todosResponse = await request(app).get('/api/todos');
            const todoId = todosResponse.body.todos[0].id;
            await request(app).put(`/api/todos/${todoId}`).send({ completed: true });
        });

        it('should return correct statistics', async () => {
            const response = await request(app).get('/api/stats');

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('total');
            expect(response.body.stats).toHaveProperty('completed');
            expect(response.body.stats).toHaveProperty('pending');
            expect(response.body.stats).toHaveProperty('completionRate');
            expect(response.body.stats).toHaveProperty('priorityBreakdown');

            expect(response.body.stats.total).toBeGreaterThanOrEqual(4);
            expect(response.body.stats.completed).toBe(1);
            expect(response.body.stats.pending).toBe(response.body.stats.total - 1);
            expect(response.body.stats.completionRate).toBe(Math.round((1 / response.body.stats.total) * 100));
        });

        it('should return correct priority breakdown', async () => {
            const response = await request(app).get('/api/stats');

            expect(response.statusCode).toBe(200);
            const breakdown = response.body.stats.priorityBreakdown;
            expect(breakdown).toHaveProperty('high');
            expect(breakdown).toHaveProperty('medium');
            expect(breakdown).toHaveProperty('low');
            expect(breakdown.high).toBeGreaterThanOrEqual(2);
            expect(breakdown.medium).toBeGreaterThanOrEqual(1);
            expect(breakdown.low).toBeGreaterThanOrEqual(1);
        });
    });
});