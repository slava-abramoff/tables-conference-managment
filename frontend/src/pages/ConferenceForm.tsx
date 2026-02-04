import { useState, type FormEvent, type ChangeEvent } from "react";
import SuccessMessage from "../components/SuccessMessage";
import ErrorMessage from "../components/ErrorMessage";
import { createMeet } from "../api/meets/meets";
import type { MeetCreateRequest } from "../types/request/meets";

/**
 * Форматирует дату и время для отправки на сервер: 2026-01-22T13:00:00+03:00
 */
function formatDateTimeForApi(date: string, time: string): string {
  if (!date || !time) return "";
  const dateTime = `${date}T${time}:00`;
  return `${dateTime}+03:00`;
}

export default function ConferenceForm() {
  const [formData, setFormData] = useState({
    title: "",
    fullName: "",
    email: "",
    phone: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    platform: "",
    equipment: "",
    notes: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Валидация телефона - только цифры
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 11) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Ограничение длины для текстовых полей
    const maxLengths: Record<string, number> = {
      title: 70,
      fullName: 50,
      email: 50,
      location: 50,
      equipment: 70,
      notes: 150,
    };

    if (maxLengths[name] && value.length > maxLengths[name]) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== "" &&
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.startDate !== "" &&
      formData.startTime !== "" &&
      formData.endDate !== "" &&
      formData.endTime !== "" &&
      formData.location.trim() !== "" &&
      formData.platform !== "" &&
      formData.equipment.trim() !== ""
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setShowError(false);
    setErrorMessage("");

    try {
      // Формируем данные для отправки на сервер
      // Объединяем дату начала и время начала в одну строку
      const start = formatDateTimeForApi(formData.startDate, formData.startTime);
      // Объединяем дату конца и время конца в одну строку
      const end = formatDateTimeForApi(formData.endDate, formData.endTime);
      
      const meetData: MeetCreateRequest = {
        eventName: formData.title.trim(),
        customerName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        platform: formData.platform,
        devices: formData.equipment.trim(),
        description: formData.notes.trim() || undefined,
        start,
        end,
      };

      await createMeet(meetData);
      
      // Очищаем форму после успешной отправки
      setFormData({
        title: "",
        fullName: "",
        email: "",
        phone: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        platform: "",
        equipment: "",
        notes: "",
      });
      
      setShowSuccess(true);
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже."
      );
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 lg:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Заголовок */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
          <div className="bg-slate-800 px-6 py-4 rounded-t-lg">
            <h1 className="text-2xl font-semibold text-white">
              Заявка на создание конференции
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Заполните все обязательные поля для подачи заявки
            </p>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="space-y-6">
            {/* Название */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={70}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите название конференции"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.title.length}/70 символов
              </p>
            </div>

            {/* ФИО */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                ФИО <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                maxLength={50}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите ФИО"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.fullName.length}/50 символов
              </p>
            </div>

            {/* Почта */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Почта <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={50}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="example@mail.com"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.email.length}/50 символов
              </p>
            </div>

            {/* Телефон */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={11}
                required
                pattern="[0-9]{11}"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="79991234567"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.phone.length}/11 цифр
              </p>
            </div>

            {/* Дата и время */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Дата и время проведения
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Дата начала */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                    Дата начала <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  />
                </div>

                {/* Время начала */}
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">
                    Время начала <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  />
                </div>

                {/* Дата конца */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                    Дата конца <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  />
                </div>

                {/* Время конца */}
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">
                    Время конца <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Место проведения */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                Место проведения <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                maxLength={50}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите место проведения"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.location.length}/50 символов
              </p>
            </div>

            {/* Платформа */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-slate-700 mb-1">
                Платформа <span className="text-red-500">*</span>
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 bg-white"
              >
                <option value="">Выберите платформу</option>
                <option value="VK">VK</option>
                <option value="Другое">Другое</option>
              </select>
            </div>

            {/* Оборудование */}
            <div>
              <label htmlFor="equipment" className="block text-sm font-medium text-slate-700 mb-1">
                Оборудование <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="equipment"
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                maxLength={70}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите необходимое оборудование"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.equipment.length}/70 символов
              </p>
            </div>

            {/* Примечание */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                Примечание
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                maxLength={150}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 resize-none"
                placeholder="Дополнительная информация (необязательно)"
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.notes.length}/150 символов
              </p>
            </div>
          </div>

          {/* Кнопка отправки */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                isFormValid() && !isSubmitting
                  ? "bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>
      </div>

      {/* Модальные окна */}
      {showSuccess && (
        <SuccessMessage
          message="Заявка на создание конференции успешно отправлена!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showError && (
        <ErrorMessage
          message={errorMessage || "Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже."}
          onClose={() => {
            setShowError(false);
            setErrorMessage("");
          }}
        />
      )}
    </div>
  );
}
