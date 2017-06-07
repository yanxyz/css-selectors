#!/usr/bin/env node

// 将 data.yaml 转为 ../docs/index.html

const fs = require('fs')
const yaml = require('js-yaml')
process.chdir(__dirname)

const html = fs.readFileSync('template.html', 'utf8')
  .replace('{tbody}', parse())
fs.writeFileSync('../docs/index.html', html)

function parse() {
  const str = fs.readFileSync('./data.yaml', 'utf8')

  // data.yaml 有多个 document, 对应 selectors 分类，由注释提供分类名字
  const cates = []
  str.replace(/^##(.*)$/mg, function (match, p1) {
    cates.push(p1.trim())
  })

  let i = 0
  let arr = []
  yaml.safeLoadAll(str, doc => {
    arr.push(handleDoc(doc, cates[i]))
    ++i
  })

  return arr.join('\n')
}

function handleDoc(doc, cate) {
  // 分类单元格跨行
  let html = `<tbody class="category">
    <tr>
      <td rowspan="${doc.length + 1}">${cate}</td>
    </tr>`

  doc.forEach(x => {
    let pattern // selector pattern

    // mdn: 'x' 意思是 MDN 没有相应的页面，不提供链接。
    if (x.mdn === 'x') {
      pattern = x.pattern
    } else {
      try {
        pattern = handlePattern(x.pattern, x.mdn)
      } catch (err) {
        console.log('failed to get mdn: ', x.pattern)
        throw err
      }
    }

    html += `
    <tr class="row">
      <td>${pattern}</td>
      <td>${x.description}</td>
      <td class="level">${x.level}</td>
      ${ie(x.ie)}
    </tr>`
  })

  return html + '</tbody>'
}

function ie(ver) {
  if (ver === -1) {
    return '<td class="no">No</td>'
  } else {
    return `<td class="yes">${ver}</td>`
  }
}

function handlePattern(pattern, mdnPage) {
  const mdn = 'https://developer.mozilla.org/en-US/docs/Web/CSS'
  // 一些 pattern 在一个 td 内
  return pattern.split(' <br> ').map(item => {
    let name = mdnPage || item.match(/:[^(]*/)[0]
    name = encodeURIComponent(name)
    return `<a href="${mdn}/${name}">${item}</a>`
  }).join('<br>')
}
