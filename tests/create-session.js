const { V1: Client } = require('../dist')

const userName = "egorknv"
const password = "LoGo100501"
const device = new Client.Device(userName)
const storage = new Client.CookieFileStorage(__dirname + '/cookies/' + userName + '.json')
const proxy = "socks5://services_hlmedia_tv:57xp9ivQ@91.218.246.99:54293"

function createSession() {
  Client.Session.create(device, storage, userName, password, proxy)
    .then(session => {
      console.log("SUCCESS! -> session created!")
      return Client.Account.showProfile(session)
        .then(user => {
          console.log("SUCCESS! -> profile", user)
          return session.getAccountId()
        })
        .then(accountId => {
          const feed = new Client.Feed.UserMedia(session, accountId)
          return feed.get().then(medias => {
            console.log("SUCCESS! -> medias", medias.length)
          })
        })
        .then(_ => {
          const mediaId = "1844223108983287281_5932999115"
          return Client.Media.getById(session, mediaId)
            .then(media => {
              console.log("SUCCESS! -> media", media.id)
            })
            .then(_ => {
              const text = "Nice!"
              return Client.Comment.create(session, mediaId, text)
            })
            .then(comment => {
              console.log("SUCCESS! -> commrnt created", comment.params)
              return Client.Comment.delete(session, mediaId, comment.id)
            })
            .then(data => {
              console.log("SUCCESS! -> comment deleted", data)
            })
        })
    })
    .catch(err => console.log("ERROR:", err.message))
}

Client.Session.create(device, storage, userName, password, proxy).then(session => {
  const mediaId = "1844223108983287281_5932999115"

  return Client.Media.getById(session, mediaId)
    .then(media => {
      console.log("SUCCESS! -> media", media.id)
      debugger
    })
})

// Client.Session.create(device, storage, userName, password, proxy).then(session => {
//   const mediaId = "1844223108983287281_5932999115"
//   return Client.Like.create(session, mediaId, {
//     module_name: "profile",
//     username: "zordon.100",
//     user_id: "5932999115"
//   }, true)
// })
// .then(like => {
//   debugger
// })
// .catch(err => {
//   console.log("Error!")
//   debugger
// })

// createSession()