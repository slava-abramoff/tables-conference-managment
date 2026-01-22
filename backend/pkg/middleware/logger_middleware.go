package middleware

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/julienschmidt/httprouter"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

type CustomLogger interface {
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
}

func LoggingMiddleware(logger CustomLogger) Middleware {
	return func(next httprouter.Handle) httprouter.Handle {
		return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
			requestMessage := fmt.Sprintf("started: %s %s", r.Method, r.URL.Path)

			logger.Info(requestMessage)

			rec := &statusRecorder{ResponseWriter: w, status: 200}

			next(rec, r, ps)

			status := strconv.Itoa(rec.status)

			responseMessage := fmt.Sprintf("finished: %s %s, status code: %s", r.Method, r.URL.Path, status)

			switch {
			case rec.status >= 200 && rec.status < 300:
				logger.Info(responseMessage)
			case rec.status >= 400 && rec.status < 500:
				logger.Warn(responseMessage)
			case rec.status >= 500:
				logger.Error(responseMessage)
			default:
				logger.Info(responseMessage)
			}
		}
	}
}
