const { V1: Client } = require('../dist')
const Promise = require('bluebird')

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
            debugger
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

createSession()

// const mediaId = "1844223108983287281_5932999115"
// const text = "Foo Bar"
// Client.Session.create(device, storage, userName, password, proxy).then(session => {
//   return Client.Comment.create(session, mediaId, text).then(comment => {
//     return Promise.delay(5000).then(_ => {
//       return Client.Comment.delete(session, mediaId, comment.id)
//     })
//   })
// })

// Client.Session.create(device, storage, userName, password, proxy).then(session => {
//   const mediaId = "1844223108983287281_5932999115"

//   return Client.Media.getById(session, mediaId)
//     .then(media => {
//       console.log("SUCCESS! -> media", media.id)
//       debugger
//     })
// })

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


/**
 * Search
 * 
 * Разбивает term на кусочки и ищет пользователя
 */ 
async function searchForUser(session, userName) {
  const terms = userName.split("").reduce((acc, currentValue, index) => {
    if (acc[index] == undefined) acc[index] = ""
    acc.push(acc[index] + currentValue);
    return acc
  }, [])
  .filter(term => term.length > 0)

  for (const term of terms) {
    const result = await Client.search.topSearchFlat(session, term)
    const users = result.list.filter(item => "user" in item).map(item => item.user)
    const user = users.find(u => u.username == userName)

    if (user) { return user }
  }
  
  throw new Error("Can not find user: " + userName)
}

/**
 * возвращает имя модуля в зависимости от типа медиа
 */
function getModuleName(media) {
  if (media.media_type == 1) {
    return "photo_view_profile"
  }
  else if (media.media_type == 2) {
    return "video_view_profile"
  }
  else if (media.media_type == 8) {
    return "media_view_profile"
  }
  else {
    throw new Error("Unknown media type", media.media_type)
  }
}

/**
 * Лайк
 */
async function likeMedia(session, media) {
  const moduleName = getModuleName(media)

  return Client.Like.create(session, media.id, {
      module_name: moduleName,
      username: media.user.username,
      user_id: media.user.id
    }, true)
}

/**
 * Выбрать пост
 */
async function selectMedia(session, medias, mediaId) {
  const media = medias.find(m => m.id == mediaId)
  if (!media) {
    throw new Error("No media found", mediaId)
  }
  const commentInfo = await Client.Media.getMediaCommentInfo(session, media.id)

  return {media, commentInfo}
}

/**
 * Select user flow
 * 
 *  1. friendship status
 *  2. hightlights tray
 *  3. user feed
 *  4. story capabilities
 *  5. user info
 */
function selectUser(session, user) {
  let feed = new Client.Feed.UserMedia(session, user.id)

  return Promise.all([
    Client.Relationship.get(session, user.id),
    Client.Internal.getUserHighlightsTray(session, user.id),
    feed.get(),
    Client.Internal.getStorySupportedCapabilities(session, user.id),
    Client.Account.getById(session, user.id)
  ])
  .spread((relationship, data1, medias, data2, userInfo) => {
    return {
      relationship, medias, userInfo, user
    }
  })
}

/**
 * Load commments
 */
function loadComments(session, media) {
  const feed = new Client.Feed.MediaComments(session, media.id)
  return feed.all({
    limit: 50
  })
}

/**
 * Коммент
 */
function sendComment(session, media, text) {
  var moduleName

  if (media.media_type == 1) {
    moduleName = "comments_v2_photo_view_profile"
  }
  else if (media.media_type == 2) {
    moduleName = "comments_v2_video_view_profile"
  }
  else if (media.media_type == 8) {
    moduleName = "comments_v2_media_view_profile"
  }
  else {
    throw new Error("Unknown media type", media.media_type)
  }

  return Client.Comment.create(session, media.id, text, moduleName)
}


function sendCommentAndLike(userNameToComment, mediaIdToComment, text) {
  return Client.Session.create(device, storage, userName, password, proxy).then(session => {
    return searchForUser(session, userNameToComment).then(user => {
      return selectUser(session, user).then(data => {
        var { relationship, medias, userInfo, user } = data
  
        return selectMedia(session, medias, mediaIdToComment).then(data => {
          var { media, commentInfo } = data
          return likeMedia(session, media).then(like => {
            return loadComments(session, media).then(comments => {
              return sendComment(session, media, text).then(comment => ({
                like, 
                comment, 
                media, 
                user
              }))
            })
          })
        })
      })
    })
  })
}

// sendCommentAndLike("zordon.100", "1844216699029557807_5932999115", "Very beautifull, love it!").then(data => {
//   debugger
// })
// .catch(err => {
//   debugger
// })
  


// Client.Session.create(device, storage, userName, password, proxy).then(session => {
//   // 1) найти пользователя userName
//   return Client.Account.searchForUser(session, userNameToComment).then(user => {
//   // 2) загрузить его feed
//     return Promise.delay(1000).then(_ => {
//       const feed = new Client.Feed.UserMedia(session, user.pk)
//       return [feed.get(), user]
//     })
//   // 3) сделать лайк из profile
//     .spread((medias, user) => {
//       let likePromise = null
//       const media = medias.find(m => m.id == mediaId)
      
//       if (withLike && media && !media.has_liked) {
//         let likeDelay = (Math.random() * 5 + 5) * 1000 // 5 - 10 seconds
//         likePromise = Promise.method(async () => Client.Like.create(session, mediaId, {
//           module_name: "profile",
//           username: user.username,
//           user_id: user.id
//         }, true))
//         .delay(likeDelay)
//         .catch(e => {
//           console.log("WARNING! Can not like it:", e)
//           return null
//         })
//       }
      
//       return likePromise
//     })
//   // 4) оставить коммент
//     .then(like => {
//       let commentPromise = Client.Comment.create(session, mediaId, text)
//       return [commentPromise, like]
//     })
//     .spread((comment, like) => {
//       console.log("SUCCESS!", {
//         ok: true,
//         error: null,
//         data: {
//           comment: comment,
//           withLike: withLike,
//           wasLiked: !!like,
//         }
//       })
//     })
//   })
// })
// .catch(err => {
//   console.log("EROOR!", {
//     ok: false,
//     error: err,
//     data: null
//   })
// })

