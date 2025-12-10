package handler

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type LectureHandlers struct{}

func (l *LectureHandlers) Create(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (l *LectureHandlers) CreateMany(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (l *LectureHandlers) GetDates(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (l *LectureHandlers) GetByDates(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (l *LectureHandlers) FindMany(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (l *LectureHandlers) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (l *LectureHandlers) UpdateLinks(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}

func (l *LectureHandlers) Remove(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {}
