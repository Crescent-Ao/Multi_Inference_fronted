interface TocItem {
  key: string
  label: string
  level: number
  content: string
  children?: TocItem[]
}

export function generateTocFromMarkdown(markdown: string): TocItem[] {
  // 匹配标题行 (# 标题)
  const headerRegex = /^(#{1,6})\s+(.+)$/gm
  const headers: TocItem[] = []
  let match
  let index = 0

  // 提取所有标题
  while ((match = headerRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const label = match[2].trim()
    const startPos = match.index
    const endPos = findSectionEnd(markdown, startPos)
    
    headers.push({
      key: String(++index),
      label,
      level,
      content: markdown.substring(startPos, endPos)
    })
  }

  // 将扁平结构转换为树形结构
  return buildTocTree(headers)
}

function findSectionEnd(markdown: string, startPos: number): number {
  const nextHeader = markdown.slice(startPos + 1).search(/^#{1,6}\s+/m)
  return nextHeader === -1 ? markdown.length : startPos + nextHeader + 1
}

function buildTocTree(headers: TocItem[]): TocItem[] {
  const result: TocItem[] = []
  const stack: TocItem[] = []

  headers.forEach(header => {
    while (
      stack.length > 0 && 
      stack[stack.length - 1].level >= header.level
    ) {
      stack.pop()
    }

    if (stack.length === 0) {
      result.push(header)
    } else {
      const parent = stack[stack.length - 1]
      parent.children = parent.children || []
      parent.children.push(header)
    }

    stack.push(header)
  })

  return result
} 