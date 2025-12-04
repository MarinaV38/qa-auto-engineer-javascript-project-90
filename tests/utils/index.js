export const uniq = (info, label = 'unique') =>
  `${label}_${Date.now()}_${info.workerIndex}`

export const uniqEmail = (info, label = 'user') =>
  `${uniq(info, label)}@example.com`
