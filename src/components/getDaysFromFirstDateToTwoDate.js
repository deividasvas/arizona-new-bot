// Функция возвращает количество дней которое прошло с одной даты

const getDaysFromFirstDateToTwoDate = (firstDate, twoDate) => {
	return Number(((twoDate - firstDate) / 86400000).toFixed(1));
}

module.exports = getDaysFromFirstDateToTwoDate;