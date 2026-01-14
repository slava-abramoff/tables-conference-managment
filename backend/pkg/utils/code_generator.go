package utils

import (
	"crypto/rand"
	"math/big"
)

// GenerateCode генерирует n-значный код.
// Параметры:
//   - n: длина генерируемой строки
//
// Возвращает:
//   - string: n-значный код
//   - error: ошибка, если не удалось сгенерировать случайное число
func GenerateCode(n int) (string, error) {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, n)

	for i := range n {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		result[i] = letters[num.Int64()]
	}

	return string(result), nil
}
