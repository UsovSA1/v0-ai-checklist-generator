export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (dateOnly.getTime() === today.getTime()) {
    return `Сегодня, ${formatTime(date)}`
  }
  
  if (dateOnly.getTime() === yesterday.getTime()) {
    return `Вчера, ${formatTime(date)}`
  }
  
  // Format as "5 апр" or similar
  return formatShortDate(date)
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(date: Date): string {
  const day = date.getDate()
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${day} ${months[date.getMonth()]}`
}

export function formatFullDate(date: Date): string {
  const day = date.getDate()
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const year = date.getFullYear()
  const time = formatTime(date)
  
  return `${day} ${months[date.getMonth()]} ${year}, ${time}`
}

export function formatDeadline(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const diffTime = dateOnly.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return `просрочено`
  }
  
  if (diffDays === 0) {
    return `сегодня`
  }
  
  if (diffDays === 1) {
    return `завтра`
  }
  
  return formatShortDate(date)
}
