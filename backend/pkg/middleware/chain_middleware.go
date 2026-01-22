package middleware

import "github.com/julienschmidt/httprouter"

type Middleware func(httprouter.Handle) httprouter.Handle

func Chain(h httprouter.Handle, mws ...Middleware) httprouter.Handle {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}
