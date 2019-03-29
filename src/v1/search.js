import { plainToClass } from 'class-transformer';
import { User } from '../models/user';
import { Request } from '../core/request';
import { Helpers } from '../helpers';

const Hashtag = require('./hashtag');
const Location = require('./location');

const topSearch = (session, query) =>
  session
    .getAccountId()
    .then(id =>
      new Request(session)
        .setMethod('GET')
        .setResource('topSearch', {
          rankToken: Helpers.buildRankToken(id).toUpperCase(),
          query,
        })
        .send(),
    )
    .then(json => {
      const users = json.users.map(user => ({
        user: plainToClass(User, user.user),
        position: user.position,
      }));
      const places = json.places.map(place => ({
        place: new Location(session, place.place),
        position: place.position,
      }));
      const hashtags = json.hashtags.map(hashtag => ({
        hashtag: new Hashtag(session, hashtag.hashtag),
        position: hashtag.position,
      }));

      return {
        users,
        places,
        hashtags,
      };
    });

  const topSearchFlat = (session, query) => {
    return new Request(session)
      .setMethod('GET')
      .setResource('topSearchFlat', {
        query
      })
      .send()
      .then(result => {
        return {
          clearClientCache: result.clear_client_cache,
          hasMore: result.has_more,
          rankToken: result.rank_token,
          list: result.list.map(item => {
            let data = {
              position: item.position
            }
            if ("user" in item) data.user = plainToClass(User, item.user)
            if ("place" in item) data.place = new Location(session, item.place)
            if ("hashtag" in item) data.hashtag = new Hashtag(session, item.hashtag)

            return data
          })
        }
      })
  }



    module.exports = {
      topSearch,
      topSearchFlat
    }