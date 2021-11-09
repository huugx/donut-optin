import snoowrap from "snoowrap"
import fs from "fs"
import fetch from "node-fetch"

const credentials = {
  userAgent: 'Read Bot 1.0 by u/EthTraderCommunity',
  clientId: process.env.REDDIT_SCRIPT_CLIENT_ID,
  clientSecret: process.env.REDDIT_SCRIPT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
}

const reddit = new snoowrap(credentials)

main()

async function main(){

  let optIn1 = (await reddit.getSubmission('ll8wwg').expandReplies({limit: Infinity, depth: 1})).comments
  console.log(`optIn1: ${optIn1.length}`)
  let optIn2 = (await reddit.getSubmission('p5ik6b').expandReplies({limit: Infinity, depth: 1})).comments
  console.log(`optIn2: ${optIn2.length}`)
  let optOuts2 = (await reddit.getComment('h9639cx').expandReplies({limit: Infinity, depth: 1})).replies
  console.log(`optOuts2: ${optOuts2.length}`)
  let optIn = optIn1.concat(optIn2)
  let optInUsers = optIn.reduce((p,c)=>{
    let out = optOuts2.find(o=>o.author.name===c.author.name)
    if(!out) {
      p[`${c.author.name}`] = true
    }
    return p
  },{})

  console.log(optInUsers)

  let chainOptin = []
  let account = {}

  const users = await fetch("https://ethtrader.github.io/donut.distribution/users.json").then(res=>res.json())
  users.forEach(c=>{
    const username = c.username.replace(new RegExp('^u/'),"")
    const user = users.find(u=>u.username===username)
    if(user){
      const { address } = user
      if(optInUsers[username]) {
        account[username] = {username, address, chain:'xdai'}
      } else {
        account[username] = {username, address, chain:'ethereum'}
      }
    }

      chainOptin.push(account[username])
  })


  fs.writeFileSync( './optin.json', JSON.stringify(chainOptin))
}
