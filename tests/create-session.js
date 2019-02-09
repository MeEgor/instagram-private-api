const { V1: Client } = require('../dist')
const userName = "egorknv"
const password = "LoGo100501"
const device = new Client.Device(userName)
const storage = new Client.CookieFileStorage(__dirname + '/cookies/' + userName + '.json')
const proxy = "socks5://services_hlmedia_tv:57xp9ivQ@91.218.246.99:54293"

function createSession() {
  Client.Session.create(device, storage, userName, password, proxy)
    .then(session => {
      console.log("SESSION:", session)
    })
    .catch(err => {
      console.log(err.message)
    })
}

function getProfile() {
  Client.Session.create(device, storage, userName, password, proxy)
    .then(session => {
      return  Client.Account.showProfile(session)
    })
    .then(user => {
      console.log("SUCCESS!", user)
    })
    .catch(err => console.log(err.message))
}

function getSelfMediaFeed() {
  Client.Session.create(device, storage, userName, password, proxy)
    .then(session => {
      return session.getAccountId().then(accountId => {
        const feed = new Client.Feed.UserMedia(session, accountId)
        return feed.all()
      })
      .then(medias => {
        console.log("SUCCESS!")
        console.log(medias)
      })
    })
}

function sendComment() {
  const text = "Yo! Foo Bar!"
  const mediaId = "1844223108983287281_5932999115"

  Client.Session.create(device, storage, userName, password, proxy)
    .then(session => {
      return Client.Comment.create(session, mediaId, text)
    })
    .then(comment => {
      console.log("SUCCESS!")
      debugger
    })
    .catch(err => console.log(err.message))
}

function getMediaIngo() {
  const mediaId = "1844223108983287281_5932999115"
  Client.Session.create(device, storage, userName, password)
    .then(session => {
      return Client.Media.getById(session, mediaId)
    })
    .then(media => {
      debugger
    })
    .catch(err => console.log(err.message))
}

getMediaIngo()