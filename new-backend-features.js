// 새로운 백엔드 기능들을 app에 추가하는 함수
module.exports = function (app, todos, nextTodoId) {
    // 할 일 검색 엔드포인트 (새로운 기능)
    app.get('/api/todos/search', (req, res) => {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Search query is required'
            });
        }

        const searchResults = todos.filter(todo =>
            todo.title.toLowerCase().includes(q.toLowerCase()) ||
            (todo.description && todo.description.toLowerCase().includes(q.toLowerCase()))
        );

        res.status(200).json({
            message: 'Search completed successfully',
            query: q,
            count: searchResults.length,
            todos: searchResults
        });
    });

    // 할 일 태그 관리 엔드포인트 (새로운 기능)
    app.post('/api/todos/:id/tags', (req, res) => {
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

        const { tag } = req.body;

        if (!tag || tag.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Tag is required'
            });
        }

        if (!todo.tags) todo.tags = [];
        if (!todo.tags.includes(tag.trim())) {
            todo.tags.push(tag.trim());
            todo.updatedAt = new Date().toISOString();
        }

        res.status(200).json({
            message: 'Tag added successfully',
            todo: todo
        });
    });

    // 할 일 태그 삭제 엔드포인트 (새로운 기능)
    app.delete('/api/todos/:id/tags/:tag', (req, res) => {
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

        const tagToRemove = decodeURIComponent(req.params.tag);

        if (!todo.tags || !todo.tags.includes(tagToRemove)) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Tag '${tagToRemove}' not found on this todo`
            });
        }

        todo.tags = todo.tags.filter(tag => tag !== tagToRemove);
        todo.updatedAt = new Date().toISOString();

        res.status(200).json({
            message: 'Tag removed successfully',
            todo: todo
        });
    });

    // 할 일 내보내기 엔드포인트 (새로운 기능)
    app.get('/api/todos/export', (req, res) => {
        const { format = 'json' } = req.query;

        if (format === 'csv') {
            const csvHeader = 'ID,Title,Description,Priority,Completed,CreatedAt,UpdatedAt,Tags\n';
            const csvData = todos.map(todo =>
                `${todo.id},"${todo.title}","${todo.description || ''}",${todo.priority},${todo.completed},"${todo.createdAt}","${todo.updatedAt}","${todo.tags ? todo.tags.join(';') : ''}"`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="todos.csv"');
            res.send(csvHeader + csvData);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="todos.json"');
            res.json({
                exportDate: new Date().toISOString(),
                totalTodos: todos.length,
                todos: todos
            });
        }
    });

    // 할 일 가져오기 엔드포인트 (새로운 기능)
    app.post('/api/todos/import', (req, res) => {
        const { todos: importedTodos } = req.body;

        if (!Array.isArray(importedTodos)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Imported data must be an array of todos'
            });
        }

        let importedCount = 0;
        const errors = [];

        importedTodos.forEach(importedTodo => {
            try {
                if (!importedTodo.title || importedTodo.title.trim().length === 0) {
                    errors.push(`Todo missing title: ${JSON.stringify(importedTodo)}`);
                    return;
                }

                const newTodo = {
                    id: nextTodoId.value++,
                    title: importedTodo.title.trim(),
                    description: importedTodo.description ? importedTodo.description.trim() : '',
                    priority: importedTodo.priority || 'medium',
                    completed: Boolean(importedTodo.completed),
                    tags: Array.isArray(importedTodo.tags) ? importedTodo.tags : [],
                    createdAt: importedTodo.createdAt || new Date().toISOString(),
                    updatedAt: importedTodo.updatedAt || new Date().toISOString()
                };

                todos.push(newTodo);
                importedCount++;
            } catch (error) {
                errors.push(`Error importing todo: ${error.message}`);
            }
        });

        res.status(200).json({
            message: 'Import completed',
            importedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    });

    // 사용자별 할 일 분류 엔드포인트 (새로운 기능)
    app.get('/api/todos/categories', (req, res) => {
        const categories = {
            work: todos.filter(t => t.tags && t.tags.includes('work')),
            personal: todos.filter(t => t.tags && t.tags.includes('personal')),
            urgent: todos.filter(t => t.priority === 'high' && !t.completed),
            completed: todos.filter(t => t.completed),
            pending: todos.filter(t => !t.completed)
        };

        res.status(200).json({
            message: 'Categories retrieved successfully',
            categories: categories,
            summary: {
                work: categories.work.length,
                personal: categories.personal.length,
                urgent: categories.urgent.length,
                completed: categories.completed.length,
                pending: categories.pending.length
            }
        });
    });
};