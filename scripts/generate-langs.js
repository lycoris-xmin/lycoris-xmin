import fetch from 'node-fetch'
import fs from 'fs'

const token = process.env.MY_PAT
const username = process.env.GITHUB_USER

async function getRepos() {
  let repos = []
  let page = 1
  while (true) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, {
      headers: { Authorization: `token ${token}` }
    })
    const data = await res.json()
    if (!data.length) break
    repos.push(...data)
    page++
  }
  return repos
}

async function main() {
  const repos = await getRepos()

  const langMap = {}
  for (const repo of repos) {
    const res = await fetch(repo.languages_url, {
      headers: { Authorization: `token ${token}` }
    })
    const langs = await res.json()
    for (const [lang, bytes] of Object.entries(langs)) {
      langMap[lang] = (langMap[lang] || 0) + bytes
    }
  }

  // 排序
  const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1])

  // 生成 Markdown 表格
  const md = ['| Language | Bytes |', '| --- | --- |']
  sorted.forEach(([lang, bytes]) => {
    md.push(`| ${lang} | ${bytes} |`)
  })

  fs.writeFileSync('LANGS.md', md.join('\n'))
  console.log('LANGS.md generated!')
}

main()
