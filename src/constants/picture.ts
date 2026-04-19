/**
 * 图片审核状态
 */
export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
}

/**
 * 图片审核状态枚举
 */
export const PIC_REVIEW_STATUS_MAP = {
  0: '待审核',
  1: '通过',
  2: '拒绝',
} as const

/**
 * 图片审核下拉表单选项
 */
export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  const numKey = Number(key) as keyof typeof PIC_REVIEW_STATUS_MAP
  return {
    label: PIC_REVIEW_STATUS_MAP[numKey],
    value: numKey,
  }
})
