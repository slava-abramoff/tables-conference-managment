package taskschedule

import (
	"context"
	"sync"
	"time"
)

// TODO: реализовать через обращение к бд

type Task struct {
	Exec     func(ctx context.Context)
	ExecTime time.Time
	Ctx      context.Context
	Cancel   context.CancelFunc
}

type TaskManager interface {
	AddTask(id string, exec func(ctx context.Context), execTime time.Time)
	GetTask(id string) Task
}

type taskManager struct {
	storage map[string]Task
	mu      sync.Mutex
}

func NewTaskManager(s map[string]Task) TaskManager {
	return &taskManager{storage: s}
}

func (t *taskManager) AddTask(id string, exec func(ctx context.Context), execTime time.Time) {
	ctx, cancel := context.WithCancel(context.Background())

	task := Task{
		Exec:     exec,
		ExecTime: execTime,
		Ctx:      ctx,
		Cancel:   cancel,
	}

	t.mu.Lock()
	t.storage[id] = task
	t.mu.Unlock()

	go func(task Task) {
		defer delete(t.storage, id)

		wait := time.Until(task.ExecTime)
		if wait > 0 {
			select {
			case <-time.After(wait):
				task.Exec(task.Ctx)
			case <-task.Ctx.Done():
				return
			}
		} else {
			task.Exec(task.Ctx)
		}
	}(task)
}

func (t *taskManager) GetTask(id string) Task {
	return t.storage[id]
}
