package handler

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type MeetHandlers struct{}

func (m *MeetHandlers) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {}

func (m *MeetHandlers) FindMany(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (m *MeetHandlers) Search(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (m *MeetHandlers) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}
