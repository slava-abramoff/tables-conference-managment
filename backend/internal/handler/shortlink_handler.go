package handler

import (
	"context"
	"net/http"
	httprespond "table-api/pkg/http"

	"github.com/julienschmidt/httprouter"
)

type ShortLinkService interface {
	GetUrl(ctx context.Context, code string) (*string, error)
	ShortUrl(ctx context.Context, url string) (*string, error)
}

type ShortLinkHandlers struct {
	shortLinkService ShortLinkService
}

func NewShortLinkHandlers(s ShortLinkService) *ShortLinkHandlers {
	return &ShortLinkHandlers{shortLinkService: s}
}

func (s *ShortLinkHandlers) GetUrl(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()

	code := ps.ByName("code")
	url, err := s.shortLinkService.GetUrl(ctx, code)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	http.Redirect(w, r, *url, http.StatusFound)
}
