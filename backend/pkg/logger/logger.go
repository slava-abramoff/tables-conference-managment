package logger

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"gopkg.in/natefinch/lumberjack.v2"
)

type rotatingHandler struct {
	info    *lumberjack.Logger
	warn    *lumberjack.Logger
	error   *lumberjack.Logger
	console bool
}

func (h *rotatingHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return true
}

func (h *rotatingHandler) Handle(ctx context.Context, r slog.Record) error {
	msg := r.Time.Format("2006-01-02 15:04:05") + " [" + r.Level.String() + "] " + r.Message

	switch r.Level {
	case slog.LevelInfo:
		_, _ = fmt.Fprintln(h.info, msg)
	case slog.LevelWarn:
		_, _ = fmt.Fprintln(h.warn, msg)
	case slog.LevelError:
		_, _ = fmt.Fprintln(h.error, msg)
	default:
		_, _ = fmt.Fprintln(os.Stdout, msg)
	}

	if h.console {
		fmt.Println(msg)
	}

	return nil
}

func (h *rotatingHandler) WithAttrs(attrs []slog.Attr) slog.Handler { return h }
func (h *rotatingHandler) WithGroup(name string) slog.Handler       { return h }

func NewLogger(console bool) *slog.Logger {
	infoLogger := &lumberjack.Logger{
		Filename:   "logs/info.log",
		MaxSize:    5,
		MaxBackups: 3,
		MaxAge:     30,
		Compress:   true,
	}
	warnLogger := &lumberjack.Logger{
		Filename:   "logs/warn.log",
		MaxSize:    5,
		MaxBackups: 3,
		MaxAge:     30,
		Compress:   true,
	}
	errorLogger := &lumberjack.Logger{
		Filename:   "logs/error.log",
		MaxSize:    5,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   true,
	}

	handler := &rotatingHandler{
		info:    infoLogger,
		warn:    warnLogger,
		error:   errorLogger,
		console: console,
	}

	return slog.New(handler)
}
