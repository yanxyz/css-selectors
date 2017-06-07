#!/usr/bin/env node

// 源文档 https://drafts.csswg.org/selectors/#selector-examples
// 检查本地文档跟源文档的差别
// 1. 运行 fetch.sh
// 2. 运行 此脚本

const fs = require('fs')
const cheerio = require('cheerio')

process.chdir(__dirname)
console.log(diff(getA(), getB()))
console.log()

function getA() {
  const $ = cheerio.load(fs.readFileSync('./overview.html', 'utf8'))
  return $('tr').slice(1)
    .map((i, el) => $(el).children().eq(0).text().trim())
    .get()
}

function getB() {
  const $ = cheerio.load(fs.readFileSync('../docs/index.html', 'utf8'))
  return $('#table tr').slice(1).map((i, el) => {
    const $td = $(el).children().eq(0)
    if ($td.attr('rowspan') > 1) return
    return $td.text().trim()
  }).get()
}

// 找出只包含在 a 或者 b 中的 element
// 假定 a, b 没有重复 element
function diff(a, b) {
  const r = { a: [], b: [] }
  const arr = []
  for (const x of a) {
    const i = b.indexOf(x)
    i === -1 ? r.a.push(x) : arr.push(i)
  }

  const m = b.length, n = arr.length
  if (m > n) {
    for (let i = 0; i < m; i++) {
      if (!arr.includes(i)) r.b.push(b[i])
    }
  }
  return r
}
