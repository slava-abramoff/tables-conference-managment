package handler

import (
	"net/http"
	"table-api/internal/service"
	httprespond "table-api/pkg/http"

	"github.com/julienschmidt/httprouter"
)

type ShortLinkHandlers struct {
	shortLinkService service.ShortLinkService
}

func NewShortLinkHandlers(s service.ShortLinkService) *ShortLinkHandlers {
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
